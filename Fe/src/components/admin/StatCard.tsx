import React from "react";

export interface StatCardProps {
  title: string;
  value: string | number;
  growth?: string | number;
  growthType?: "up" | "down" | "neutral";
  growthText?: string;
  subtitle?: string;
  icon: string;
  colorVariant?: "primary" | "success" | "warning" | "info" | "purple";
  badgeText?: string;
  loading?: boolean;
}

const variantStyles = {
  primary: {
    bg: "rgba(233, 97, 63, 0.12)",
    color: "#e9613f",
    badgeBg: "bg-primary-subtle",
    badgeColor: "text-primary",
  },
  success: {
    bg: "rgba(34, 197, 94, 0.12)",
    color: "#16a34a",
    badgeBg: "bg-success-subtle",
    badgeColor: "text-success",
  },
  warning: {
    bg: "rgba(245, 158, 11, 0.14)",
    color: "#d97706",
    badgeBg: "bg-warning-subtle",
    badgeColor: "text-warning",
  },
  info: {
    bg: "rgba(6, 182, 212, 0.12)",
    color: "#0891b2",
    badgeBg: "bg-info-subtle",
    badgeColor: "text-info",
  },
  purple: {
    bg: "rgba(147, 51, 234, 0.12)",
    color: "#9333ea",
    badgeBg: "bg-purple-subtle",
    badgeColor: "text-purple",
  },
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  growth,
  growthType = "up",
  growthText,
  subtitle,
  icon,
  colorVariant = "primary",
  badgeText,
  loading = false,
}) => {
  const variant = variantStyles[colorVariant] || variantStyles.primary;

  const isPositive =
    growthType === "up" ||
    (typeof growth === "number" && growth >= 0) ||
    (typeof growth === "string" && growth.startsWith("+"));

  return (
    <div className="admin-stat-card p-3 bg-white rounded-3 border shadow-sm h-100 position-relative">
      {loading ? (
        <div className="placeholder-glow py-2">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div className="placeholder col-6 rounded" style={{ height: "14px" }}></div>
            <div className="placeholder rounded-circle" style={{ width: "40px", height: "40px" }}></div>
          </div>
          <div className="placeholder col-8 rounded mb-2" style={{ height: "30px" }}></div>
          <div className="placeholder col-5 rounded" style={{ height: "12px" }}></div>
        </div>
      ) : (
        <>
          {/* Top Bar: Title & Icon / Badge */}
          <div className="d-flex justify-content-between align-items-start mb-2">
            <div>
              <span className="text-muted fs-12 fw-600 text-uppercase letter-spacing-05">
                {title}
              </span>
              {badgeText && (
                <span className={`badge ${variant.badgeBg} ${variant.badgeColor} fs-11 fw-600 ms-2`}>
                  {badgeText}
                </span>
              )}
            </div>

            <div
              className="admin-stat-icon-wrapper rounded-3 d-flex align-items-center justify-content-center"
              style={{
                width: "42px",
                height: "42px",
                backgroundColor: variant.bg,
                color: variant.color,
                fontSize: "18px",
              }}
            >
              <i className={icon}></i>
            </div>
          </div>

          {/* Metric Value */}
          <h3 className="mb-1 fw-700 medium-black fs-24">
            {value}
          </h3>

          {/* Bottom Trend / Subtitle */}
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-1 mt-2">
            {growth !== undefined && growth !== null ? (
              <div className="d-flex align-items-center fs-12">
                <span
                  className={`badge ${
                    isPositive
                      ? "bg-success-subtle text-success"
                      : "bg-danger-subtle text-danger"
                  } fs-11 fw-600 me-2 px-2 py-1`}
                >
                  <i
                    className={`fa-solid ${
                      isPositive ? "fa-arrow-trend-up" : "fa-arrow-trend-down"
                    } me-1`}
                  ></i>
                  {typeof growth === "number"
                    ? `${growth > 0 ? "+" : ""}${growth}%`
                    : growth}
                </span>
                {growthText && (
                  <span className="text-muted fs-12">{growthText}</span>
                )}
              </div>
            ) : subtitle ? (
              <p className="text-muted fs-12 mb-0">{subtitle}</p>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
};

export default StatCard;
