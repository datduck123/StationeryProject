package fpt.edu.vn.stationery.service;

import fpt.edu.vn.stationery.dto.request.CreateOrderRequestDTO;
import fpt.edu.vn.stationery.dto.request.CreateReviewRequestDTO;
import fpt.edu.vn.stationery.dto.response.OrderDetailResponseDTO;
import fpt.edu.vn.stationery.constant.NotificationType;
import fpt.edu.vn.stationery.entity.*;
import fpt.edu.vn.stationery.event.OrderStatusChangedListener;
import fpt.edu.vn.stationery.exception.BadRequestException;
import fpt.edu.vn.stationery.exception.DuplicateResourceException;
import fpt.edu.vn.stationery.exception.ResourceNotFoundException;
import fpt.edu.vn.stationery.mapper.OrderMapper;
import fpt.edu.vn.stationery.repository.*;
import fpt.edu.vn.stationery.service.impl.OrderServiceImpl;
import fpt.edu.vn.stationery.service.impl.NotificationWriter;
import fpt.edu.vn.stationery.service.impl.ReviewServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.Import;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.function.Supplier;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Exercises actual repository writes and committed/rolled-back transactions.
 * The explicit in-memory URL and disabled Flyway keep these tests away from SQL Server.
 */
@DataJpaTest(showSql = false, properties = {
        "spring.datasource.url=jdbc:h2:mem:order-flow;MODE=MSSQLServer;DB_CLOSE_DELAY=-1;INIT=CREATE SCHEMA IF NOT EXISTS dbo",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.H2Dialect",
        "spring.jpa.properties.hibernate.default_schema=dbo",
        "spring.jpa.hibernate.naming.physical-strategy=org.hibernate.boot.model.naming.PhysicalNamingStrategyStandardImpl",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.jpa.show-sql=false",
        "spring.flyway.enabled=false"
})
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Import({OrderServiceImpl.class, OrderMapper.class, ReviewServiceImpl.class,
        OrderStatusChangedListener.class, NotificationWriter.class})
@Transactional(propagation = Propagation.NOT_SUPPORTED)
class OrderFlowIntegrationTest {
    private static final String EMAIL = "order-flow@example.test";

    @Autowired OrderService orderService;
    @Autowired ReviewService reviewService;
    @Autowired UserRepository users;
    @Autowired ProductRepository products;
    @Autowired CartItemRepository carts;
    @Autowired VoucherRepository vouchers;
    @Autowired OrderRepository orders;
    @Autowired OrderItemRepository orderItems;
    @Autowired PaymentRepository payments;
    @Autowired ReviewRepository reviews;
    @Autowired NotificationRepository notifications;
    @Autowired BrandRepository brands;
    @Autowired CategoryRepository categories;
    @Autowired JdbcTemplate jdbc;
    @Autowired PlatformTransactionManager transactionManager;

    private TransactionTemplate transactions;
    private Long firstProductId;
    private Long secondProductId;
    private Long voucherId;
    private Long userId;

    @BeforeEach
    void seedDatabase() {
        transactions = new TransactionTemplate(transactionManager);
        inTransaction(() -> {
            notifications.deleteAllInBatch();
            reviews.deleteAllInBatch();
            payments.deleteAllInBatch();
            orderItems.deleteAllInBatch();
            orders.deleteAllInBatch();
            carts.deleteAllInBatch();
            vouchers.deleteAllInBatch();
            products.deleteAllInBatch();
            brands.deleteAllInBatch();
            categories.deleteAllInBatch();
            users.deleteAllInBatch();

            User customer = users.saveAndFlush(User.builder()
                    .email(EMAIL).fullName("Order Flow Customer").passwordHash("test-only-hash").build());
            userId = customer.getUserId();
            Brand brand = brands.saveAndFlush(Brand.builder().name("Flow Brand").build());
            Category category = categories.saveAndFlush(Category.builder().name("Flow Category").build());
            Product first = products.saveAndFlush(Product.builder()
                    .brand(brand).category(category).sku("FLOW-PEN").name("Flow pen")
                    .price(new BigDecimal("25000")).weightKg(new BigDecimal("0.10"))
                    .stockQuantity(10).build());
            Product second = products.saveAndFlush(Product.builder()
                    .brand(brand).category(category).sku("FLOW-NOTEBOOK").name("Flow notebook")
                    .price(new BigDecimal("10000")).weightKg(new BigDecimal("0.20"))
                    .stockQuantity(8).build());
            firstProductId = first.getProductId();
            secondProductId = second.getProductId();
            carts.saveAndFlush(CartItem.builder().user(customer).product(first).quantity(2).build());
            carts.saveAndFlush(CartItem.builder().user(customer).product(second).quantity(3).build());
            Voucher voucher = vouchers.saveAndFlush(Voucher.builder().code("FLOW15K")
                    .discountAmount(new BigDecimal("15000")).minOrderAmount(new BigDecimal("50000"))
                    .startDate(LocalDateTime.now().minusDays(1)).endDate(LocalDateTime.now().plusDays(1))
                    .usageLimit(10).build());
            voucherId = voucher.getVoucherId();
            return null;
        });
    }

