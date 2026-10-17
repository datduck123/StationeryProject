package fpt.edu.vn.stationery.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChartDataPointDTO {
    private String label;
    private String date;
    private Long orders;
    private Long deliveredOrders;
    private BigDecimal revenue;
    private Long newUsers;
    private Long users;
}
