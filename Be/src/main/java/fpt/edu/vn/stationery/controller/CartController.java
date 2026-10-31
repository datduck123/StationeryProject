package fpt.edu.vn.stationery.controller;

import fpt.edu.vn.stationery.dto.request.CartCalculationRequestDTO;
import fpt.edu.vn.stationery.dto.request.CartItemInputDTO;
import fpt.edu.vn.stationery.dto.request.UpdateCartItemRequestDTO;
import fpt.edu.vn.stationery.dto.response.CartResponseDTO;
import fpt.edu.vn.stationery.entity.User;
import fpt.edu.vn.stationery.exception.BadRequestException;
import fpt.edu.vn.stationery.repository.UserRepository;
import fpt.edu.vn.stationery.service.CartCalculationService;
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
@Tag(name = "Cart", description = "Cart management and inventory synchronization")
@SecurityRequirement(name = "bearerAuth")
public class CartController {

    private final CartService cartService;
    private final CartCalculationService cartCalculationService;
    private final UserRepository userRepository;

    @Operation(summary = "Get user's database cart with price calculations")
    @GetMapping
    public ResponseEntity<CartResponseDTO> getMyCart(
            @RequestParam(defaultValue = "STANDARD") String shippingMethod,
            @RequestParam(required = false) Long voucherId,
            Principal principal) {
        Long userId = resolveRequiredUserId(principal);
        CartResponseDTO response = cartService.getCart(userId, shippingMethod, voucherId);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Add product to cart (Validates stock before adding)")
    @PostMapping
    public ResponseEntity<CartResponseDTO> addToCart(
            @Valid @RequestBody CartItemInputDTO request,
            Principal principal) {
        Long userId = resolveRequiredUserId(principal);
        CartResponseDTO response = cartService.addToCart(userId, request);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Update cart item quantity (+/-)")
    @PutMapping("/{cartItemId}")
    public ResponseEntity<CartResponseDTO> updateCartItem(
            @PathVariable Long cartItemId,
            @Valid @RequestBody UpdateCartItemRequestDTO request,
            Principal principal) {
        Long userId = resolveRequiredUserId(principal);
        CartResponseDTO response = cartService.updateCartItem(userId, cartItemId, request.getQuantity());
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Remove an item from cart")
    @DeleteMapping("/{cartItemId}")
    public ResponseEntity<CartResponseDTO> removeCartItem(
            @PathVariable Long cartItemId,
            Principal principal) {
        Long userId = resolveRequiredUserId(principal);
        CartResponseDTO response = cartService.removeCartItem(userId, cartItemId);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Clear all items from cart")
    @DeleteMapping
    public ResponseEntity<CartResponseDTO> clearCart(Principal principal) {
        Long userId = resolveRequiredUserId(principal);
        CartResponseDTO response = cartService.clearCart(userId);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Calculate cart totals without modifying cart: Subtotal, Shipping Fee, and Stock Check")
    @PostMapping("/calculate")
    public ResponseEntity<CartResponseDTO> calculateCart(
            @Valid @RequestBody(required = false) CartCalculationRequestDTO request,
            Principal principal) {
        Long userId = resolveUserId(principal);
        CartResponseDTO response = cartCalculationService.calculate(request, userId);
        return ResponseEntity.ok(response);
    }

    private Long resolveRequiredUserId(Principal principal) {
        Long userId = resolveUserId(principal);
        if (userId == null) {
            throw new BadRequestException("Người dùng chưa được xác thực hoặc không tìm thấy tài khoản");
        }
        return userId;
    }

    private Long resolveUserId(Principal principal) {
        if (principal == null || principal.getName() == null) {
            return null;
        }
        return userRepository.findByEmail(principal.getName())
                .map(User::getUserId)
                .orElse(null);
    }
}