    @Test
    void checkoutCommitsOrderStockVoucherPaymentAndCartTogether() {
        OrderDetailResponseDTO result = orderService.createOrder(EMAIL, request());

        assertNotNull(result.getOrderId());
        assertMoney("80000", result.getSubtotal());
        assertMoney("15000", result.getDiscountAmount());
        assertMoney("85000", result.getTotalCost());
        inTransaction(() -> {
            assertEquals(8, products.findById(firstProductId).orElseThrow().getStockQuantity());
            assertEquals(5, products.findById(secondProductId).orElseThrow().getStockQuantity());
            assertEquals(1, vouchers.findById(voucherId).orElseThrow().getUsedCount());
            assertEquals(0, carts.count());
            assertEquals(1, orders.count());
            assertEquals(2, orderItems.count());
            assertEquals(0, notifications.count());
            Payment payment = payments.findByOrder_OrderId(result.getOrderId()).orElseThrow();
            assertEquals("COD", payment.getPaymentMethod());
            assertEquals("PENDING", payment.getPaymentStatus());
            assertMoney("85000", payment.getAmount());
            return null;
        });
    }

    @Test
    void committedStatusChangesCreateTheExpectedNotificationTypes() {
        Long orderId = orderService.createOrder(EMAIL, request()).getOrderId();
        orderService.updateAdminOrderStatus(orderId, "CONFIRMED");
        orderService.updateAdminOrderStatus(orderId, "SHIPPING");
        orderService.updateAdminOrderStatus(orderId, "DELIVERED");
        inTransaction(() -> {
            var deliveredNotifications = notifications.findAll();
            assertEquals(3, deliveredNotifications.size());
            assertEquals(1, deliveredNotifications.stream()
                    .filter(n -> n.getType() == NotificationType.ORDER_CONFIRMED).count());
            assertEquals(2, deliveredNotifications.stream()
                    .filter(n -> n.getType() == NotificationType.STATUS_UPDATED).count());
            assertTrue(deliveredNotifications.stream().allMatch(n ->
                    n.getUser().getUserId().equals(userId) && !n.isRead()
                            && n.getOrder().getOrderId().equals(orderId)));

            User customer = users.findById(userId).orElseThrow();
            carts.saveAndFlush(CartItem.builder().user(customer)
                    .product(products.findById(firstProductId).orElseThrow()).quantity(1).build());
            return null;
        });
        CreateOrderRequestDTO secondRequest = request();
        secondRequest.setVoucherCode(null);
        Long cancelledId = orderService.createOrder(EMAIL, secondRequest).getOrderId();
        orderService.updateAdminOrderStatus(cancelledId, "CANCELLED");
        inTransaction(() -> {
            assertEquals(1, notifications.findAll().stream()
                    .filter(n -> n.getType() == NotificationType.ORDER_CANCELLED
                            && n.getOrder().getOrderId().equals(cancelledId)).count());
            return null;
        });
    }

    @Test
    void notificationDatabaseFailureCannotRollBackCommittedOrderStatus() {
        Long orderId = orderService.createOrder(EMAIL, request()).getOrderId();
        jdbc.execute("ALTER TABLE dbo.Notifications ADD CONSTRAINT RejectNotificationForIsolationTest CHECK (type = 'never')");
        try {
            assertDoesNotThrow(() -> orderService.updateAdminOrderStatus(orderId, "CONFIRMED"));
        } finally {
            jdbc.execute("ALTER TABLE dbo.Notifications DROP CONSTRAINT RejectNotificationForIsolationTest");
        }
        inTransaction(() -> {
            assertEquals("CONFIRMED", orders.findById(orderId).orElseThrow().getOrderStatus());
            assertEquals(0, notifications.count());
            return null;
        });
    }

