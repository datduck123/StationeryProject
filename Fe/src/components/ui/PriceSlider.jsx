// Migrated from: shop-grid-sidebar.html, lines 310-353; assets/js/app.js lines 384-415
// HTML->JSX conversion: class -> className, input self-closing tags, controlled value and style props
import { useTranslation } from "react-i18next";
import { usePriceSlider } from "../../hooks/usePriceSlider";

export const PriceSlider = () => {
  const { t } = useTranslation();
  const {
    minPrice,
    maxPrice,
    maxLimit,
    leftPercent,
    rightPercent,
    handleMinInputChange,
    handleMaxInputChange,
    handleMinRangeChange,
    handleMaxRangeChange,
  } = usePriceSlider(2500, 7500, 10000, 1000);

  return (
    <div className="wrapper">
      <div className="price-input mb-24">
        <div className="field">
          <div className="medium-black mb-4p">{t("shop.from", "From")}</div>
          <div className="sidebar-price-block">
            <p className="price-sign">$</p>
            <input
              type="number"
              className="input-min dark-gray"
              value={minPrice}
              onChange={handleMinInputChange}
            />
          </div>
        </div>
        <div className="field">
          <div className="medium-black mb-4p">{t("shop.to", "To")}</div>
          <div className="sidebar-price-block">
            <p className="price-sign">$</p>
            <input
              type="number"
              className="input-max dark-gray"
              value={maxPrice}
              onChange={handleMaxInputChange}
            />
          </div>
        </div>
      </div>
      <div className="slider">
        <div
          className="progress"
          style={{
            left: `${leftPercent}%`,
            right: `${rightPercent}%`,
          }}
        ></div>
      </div>
      <div className="range-input">
        <input
          type="range"
          className="range-min"
          min="0"
          max={maxLimit}
          value={minPrice}
          step="100"
          onChange={handleMinRangeChange}
        />
        <input
          type="range"
          className="range-max"
          min="0"
          max={maxLimit}
          value={maxPrice}
          step="100"
          onChange={handleMaxRangeChange}
        />
      </div>
    </div>
  );
};

export default PriceSlider;
