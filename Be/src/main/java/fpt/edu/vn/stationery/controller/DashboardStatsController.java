package fpt.edu.vn.stationery.controller;

import fpt.edu.vn.stationery.dto.response.DashboardKpiResponseDTO;
import fpt.edu.vn.stationery.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin - Dashboard", description = "Admin Dashboard Analytics & KPIs")
@SecurityRequirement(name = "bearerAuth")
public class DashboardStatsController {

    private final DashboardService dashboardService;

    @Operation(summary = "Get admin dashboard KPI metrics (total users, products, orders, delivered revenue)")
    @GetMapping("/kpis")
    public ResponseEntity<DashboardKpiResponseDTO> getDashboardKpis() {
        return ResponseEntity.ok(dashboardService.getDashboardKpis());
    }
}
