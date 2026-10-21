package fpt.edu.vn.stationery.controller;

import fpt.edu.vn.stationery.dto.request.CreateReviewRequestDTO;
import fpt.edu.vn.stationery.dto.response.ReviewResponseDTO;
import fpt.edu.vn.stationery.service.ReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
@Tag(name = "Customer - Reviews")
@SecurityRequirement(name = "bearerAuth")
public class ReviewController {
    private final ReviewService reviewService;

    @Operation(summary = "Review one purchased item from a delivered order")
    @ApiResponse(responseCode = "201", description = "Review submitted successfully")
    @ApiResponse(responseCode = "400", description = "Invalid rating/comment or order not delivered")
    @ApiResponse(responseCode = "404", description = "Order item not found or does not belong to customer")
    @ApiResponse(responseCode = "409", description = "Order item has already been reviewed")
    @PostMapping
    public ResponseEntity<ReviewResponseDTO> createReview(
            Principal principal,
            @Valid @RequestBody CreateReviewRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(reviewService.createReview(principal.getName(), request));
    }
}
