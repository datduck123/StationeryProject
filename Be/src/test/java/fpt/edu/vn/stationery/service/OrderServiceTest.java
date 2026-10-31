package fpt.edu.vn.stationery.service;

import fpt.edu.vn.stationery.constant.ProductStatus;
import fpt.edu.vn.stationery.dto.response.OrderDetailResponseDTO;
import fpt.edu.vn.stationery.dto.response.PageDTO;
import fpt.edu.vn.stationery.entity.Order;
import fpt.edu.vn.stationery.entity.OrderItem;
import fpt.edu.vn.stationery.entity.Product;
import fpt.edu.vn.stationery.entity.User;
import fpt.edu.vn.stationery.event.OrderStatusChangedEvent;
import fpt.edu.vn.stationery.exception.BadRequestException;
import fpt.edu.vn.stationery.exception.ResourceNotFoundException;
import fpt.edu.vn.stationery.mapper.OrderMapper;
import fpt.edu.vn.stationery.repository.CartItemRepository;
import fpt.edu.vn.stationery.repository.PaymentRepository;
import fpt.edu.vn.stationery.repository.VoucherRepository;
import fpt.edu.vn.stationery.repository.OrderRepository;
import fpt.edu.vn.stationery.repository.ProductRepository;
import fpt.edu.vn.stationery.repository.UserRepository;
import fpt.edu.vn.stationery.service.impl.OrderServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private OrderMapper orderMapper;

    @Mock private CartItemRepository cartItemRepository;
    @Mock private VoucherRepository voucherRepository;
    @Mock private PaymentRepository paymentRepository;

    @Mock
    private ApplicationEventPublisher eventPublisher;

    @InjectMocks
    private OrderServiceImpl orderService;

    @Test
    void customerCanOnlyReadAnOrderBelongingToTheirEmail() {
        OrderDetailResponseDTO expected = OrderDetailResponseDTO.builder().orderId(7L).build();
        when(orderRepository.findWithOrderItemsByOrderIdAndUser_Email(7L, "buyer@example.com"))
                .thenReturn(Optional.of(new Order()));
        when(orderMapper.toDetailResponse(any(Order.class))).thenReturn(expected);

        assertSame(expected, orderService.getCustomerOrder(7L, "buyer@example.com"));
        verify(orderRepository).findWithOrderItemsByOrderIdAndUser_Email(7L, "buyer@example.com");
    }

    @Test
    void customerGetsNotFoundForAnOrderTheyDoNotOwn() {
        when(orderRepository.findWithOrderItemsByOrderIdAndUser_Email(7L, "buyer@example.com"))
                .thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> orderService.getCustomerOrder(7L, "buyer@example.com"));
    }

    @Test
    void rejectsInvalidPagination() {
        assertThrows(BadRequestException.class,
                () -> orderService.getCustomerOrders("buyer@example.com", -1, 10));
        assertThrows(BadRequestException.class,
                () -> orderService.getAllOrders(null, 0, 101));
    }

    @Test
    void adminStatusFilterIsTrimmedAndNormalized() {
        when(orderRepository.findByOrderStatus(eq("PENDING"), any()))
                .thenReturn(new PageImpl<>(List.of()));

        PageDTO<?> result = orderService.getAllOrders(" pending ", 0, 10);

        assertNotNull(result);
        verify(orderRepository).findByOrderStatus(eq("PENDING"), any());
    }

    @Test
    void adminCanSearchByOrderIdAndSortResults() {
        when(orderRepository.searchAdminOrders(eq("PENDING"), eq("#42"), eq(42L), any()))
                .thenReturn(new PageImpl<>(List.of()));

        orderService.getAllOrders(" pending ", " #42 ", 1, 10, "totalCost", "asc");

        ArgumentCaptor<Pageable> pageable = ArgumentCaptor.forClass(Pageable.class);
        verify(orderRepository).searchAdminOrders(eq("PENDING"), eq("#42"), eq(42L), pageable.capture());
        assertEquals(1, pageable.getValue().getPageNumber());
        assertTrue(pageable.getValue().getSort().getOrderFor("totalCost").isAscending());
    }

    @Test
    void adminRejectsUnsupportedStatusAndSort() {
        assertThrows(BadRequestException.class,
                () -> orderService.getAllOrders("INVALID", null, 0, 10, "createdAt", "desc"));
        assertThrows(BadRequestException.class,
                () -> orderService.getAllOrders(null, null, 0, 10, "user.passwordHash", "desc"));
    }

    @Test
    void customerCanCancelOnlyTheirPendingOrder_andRestoresStock() {
        User user = User.builder().userId(12L).email("buyer@example.com").build();
        Product product = Product.builder().productId(101L).stockQuantity(5).build();
        OrderItem item = OrderItem.builder().productId(101L).quantity(2).build();

        Order order = Order.builder()
                .orderId(7L)
                .orderStatus("PENDING")
                .user(user)
                .orderItems(new ArrayList<>(List.of(item)))
                .build();

        OrderDetailResponseDTO cancelled = OrderDetailResponseDTO.builder()
                .orderId(7L).orderStatus("CANCELLED").build();

        when(orderRepository.findForStatusUpdate(7L))
                .thenReturn(Optional.of(order));
        when(productRepository.findByIdForUpdate(101L)).thenReturn(Optional.of(product));
        when(orderRepository.saveAndFlush(any(Order.class))).thenReturn(order);
        when(orderMapper.toDetailResponse(any(Order.class))).thenReturn(cancelled);

        assertSame(cancelled, orderService.cancelCustomerOrder(7L, "buyer@example.com"));

        assertEquals("CANCELLED", order.getOrderStatus());
        assertEquals(7, product.getStockQuantity()); // 5 + 2 = 7 restored
        verify(productRepository).save(product);
        verify(eventPublisher).publishEvent(any(OrderStatusChangedEvent.class));
    }

    @Test
    void customerCannotCancelConfirmedOrder() {
        User user = User.builder().userId(12L).email("buyer@example.com").build();
        Order order = Order.builder()
                .orderId(7L)
                .orderStatus("CONFIRMED")
                .user(user)
                .build();

        when(orderRepository.findForStatusUpdate(7L))
                .thenReturn(Optional.of(order));

        assertThrows(BadRequestException.class,
                () -> orderService.cancelCustomerOrder(7L, "buyer@example.com"));
        verify(productRepository, never()).save(any());
    }

    @Test
    void adminConfirmationEmitsOrderEvent() {
        assertAdminTransition("PENDING", "CONFIRMED");
    }

    @Test
    void adminShippingUpdateEmitsOrderEvent() {
        assertAdminTransition("CONFIRMED", "SHIPPING");
    }

    @Test
    void adminCancellationEmitsOrderEvent() {
        assertAdminTransition("PENDING", "CANCELLED");
    }

    @Test
    void adminCannotChangeDeliveredOrder() {
        Order order = order("DELIVERED");
        when(orderRepository.findForStatusUpdate(7L)).thenReturn(Optional.of(order));
        assertThrows(BadRequestException.class,
                () -> orderService.updateAdminOrderStatus(7L, "CANCELLED"));
        verify(eventPublisher, never()).publishEvent(any());
    }

    private void assertAdminTransition(String before, String after) {
        Order order = order(before);
        when(orderRepository.findForStatusUpdate(7L)).thenReturn(Optional.of(order));
        when(orderRepository.saveAndFlush(order)).thenReturn(order);

        orderService.updateAdminOrderStatus(7L, after);

        assertEquals(after, order.getOrderStatus());
        ArgumentCaptor<OrderStatusChangedEvent> event =
                ArgumentCaptor.forClass(OrderStatusChangedEvent.class);
        verify(eventPublisher).publishEvent(event.capture());
        assertEquals(7L, event.getValue().orderId());
        assertEquals(12L, event.getValue().userId());
        assertEquals(before, event.getValue().oldStatus());
        assertEquals(after, event.getValue().newStatus());
    }

    private Order order(String status) {
        User user = new User();
        user.setUserId(12L);
        Order order = new Order();
        order.setOrderId(7L);
        order.setUser(user);
        order.setOrderStatus(status);
        return order;
    }
}
