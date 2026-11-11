// HTML->JSX conversion: class -> className, input value/onChange handling
import useQuantityInput from "../../hooks/useQuantityInput";

export const QuantitySelector = ({
  initialValue = 1,
  value,
  min = 1,
  max = 999,
  maxStock,
  onChange,
  disabled = false,
}) => {
  const effectiveMaxStock = maxStock ?? max;
  const currentVal = value !== undefined ? value : initialValue;

  const {
    inputProps,
    handleIncrement,
    handleDecrement,
    isAtMin,
    isAtMax,
  } = useQuantityInput({
    value: currentVal,
    maxStock: effectiveMaxStock,
    min,
    onChange,
  });

  return (
    <div className="quantity quantity-wrap">
      <div className="input-area quantity-wrap">
        <input
          className="decrement"
          type="button"
          value="-"
          disabled={disabled || isAtMin}
          onClick={handleDecrement}
        />
        <input
          name="quantity"
          className="number text-center"
          disabled={disabled}
          style={{ width: "45px" }}
          {...inputProps}
        />
        <input
          className="increment"
          type="button"
          value="+"
          disabled={disabled || isAtMax}
          onClick={handleIncrement}
        />
      </div>
    </div>
  );
};

export default QuantitySelector;
