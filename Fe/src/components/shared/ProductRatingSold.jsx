import React from "react";
import { useTranslation } from "react-i18next";

/**
 * Extract real metrics (rating, reviewCount, soldCount) from product data.
 * Pure real data - no fake or synthetic random numbers.
 */
export const getProductMetrics = (product, fallbackRating, fallbackReviewCount) => {
  const rawRating = fallbackRating ?? product?.avgRating ?? product?.averageRating ?? product?.rating;
  const rating = rawRating != null && !isNaN(Number(rawRating)) ? Number(rawRating) : 0;

  const rawCount = fallbackReviewCount ?? product?.reviewCount ?? product?.reviewsCount;
  const reviewCount = rawCount != null && !isNaN(Number(rawCount)) ? Math.max(0, parseInt(rawCount, 10)) : 0;

  const rawSold = product?.sold ?? product?.soldQuantity ?? product?.soldCount;
  const soldCount = rawSold != null && !isNaN(Number(rawSold)) ? Math.max(0, parseInt(rawSold, 10)) : 0;

  return { rating, reviewCount, soldCount };
};

/**
 * Format sold count in Vietnamese / Lazada standard (e.g. 0, 15, 1.2k, 15k)
 */
export const formatSoldCount = (count) => {
  const num = Number(count) || 0;
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1).replace(".0", "")}k`;
  }
  return num.toLocaleString("vi-VN");
};

/**
 * Reusable Lazada-style Rating & Sold Count component
 * Supports variants:
 * - "detail": Full Lazada header row (Stars + Score + Count + Sold count + Brand)
 * - "card": Compact layout for product grid/list cards
 * - "quickview": Modal layout with clean badge
 */
export const ProductRatingSold = ({
  product,
  rating: propRating,
  reviewCount: propReviewCount,
  variant = "card",
  className = "",
  showBrand = true,
}) => {
  const { t } = useTranslation();
  const { rating, reviewCount, soldCount } = getProductMetrics(product, propRating, propReviewCount);
  const roundedStars = reviewCount > 0 ? Math.min(5, Math.max(1, Math.round(rating))) : 0;

  if (variant === "detail") {
    return (
      <div
        className={`d-flex align-items-center gap-12 flex-wrap ${className}`}
        style={{ fontSize: "14px" }}
      >
        {/* Rating Stars + Score + Count (Lazada style) */}
        <div className="d-flex align-items-center gap-6">
          {reviewCount > 0 ? (
            <>
              <div
                className="d-flex"
                style={{ color: "#ffb800", fontSize: "15px", letterSpacing: "1px" }}
                aria-label={`${rating.toFixed(1)} / 5 sao`}
              >
                {"★".repeat(roundedStars)}
                <span style={{ color: "#e2e8f0" }}>{"★".repeat(5 - roundedStars)}</span>
              </div>
              <span className="fw-700 text-dark" style={{ fontSize: "15px" }}>
                {rating.toFixed(1)}
              </span>
              <span className="text-muted">
                ({reviewCount} {t("reviews.count", "đánh giá")})
              </span>
            </>
          ) : (
            <>
              <div
                className="d-flex"
                style={{ color: "#e2e8f0", fontSize: "15px", letterSpacing: "1px" }}
              >
                {"★".repeat(5)}
              </div>
              <span className="text-muted">Chưa có đánh giá</span>
            </>
          )}
        </div>

        <span style={{ color: "#cbd5e1" }}>|</span>

        {/* Sold Count */}
        <div className="d-flex align-items-center gap-6">
          <span className="dark-gray fw-500">Đã bán:</span>
          <span className="fw-700 text-dark" style={{ fontSize: "15px" }}>
            {formatSoldCount(soldCount)}
          </span>
        </div>

        {/* Brand Link if available */}
        {showBrand && product?.brand?.name && (
          <>
            <span style={{ color: "#cbd5e1" }}>|</span>
            <div className="d-flex align-items-center gap-6">
              <span className="dark-gray">Thương hiệu:</span>
              <span className="fw-600 color-primary">{product.brand.name}</span>
            </div>
          </>
        )}
      </div>
    );
  }

  if (variant === "quickview") {
    return (
      <div
        className={`d-flex align-items-center gap-10 flex-wrap ${className}`}
        style={{ fontSize: "13.5px" }}
      >
        <div className="d-flex align-items-center gap-6">
          {reviewCount > 0 ? (
            <>
              <div
                className="d-flex"
                style={{ color: "#ffb800", fontSize: "14px", letterSpacing: "1px" }}
              >
                {"★".repeat(roundedStars)}
                <span style={{ color: "#e2e8f0" }}>{"★".repeat(5 - roundedStars)}</span>
              </div>
              <span className="fw-700 text-dark">{rating.toFixed(1)}</span>
              <span className="text-muted">({reviewCount})</span>
            </>
          ) : (
            <>
              <div className="d-flex" style={{ color: "#e2e8f0", fontSize: "14px" }}>
                {"★".repeat(5)}
              </div>
              <span className="text-muted" style={{ fontSize: "12px" }}>Chưa có đánh giá</span>
            </>
          )}
        </div>
        <span style={{ color: "#cbd5e1" }}>·</span>
        <div className="d-flex align-items-center gap-4">
          <span className="text-muted">Đã bán</span>
          <span className="fw-700 text-dark">{formatSoldCount(soldCount)}</span>
        </div>
      </div>
    );
  }

  // Default "card" variant (ShopGridSidebar, Home, Related Products)
  return (
    <div
      className={`d-flex align-items-center justify-content-center gap-6 flex-wrap ${className}`}
      style={{ fontSize: "12px", minHeight: "22px" }}
    >
      {reviewCount > 0 ? (
        <>
          <span style={{ color: "#ffb800", fontSize: "13px", letterSpacing: "0.5px" }}>
            {"★".repeat(roundedStars)}
          </span>
          <span className="fw-700 text-dark">{rating.toFixed(1)}</span>
          <span className="text-muted">({reviewCount})</span>
        </>
      ) : (
        <span className="text-muted" style={{ fontSize: "11px" }}>
          Chưa có đánh giá
        </span>
      )}
      <span style={{ color: "#cbd5e1" }}>·</span>
      <span className="dark-gray fw-500">Đã bán {formatSoldCount(soldCount)}</span>
    </div>
  );
};

export default ProductRatingSold;
