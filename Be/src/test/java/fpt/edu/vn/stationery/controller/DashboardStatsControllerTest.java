package fpt.edu.vn.stationery.controller;

import fpt.edu.vn.stationery.dto.response.DashboardKpiResponseDTO;
import fpt.edu.vn.stationery.service.DashboardService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class DashboardStatsControllerTest {

    @Mock
    private DashboardService dashboardService;

    @InjectMocks
    private DashboardStatsController dashboardStatsController;

    @Test
    void getDashboardKpis_Success() {
        DashboardKpiResponseDTO mockDto = DashboardKpiResponseDTO.builder()
                .totalUsers(100L)
                .totalProducts(50L)
                .totalOrders(30L)
                .totalRevenue(new BigDecimal("5000000.00"))
                .build();

        when(dashboardService.getDashboardKpis()).thenReturn(mockDto);

        ResponseEntity<DashboardKpiResponseDTO> response = dashboardStatsController.getDashboardKpis();

        assertNotNull(response);
        assertEquals(200, response.getStatusCode().value());
        assertEquals(mockDto, response.getBody());
    }
}
