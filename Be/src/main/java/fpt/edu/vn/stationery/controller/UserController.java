package fpt.edu.vn.stationery.controller;

import fpt.edu.vn.stationery.dto.request.ChangePasswordRequestDTO;
import fpt.edu.vn.stationery.dto.request.UpdateProfileRequestDTO;
import fpt.edu.vn.stationery.dto.response.UserProfileResponseDTO;
import fpt.edu.vn.stationery.dto.response.UserResponseDTO;
import fpt.edu.vn.stationery.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "User Profile", description = "Current authenticated user profile APIs")
@SecurityRequirement(name = "bearerAuth")
public class UserController {

    private final UserService userService;

    @Operation(summary = "Get current authenticated user profile")
    @GetMapping("/me")
    public ResponseEntity<UserProfileResponseDTO> getCurrentUserProfile(Principal principal) {
        return ResponseEntity.ok(userService.getProfile(principal.getName()));
    }

    @Operation(summary = "Update current authenticated user profile")
    @PutMapping("/me")
    public ResponseEntity<UserProfileResponseDTO> updateCurrentUserProfile(
            Principal principal,
            @Valid @RequestBody UpdateProfileRequestDTO request) {
        return ResponseEntity.ok(userService.updateProfile(principal.getName(), request));
    }

    @Operation(summary = "Change current authenticated user password")
    @PatchMapping("/me/change-password")
    public ResponseEntity<Map<String, String>> changeCurrentUserPassword(
            Principal principal,
            @Valid @RequestBody ChangePasswordRequestDTO request) {
        userService.changePassword(principal.getName(), request);
        return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
    }

    @Operation(summary = "Get user details by ID")
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/{id}")
    public ResponseEntity<UserResponseDTO> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }
}

