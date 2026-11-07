import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import OrderDetailsContent from "./OrderDetailsContent";
import ProductReviewModal from "../reviews/ProductReviewModal";
import orderService from "../../services/orderService";

const CustomerOrderDetailModal = ({ order, orderNumber, onClose, onReviewed }) => {
  const { t } = useTranslation();
  const modalRef = useRef(null);
  const closeButtonRef = useRef(null);
  const reviewOpenRef = useRef(false);
  const [detailOrder, setDetailOrder] = useState(null);
  const [detailError, setDetailError] = useState("");
  const [reviewItem, setReviewItem] = useState(null);
  const [reviewedOrderItemIds, setReviewedOrderItemIds] = useState(() => new Set());
  reviewOpenRef.current = Boolean(reviewItem);
  const closeReview = useCallback(() => setReviewItem(null), []);
  const markReviewed = useCallback(() => {
    if (!reviewItem?.orderItemId) return;
    setReviewedOrderItemIds((current) => {
      const next = new Set(current);
      next.add(reviewItem.orderItemId);
      return next;
    });
    onReviewed?.(order?.orderId, reviewItem.orderItemId);
  }, [onReviewed, order?.orderId, reviewItem]);

  useEffect(() => {
    setReviewItem(null);
    setReviewedOrderItemIds(new Set());
    setDetailOrder(null);
    setDetailError("");
    if (!order?.orderId) return undefined;

    let active = true;
    orderService.getMyOrder(order.orderId)
      .then((data) => {
        if (active) setDetailOrder(data);
      })
      .catch((requestError) => {
        if (active) setDetailError(requestError?.response?.data?.message || t("orders.toast.loadError"));
      });
    return () => { active = false; };
  }, [order?.orderId, t]);

  useEffect(() => {
    if (!order) return undefined;
    const previousOverflow = document.body.style.overflow;
    const previouslyFocusedElement = document.activeElement;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();
    const handleKeyDown = (event) => {
      if (reviewOpenRef.current) return;
      if (event.key === "Escape") onClose();
      if (event.key !== "Tab" || !modalRef.current) return;
      const focusable = [...modalRef.current.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')]
        .filter((element) => element.getClientRects().length > 0);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!modalRef.current.contains(document.activeElement)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      if (previouslyFocusedElement?.isConnected) previouslyFocusedElement.focus();
    };
  }, [order, onClose]);

  if (!order) return null;

  const selectedOrder = detailOrder?.orderId === order.orderId ? detailOrder : null;
  const renderReviewAction = (item) => {
    const isReviewed = item.reviewed || item.hasReview || reviewedOrderItemIds.has(item.orderItemId);
    return isReviewed ? (
      <span className="badge-order-reviewed">
        <i className="fa-solid fa-circle-check" aria-hidden="true" />
        {t("reviews.alreadyReviewed")}
      </span>
    ) : (
      <button type="button" className="btn-order-review" onClick={() => setReviewItem(item)}>
        <i className="fa-solid fa-star text-warning" aria-hidden="true" />
        {t("reviews.writeReview")}
      </button>
    );
  };

  return (
    <>
      {createPortal(
        <div className="customer-order-modal-overlay" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div ref={modalRef} className="customer-order-modal" role="dialog" aria-modal="true" aria-labelledby="customer-order-modal-title">
        <div className="customer-order-modal-header">
          <div>
            <h4 id="customer-order-modal-title">{t("orders.detailTitle")}</h4>
            <p>{t("orders.orderIdentity", { number: orderNumber, id: order.orderId })}</p>
          </div>
          <button ref={closeButtonRef} type="button" className="customer-order-modal-close" aria-label={`${t("common.close")} ${t("orders.detailTitle")}`} onClick={onClose}>×</button>
        </div>

        <div className="customer-order-modal-body">
          {detailError && <div className="alert alert-danger mb-0" role="alert">{detailError}</div>}
          {!detailError && !selectedOrder && <p className="mb-0" role="status">{t("orders.loadingDetail")}</p>}
          {selectedOrder && (
            <OrderDetailsContent
              order={selectedOrder}
              renderItemAction={selectedOrder.orderStatus === "DELIVERED" ? renderReviewAction : undefined}
            />
          )}
        </div>

        <div className="customer-order-modal-footer">
          {selectedOrder && (
            <Link to={`/account/orders/${selectedOrder.orderId}`} onClick={onClose} className="btn btn-outline-primary btn-sm">
              {t("orders.detailTitle")} →
            </Link>
          )}
          <button type="button" className="btn btn-outline-secondary btn-sm" onClick={onClose}>{t("common.close")}</button>
        </div>
      </div>
        </div>,
        document.body,
      )}
      <ProductReviewModal item={reviewItem} onClose={closeReview} onSubmitted={markReviewed} />
    </>
  );
};

export default CustomerOrderDetailModal;
