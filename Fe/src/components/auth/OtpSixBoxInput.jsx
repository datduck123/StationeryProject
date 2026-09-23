import React, { useRef } from "react";

export const OtpSixBoxInput = ({
  value = "",
  onChange,
  disabled = false,
  autoFocus = true,
}) => {
  const inputRefs = useRef([]);

  // Ensure value is treated as an array of 6 characters
  const digits = Array.from({ length: 6 }, (_, index) => value[index] || "");

  const handleInputChange = (index, e) => {
    const rawChar = e.target.value;
    // Extract only digits from the newly typed character (last char if length > 1)
    const digitChar = rawChar.replace(/\D/g, "").slice(-1);

    const newDigits = [...digits];
    newDigits[index] = digitChar;
    const combined = newDigits.join("");
    onChange(combined);

    // If a digit was entered, auto-focus next box
    if (digitChar && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      if (!digits[index] && index > 0) {
        // Current box is empty, jump to previous box and clear it
        inputRefs.current[index - 1]?.focus();
        const newDigits = [...digits];
        newDigits[index - 1] = "";
        onChange(newDigits.join(""));
      } else if (digits[index]) {
        // Current box has value, clear it
        const newDigits = [...digits];
        newDigits[index] = "";
        onChange(newDigits.join(""));
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").trim();
    const cleanDigits = pastedData.replace(/\D/g, "").slice(0, 6);
    if (!cleanDigits) return;

    onChange(cleanDigits);

    // Focus on the next appropriate index
    const nextIndex = Math.min(cleanDigits.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  return (
    <div
      style={{
        display: "flex",
        gap: "10px",
        justifyContent: "center",
        margin: "16px 0",
      }}
    >
      {digits.map((digit, idx) => (
        <input
          key={idx}
          ref={(el) => (inputRefs.current[idx] = el)}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={digit}
          disabled={disabled}
          autoFocus={autoFocus && idx === 0}
          onChange={(e) => handleInputChange(idx, e)}
          onKeyDown={(e) => handleKeyDown(idx, e)}
          onPaste={handlePaste}
          style={{
            width: "46px",
            height: "52px",
            fontSize: "22px",
            fontWeight: "700",
            textAlign: "center",
            borderRadius: "10px",
            border: digit ? "2px solid #e9613f" : "1.5px solid #d1d5db",
            backgroundColor: disabled ? "#f3f4f6" : "#ffffff",
            color: "#1f2937",
            outline: "none",
            boxShadow: digit ? "0 0 0 3px rgba(233, 97, 63, 0.12)" : "none",
            transition: "all 0.2s ease",
          }}
          onFocus={(e) => {
            e.target.style.borderColor = "#e9613f";
            e.target.style.boxShadow = "0 0 0 3px rgba(233, 97, 63, 0.2)";
          }}
          onBlur={(e) => {
            if (!digit) {
              e.target.style.borderColor = "#d1d5db";
              e.target.style.boxShadow = "none";
            }
          }}
        />
      ))}
    </div>
  );
};

export default OtpSixBoxInput;
