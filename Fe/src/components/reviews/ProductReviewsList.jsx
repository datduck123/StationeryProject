import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import reviewService from "../../services/reviewService";
import Pagination from "../ui/Pagination";
import "../../styles/reviews.css";

const REVIEW_PAGE_SIZE = 5;

const ReviewStars = ({ rating, label }) => {
  const filled = Math.max(0, Math.min(5, Math.round(Number(rating) || 0)));
  return (
    <span className="product-review-stars" aria-label={label}>
      <span aria-hidden="true">{"★".repeat(filled)}</span>
      <span className="empty" aria-hidden="true">{"★".repeat(5 - filled)}</span>
    </span>
  );
};

const ProductReviewsList = ({ productId, onRatingUpdated }) => {
  const { t, i18n } = useTranslation();
  const ratingUpdatedRef = useRef(onRatingUpdated);
  useEffect(() => { ratingUpdatedRef.current = onRatingUpdated; }, [onRatingUpdated]);

  const [reviews, setReviews] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [ratingDistribution, setRatingDistribution] = useState({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  // Load reviews list
  useEffect(() => {
    if (!productId) return undefined;
    let active = true;
    setLoading(true);
    setError("");
    reviewService.getProductReviews(productId, {
        page,
        size: REVIEW_PAGE_SIZE,
        sortDir: "desc",
      }).then((data) => {
      if (!active) return;
      const reviewPageData = data?.reviews || {};
      const content = Array.isArray(reviewPageData.content) ? reviewPageData.content : [];
      const total = Number(reviewPageData.totalPages) || 0;
      const count = Number(data?.reviewCount) || 0;
      const avg = Number(data?.averageRating) || 0;
      const dist = data?.ratingDistribution || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

      setReviews(content);
      setTotalPages(total);
      setReviewCount(count);
      setAverageRating(avg);
      setRatingDistribution(dist);
      ratingUpdatedRef.current?.({ averageRating: avg, reviewCount: count });
    }).catch(() => {
      if (!active) return;
      setReviews([]);
      setError(t("reviews.loadError"));
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [productId, page, t, refreshKey]);

  // Reset to first page when productId changes
  useEffect(() => {
    setPage(0);
  }, [productId]);

  return (
    <div className="product-reviews-container">
      {/* 1. Rating Overview & Distribution Bar Chart */}
      <div className="product-rating-overview-box">
        {/* Score Column */}
        <div className="product-rating-score-card">
          <div className="product-rating-score-num">
            {averageRating > 0 ? averageRating.toFixed(1) : "0.0"}
          </div>
          <ReviewStars
            rating={averageRating}
            label={t("reviews.ratingOutOfFive", { rating: averageRating.toFixed(1) })}
          />
          <span className="product-rating-total-count mt-1">
            {t("reviews.summary", {
              rating: averageRating.toFixed(1),
              count: reviewCount,
            })}
          </span>
        </div>

        {/* 5 -> 1 Star Progress Bars */}
        <div className="product-rating-bars">
          {[5, 4, 3, 2, 1].map((stars) => {
            const countForStar = Number(ratingDistribution?.[stars] || 0);
            const percentage =
              reviewCount > 0 ? Math.round((countForStar / reviewCount) * 100) : 0;
            return (
              <div key={stars} className="product-rating-bar-row">
                <span className="product-rating-bar-label">
                  {stars} <span className="color-primary" aria-hidden="true">★</span>
                </span>
                <div
                  className="product-rating-progress"
                  role="progressbar"
                  aria-valuenow={percentage}
                  aria-valuemin="0"
                  aria-valuemax="100"
                  aria-label={t("reviews.ratingBreakdown", { stars, percentage })}
                >
                  <div
                    className="product-rating-progress-fill"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="product-rating-bar-count">({countForStar})</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Reviews List / Empty / Loading State */}
      {loading ? (
        <div className="product-review-state py-5 text-center bg-white br-12 border" role="status">
          <div
            className="spinner-border spinner-border-sm me-2 text-primary"
            role="status"
          />
          <span className="text-muted">{t("reviews.loading")}</span>
        </div>
      ) : error ? (
        <div className="product-review-state py-4 text-center bg-white br-12 border" role="alert">
          <p className="mb-3 text-danger">{error}</p>
          <button
            type="button"
            className="btn btn-outline-primary btn-sm"
            onClick={() => setRefreshKey((prev) => prev + 1)}
          >
            {t("reviews.retry")}
          </button>
        </div>
      ) : reviews.length ? (
        <>
          <div className="product-review-list">
            {reviews.map((review) => {
              const displayName = review.userFullName || t("reviews.anonymous", "Khách hàng");
              const initial = displayName.trim().charAt(0).toUpperCase();
              return (
                <article className="product-review-card" key={review.reviewId}>
                  <div className="product-review-card-header">
                    <div className="d-flex align-items-center gap-3">
                      <div className="product-review-avatar">
                        {initial}
                      </div>
                      <div>
                        <div className="d-flex align-items-center flex-wrap gap-2">
                          <strong className="medium-black" style={{ fontSize: "15px" }}>{displayName}</strong>
                          <span
                            className="badge bg-success-subtle text-success border border-success-subtle py-1 px-2"
                            style={{ fontSize: "11px", fontWeight: "600", borderRadius: "6px" }}
                          >
                            <i className="fa-solid fa-circle-check me-1"></i>
                            {t("reviews.verifiedPurchase", "Đã mua hàng")}
                          </span>
                        </div>
                        <small className="text-muted d-flex align-items-center gap-1 mt-1" style={{ fontSize: "12px" }}>
                          <i className="fa-regular fa-clock"></i>
                          {review.createdAt
                            ? new Intl.DateTimeFormat(
                                i18n.language === "vi" ? "vi-VN" : "en-US",
                                { dateStyle: "medium" }
                              ).format(new Date(review.createdAt))
                            : ""}
                        </small>
                      </div>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <ReviewStars
                        rating={review.rating}
                        label={t("reviews.ratingOutOfFive", { rating: review.rating })}
                      />
                      <span className="fw-700 color-primary" style={{ fontSize: "14px" }}>
                        {Number(review.rating || 0).toFixed(1)}
                      </span>
                    </div>
                  </div>
                  <p className="mt-2 text-dark" style={{ fontSize: "14px", lineHeight: "1.65" }}>
                    {review.comment}
                  </p>
                </article>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="mt-24 d-flex justify-content-center">
              <Pagination
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
                ariaLabel={t("reviews.paginationLabel")}
              />
            </div>
          )}
        </>
      ) : (
        <div className="product-review-empty-box">
          <div className="mb-2" style={{ fontSize: "40px", color: "#f59e0b" }}>
            <i className="fa-regular fa-comments"></i>
          </div>
          <h6 className="fw-700 medium-black mb-1">
            {t("reviews.empty", "Sản phẩm này chưa có đánh giá nào.")}
          </h6>
          <p className="text-muted mb-0" style={{ fontSize: "13px", maxWidth: "460px", margin: "0 auto" }}>
            {t("reviews.emptyHint", "Những đánh giá từ người mua thực tế sẽ xuất hiện tại đây khi đơn hàng hoàn tất.")}
          </p>
        </div>
      )}
    </div>
  );
};

export default ProductReviewsList;
