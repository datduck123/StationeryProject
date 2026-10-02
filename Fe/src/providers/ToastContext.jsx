import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

const ToastContext = createContext(null);

const ToastItem = ({ toast, onRemove }) => {
  const isSuccess = toast.type === "success";
  const isError = toast.type === "error" || toast.type === "danger";
  const isWarning = toast.type === "warning";

  const totalDuration = toast.duration || (isError ? 8000 : 3500);
  const [remainingMs, setRemainingMs] = useState(totalDuration);

  useEffect(() => {
    if (!totalDuration || totalDuration <= 0) return;

    const interval = 100;
    const timer = setInterval(() => {
      setRemainingMs((prev) => {
        if (prev <= interval) {
          clearInterval(timer);
          onRemove(toast.id);
          return 0;
        }
        return prev - interval;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [toast.id, totalDuration, onRemove]);

  const remainingSeconds = Math.max(1, Math.ceil(remainingMs / 1000));
  const progressPercent = Math.max(0, Math.min(100, (remainingMs / totalDuration) * 100));

  const iconClass = isSuccess
    ? "fa-solid fa-circle-check text-success"
    : isError
      ? "fa-solid fa-circle-exclamation text-danger"
      : isWarning
        ? "fa-solid fa-triangle-exclamation text-warning"
        : "fa-solid fa-circle-info text-primary";

  const borderColor = isSuccess
    ? "#10b981"
    : isError
      ? "#ef4444"
      : isWarning
        ? "#f59e0b"
        : "#3b82f6";

  const badgeBg = isSuccess
    ? "#ecfdf5"
    : isError
      ? "#fef2f2"
      : isWarning
        ? "#fffbeb"
        : "#eff6ff";

  const badgeColor = isSuccess
    ? "#059669"
    : isError
      ? "#dc2626"
      : isWarning
        ? "#d97706"
        : "#2563eb";

  const label = isSuccess
    ? "Success"
    : isError
      ? "Error"
      : isWarning
        ? "Notice"
        : "Info";

  return (
    <div
      className="toast-item shadow-lg"
      style={{
        position: "relative",
        overflow: "hidden",
        backgroundColor: "#ffffff",
        borderLeft: `5px solid ${borderColor}`,
        borderRadius: "12px",
        padding: "14px 18px 16px",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: "14px",
        pointerEvents: "auto",
        boxShadow:
          "0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
        animation: "toastSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        border: "1px solid #e2e8f0",
        borderLeftWidth: "5px",
        borderLeftColor: borderColor,
      }}
    >
      <div style={{ display: "flex", gap: "12px", alignItems: "flex-start", flex: 1 }}>
        <i
          className={iconClass}
          style={{
            fontSize: "20px",
            marginTop: "2px",
            flexShrink: 0,
          }}
        ></i>
        <div style={{ flex: 1 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "4px",
            }}
          >
            <span
              style={{
                fontSize: "13px",
                fontWeight: 700,
                color: "#1e2229",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              {label}
            </span>
            <span
              style={{
                fontSize: "11px",
                fontWeight: 700,
                padding: "2px 8px",
                borderRadius: "12px",
                backgroundColor: badgeBg,
                color: badgeColor,
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                lineHeight: "1.3",
                boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
              }}
            >
              <i className="fa-regular fa-clock" style={{ fontSize: "10px" }}></i>
              {remainingSeconds}s
            </span>
          </div>
          <div
            style={{
              fontSize: "13.5px",
              color: "#4a5568",
              lineHeight: "1.45",
              fontWeight: "500",
            }}
          >
            {toast.message}
          </div>
        </div>
      </div>

      {/* Close X Button */}
      <button
        type="button"
        aria-label="Close"
        onClick={() => onRemove(toast.id)}
        style={{
          background: "transparent",
          border: "none",
          cursor: "pointer",
          color: "#94a3b8",
          padding: "4px",
          fontSize: "14px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "6px",
          transition: "color 0.2s, background-color 0.2s",
          flexShrink: 0,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = "#1e2229";
          e.currentTarget.style.backgroundColor = "#f1f5f9";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = "#94a3b8";
          e.currentTarget.style.backgroundColor = "transparent";
        }}
      >
        <i className="fa-solid fa-xmark"></i>
      </button>

      {/* Dynamic Animated Progress Bar along the bottom */}
      {totalDuration > 0 && (
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            height: "3.5px",
            backgroundColor: borderColor,
            width: `${progressPercent}%`,
            transition: "width 0.1s linear",
            opacity: 0.85,
          }}
        />
      )}
    </div>
  );
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message, type = "success", duration) => {
      const id = Date.now() + Math.random().toString(36).substring(2, 9);
      const effectiveDuration =
        duration !== undefined
          ? duration
          : type === "error" || type === "danger"
            ? 8000
            : 3500;

      const newToast = { id, message, type, duration: effectiveDuration };
      setToasts((prev) => [...prev, newToast]);
    },
    [],
  );

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}

      {/* Floating Toast Notification Container */}
      <div
        className="toast-notification-container"
        style={{
          position: "fixed",
          top: "24px",
          right: "24px",
          zIndex: 999999,
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          maxWidth: "400px",
          width: "calc(100% - 48px)",
          pointerEvents: "none",
        }}
      >
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

export default ToastContext;
