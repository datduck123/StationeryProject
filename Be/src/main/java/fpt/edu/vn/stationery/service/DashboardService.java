package fpt.edu.vn.stationery.service;

import fpt.edu.vn.stationery.dto.response.DashboardChartsResponseDTO;
import fpt.edu.vn.stationery.dto.response.DashboardKpiResponseDTO;

public interface DashboardService {
    DashboardKpiResponseDTO getDashboardKpis();
    DashboardChartsResponseDTO getDashboardCharts(String period);
}
