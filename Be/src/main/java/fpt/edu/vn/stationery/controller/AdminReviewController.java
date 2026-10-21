package fpt.edu.vn.stationery.controller;

import fpt.edu.vn.stationery.service.ReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/reviews")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin - Reviews")
@SecurityRequirement(name = "bearerAuth")
public class AdminReviewController {
    private final ReviewService reviewService;

    @Operation(summary = "Hide a review that violates community standards while preserving its one-review-per-item record")
    @ApiResponse(responseCode = "204", description = "Review hidden from public results successfully")
    @ApiResponse(responseCode = "403", description = "Forbidden: Admin role required")
    @ApiResponse(responseCode = "404", description = "Review not found")
    @DeleteMapping("/{reviewId}")
    public ResponseEntity<Void> deleteReview(@PathVariable Long reviewId) {
        reviewService.deleteReview(reviewId);
        return ResponseEntity.noContent().build();
    }
}