    @Test
    void paymentInsertFailureRollsBackOrderStockVoucherAndCart() {
        // A real database constraint fails after the order and stock mutations.
        jdbc.execute("ALTER TABLE dbo.Payments ADD CONSTRAINT RejectPaymentForRollbackTest CHECK (amount < 0)");
        try {
            assertThrows(DataIntegrityViolationException.class,
                    () -> orderService.createOrder(EMAIL, request()));
        } finally {
            jdbc.execute("ALTER TABLE dbo.Payments DROP CONSTRAINT RejectPaymentForRollbackTest");
        }
        assertCheckoutStateUntouched();
    }

    @Test
    void insufficientStockLeavesAllCheckoutDataUnchanged() {
        inTransaction(() -> {
            Product second = products.findById(secondProductId).orElseThrow();
            second.setStockQuantity(2);
            products.saveAndFlush(second);
            return null;
        });

        assertThrows(BadRequestException.class, () -> orderService.createOrder(EMAIL, request()));
        inTransaction(() -> {
            assertEquals(10, products.findById(firstProductId).orElseThrow().getStockQuantity());
            assertEquals(2, products.findById(secondProductId).orElseThrow().getStockQuantity());
            assertEquals(0, vouchers.findById(voucherId).orElseThrow().getUsedCount());
            assertEquals(2, carts.count());
            assertEquals(0, orders.count());
            assertEquals(0, payments.count());
            return null;
        });
    }

    @Test
    void expiredVoucherLeavesAllCheckoutDataUnchanged() {
        inTransaction(() -> {
            Voucher voucher = vouchers.findById(voucherId).orElseThrow();
            voucher.setEndDate(LocalDateTime.now().minusMinutes(1));
            vouchers.saveAndFlush(voucher);
            return null;
        });

        assertThrows(BadRequestException.class, () -> orderService.createOrder(EMAIL, request()));
        assertCheckoutStateUntouched();
    }

    @Test
    void customerCancellationRestoresStockAndVoucherExactlyOnce() {
        Long orderId = orderService.createOrder(EMAIL, request()).getOrderId();
        orderService.cancelCustomerOrder(orderId, EMAIL);
        assertThrows(BadRequestException.class, () -> orderService.cancelCustomerOrder(orderId, EMAIL));

        inTransaction(() -> {
            assertEquals(10, products.findById(firstProductId).orElseThrow().getStockQuantity());
            assertEquals(8, products.findById(secondProductId).orElseThrow().getStockQuantity());
            assertEquals(0, vouchers.findById(voucherId).orElseThrow().getUsedCount());
            assertEquals("CANCELLED", orders.findById(orderId).orElseThrow().getOrderStatus());
            assertEquals("FAILED", payments.findByOrder_OrderId(orderId).orElseThrow().getPaymentStatus());
            return null;
        });
    }

    @Test
    void deliveredOwnOrderAllowsOneReviewAndPublicSummaryReflectsIt() {
        OrderDetailResponseDTO result = orderService.createOrder(EMAIL, request());
        orderService.updateAdminOrderStatus(result.getOrderId(), "CONFIRMED");
        orderService.updateAdminOrderStatus(result.getOrderId(), "SHIPPING");
        orderService.updateAdminOrderStatus(result.getOrderId(), "DELIVERED");
        Long itemId = result.getOrderItems().get(0).getOrderItemId();
        Long productId = result.getOrderItems().get(0).getProductId();

        var review = reviewService.createReview(EMAIL, new CreateReviewRequestDTO(itemId, 5, "Works very well"));
        assertEquals(itemId, review.getOrderItemId());
        assertThrows(DuplicateResourceException.class,
                () -> reviewService.createReview(EMAIL, new CreateReviewRequestDTO(itemId, 4, "Second review")));
        var summary = reviewService.getProductReviews(productId, 0, 10, "desc");
        assertEquals(1, summary.getReviewCount());
        assertEquals(5.0, summary.getAverageRating());
        assertEquals(1L, summary.getRatingDistribution().get(5));
    }

