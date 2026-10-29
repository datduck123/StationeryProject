import { useState, useEffect, useCallback, useRef } from "react";

/**
 * Hook to manage quantity input with strict numeric validation,
 * automatic clamping/snapping to stock limit (maximum 20 per item per order),
 * and keyboard controls.
 *
 * @param {Object} options
 * @param {number|string} options.value Current quantity value
 * @param {number} [options.maxStock=20] Available stock quantity
 * @param {number} [options.maxLimit=20] Maximum allowed purchase limit per order (default 20)
 * @param {number} [options.min=1] Minimum allowed quantity (defaults to 1, or 0 if out of stock)
 * @param {function} [options.onChange] Callback when quantity changes / commits
 * @param {boolean} [options.commitOnBlurOnly=false] If true, onChange only fires on blur or step
 */
export function useQuantityInput({
  value = 1,
  maxStock = 20,
  maxLimit = 20,
  min = 1,
  onChange,
  commitOnBlurOnly = false,
}) {
  const parsedLimit = Number(maxLimit);
  const orderLimit = Number.isFinite(parsedLimit) && parsedLimit > 0 ? parsedLimit : 20;

  const parsedStock = Number(maxStock);
  const stockLimit = Number.isFinite(parsedStock) ? Math.max(0, parsedStock) : orderLimit;

  // The effective maximum is the minimum between actual stock and max purchase limit (20)
  // E.g., stock = 10 -> max is 10. stock = 50 -> max is 20.
  const effectiveMax = Math.min(stockLimit, orderLimit);
  const effectiveMin = effectiveMax <= 0 ? 0 : Math.max(0, Number(min) || 1);

  const clamp = useCallback(
    (val) => {
      if (effectiveMax <= 0) return 0;
      let num = parseInt(val, 10);
      if (isNaN(num) || num < effectiveMin) {
        return effectiveMin;
      }
      if (num > effectiveMax) {
        return effectiveMax;
      }
      return num;
    },
    [effectiveMax, effectiveMin]
  );

  const [displayValue, setDisplayValue] = useState(() => String(clamp(value)));
  const isFocusedRef = useRef(false);

  // Sync display value when incoming prop value changes, unless user is currently editing it
  useEffect(() => {
    if (!isFocusedRef.current) {
      const clamped = clamp(value);
      setDisplayValue(String(clamped));
    }
  }, [value, clamp]);

  // Handle keyboard typing: strictly allow ONLY digits 0-9 and navigation/action keys
  const handleKeyDown = useCallback((e) => {
    const allowedKeys = [
      "Backspace",
      "Delete",
      "Tab",
      "Escape",
      "Enter",
      "ArrowLeft",
      "ArrowRight",
      "ArrowUp",
      "ArrowDown",
      "Home",
      "End",
    ];

    if (allowedKeys.includes(e.key)) {
      if (e.key === "Enter") {
        e.currentTarget.blur();
      }
      return;
    }

    // Allow keyboard shortcuts (Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+Z, etc.)
    if (e.ctrlKey || e.metaKey) {
      return;
    }

    // Reject all non-digits (letters, symbols, dashes, dots, spaces, etc.)
    if (!/^\d$/.test(e.key)) {
      e.preventDefault();
    }
  }, []);

  // Handle input changes (handles paste, mobile keyboards, etc.)
  const handleChange = useCallback(
    (e) => {
      // Strip any non-digit character completely
      const rawDigits = e.target.value.replace(/\D/g, "");

      // Allow empty string temporarily while typing so user can backspace and retype
      if (rawDigits === "") {
        setDisplayValue("");
        if (!commitOnBlurOnly && onChange) {
          onChange(effectiveMin);
        }
        return;
      }

      let num = parseInt(rawDigits, 10);

      // If user inputs a number greater than effective max (min of stock & 20), snap directly to effective max
      if (effectiveMax > 0 && num > effectiveMax) {
        num = effectiveMax;
      }

      setDisplayValue(String(num));

      if (!commitOnBlurOnly && onChange) {
        onChange(num);
      }
    },
    [effectiveMax, effectiveMin, commitOnBlurOnly, onChange]
  );

  const handleFocus = useCallback(() => {
    isFocusedRef.current = true;
  }, []);

  const handleBlur = useCallback(() => {
    isFocusedRef.current = false;
    const finalVal = clamp(displayValue);
    setDisplayValue(String(finalVal));
    if (onChange && finalVal !== Number(value)) {
      onChange(finalVal);
    }
  }, [clamp, displayValue, onChange, value]);

  const step = useCallback(
    (delta) => {
      const current = parseInt(displayValue, 10) || Number(value) || effectiveMin;
      const next = clamp(current + delta);
      setDisplayValue(String(next));
      if (onChange && next !== Number(value)) {
        onChange(next);
      }
    },
    [clamp, displayValue, effectiveMin, onChange, value]
  );

  const handleIncrement = useCallback(() => {
    step(1);
  }, [step]);

  const handleDecrement = useCallback(() => {
    step(-1);
  }, [step]);

  const currentNum = parseInt(displayValue, 10);
  const isAtMin = effectiveMax <= 0 || (Number.isFinite(currentNum) ? currentNum <= effectiveMin : true);
  const isAtMax = effectiveMax <= 0 || (Number.isFinite(currentNum) ? currentNum >= effectiveMax : false);

  return {
    value: displayValue,
    numericValue: clamp(displayValue),
    inputProps: {
      type: "text",
      inputMode: "numeric",
      pattern: "[0-9]*",
      value: displayValue,
      onChange: handleChange,
      onKeyDown: handleKeyDown,
      onFocus: handleFocus,
      onBlur: handleBlur,
      autoComplete: "off",
    },
    step,
    handleIncrement,
    handleDecrement,
    isAtMin,
    isAtMax,
    effectiveMax,
    effectiveMin,
    orderLimit,
    clamp,
  };
}

export default useQuantityInput;
