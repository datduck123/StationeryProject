package fpt.edu.vn.stationery.service;

import fpt.edu.vn.stationery.dto.request.CreateReviewRequestDTO;
import fpt.edu.vn.stationery.dto.response.ProductReviewSummaryDTO;
import fpt.edu.vn.stationery.dto.response.ReviewEligibilityResponseDTO;
import fpt.edu.vn.stationery.dto.response.ReviewResponseDTO;

public interface ReviewService {
    ReviewResponseDTO createReview(String email, CreateReviewRequestDTO request);

    ProductReviewSummaryDTO getProductReviews(Long productId, int page, int size, String sortDir);

    ReviewEligibilityResponseDTO checkEligibility(String email, Long productId);

    void deleteReview(Long reviewId);
}
