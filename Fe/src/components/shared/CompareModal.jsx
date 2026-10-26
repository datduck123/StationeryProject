// Rewritten: Uses real compareList from CartContext instead of static placeholder data
// Supports up to 2 real products, highlights best price
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCartContext } from "../../providers/CartContext";
import { getProductImage } from "../../services/productService";

const formatCurrency = (amount, language) => {
  if (amount == null) return "—";
  const locale = String(language).startsWith("en") ? "en-US" : "vi-VN";
  const currency = String(language).startsWith("en") ? "USD" : "VND";
  if (String(language).startsWith("en")) {
    // Show in VND but with English format for now (VND only available)
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
  }
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
};

const StarRating = ({ rating = 5 }) => {
  const full = Math.round(rating);
  return (
    <span style={{ color: "#f59e0b", fontSize: "16px", letterSpacing: "2px" }}>
      {"★".repeat(full)}{"☆".repeat(5 - full)}
    </span>
  );
};

const Badge = ({ children, color }) => (
  <span
    style={{
      display: "inline-block",
      padding: "3px 10px",
      borderRadius: "20px",
      fontSize: "12px",
      fontWeight: 600,
      backgroundColor: color === "green" ? "#dcfce7" : "#fee2e2",
      color: color === "green" ? "#15803d" : "#dc2626",
    }}
  >
    {children}
  </span>
);

// Placeholder when slot is empty
const EmptySlot = ({ label }) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "32px 20px",
      border: "2px dashed #e5e7eb",
      borderRadius: "12px",
      minWidth: "180px",
      gap: "12px",
      color: "#9ca3af",
    }}
  >
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
      <line x1="11" y1="8" x2="11" y2="14" />
      <line x1="8" y1="11" x2="14" y2="11" />
    </svg>
    <p style={{ fontSize: "13px", textAlign: "center", margin: 0 }}>
      {label}
    </p>
  </div>
);

