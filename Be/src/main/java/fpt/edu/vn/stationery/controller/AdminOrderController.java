package fpt.edu.vn.stationery.controller;

import fpt.edu.vn.stationery.dto.response.OrderDetailResponseDTO;
import fpt.edu.vn.stationery.dto.response.OrderResponseDTO;
import fpt.edu.vn.stationery.dto.response.PageDTO;
import fpt.edu.vn.stationery.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/orders")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin - Orders", description = "Admin order lookup and management")
@SecurityRequirement(name = "bearerAuth")
public class AdminOrderController {

    private final OrderService orderService;

    @Operation(summary = "List orders with search, status filter, sorting and pagination")
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

    @Operation(summary = "Get order details for admin")
    @GetMapping("/{orderId}")
    public ResponseEntity<OrderDetailResponseDTO> getOrder(@PathVariable Long orderId) {
        return ResponseEntity.ok(orderService.getOrderForAdmin(orderId));
    }
}
