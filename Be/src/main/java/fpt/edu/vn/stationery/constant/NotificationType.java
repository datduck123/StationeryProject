package fpt.edu.vn.stationery.constant;

public enum NotificationType {
    ORDER_CONFIRMED("order_confirmed"),
    STATUS_UPDATED("status_updated"),
    ORDER_CANCELLED("order_cancelled");

    private final String code;

    NotificationType(String code) {
        this.code = code;
    }

    public String getCode() {
        return code;
    }

    public static NotificationType fromCode(String code) {
        for (NotificationType type : values()) {
            if (type.code.equals(code)) return type;
        }
        throw new IllegalArgumentException("Unknown notification type: " + code);
    }
}
