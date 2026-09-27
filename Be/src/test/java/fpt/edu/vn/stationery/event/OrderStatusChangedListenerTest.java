package fpt.edu.vn.stationery.event;

import fpt.edu.vn.stationery.constant.NotificationType;
import fpt.edu.vn.stationery.service.impl.NotificationWriter;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderStatusChangedListenerTest {
    @Mock
    private NotificationWriter notificationWriter;

    @InjectMocks
    private OrderStatusChangedListener listener;

    @Test
    void confirmedOrderCreatesConfirmedNotification() {
        assertNotification("PENDING", "CONFIRMED", NotificationType.ORDER_CONFIRMED,
                "Đơn hàng #7 đã được xác nhận");
    }

    @Test
    void shippingOrderCreatesStatusNotification() {
        assertNotification("CONFIRMED", "SHIPPING", NotificationType.STATUS_UPDATED,
                "Đơn hàng #7 đã chuyển sang trạng thái đang giao");
    }

    @Test
    void deliveredOrderCreatesStatusNotification() {
        assertNotification("SHIPPING", "DELIVERED", NotificationType.STATUS_UPDATED,
                "Đơn hàng #7 đã chuyển sang trạng thái đã giao");
    }

    @Test
    void cancelledOrderCreatesCancelledNotification() {
        assertNotification("PENDING", "CANCELLED", NotificationType.ORDER_CANCELLED,
                "Đơn hàng #7 đã bị hủy");
    }

    @Test
    void notificationFailureDoesNotEscapeToOrderCaller() {
        doThrow(new IllegalStateException("notification storage unavailable"))
                .when(notificationWriter).create(any(), any(), anyString(), anyString());

        assertDoesNotThrow(() -> listener.onOrderStatusChanged(
                new OrderStatusChangedEvent(7L, "PENDING", "CONFIRMED", 12L)));
    }

    private void assertNotification(String before, String after, NotificationType type, String message) {
        OrderStatusChangedEvent event = new OrderStatusChangedEvent(7L, before, after, 12L);
        listener.onOrderStatusChanged(event);

        ArgumentCaptor<String> title = ArgumentCaptor.forClass(String.class);
        ArgumentCaptor<String> body = ArgumentCaptor.forClass(String.class);
        verify(notificationWriter).create(eq(event), eq(type), title.capture(), body.capture());
        assertEquals("Cập nhật đơn hàng #7", title.getValue());
        assertEquals(message, body.getValue());
    }
}
