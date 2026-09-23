import { useEffect } from "react";

export const ConfirmDialog = ({
  isOpen,
  title = "Confirmation",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmVariant = "danger", // 'danger' | 'warning' | 'primary' | 'success'
  onConfirm,
  onCancel,
  isLoading = false,
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isOpen && e.key === "Escape" && !isLoading) {
        onCancel();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isLoading, onCancel]);

  if (!isOpen) return null;

  const getVariantBtnClass = () => {
    switch (confirmVariant) {
      case "danger":
        return "btn btn-danger";
      case "warning":
        return "btn btn-warning text-dark";
      case "success":
        return "btn btn-success";
      case "primary":
      default:
        return "btn btn-primary bg-color-primary border-0";
    }
  };

  const getIcon = () => {
    switch (confirmVariant) {
      case "danger":
        return (
          <div
            className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
            style={{
              width: 56,
              height: 56,
              background: "#fee2e2",
              color: "#dc2626",
            }}
          >
            <i className="fa-solid fa-triangle-exclamation fa-xl"></i>
          </div>
        );
      case "warning":
        return (
          <div
            className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
            style={{
              width: 56,
              height: 56,
              background: "#fef3c7",
              color: "#d97706",
            }}
          >
            <i className="fa-solid fa-circle-exclamation fa-xl"></i>
          </div>
        );
      default:
        return (
          <div
            className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
            style={{
              width: 56,
              height: 56,
              background: "#e0f2fe",
              color: "#0284c7",
            }}
          >
            <i className="fa-solid fa-circle-question fa-xl"></i>
          </div>
        );
    }
  };

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.55)",
        backdropFilter: "blur(2px)",
        zIndex: 1060,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) {
          onCancel();
        }
      }}
    >
      <div
        className="modal-dialog modal-dialog-centered"
        style={{ maxWidth: 440 }}
      >
        <div
          className="modal-content shadow-lg border-0 rounded-4 p-4 text-center"
          style={{ background: "#ffffff" }}
        >
          {getIcon()}
          <h4 className="fw-700 mb-2 text-dark">{title}</h4>
          <p className="text-muted mb-4 fs-14">{message}</p>

          <div className="d-flex justify-content-center gap-2">
            <button
              type="button"
              className="btn btn-light px-4 py-2 rounded-pill fw-600 border"
              onClick={onCancel}
              disabled={isLoading}
            >
              {cancelText}
            </button>
            <button
              type="button"
              className={`${getVariantBtnClass()} px-4 py-2 rounded-pill fw-600`}
              onClick={onConfirm}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  Processing...
                </>
              ) : (
                confirmText
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
