package fpt.edu.vn.stationery.controller;

import fpt.edu.vn.stationery.dto.response.OrderDetailResponseDTO;
import fpt.edu.vn.stationery.dto.response.OrderResponseDTO;
import fpt.edu.vn.stationery.dto.response.OrderStatsResponseDTO;
import fpt.edu.vn.stationery.dto.response.PageDTO;
import fpt.edu.vn.stationery.dto.request.AdminOrderStatusRequestDTO;
import fpt.edu.vn.stationery.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin/orders")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin - Orders", description = "Admin order lookup and management")
@SecurityRequirement(name = "bearerAuth")
public class AdminOrderController {

    private final OrderService orderService;

    @Operation(summary = "List orders with search, status filter, sorting and pagination")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved orders")
    @ApiResponse(responseCode = "403", description = "Forbidden: Admin role required")
    @GetMapping
    public ResponseEntity<PageDTO<OrderResponseDTO>> getOrders(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        return ResponseEntity.ok(orderService.getAllOrders(status, keyword, page, size, sortBy, sortDir));
    }

    @Operation(summary = "Get global order statistics")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved order statistics")
    @ApiResponse(responseCode = "403", description = "Forbidden: Admin role required")
    @GetMapping("/stats")
    public ResponseEntity<OrderStatsResponseDTO> getOrderStats() {
        return ResponseEntity.ok(orderService.getOrderStats());
    }

    @Operation(summary = "Get order details for admin")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved order details")
    @ApiResponse(responseCode = "404", description = "Order not found")
    @GetMapping("/{orderId}")
    public ResponseEntity<OrderDetailResponseDTO> getOrder(@PathVariable Long orderId) {
        return ResponseEntity.ok(orderService.getOrderForAdmin(orderId));
    }

    @Operation(summary = "Confirm, advance or cancel an order")
    @ApiResponse(responseCode = "200", description = "Order status updated successfully")
    @ApiResponse(responseCode = "400", description = "Invalid status transition")
    @ApiResponse(responseCode = "404", description = "Order not found")
    @PutMapping("/{orderId}")
    public ResponseEntity<OrderDetailResponseDTO> updateStatus(
            @PathVariable Long orderId, @Valid @RequestBody AdminOrderStatusRequestDTO request) {
        return ResponseEntity.ok(orderService.updateAdminOrderStatus(orderId, request.status()));
    }
}
