import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import TitleBanner from "../../components/shared/TitleBanner";
import OrderTrackingTimeline from "../../components/orders/OrderTrackingTimeline";
import OrderPriceBreakdown from "../../components/orders/OrderPriceBreakdown";
import ProductReviewModal from "../../components/reviews/ProductReviewModal";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import orderService from "../../services/orderService";
import { useToast } from "../../providers/ToastContext";
import { formatOrderDateTime, formatOrderMoney, orderStatusLabel, paymentMethodLabel, paymentStatusLabel, shippingMethodLabel } from "../../utils/orderFormatters";

const OrderDetailPage = () => {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const { showToast } = useToast();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reviewItem, setReviewItem] = useState(null);
  const [reviewedOrderItemIds, setReviewedOrderItemIds] = useState(() => new Set());

  const [canceling, setCanceling] = useState(false);
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);

  const closeReview = useCallback(() => setReviewItem(null), []);
  const markReviewed = useCallback(() => {
    if (!reviewItem?.orderItemId) return;
    setReviewedOrderItemIds((current) => {
      const next = new Set(current);
      next.add(reviewItem.orderItemId);
      return next;
    });
  }, [reviewItem]);

  const handleCancelOrder = async () => {
    if (canceling || order?.orderStatus !== "PENDING") return;
    setConfirmCancelOpen(false);
    setCanceling(true);
    try {
      await orderService.cancelMyOrder(id);
      setOrder((current) => current ? { ...current, orderStatus: "CANCELLED" } : current);
      showToast(t("orders.toast.cancelSuccess", { number: id }), "success");
    } catch (requestError) {
      showToast(requestError?.response?.data?.message || t("orders.toast.cancelError"), "error");
    } finally {
      setCanceling(false);
    }
  };

  useEffect(() => setConfirmCancelOpen(false), [id]);

  useEffect(() => {
    let active = true;
    orderService
      .getMyOrder(id)
      .then((data) => active && setOrder(data))
      .catch((requestError) => {
        if (active) {
          const message = requestError?.response?.data?.message || t("orders.toast.loadError");
          setError(message);
          showToast(message, "error");
        }
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [id, showToast, t]);

  return (
    <>
      <TitleBanner title={t("orders.detailTitle")} />
      <section className="py-40">
        <div className="container-2">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-24">
            <h4 className="font-sec fw-700 medium-black mb-0">{t("orders.detailTitle")} #{id}</h4>
            <div className="d-flex align-items-center gap-3">
              {order?.orderStatus === "PENDING" && (
                <button
                  type="button"
                  className="btn btn-outline-danger btn-sm"
                  disabled={canceling}
                  onClick={() => setConfirmCancelOpen(true)}
                >
                  {canceling ? t("orders.cancelling") : t("orders.cancelOrder")}
                </button>
              )}
              <Link to="/account/orders" className="text-decoration-underline">{t("orders.backToOrders")}</Link>
            </div>
          </div>
          {loading && <p className="light-gray">{t("orders.loadingDetail")}</p>}
          {error && <div className="alert alert-danger" role="alert">{error}</div>}
          {order && (
            <>
              <div className="checkout-box bg-semi-white p-24 mb-16">
                <div className="d-flex flex-wrap justify-content-between gap-3 mb-16">
                  <div>
                    <span className="light-gray d-block mb-1">{t("orders.status")}</span>
                    <strong className="medium-black">{orderStatusLabel(order.orderStatus, t)}</strong>
                  </div>
                  <div>
                    <span className="light-gray d-block mb-1">{t("orders.placedAt")}</span>
                    <strong className="medium-black">
                      {formatOrderDateTime(order.createdAt, i18n.language)}
                    </strong>
                  </div>
                </div>
                <OrderTrackingTimeline status={order.orderStatus} />
                <p className="mt-3 mb-1"><strong>{t("commerce.trackingCode")}:</strong> {order.trackingCode || t("commerce.trackingPending")}</p>
                <p className="mb-0"><strong>{t("orders.payment")}:</strong> {paymentMethodLabel(order.paymentMethod, t)} · {paymentStatusLabel(order.paymentStatus, t)}</p>
              </div>

              <div className="checkout-box bg-semi-white p-24 mb-16">
                <h6 className="fw-600 medium-black mb-16">{t("orders.items")}</h6>
                {(order.orderItems || []).map((item) => {
                  const isReviewed = item.reviewed || item.hasReview || reviewedOrderItemIds.has(item.orderItemId);
                  return (
                    <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 py-3 border-bottom" key={item.orderItemId}>
                      <div>
                        <strong className="medium-black d-block mb-1" style={{ fontSize: "15px" }}>{item.productName}</strong>
                        <div className="light-gray" style={{ fontSize: "13px" }}>
                          {t("orders.quantityEach", { quantity: item.quantity, price: formatOrderMoney(item.unitPrice, i18n.language) })}
                        </div>
                      </div>
                      <div className="d-flex align-items-center gap-3">
                        <strong className="medium-black" style={{ fontSize: "15px" }}>{formatOrderMoney(item.subtotal, i18n.language)}</strong>
                        {order.orderStatus === "DELIVERED" && (
                          <div>
                            {isReviewed ? (
                              <span className="badge-order-reviewed">
                                <i className="fa-solid fa-circle-check"></i>
                                {t("reviews.alreadyReviewed", "Đã đánh giá")}
                              </span>
                            ) : (
                              <button
                                type="button"
                                className="btn-order-review"
                                onClick={() => setReviewItem(item)}
                              >
                                <i className="fa-solid fa-star text-warning"></i>
                                {t("reviews.writeReview", "Đánh giá")}
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                <div className="pt-16 border-top mt-16"><OrderPriceBreakdown order={order} /></div>
              </div>

              <div className="checkout-box bg-semi-white p-24">
                <h6 className="fw-600 medium-black mb-16">{t("orders.delivery")}</h6>
                <p className="mb-1">{order.shippingAddress}</p>
                <p className="light-gray mb-1">{order.phone}</p>
                <p className="light-gray mb-0">{shippingMethodLabel(order.shippingMethod, t)}</p>
              </div>
            </>
          )}
        </div>
      </section>
      <ConfirmDialog
        isOpen={confirmCancelOpen && order?.orderStatus === "PENDING"}
        title={t("orders.cancelOrder")}
        message={t("orders.confirmCancel", { number: id })}
        confirmText={t("orders.cancelOrder")}
        cancelText={t("orders.cancel")}
        confirmVariant="danger"
        onConfirm={handleCancelOrder}
        onCancel={() => setConfirmCancelOpen(false)}
      />
      <ProductReviewModal item={reviewItem} onClose={closeReview} onSubmitted={markReviewed} />
    </>
  );
};

export default OrderDetailPage;
