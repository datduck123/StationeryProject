package fpt.edu.vn.stationery.controller;

import fpt.edu.vn.stationery.dto.request.CartItemInputDTO;
import fpt.edu.vn.stationery.dto.request.UpdateCartItemRequestDTO;
import fpt.edu.vn.stationery.dto.response.CartResponseDTO;
import fpt.edu.vn.stationery.service.CartService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
@Tag(name = "Customer - Cart", description = "Authenticated customer's persistent cart")
@SecurityRequirement(name = "bearerAuth")
public class CartController {
    private final CartService cartService;

    @Operation(summary = "Get the current customer's cart")
    @GetMapping
    public ResponseEntity<CartResponseDTO> getCart(
            Principal principal,
            @RequestParam(defaultValue = "STANDARD") String shippingMethod,
            @RequestParam(required = false) String voucherCode) {
        return ResponseEntity.ok(cartService.getCart(principal.getName(), shippingMethod, voucherCode));
    }

    @Operation(summary = "Add a product to the current customer's cart")
    @PostMapping({"/items", ""})
    public ResponseEntity<CartResponseDTO> addItem(
            Principal principal, @Valid @RequestBody CartItemInputDTO request) {
        return ResponseEntity.ok(cartService.addItem(principal.getName(), request));
    }

    @Operation(summary = "Set the quantity of one cart item")
    @PutMapping({"/items/{cartItemId}", "/{cartItemId}"})
    public ResponseEntity<CartResponseDTO> updateItem(
            Principal principal,
            @PathVariable Long cartItemId,
            @Valid @RequestBody UpdateCartItemRequestDTO request) {
        return ResponseEntity.ok(cartService.updateItem(principal.getName(), cartItemId, request.getQuantity()));
    }

    @Operation(summary = "Remove one cart item")
    @DeleteMapping({"/items/{cartItemId}", "/{cartItemId}"})
    public ResponseEntity<CartResponseDTO> removeItem(Principal principal, @PathVariable Long cartItemId) {
        return ResponseEntity.ok(cartService.removeItem(principal.getName(), cartItemId));
    }

    @Operation(summary = "Clear the current customer's cart")
    @DeleteMapping
    public ResponseEntity<CartResponseDTO> clear(Principal principal) {
        return ResponseEntity.ok(cartService.clear(principal.getName()));
    }
}
