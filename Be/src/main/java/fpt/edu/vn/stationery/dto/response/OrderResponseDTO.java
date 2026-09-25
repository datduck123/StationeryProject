package fpt.edu.vn.stationery.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class OrderResponseDTO {
    private Long orderId;
    private Long userId;
    private String customerName;
    private String customerEmail;
    private String orderStatus;
    private BigDecimal totalCost;
    private LocalDateTime createdAt;
    private int itemCount;
}
