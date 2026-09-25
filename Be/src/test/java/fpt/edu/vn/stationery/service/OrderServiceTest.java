package fpt.edu.vn.stationery.service;

import fpt.edu.vn.stationery.dto.response.OrderDetailResponseDTO;
import fpt.edu.vn.stationery.dto.response.PageDTO;
import fpt.edu.vn.stationery.entity.Order;
import fpt.edu.vn.stationery.exception.BadRequestException;
import fpt.edu.vn.stationery.exception.ResourceNotFoundException;
import fpt.edu.vn.stationery.mapper.OrderMapper;
import fpt.edu.vn.stationery.repository.OrderRepository;
import fpt.edu.vn.stationery.service.impl.OrderServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private OrderMapper orderMapper;

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
    void customerCanCancelOnlyTheirPendingOrder() {
        OrderDetailResponseDTO cancelled = OrderDetailResponseDTO.builder()
                .orderId(7L).orderStatus("CANCELLED").build();
        when(orderRepository.cancelPendingOrder(7L, "buyer@example.com")).thenReturn(1);
        when(orderRepository.findWithOrderItemsByOrderIdAndUser_Email(7L, "buyer@example.com"))
                .thenReturn(Optional.of(new Order()));
        when(orderMapper.toDetailResponse(any(Order.class))).thenReturn(cancelled);

        assertSame(cancelled, orderService.cancelCustomerOrder(7L, "buyer@example.com"));
        verify(orderRepository).cancelPendingOrder(7L, "buyer@example.com");
    }

    @Test
    void customerCannotCancelConfirmedOrder() {
        when(orderRepository.findWithOrderItemsByOrderIdAndUser_Email(7L, "buyer@example.com"))
                .thenReturn(Optional.of(new Order()));
        when(orderMapper.toDetailResponse(any(Order.class))).thenReturn(
                OrderDetailResponseDTO.builder().orderStatus("CONFIRMED").build());

        assertThrows(BadRequestException.class,
                () -> orderService.cancelCustomerOrder(7L, "buyer@example.com"));
    }
}
