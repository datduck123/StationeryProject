import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import TitleBanner from "../../components/shared/TitleBanner";
import OrderTrackingTimeline from "../../components/orders/OrderTrackingTimeline";
import ProductReviewModal from "../../components/reviews/ProductReviewModal";
import orderService from "../../services/orderService";
import { useToast } from "../../providers/ToastContext";
import {
  formatOrderDateTime,
  formatOrderMoney,
  orderStatusLabel,
  paymentMethodLabel,
  paymentStatusLabel,
  shippingMethodLabel,
} from "../../utils/orderFormatters";
import "../../styles/customer-orders.css";

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
    if (!window.confirm(t("orders.confirmCancel", { number: id }))) return;
    setCanceling(true);
    try {
      await orderService.cancelMyOrder(id);
      setOrder((current) => (current ? { ...current, orderStatus: "CANCELLED" } : current));
      showToast(t("orders.toast.cancelSuccess", { number: id }), "success");
    } catch (requestError) {
      showToast(requestError?.response?.data?.message || t("orders.toast.cancelError"), "error");
    } finally {
      setCanceling(false);
    }
  };

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
          {/* Header Action Bar */}
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-24">
            <h4 className="font-sec fw-700 medium-black mb-0">
              {t("orders.detailTitle")} #{id}
            </h4>
            <div className="d-flex align-items-center gap-3">
              {order?.orderStatus === "PENDING" && (
                <button
                  type="button"
                  className="btn btn-outline-danger btn-sm"
                  disabled={canceling}
                  onClick={handleCancelOrder}
                >
                  {canceling ? t("orders.cancelling") : t("orders.cancelOrder")}
                </button>
              )}
              <Link to="/account/orders" className="text-decoration-underline text-secondary">
                <i className="fa-solid fa-arrow-left me-1"></i> {t("orders.backToOrders")}
              </Link>
            </div>
          </div>

          {loading && <p className="light-gray">{t("orders.loadingDetail")}</p>}
          {error && <div className="alert alert-danger" role="alert">{error}</div>}

          {order && (
            <>
              {/* Order Tracking & Status Overview Card */}
              <div className="checkout-box bg-white p-24 br-15 border mb-24 shadow-sm">
                <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-16 pb-16 border-bottom">
                  <div>
                    <span className="text-muted d-block fs-13 mb-1">{t("orders.status")}</span>
                    <span className={`customer-order-status customer-order-status-${order.orderStatus?.toLowerCase()} fs-13 fw-bold`}>
                      {orderStatusLabel(order.orderStatus, t)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted d-block fs-13 mb-1">{t("orders.placedAt")}</span>
                    <strong className="medium-black">
                      {formatOrderDateTime(order.createdAt, i18n.language)}
                    </strong>
                  </div>
                  <div>
                    <span className="text-muted d-block fs-13 mb-1">{t("commerce.trackingCode")}</span>
                    <strong className="text-primary font-monospace">
                      {order.trackingCode || t("commerce.trackingPending")}
                    </strong>
                  </div>
                </div>
                <OrderTrackingTimeline status={order.orderStatus} />
              </div>

              {/* Main 2-Column Grid (Checkout-like layout) */}
              <div className="row row-gap-4">
                {/* Left Column: Ordered Items & Delivery Information */}
                <div className="col-xl-8">
                  {/* Card 1: Ordered Items */}
                  <div className="checkout-box bg-white p-24 br-15 border mb-24 shadow-sm">
                    <div className="d-flex justify-content-between align-items-center mb-16 border-bottom pb-12">
                      <h5 className="fw-600 font-primary medium-black m-0">
                        {t("orders.items")} ({order.orderItems?.length || 0})
                      </h5>
                    </div>

                    <div className="order-items-list">
                      {(order.orderItems || []).map((item) => {
                        const isReviewed = item.reviewed || item.hasReview || reviewedOrderItemIds.has(item.orderItemId);
                        return (
                          <div
                            key={item.orderItemId}
                            className="d-flex justify-content-between align-items-center flex-wrap gap-3 py-16 border-bottom"
                          >
                            <div className="d-flex align-items-center gap-16">
                              <div
                                className="img-block br-8 bg-semi-white d-flex align-items-center justify-content-center text-muted"
                                style={{ width: "64px", height: "64px", flexShrink: 0, border: "1px solid #edf2f7" }}
                              >
                                <i className="fa-solid fa-box-open fs-3 color-primary opacity-75"></i>
                              </div>
                              <div>
                                <h6 className="mb-4p fw-600 medium-black" style={{ fontSize: "15px" }}>
                                  <Link
                                    to={`/product-detail?id=${item.productId}`}
                                    className="text-decoration-none medium-black hover-primary"
                                  >
                                    {item.productName}
                                  </Link>
                                </h6>
                                <div className="text-muted fs-13">
                                  {t("orders.quantityEach", {
                                    quantity: item.quantity,
                                    price: formatOrderMoney(item.unitPrice, i18n.language),
                                  })}
                                </div>
                              </div>
                            </div>

                            <div className="d-flex align-items-center gap-3">
                              <strong className="medium-black fs-15">
                                {formatOrderMoney(item.subtotal, i18n.language)}
                              </strong>
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
                    </div>
                  </div>

                  {/* Card 2: Delivery & Shipping Information */}
                  <div className="checkout-box bg-white p-24 br-15 border shadow-sm">
                    <div className="d-flex justify-content-between align-items-center mb-16 border-bottom pb-12">
                      <h5 className="fw-600 font-primary medium-black m-0">
                        {t("orders.delivery")}
                      </h5>
                    </div>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <div className="p-3 bg-light br-10 h-100 border">
                          <span className="text-muted d-block fs-13 mb-1">
                            <i className="fa-solid fa-location-dot me-2 color-primary"></i>
                            {t("checkout.shippingAddress", "Địa chỉ nhận hàng")}
                          </span>
                          <strong className="medium-black d-block fs-14 mb-1">
                            {order.shippingAddress}
                          </strong>
                          {order.phone && (
                            <span className="text-muted d-block fs-13 mt-2">
                              <i className="fa-solid fa-phone me-2"></i>
                              {order.phone}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="p-3 bg-light br-10 h-100 border">
                          <span className="text-muted d-block fs-13 mb-1">
                            <i className="fa-solid fa-truck-fast me-2 color-primary"></i>
                            {t("checkout.shipping", "Phương thức giao hàng")}
                          </span>
                          <strong className="medium-black d-block fs-14 mb-1">
                            {shippingMethodLabel(order.shippingMethod, t)}
                          </strong>
                          {order.note && (
                            <span className="text-muted d-block fs-13 mt-2">
                              <i className="fa-regular fa-note-sticky me-2"></i>
                              <em>{order.note}</em>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Order Summary (Checkout-style Sidebar Card) */}
                <div className="col-xl-4">
                  <div className="checkout-sidebar">
                    <div className="cart-total-box bg-white p-24 br-15 border shadow-sm">
                      <h5 className="fw-600 mb-20 border-bottom pb-12 medium-black">
                        {t("checkout.orderSummary", "Order Summary")}
                      </h5>

                      {/* Items Quick Summary */}
                      <div className="order-items mb-16">
                        <div className="d-flex justify-content-between text-muted fs-13 mb-12">
                          <span>
                            {t("checkout.productsCount", {
                              count: order.orderItems?.length || 0,
                              defaultValue: `Products (${order.orderItems?.length || 0})`,
                            })}
                          </span>
                        </div>
                        {(order.orderItems || []).map((item) => (
                          <div
                            key={item.orderItemId}
                            className="d-flex justify-content-between mb-8 fs-14"
                          >
                            <span className="text-truncate text-secondary" style={{ maxWidth: "70%" }}>
                              {item.productName} <span className="text-muted">x{item.quantity}</span>
                            </span>
                            <span className="fw-500">
                              {formatOrderMoney(item.subtotal, i18n.language)}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="hr-line my-16 border-top"></div>

                      {/* Totals Calculation */}
                      <ul className="list-unstyled mb-20 d-flex flex-column gap-12">
                        <li className="d-flex justify-content-between align-items-center">
                          <span className="text-secondary">{t("orders.subtotal")}</span>
                          <span className="fw-600 medium-black">
                            {formatOrderMoney(
                              order.subtotal != null ? order.subtotal : order.totalCost,
                              i18n.language
                            )}
                          </span>
                        </li>
                        <li className="d-flex justify-content-between align-items-center">
                          <span className="text-secondary">{t("orders.shippingFee")}</span>
                          <span className="fw-600 text-dark">
                            {Number(order.shippingFee || 0) === 0
                              ? t("cart.freeShipping", "Free")
                              : formatOrderMoney(order.shippingFee, i18n.language)}
                          </span>
                        </li>
                        {Number(order.discountAmount || 0) > 0 && (
                          <li className="d-flex justify-content-between align-items-center text-success">
                            <span>
                              {t("checkout.voucherDiscount", "Voucher Discount")}
                              {order.voucherCode
                                ? ` (${order.voucherCode})`
                                : order.voucherId
                                ? ` (#${order.voucherId})`
                                : ""}
                            </span>
                            <span className="fw-600">
                              -{formatOrderMoney(order.discountAmount, i18n.language)}
                            </span>
                          </li>
                        )}
                        <li className="total d-flex justify-content-between align-items-center pt-16 border-top mt-4">
                          <h5 className="fw-700 medium-black m-0">{t("common.total", "Total")}</h5>
                          <h4 className="fw-700 color-primary m-0">
                            {formatOrderMoney(order.totalCost, i18n.language)}
                          </h4>
                        </li>
                      </ul>

                      {/* Payment Details Box */}
                      <div className="payment-box p-3 bg-light br-10 border">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <span className="text-muted fs-13">{t("orders.payment")}</span>
                          <span className="badge bg-success-subtle text-success fs-12">
                            {paymentStatusLabel(order.paymentStatus, t)}
                          </span>
                        </div>
                        <strong className="medium-black fs-14">
                          <i className="fa-solid fa-money-bill-wave me-2 color-primary"></i>
                          {paymentMethodLabel(order.paymentMethod, t)}
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </section>
      <ProductReviewModal item={reviewItem} onClose={closeReview} onSubmitted={markReviewed} />
    </>
  );
};

export default OrderDetailPage;
