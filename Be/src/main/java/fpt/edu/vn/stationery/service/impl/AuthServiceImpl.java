package fpt.edu.vn.stationery.service.impl;

import fpt.edu.vn.stationery.constant.AppConstants;
import fpt.edu.vn.stationery.constant.UserStatus;
import fpt.edu.vn.stationery.dto.request.LoginRequestDTO;
import fpt.edu.vn.stationery.dto.request.RegisterWithOtpDTO;
import fpt.edu.vn.stationery.dto.request.ResetPasswordRequestDTO;
import fpt.edu.vn.stationery.dto.request.SendOtpRequestDTO;
import fpt.edu.vn.stationery.dto.response.LoginResponseDTO;
import fpt.edu.vn.stationery.entity.User;
import fpt.edu.vn.stationery.exception.AccountLockedException;
import fpt.edu.vn.stationery.exception.DuplicateResourceException;
import fpt.edu.vn.stationery.exception.ResourceNotFoundException;
import fpt.edu.vn.stationery.repository.UserRepository;
import fpt.edu.vn.stationery.security.JwtTokenProvider;
import fpt.edu.vn.stationery.service.AuthService;
import fpt.edu.vn.stationery.service.EmailService;
import fpt.edu.vn.stationery.service.OtpService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final OtpService otpService;
    private final EmailService emailService;
    private final JwtTokenProvider jwtTokenProvider;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional(readOnly = true)
    public void sendRegisterOtp(SendOtpRequestDTO request) {
        String email = normalizeEmail(request.getEmail());
        if (userRepository.existsByEmail(email)) {
            throw new DuplicateResourceException("Email is already in use.");
        }

        String otpCode = otpService.generateAndSaveOtp(email, AppConstants.TYPE_REGISTER);
        emailService.sendOtpEmail(email, otpCode, "Account Registration");
        log.info(">>> Registration OTP sent to: {}", email);
    }

    @Override
    @Transactional
    public void verifyAndRegister(RegisterWithOtpDTO request) {
        String email = normalizeEmail(request.getEmail());
        if (userRepository.existsByEmail(email)) {
            throw new DuplicateResourceException("Email is already in use.");
        }

        otpService.verifyOtp(email, AppConstants.TYPE_REGISTER, request.getOtpCode());

        User user = User.builder()
                .fullName(request.getFullName().trim())
                .email(email)
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone() != null ? request.getPhone().trim() : null)
                .address(request.getAddress() != null ? request.getAddress().trim() : null)
                .isAdmin(0)
                .status(UserStatus.ACTIVE)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        userRepository.save(user);
        otpService.deleteOtp(email, AppConstants.TYPE_REGISTER);
        log.info(">>> New user registered successfully: {}", email);
    }

    @Override
    @Transactional(readOnly = true)
    public LoginResponseDTO login(LoginRequestDTO request) {
        String email = normalizeEmail(request.getEmail());

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password."));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid email or password.");
        }

        if (user.getStatus() == UserStatus.BANNED || user.getStatus() == UserStatus.BLOCKED) {
            throw new IllegalStateException("Your account has been suspended.");
        }

        if (user.getStatus() == UserStatus.INACTIVE) {
            throw new IllegalStateException("Your account is not verified. Please check your email for OTP.");
        }

        String roleName = user.getRoleName();
        String token = jwtTokenProvider.generateToken(user.getEmail(), user.getId(), roleName);

        log.info("User logged in: {}", user.getEmail());

        return LoginResponseDTO.builder()
                .userId(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(roleName)
                .token(token)
                .accessToken(token)
                .tokenType("Bearer")
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public void sendForgotPasswordOtp(SendOtpRequestDTO request) {
        String email = normalizeEmail(request.getEmail());
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Email does not exist in the system."));

        checkAccountNotBlocked(user);

        String otpCode = otpService.generateAndSaveOtp(email, AppConstants.TYPE_FORGOT_PASSWORD);
        emailService.sendOtpEmail(email, otpCode, "Password Reset");
        log.info(">>> Password reset OTP sent to: {}", email);
    }

    @Override
    @Transactional(readOnly = true)
    public void verifyForgotPasswordOtp(String email, String otpCode) {
        String cleanEmail = normalizeEmail(email);
        User user = userRepository.findByEmail(cleanEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Email does not exist in the system."));

        checkAccountNotBlocked(user);

        otpService.verifyOtp(cleanEmail, AppConstants.TYPE_FORGOT_PASSWORD, otpCode);
        log.info(">>> Forgot password OTP verified for: {}", cleanEmail);
    }

    @Override
    @Transactional(readOnly = true)
    public void resetPassword(ResetPasswordRequestDTO request) {
        String email = normalizeEmail(request.getEmail());
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Email does not exist in the system."));

        checkAccountNotBlocked(user);

        otpService.verifyOtp(email, AppConstants.TYPE_FORGOT_PASSWORD, request.getOtpCode());

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);

        otpService.deleteOtp(email, AppConstants.TYPE_FORGOT_PASSWORD);
        log.info(">>> Password reset successfully for: {}", email);
    }

    private String normalizeEmail(String email) {
        return email != null ? email.trim().toLowerCase() : "";
    }

    private void checkAccountNotBlocked(User user) {
        if (user.getStatus() == UserStatus.BLOCKED) {
            throw new AccountLockedException("Your account has been locked. Please contact support for assistance.");
        }
    }
}
