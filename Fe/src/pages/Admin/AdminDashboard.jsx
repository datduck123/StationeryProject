import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../providers/AuthContext";
import KpiSummarySection from "../../components/admin/KpiSummarySection";
import RevenueChart from "../../components/admin/RevenueChart";
import OrderStatusChart from "../../components/admin/OrderStatusChart";
import LowStockTable from "../../components/admin/LowStockTable";
import RecentOrdersTable from "../../components/admin/RecentOrdersTable";
import { getDashboardKpis, getDashboardCharts } from "../../services/dashboardService";
import orderService from "../../services/orderService";
import "../../styles/admin.css";

export const AdminDashboard = () => {
  const { user } = useAuth();
  const [dateFilter, setDateFilter] = useState("7d");

  // KPI State
  const [kpiData, setKpiData] = useState(null);
  const [kpiLoading, setKpiLoading] = useState(true);
  const [kpiError, setKpiError] = useState(null);

  // Charts & Reports State
  const [chartData, setChartData] = useState(null);
  const [chartLoading, setChartLoading] = useState(true);

  // Recent Orders State
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentOrdersLoading, setRecentOrdersLoading] = useState(true);

  // Fetch KPI data
  const fetchKpis = async () => {
    try {
      setKpiLoading(true);
      setKpiError(null);
      const data = await getDashboardKpis();
      setKpiData(data);
    } catch (err) {
      console.error("Failed to load dashboard KPIs:", err);
      setKpiError(err.response?.data?.message || "Không thể kết nối đến máy chủ.");
    } finally {
      setKpiLoading(false);
    }
  };

  // Fetch Chart & Low Stock data
  const fetchCharts = async (period) => {
    try {
      setChartLoading(true);
      const data = await getDashboardCharts(period);
      setChartData(data);
    } catch (err) {
      console.error("Failed to load dashboard chart data:", err);
    } finally {
      setChartLoading(false);
    }
  };

  // Fetch Recent Orders (pending & newest)
  const fetchRecentOrders = async () => {
    try {
      setRecentOrdersLoading(true);
      const response = await orderService.getOrders({
        page: 0,
        size: 8,
        sortBy: "createdAt",
        sortDir: "desc",
      });
      // Handle PageDTO or raw array
      const orderList = response?.content || (Array.isArray(response) ? response : []);
      setRecentOrders(orderList);
    } catch (err) {
      console.error("Failed to load recent orders:", err);
    } finally {
      setRecentOrdersLoading(false);
    }
  };

  const handleRefreshAll = () => {
    fetchKpis();
    fetchCharts(dateFilter);
    fetchRecentOrders();
  };

  const handleOrderUpdated = () => {
    fetchRecentOrders();
    fetchKpis();
    fetchCharts(dateFilter);
  };

  useEffect(() => {
    fetchKpis();
    fetchRecentOrders();
  }, []);

  useEffect(() => {
    fetchCharts(dateFilter);
  }, [dateFilter]);

  // Chart data source based on period (7d / 30d / year)
  const activeChartData = React.useMemo(() => {
    if (dateFilter === "30d") {
      return chartData?.thirtyDaysChart || chartData?.chartData || [];
    }
    if (dateFilter === "year") {
      return chartData?.yearlyChart || chartData?.monthlyChart || chartData?.chartData || [];
    }
    return chartData?.sevenDaysChart || chartData?.weeklyChart || chartData?.chartData || [];
  }, [chartData, dateFilter]);

  // Low stock products alert items
  const lowStockItems = chartData?.lowStockProducts || [];

  return (
    <div className="p-4">
      {/* Welcome Banner */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h3 className="admin-page-title mb-1 fw-700 medium-black">
            Stationery Tales CMS Overview
          </h3>
          <p className="admin-page-desc text-muted fs-14 mb-0">
            Welcome back, <strong>{user?.fullName || "Administrator"}</strong>.
            Here is your store's live commercial metrics, orders, and catalog status.
          </p>
        </div>

        <div className="d-flex align-items-center gap-2">
          <button
            type="button"
            className="btn btn-sm btn-white border rounded-pill px-3 shadow-sm text-muted fw-600 fs-12"
            onClick={handleRefreshAll}
            title="Làm mới toàn bộ dữ liệu dashboard"
          >
            <i
              className={`fa-solid fa-rotate-right me-1 ${kpiLoading || chartLoading || recentOrdersLoading ? "fa-spin" : ""
                }`}
            ></i>
            Làm mới
          </button>
        </div>
      </div>

      {/* 4 Metric Stats Cards (Doanh thu, Đơn hàng, Khách hàng, Sản phẩm) */}
      <KpiSummarySection
        kpis={kpiData}
        loading={kpiLoading}
        error={kpiError}
        onRefresh={fetchKpis}
      />

      {/* Quick Navigation Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-3 col-sm-6">
          <Link
            to="/admin/users"
            className="text-decoration-none card border-0 shadow-sm rounded-3 p-3 bg-white h-100 hover-card"
            style={{ transition: "transform 0.2s, box-shadow 0.2s" }}
          >
            <div className="d-flex align-items-center gap-3">
              <div
                className="d-flex align-items-center justify-content-center rounded-3 bg-primary-subtle text-primary"
                style={{ width: "46px", height: "46px" }}
              >
                <i className="fa-solid fa-users-gear fs-20"></i>
              </div>
              <div>
                <h6 className="fw-700 medium-black mb-1">User Management</h6>
                <span className="fs-12 text-muted">Accounts, roles, statuses</span>
              </div>
            </div>
          </Link>
        </div>

        <div className="col-md-3 col-sm-6">
          <Link
            to="/admin/categories"
            className="text-decoration-none card border-0 shadow-sm rounded-3 p-3 bg-white h-100 hover-card"
          >
            <div className="d-flex align-items-center gap-3">
              <div
                className="d-flex align-items-center justify-content-center rounded-3"
                style={{
                  width: "46px",
                  height: "46px",
                  backgroundColor: "rgba(233, 97, 63, 0.12)",
                  color: "#e9613f",
                }}
              >
                <i className="fa-solid fa-layer-group fs-20"></i>
              </div>
              <div>
                <h6 className="fw-700 medium-black mb-1">Categories</h6>
                <span className="fs-12 text-muted">Store classifications</span>
              </div>
            </div>
          </Link>
        </div>

        <div className="col-md-3 col-sm-6">
          <Link
            to="/admin/brands"
            className="text-decoration-none card border-0 shadow-sm rounded-3 p-3 bg-white h-100 hover-card"
          >
            <div className="d-flex align-items-center gap-3">
              <div
                className="d-flex align-items-center justify-content-center rounded-3 bg-success-subtle text-success"
                style={{ width: "46px", height: "46px" }}
              >
                <i className="fa-solid fa-certificate fs-20"></i>
              </div>
              <div>
                <h6 className="fw-700 medium-black mb-1">Brand Partners</h6>
                <span className="fs-12 text-muted">Pilot, Midori, Tombow...</span>
              </div>
            </div>
          </Link>
        </div>

        <div className="col-md-3 col-sm-6">
          <Link
            to="/shop"
            className="text-decoration-none card border-0 shadow-sm rounded-3 p-3 bg-white h-100 hover-card"
          >
            <div className="d-flex align-items-center gap-3">
              <div
                className="d-flex align-items-center justify-content-center rounded-3 bg-warning-subtle text-warning"
                style={{ width: "46px", height: "46px" }}
              >
                <i className="fa-solid fa-ticket fs-20"></i>
              </div>
              <div>
                <h6 className="fw-700 medium-black mb-1">Vouchers & Coupons</h6>
                <span className="fs-12 text-muted">Discounts & promotions</span>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Revenue & Order Status Charts Grid */}
      <div className="row g-4 mb-4">
        {/* Revenue Line/Bar Chart (Chart.js) */}
        <div className="col-lg-8">
          <RevenueChart
            data={activeChartData}
            period={dateFilter}
            onPeriodChange={(newPeriod) => setDateFilter(newPeriod)}
            loading={chartLoading}
          />
        </div>

        {/* Order Status Doughnut Chart (Chart.js) */}
        <div className="col-lg-4">
          <OrderStatusChart
            statusCounts={chartData?.orderStatusCounts}
            statusDistribution={chartData?.orderStatusDistribution}
            loading={chartLoading}
          />
        </div>
      </div>

      {/* Tables Grid: Recent Orders & Low Stock Warning */}
      <div className="row g-4 mb-4">
        {/* Recent Orders Table (Left col-xl-7) */}
        <div className="col-xl-7">
          <RecentOrdersTable
            orders={recentOrders}
            loading={recentOrdersLoading}
            onRefresh={fetchRecentOrders}
            onOrderUpdated={handleOrderUpdated}
          />
        </div>

        {/* Low Stock Warning Table (Right col-xl-5) */}
        <div className="col-xl-5">
          <LowStockTable
            products={lowStockItems}
            loading={chartLoading}
            threshold={5}
            onRefresh={() => fetchCharts(dateFilter)}
          />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
