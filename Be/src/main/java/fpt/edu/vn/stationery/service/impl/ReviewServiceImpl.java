package fpt.edu.vn.stationery.service.impl;

import fpt.edu.vn.stationery.constant.ProductStatus;
import fpt.edu.vn.stationery.dto.request.CreateReviewRequestDTO;
import fpt.edu.vn.stationery.dto.response.PageDTO;
import fpt.edu.vn.stationery.dto.response.ProductReviewSummaryDTO;
import fpt.edu.vn.stationery.dto.response.ReviewEligibilityResponseDTO;
import fpt.edu.vn.stationery.dto.response.ReviewResponseDTO;
import fpt.edu.vn.stationery.entity.OrderItem;
import fpt.edu.vn.stationery.entity.Product;
import fpt.edu.vn.stationery.entity.Review;
import fpt.edu.vn.stationery.exception.BadRequestException;
import fpt.edu.vn.stationery.exception.DuplicateResourceException;
import fpt.edu.vn.stationery.exception.ResourceNotFoundException;
import fpt.edu.vn.stationery.repository.OrderItemRepository;
import fpt.edu.vn.stationery.repository.ProductRepository;
import fpt.edu.vn.stationery.repository.ReviewRepository;
import fpt.edu.vn.stationery.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReviewServiceImpl implements ReviewService {
    private static final int MAX_PAGE_SIZE = 100;

    private final ReviewRepository reviewRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductRepository productRepository;

    @Override
    @Transactional
    public ReviewResponseDTO createReview(String email, CreateReviewRequestDTO request) {
        if (email == null || email.isBlank()) {
            throw new BadRequestException("Authenticated customer is required");
        }
        validateCreateRequest(request);

        OrderItem orderItem = orderItemRepository.findForReview(request.orderItemId())
                .orElseThrow(() -> new ResourceNotFoundException("Order item not found"));

        if (!orderItem.getOrder().getUser().getEmail().equalsIgnoreCase(email)) {
            throw new ResourceNotFoundException("Order item not found");
        }
        if (!"DELIVERED".equalsIgnoreCase(orderItem.getOrder().getOrderStatus())) {
            throw new BadRequestException("Only items from delivered orders can be reviewed");
        }
        if (reviewRepository.existsByOrderItem_OrderItemId(orderItem.getOrderItemId())) {
            throw new DuplicateResourceException("This order item has already been reviewed");
        }

        String comment = request.comment().trim();

        Review review = Review.builder()
                .orderItem(orderItem)
                .user(orderItem.getOrder().getUser())
                .productId(orderItem.getProductId())
                .rating(request.rating())
                .comment(comment)
                .build();
        return toResponse(reviewRepository.save(review));
    }

    @Override
    public ProductReviewSummaryDTO getProductReviews(Long productId, int page, int size, String sortDir) {
        validatePagination(productId, page, size, sortDir);

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));
        if (product.getStatus() != ProductStatus.ACTIVE) {
            throw new ResourceNotFoundException("Product not found with id: " + productId);
        }

        Sort.Direction direction = Sort.Direction.fromString(sortDir);
        PageRequest pageable = PageRequest.of(page, size,
                Sort.by(direction, "createdAt").and(Sort.by(direction, "reviewId")));
        Page<ReviewResponseDTO> reviews = reviewRepository
                .findByProductId(productId, pageable)
                .map(this::toResponse);

        Double rawAverage = reviewRepository.averageRatingByProductId(productId);
        double average = rawAverage == null ? 0.0 : BigDecimal.valueOf(rawAverage)
                .setScale(2, RoundingMode.HALF_UP)
                .doubleValue();

        Map<Integer, Long> distribution = new HashMap<>();
        for (int i = 1; i <= 5; i++) {
            distribution.put(i, 0L);
        }
        for (Object[] row : reviewRepository.countGroupByRatingByProductId(productId)) {
            if (row != null && row.length >= 2 && row[0] instanceof Number r && row[1] instanceof Number c) {
                distribution.put(r.intValue(), c.longValue());
            }
        }

        return ProductReviewSummaryDTO.builder()
                .reviews(PageDTO.from(reviews))
                .averageRating(average)
                .reviewCount(reviewRepository.countByProductId(productId))
                .ratingDistribution(distribution)
                .build();
    }

    @Override
    public ReviewEligibilityResponseDTO checkEligibility(String email, Long productId) {
        if (email == null || email.isBlank() || "anonymousUser".equalsIgnoreCase(email)) {
            return ReviewEligibilityResponseDTO.builder()
                    .eligible(false)
                    .message("UNAUTHENTICATED")
                    .build();
        }
        if (productId == null || productId <= 0) {
            throw new BadRequestException("Invalid product ID: " + productId);
        }
        List<OrderItem> eligibleItems = orderItemRepository.findEligibleItemsForReview(email, productId);
        if (eligibleItems.isEmpty()) {
            return ReviewEligibilityResponseDTO.builder()
                    .eligible(false)
                    .message("NOT_ELIGIBLE")
                    .build();
        }
        OrderItem item = eligibleItems.get(0);
        return ReviewEligibilityResponseDTO.builder()
                .eligible(true)
                .orderItemId(item.getOrderItemId())
                .productName(item.getProductName())
                .message("ELIGIBLE")
                .build();
    }

    @Override
    @Transactional
    public void deleteReview(Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found with id: " + reviewId));
        // Preserve the unique purchased item so moderation cannot be bypassed by reposting.
        review.setHidden(true);
        reviewRepository.save(review);
    }

    private void validatePagination(Long productId, int page, int size, String sortDir) {
        if (productId == null || productId <= 0) {
            throw new BadRequestException("Invalid product ID: " + productId);
        }
        if (page < 0 || size < 1 || size > MAX_PAGE_SIZE) {
            throw new BadRequestException("Page must be non-negative and size must be between 1 and 100");
        }
        if (!("asc".equalsIgnoreCase(sortDir) || "desc".equalsIgnoreCase(sortDir))) {
            throw new BadRequestException("Sort direction must be 'asc' or 'desc'");
        }
    }

    private void validateCreateRequest(CreateReviewRequestDTO request) {
        if (request == null || request.orderItemId() == null || request.orderItemId() <= 0) {
            throw new BadRequestException("A valid order item ID is required");
        }
        if (request.rating() == null || request.rating() < 1 || request.rating() > 5) {
            throw new BadRequestException("Rating must be between 1 and 5");
        }
        if (request.comment() == null) {
            throw new BadRequestException("Review comment is required");
        }
        int commentLength = request.comment().trim().length();
        if (commentLength < 3 || commentLength > 1000) {
            throw new BadRequestException("Review comment must contain between 3 and 1000 characters");
        }
    }

    private ReviewResponseDTO toResponse(Review review) {
        return ReviewResponseDTO.builder()
                .reviewId(review.getReviewId())
                .orderItemId(review.getOrderItem().getOrderItemId())
                .productId(review.getOrderItem().getProductId())
                .userFullName(review.getUser().getFullName())
                .rating(review.getRating())
                .comment(review.getComment())
                .createdAt(review.getCreatedAt())
                .build();
    }
}
