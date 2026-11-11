package fpt.edu.vn.stationery.service;

import fpt.edu.vn.stationery.constant.ProductStatus;
import fpt.edu.vn.stationery.dto.request.CreateReviewRequestDTO;
import fpt.edu.vn.stationery.dto.response.ProductReviewSummaryDTO;
import fpt.edu.vn.stationery.dto.response.ReviewResponseDTO;
import fpt.edu.vn.stationery.entity.Order;
import fpt.edu.vn.stationery.entity.OrderItem;
import fpt.edu.vn.stationery.entity.Product;
import fpt.edu.vn.stationery.entity.Review;
import fpt.edu.vn.stationery.entity.User;
import fpt.edu.vn.stationery.exception.BadRequestException;
import fpt.edu.vn.stationery.exception.DuplicateResourceException;
import fpt.edu.vn.stationery.exception.ResourceNotFoundException;
import fpt.edu.vn.stationery.repository.OrderItemRepository;
import fpt.edu.vn.stationery.repository.ProductRepository;
import fpt.edu.vn.stationery.repository.ReviewRepository;
import fpt.edu.vn.stationery.service.impl.ReviewServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Kiểm thử Business Rules cho Đánh giá sản phẩm (Review)")
class ReviewBusinessRuleTest {

    @Mock
    private ReviewRepository reviewRepository;
    @Mock
    private OrderItemRepository orderItemRepository;
    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private ReviewServiceImpl reviewService;

    private User customer;
    private Order order;
    private OrderItem orderItem;

    @BeforeEach
    void setUp() {
        customer = User.builder()
                .userId(5L)
                .fullName("Huỳnh Tuấn Kiệt")
                .email("kiet@example.com")
                .build();
        order = Order.builder()
                .orderId(10L)
                .user(customer)
                .orderStatus("DELIVERED")
                .build();
        orderItem = OrderItem.builder()
                .orderItemId(20L)
                .order(order)
                .productId(30L)
                .productName("Sổ tay cao cấp")
                .build();
    }

    @Nested
    @DisplayName("Rule 1: Khách hàng phải có OrderItem thực tế trong đơn hàng (Đã mua)")
    class Rule1AlreadyPurchasedTests {

        @Test
        @DisplayName("Rule 1 - Thành công: OrderItem tồn tại trong hệ thống được chấp nhận")
        void rule1_acceptsExistingOrderItem() {
            CreateReviewRequestDTO request = new CreateReviewRequestDTO(20L, 5, "Sản phẩm dùng rất tốt");
            when(orderItemRepository.findForReview(20L)).thenReturn(Optional.of(orderItem));
            when(reviewRepository.existsByOrderItem_OrderItemId(20L)).thenReturn(false);
            when(reviewRepository.save(any(Review.class))).thenAnswer(inv -> {
                Review r = inv.getArgument(0);
                r.setReviewId(101L);
                return r;
            });

            ReviewResponseDTO res = reviewService.createReview("kiet@example.com", request);
            assertNotNull(res);
            assertEquals(101L, res.getReviewId());
        }

        @Test
        @DisplayName("Rule 1 - Thất bại: Không tìm thấy OrderItem ném ResourceNotFoundException")
        void rule1_rejectsNonExistingOrderItem() {
            CreateReviewRequestDTO request = new CreateReviewRequestDTO(999L, 5, "Sản phẩm tốt");
            when(orderItemRepository.findForReview(999L)).thenReturn(Optional.empty());

            assertThrows(ResourceNotFoundException.class,
                    () -> reviewService.createReview("kiet@example.com", request));
            verify(reviewRepository, never()).save(any());
        }
    }

    @Nested
    @DisplayName("Rule 2: Đơn hàng phải ở trạng thái DELIVERED mới được đánh giá")
    class Rule2DeliveredStatusTests {

        @Test
        @DisplayName("Rule 2 - Thành công: Đơn hàng DELIVERED cho phép gửi đánh giá")
        void rule2_acceptsDeliveredOrder() {
            order.setOrderStatus("DELIVERED");
            CreateReviewRequestDTO request = new CreateReviewRequestDTO(20L, 5, "Đã nhận hàng rất ưng ý");
            when(orderItemRepository.findForReview(20L)).thenReturn(Optional.of(orderItem));
            when(reviewRepository.existsByOrderItem_OrderItemId(20L)).thenReturn(false);
            when(reviewRepository.save(any(Review.class))).thenAnswer(inv -> inv.getArgument(0));

            assertDoesNotThrow(() -> reviewService.createReview("kiet@example.com", request));
        }

