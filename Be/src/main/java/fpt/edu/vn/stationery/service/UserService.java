package fpt.edu.vn.stationery.service;

import fpt.edu.vn.stationery.dto.request.AdminUpdateUserRequestDTO;
import fpt.edu.vn.stationery.dto.request.ChangePasswordRequestDTO;
import fpt.edu.vn.stationery.dto.request.CreateUserByAdminRequestDTO;
import fpt.edu.vn.stationery.dto.request.UpdateProfileRequestDTO;
import fpt.edu.vn.stationery.dto.response.PageDTO;
import fpt.edu.vn.stationery.dto.response.UserProfileResponseDTO;
import fpt.edu.vn.stationery.dto.response.UserResponse;
import fpt.edu.vn.stationery.dto.response.UserResponseDTO;
import fpt.edu.vn.stationery.dto.response.UserStatsResponseDTO;

import java.util.List;

public interface UserService {

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

    UserStatsResponseDTO getUserStats();

    // Compatibility
    List<UserResponse> getAllUsers();
}
