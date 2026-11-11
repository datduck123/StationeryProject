// Migrated from: assets/js/app.js, lines 384-415
import { useState, useEffect } from "react";

export const usePriceSlider = ({
  initialMin = 0,
  initialMax = 150000,
  maxLimit = 150000,
  priceGap = 5000,
  onPriceChange,
} = {}) => {
  const [minPrice, setMinPrice] = useState(initialMin);
  const [maxPrice, setMaxPrice] = useState(initialMax);

  useEffect(() => {
    setMinPrice(initialMin);
    setMaxPrice(initialMax);
  }, [initialMin, initialMax]);

  const notifyChange = (newMin, newMax) => {
    if (onPriceChange) {
      onPriceChange({ minPrice: newMin, maxPrice: newMax });
    }
  };

  const handleMinInputChange = (e) => {
    const val = parseInt(e.target.value) || 0;
    if (maxPrice - val >= priceGap && val >= 0) {
      setMinPrice(val);
      notifyChange(val, maxPrice);
    }
  };

  const handleMaxInputChange = (e) => {
    const val = parseInt(e.target.value) || 0;
    if (val - minPrice >= priceGap && val <= maxLimit) {
      setMaxPrice(val);
      notifyChange(minPrice, val);
    }
  };

  const handleMinRangeChange = (e) => {
    const val = parseInt(e.target.value) || 0;
    let newMin = val;
    if (maxPrice - val < priceGap) {
      newMin = maxPrice - priceGap;
    }
    setMinPrice(newMin);
    notifyChange(newMin, maxPrice);
  };

  const handleMaxRangeChange = (e) => {
    const val = parseInt(e.target.value) || 0;
    let newMax = val;
    if (val - minPrice < priceGap) {
      newMax = minPrice + priceGap;
    }
    setMaxPrice(newMax);
    notifyChange(minPrice, newMax);
  };

  const leftPercent = Math.min(Math.max((minPrice / maxLimit) * 100, 0), 100);
  const rightPercent = Math.min(Math.max(100 - (maxPrice / maxLimit) * 100, 0), 100);

  return {
    minPrice,
    maxPrice,
    maxLimit,
    leftPercent,
    rightPercent,
    handleMinInputChange,
    handleMaxInputChange,
    handleMinRangeChange,
    handleMaxRangeChange,
    setMinPrice,
    setMaxPrice,
  };
};

export default usePriceSlider;
