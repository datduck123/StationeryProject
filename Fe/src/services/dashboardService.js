import api from "./api";

/**
 * Fetch KPI metrics for admin dashboard:
 * - totalUsers
 * - totalProducts
 * - totalOrders
 * - totalRevenue
 */
export const getDashboardKpis = async () => {
  const response = await api.get("/admin/dashboard/kpis");
  return response.data;
};

/**
 * Fetch chart & report data for admin dashboard:
 * - lowStockProducts (stock <= 5)
 * - orderStatusDistribution
 * - weeklyChart (7 days)
 * - monthlyChart (6 months)
 */
export const getDashboardCharts = async (period = "week") => {
  const response = await api.get("/admin/dashboard/charts", {
    params: { period },
  });
  return response.data;
};

export default {
  getDashboardKpis,
  getDashboardCharts,
};
