package fpt.edu.vn.stationery.service;

import fpt.edu.vn.stationery.constant.NotificationType;
import fpt.edu.vn.stationery.entity.Notification;
import fpt.edu.vn.stationery.entity.Order;
import fpt.edu.vn.stationery.exception.ResourceNotFoundException;
import fpt.edu.vn.stationery.repository.NotificationRepository;
import fpt.edu.vn.stationery.service.impl.NotificationServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {
    @Mock
    NotificationRepository notificationRepository;

    @InjectMocks
    NotificationServiceImpl notificationService;

    @Test
    void listsOnlyTheSignedInUsersUnreadNotifications() {
        when(notificationRepository.findByUser_EmailAndRead(
                org.mockito.ArgumentMatchers.eq("buyer@example.com"),
                org.mockito.ArgumentMatchers.eq(false), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(notification())));

        var page = notificationService.getMyNotifications("buyer@example.com", false, 0, 10);

        assertEquals(1, page.getContent().size());
        assertEquals(7L, page.getContent().get(0).getOrderId());
        assertEquals("order_confirmed", page.getContent().get(0).getType());
        assertFalse(page.getContent().get(0).getIsRead());
    }

    @Test
    void marksOnlyOwnedNotificationAsRead() {
        Notification notification = notification();
        when(notificationRepository.findByIdAndUser_Email(3L, "buyer@example.com"))
                .thenReturn(Optional.of(notification));

        var response = notificationService.markAsRead(3L, "buyer@example.com");

        assertTrue(response.getIsRead());
        assertTrue(notification.isRead());
        verify(notificationRepository).findByIdAndUser_Email(3L, "buyer@example.com");
    }

    @Test
    void cannotReadSomeoneElsesNotification() {
        when(notificationRepository.findByIdAndUser_Email(3L, "other@example.com"))
                .thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class,
                () -> notificationService.markAsRead(3L, "other@example.com"));
    }

    private Notification notification() {
        Order order = new Order();
        order.setOrderId(7L);
        Notification notification = new Notification();
        notification.setId(3L);
        notification.setOrder(order);
        notification.setType(NotificationType.ORDER_CONFIRMED);
        notification.setTitle("Cập nhật đơn hàng #7");
        notification.setMessage("Đơn hàng #7 đã được xác nhận");
        return notification;
    }
}
