import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { useToast } from "../../providers/ToastContext";
import reviewService from "../../services/reviewService";
import "../../styles/reviews.css";

const ProductReviewModal = ({ item, onClose, onSubmitted }) => {
  const { t } = useTranslation();
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
          <div>
            <h4 id={titleId}>{t("reviews.formTitle")}</h4>
            <p>{item.productName}</p>
          </div>
          <button type="button" className="product-review-modal-close" aria-label={t("common.close")} onClick={onClose}>×</button>
        </div>

        <form onSubmit={submitReview} className="product-review-form">
          <fieldset disabled={submitting || duplicate}>
            <legend>{t("reviews.ratingLabel")}</legend>
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

            <label className="product-review-comment-label" htmlFor={commentId}>{t("reviews.commentLabel")}</label>
            <textarea
              id={commentId}
              rows="5"
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
            <div id={`${commentId}-counter`} className="product-review-comment-counter" aria-live="polite">
              {t("reviews.commentCounter", { count: comment.length })}
            </div>
          </fieldset>

          {error && <p id={`${commentId}-error`} className="product-review-form-error" role="alert">{error}</p>}

          <div className="product-review-modal-actions">
            <button type="button" className="btn btn-outline-secondary" onClick={onClose}>{t("reviews.cancel")}</button>
            <button type="submit" className="btn btn-primary" disabled={submitting || duplicate}>
              {submitting ? t("reviews.submitting") : duplicate ? t("reviews.alreadyReviewed") : t("reviews.submit")}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
};

export default ProductReviewModal;
