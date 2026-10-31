package fpt.edu.vn.stationery.controller;

import fpt.edu.vn.stationery.dto.request.CreateOrderRequestDTO;
import fpt.edu.vn.stationery.dto.response.OrderDetailResponseDTO;
import fpt.edu.vn.stationery.dto.response.OrderResponseDTO;
import fpt.edu.vn.stationery.dto.response.PageDTO;
import fpt.edu.vn.stationery.service.CustomerOrderQueryService;
import fpt.edu.vn.stationery.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Tag(name = "Customer - Orders", description = "Customer order creation, history and details")
@SecurityRequirement(name = "bearerAuth")
public class OrderController {

    private final OrderService orderService;
    private final CustomerOrderQueryService customerOrderQueryService;

    @Operation(summary = "Create an order from the authenticated customer's cart",
            description = "Atomically locks stock and voucher, creates order and pending payment, then clears the server cart. Prices and quantities come from the server cart.")
    @ApiResponse(responseCode = "201", description = "Order created successfully")
    @ApiResponse(responseCode = "400", description = "Invalid request or insufficient stock")
    @ApiResponse(responseCode = "401", description = "Unauthorized")
    @PostMapping
    public ResponseEntity<OrderDetailResponseDTO> createOrder(
            Principal principal,
            @Valid @RequestBody CreateOrderRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(orderService.createOrder(principal.getName(), request));
    }

    @Operation(summary = "Get the authenticated customer's order history")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved order history")
    @ApiResponse(responseCode = "401", description = "Unauthorized")
    @GetMapping
    public ResponseEntity<PageDTO<OrderResponseDTO>> getMyOrders(
            Principal principal,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        return ResponseEntity.ok(customerOrderQueryService.getOrders(
                principal.getName(), status, page, size, sortBy, sortDir));
    }

    @Operation(summary = "Get an order belonging to the authenticated customer")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved order details")
    @ApiResponse(responseCode = "404", description = "Order not found or not owned by customer")
    @GetMapping("/{orderId}")
    public ResponseEntity<OrderDetailResponseDTO> getMyOrder(
            @PathVariable Long orderId,
            Principal principal) {
        return ResponseEntity.ok(orderService.getCustomerOrder(orderId, principal.getName()));
    }

    @Operation(summary = "Cancel your order while its status is PENDING")
    @ApiResponse(responseCode = "200", description = "Order cancelled successfully and stock restored")
    @ApiResponse(responseCode = "400", description = "Order cannot be cancelled (not PENDING)")
    @ApiResponse(responseCode = "404", description = "Order not found")
    @RequestMapping(value = "/{orderId}/cancel", method = {RequestMethod.PUT, RequestMethod.POST})
    public ResponseEntity<OrderDetailResponseDTO> cancelMyOrder(
            @PathVariable Long orderId,
            Principal principal) {
        return ResponseEntity.ok(orderService.cancelCustomerOrder(orderId, principal.getName()));
    }
}
