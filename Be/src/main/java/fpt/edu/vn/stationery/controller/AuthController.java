package fpt.edu.vn.stationery.controller;

import fpt.edu.vn.stationery.dto.request.LoginRequest;
import fpt.edu.vn.stationery.dto.request.RegisterWithOtpDTO;
import fpt.edu.vn.stationery.dto.request.ResetPasswordRequestDTO;
import fpt.edu.vn.stationery.dto.request.SendOtpRequestDTO;
import fpt.edu.vn.stationery.dto.response.AuthResponse;
import fpt.edu.vn.stationery.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Customer and Admin Authentication APIs")
public class AuthController {

    private final UserService userService;

    @Operation(summary = "Send OTP for customer registration")
    @PostMapping("/register/send-otp")
    public ResponseEntity<Map<String, String>> sendRegisterOtp(@Valid @RequestBody SendOtpRequestDTO request) {
        userService.sendRegisterOtp(request);
        return ResponseEntity.ok(Map.of("message", "Registration OTP sent successfully to " + request.getEmail()));
    }

    @Operation(summary = "Verify OTP and complete customer registration")
    @PostMapping("/register/verify-and-register")
    public ResponseEntity<Map<String, String>> verifyAndRegister(@Valid @RequestBody RegisterWithOtpDTO request) {
        userService.verifyAndRegister(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("message", "Account registered successfully"));
    }

    @Operation(summary = "Login with email and password")
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(userService.login(request));
    }

    @Operation(summary = "Logout current user session")
    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout() {
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }

    @Operation(summary = "Send OTP for forgot password")
    @PostMapping("/forgot-password/send-otp")
    public ResponseEntity<Map<String, String>> sendForgotPasswordOtp(@Valid @RequestBody SendOtpRequestDTO request) {
        userService.sendForgotPasswordOtp(request);
        return ResponseEntity.ok(Map.of("message", "Password reset OTP sent successfully to " + request.getEmail()));
    }

    @Operation(summary = "Reset password using OTP")
    @PostMapping("/forgot-password/reset")
    public ResponseEntity<Map<String, String>> resetPassword(@Valid @RequestBody ResetPasswordRequestDTO request) {
        userService.resetPassword(request);
        return ResponseEntity.ok(Map.of("message", "Password reset successfully. You can now login with your new password."));
    }
}