    @Test
    void pendingAndOtherCustomersCannotReviewPurchasedItem() {
        OrderDetailResponseDTO result = orderService.createOrder(EMAIL, request());
        Long itemId = result.getOrderItems().get(0).getOrderItemId();

        assertThrows(BadRequestException.class,
                () -> reviewService.createReview(EMAIL, new CreateReviewRequestDTO(itemId, 5, "Still pending")));
        assertThrows(ResourceNotFoundException.class,
                () -> reviewService.createReview("other@example.test", new CreateReviewRequestDTO(itemId, 5, "Not my item")));
        assertEquals(0, reviews.count());
    }

    @Test
    void databaseUniqueConstraintRejectsSecondReviewForSameOrderItem() {
        OrderDetailResponseDTO result = orderService.createOrder(EMAIL, request());
        orderService.updateAdminOrderStatus(result.getOrderId(), "CONFIRMED");
        orderService.updateAdminOrderStatus(result.getOrderId(), "SHIPPING");
        orderService.updateAdminOrderStatus(result.getOrderId(), "DELIVERED");
        Long itemId = result.getOrderItems().get(0).getOrderItemId();
        reviewService.createReview(EMAIL, new CreateReviewRequestDTO(itemId, 5, "Original review"));

        assertThrows(DataIntegrityViolationException.class, () -> inTransaction(() -> {
            OrderItem item = orderItems.findById(itemId).orElseThrow();
            return reviews.saveAndFlush(Review.builder().orderItem(item).user(users.findById(userId).orElseThrow())
                    .productId(item.getProductId()).rating(4).comment("Bypass service duplicate").build());
        }));
        assertEquals(1, reviews.count());
    }

    @Test
    void moderatedReviewDisappearsPubliclyButCannotBePostedAgain() {
        OrderDetailResponseDTO result = orderService.createOrder(EMAIL, request());
        orderService.updateAdminOrderStatus(result.getOrderId(), "CONFIRMED");
        orderService.updateAdminOrderStatus(result.getOrderId(), "SHIPPING");
        orderService.updateAdminOrderStatus(result.getOrderId(), "DELIVERED");
        Long itemId = result.getOrderItems().get(0).getOrderItemId();
        Long productId = result.getOrderItems().get(0).getProductId();
        var review = reviewService.createReview(EMAIL, new CreateReviewRequestDTO(itemId, 1, "Moderated review"));

        reviewService.deleteReview(review.getReviewId());

        var summary = reviewService.getProductReviews(productId, 0, 10, "desc");
        assertEquals(0, summary.getReviewCount());
        assertEquals(0, summary.getReviews().getTotalElements());
        assertEquals(0.0, summary.getAverageRating());
        assertTrue(summary.getRatingDistribution().values().stream().allMatch(count -> count == 0L));
        assertFalse(reviewService.checkEligibility(EMAIL, productId).isEligible());
        assertThrows(DuplicateResourceException.class,
                () -> reviewService.createReview(EMAIL, new CreateReviewRequestDTO(itemId, 5, "Reposted review")));
        inTransaction(() -> {
            Review stored = reviews.findById(review.getReviewId()).orElseThrow();
            assertTrue(stored.isHidden());
            assertEquals(itemId, stored.getOrderItem().getOrderItemId());
            assertTrue(reviews.existsByOrderItem_OrderItemId(itemId));
            return null;
        });
    }

    private CreateOrderRequestDTO request() {
        return CreateOrderRequestDTO.builder()
                .shippingAddress("123 Integration Street")
                .phone("0900000000").shippingMethod("STANDARD").paymentMethod("COD")
                .voucherCode("FLOW15K").build();
    }

    private void assertCheckoutStateUntouched() {
        inTransaction(() -> {
            assertEquals(10, products.findById(firstProductId).orElseThrow().getStockQuantity());
            assertEquals(8, products.findById(secondProductId).orElseThrow().getStockQuantity());
            assertEquals(0, vouchers.findById(voucherId).orElseThrow().getUsedCount());
            assertEquals(2, carts.count());
            assertEquals(0, orders.count());
            assertEquals(0, orderItems.count());
            assertEquals(0, payments.count());
            return null;
        });
    }

    private <T> T inTransaction(Supplier<T> work) {
        return transactions.execute(status -> work.get());
    }

    private void assertMoney(String expected, BigDecimal actual) {
        assertNotNull(actual);
        assertEquals(0, new BigDecimal(expected).compareTo(actual));
    }
}
