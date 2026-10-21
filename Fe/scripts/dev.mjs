import { spawn } from 'node:child_process';
import { connect } from 'node:net';
import { randomBytes } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const feDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repoDir = path.resolve(feDir, '..');
const beDir = path.join(repoDir, 'Be');
const isWindows = process.platform === 'win32';
const runtimeEnv = { ...process.env };

function readPort(name, defaultPort) {
  const value = runtimeEnv[name]?.trim() || String(defaultPort);
  if (!/^\d+$/.test(value) || Number(value) < 1 || Number(value) > 65535) {
    console.error(`[dev] ${name} must be an integer from 1 to 65535.`);
    process.exit(1);
  }
  return Number(value);
}

const fePort = readPort('FE_PORT', 3000);
const bePort = readPort('BE_PORT', 8080);
if (fePort === bePort) {
  console.error('[dev] FE_PORT and BE_PORT must use different ports.');
  process.exit(1);
}
runtimeEnv.FE_PORT = String(fePort);
runtimeEnv.BE_PORT = String(bePort);
runtimeEnv.VITE_API_BASE_URL = runtimeEnv.VITE_API_BASE_URL?.trim() || `http://localhost:${bePort}/api`;

// A clone can run locally without sharing a signing key in source control.
// An explicitly configured JWT_SECRET always takes precedence.
if (!runtimeEnv.JWT_SECRET?.trim()) {
  const secretPath = path.join(beDir, '.dev-jwt-secret');
  let localSecret = existsSync(secretPath) ? readFileSync(secretPath, 'utf8').trim() : '';
  if (Buffer.byteLength(localSecret, 'utf8') < 32) {
    localSecret = randomBytes(48).toString('base64url');
    writeFileSync(secretPath, localSecret, { mode: 0o600 });
  }
  runtimeEnv.JWT_SECRET = localSecret;
}

function canConnect(port, host) {
  return new Promise((resolve) => {
    const socket = connect({ port, host });
    socket.setTimeout(500);
    socket.once('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.once('error', () => resolve(false));
    socket.once('timeout', () => {
      socket.destroy();
      resolve(false);
    });
  });
}

for (const port of [fePort, bePort]) {
  const listening = await Promise.all([
    canConnect(port, '127.0.0.1'),
    canConnect(port, '::1'),
  ]);
  if (listening.some(Boolean)) {
    console.error(`[dev] Port ${port} is already in use. Set FE_PORT/BE_PORT to unused ports or stop the project's existing process before running npm run dev again.`);
    process.exit(1);
  }
}

const processes = [
  {
    name: 'BE',
    command: isWindows ? (process.env.ComSpec || 'cmd.exe') : './mvnw',
    // Use a separate Maven output directory so another Java process cannot
    // lock the .class files needed by this development run.
    args: isWindows
      ? ['/d', '/s', '/c', `mvnw.cmd -Pdev-isolated "-Dspring-boot.run.arguments=--server.port=${bePort}" spring-boot:run`]
      : ['-Pdev-isolated', `-Dspring-boot.run.arguments=--server.port=${bePort}`, 'spring-boot:run'],
    cwd: beDir,
  },
  {
    name: 'FE',
    command: process.execPath,
    args: [path.join(feDir, 'node_modules', 'vite', 'bin', 'vite.js'), '--port', String(fePort), '--strictPort'],
    cwd: feDir,
  },
];

const children = processes.map(({ name, command, args, cwd }) => {
  const child = spawn(command, args, {
    cwd,
    stdio: 'inherit',
    env: runtimeEnv,
    windowsHide: true,
  });

  child.on('error', (error) => {
    console.error(`[${name}] Could not start: ${error.message}`);
    stopAll(1);
  });

  child.on('exit', (code) => {
    if (!shuttingDown) {
      console.log(`[${name}] stopped${code === null ? '' : ` (exit ${code})`}`);
      stopAll(code ?? 1);
    }
  });

  return child;
});

let shuttingDown = false;

function stopAll(exitCode = 0) {
  if (shuttingDown) return;
  shuttingDown = true;

  for (const child of children) {
    if (child.exitCode === null && !child.killed) {
      if (isWindows && child.pid) {
        spawn('taskkill', ['/pid', String(child.pid), '/t', '/f'], {
          stdio: 'ignore',
          windowsHide: true,
        });
      } else {
        child.kill('SIGTERM');
      }
    }
  }

  process.exitCode = exitCode;
}

process.on('SIGINT', () => stopAll(0));
process.on('SIGTERM', () => stopAll(0));
