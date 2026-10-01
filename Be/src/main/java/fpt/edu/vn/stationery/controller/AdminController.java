package fpt.edu.vn.stationery.controller;

import fpt.edu.vn.stationery.dto.request.AdminUpdateUserRequestDTO;
import fpt.edu.vn.stationery.dto.request.CreateUserByAdminRequestDTO;
import fpt.edu.vn.stationery.dto.response.PageDTO;
import fpt.edu.vn.stationery.dto.response.UserResponseDTO;
import fpt.edu.vn.stationery.dto.response.UserStatsResponseDTO;
import fpt.edu.vn.stationery.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin - User Management", description = "Admin Management APIs")
@SecurityRequirement(name = "bearerAuth")
public class AdminController {

    private final UserService userService;

    @GetMapping("/dashboard")
    public ResponseEntity<String> dashboard() {
        return ResponseEntity.ok("Admin Dashboard");
    }

    @Operation(summary = "Get users with pagination, sorting, and filtering")
    @GetMapping("/users")
    public ResponseEntity<PageDTO<UserResponseDTO>> getUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "userId") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false, defaultValue = "ALL") String status,
            @RequestParam(required = false, defaultValue = "ALL") String role) {
        return ResponseEntity.ok(userService.getUsersWithPagination(
                page, size, sortBy, sortDir, keyword, status, role
        ));
    }

    @Operation(summary = "Get user statistics (total, active, inactive, blocked)")
    @GetMapping("/users/stats")
    public ResponseEntity<UserStatsResponseDTO> getUserStats() {
        return ResponseEntity.ok(userService.getUserStats());
    }

    @Operation(summary = "Get user details by ID")
    @GetMapping("/users/{userId}")
    public ResponseEntity<UserResponseDTO> getUserById(@PathVariable Long userId) {
        return ResponseEntity.ok(userService.getUserById(userId));
    }

    @Operation(summary = "Toggle user status (ACTIVE <-> BLOCKED)")
    @PatchMapping("/users/{userId}/toggle-status")
    public ResponseEntity<UserResponseDTO> toggleUserStatus(
            @PathVariable Long userId,
            Principal principal) {
        return ResponseEntity.ok(userService.toggleUserStatus(userId, principal.getName()));
    }

    @Operation(summary = "Create user by Admin with auto-generated secure password")
    @PostMapping("/users")
    public ResponseEntity<UserResponseDTO> createUser(
            @Valid @RequestBody CreateUserByAdminRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(userService.createUserByAdmin(request));
    }

    @Operation(summary = "Update user information by Admin")
    @PutMapping("/users/{userId}")
    public ResponseEntity<UserResponseDTO> updateUser(
            @PathVariable Long userId,
            @Valid @RequestBody AdminUpdateUserRequestDTO request) {
        return ResponseEntity.ok(userService.updateUserByAdmin(userId, request));
    }
}
