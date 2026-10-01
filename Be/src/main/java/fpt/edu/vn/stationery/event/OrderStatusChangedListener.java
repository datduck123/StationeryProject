package fpt.edu.vn.stationery.event;

import fpt.edu.vn.stationery.constant.NotificationType;
import fpt.edu.vn.stationery.service.impl.NotificationWriter;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
@RequiredArgsConstructor
public class OrderStatusChangedListener {
    private static final Logger log = LoggerFactory.getLogger(OrderStatusChangedListener.class);
    private final NotificationWriter notificationWriter;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onOrderStatusChanged(OrderStatusChangedEvent event) {
        NotificationType type = switch (event.newStatus()) {
            case "CONFIRMED" -> NotificationType.ORDER_CONFIRMED;
            case "CANCELLED" -> NotificationType.ORDER_CANCELLED;
            default -> NotificationType.STATUS_UPDATED;
        };
        String message = switch (type) {
            case ORDER_CONFIRMED -> "Đơn hàng #" + event.orderId() + " đã được xác nhận";
            case ORDER_CANCELLED -> "Đơn hàng #" + event.orderId() + " đã bị hủy";
            case STATUS_UPDATED -> "Đơn hàng #" + event.orderId()
                    + " đã chuyển sang trạng thái " + switch (event.newStatus()) {
                        case "SHIPPING" -> "đang giao";
                        case "DELIVERED" -> "đã giao";
                        default -> event.newStatus();
                    };
        };
        try {
            notificationWriter.create(event, type, "Cập nhật đơn hàng #" + event.orderId(), message);
        } catch (Exception ex) {
            log.error("Could not create notification for order {} after status {} -> {}",
                    event.orderId(), event.oldStatus(), event.newStatus(), ex);
        }
    }
}
