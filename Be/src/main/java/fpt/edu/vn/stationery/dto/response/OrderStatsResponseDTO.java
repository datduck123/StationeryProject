package fpt.edu.vn.stationery.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class OrderStatsResponseDTO {
    private long totalOrders;
    private long deliveredOrders;
    private long cancelledOrders;
    private BigDecimal deliveredRevenue;
}
