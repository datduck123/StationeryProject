// Migrated from: index.html, lines 3380-3502
// Fixed: uses real quickViewProduct fields (name, imageUrl, price, stockQuantity, sku, category, brand, description)
import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCartContext } from "../../providers/CartContext";
import { getProductImage } from "../../services/productService";

const formatCurrency = (amount) => {
  if (amount == null) return "—";
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
};

export const QuickViewModal = () => {
  const { quickViewProduct, closeQuickView, openCart } = useCartContext();
  const { t } = useTranslation();
  const [quantity, setQuantity] = useState(1);

  if (!quickViewProduct) return null;

  const prod = quickViewProduct;
  const stockQty = prod.stockQuantity ?? prod.stock_quantity ?? 0;
  const inStock = stockQty > 0;
  const imgSrc = getProductImage(prod);
  const prodId = prod.id || prod.productId;

  const subtotal = formatCurrency((prod.price ?? 0) * quantity);

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
                  {inStock ? `Còn hàng (${stockQty})` : "Hết hàng"}
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
                {prod.name || "Sản phẩm"}
              </h4>

              {/* Category & Brand */}
              <p style={{ fontSize: "13px", color: "#9ca3af", marginBottom: "12px" }}>
                {[prod.category?.name ?? prod.categoryName, prod.brand?.name ?? prod.brandName]
                  .filter(Boolean)
                  .join(" · ")}
              </p>

              {/* Stars */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "16px",
                }}
              >
                <span style={{ color: "#f59e0b", fontSize: "16px" }}>★★★★★</span>
                <span style={{ fontSize: "13px", color: "#6b7280" }}>(02 đánh giá)</span>
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
                  {formatCurrency(prod.price)}
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
                <span style={{ fontWeight: 600, fontSize: "14px", color: "#374151" }}>Số lượng:</span>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    overflow: "hidden",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    style={{
                      width: "36px",
                      height: "36px",
                      border: "none",
                      background: "#f9fafb",
                      fontSize: "16px",
                      cursor: "pointer",
                      fontWeight: 700,
                    }}
                  >
                    −
                  </button>
                  <span
                    style={{
                      width: "40px",
                      textAlign: "center",
                      fontWeight: 600,
                      fontSize: "15px",
                    }}
                  >
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    style={{
                      width: "36px",
                      height: "36px",
                      border: "none",
                      background: "#f9fafb",
                      fontSize: "16px",
                      cursor: "pointer",
                      fontWeight: 700,
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
                  disabled={!inStock}
                  onClick={() => { openCart(); closeQuickView(); }}
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
                <Link
                  to={`/product/${prodId}`}
                  onClick={closeQuickView}
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
                  Xem chi tiết
                </Link>
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
                      Trọng lượng:
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
