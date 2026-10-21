@echo off
title Stationery Backend Server
echo Starting Stationery Backend Server...
if "%JAVA_HOME%"=="" (
    if exist "C:\Program Files\Java\jdk-21\bin\java.exe" (
        set "JAVA_HOME=C:\Program Files\Java\jdk-21"
    ) else (
        for /d %%i in ("C:\Program Files\Java\jdk*") do (
            if exist "%%i\bin\java.exe" set "JAVA_HOME=%%i"
        )
    )
)
echo JAVA_HOME: %JAVA_HOME%
call "%~dp0mvnw.cmd" spring-boot:run
pause
