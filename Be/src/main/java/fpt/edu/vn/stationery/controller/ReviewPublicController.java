package fpt.edu.vn.stationery.controller;

import fpt.edu.vn.stationery.dto.response.ProductReviewSummaryDTO;
import fpt.edu.vn.stationery.dto.response.ReviewEligibilityResponseDTO;
import fpt.edu.vn.stationery.service.ReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/products/{productId}/reviews")
@RequiredArgsConstructor
@Tag(name = "Public - Reviews")
@SecurityRequirements
public class ReviewPublicController {
    private final ReviewService reviewService;

    @Operation(summary = "Get product reviews and rating summary")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved reviews")
    @ApiResponse(responseCode = "404", description = "Product not found")
    @GetMapping
    public ResponseEntity<ProductReviewSummaryDTO> getProductReviews(
            @PathVariable Long productId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "desc") String sortDir) {
        return ResponseEntity.ok(reviewService.getProductReviews(productId, page, size, sortDir));
    }

    @Operation(summary = "Check if current authenticated customer is eligible to review product")
    @ApiResponse(responseCode = "200", description = "Eligibility check result")
    @GetMapping("/eligibility")
    public ResponseEntity<ReviewEligibilityResponseDTO> checkEligibility(
            @PathVariable Long productId,
            Principal principal) {
        String email = principal != null ? principal.getName() : null;
        return ResponseEntity.ok(reviewService.checkEligibility(email, productId));
    }
}
