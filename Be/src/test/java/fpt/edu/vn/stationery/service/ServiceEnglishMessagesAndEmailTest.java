package fpt.edu.vn.stationery.service;

import fpt.edu.vn.stationery.constant.UserStatus;
import fpt.edu.vn.stationery.dto.request.ChangePasswordRequestDTO;
import fpt.edu.vn.stationery.dto.request.SendOtpRequestDTO;
import fpt.edu.vn.stationery.entity.User;
import fpt.edu.vn.stationery.exception.AccountLockedException;
import fpt.edu.vn.stationery.exception.BadRequestException;
import fpt.edu.vn.stationery.exception.DuplicateResourceException;
import fpt.edu.vn.stationery.exception.ResourceNotFoundException;
import fpt.edu.vn.stationery.exception.TooManyRequestsException;
import fpt.edu.vn.stationery.mapper.UserMapper;
import fpt.edu.vn.stationery.repository.UserRepository;
import fpt.edu.vn.stationery.security.JwtTokenProvider;
import fpt.edu.vn.stationery.service.impl.EmailServiceImpl;
import fpt.edu.vn.stationery.service.impl.OtpServiceImpl;
import fpt.edu.vn.stationery.service.impl.UserServiceImpl;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ServiceEnglishMessagesAndEmailTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private OtpService otpService;

    @Mock
    private EmailService emailService;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private UserMapper userMapper;

    @InjectMocks
    private UserServiceImpl userService;

    @Test
    @DisplayName("EmailServiceImpl should generate beautiful HTML with inline CSS styling for OTP email")
    void testBuildOtpEmailHtml() {
        EmailServiceImpl service = new EmailServiceImpl();
        String html = service.buildOtpEmailHtml("849201", "Account Registration");

        assertNotNull(html);
        assertTrue(html.contains("<!DOCTYPE html>"));
        assertTrue(html.contains("849201"));
        assertTrue(html.contains("Account Registration"));
        assertTrue(html.contains("linear-gradient"));
        assertTrue(html.contains("border: 2px dashed #6366f1"));
        assertTrue(html.contains("font-family"));
        assertTrue(html.contains("5 minutes"));
        assertTrue(html.contains("STATIONERY STORE"));
    }

    @Test
    @DisplayName("EmailServiceImpl should generate beautiful HTML with inline CSS styling for credentials email")
    void testBuildAccountCredentialsEmailHtml() {
        EmailServiceImpl service = new EmailServiceImpl();
        String html = service.buildAccountCredentialsEmailHtml("customer@example.com", "Nguyen Van A", "TempPass@123");

        assertNotNull(html);
        assertTrue(html.contains("<!DOCTYPE html>"));
        assertTrue(html.contains("Nguyen Van A"));
        assertTrue(html.contains("customer@example.com"));
        assertTrue(html.contains("TempPass@123"));
        assertTrue(html.contains("background: linear-gradient"));
        assertTrue(html.contains("Sign In to Your Account"));
        assertTrue(html.contains("STATIONERY STORE"));
    }

    @Test
    @DisplayName("OtpServiceImpl should throw English exceptions on invalid or expired OTP")
    void testOtpServiceExceptionsInEnglish() {
        OtpServiceImpl service = new OtpServiceImpl();

        // 1. Verify missing / non-existent OTP
        BadRequestException ex1 = assertThrows(BadRequestException.class, () ->
                service.verifyOtp("test@example.com", "REGISTER", "123456")
        );
        assertEquals("OTP code has expired. Please request a new code.", ex1.getMessage());

        // 2. Generate OTP and test wrong code
        service.generateAndSaveOtp("test@example.com", "REGISTER");
        BadRequestException ex2 = assertThrows(BadRequestException.class, () ->
                service.verifyOtp("test@example.com", "REGISTER", "000000")
        );
        assertEquals("Invalid OTP code.", ex2.getMessage());

        // 3. Test rate limiting
        TooManyRequestsException ex3 = assertThrows(TooManyRequestsException.class, () ->
                service.generateAndSaveOtp("test@example.com", "REGISTER")
        );
        assertTrue(ex3.getMessage().startsWith("Please wait ") && ex3.getMessage().contains(" seconds before requesting a new OTP code."));
    }

    @Test
    @DisplayName("UserServiceImpl should throw English exceptions on duplicate email, locked account, and password mismatch")
    void testUserServiceExceptionsInEnglish() {
        // 1. Duplicate email test
        when(userRepository.existsByEmail("used@example.com")).thenReturn(true);
        SendOtpRequestDTO req = new SendOtpRequestDTO();
        req.setEmail("used@example.com");

        DuplicateResourceException dupEx = assertThrows(DuplicateResourceException.class, () ->
                userService.sendRegisterOtp(req)
        );
        assertEquals("Email is already in use.", dupEx.getMessage());

        // 2. Email not found in system
        when(userRepository.findByEmail("notfound@example.com")).thenReturn(Optional.empty());
        SendOtpRequestDTO forgotReq = new SendOtpRequestDTO();
        forgotReq.setEmail("notfound@example.com");

        ResourceNotFoundException notFoundEx = assertThrows(ResourceNotFoundException.class, () ->
                userService.sendForgotPasswordOtp(forgotReq)
        );
        assertEquals("Email does not exist in the system.", notFoundEx.getMessage());

        // 3. Account locked test
        User lockedUser = User.builder()
                .userId(1L)
                .email("locked@example.com")
                .status(UserStatus.BLOCKED)
                .build();
        when(userRepository.findByEmail("locked@example.com")).thenReturn(Optional.of(lockedUser));
        SendOtpRequestDTO lockedReq = new SendOtpRequestDTO();
        lockedReq.setEmail("locked@example.com");

        AccountLockedException lockedEx = assertThrows(AccountLockedException.class, () ->
                userService.sendForgotPasswordOtp(lockedReq)
        );
        assertEquals("Your account has been locked. Please contact support for assistance.", lockedEx.getMessage());

        // 4. Incorrect current password test
        User activeUser = User.builder()
                .userId(2L)
                .email("active@example.com")
                .passwordHash("hashedOld")
                .status(UserStatus.ACTIVE)
                .build();
        when(userRepository.findByEmail("active@example.com")).thenReturn(Optional.of(activeUser));
        when(passwordEncoder.matches("wrongPass", "hashedOld")).thenReturn(false);

        ChangePasswordRequestDTO changePassReq = new ChangePasswordRequestDTO();
        changePassReq.setCurrentPassword("wrongPass");
        changePassReq.setNewPassword("newSecret123");

        BadRequestException badPassEx = assertThrows(BadRequestException.class, () ->
                userService.changePassword("active@example.com", changePassReq)
        );
        assertEquals("Current password is incorrect.", badPassEx.getMessage());

        // 5. New password same as old password
        when(passwordEncoder.matches("currentPass", "hashedOld")).thenReturn(true);
        when(passwordEncoder.matches("sameNewPass", "hashedOld")).thenReturn(true);

        changePassReq.setCurrentPassword("currentPass");
        changePassReq.setNewPassword("sameNewPass");

        BadRequestException samePassEx = assertThrows(BadRequestException.class, () ->
                userService.changePassword("active@example.com", changePassReq)
        );
        assertEquals("New password cannot be the same as the current password.", samePassEx.getMessage());

        // 6. Cannot lock own account
        when(userRepository.findById(99L)).thenReturn(Optional.of(User.builder().userId(99L).status(UserStatus.ACTIVE).build()));
        when(userRepository.findByEmail("admin@example.com")).thenReturn(Optional.of(User.builder().userId(99L).build()));

        BadRequestException selfLockEx = assertThrows(BadRequestException.class, () ->
                userService.toggleUserStatus(99L, "admin@example.com")
        );
        assertEquals("You cannot lock your own account.", selfLockEx.getMessage());
    }
}
