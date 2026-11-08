import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useToast } from "../../providers/ToastContext";
import reviewService from "../../services/reviewService";

const ratingLabels = {
  5: "Tuyệt vời",
  4: "Hài lòng",
  3: "Bình thường",
  2: "Không hài lòng",
  1: "Rất không hài lòng",
};

export const OrderItemReviewAction = ({
  item,
  orderStatus,
  reviewedItemIds,
  onOpenReviewModal,
  onItemReviewed,
  variant = "card", // "card" | "table"
}) => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [hoverStars, setHoverStars] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  if (orderStatus !== "DELIVERED" || !item) {
    return null;
  }

  const isReviewed =
    item.reviewed ||
    item.hasReview ||
    (reviewedItemIds && reviewedItemIds.has(item.orderItemId));

  const handleGoToReviews = () => {
    if (!item.productId) return;
    navigate(`/product/${item.productId}?tab=review#reviews`);
  };

  const handleQuickRate = async (starValue) => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const label = ratingLabels[starValue] || "Hài lòng";
      const comment = `Đánh giá nhanh ${starValue} sao - ${label}`;
      const review = await reviewService.createReview({
        orderItemId: item.orderItemId,
        rating: starValue,
        comment,
      });

      showToast(
        `Đã đánh giá nhanh ${starValue} sao thành công! Nhấn "Xem lại đánh giá" để xem chi tiết.`,
        "success"
      );
      onItemReviewed?.(item.orderItemId, review);
    } catch (err) {
      const isDuplicate = err?.response?.status === 409;
      if (isDuplicate) {
        showToast("Sản phẩm này đã được đánh giá trước đó.", "info");
        onItemReviewed?.(item.orderItemId);
      } else {
        const msg =
          err?.response?.data?.message ||
          "Không thể gửi đánh giá nhanh. Vui lòng thử lại!";
        showToast(msg, "error");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // 1. Trạng thái ĐÃ ĐÁNH GIÁ (cả dạng thẻ và dạng bảng)
  if (isReviewed) {
    return (
      <div className="d-flex align-items-center gap-2 flex-wrap mt-1">
        <span className="badge-order-reviewed">
          <i className="fa-solid fa-circle-check text-success"></i>
          {t("reviews.alreadyReviewed", "Đã đánh giá")}
        </span>
        <button
          type="button"
          className="btn-view-review-secondary"
          onClick={handleGoToReviews}
          title="Chuyển tới phần đánh giá của sản phẩm này"
        >
          <i className="fa-regular fa-comment-dots"></i>
          Xem lại đánh giá
        </button>
      </div>
    );
  }

  // 2. Trạng thái CHƯA ĐÁNH GIÁ - DẠNG BẢNG (Table View)
  if (variant === "table") {
    return (
      <div className="order-item-review-table-action mt-2 pt-2 border-top">
        <div className="d-flex align-items-center justify-content-between gap-2 flex-wrap">
          {/* Nút Viết Đánh Giá */}
          <button
            type="button"
            className="btn-write-review-primary py-1 px-2"
            style={{ fontSize: "11.5px", borderRadius: "6px" }}
            onClick={() => onOpenReviewModal?.(item)}
            title="Mở popup viết đánh giá chi tiết"
          >
            <i className="fa-regular fa-pen-to-square"></i>
            Viết đánh giá
          </button>

          {/* Khung Đánh Giá Nhanh dạng bảng: màu sáng, đồng bộ, tinh tế, không có icon tia sét */}
          <div
            className="quick-rating-light-box py-1 px-2 rounded-2"
            style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}
          >
            <div className="d-flex align-items-center gap-1 me-2">
              <span style={{ fontSize: "11.5px", fontWeight: "600", color: "#475569" }}>
                Đánh giá nhanh:
              </span>
              {hoverStars > 0 && (
                <span style={{ fontSize: "10.5px", color: "#d97706", fontWeight: "600" }}>
                  {ratingLabels[hoverStars]}
                </span>
              )}
            </div>

            <div
              className="quick-rating-stars"
              onMouseLeave={() => setHoverStars(0)}
            >
              {[1, 2, 3, 4, 5].map((star) => {
                const active = star <= (hoverStars || 0);
                return (
                  <button
                    key={star}
                    type="button"
                    disabled={submitting}
                    className={`quick-rating-star-btn ${active ? "is-active" : ""}`}
                    style={{ fontSize: "16px", padding: "1px 2px" }}
                    onMouseEnter={() => setHoverStars(star)}
                    onClick={() => handleQuickRate(star)}
                    title={`Đánh giá nhanh ${star} sao (${ratingLabels[star]})`}
                    aria-label={`${star} sao`}
                  >
                    ★
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 3. Trạng thái CHƯA ĐÁNH GIÁ - DẠNG THẺ (Card View)
  return (
    <div className="order-item-review-block w-100">
      <div className="d-flex align-items-center justify-content-end gap-2 flex-wrap">
        <button
          type="button"
          className="btn-write-review-primary"
          onClick={() => onOpenReviewModal?.(item)}
          title="Mở popup viết nhận xét chi tiết"
        >
          <i className="fa-regular fa-pen-to-square"></i>
          Viết đánh giá
        </button>
      </div>

      {/* Khung Đánh Giá Nhanh: tone màu sáng nhẹ nhàng, chuyên nghiệp, hòa hợp hoàn toàn với nền trang */}
      <div className="quick-rating-light-box mt-2">
        <div className="d-flex align-items-center gap-2">
          <span style={{ fontSize: "12.5px", fontWeight: "600", color: "#334155" }}>
            Đánh giá nhanh
          </span>
          {hoverStars > 0 ? (
            <span
              className="badge"
              style={{
                backgroundColor: "#fef3c7",
                color: "#92400e",
                fontSize: "11px",
                fontWeight: "600",
                padding: "3px 8px",
                borderRadius: "6px",
              }}
            >
              {ratingLabels[hoverStars]} ({hoverStars}★)
            </span>
          ) : (
            <span className="text-muted" style={{ fontSize: "11.5px" }}>
              (Chọn số sao)
            </span>
          )}
        </div>

        <div
          className="quick-rating-stars"
          onMouseLeave={() => setHoverStars(0)}
        >
          {[1, 2, 3, 4, 5].map((star) => {
            const active = star <= (hoverStars || 0);
            return (
              <button
                key={star}
                type="button"
                disabled={submitting}
                className={`quick-rating-star-btn ${active ? "is-active" : ""}`}
                onMouseEnter={() => setHoverStars(star)}
                onClick={() => handleQuickRate(star)}
                title={`Đánh giá nhanh ${star} sao (${ratingLabels[star]})`}
                aria-label={`${star} sao`}
              >
                ★
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default OrderItemReviewAction;
