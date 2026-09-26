package fpt.edu.vn.stationery.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class OrderDetailResponseDTO {
    private Long orderId;
    private Long userId;
    private String customerName;
    private String customerEmail;
    private Long voucherId;
    private BigDecimal subtotal;
    private BigDecimal discountAmount;
    private String shippingMethod;
    private BigDecimal totalWeight;
    private BigDecimal shippingFee;
    private BigDecimal totalCost;
    private String shippingAddress;
    private String phone;
    private String orderStatus;
    private String note;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<OrderItemResponseDTO> orderItems;
}
