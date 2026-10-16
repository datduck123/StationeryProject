import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../providers/AuthContext";
import reviewService from "../../services/reviewService";
import Pagination from "../ui/Pagination";
import ProductReviewModal from "./ProductReviewModal";
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

const ProductReviewsList = ({ productId, productName, onRatingUpdated }) => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
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

  // Review eligibility
  const [eligibility, setEligibility] = useState(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

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

  // Load review eligibility
  useEffect(() => {
    let active = true;
    if (!productId || !user) {
      setEligibility({ eligible: false, message: "UNAUTHENTICATED" });
      return undefined;
    }
    setEligibility(null);
    reviewService.getReviewEligibility(productId)
      .then((res) => { if (active) setEligibility(res); })
      .catch(() => { if (active) setEligibility({ eligible: false }); });
    return () => { active = false; };
  }, [productId, user, refreshKey]);

  // Reset to first page when productId changes
  useEffect(() => {
    setPage(0);
    setIsReviewModalOpen(false);
  }, [productId]);

  const handleReviewSubmitted = () => {
    setIsReviewModalOpen(false);
    setPage(0);
    setRefreshKey((prev) => prev + 1);
  };

  const closeReviewModal = useCallback(() => setIsReviewModalOpen(false), []);
  const reviewItemForModal = useMemo(() => eligibility?.orderItemId
    ? {
        orderItemId: eligibility.orderItemId,
        productName: eligibility.productName || productName || "",
      }
    : null, [eligibility, productName]);

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
          <span className="product-rating-total-count">
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

        {/* Write Review Action or Eligibility Notice */}
        <div className="product-rating-action-col">
          {!error && !loading && eligibility?.eligible ? (
            <button
              type="button"
              className="cus-btn-2 text-nowrap"
              onClick={() => setIsReviewModalOpen(true)}
            >
              <span className="btn-text">{t("reviews.writeReviewForProduct")}</span>
              <span>{t("reviews.writeReviewForProduct")}</span>
            </button>
          ) : !loading && !error && (
            <p className="product-review-eligibility-hint">
              <i className="fa-regular fa-circle-info me-1" aria-hidden="true"></i>
              {t("reviews.onlyPurchasedCanReview")}
            </p>
          )}
        </div>
      </div>

      {/* 2. State Handling: Loading, Error, Empty, List */}
      {loading ? (
        <div className="product-review-state" role="status">
          <div
            className="spinner-border spinner-border-sm me-2 text-primary"
            role="status"
          />
          {t("reviews.loading")}
        </div>
      ) : error ? (
        <div className="product-review-state" role="alert">
          <p className="mb-16 text-danger">{error}</p>
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
            {reviews.map((review) => (
              <article className="product-review-card" key={review.reviewId}>
                <div className="product-review-card-header">
                  <div>
                    <strong>{review.userFullName || t("reviews.anonymous")}</strong>
                    <small>
                      {review.createdAt
                        ? new Intl.DateTimeFormat(
                            i18n.language === "vi" ? "vi-VN" : "en-US",
                            { dateStyle: "medium" }
                          ).format(new Date(review.createdAt))
                        : ""}
                    </small>
                  </div>
                  <ReviewStars
                    rating={review.rating}
                    label={t("reviews.ratingOutOfFive", { rating: review.rating })}
                  />
                </div>
                <p>{review.comment}</p>
              </article>
            ))}
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
        <div className="product-review-state">
          <p className="mb-0">{t("reviews.empty")}</p>
        </div>
      )}

      {/* 3. Review Modal (reused) */}
      {isReviewModalOpen && reviewItemForModal && (
        <ProductReviewModal
          item={reviewItemForModal}
          onClose={closeReviewModal}
          onSubmitted={handleReviewSubmitted}
        />
      )}
    </div>
  );
};

export default ProductReviewsList;
