import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { useToast } from "../../providers/ToastContext";
import reviewService from "../../services/reviewService";
import DashedEmotionFace from "./DashedEmotionFace";
import "../../styles/reviews.css";

const ProductReviewModal = ({ item, onClose, onSubmitted }) => {
  const { t, i18n } = useTranslation();
  const { showToast } = useToast();
  const titleId = useId();
  const commentId = useId();
  const modalRef = useRef(null);
  const firstRatingRef = useRef(null);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [duplicate, setDuplicate] = useState(false);

  useEffect(() => {
    if (!item) return undefined;
    const previouslyFocusedElement = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    setRating(5);
    setHoverRating(0);
    setComment("");
    setError("");
    setDuplicate(false);
    firstRatingRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
        return;
      }
      if (event.key === "Tab" && modalRef.current) {
        const focusableElements = [...modalRef.current.querySelectorAll(
          'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
        )];
        if (!focusableElements.length) return;
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        if (event.shiftKey && document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        } else if (!event.shiftKey && document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown, true);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown, true);
      previouslyFocusedElement?.focus?.();
    };
  }, [item, onClose]);

  if (!item) return null;

  const submitReview = async (event) => {
    event.preventDefault();
    const normalizedComment = comment.trim();
    if (normalizedComment.length < 3 || normalizedComment.length > 1000) {
      setError(normalizedComment.length === 0
        ? t("reviews.commentRequired")
        : t("reviews.commentLength"));
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const review = await reviewService.createReview({
        orderItemId: item.orderItemId,
        rating,
        comment: normalizedComment,
      });
      showToast(t("reviews.submitSuccess"), "success");
      onSubmitted?.(review);
      onClose();
    } catch (requestError) {
      const isDuplicate = requestError?.response?.status === 409;
      const message = requestError?.response?.data?.message
        || (isDuplicate ? t("reviews.duplicate") : t("reviews.submitError"));
      setDuplicate(isDuplicate);
      setError(message);
      showToast(message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  return createPortal(
    <div
      className="product-review-modal-overlay"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <div
        ref={modalRef}
        className="product-review-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="product-review-modal-header">
          <div className="d-flex align-items-center gap-3">
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "18px",
                color: "#e9613f",
                boxShadow: "0 2px 8px rgba(233, 97, 63, 0.15)",
                flexShrink: 0,
              }}
            >
              <i className="fa-solid fa-star"></i>
            </div>
            <div>
              <h4 id={titleId} className="fw-700 medium-black mb-1" style={{ fontSize: "18px" }}>
                {t("reviews.formTitle", "Đánh giá sản phẩm")}
              </h4>
              <p className="text-muted mb-0 text-truncate" style={{ fontSize: "13px", maxWidth: "340px" }}>
                {item.productName}
              </p>
            </div>
          </div>
          <button
            type="button"
            className="product-review-modal-close"
            aria-label={t("common.close")}
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <form onSubmit={submitReview} className="product-review-form">
          <fieldset disabled={submitting || duplicate}>
            <div className="mb-4">
              <label className="fw-700 medium-black mb-2 d-block" style={{ fontSize: "14px" }}>
                {t("reviews.ratingLabel", "Mức đánh giá")}
              </label>
              <div
                className="d-flex flex-column align-items-center py-3 px-3 br-12"
                style={{ backgroundColor: "#fbfbfc", border: "1px solid #f1f3f7" }}
              >
                <div className="product-review-rating-input" onMouseLeave={() => setHoverRating(0)}>
                  {[1, 2, 3, 4, 5].map((value) => (
                    <label
                      key={value}
                      className={value <= (hoverRating || rating) ? "is-filled" : ""}
                      onMouseEnter={() => setHoverRating(value)}
                    >
                      <input
                        ref={value === 1 ? firstRatingRef : undefined}
                        type="radio"
                        name="product-review-rating"
                        value={value}
                        checked={rating === value}
                        onChange={() => setRating(value)}
                      />
                      <span aria-hidden="true">★</span>
                      <span className="visually-hidden">{t("reviews.starValue", { value })}</span>
                    </label>
                  ))}
                </div>
                {(() => {
                  const currentLevel = hoverRating || rating || 5;
                  const label =
                    currentLevel === 1
                      ? (i18n.language === "vi" ? "Rất không hài lòng" : "Very Bad")
                      : currentLevel === 2
                      ? (i18n.language === "vi" ? "Không hài lòng" : "Bad")
                      : currentLevel === 3
                      ? (i18n.language === "vi" ? "Bình thường" : "Fair")
                      : currentLevel === 4
                      ? (i18n.language === "vi" ? "Hài lòng" : "Good")
                      : (i18n.language === "vi" ? "Tuyệt vời" : "Excellent");

                  return (
                    <div
                      className="product-review-emotion-badge mt-2"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                        background: "#fff7ed",
                        border: "1px solid #fed7aa",
                        color: "#ea580c",
                        padding: "5px 16px",
                        borderRadius: "999px",
                        fontSize: "13px",
                        fontWeight: "600",
                        transition: "all 0.2s ease",
                        boxShadow: "0 1px 2px rgba(234, 88, 12, 0.05)",
                      }}
                    >
                      <DashedEmotionFace rating={currentLevel} size={20} color="#ea580c" />
                      <span>{label}</span>
                    </div>
                  );
                })()}
              </div>
            </div>

            <div className="mb-2">
              <label className="fw-700 medium-black mb-2 d-block" htmlFor={commentId} style={{ fontSize: "14px" }}>
                {t("reviews.commentLabel", "Nhận xét của bạn")}
              </label>
              <textarea
                id={commentId}
                rows="4"
                minLength="3"
                maxLength="1000"
                value={comment}
                onChange={(event) => {
                  setComment(event.target.value);
                  if (error && !duplicate) setError("");
                }}
                placeholder={t("reviews.commentPlaceholder")}
                aria-invalid={Boolean(error)}
                aria-describedby={`${commentId}-counter${error ? ` ${commentId}-error` : ""}`}
                required
              />
              <div id={`${commentId}-counter`} className="product-review-comment-counter">
                {t("reviews.commentCounter", { count: comment.length })}
              </div>
            </div>
          </fieldset>

          {error && <p id={`${commentId}-error`} className="product-review-form-error" role="alert">{error}</p>}

          <div className="product-review-modal-actions">
            <button
              type="button"
              className="btn-review-modal-cancel"
              onClick={onClose}
            >
              {t("reviews.cancel", "Để sau")}
            </button>
            <button
              type="submit"
              className="btn-review-modal-submit"
              disabled={submitting || duplicate}
            >
              {submitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  {t("reviews.submitting", "Đang gửi...")}
                </>
              ) : duplicate ? (
                t("reviews.alreadyReviewed", "Đã đánh giá")
              ) : (
                <>
                  <i className="fa-solid fa-paper-plane me-2"></i>
                  {t("reviews.submit", "Gửi đánh giá")}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
};

export default ProductReviewModal;
