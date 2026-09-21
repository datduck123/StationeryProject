// Migrated from: assets/js/app.js, lines 416-429; HTML quantity block
// HTML->JSX conversion: class -> className, input value/onChange handling
import { useState } from "react";

export const QuantitySelector = ({ initialValue = 1, min = 1, onChange }) => {
  const [quantity, setQuantity] = useState(initialValue);

  const handleDecrement = (e) => {
    e.preventDefault();
    if (quantity > min) {
      const next = quantity - 1;
      setQuantity(next);
      if (onChange) onChange(next);
    }
  };

  const handleIncrement = (e) => {
    e.preventDefault();
    const next = quantity + 1;
    setQuantity(next);
    if (onChange) onChange(next);
  };

  const handleChange = (e) => {
    const val = parseInt(e.target.value) || min;
    setQuantity(Math.max(min, val));
    if (onChange) onChange(Math.max(min, val));
  };

  return (
    <div className="quantity quantity-wrap">
      <div className="input-area quantity-wrap">
        <input
          className="decrement"
          type="button"
          value="-"
          onClick={handleDecrement}
        />
        <input
          type="text"
          name="quantity"
          value={quantity}
          maxLength={2}
          size={1}
          className="number"
          onChange={handleChange}
        />
        <input
          className="increment"
          type="button"
          value="+"
          onClick={handleIncrement}
        />
      </div>
    </div>
  );
};

export default QuantitySelector;
