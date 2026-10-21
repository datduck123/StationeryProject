import React from "react";
import StatCard from "./StatCard";

export interface DashboardKpis {
  totalUsers?: number;
  totalProducts?: number;
  totalOrders?: number;
  totalRevenue?: number | string;
}

export interface KpiSummarySectionProps {
  kpis?: DashboardKpis | null;
  loading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  currencyPrefix?: string;
}

const formatNumber = (val?: number | string): string => {
  if (val === undefined || val === null) return "0";
  const num = typeof val === "string" ? parseFloat(val) : val;
  if (isNaN(num)) return "0";
  return new Intl.NumberFormat("vi-VN").format(num);
};

const formatCurrency = (val?: number | string): string => {
  if (val === undefined || val === null) return "0 ₫";
  const num = typeof val === "string" ? parseFloat(val) : val;
  if (isNaN(num)) return "0 ₫";
  return (
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(num)
  );
};

export const KpiSummarySection: React.FC<KpiSummarySectionProps> = ({
  kpis,
  loading = false,
  error = null,
  onRefresh,
}) => {
  if (error) {
    return (
      <div className="alert alert-warning d-flex align-items-center justify-content-between p-3 mb-4 rounded-3 border">
        <div className="d-flex align-items-center gap-2">
          <i className="fa-solid fa-triangle-exclamation text-warning fs-18"></i>
          <div>
            <strong className="d-block fs-14">Không thể tải dữ liệu KPI</strong>
            <span className="fs-12 text-muted">{error}</span>
          </div>
        </div>
        {onRefresh && (
          <button
            type="button"
            className="btn btn-sm btn-outline-dark rounded-pill px-3 fs-12"
            onClick={onRefresh}
          >
            <i className="fa-solid fa-rotate-right me-1"></i> Thử lại
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="row g-3 mb-4">
      {/* 1. Doanh thu thực tế */}
      <div className="col-xl-3 col-sm-6">
        <StatCard
          title="Tổng doanh thu"
          value={formatCurrency(kpis?.totalRevenue)}
          growth="+14.2%"
          growthType="up"
          growthText="Đơn thành công"
          icon="fa-solid fa-sack-dollar"
          colorVariant="success"
          loading={loading}
          badgeText="Thực tế"
        />
      </div>

      {/* 2. Tổng đơn hàng */}
      <div className="col-xl-3 col-sm-6">
        <StatCard
          title="Tổng đơn hàng"
          value={formatNumber(kpis?.totalOrders)}
          growth="+8.5%"
          growthType="up"
          growthText="Toàn hệ thống"
          icon="fa-solid fa-cart-shopping"
          colorVariant="primary"
          loading={loading}
          badgeText="Live"
        />
      </div>

      {/* 3. Tổng khách hàng */}
      <div className="col-xl-3 col-sm-6">
        <StatCard
          title="Tổng khách hàng"
          value={formatNumber(kpis?.totalUsers)}
          growth="+12.0%"
          growthType="up"
          growthText="Tài khoản đăng ký"
          icon="fa-solid fa-users"
          colorVariant="warning"
          loading={loading}
          badgeText="Active"
        />
      </div>

      {/* 4. Tổng sản phẩm */}
      <div className="col-xl-3 col-sm-6">
        <StatCard
          title="Tổng sản phẩm"
          value={`${formatNumber(kpis?.totalProducts)} items`}
          growth="+5.4%"
          growthType="up"
          growthText="Trong danh mục"
          icon="fa-solid fa-boxes-stacked"
          colorVariant="info"
          loading={loading}
          badgeText="Catalog"
        />
      </div>
    </div>
  );
};

export default KpiSummarySection;
