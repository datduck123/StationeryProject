import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import TitleBanner from "../../components/shared/TitleBanner";
import OrderTrackingTimeline from "../../components/orders/OrderTrackingTimeline";
import OrderItemReviewAction from "../../components/orders/OrderItemReviewAction";
import ProductReviewModal from "../../components/reviews/ProductReviewModal";
import orderService from "../../services/orderService";
import { useToast } from "../../providers/ToastContext";
import { formatOrderDateTime, formatOrderMoney, orderStatusLabel, paymentMethodLabel, paymentStatusLabel, shippingMethodLabel } from "../../utils/orderFormatters";
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
      setOrder((current) => current ? { ...current, orderStatus: "CANCELLED" } : current);
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
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-24">
            <h4 className="font-sec fw-700 medium-black mb-0">{t("orders.detailTitle")} #{id}</h4>
            <Link to="/account/orders" className="btn-order-back">
              <i className="fa-solid fa-arrow-left"></i>
              <span>{t("orders.backToOrders")}</span>
            </Link>
          </div>
          {loading && <p className="light-gray">{t("orders.loadingDetail")}</p>}
          {error && <div className="alert alert-danger" role="alert">{error}</div>}
          {order && (
            <>
              {/* 1. THÔNG TIN ĐƠN HÀNG & GIAO HÀNG (DELIVERY & ORDER INFO 3-CARD ROW) */}
              <div className="row g-3 mb-20">
                {/* Cột 1: Thông tin người nhận (Đầy đủ Tên, SĐT, Email, Địa chỉ, Ghi chú) */}
                <div className="col-12 col-lg-4">
                  <div className="order-info-card">
                    <div className="order-info-card-header">
                      <div className="order-info-icon-badge">
                        <i className="fa-solid fa-location-dot"></i>
                      </div>
                      <h6 className="order-info-card-title">{t("orders.delivery")}</h6>
                    </div>
                    <div className="order-info-card-body">
                      <div className="fw-700 medium-black fs-15 mb-2">
                        {order.customerName || t("orders.guestCustomer")}
                      </div>
                      <div className="text-secondary fs-13 mb-1 d-flex align-items-center gap-2">
                        <i className="fa-solid fa-phone text-muted" style={{ width: "16px" }}></i>
                        <span className="medium-black fw-500">{order.phone || "—"}</span>
                      </div>
                      {order.customerEmail && (
                        <div className="text-secondary fs-13 mb-2 d-flex align-items-center gap-2">
                          <i className="fa-solid fa-envelope text-muted" style={{ width: "16px" }}></i>
                          <span>{order.customerEmail}</span>
                        </div>
                      )}
                      <div className="fs-13 pt-2 mt-auto border-top">
                        <span className="light-gray d-block fs-11 fw-600 text-uppercase mb-1">
                          {t("orders.shippingAddress")}:
                        </span>
                        <span className="medium-black">{order.shippingAddress || "—"}</span>
                      </div>
                      {order.note && (
                        <div className="fs-12 mt-2 pt-2 border-top text-muted">
                          <span className="fw-600 text-dark me-1">{t("orders.notes")}:</span>
                          <span className="fst-italic">{order.note}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Cột 2: Hình thức giao hàng & Mã vận đơn */}
                <div className="col-12 col-lg-4">
                  <div className="order-info-card">
                    <div className="order-info-card-header">
                      <div className="order-info-icon-badge">
                        <i className="fa-solid fa-truck-fast"></i>
                      </div>
                      <h6 className="order-info-card-title">{t("orders.shippingMethod")}</h6>
                    </div>
                    <div className="order-info-card-body">
                      <div className="fw-700 medium-black fs-15 mb-2">
                        {shippingMethodLabel(order.shippingMethod, t)}
                      </div>
                      <div className="text-secondary fs-13 mb-2">
                        <span className="light-gray">{t("orders.shippingFee")}: </span>
                        <strong className="medium-black">
                          {formatOrderMoney(order.shippingFee || 0, i18n.language)}
                        </strong>
                      </div>
                      <div className="fs-13 pt-2 mt-auto border-top">
                        <span className="light-gray d-block fs-11 fw-600 text-uppercase mb-1">
                          {t("commerce.trackingCode")}:
                        </span>
                        <code className="text-primary fw-600 fs-12 bg-light px-2 py-1 rounded border d-inline-block">
                          {order.trackingCode || t("commerce.trackingPending")}
                        </code>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cột 3: Hình thức thanh toán & Trạng thái thanh toán */}
                <div className="col-12 col-lg-4">
                  <div className="order-info-card">
                    <div className="order-info-card-header">
                      <div className="order-info-icon-badge">
                        <i className="fa-solid fa-credit-card"></i>
                      </div>
                      <h6 className="order-info-card-title">{t("orders.paymentMethod")}</h6>
                    </div>
                    <div className="order-info-card-body">
                      <div className="fw-700 medium-black fs-15 mb-2">
                        {paymentMethodLabel(order.paymentMethod, t)}
                      </div>
                      <div className="text-secondary fs-13 mb-2 d-flex align-items-center gap-2">
                        <span className="light-gray">{t("orders.paymentStatus")}:</span>
                        <span className={`badge ${order.paymentStatus === "PAID" ? "bg-success" : "bg-warning text-dark"} px-2.5 py-1 rounded-pill fs-11 fw-600`}>
                          {paymentStatusLabel(order.paymentStatus, t)}
                        </span>
                      </div>
                      <div className="fs-13 pt-2 mt-auto border-top">
                        <span className="light-gray d-block fs-11 fw-600 text-uppercase mb-1">
                          {t("orders.placedAt")}:
                        </span>
                        <span className="medium-black fw-500">
                          {formatOrderDateTime(order.createdAt, i18n.language)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. TRẠNG THÁI VẬN CHUYỂN & TIẾN ĐỘ (STATUS & TIMELINE) */}
              <div className="order-status-card mb-20">
                <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-16">
                  <div className="d-flex align-items-center gap-2">
                    <span className="light-gray fs-14 fw-600">{t("orders.status")}:</span>
                    <span className="badge bg-primary px-3 py-1.5 rounded-pill fs-13 fw-600">
                      {orderStatusLabel(order.orderStatus, t)}
                    </span>
                  </div>
                </div>
                <OrderTrackingTimeline status={order.orderStatus} />
              </div>

              {/* 3. DANH SÁCH SẢN PHẨM & TỔNG TIỀN (ITEMS & TOTAL) */}
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
                      <div className="d-flex flex-column align-items-end gap-2" style={{ minWidth: "260px" }}>
                        <strong className="medium-black" style={{ fontSize: "15px" }}>{formatOrderMoney(item.subtotal, i18n.language)}</strong>
                        {order.orderStatus === "DELIVERED" && (
                          <div className="w-100">
                            <OrderItemReviewAction
                              item={item}
                              orderStatus={order.orderStatus}
                              reviewedItemIds={reviewedOrderItemIds}
                              onOpenReviewModal={(it) => setReviewItem(it)}
                              onItemReviewed={(itemId) => {
                                setReviewedOrderItemIds((current) => new Set(current).add(itemId));
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                <div className="pt-16 border-top mt-16">
                  <div className="d-flex justify-content-between py-1">
                    <span className="light-gray">{t("orders.subtotal")}</span>
                    <span className="medium-black">
                      {formatOrderMoney(order.subtotal != null ? order.subtotal : order.totalCost, i18n.language)}
                    </span>
                  </div>
                  <div className="d-flex justify-content-between py-1">
                    <span className="light-gray">{t("orders.shippingFee")}</span>
                    <span className="medium-black">
                      {formatOrderMoney(order.shippingFee || 0, i18n.language)}
                    </span>
                  </div>
                  {Number(order.discountAmount || 0) > 0 && (
                    <div className="d-flex justify-content-between py-1">
                      <span className="light-gray">
                        {t("orders.discount")} {order.voucherId ? `(#${order.voucherId})` : ""}
                      </span>
                      <span className="text-success">
                        -{formatOrderMoney(order.discountAmount, i18n.language)}
                      </span>
                    </div>
                  )}
                  <div className="d-flex justify-content-between pt-12 border-top mt-8">
                    <span className="fw-600">{t("orders.total")}</span>
                    <strong className="color-primary fs-5">{formatOrderMoney(order.totalCost, i18n.language)}</strong>
                  </div>
                  {order.orderStatus === "PENDING" && (
                    <div className="d-flex justify-content-end mt-24">
                      <button
                        type="button"
                        className="btn-order-cancel-large"
                        disabled={canceling}
                        onClick={handleCancelOrder}
                      >
                        {canceling ? t("orders.cancelling") : t("orders.cancelOrder")}
                      </button>
                    </div>
                  )}
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
