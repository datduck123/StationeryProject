// Migrated from: index.html, lines 3380-3502
// Fully decoupled dialog pattern: eliminates Hook violations, provides instant 0ms open,
// robust out-of-stock controls, hardware-accelerated animations, and safe background enrichment.
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCartContext } from "../../providers/CartContext";
import { getProductImage, getProductById } from "../../services/productService";
import ProductRatingSold from "./ProductRatingSold";
import ErrorBoundary from "./ErrorBoundary";
import { formatOrderMoney } from "../../utils/orderFormatters";

/**
 * Inner dialog component mounted ONLY when modal is active.
 * Guarantees 100% stable Hook order and lifecycle, zero state bleed between products.
 */
const QuickViewDialog = ({ product, onClose, addToCart, pendingItemIds }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  // Instant state initialization directly from passed product prop (0ms latency, no blank/lag)
  const [detail, setDetail] = useState(product);
  const prodId = detail?.id || detail?.productId || product?.id || product?.productId;

  // Safe stock calculations
  const rawStock = detail?.stockQuantity ?? detail?.stock_quantity ?? detail?.stock ?? product?.stockQuantity ?? 0;
  const stockQty = Math.max(0, Number(rawStock) || 0);
  const inStock = stockQty > 0;
  const maxAllowed = Math.min(Math.max(1, stockQty), 20);

  // Synchronous quantity state (1 for in-stock, 0 for out-of-stock)
  const [quantity, setQuantity] = useState(inStock ? 1 : 0);

  // Background enrichment: silently update fresh fields if available, with cancellation
  useEffect(() => {
    let isMounted = true;
    if (prodId) {
      getProductById(prodId)
        .then((res) => {
          if (!isMounted) return;
          const fresh = res.data?.data ?? res.data;
          if (fresh) {
            setDetail((prev) => ({ ...prev, ...fresh }));
          }
        })
        .catch(() => {
          // Silent catch to prevent UI freeze
        });
    }
    return () => {
      isMounted = false;
    };
  }, [prodId]);

  // Close smoothly on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Quantity controls
  const handleDecrement = useCallback(() => {
    if (!inStock || quantity <= 1) return;
    setQuantity((prev) => Math.max(1, prev - 1));
  }, [inStock, quantity]);

  const handleIncrement = useCallback(() => {
    if (!inStock || quantity >= maxAllowed) return;
    setQuantity((prev) => Math.min(maxAllowed, prev + 1));
  }, [inStock, maxAllowed, quantity]);

  const handleQuantityChange = useCallback(
    (e) => {
      if (!inStock) return;
      const rawDigits = e.target.value.replace(/\D/g, "");
      if (rawDigits === "") {
        setQuantity(1);
        return;
      }
      const num = parseInt(rawDigits, 10);
      if (!isNaN(num)) {
        setQuantity(Math.max(1, Math.min(maxAllowed, num)));
      }
    },
    [inStock, maxAllowed]
  );

  const handleViewDetail = useCallback(() => {
    onClose();
    if (prodId) {
      navigate(`/product/${prodId}`);
    }
  }, [navigate, onClose, prodId]);

  const isPending = Boolean(pendingItemIds?.has?.(String(prodId)));

  const handleAddToCart = useCallback(async () => {
    if (!inStock || isPending) return;
    const success = await addToCart(prodId, quantity);
    if (success) {
      onClose();
    }
  }, [addToCart, inStock, isPending, onClose, prodId, quantity]);

  const unitPrice = Number(detail?.price ?? product?.price ?? 0);
  const subtotal = formatOrderMoney(unitPrice * (inStock ? quantity : 0), i18n.language);
  const imgSrc = getProductImage(detail || product);

  const categoryName =
    typeof detail?.category === "string"
      ? detail.category
      : detail?.category?.name ?? detail?.categoryName ?? product?.category?.name ?? "";
  const brandName =
    typeof detail?.brand === "string"
      ? detail.brand
      : detail?.brand?.name ?? detail?.brandName ?? product?.brand?.name ?? "";

  return (
    <div
      className="qv-overlay"
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.55)",
        backdropFilter: "blur(4px)",
        zIndex: 9990,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
      onClick={onClose}
    >
      <div
        className="qv-dialog"
        style={{
          background: "#ffffff",
          borderRadius: "20px",
          boxShadow: "0 25px 60px rgba(0, 0, 0, 0.22)",
          maxWidth: "860px",
          width: "100%",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", flexWrap: "wrap" }}>
          {/* Image side */}
          <div
            style={{
              flex: "0 0 45%",
              minWidth: "280px",
              padding: "32px",
              background: "#fafafa",
              borderRadius: "20px 0 0 20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}
          >
            {!inStock && (
              <span
                style={{
                  position: "absolute",
                  top: "16px",
                  left: "16px",
                  background: "#dc2626",
                  color: "#ffffff",
                  fontSize: "11px",
                  fontWeight: 700,
                  padding: "4px 10px",
                  borderRadius: "6px",
                  zIndex: 3,
                  boxShadow: "0 2px 8px rgba(220, 38, 38, 0.4)",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                {t("common.outOfStock", "Hết hàng")}
              </span>
            )}
            <img
              src={imgSrc}
              alt={detail?.name || ""}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/assets/media/products/product-7.png";
              }}
              style={{
                width: "100%",
                maxHeight: "320px",
                objectFit: "contain",
                borderRadius: "12px",
                opacity: inStock ? 1 : 0.85,
              }}
            />
          </div>

          {/* Info side */}
          <div style={{ flex: 1, padding: "28px 28px 28px 24px", minWidth: "260px" }}>
            {/* Close button */}
            <div style={{ textAlign: "right", marginBottom: "8px" }}>
              <button
                type="button"
                onClick={onClose}
                aria-label={t("common.close", "Close")}
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  border: "1px solid #e5e7eb",
                  background: "#f9fafb",
                  color: "#6b7280",
                  fontSize: "18px",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "background-color 0.2s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f3f4f6")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#f9fafb")}
              >
                ×
              </button>
            </div>

            {/* Status badge */}
            <div style={{ marginBottom: "10px" }}>
              <span
                style={{
                  display: "inline-block",
                  padding: "4px 12px",
                  borderRadius: "20px",
                  fontSize: "12px",
                  fontWeight: 600,
                  backgroundColor: inStock ? "#dcfce7" : "#fee2e2",
                  color: inStock ? "#15803d" : "#dc2626",
                  border: inStock ? "1px solid #bbf7d0" : "1px solid #fecaca",
                }}
              >
                {inStock
                  ? `${t("common.inStock", "In Stock")} (${stockQty})`
                  : t("common.outOfStock", "Hết hàng")}
              </span>
            </div>

            {/* Dynamic Out of Stock Alert Message */}
            {!inStock && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "12px 14px",
                  borderRadius: "12px",
                  backgroundColor: "#fef2f2",
                  border: "1.5px solid #fecaca",
                  marginBottom: "14px",
                }}
                role="alert"
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#dc2626"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ flexShrink: 0 }}
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "#991b1b" }}>
                    {t("productDetail.productOutOfStock", "Sản Phẩm Này Hết Hàng")}
                  </div>
                  <div style={{ fontSize: "12px", color: "#b91c1c", marginTop: "2px" }}>
                    {t("productDetail.outOfStockDesc", "Sản phẩm hiện đang tạm hết hàng. Quý khách vui lòng quay lại sau hoặc tham khảo các sản phẩm tương tự.")}
                  </div>
                </div>
              </div>
            )}

            {/* Product name */}
            <h4
              style={{
                fontWeight: 700,
                fontSize: "20px",
                color: "#1f2937",
                marginBottom: "8px",
                lineHeight: 1.3,
              }}
            >
              {detail?.name || t("common.product", "Product")}
            </h4>

            {/* Category & Brand */}
            {(categoryName || brandName) && (
              <p style={{ fontSize: "13px", color: "#9ca3af", marginBottom: "12px" }}>
                {[categoryName, brandName].filter(Boolean).join(" · ")}
              </p>
            )}

            {/* Stars & Sold count (Lazada style) */}
            <ProductRatingSold product={detail || product} variant="quickview" className="mb-16" />

            {/* Price */}
            <div style={{ marginBottom: "16px" }}>
              <span
                style={{
                  fontSize: "24px",
                  fontWeight: 700,
                  color: "#e57c32",
                }}
              >
                {formatOrderMoney(detail?.price, i18n.language)}
              </span>
            </div>

            {/* Description */}
            {detail?.description && (
              <p
                style={{
                  fontSize: "13px",
                  color: "#6b7280",
                  marginBottom: "16px",
                  lineHeight: 1.6,
                  maxHeight: "60px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {detail.description}
              </p>
            )}

            <hr style={{ border: "none", borderTop: "1px solid #f3f4f6", margin: "16px 0" }} />

            {/* Quantity */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
              <span style={{ fontWeight: 600, fontSize: "14px", color: "#374151" }}>{t("common.quantity")}:</span>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  border: "1.5px solid #e2e8f0",
                  borderRadius: "9999px",
                  padding: "3px 6px",
                  background: inStock ? "#ffffff" : "#f1f5f9",
                  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
                  opacity: inStock ? 1 : 0.5,
                  cursor: inStock ? "default" : "not-allowed",
                  pointerEvents: inStock ? "auto" : "none",
                }}
              >
                <button
                  type="button"
                  disabled={!inStock || quantity <= 1}
                  onClick={handleDecrement}
                  aria-label="Decrease quantity"
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    border: "none",
                    background: "transparent",
                    fontSize: "16px",
                    cursor: !inStock || quantity <= 1 ? "not-allowed" : "pointer",
                    fontWeight: 700,
                    opacity: !inStock || quantity <= 1 ? 0.22 : 1,
                    color: !inStock || quantity <= 1 ? "#94a3b8" : "#334155",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    outline: "none",
                  }}
                >
                  −
                </button>
                <input
                  type="text"
                  inputMode="numeric"
                  readOnly={!inStock}
                  disabled={!inStock}
                  value={inStock ? quantity : 0}
                  onChange={handleQuantityChange}
                  style={{
                    width: "44px",
                    height: "32px",
                    border: "none",
                    outline: "none",
                    textAlign: "center",
                    fontWeight: 700,
                    fontSize: "16px",
                    color: inStock ? "#0f172a" : "#94a3b8",
                    background: "transparent",
                    cursor: inStock ? "text" : "not-allowed",
                  }}
                />
                <button
                  type="button"
                  disabled={!inStock || quantity >= maxAllowed}
                  onClick={handleIncrement}
                  aria-label="Increase quantity"
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    border: "none",
                    background: "transparent",
                    fontSize: "16px",
                    cursor: !inStock || quantity >= maxAllowed ? "not-allowed" : "pointer",
                    fontWeight: 700,
                    opacity: !inStock || quantity >= maxAllowed ? 0.22 : 1,
                    color: !inStock || quantity >= maxAllowed ? "#94a3b8" : "#334155",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    outline: "none",
                  }}
                >
                  +
                </button>
              </div>
            </div>

            {/* Subtotal */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "20px",
              }}
            >
              <span style={{ fontWeight: 600, fontSize: "14px", color: "#374151" }}>
                {t("common.subtotal")}:
              </span>
              <span style={{ fontWeight: 700, color: "#e57c32", fontSize: "15px" }}>
                {subtotal}
              </span>
            </div>

            {/* Action buttons */}
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "20px" }}>
              <button
                type="button"
                disabled={!inStock || isPending}
                onClick={handleAddToCart}
                style={{
                  flex: 1,
                  padding: "11px 16px",
                  borderRadius: "30px",
                  border: "none",
                  background: inStock
                    ? "linear-gradient(135deg, #e57c32, #f59e0b)"
                    : "#94a3b8",
                  color: "#ffffff",
                  fontWeight: 700,
                  fontSize: "13px",
                  cursor: inStock ? "pointer" : "not-allowed",
                  pointerEvents: inStock ? "auto" : "none",
                  minWidth: "120px",
                  transition: "opacity 0.2s ease",
                }}
              >
                {inStock ? t("common.addCart") : t("common.outOfStock", "Hết hàng")}
              </button>
              <button
                type="button"
                onClick={handleViewDetail}
                style={{
                  flex: 1,
                  padding: "11px 16px",
                  borderRadius: "30px",
                  border: "2px solid #e57c32",
                  background: "transparent",
                  color: "#e57c32",
                  fontWeight: 700,
                  fontSize: "13px",
                  cursor: "pointer",
                  textAlign: "center",
                  textDecoration: "none",
                  minWidth: "120px",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#e57c32";
                  e.currentTarget.style.color = "#ffffff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "#e57c32";
                }}
              >
                {t("common.viewDetail", "View Details")}
              </button>
            </div>

            {/* Meta info */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "13px" }}>
              {detail?.sku && (
                <div style={{ display: "flex", gap: "8px" }}>
                  <span style={{ fontWeight: 600, color: "#374151", minWidth: "80px" }}>
                    {t("common.sku")}:
                  </span>
                  <span style={{ color: "#6b7280" }}>{detail.sku}</span>
                </div>
              )}
              {Boolean(categoryName) && (
                <div style={{ display: "flex", gap: "8px" }}>
                  <span style={{ fontWeight: 600, color: "#374151", minWidth: "80px" }}>
                    {t("common.categories")}:
                  </span>
                  <span style={{ color: "#6b7280" }}>{categoryName}</span>
                </div>
              )}
              {(detail?.weightKg != null || detail?.weight_kg != null) && (
                <div style={{ display: "flex", gap: "8px" }}>
                  <span style={{ fontWeight: 600, color: "#374151", minWidth: "80px" }}>
                    {t("productDetail.weight", "Weight")}:
                  </span>
                  <span style={{ color: "#6b7280" }}>
                    {detail.weightKg ?? detail.weight_kg} kg
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Top-level QuickViewModal:
 * Decoupled controller that only mounts QuickViewDialog when active.
 * Protected by ErrorBoundary with dynamic resetKey to prevent persistent dead states.
 */
export const QuickViewModal = () => {
  const { quickViewProduct, closeQuickView, addToCart, pendingItemIds } = useCartContext();

  if (!quickViewProduct) return null;

  const prodId = quickViewProduct.id || quickViewProduct.productId || "quickview";

  return (
    <ErrorBoundary key={prodId} resetKey={prodId}>
      <QuickViewDialog
        key={prodId}
        product={quickViewProduct}
        onClose={closeQuickView}
        addToCart={addToCart}
        pendingItemIds={pendingItemIds}
      />
    </ErrorBoundary>
  );
};

export default QuickViewModal;
