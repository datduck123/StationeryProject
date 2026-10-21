package fpt.edu.vn.stationery.service;

import fpt.edu.vn.stationery.constant.ProductStatus;
import fpt.edu.vn.stationery.constant.UserStatus;
import fpt.edu.vn.stationery.dto.request.CreateOrderRequestDTO;
import fpt.edu.vn.stationery.entity.*;
import fpt.edu.vn.stationery.exception.AccountLockedException;
import fpt.edu.vn.stationery.exception.BadRequestException;
import fpt.edu.vn.stationery.exception.ResourceNotFoundException;
import fpt.edu.vn.stationery.mapper.OrderMapper;
import fpt.edu.vn.stationery.repository.*;
import fpt.edu.vn.stationery.service.impl.OrderServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.dao.DataIntegrityViolationException;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderTransactionTest {
    @Mock OrderRepository orderRepository;
    @Mock ProductRepository productRepository;
    @Mock UserRepository userRepository;
    @Mock CartItemRepository cartItemRepository;
    @Mock VoucherRepository voucherRepository;
    @Mock PaymentRepository paymentRepository;
    @Mock OrderMapper orderMapper;
    @Mock ApplicationEventPublisher eventPublisher;
    @InjectMocks OrderServiceImpl service;
    private User user;
    private Product product;
    private CartItem cartItem;

    @BeforeEach
    void setup() {
        user = User.builder().userId(12L).email("buyer@example.com").status(UserStatus.ACTIVE).build();
        product = Product.builder().productId(101L).name("Notebook").status(ProductStatus.ACTIVE)
                .price(new BigDecimal("25000")).weightKg(new BigDecimal("0.2")).stockQuantity(10).build();
        cartItem = CartItem.builder().cartItemId(1L).user(user).product(product).quantity(3).build();
    }

    @Test
    void createsFromServerCartConsumesVoucherAndClearsCartWithoutPendingNotification() {
        checkoutReady();
        Voucher voucher = voucher();
        when(voucherRepository.findByCodeForUpdate("SAVE15")).thenReturn(Optional.of(voucher));
        when(orderRepository.saveAndFlush(any())).thenAnswer(inv -> {
            Order order = inv.getArgument(0); order.setOrderId(99L); return order;
        });
        CreateOrderRequestDTO request = request(); request.setVoucherCode("SAVE15");
        service.createOrder(user.getEmail(), request);
        ArgumentCaptor<Order> order = ArgumentCaptor.forClass(Order.class);
        verify(orderRepository).saveAndFlush(order.capture());
        assertEquals(new BigDecimal("75000"), order.getValue().getSubtotal());
        assertEquals(new BigDecimal("15000"), order.getValue().getDiscountAmount());
        assertEquals(new BigDecimal("80000"), order.getValue().getTotalCost());
        assertEquals(new BigDecimal("0.6"), order.getValue().getTotalWeight());
        assertEquals(7, product.getStockQuantity());
        assertEquals(1, voucher.getUsedCount());
        ArgumentCaptor<Payment> payment = ArgumentCaptor.forClass(Payment.class);
        verify(paymentRepository).saveAndFlush(payment.capture());
        assertEquals("PENDING", payment.getValue().getPaymentStatus());
        assertEquals("COD", payment.getValue().getPaymentMethod());
        verify(cartItemRepository).deleteAll(List.of(cartItem));
        verifyNoInteractions(eventPublisher);
    }

    @Test
    void refusesEmptyCart() {
        when(userRepository.findByEmailForUpdate(user.getEmail())).thenReturn(Optional.of(user));
        when(cartItemRepository.findAllForCheckout(12L)).thenReturn(List.of());
        assertThrows(BadRequestException.class, () -> service.createOrder(user.getEmail(), request()));
        verifyNoInteractions(productRepository, orderRepository, paymentRepository);
    }

    @Test
    void refusesBlockedCustomerBeforeLoadingCart() {
        user.setStatus(UserStatus.BLOCKED);
        when(userRepository.findByEmailForUpdate(user.getEmail())).thenReturn(Optional.of(user));
        assertThrows(AccountLockedException.class, () -> service.createOrder(user.getEmail(), request()));
        verifyNoInteractions(cartItemRepository, productRepository, orderRepository);
    }

    @Test
    void insufficientStockDoesNotWriteOrderOrClearCart() {
        checkoutReady(); product.setStockQuantity(2);
        assertThrows(BadRequestException.class, () -> service.createOrder(user.getEmail(), request()));
        assertEquals(2, product.getStockQuantity());
        verify(productRepository, never()).save(any());
        verifyNoInteractions(orderRepository, paymentRepository);
        verify(cartItemRepository, never()).deleteAll(any());
    }

    @Test
    void exhaustedVoucherLeavesStockUnchanged() {
        checkoutReady(); Voucher voucher = voucher(); voucher.setUsedCount(voucher.getUsageLimit());
        when(voucherRepository.findByCodeForUpdate("SAVE15")).thenReturn(Optional.of(voucher));
        CreateOrderRequestDTO request = request(); request.setVoucherCode("SAVE15");
        assertThrows(BadRequestException.class, () -> service.createOrder(user.getEmail(), request));
        assertEquals(10, product.getStockQuantity());
        verify(productRepository, never()).save(any());
        verifyNoInteractions(orderRepository, paymentRepository);
    }

    @Test
    void paymentFailurePropagatesToTransactionAndDoesNotClearCart() {
        checkoutReady();
        when(orderRepository.saveAndFlush(any())).thenAnswer(inv -> inv.getArgument(0));
        when(paymentRepository.saveAndFlush(any())).thenThrow(new DataIntegrityViolationException("database failure"));
        assertThrows(DataIntegrityViolationException.class, () -> service.createOrder(user.getEmail(), request()));
        verify(cartItemRepository, never()).deleteAll(any());
        verifyNoInteractions(eventPublisher);
    }

    @Test
    void cancellationRestoresStockVoucherAndFailsPendingPaymentOnlyOnce() {
        Order order = order("PENDING"); order.setVoucherId(9L);
        order.addOrderItem(OrderItem.builder().productId(101L).quantity(3).build());
        when(orderRepository.findForStatusUpdate(7L)).thenReturn(Optional.of(order));
        when(productRepository.findByIdForUpdate(101L)).thenReturn(Optional.of(product));
        Voucher voucher = voucher(); voucher.setUsedCount(1);
        when(voucherRepository.findByIdForUpdate(9L)).thenReturn(Optional.of(voucher));
        Payment payment = Payment.builder().order(order).paymentMethod("COD").paymentStatus("PENDING").build();
        when(paymentRepository.findByOrderIdForUpdate(7L)).thenReturn(Optional.of(payment));
        service.cancelCustomerOrder(7L, user.getEmail());
        assertEquals(13, product.getStockQuantity());
        assertEquals(0, voucher.getUsedCount());
        assertEquals("FAILED", payment.getPaymentStatus());
        assertThrows(BadRequestException.class, () -> service.cancelCustomerOrder(7L, user.getEmail()));
        verify(productRepository, times(1)).save(product);
    }

    @Test
    void customerCannotCancelAnotherCustomersOrder() {
        when(orderRepository.findForStatusUpdate(7L)).thenReturn(Optional.of(order("PENDING")));
        assertThrows(ResourceNotFoundException.class, () -> service.cancelCustomerOrder(7L, "other@example.com"));
        verifyNoInteractions(paymentRepository, productRepository, eventPublisher);
    }

    @Test
    void paidOrderRequiresRefundBeforeCancellation() {
        Order order = order("PENDING");
        when(orderRepository.findForStatusUpdate(7L)).thenReturn(Optional.of(order));
        when(paymentRepository.findByOrderIdForUpdate(7L)).thenReturn(Optional.of(Payment.builder()
                .paymentMethod("ONLINE").paymentStatus("SUCCESS").build()));
        assertThrows(BadRequestException.class, () -> service.cancelCustomerOrder(7L, user.getEmail()));
        assertEquals("PENDING", order.getOrderStatus());
        verifyNoInteractions(productRepository, eventPublisher);
    }

    @Test
    void deliveredCodPaymentIsCollected() {
        Order order = order("SHIPPING");
        Payment payment = Payment.builder().paymentMethod("COD").paymentStatus("PENDING").build();
        when(orderRepository.findForStatusUpdate(7L)).thenReturn(Optional.of(order));
        when(paymentRepository.findByOrderIdForUpdate(7L)).thenReturn(Optional.of(payment));
        service.updateAdminOrderStatus(7L, "DELIVERED");
        assertEquals("SUCCESS", payment.getPaymentStatus());
        assertNotNull(payment.getPaidAt());
    }

    @Test
    void deliveredOnlineOrderDoesNotPretendGatewayPaymentSucceeded() {
        Order order = order("SHIPPING");
        Payment payment = Payment.builder().paymentMethod("ONLINE").paymentStatus("PENDING").build();
        when(orderRepository.findForStatusUpdate(7L)).thenReturn(Optional.of(order));
        when(paymentRepository.findByOrderIdForUpdate(7L)).thenReturn(Optional.of(payment));
        service.updateAdminOrderStatus(7L, "DELIVERED");
        assertEquals("PENDING", payment.getPaymentStatus());
        verify(paymentRepository, never()).saveAndFlush(any());
    }

    private void checkoutReady() {
        when(userRepository.findByEmailForUpdate(user.getEmail())).thenReturn(Optional.of(user));
        when(cartItemRepository.findAllForCheckout(12L)).thenReturn(List.of(cartItem));
        when(productRepository.findByIdForUpdate(101L)).thenReturn(Optional.of(product));
    }
    private CreateOrderRequestDTO request() {
        return CreateOrderRequestDTO.builder().shippingAddress("123 Street").phone("0901234567")
                .shippingMethod("STANDARD").paymentMethod("COD").build();
    }
    private Voucher voucher() {
        return Voucher.builder().voucherId(9L).code("SAVE15").discountAmount(new BigDecimal("15000"))
                .minOrderAmount(BigDecimal.ZERO).startDate(LocalDateTime.now().minusDays(1))
                .endDate(LocalDateTime.now().plusDays(1)).usageLimit(2).usedCount(0).status("ACTIVE").build();
    }
    private Order order(String status) {
        return Order.builder().orderId(7L).user(user).orderStatus(status).build();
    }
}
