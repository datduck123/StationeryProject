package fpt.edu.vn.stationery.service.impl;

import fpt.edu.vn.stationery.constant.NotificationType;
import fpt.edu.vn.stationery.entity.Notification;
import fpt.edu.vn.stationery.entity.Order;
import fpt.edu.vn.stationery.entity.User;
import fpt.edu.vn.stationery.event.OrderStatusChangedEvent;
import fpt.edu.vn.stationery.repository.NotificationRepository;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class NotificationWriter {
    private final NotificationRepository notificationRepository;
    private final EntityManager entityManager;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void create(OrderStatusChangedEvent event, NotificationType type, String title, String message) {
        Notification notification = new Notification();
        notification.setUser(entityManager.getReference(User.class, event.userId()));
        notification.setOrder(entityManager.getReference(Order.class, event.orderId()));
        notification.setType(type);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setRead(false);
        notificationRepository.saveAndFlush(notification);
    }
}
