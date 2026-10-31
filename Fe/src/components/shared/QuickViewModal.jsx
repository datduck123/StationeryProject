// Migrated from: index.html, lines 3380-3502
// Fixed: uses real quickViewProduct fields (name, imageUrl, price, stockQuantity, sku, category, brand, description)
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCartContext } from "../../providers/CartContext";
import { getProductImage } from "../../services/productService";
import ProductRatingSold from "./ProductRatingSold";
import { formatOrderMoney } from "../../utils/orderFormatters";
import useQuantityInput from "../../hooks/useQuantityInput";

export const QuickViewModal = () => {
  const { quickViewProduct, closeQuickView, addToCart, pendingItemIds } = useCartContext();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  useEffect(() => { setQuantity(1); }, [quickViewProduct]);

  if (!quickViewProduct) return null;

  const prod = quickViewProduct;
  const stockQty = prod ? (prod.stockQuantity ?? prod.stock_quantity ?? 0) : 0;
  const inStock = stockQty > 0;
  const imgSrc = getProductImage(prod);
  const prodId = prod?.id || prod?.productId;

  const {
    inputProps,
    handleIncrement,
    handleDecrement,
    isAtMin,
    isAtMax,
    numericValue,
  } = useQuantityInput({
    value: quantity,
    maxStock: stockQty,
    min: 1,
    onChange: setQuantity,
  });

  const subtotal = formatOrderMoney((prod?.price ?? 0) * numericValue, i18n.language);

  const handleViewDetail = () => {
    closeQuickView();
    navigate(`/product/${prodId}`);
  };

  return (
    <>
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0,0,0,0.55)",
          zIndex: 9990,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
        }}
        onClick={closeQuickView}
      >
        <div
          style={{
            background: "#fff",
            borderRadius: "20px",
            boxShadow: "0 25px 60px rgba(0,0,0,0.2)",
            maxWidth: "860px",
            width: "100%",
            maxHeight: "90vh",
            overflowY: "auto",
            animation: "qvSlideUp 0.3s ease",
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
              }}
            >
              <img
                src={imgSrc}
                alt={prod.name}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/assets/media/products/product-7.png";
                }}
                style={{
                  width: "100%",
                  maxHeight: "320px",
                  objectFit: "contain",
                  borderRadius: "12px",
                }}
              />
            </div>

            {/* Info side */}
            <div style={{ flex: 1, padding: "28px 28px 28px 24px", minWidth: "260px" }}>
              {/* Close button */}
              <div style={{ textAlign: "right", marginBottom: "8px" }}>
                <button
                  type="button"
                  onClick={closeQuickView}
                  style={{
                    width: "30px",
                    height: "30px",
                    borderRadius: "50%",
                    border: "1px solid #e5e7eb",
                    background: "#f9fafb",
                    color: "#6b7280",
                    fontSize: "16px",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  ×
                </button>
              </div>

              {/* Status badge */}
              <div style={{ marginBottom: "10px" }}>
                <span
                  style={{
                    display: "inline-block",
                    padding: "3px 12px",
                    borderRadius: "20px",
                    fontSize: "12px",
                    fontWeight: 600,
                    backgroundColor: inStock ? "#dcfce7" : "#fee2e2",
                    color: inStock ? "#15803d" : "#dc2626",
                  }}
                >
                  {inStock
                    ? `${t("common.inStock", "In Stock")} (${stockQty})`
                    : t("common.outOfStock", "Out of Stock")}
                </span>
              </div>

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
                {prod.name || t("common.product", "Product")}
              </h4>

              {/* Category & Brand */}
              <p style={{ fontSize: "13px", color: "#9ca3af", marginBottom: "12px" }}>
                {[prod.category?.name ?? prod.categoryName, prod.brand?.name ?? prod.brandName]
                  .filter(Boolean)
                  .join(" · ")}
              </p>

              {/* Stars & Sold */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "16px",
                  flexWrap: "wrap",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ color: "#f59e0b", fontSize: "16px" }}>★★★★★</span>
                  <span style={{ fontSize: "13px", color: "#6b7280" }}>(02 đánh giá)</span>
                </div>
                <span style={{ color: "#d1d5db" }}>|</span>
                <span style={{ fontSize: "13px", color: "#4b5563" }}>
                  Đã bán: <strong style={{ color: "#111827" }}>{prod.sold ?? 0}</strong>
                </span>
              </div>

              {/* Price */}
              <div style={{ marginBottom: "16px" }}>
                <span
                  style={{
                    fontSize: "24px",
                    fontWeight: 700,
                    color: "#e57c32",
                  }}
                >
                  {formatOrderMoney(prod.price, i18n.language)}
                </span>
              </div>

              {/* Description */}
              {prod.description && (
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
                  {prod.description}
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
                    background: "#ffffff",
                    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
                  }}
                >
                  <button
                    type="button"
                    disabled={isAtMin || !inStock}
                    onClick={handleDecrement}
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      border: "none",
                      background: "transparent",
                      fontSize: "16px",
                      cursor: isAtMin || !inStock ? "not-allowed" : "pointer",
                      fontWeight: 700,
                      opacity: isAtMin || !inStock ? 0.22 : 1,
                      color: isAtMin || !inStock ? "#94a3b8" : "#334155",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                      outline: "none",
                    }}
                  >
                    −
                  </button>
                  <input
                    disabled={!inStock}
                    style={{
                      width: "44px",
                      height: "32px",
                      border: "none",
                      outline: "none",
                      textAlign: "center",
                      fontWeight: 700,
                      fontSize: "16px",
                      color: "#0f172a",
                      background: "transparent",
                    }}
                    {...inputProps}
                  />
                  <button
                    type="button"
                    disabled={isAtMax || !inStock}
                    onClick={handleIncrement}
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      border: "none",
                      background: "transparent",
                      fontSize: "16px",
                      cursor: isAtMax || !inStock ? "not-allowed" : "pointer",
                      fontWeight: 700,
                      opacity: isAtMax || !inStock ? 0.22 : 1,
                      color: isAtMax || !inStock ? "#94a3b8" : "#334155",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
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
                  disabled={!inStock || pendingItemIds.has(String(prodId))}
                  onClick={async () => { if (await addToCart(prodId, numericValue)) closeQuickView(); }}
                  style={{
                    flex: 1,
                    padding: "11px 16px",
                    borderRadius: "30px",
                    border: "none",
                    background: inStock
                      ? "linear-gradient(135deg, #e57c32, #f59e0b)"
                      : "#d1d5db",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: "13px",
                    cursor: inStock ? "pointer" : "not-allowed",
                    minWidth: "120px",
                  }}
                >
                  {t("common.addCart")}
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
                  }}
                >
                  {t("common.viewDetail", "View Details")}
                </button>
              </div>

              {/* Meta info */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "13px" }}>
                {prod.sku && (
                  <div style={{ display: "flex", gap: "8px" }}>
                    <span style={{ fontWeight: 600, color: "#374151", minWidth: "80px" }}>
                      {t("common.sku")}:
                    </span>
                    <span style={{ color: "#6b7280" }}>{prod.sku}</span>
                  </div>
                )}
                {(prod.category?.name ?? prod.categoryName) && (
                  <div style={{ display: "flex", gap: "8px" }}>
                    <span style={{ fontWeight: 600, color: "#374151", minWidth: "80px" }}>
                      {t("common.categories")}:
                    </span>
                    <span style={{ color: "#6b7280" }}>
                      {prod.category?.name ?? prod.categoryName}
                    </span>
                  </div>
                )}
                {(prod.weightKg ?? prod.weight_kg) && (
                  <div style={{ display: "flex", gap: "8px" }}>
                    <span style={{ fontWeight: 600, color: "#374151", minWidth: "80px" }}>
                      {t("productDetail.weight", "Weight")}:
                    </span>
                    <span style={{ color: "#6b7280" }}>
                      {prod.weightKg ?? prod.weight_kg} kg
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes qvSlideUp {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </>
  );
};

export default QuickViewModal;
