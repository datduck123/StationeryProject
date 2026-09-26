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
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Tag(name = "Customer - Orders", description = "Customer order history and details")
@SecurityRequirement(name = "bearerAuth")
public class OrderController {

    private final OrderService orderService;

    @Operation(summary = "Get the authenticated customer's order history")
    @GetMapping
    public ResponseEntity<PageDTO<OrderResponseDTO>> getMyOrders(
            Principal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(orderService.getCustomerOrders(principal.getName(), page, size));
    }

    @Operation(summary = "Get an order belonging to the authenticated customer")
    @GetMapping("/{orderId}")
    public ResponseEntity<OrderDetailResponseDTO> getMyOrder(
            @PathVariable Long orderId,
            Principal principal) {
        return ResponseEntity.ok(orderService.getCustomerOrder(orderId, principal.getName()));
    }

    @Operation(summary = "Cancel your order while its status is PENDING")
    @PutMapping("/{orderId}/cancel")
    public ResponseEntity<OrderDetailResponseDTO> cancelMyOrder(
            @PathVariable Long orderId,
            Principal principal) {
        return ResponseEntity.ok(orderService.cancelCustomerOrder(orderId, principal.getName()));
    }
}
