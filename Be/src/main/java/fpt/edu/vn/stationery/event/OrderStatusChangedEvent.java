package fpt.edu.vn.stationery.event;

public record OrderStatusChangedEvent(Long orderId, String oldStatus, String newStatus, Long userId) {
}
