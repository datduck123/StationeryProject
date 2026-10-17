import React, { useMemo, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
  ChartData,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export type RevenuePeriod = "7d" | "30d" | "year" | "week" | "month";
export type MetricType = "users" | "revenue" | "orders";

export interface ChartDataPoint {
  label: string;
  date?: string;
  orders?: number;
  deliveredOrders?: number;
  revenue?: number | string;
  newUsers?: number;
  users?: number;
}

export interface RevenueChartProps {
  data?: ChartDataPoint[];
  period?: RevenuePeriod;
  onPeriodChange?: (period: "7d" | "30d" | "year") => void;
  loading?: boolean;
}

const formatCurrencyShort = (val: number): string => {
  if (val >= 1_000_000_000) {
    return (val / 1_000_000_000).toFixed(1).replace(/\.0$/, "") + " tỷ";
  }
  if (val >= 1_000_000) {
    return (val / 1_000_000).toFixed(1).replace(/\.0$/, "") + " tr";
  }
  if (val >= 1_000) {
    return (val / 1_000).toFixed(0) + " k";
  }
  return val.toLocaleString("vi-VN") + " ₫";
};

const formatFullCurrency = (val: number): string => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(val);
};

export const RevenueChart: React.FC<RevenueChartProps> = ({
  data = [],
  period = "7d",
  onPeriodChange,
  loading = false,
}) => {
  const [chartMode, setChartMode] = useState<"bar" | "line">("bar");
  const [activeMetric, setActiveMetric] = useState<MetricType>("users");

  // Normalized items
  const chartItems = useMemo(() => {
    if (!data || data.length === 0) {
      return [
        { label: "T2", revenue: 0, orders: 0, newUsers: 0 },
        { label: "T3", revenue: 0, orders: 0, newUsers: 0 },
        { label: "T4", revenue: 0, orders: 0, newUsers: 0 },
        { label: "T5", revenue: 0, orders: 0, newUsers: 0 },
        { label: "T6", revenue: 0, orders: 0, newUsers: 0 },
        { label: "T7", revenue: 0, orders: 0, newUsers: 0 },
        { label: "CN", revenue: 0, orders: 0, newUsers: 0 },
      ];
    }
    return data.map((item) => ({
      label: item.label,
      revenue: typeof item.revenue === "number" ? item.revenue : parseFloat(String(item.revenue || 0)) || 0,
      orders: item.orders || 0,
      deliveredOrders: item.deliveredOrders || 0,
      newUsers: item.newUsers ?? item.users ?? 0,
    }));
  }, [data]);

  // Statistics for header based on metric
  const totalUsers = useMemo(() => {
    return chartItems.reduce((acc, curr) => acc + curr.newUsers, 0);
  }, [chartItems]);

  const totalRevenue = useMemo(() => {
    return chartItems.reduce((acc, curr) => acc + curr.revenue, 0);
  }, [chartItems]);

  const totalOrders = useMemo(() => {
    return chartItems.reduce((acc, curr) => acc + curr.orders, 0);
  }, [chartItems]);

  const peakPoint = useMemo(() => {
    if (chartItems.length === 0) return null;
    if (activeMetric === "users") {
      return chartItems.reduce((prev, curr) => (curr.newUsers > prev.newUsers ? curr : prev), chartItems[0]);
    }
    if (activeMetric === "revenue") {
      return chartItems.reduce((prev, curr) => (curr.revenue > prev.revenue ? curr : prev), chartItems[0]);
    }
    return chartItems.reduce((prev, curr) => (curr.orders > prev.orders ? curr : prev), chartItems[0]);
  }, [chartItems, activeMetric]);

  const labels = chartItems.map((item) => item.label);
  const userValues = chartItems.map((item) => item.newUsers);
  const revenueValues = chartItems.map((item) => item.revenue);
  const orderValues = chartItems.map((item) => item.orders);

  // Normalized active period
  const activePeriod: "7d" | "30d" | "year" =
    period === "30d" || period === "month"
      ? "30d"
      : period === "year"
      ? "year"
      : "7d";

  // Selected values for current metric
  const currentMetricValues = useMemo(() => {
    if (activeMetric === "users") return userValues;
    if (activeMetric === "revenue") return revenueValues;
    return orderValues;
  }, [activeMetric, userValues, revenueValues, orderValues]);

  // Color config per metric
  const metricColor = useMemo(() => {
    if (activeMetric === "users") {
      return {
        primary: "#4f46e5",
        bgLight: "rgba(79, 70, 229, 0.12)",
        bgGradientStart: "rgba(79, 70, 229, 0.45)",
        bgGradientEnd: "rgba(79, 70, 229, 0.0)",
        barBg: "rgba(79, 70, 229, 0.85)",
        badgeClass: "bg-primary-subtle text-primary border-primary-subtle",
        label: "User đăng ký mới",
      };
    }
    if (activeMetric === "revenue") {
      return {
        primary: "#e9613f",
        bgLight: "rgba(233, 97, 63, 0.12)",
        bgGradientStart: "rgba(233, 97, 63, 0.45)",
        bgGradientEnd: "rgba(233, 97, 63, 0.0)",
        barBg: "rgba(233, 97, 63, 0.85)",
        badgeClass: "bg-warning-subtle text-warning border-warning-subtle",
        label: "Doanh thu (₫)",
      };
    }
    return {
      primary: "#0ea5e9",
      bgLight: "rgba(14, 165, 233, 0.12)",
      bgGradientStart: "rgba(14, 165, 233, 0.45)",
      bgGradientEnd: "rgba(14, 165, 233, 0.0)",
      barBg: "rgba(14, 165, 233, 0.85)",
      badgeClass: "bg-info-subtle text-info border-info-subtle",
      label: "Số đơn hàng",
    };
  }, [activeMetric]);

  // Chart.js Data Configuration
  const chartConfig: ChartData<"bar" | "line"> = {
    labels,
    datasets: [
      {
        type: chartMode,
        label: metricColor.label,
        data: currentMetricValues,
        backgroundColor: (context) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return metricColor.barBg;
          if (chartMode === "line") {
            const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
            gradient.addColorStop(0, metricColor.bgGradientStart);
            gradient.addColorStop(1, metricColor.bgGradientEnd);
            return gradient;
          }
          return metricColor.barBg;
        },
        borderColor: metricColor.primary,
        borderWidth: chartMode === "line" ? 3 : 0,
        borderRadius: chartMode === "bar" ? (activePeriod === "30d" ? 4 : 8) : 0,
        fill: chartMode === "line",
        tension: 0.35,
        pointBackgroundColor: "#ffffff",
        pointBorderColor: metricColor.primary,
        pointBorderWidth: 2,
        pointRadius: chartMode === "line" ? (activePeriod === "30d" ? 2 : 4) : 0,
        pointHoverRadius: 6,
        yAxisID: "y",
      },
    ],
  };

  const chartOptions: ChartOptions<"bar" | "line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "#1e2229",
        titleFont: { size: 13, weight: "bold", family: "Poppins, sans-serif" },
        bodyFont: { size: 12, family: "Poppins, sans-serif" },
        padding: 12,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          title: (items) => items[0]?.label || "",
          label: (context) => {
            const idx = context.dataIndex;
            const users = userValues[idx] || 0;
            const rev = revenueValues[idx] || 0;
            const ords = orderValues[idx] || 0;
            return [
              ` 👤 Số user đăng ký: ${users} người`,
              ` 📦 Số đơn hàng: ${ords} đơn`,
              ` 💰 Doanh thu: ${formatFullCurrency(rev)}`,
            ];
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: "#727b88",
          font: { size: activePeriod === "30d" ? 10 : 11, family: "Poppins, sans-serif" },
          maxRotation: activePeriod === "30d" ? 45 : 0,
          autoSkip: activePeriod === "30d",
          maxTicksLimit: activePeriod === "30d" ? 15 : undefined,
        },
      },
      y: {
        grid: {
          color: "rgba(233, 237, 244, 0.6)",
        },
        ticks: {
          color: "#727b88",
          font: { size: 11, family: "Poppins, sans-serif" },
          precision: 0,
          callback: (value) => {
            const num = Number(value);
            if (activeMetric === "revenue") {
              return formatCurrencyShort(num);
            }
            if (activeMetric === "users") {
              return `${num} user`;
            }
            return `${num} đơn`;
          },
        },
        beginAtZero: true,
      },
    },
  };

  const periodSubtitle = useMemo(() => {
    const metricText =
      activeMetric === "users"
        ? "Số lượng user đăng ký mới"
        : activeMetric === "revenue"
        ? "Doanh thu"
        : "Số lượng đơn hàng";

    if (activePeriod === "7d") return `${metricText} 7 ngày gần nhất`;
    if (activePeriod === "30d") return `${metricText} 30 ngày qua`;
    return `${metricText} theo 12 tháng trong năm`;
  }, [activeMetric, activePeriod]);

  return (
    <div className="bg-white rounded-3 border shadow-sm p-4 h-100 d-flex flex-column">
      {/* Chart Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <div>
          <h5 className="fw-700 medium-black mb-1 d-flex align-items-center gap-2">
            <i className={`fa-solid ${activeMetric === "users" ? "fa-user-plus text-primary" : activeMetric === "revenue" ? "fa-chart-line text-warning" : "fa-cart-shopping text-info"}`}></i>
            {activeMetric === "users"
              ? "Biểu đồ Số Lượng User Đăng Ký"
              : activeMetric === "revenue"
              ? "Biểu đồ Doanh Thu & Tăng Trưởng"
              : "Biểu đồ Đơn Hàng"}
          </h5>
          <p className="text-muted fs-13 mb-0">{periodSubtitle}</p>
        </div>

        <div className="d-flex align-items-center gap-2 flex-wrap">
          {/* Metric Selector Toggle (User đăng ký, Doanh thu, Đơn hàng) */}
          <div className="btn-group btn-group-sm bg-light p-1 rounded-pill border">
            <button
              type="button"
              className={`btn btn-sm rounded-pill px-2.5 py-1 ${
                activeMetric === "users"
                  ? "btn-dark bg-color-primary border-0 text-white fw-600 shadow-sm"
                  : "text-muted border-0"
              }`}
              onClick={() => setActiveMetric("users")}
              title="Xem số lượng user đăng ký"
            >
              <i className="fa-solid fa-users me-1"></i> User đăng ký
            </button>
            <button
              type="button"
              className={`btn btn-sm rounded-pill px-2.5 py-1 ${
                activeMetric === "revenue"
                  ? "btn-dark bg-color-primary border-0 text-white fw-600 shadow-sm"
                  : "text-muted border-0"
              }`}
              onClick={() => setActiveMetric("revenue")}
              title="Xem doanh thu"
            >
              <i className="fa-solid fa-sack-dollar me-1"></i> Doanh thu
            </button>
            <button
              type="button"
              className={`btn btn-sm rounded-pill px-2.5 py-1 ${
                activeMetric === "orders"
                  ? "btn-dark bg-color-primary border-0 text-white fw-600 shadow-sm"
                  : "text-muted border-0"
              }`}
              onClick={() => setActiveMetric("orders")}
              title="Xem số đơn hàng"
            >
              <i className="fa-solid fa-bag-shopping me-1"></i> Đơn hàng
            </button>
          </div>

          {/* Chart View Toggle: Line vs Bar */}
          <div className="btn-group btn-group-sm bg-light p-1 rounded-pill border">
            <button
              type="button"
              className={`btn btn-sm rounded-pill px-2.5 py-1 ${
                chartMode === "bar"
                  ? "btn-white shadow-sm fw-600 text-dark"
                  : "text-muted border-0"
              }`}
              onClick={() => setChartMode("bar")}
              title="Biểu đồ cột"
            >
              <i className="fa-solid fa-chart-simple me-1"></i> Cột
            </button>
            <button
              type="button"
              className={`btn btn-sm rounded-pill px-2.5 py-1 ${
                chartMode === "line"
                  ? "btn-white shadow-sm fw-600 text-dark"
                  : "text-muted border-0"
              }`}
              onClick={() => setChartMode("line")}
              title="Biểu đồ đường"
            >
              <i className="fa-solid fa-chart-area me-1"></i> Đường
            </button>
          </div>

          {/* Period Toggle (7 ngày, 30 ngày, Năm) */}
          {onPeriodChange && (
            <div className="btn-group btn-group-sm bg-light p-1 rounded-pill border">
              <button
                type="button"
                className={`btn btn-sm rounded-pill px-3 py-1 ${
                  activePeriod === "7d"
                    ? "btn-white shadow-sm fw-600 text-dark"
                    : "text-muted border-0"
                }`}
                onClick={() => onPeriodChange("7d")}
              >
                7 ngày
              </button>
              <button
                type="button"
                className={`btn btn-sm rounded-pill px-3 py-1 ${
                  activePeriod === "30d"
                    ? "btn-white shadow-sm fw-600 text-dark"
                    : "text-muted border-0"
                }`}
                onClick={() => onPeriodChange("30d")}
              >
                30 ngày
              </button>
              <button
                type="button"
                className={`btn btn-sm rounded-pill px-3 py-1 ${
                  activePeriod === "year"
                    ? "btn-white shadow-sm fw-600 text-dark"
                    : "text-muted border-0"
                }`}
                onClick={() => onPeriodChange("year")}
              >
                Năm
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Summary Chips */}
      <div className="d-flex flex-wrap gap-2 mb-3">
        <div className="px-3 py-1.5 bg-light rounded-3 fs-12 border d-flex align-items-center gap-2">
          <i className="fa-solid fa-user-plus text-primary"></i>
          <span className="text-muted">Tổng user đăng ký kỳ:</span>
          <strong className="text-dark fw-700">{totalUsers} người</strong>
        </div>
        <div className="px-3 py-1.5 bg-light rounded-3 fs-12 border d-flex align-items-center gap-2">
          <i className="fa-solid fa-cart-shopping text-info"></i>
          <span className="text-muted">Tổng đơn:</span>
          <strong className="text-dark fw-700">{totalOrders} đơn</strong>
        </div>
        <div className="px-3 py-1.5 bg-light rounded-3 fs-12 border d-flex align-items-center gap-2">
          <i className="fa-solid fa-sack-dollar text-success"></i>
          <span className="text-muted">Tổng doanh thu:</span>
          <strong className="text-dark fw-700">{formatFullCurrency(totalRevenue)}</strong>
        </div>
        {peakPoint && (
          <div className="px-3 py-1.5 bg-primary-subtle text-primary rounded-3 fs-12 border border-primary-subtle d-flex align-items-center gap-2">
            <i className="fa-solid fa-trophy fs-11"></i>
            <span>
              {activeMetric === "users" && (
                <>Cao nhất: <strong>{peakPoint.label}</strong> ({peakPoint.newUsers} user)</>
              )}
              {activeMetric === "revenue" && (
                <>Cao nhất: <strong>{peakPoint.label}</strong> ({formatFullCurrency(peakPoint.revenue)})</>
              )}
              {activeMetric === "orders" && (
                <>Cao nhất: <strong>{peakPoint.label}</strong> ({peakPoint.orders} đơn)</>
              )}
            </span>
          </div>
        )}
      </div>

      {/* Canvas Area */}
      <div className="position-relative flex-grow-1" style={{ minHeight: "260px" }}>
        {loading ? (
          <div className="d-flex flex-column align-items-center justify-content-center h-100 placeholder-glow">
            <div className="spinner-border text-primary mb-2" role="status"></div>
            <span className="text-muted fs-13">Đang tải biểu đồ...</span>
          </div>
        ) : (
          <div style={{ height: "260px", width: "100%" }}>
            {chartMode === "bar" ? (
              <Bar data={chartConfig} options={chartOptions} />
            ) : (
              <Line data={chartConfig} options={chartOptions} />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RevenueChart;
