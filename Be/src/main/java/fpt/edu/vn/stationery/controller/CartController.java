package fpt.edu.vn.stationery.controller;

import fpt.edu.vn.stationery.dto.request.CartCalculationRequestDTO;
import fpt.edu.vn.stationery.dto.response.CartResponseDTO;
import fpt.edu.vn.stationery.entity.User;
import fpt.edu.vn.stationery.repository.UserRepository;
import fpt.edu.vn.stationery.service.CartCalculationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
@Tag(name = "Cart", description = "Cart calculation and inventory synchronization")
public class CartController {

    private final CartCalculationService cartCalculationService;
    private final UserRepository userRepository;

    @Operation(summary = "Calculate cart totals: Subtotal, Shipping Fee, and auto-adjust quantities if stock changed")
    @PostMapping("/calculate")
    public ResponseEntity<CartResponseDTO> calculateCart(
            @Valid @RequestBody(required = false) CartCalculationRequestDTO request,
            Principal principal) {
        
        Long userId = resolveUserId(principal);
        CartResponseDTO response = cartCalculationService.calculate(request, userId);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Get and calculate current user's database cart")
    @GetMapping
    public ResponseEntity<CartResponseDTO> getMyCart(
            @RequestParam(defaultValue = "STANDARD") String shippingMethod,
            @RequestParam(required = false) Long voucherId,
            Principal principal) {
        
        Long userId = resolveUserId(principal);
        CartResponseDTO response = cartCalculationService.calculateForUser(userId, shippingMethod, voucherId);
        return ResponseEntity.ok(response);
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
