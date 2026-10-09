import React, { useMemo } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions,
  ChartData,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

export interface OrderStatusDistributionItem {
  status: string;
  count: number;
  percentage?: number;
}

export interface OrderStatusChartProps {
  statusCounts?: Record<string, number>;
  statusDistribution?: OrderStatusDistributionItem[];
  loading?: boolean;
}

interface StatusMeta {
  label: string;
  color: string;
  icon: string;
  bgSubtle: string;
}

const STATUS_METAS: Record<string, StatusMeta> = {
  DELIVERED: {
    label: "Đã giao hàng",
    color: "#10b981",
    icon: "fa-solid fa-circle-check",
    bgSubtle: "bg-success-subtle text-success",
  },
  SHIPPING: {
    label: "Đang giao",
    color: "#3b82f6",
    icon: "fa-solid fa-truck-fast",
    bgSubtle: "bg-primary-subtle text-primary",
  },
  CONFIRMED: {
    label: "Đã xác nhận",
    color: "#8b5cf6",
    icon: "fa-solid fa-clipboard-check",
    bgSubtle: "bg-purple-subtle text-purple",
  },
  PENDING: {
    label: "Chờ xử lý",
    color: "#f59e0b",
    icon: "fa-solid fa-clock",
    bgSubtle: "bg-warning-subtle text-warning",
  },
  CANCELLED: {
    label: "Đã hủy",
    color: "#ef4444",
    icon: "fa-solid fa-ban",
    bgSubtle: "bg-danger-subtle text-danger",
  },
};

const ORDERED_STATUSES = ["DELIVERED", "SHIPPING", "CONFIRMED", "PENDING", "CANCELLED"];

export const OrderStatusChart: React.FC<OrderStatusChartProps> = ({
  statusCounts,
  statusDistribution,
  loading = false,
}) => {
  // Normalize items
  const items = useMemo(() => {
    let sourceMap: Record<string, number> = {};

    if (statusDistribution && statusDistribution.length > 0) {
      statusDistribution.forEach((d) => {
        sourceMap[d.status.toUpperCase()] = d.count;
      });
    } else if (statusCounts) {
      Object.entries(statusCounts).forEach(([k, v]) => {
        sourceMap[k.toUpperCase()] = v;
      });
    }

    const total = Object.values(sourceMap).reduce((a, b) => a + b, 0);

    return ORDERED_STATUSES.map((statusKey) => {
      const meta = STATUS_METAS[statusKey] || {
        label: statusKey,
        color: "#94a3b8",
        icon: "fa-solid fa-circle",
        bgSubtle: "bg-light text-muted",
      };
      const count = sourceMap[statusKey] || 0;
      const percentage = total > 0 ? Math.round((count / total) * 1000) / 10 : 0;

      return {
        key: statusKey,
        label: meta.label,
        color: meta.color,
        icon: meta.icon,
        bgSubtle: meta.bgSubtle,
        count,
        percentage,
      };
    });
  }, [statusCounts, statusDistribution]);

  const totalOrders = useMemo(() => {
    return items.reduce((sum, it) => sum + it.count, 0);
  }, [items]);

  const hasData = totalOrders > 0;

  const chartData: ChartData<"doughnut"> = {
    labels: items.map((it) => it.label),
    datasets: [
      {
        data: hasData ? items.map((it) => it.count) : [1],
        backgroundColor: hasData
          ? items.map((it) => it.color)
          : ["#e2e8f0"],
        borderColor: "#ffffff",
        borderWidth: 2,
        hoverOffset: hasData ? 6 : 0,
      },
    ],
  };

  const chartOptions: ChartOptions<"doughnut"> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "74%",
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: hasData,
        backgroundColor: "#1e2229",
        titleFont: { size: 12, weight: "bold", family: "Poppins, sans-serif" },
        bodyFont: { size: 12, family: "Poppins, sans-serif" },
        padding: 10,
        cornerRadius: 8,
        callbacks: {
          label: (context) => {
            const it = items[context.dataIndex];
            if (!it) return "";
            return ` ${it.count} đơn (${it.percentage}%)`;
          },
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-3 border shadow-sm p-4 h-100 d-flex flex-column">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h5 className="fw-700 medium-black mb-1 d-flex align-items-center gap-2">
            <i className="fa-solid fa-chart-pie text-primary"></i>
            Trạng thái đơn hàng
          </h5>
          <p className="text-muted fs-13 mb-0">Phân bố tiến độ xử lý & giao nhận</p>
        </div>
        <span className="badge bg-light text-muted border px-2.5 py-1.5 fs-12 fw-600">
          Tổng {totalOrders} đơn
        </span>
      </div>

      {/* Doughnut Canvas with Center Text */}
      <div className="position-relative d-flex justify-content-center align-items-center my-2" style={{ height: "190px" }}>
        {loading ? (
          <div className="d-flex flex-column align-items-center justify-content-center">
            <div className="spinner-border spinner-border-sm text-primary mb-2" role="status"></div>
            <span className="text-muted fs-12">Đang tải...</span>
          </div>
        ) : (
          <>
            <div style={{ width: "180px", height: "180px" }}>
              <Doughnut data={chartData} options={chartOptions} />
            </div>
            {/* Center Label */}
            <div
              className="position-absolute text-center pointer-events-none"
              style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}
            >
              <div className="fs-22 fw-700 medium-black lh-1">{totalOrders}</div>
              <span className="fs-11 text-muted text-uppercase fw-600">Đơn hàng</span>
            </div>
          </>
        )}
      </div>

      {/* Status Legend List */}
      <div className="mt-3 pt-2 border-top flex-grow-1 d-flex flex-column justify-content-center gap-2">
        {items.map((it) => (
          <div
            key={it.key}
            className="d-flex align-items-center justify-content-between fs-12 py-1 px-2 rounded-2 hover-bg-light"
          >
            <div className="d-flex align-items-center gap-2">
              <span
                className="rounded-circle"
                style={{
                  width: "9px",
                  height: "9px",
                  backgroundColor: it.color,
                  display: "inline-block",
                }}
              ></span>
              <span className="fw-600 text-dark">{it.label}</span>
            </div>
            <div className="d-flex align-items-center gap-2">
              <span className="fw-700 text-dark">{it.count}</span>
              <span className="badge bg-light text-muted border fs-11" style={{ minWidth: "46px" }}>
                {it.percentage}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderStatusChart;
