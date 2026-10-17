package fpt.edu.vn.stationery.controller;

import fpt.edu.vn.stationery.dto.response.DashboardChartsResponseDTO;
import fpt.edu.vn.stationery.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin - Dashboard Charts & Reports", description = "Admin Dashboard Reports: Low Stock Products, Order Status Distribution, Weekly & Monthly Charts")
@SecurityRequirement(name = "bearerAuth")
public class DashboardChartController {

    private final DashboardService dashboardService;

    @Operation(summary = "Get admin dashboard charts and reports (low stock products <= 5, order status statistics, weekly/monthly revenue & order trends)")
    @GetMapping("/charts")
    public ResponseEntity<DashboardChartsResponseDTO> getDashboardCharts(
            @RequestParam(required = false, defaultValue = "week") String period) {
        return ResponseEntity.ok(dashboardService.getDashboardCharts(period));
    }
}
