package fpt.edu.vn.stationery.controller;

import fpt.edu.vn.stationery.dto.response.ChartDataPointDTO;
import fpt.edu.vn.stationery.dto.response.DashboardChartsResponseDTO;
import fpt.edu.vn.stationery.dto.response.LowStockProductDTO;
import fpt.edu.vn.stationery.dto.response.OrderStatusCountDTO;
import fpt.edu.vn.stationery.service.DashboardService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class DashboardChartControllerTest {

    @Mock
    private DashboardService dashboardService;

    @InjectMocks
    private DashboardChartController dashboardChartController;

    @Test
    void getDashboardCharts_Success() {
        LowStockProductDTO lowStockProduct = LowStockProductDTO.builder()
                .productId(1L)
                .name("Notebook")
                .sku("NB-01")
                .price(new BigDecimal("10.00"))
                .stock(2)
                .categoryName("Paper")
                .brandName("Campus")
                .status("ACTIVE")
                .build();

        OrderStatusCountDTO statusCount = OrderStatusCountDTO.builder()
                .status("DELIVERED")
                .count(10L)
                .percentage(100.0)
                .build();

        ChartDataPointDTO chartPoint = ChartDataPointDTO.builder()
                .label("Mon, Oct 05")
                .date("2026-10-05")
                .orders(5L)
                .deliveredOrders(4L)
                .revenue(new BigDecimal("200.00"))
                .build();

        DashboardChartsResponseDTO mockDto = DashboardChartsResponseDTO.builder()
                .lowStockProducts(List.of(lowStockProduct))
                .orderStatusDistribution(List.of(statusCount))
                .orderStatusCounts(Map.of("DELIVERED", 10L))
                .weeklyChart(List.of(chartPoint))
                .monthlyChart(List.of(chartPoint))
                .selectedPeriod("week")
                .chartData(List.of(chartPoint))
                .build();

        when(dashboardService.getDashboardCharts("week")).thenReturn(mockDto);

        ResponseEntity<DashboardChartsResponseDTO> response = dashboardChartController.getDashboardCharts("week");

        assertNotNull(response);
        assertEquals(200, response.getStatusCode().value());
        assertEquals(mockDto, response.getBody());
    }
}
