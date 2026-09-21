// Migrated from: assets/js/app.js, lines 384-415
import { useState } from "react";

export const usePriceSlider = (
  initialMin = 1000,
  initialMax = 5000,
  maxLimit = 10000,
  priceGap = 1000,
) => {
  const [minPrice, setMinPrice] = useState(initialMin);
  const [maxPrice, setMaxPrice] = useState(initialMax);

  const handleMinInputChange = (e) => {
    const val = parseInt(e.target.value) || 0;
    if (maxPrice - val >= priceGap && val >= 0) {
      setMinPrice(val);
    }
  };

  const handleMaxInputChange = (e) => {
    const val = parseInt(e.target.value) || 0;
    if (val - minPrice >= priceGap && val <= maxLimit) {
      setMaxPrice(val);
    }
  };

  const handleMinRangeChange = (e) => {
    const val = parseInt(e.target.value) || 0;
    if (maxPrice - val < priceGap) {
      setMinPrice(maxPrice - priceGap);
    } else {
      setMinPrice(val);
    }
  };

  const handleMaxRangeChange = (e) => {
    const val = parseInt(e.target.value) || 0;
    if (val - minPrice < priceGap) {
      setMaxPrice(minPrice + priceGap);
    } else {
      setMaxPrice(val);
    }
  };

  const leftPercent = (minPrice / maxLimit) * 100;
  const rightPercent = 100 - (maxPrice / maxLimit) * 100;

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
  };
};

export default usePriceSlider;