export const CompareModal = () => {
  const { isCompareOpen, closeCompare, compareList, removeCompareProduct } = useCartContext();
  const { t, i18n } = useTranslation();

  if (!isCompareOpen) return null;

  const prod1 = compareList[0] || null;
  const prod2 = compareList[1] || null;

  // Determine which product has lower price (highlight)
  const bestPriceId =
    prod1 && prod2
      ? prod1.price <= prod2.price
        ? prod1.id || prod1.productId
        : prod2.id || prod2.productId
      : null;

  const rows = [
    {
      label: t("common.price", "Price"),
      key: "price",
      render: (p) => {
        const id = p.id || p.productId;
        const isBest = id === bestPriceId && prod1 && prod2;
        return (
          <div style={{ textAlign: "center" }}>
            <span
              style={{
                fontSize: "18px",
                fontWeight: 700,
                color: isBest ? "#16a34a" : "#1f2937",
              }}
            >
              {formatCurrency(p.price, i18n.language)}
            </span>
            {isBest && (
              <div style={{ fontSize: "11px", color: "#16a34a", marginTop: "4px" }}>
                {t("compare.betterPrice", "✓ Better price")}
              </div>
            )}
          </div>
        );
      },
    },
    {
      label: t("common.reviews", "Reviews"),
      key: "rating",
      render: (p) => (
        <div style={{ textAlign: "center" }}>
          <StarRating rating={p.rating ?? 5} />
          <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "4px" }}>
            {p.rating ?? 5}/5
          </div>
        </div>
      ),
    },
    {
      label: t("compare.status", "Status"),
      key: "stock",
      render: (p) => (
        <div style={{ textAlign: "center" }}>
          {(p.stockQuantity ?? p.stock_quantity ?? 0) > 0 ? (
            <Badge color="green">{t("common.inStock", "In Stock")}</Badge>
          ) : (
            <Badge color="red">{t("common.outOfStock", "Out of Stock")}</Badge>
          )}
          <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "4px" }}>
            {p.stockQuantity ?? p.stock_quantity ?? 0} {t("compare.productsCount", "products")}
          </div>
        </div>
      ),
    },
    {
      label: t("common.categories", "Categories"),
      key: "category",
      render: (p) => (
        <div style={{ textAlign: "center", fontSize: "13px", color: "#4b5563" }}>
          {p.category?.name ?? p.categoryName ?? "—"}
        </div>
      ),
    },
    {
      label: t("common.brand", "Brand"),
      key: "brand",
      render: (p) => (
        <div style={{ textAlign: "center", fontSize: "13px", color: "#4b5563" }}>
          {p.brand?.name ?? p.brandName ?? "—"}
        </div>
      ),
    },
    {
      label: t("productDetail.weight", "Weight"),
      key: "weight",
      render: (p) => (
        <div style={{ textAlign: "center", fontSize: "13px", color: "#4b5563" }}>
          {p.weightKg ?? p.weight_kg ? `${p.weightKg ?? p.weight_kg} kg` : "—"}
        </div>
      ),
    },
    {
      label: t("compare.status", "Status"),
      key: "status",
      render: (p) => (
        <div style={{ textAlign: "center" }}>
          <Badge color={p.status === "ACTIVE" ? "green" : "red"}>
            {p.status === "ACTIVE" ? t("compare.active", "Active") : t("compare.inactive", "Inactive")}
          </Badge>
        </div>
      ),
    },
  ];

  const renderProductHeader = (prod, slot) => {
    if (!prod) return <EmptySlot label={t("compare.addMore", "Add product to compare")} />;
    const prodId = prod.id || prod.productId;
    return (
      <div style={{ textAlign: "center", padding: "0 12px" }}>
        <div style={{ position: "relative", display: "inline-block", marginBottom: "12px" }}>
          <img
            src={getProductImage(prod)}
            alt={prod.name}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "/assets/media/products/product-7.png";
            }}
            style={{
              width: "120px",
              height: "120px",
              objectFit: "contain",
              borderRadius: "10px",
              border: "1px solid #f3f4f6",
              padding: "8px",
              background: "#fafafa",
            }}
          />
          <button
            type="button"
            title={t("compare.remove", "Remove from compare")}
            onClick={() => removeCompareProduct(prodId)}
            style={{
              position: "absolute",
              top: "-6px",
              right: "-6px",
              width: "22px",
              height: "22px",
              borderRadius: "50%",
              border: "none",
              background: "#ef4444",
              color: "#fff",
              fontSize: "12px",
              lineHeight: "22px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ×
          </button>
        </div>
        <Link
          to={`/product/${prodId}`}
          onClick={closeCompare}
          style={{
            display: "block",
            fontSize: "14px",
            fontWeight: 700,
            color: "#1f2937",
            textDecoration: "none",
            lineHeight: "1.3",
            marginBottom: "6px",
            maxWidth: "160px",
            margin: "0 auto 6px",
          }}
        >
          {prod.name}
        </Link>
        <div style={{ fontSize: "11px", color: "#9ca3af" }}>
          SKU: {prod.sku ?? "—"}
        </div>
      </div>
    );
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.55)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
      onClick={closeCompare}
    >
      <div
        style={{
          background: "#ffffff",
          borderRadius: "20px",
          boxShadow: "0 25px 60px rgba(0,0,0,0.2)",
          maxWidth: "700px",
          width: "100%",
          maxHeight: "90vh",
          overflowY: "auto",
          animation: "slideUp 0.3s ease",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "20px 28px 16px",
            borderBottom: "1px solid #f3f4f6",
            position: "sticky",
            top: 0,
            background: "#fff",
            zIndex: 1,
            borderRadius: "20px 20px 0 0",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: "linear-gradient(135deg, #e57c32, #f59e0b)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="20" x2="18" y2="10" />
                <line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6" y1="20" x2="6" y2="14" />
              </svg>
            </div>
            <div>
              <h5 style={{ margin: 0, fontWeight: 700, fontSize: "18px", color: "#1f2937" }}>
                {t("modals.compareProducts", "Compare Products")}
              </h5>
              <p style={{ margin: 0, fontSize: "12px", color: "#9ca3af" }}>
                {t("compare.selectedCount", { count: compareList.length, total: 2, defaultValue: `${compareList.length}/2 products selected` })}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeCompare}
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              border: "1px solid #e5e7eb",
              background: "#f9fafb",
              color: "#6b7280",
              fontSize: "16px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "24px 28px" }}>
          {/* Product headers */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "140px 1fr 1fr",
              gap: "16px",
              marginBottom: "24px",
              alignItems: "start",
            }}
          >
            <div />
            {renderProductHeader(prod1, 0)}
            {renderProductHeader(prod2, 1)}
          </div>

          {/* Divider */}
          <div style={{ height: "1px", background: "#f3f4f6", marginBottom: "16px" }} />

          {/* Comparison rows */}
          {rows.map((row, idx) => (
            <div
              key={row.key}
              style={{
                display: "grid",
                gridTemplateColumns: "140px 1fr 1fr",
                gap: "16px",
                alignItems: "center",
                padding: "12px 0",
                borderBottom: idx < rows.length - 1 ? "1px solid #f9fafb" : "none",
                background: idx % 2 === 0 ? "transparent" : "#fafafa",
                borderRadius: "8px",
                paddingLeft: idx % 2 === 1 ? "8px" : "0",
                paddingRight: idx % 2 === 1 ? "8px" : "0",
              }}
            >
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#374151",
                }}
              >
                {row.label}
              </div>
              <div>{prod1 ? row.render(prod1) : <div style={{ textAlign: "center", color: "#d1d5db" }}>—</div>}</div>
              <div>{prod2 ? row.render(prod2) : <div style={{ textAlign: "center", color: "#d1d5db" }}>—</div>}</div>
            </div>
          ))}

          {/* Action buttons */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "140px 1fr 1fr",
              gap: "16px",
              marginTop: "20px",
            }}
          >
            <div />
            {prod1 ? (
              <div style={{ textAlign: "center" }}>
                <Link
                  to={`/product/${prod1.id || prod1.productId}`}
                  onClick={closeCompare}
                  style={{
                    display: "inline-block",
                    padding: "8px 20px",
                    background: "linear-gradient(135deg, #e57c32, #f59e0b)",
                    color: "#fff",
                    borderRadius: "24px",
                    fontSize: "13px",
                    fontWeight: 600,
                    textDecoration: "none",
                  }}
                >
                  {t("common.viewDetail", "View Details")}
                </Link>
              </div>
            ) : <div />}
            {prod2 ? (
              <div style={{ textAlign: "center" }}>
                <Link
                  to={`/product/${prod2.id || prod2.productId}`}
                  onClick={closeCompare}
                  style={{
                    display: "inline-block",
                    padding: "8px 20px",
                    background: "linear-gradient(135deg, #e57c32, #f59e0b)",
                    color: "#fff",
                    borderRadius: "24px",
                    fontSize: "13px",
                    fontWeight: 600,
                    textDecoration: "none",
                  }}
                >
                  {t("common.viewDetail", "View Details")}
                </Link>
              </div>
            ) : <div />}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default CompareModal;