        @Test
        @DisplayName("Rule 2 - Thất bại: Đơn hàng trạng thái SHIPPING bị từ chối")
        void rule2_rejectsShippingOrder() {
            order.setOrderStatus("SHIPPING");
            when(orderItemRepository.findForReview(20L)).thenReturn(Optional.of(orderItem));

            BadRequestException ex = assertThrows(BadRequestException.class,
                    () -> reviewService.createReview("kiet@example.com", new CreateReviewRequestDTO(20L, 5, "Sản phẩm tốt")));
            assertTrue(ex.getMessage().contains("delivered"));
            verify(reviewRepository, never()).save(any());
        }

        @Test
        @DisplayName("Rule 2 - Thất bại: Đơn hàng trạng thái PENDING bị từ chối")
        void rule2_rejectsPendingOrder() {
            order.setOrderStatus("PENDING");
            when(orderItemRepository.findForReview(20L)).thenReturn(Optional.of(orderItem));

            assertThrows(BadRequestException.class,
                    () -> reviewService.createReview("kiet@example.com", new CreateReviewRequestDTO(20L, 5, "Sản phẩm tốt")));
        }

        @Test
        @DisplayName("Rule 2 - Thất bại: Đơn hàng trạng thái CANCELLED bị từ chối")
        void rule2_rejectsCancelledOrder() {
            order.setOrderStatus("CANCELLED");
            when(orderItemRepository.findForReview(20L)).thenReturn(Optional.of(orderItem));

            assertThrows(BadRequestException.class,
                    () -> reviewService.createReview("kiet@example.com", new CreateReviewRequestDTO(20L, 5, "Sản phẩm tốt")));
        }
    }

    @Nested
    @DisplayName("Rule 3: Người đánh giá phải đúng là chủ sở hữu đơn hàng (Đúng User)")
    class Rule3CorrectUserTests {

        @Test
        @DisplayName("Rule 3 - Thành công: Khách hàng trùng email với đơn hàng được phép đánh giá")
        void rule3_acceptsOwnerUser() {
            when(orderItemRepository.findForReview(20L)).thenReturn(Optional.of(orderItem));
            when(reviewRepository.existsByOrderItem_OrderItemId(20L)).thenReturn(false);
            when(reviewRepository.save(any(Review.class))).thenAnswer(inv -> inv.getArgument(0));

            assertDoesNotThrow(() -> reviewService.createReview("kiet@example.com",
                    new CreateReviewRequestDTO(20L, 5, "Sản phẩm tuyệt vời")));
        }

        @Test
        @DisplayName("Rule 3 - Thất bại: Khách hàng khác email bị chặn với ResourceNotFoundException")
        void rule3_rejectsDifferentUser() {
            when(orderItemRepository.findForReview(20L)).thenReturn(Optional.of(orderItem));

            assertThrows(ResourceNotFoundException.class, () -> reviewService.createReview(
                    "stranger@example.com", new CreateReviewRequestDTO(20L, 5, "Sản phẩm tốt")));
            verify(reviewRepository, never()).save(any());
        }
    }

    @Nested
    @DisplayName("Rule 4: Mỗi OrderItem chỉ được đánh giá 1 lần duy nhất (Unique)")
    class Rule4OneReviewPerItemTests {

        @Test
        @DisplayName("Rule 4 - Thất bại: OrderItem đã từng được đánh giá sẽ bị từ chối DuplicateResourceException")
        void rule4_rejectsDuplicateReview() {
            when(orderItemRepository.findForReview(20L)).thenReturn(Optional.of(orderItem));
            when(reviewRepository.existsByOrderItem_OrderItemId(20L)).thenReturn(true);

            assertThrows(DuplicateResourceException.class, () -> reviewService.createReview(
                    "kiet@example.com", new CreateReviewRequestDTO(20L, 5, "Đánh giá lần 2")));
            verify(reviewRepository, never()).save(any());
        }
    }

    @Nested
    @DisplayName("Rule 5: Điểm đánh giá (1-5 sao) và Nội dung bình luận (3-1000 ký tự)")
    class Rule5RatingAndCommentValidationTests {

