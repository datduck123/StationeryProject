package fpt.edu.vn.stationery.controller;

import fpt.edu.vn.stationery.dto.response.NotificationResponseDTO;
import fpt.edu.vn.stationery.dto.response.PageDTO;
import fpt.edu.vn.stationery.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Tag(name = "Customer - Notifications")
@SecurityRequirement(name = "bearerAuth")
public class NotificationController {
    private final NotificationService notificationService;

    @Operation(summary = "List notifications for the signed-in customer")
    @GetMapping
    public ResponseEntity<PageDTO<NotificationResponseDTO>> getMyNotifications(
            Principal principal,
            @RequestParam(name = "is_read", required = false) Boolean isRead,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(notificationService.getMyNotifications(principal.getName(), isRead, page, size));
    }

    @Operation(summary = "Mark one of my notifications as read")
    @PutMapping("/{id}/read")
    public ResponseEntity<NotificationResponseDTO> markAsRead(@PathVariable Long id, Principal principal) {
        return ResponseEntity.ok(notificationService.markAsRead(id, principal.getName()));
    }
}
