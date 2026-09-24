import React, { createContext, useCallback, useContext, useState } from "react";

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message, type = "success", duration = 1500) => {
      const id = Date.now() + Math.random().toString(36).substring(2, 9);
      const newToast = { id, message, type };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast],
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
        {toasts.map((toast) => {
          const isSuccess = toast.type === "success";
          const isError = toast.type === "error" || toast.type === "danger";
          const isWarning = toast.type === "warning";

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

          return (
            <div
              key={toast.id}
              className="toast-item shadow-lg"
              style={{
                backgroundColor: "#ffffff",
                borderLeft: `5px solid ${borderColor}`,
                borderRadius: "12px",
                padding: "14px 18px",
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
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  alignItems: "flex-start",
                }}
              >
                <i
                  className={iconClass}
                  style={{
                    fontSize: "20px",
                    marginTop: "2px",
                    flexShrink: 0,
                  }}
                ></i>
                <div>
                  <div
                    style={{
                      fontSize: "13px",
                      fontWeight: 700,
                      color: "#1e2229",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      marginBottom: "2px",
                    }}
                  >
                    {isSuccess
                      ? "Success"
                      : isError
                        ? "Error"
                        : isWarning
                          ? "Notice"
                          : "Info"}
                  </div>
                  <div
                    style={{
                      fontSize: "13.5px",
                      color: "#4a5568",
                      lineHeight: "1.4",
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
                onClick={() => removeToast(toast.id)}
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
            </div>
          );
        })}
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