        @Test
        @DisplayName("Rule 5 - Biên Rating: Chấp nhận điểm đánh giá nhỏ nhất = 1 sao")
        void rule5_acceptsMinRating1() {
            when(orderItemRepository.findForReview(20L)).thenReturn(Optional.of(orderItem));
            when(reviewRepository.existsByOrderItem_OrderItemId(20L)).thenReturn(false);
            when(reviewRepository.save(any(Review.class))).thenAnswer(inv -> inv.getArgument(0));

            ReviewResponseDTO res = reviewService.createReview("kiet@example.com",
                    new CreateReviewRequestDTO(20L, 1, "Sản phẩm tạm được"));
            assertEquals(1, res.getRating());
        }

        @Test
        @DisplayName("Rule 5 - Biên Rating: Chấp nhận điểm đánh giá lớn nhất = 5 sao")
        void rule5_acceptsMaxRating5() {
            when(orderItemRepository.findForReview(20L)).thenReturn(Optional.of(orderItem));
            when(reviewRepository.existsByOrderItem_OrderItemId(20L)).thenReturn(false);
            when(reviewRepository.save(any(Review.class))).thenAnswer(inv -> inv.getArgument(0));

            ReviewResponseDTO res = reviewService.createReview("kiet@example.com",
                    new CreateReviewRequestDTO(20L, 5, "Sản phẩm cực kỳ xuất sắc"));
            assertEquals(5, res.getRating());
        }

        @Test
        @DisplayName("Rule 5 - Biên Rating: Từ chối điểm đánh giá = 0 sao")
        void rule5_rejectsBoundaryRating0() {
            assertThrows(BadRequestException.class, () -> reviewService.createReview(
                    "kiet@example.com", new CreateReviewRequestDTO(20L, 0, "Bình luận hợp lệ")));
            verifyNoInteractions(orderItemRepository, reviewRepository);
        }

        @Test
        @DisplayName("Rule 5 - Biên Rating: Từ chối điểm đánh giá = 6 sao")
        void rule5_rejectsBoundaryRating6() {
            assertThrows(BadRequestException.class, () -> reviewService.createReview(
                    "kiet@example.com", new CreateReviewRequestDTO(20L, 6, "Bình luận hợp lệ")));
            verifyNoInteractions(orderItemRepository, reviewRepository);
        }

        @Test
        @DisplayName("Rule 5 - Biên Comment: Chấp nhận nội dung đúng 3 ký tự (cận dưới)")
        void rule5_acceptsCommentBoundary3Chars() {
            when(orderItemRepository.findForReview(20L)).thenReturn(Optional.of(orderItem));
            when(reviewRepository.existsByOrderItem_OrderItemId(20L)).thenReturn(false);
            when(reviewRepository.save(any(Review.class))).thenAnswer(inv -> inv.getArgument(0));

            ReviewResponseDTO res = reviewService.createReview("kiet@example.com",
                    new CreateReviewRequestDTO(20L, 5, "Tot"));
            assertEquals("Tot", res.getComment());
        }

        @Test
        @DisplayName("Rule 5 - Biên Comment: Chấp nhận nội dung đúng 1000 ký tự (cận trên)")
        void rule5_acceptsCommentBoundary1000Chars() {
            String comment1000 = "a".repeat(1000);
            when(orderItemRepository.findForReview(20L)).thenReturn(Optional.of(orderItem));
            when(reviewRepository.existsByOrderItem_OrderItemId(20L)).thenReturn(false);
            when(reviewRepository.save(any(Review.class))).thenAnswer(inv -> inv.getArgument(0));

            ReviewResponseDTO res = reviewService.createReview("kiet@example.com",
                    new CreateReviewRequestDTO(20L, 5, comment1000));
            assertEquals(1000, res.getComment().length());
        }

        @Test
        @DisplayName("Rule 5 - Biên Comment: Từ chối nội dung chỉ có 2 ký tự (dưới cận)")
        void rule5_rejectsCommentBoundary2Chars() {
            assertThrows(BadRequestException.class, () -> reviewService.createReview(
                    "kiet@example.com", new CreateReviewRequestDTO(20L, 5, "Ok")));
            verifyNoInteractions(orderItemRepository, reviewRepository);
        }

        @Test
        @DisplayName("Rule 5 - Biên Comment: Từ chối nội dung dài 1001 ký tự (vượt cận)")
        void rule5_rejectsCommentBoundary1001Chars() {
            String comment1001 = "a".repeat(1001);
            assertThrows(BadRequestException.class, () -> reviewService.createReview(
                    "kiet@example.com", new CreateReviewRequestDTO(20L, 5, comment1001)));
            verifyNoInteractions(orderItemRepository, reviewRepository);
        }

