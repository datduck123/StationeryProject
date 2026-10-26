// Migrated from: shop-grid-sidebar.html, lines 310-353; assets/js/app.js lines 384-415
// HTML->JSX conversion: class -> className, input self-closing tags, controlled value and style props
import { useTranslation } from "react-i18next";
import { usePriceSlider } from "../../hooks/usePriceSlider";

export const PriceSlider = ({
  initialMin = 0,
  initialMax = 150000,
  maxLimit = 150000,
  priceGap = 5000,
  step = 5000,
  currency = "₫",
  isFiltered = false,
  onApplyPrice,
  onResetPrice,
}) => {
  const { t } = useTranslation();
  const {
    minPrice,
    maxPrice,
    leftPercent,
    rightPercent,
    handleMinInputChange,
    handleMaxInputChange,
    handleMinRangeChange,
    handleMaxRangeChange,
  } = usePriceSlider({
    initialMin,
    initialMax,
    maxLimit,
    priceGap,
  });

  const handleApply = () => {
    if (onApplyPrice) {
      onApplyPrice(minPrice, maxPrice);
    }
  };

  return (
    <div className="wrapper" style={{ paddingTop: "4px" }}>
      {/* Inputs From - To */}
      <div className="d-flex align-items-center justify-content-between gap-12 mb-20">
        <div style={{ flex: 1 }}>
          <label
            style={{
              display: "block",
              fontSize: "12px",
              fontWeight: "600",
              color: "#374151",
              marginBottom: "6px",
            }}
          >
            {t("shop.from", "From")}
          </label>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              padding: "7px 10px",
              backgroundColor: "#ffffff",
              transition: "border-color 0.2s ease",
            }}
          >
            <span
              style={{
                fontSize: "13px",
                fontWeight: "600",
                color: "#9ca3af",
                marginRight: "6px",
                flexShrink: 0,
              }}
            >
              {currency}
            </span>
            <input
              type="number"
              style={{
                width: "100%",
                border: "none",
                outline: "none",
                background: "transparent",
                textAlign: "right",
                fontSize: "13px",
                fontWeight: "500",
                color: "#1f2937",
                padding: 0,
              }}
              value={minPrice}
              onChange={handleMinInputChange}
            />
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <label
            style={{
              display: "block",
              fontSize: "12px",
              fontWeight: "600",
              color: "#374151",
              marginBottom: "6px",
            }}
          >
            {t("shop.to", "To")}
          </label>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              padding: "7px 10px",
              backgroundColor: "#ffffff",
              transition: "border-color 0.2s ease",
            }}
          >
            <span
              style={{
                fontSize: "13px",
                fontWeight: "600",
                color: "#9ca3af",
                marginRight: "6px",
                flexShrink: 0,
              }}
            >
              {currency}
            </span>
            <input
              type="number"
              style={{
                width: "100%",
                border: "none",
                outline: "none",
                background: "transparent",
                textAlign: "right",
                fontSize: "13px",
                fontWeight: "500",
                color: "#1f2937",
                padding: 0,
              }}
              value={maxPrice}
              onChange={handleMaxInputChange}
            />
          </div>
        </div>
      </div>

      {/* Slider Bar */}
      <div style={{ position: "relative", marginBottom: "26px", paddingTop: "4px" }}>
        <div
          className="slider"
          style={{
            height: "6px",
            position: "relative",
            backgroundColor: "#e5e7eb",
            borderRadius: "6px",
          }}
        >
          <div
            className="progress"
            style={{
              height: "100%",
              left: `${leftPercent}%`,
              right: `${rightPercent}%`,
              position: "absolute",
              backgroundColor: "#e57c32",
              borderRadius: "6px",
            }}
          ></div>
        </div>
        <div
          className="range-input"
          style={{
            position: "relative",
            height: "16px",
          }}
        >
          <input
            type="range"
            className="range-min"
            min="0"
            max={maxLimit}
            value={minPrice}
            step={step}
            onChange={handleMinRangeChange}
            style={{
              position: "absolute",
              width: "100%",
              height: "6px",
              top: "-6px",
              background: "none",
              pointerEvents: "none",
              appearance: "none",
              WebkitAppearance: "none",
            }}
          />
          <input
            type="range"
            className="range-max"
            min="0"
            max={maxLimit}
            value={maxPrice}
            step={step}
            onChange={handleMaxRangeChange}
            style={{
              position: "absolute",
              width: "100%",
              height: "6px",
              top: "-6px",
              background: "none",
              pointerEvents: "none",
              appearance: "none",
              WebkitAppearance: "none",
            }}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="d-flex align-items-center gap-10">
        <button
          type="button"
          onClick={handleApply}
          style={{
            flex: 1,
            height: "38px",
            backgroundColor: "var(--color-primary, #e57c32)",
            color: "#ffffff",
            border: "none",
            borderRadius: "8px",
            fontWeight: "600",
            fontSize: "13px",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            boxShadow: "0 2px 5px rgba(229, 124, 50, 0.2)",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
          </svg>
          {t("shop.apply", "Apply")}
        </button>
        {isFiltered && (
          <button
            type="button"
            onClick={onResetPrice}
            style={{
              height: "38px",
              padding: "0 14px",
              backgroundColor: "#ffffff",
              color: "#4b5563",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              fontWeight: "500",
              fontSize: "13px",
              cursor: "pointer",
              transition: "all 0.2s ease",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#f3f4f6";
              e.currentTarget.style.borderColor = "#9ca3af";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#ffffff";
              e.currentTarget.style.borderColor = "#d1d5db";
            }}
          >
            {t("shop.resetFilter", "Reset")}
          </button>
        )}
      </div>
    </div>
  );
};

export default PriceSlider;
