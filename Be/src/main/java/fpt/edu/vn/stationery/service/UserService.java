package fpt.edu.vn.stationery.service;

import fpt.edu.vn.stationery.dto.request.*;
import fpt.edu.vn.stationery.dto.response.*;
import java.util.List;

public interface UserService {
    // Customer / Auth flows
    void sendRegisterOtp(SendOtpRequestDTO request);
    void verifyAndRegister(RegisterWithOtpDTO request);
    AuthResponse login(LoginRequest request);
    void sendForgotPasswordOtp(SendOtpRequestDTO request);
    void resetPassword(ResetPasswordRequestDTO request);

    // Profile flows
    UserProfileResponseDTO getProfile(String email);
    UserProfileResponseDTO updateProfile(String email, UpdateProfileRequestDTO request);
    void changePassword(String email, ChangePasswordRequestDTO request);

    // Admin user management flows
    PageDTO<UserResponseDTO> getUsersWithPagination(
            int page, int size, String sortBy, String sortDir,
            String keyword, String status, String role
    );
    UserResponseDTO getUserById(Long userId);
    UserResponseDTO toggleUserStatus(Long userId, String currentAdminEmail);
    UserResponseDTO createUserByAdmin(CreateUserByAdminRequestDTO request);
    UserResponseDTO updateUserByAdmin(Long userId, AdminUpdateUserRequestDTO request);

    // Compatibility
    List<UserResponse> getAllUsers();
}
