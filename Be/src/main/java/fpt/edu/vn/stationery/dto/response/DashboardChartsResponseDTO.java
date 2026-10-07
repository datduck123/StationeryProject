package fpt.edu.vn.stationery.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardChartsResponseDTO {
    private List<LowStockProductDTO> lowStockProducts;
    private List<OrderStatusCountDTO> orderStatusDistribution;
    private Map<String, Long> orderStatusCounts;
    private List<ChartDataPointDTO> weeklyChart;
    private List<ChartDataPointDTO> monthlyChart;
    private String selectedPeriod;
    private List<ChartDataPointDTO> chartData;
}