        @Test
        @DisplayName("Rule 5 - Biên Comment: Từ chối nội dung null hoặc rỗng")
        void rule5_rejectsNullOrBlankComment() {
            assertThrows(BadRequestException.class, () -> reviewService.createReview(
                    "kiet@example.com", new CreateReviewRequestDTO(20L, 5, null)));
            assertThrows(BadRequestException.class, () -> reviewService.createReview(
                    "kiet@example.com", new CreateReviewRequestDTO(20L, 5, "   ")));
        }
    }

    @Nested
    @DisplayName("Public Review & Eligibility Queries")
    class PublicReviewAndEligibilityTests {

        @Test
        @DisplayName("Lấy đánh giá công khai: tính điểm trung bình làm tròn 2 chữ số và phân bố rating")
        void getProductReviews_returnsPageAndRoundedSummary() {
            Product product = Product.builder().productId(30L).status(ProductStatus.ACTIVE).build();
            Review review = Review.builder()
                    .reviewId(100L)
                    .orderItem(orderItem)
                    .user(customer)
                    .rating(5)
                    .comment("Sổ tay rất đẹp")
                    .createdAt(LocalDateTime.of(2026, 10, 4, 10, 0))
                    .build();
            when(productRepository.findById(30L)).thenReturn(Optional.of(product));
            when(reviewRepository.findByProductId(eq(30L), any(Pageable.class)))
                    .thenReturn(new PageImpl<>(List.of(review)));
            when(reviewRepository.averageRatingByProductId(30L)).thenReturn(4.6666);
            when(reviewRepository.countByProductId(30L)).thenReturn(3L);
            when(reviewRepository.countGroupByRatingByProductId(30L))
                    .thenReturn(List.<Object[]>of(new Object[]{5, 3L}));

            ProductReviewSummaryDTO result = reviewService.getProductReviews(30L, 0, 10, "desc");

            assertEquals(4.67, result.getAverageRating());
            assertEquals(3L, result.getReviewCount());
            assertEquals(3L, result.getRatingDistribution().get(5));
            assertEquals(0L, result.getRatingDistribution().get(1));
            assertEquals(1, result.getReviews().getContent().size());
            assertEquals("Huỳnh Tuấn Kiệt", result.getReviews().getContent().getFirst().getUserFullName());
        }

        @Test
        @DisplayName("Eligibility: Khách hàng chưa đăng nhập trả về UNAUTHENTICATED")
        void checkEligibility_unauthenticated() {
            var res = reviewService.checkEligibility(null, 30L);
            assertFalse(res.isEligible());
            assertEquals("UNAUTHENTICATED", res.getMessage());
        }

        @Test
        @DisplayName("Eligibility: Khách hàng có đơn DELIVERED chưa đánh giá trả về ELIGIBLE")
        void checkEligibility_eligible() {
            when(orderItemRepository.findEligibleItemsForReview("kiet@example.com", 30L))
                    .thenReturn(List.of(orderItem));

            var res = reviewService.checkEligibility("kiet@example.com", 30L);
            assertTrue(res.isEligible());
            assertEquals(20L, res.getOrderItemId());
            assertEquals("ELIGIBLE", res.getMessage());
        }

        @Test
        @DisplayName("Eligibility: Khách hàng không có sản phẩm đủ điều kiện trả về NOT_ELIGIBLE")
        void checkEligibility_notEligible() {
            when(orderItemRepository.findEligibleItemsForReview("kiet@example.com", 30L))
                    .thenReturn(List.of());

            var res = reviewService.checkEligibility("kiet@example.com", 30L);
            assertFalse(res.isEligible());
            assertEquals("NOT_ELIGIBLE", res.getMessage());
        }
    }

    @Test
    @DisplayName("Admin moderation hides a review and preserves its order item uniqueness")
    void moderationPreservesPurchasedItemRecord() {
        Review review = Review.builder().reviewId(100L).orderItem(orderItem).user(customer)
                .productId(30L).rating(1).comment("Moderated comment").build();
        when(reviewRepository.findById(100L)).thenReturn(Optional.of(review));

        reviewService.deleteReview(100L);

        assertTrue(review.isHidden());
        verify(reviewRepository).save(review);
        verify(reviewRepository, never()).delete(any());
    }
}
