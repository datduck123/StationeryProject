import { useState, useEffect, useCallback, useRef } from "react";

/**
 * Hook to manage quantity input with strict numeric validation,
 * automatic clamping/snapping to available stock limit,
 * and keyboard controls.
 *
 * @param {Object} options
 * @param {number|string} options.value Current quantity value
 * @param {number} [options.maxStock=999999] Available stock quantity
 * @param {number} [options.min=1] Minimum allowed quantity (defaults to 1, or 0 if out of stock)
 * @param {function} [options.onChange] Callback when quantity changes / commits
 * @param {boolean} [options.commitOnBlurOnly=false] If true, onChange only fires on blur or step
 */
export function useQuantityInput({
  value = 1,
  maxStock = 999999,
  maxLimit,
  min = 1,
  onChange,
  commitOnBlurOnly = false,
}) {
  const parsedStock = Number(maxStock);
  const effectiveMax = Number.isFinite(parsedStock) ? Math.max(0, parsedStock) : 999999;
  const effectiveMin = effectiveMax <= 0 ? 0 : Math.max(0, Number(min) || 1);
  const orderLimit = effectiveMax;

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

      // If user inputs a number greater than available stock, snap directly to available stock
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
