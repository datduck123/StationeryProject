import { useEffect, useState } from "react";
import { Link, Navigate, useLocation, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import TitleBanner from "../../components/shared/TitleBanner";
import OrderTrackingTimeline from "../../components/orders/OrderTrackingTimeline";
import orderService from "../../services/orderService";
import { formatOrderMoney, paymentMethodLabel, paymentStatusLabel } from "../../utils/orderFormatters";
import "../../styles/checkout.css";

const OrderSuccessPage = () => {
  const { t, i18n } = useTranslation();
  const { state } = useLocation();
  const [params] = useSearchParams();
  const orderId = params.get("orderId") || state?.orderId;
  const [order, setOrder] = useState(state?.order || null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(Boolean(orderId && !state?.order));
  useEffect(() => {
    if (!orderId) return;
    let active = true;
    setError("");
    orderService.getMyOrder(orderId).then((data) => { if (active) setOrder(data?.data ?? data); })
      .catch(() => { if (active) setError(t("orders.toast.loadError")); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [orderId, t]);
  if (!orderId) return <Navigate to="/account/orders" replace />;
  return <>
    <TitleBanner title={t("orders.successPageTitle")} />
    <section className="py-40 commerce-page"><div className="container-2"><div className="commerce-panel commerce-success">
      {loading ? <p role="status">{t("orders.loadingDetail")}</p> : error && !order ? <div className="alert alert-danger" role="alert">{error}</div> : <>
        <div className="commerce-success-icon" aria-hidden="true">✓</div>
        <h3 className="mb-2">{t("orders.successHeading")}</h3>
        <p>{t("orders.successOrderNumber", { id: orderId })}</p>
        {order && <>
          <p><strong>{t("commerce.trackingCode")}:</strong> {order.trackingCode || t("commerce.trackingPending")}</p>
          <p>{paymentMethodLabel(order.paymentMethod, t)} · {paymentStatusLabel(order.paymentStatus, t)}</p>
          <p className="fs-5 fw-bold color-primary">{formatOrderMoney(order.totalCost, i18n.language)}</p>
          <div className="commerce-success-timeline"><OrderTrackingTimeline status={order.orderStatus} /></div>
        </>}
      </>}
      <div className="d-flex flex-wrap justify-content-center gap-3 mt-4"><Link to={`/account/orders/${orderId}`} className="btn btn-primary">{t("orders.details")}</Link><Link to="/account/orders" className="btn btn-outline-secondary">{t("orders.viewMyOrders")}</Link><Link to="/shop" className="btn btn-link">{t("orders.continueShopping")}</Link></div>
    </div></div></section>
  </>;
};
export default OrderSuccessPage;
