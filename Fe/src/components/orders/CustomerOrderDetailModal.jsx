import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import OrderTrackingTimeline from "./OrderTrackingTimeline";
import ProductReviewModal from "../reviews/ProductReviewModal";
import {
  formatOrderDateTime,
  formatOrderMoney,
  orderStatusLabel,
  paymentMethodLabel,
  paymentStatusLabel,
  shippingMethodLabel,
} from "../../utils/orderFormatters";

const CustomerOrderDetailModal = ({ order, orderNumber, onClose }) => {
  const { t, i18n } = useTranslation();
  const closeButtonRef = useRef(null);
  const [reviewItem, setReviewItem] = useState(null);
  const [reviewedOrderItemIds, setReviewedOrderItemIds] = useState(() => new Set());
  const closeReview = useCallback(() => setReviewItem(null), []);
  const markReviewed = useCallback(() => {
    if (!reviewItem?.orderItemId) return;
    setReviewedOrderItemIds((current) => {
      const next = new Set(current);
      next.add(reviewItem.orderItemId);
      return next;
    });
  }, [reviewItem]);

  useEffect(() => {
    setReviewItem(null);
  }, [order?.orderId]);

  useEffect(() => {
    if (!order) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [order, onClose]);

  if (!order) return null;

  return (
    <>
      {createPortal(
        <div className="customer-order-modal-overlay" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="customer-order-modal" role="dialog" aria-modal="true" aria-labelledby="customer-order-modal-title">
        <div className="customer-order-modal-header">
          <div>
            <h4 id="customer-order-modal-title">{t("orders.detailTitle")}</h4>
            <p>{t("orders.orderIdentity", { number: orderNumber, id: order.orderId })}</p>
          </div>
          <button ref={closeButtonRef} type="button" className="customer-order-modal-close" aria-label={t("common.close")} onClick={onClose}>×</button>
        </div>

        <div className="customer-order-modal-body">
          <div className="customer-order-modal-grid">
            <div className="customer-order-modal-field"><span>{t("commerce.trackingCode")}</span><strong>{order.trackingCode || t("commerce.trackingPending")}</strong></div>
            <div className="customer-order-modal-field"><span>{t("orders.placedAt")}</span><strong>{formatOrderDateTime(order.createdAt, i18n.language)}</strong></div>
            <div className="customer-order-modal-field"><span>{t("orders.status")}</span><strong>{orderStatusLabel(order.orderStatus, t)}</strong></div>
            <div className="customer-order-modal-field"><span>{t("orders.payment")}</span><strong>{paymentMethodLabel(order.paymentMethod, t)}</strong><small>{paymentStatusLabel(order.paymentStatus, t)}</small></div>
            <div className="customer-order-modal-field"><span>{t("orders.shipping")}</span><strong>{shippingMethodLabel(order.shippingMethod, t)}</strong><small>{order.phone || "—"}</small></div>
            <div className="customer-order-modal-field"><span>{t("orders.voucher")}</span><strong>{order.voucherCode || (order.voucherId ? `#${order.voucherId}` : "—")}</strong><small>{t("orders.discountValue", { amount: formatOrderMoney(order.discountAmount, i18n.language) })}</small></div>
          </div>

          <div className="my-3"><OrderTrackingTimeline status={order.orderStatus} /></div>
          <Link to={`/account/orders/${order.orderId}`} onClick={onClose} className="btn btn-outline-primary btn-sm mb-3">{t("orders.detailTitle")} →</Link>

          <h5 className="customer-order-modal-items-title">{t("orders.products")}</h5>
          <div className="customer-order-modal-items">
            {order.orderItems?.length ? order.orderItems.map((item) => (
              <div className="customer-order-modal-item" key={item.orderItemId}>
                <div><strong>{item.productName}</strong><small>{t("orders.quantityPrice", { quantity: item.quantity, price: formatOrderMoney(item.unitPrice, i18n.language) })}</small></div>
                <div className="product-review-item-action">
                  <strong>{formatOrderMoney(item.subtotal, i18n.language)}</strong>
                  {order.orderStatus === "DELIVERED" && (
                    <button
                      type="button"
                      className="btn btn-outline-primary btn-sm"
                      disabled={item.reviewed || item.hasReview || reviewedOrderItemIds.has(item.orderItemId)}
                      onClick={() => setReviewItem(item)}
                    >
                      {item.reviewed || item.hasReview || reviewedOrderItemIds.has(item.orderItemId)
                        ? t("reviews.alreadyReviewed")
                        : t("reviews.writeReview")}
                    </button>
                  )}
                </div>
              </div>
            )) : <p className="light-gray mb-0">{t("orders.noProducts")}</p>}
          </div>
        </div>

        <div className="customer-order-modal-footer">
          <span>{t("orders.total")}</span>
          <strong>{formatOrderMoney(order.totalCost, i18n.language)}</strong>
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
