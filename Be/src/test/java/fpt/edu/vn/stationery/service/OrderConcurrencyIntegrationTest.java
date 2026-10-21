package fpt.edu.vn.stationery.service;

import fpt.edu.vn.stationery.dto.request.CreateOrderRequestDTO;
import fpt.edu.vn.stationery.entity.*;
import fpt.edu.vn.stationery.exception.BadRequestException;
import fpt.edu.vn.stationery.mapper.OrderMapper;
import fpt.edu.vn.stationery.repository.*;
import fpt.edu.vn.stationery.service.impl.OrderServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.Import;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.Callable;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest(showSql = false, properties = {
        "spring.datasource.url=jdbc:h2:mem:order-concurrency;MODE=MSSQLServer;DB_CLOSE_DELAY=-1;LOCK_TIMEOUT=10000;INIT=CREATE SCHEMA IF NOT EXISTS dbo"
})
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Import({OrderServiceImpl.class, OrderMapper.class})
@Transactional(propagation = Propagation.NOT_SUPPORTED)
class OrderConcurrencyIntegrationTest {
    @Autowired OrderService service;
    @Autowired PlatformTransactionManager transactionManager;
    @Autowired UserRepository users;
    @Autowired BrandRepository brands;
    @Autowired CategoryRepository categories;
    @Autowired ProductRepository products;
    @Autowired CartItemRepository carts;
    @Autowired OrderRepository orders;
    @Autowired OrderItemRepository items;
    @Autowired PaymentRepository payments;
    @Autowired VoucherRepository vouchers;

    private Long productId;
    private Long otherProductId;
    private Long voucherId;
    private Long secondUserId;

    @BeforeEach
    void seed() {
        new TransactionTemplate(transactionManager).executeWithoutResult(status -> {
            payments.deleteAllInBatch();
            items.deleteAllInBatch();
            orders.deleteAllInBatch();
            carts.deleteAllInBatch();
            vouchers.deleteAllInBatch();
            products.deleteAllInBatch();
            users.deleteAllInBatch();
            brands.deleteAllInBatch();
            categories.deleteAllInBatch();
            Brand brand = brands.saveAndFlush(Brand.builder().name("Concurrency brand").build());
            Category category = categories.saveAndFlush(Category.builder().name("Concurrency category").build());
            Product product = products.saveAndFlush(Product.builder().sku("RACE-PEN").name("Pen")
                    .brand(brand).category(category).price(new BigDecimal("10000"))
                    .weightKg(new BigDecimal("0.100")).stockQuantity(3).build());
            Product other = products.saveAndFlush(Product.builder().sku("RACE-BOOK").name("Book")
                    .brand(brand).category(category).price(new BigDecimal("15000"))
                    .weightKg(new BigDecimal("0.200")).stockQuantity(3).build());
            productId = product.getProductId();
            otherProductId = other.getProductId();
            for (String email : List.of("first@race.test", "second@race.test")) {
                User customer = users.saveAndFlush(User.builder().email(email)
                        .fullName(email).passwordHash("test-only-hash").build());
                carts.saveAndFlush(CartItem.builder().user(customer).product(product).quantity(2).build());
                if (email.startsWith("second")) secondUserId = customer.getUserId();
            }
            voucherId = vouchers.saveAndFlush(Voucher.builder().code("LAST-USE")
                    .discountAmount(new BigDecimal("1000")).minOrderAmount(BigDecimal.ZERO)
                    .startDate(LocalDateTime.now().minusDays(1)).endDate(LocalDateTime.now().plusDays(1))
                    .usageLimit(1).build()).getVoucherId();
        });
    }

    @Test
    void differentCustomersCannotOversellTheLastStock() throws Exception {
        List<Boolean> results = race(
                () -> checkout("first@race.test", null),
                () -> checkout("second@race.test", null));
        assertEquals(1, results.stream().filter(Boolean::booleanValue).count());
        assertEquals(1, products.findById(productId).orElseThrow().getStockQuantity());
        assertEquals(1, orders.count());
        assertEquals(1, payments.count());
        assertEquals(1, carts.count(), "The losing customer's cart must remain intact");
    }

    @Test
    void differentProductsCannotConsumeTheLastVoucherTwice() throws Exception {
        new TransactionTemplate(transactionManager).executeWithoutResult(status -> {
            CartItem secondCart = carts.findByUser_UserIdOrderByCartItemIdAsc(secondUserId).getFirst();
            secondCart.setProduct(products.getReferenceById(otherProductId));
            carts.saveAndFlush(secondCart);
        });
        List<Boolean> results = race(
                () -> checkout("first@race.test", "LAST-USE"),
                () -> checkout("second@race.test", "LAST-USE"));
        assertEquals(1, results.stream().filter(Boolean::booleanValue).count());
        assertEquals(1, vouchers.findById(voucherId).orElseThrow().getUsedCount());
        assertEquals(4, products.findById(productId).orElseThrow().getStockQuantity()
                + products.findById(otherProductId).orElseThrow().getStockQuantity());
        assertEquals(1, orders.count());
        assertEquals(1, carts.count());
    }

    @Test
    void twoClicksCannotCreateTwoOrdersFromTheSameCart() throws Exception {
        List<Boolean> results = race(
                () -> checkout("first@race.test", null),
                () -> checkout("first@race.test", null));
        assertEquals(1, results.stream().filter(Boolean::booleanValue).count());
        assertEquals(1, orders.count());
        assertEquals(1, payments.count());
        assertEquals(1, products.findById(productId).orElseThrow().getStockQuantity());
    }

    @Test
    void concurrentCancellationRestoresStockAndVoucherOnlyOnce() throws Exception {
        Long orderId = service.createOrder("first@race.test", request("LAST-USE")).getOrderId();
        List<Boolean> results = race(
                () -> cancel(orderId),
                () -> cancel(orderId));
        assertEquals(1, results.stream().filter(Boolean::booleanValue).count());
        assertEquals(3, products.findById(productId).orElseThrow().getStockQuantity());
        assertEquals(0, vouchers.findById(voucherId).orElseThrow().getUsedCount());
        assertEquals("CANCELLED", orders.findById(orderId).orElseThrow().getOrderStatus());
    }

    private boolean checkout(String email, String voucher) {
        try {
            service.createOrder(email, request(voucher));
            return true;
        } catch (BadRequestException expected) {
            return false;
        }
    }

    private boolean cancel(Long orderId) {
        try {
            service.cancelCustomerOrder(orderId, "first@race.test");
            return true;
        } catch (BadRequestException expected) {
            return false;
        }
    }

    private CreateOrderRequestDTO request(String voucher) {
        return CreateOrderRequestDTO.builder().shippingAddress("123 Test Street")
                .phone("0900000000").shippingMethod("STANDARD").paymentMethod("COD")
                .voucherCode(voucher).build();
    }

    private List<Boolean> race(Callable<Boolean> first, Callable<Boolean> second) throws Exception {
        CountDownLatch start = new CountDownLatch(1);
        try (var pool = Executors.newFixedThreadPool(2)) {
            var firstResult = pool.submit(() -> { start.await(); return first.call(); });
            var secondResult = pool.submit(() -> { start.await(); return second.call(); });
            start.countDown();
            return List.of(firstResult.get(20, TimeUnit.SECONDS), secondResult.get(20, TimeUnit.SECONDS));
        }
    }
}
