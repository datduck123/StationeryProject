package fpt.edu.vn.stationery.service;

import fpt.edu.vn.stationery.constant.NotificationType;
import fpt.edu.vn.stationery.entity.Notification;
import fpt.edu.vn.stationery.entity.Order;
import fpt.edu.vn.stationery.entity.User;
import fpt.edu.vn.stationery.event.OrderStatusChangedEvent;
import fpt.edu.vn.stationery.repository.NotificationRepository;
import fpt.edu.vn.stationery.service.impl.NotificationWriter;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationWriterTest {
    @Mock NotificationRepository repository;
    @Mock EntityManager entityManager;
    @InjectMocks NotificationWriter writer;

    @Test
    void persistsNotificationForTheOrderOwner() {
        User user = new User();
        user.setUserId(12L);
        Order order = new Order();
        order.setOrderId(7L);
        when(entityManager.getReference(User.class, 12L)).thenReturn(user);
        when(entityManager.getReference(Order.class, 7L)).thenReturn(order);

        writer.create(new OrderStatusChangedEvent(7L, "PENDING", "CONFIRMED", 12L),
                NotificationType.ORDER_CONFIRMED, "Order title", "Order message");

        ArgumentCaptor<Notification> saved = ArgumentCaptor.forClass(Notification.class);
        verify(repository).saveAndFlush(saved.capture());
        assertSame(user, saved.getValue().getUser());
        assertSame(order, saved.getValue().getOrder());
        assertEquals(NotificationType.ORDER_CONFIRMED, saved.getValue().getType());
        assertEquals("Order title", saved.getValue().getTitle());
        assertEquals("Order message", saved.getValue().getMessage());
        assertFalse(saved.getValue().isRead());
    }
}
