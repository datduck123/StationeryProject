package fpt.edu.vn.stationery.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class OrderResponseDTO {
    private Long orderId;
    private String trackingCode;
    private Long userId;
    private String customerName;
    private String customerEmail;
    private String orderStatus;
    private BigDecimal totalCost;
    private LocalDateTime createdAt;
    private int itemCount;
    private String shippingMethod;
    private String phone;
    private Long voucherId;
    private String voucherCode;
    private BigDecimal discountAmount;
    private String paymentMethod;
    private String paymentStatus;
    private List<OrderItemResponseDTO> orderItems;
}
