package fpt.edu.vn.stationery.controller;

import fpt.edu.vn.stationery.dto.request.CheckoutRequestDTO;
import fpt.edu.vn.stationery.dto.response.CheckoutResponseDTO;
import fpt.edu.vn.stationery.entity.User;
import fpt.edu.vn.stationery.exception.BadRequestException;
import fpt.edu.vn.stationery.repository.UserRepository;
import fpt.edu.vn.stationery.service.CheckoutService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/checkout")
@RequiredArgsConstructor
@Tag(name = "Checkout", description = "Checkout initialization and validation")
@SecurityRequirement(name = "bearerAuth")
public class CheckoutController {

    private final CheckoutService checkoutService;
    private final UserRepository userRepository;

    @Operation(summary = "Validate cart stock and initialize checkout payload")
    @PostMapping("/validate")
    public ResponseEntity<CheckoutResponseDTO> validateCheckout(
            @Valid @RequestBody CheckoutRequestDTO request,
            Principal principal) {
        Long userId = resolveRequiredUserId(principal);
        CheckoutResponseDTO response = checkoutService.initializeCheckout(userId, request);
        return ResponseEntity.ok(response);
    }

    private Long resolveRequiredUserId(Principal principal) {
        if (principal == null || principal.getName() == null) {
            throw new BadRequestException("Người dùng chưa được xác thực hoặc không tìm thấy tài khoản");
        }
        return userRepository.findByEmail(principal.getName())
                .map(User::getUserId)
                .orElseThrow(() -> new BadRequestException("Tài khoản không tồn tại."));
    }
}
