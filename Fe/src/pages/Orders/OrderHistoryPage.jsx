import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import CustomerOrderDetailModal from "../../components/orders/CustomerOrderDetailModal";
import TitleBanner from "../../components/shared/TitleBanner";
import Pagination from "../../components/ui/Pagination";
import { useToast } from "../../providers/ToastContext";
import orderService from "../../services/orderService";
import {
  formatOrderMoney,
  orderStatusLabel,
  paymentMethodLabel,
  paymentStatusLabel,
  shippingMethodLabel,
} from "../../utils/orderFormatters";
import "../../styles/customer-orders.css";

const PAGE_SIZE = 10;

const OrderHistoryPage = () => {
  const { t, i18n } = useTranslation();
  const { showToast } = useToast();
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [page, setPage] = useState(0);
  const [sort, setSort] = useState("createdAt:desc");
  const [refreshKey, setRefreshKey] = useState(0);
  const [cancelingId, setCancelingId] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedOrderNumber, setSelectedOrderNumber] = useState(null);

  const sortOptions = useMemo(() => [
    { value: "totalCost:desc", label: t("orders.sort.totalHighLow") },
    { value: "totalCost:asc", label: t("orders.sort.totalLowHigh") },
    { value: "createdAt:desc", label: t("orders.sort.all") },
  ], [t]);

  useEffect(() => {
    let active = true;
    const [sortBy, sortDir] = sort.split(":");
    setLoading(true);
    setHasError(false);
    orderService.getMyOrders({ page, size: PAGE_SIZE, sortBy, sortDir })
      .then((data) => {
        if (active) setPageData(data);
      })
      .catch((requestError) => {
        if (!active) return;
        setHasError(true);
        showToast(requestError?.response?.data?.message || t("orders.toast.loadError"), "error");
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [page, sort, refreshKey, showToast, t]);

  const closeDetails = useCallback(() => {
    setSelectedOrder(null);
    setSelectedOrderNumber(null);
  }, []);

  const cancelOrder = async (orderId, orderNumber) => {
    if (!window.confirm(t("orders.confirmCancel", { number: orderNumber }))) return;
    setCancelingId(orderId);
    try {
      await orderService.cancelMyOrder(orderId);
      setPageData((current) => current && ({
        ...current,
        content: current.content.map((order) => order.orderId === orderId
          ? { ...order, orderStatus: "CANCELLED" }
          : order),
      }));
      showToast(t("orders.toast.cancelSuccess", { number: orderNumber }), "success");
      setRefreshKey((value) => value + 1);
    } catch (requestError) {
      showToast(requestError?.response?.data?.message || t("orders.toast.cancelError"), "error");
    } finally {
      setCancelingId(null);
    }
  };

  const totalPages = pageData?.totalPages || 0;

  return (
    <>
      <TitleBanner title={t("orders.pageTitle")} />
      <section className="py-40">
        <div className="container-2">
          <div className="customer-orders-heading">
            <div>
              <h4 className="font-sec fw-700 medium-black mb-1">{t("orders.historyTitle")}</h4>
              <p className="light-gray mb-0">{t("orders.historyDescription")}</p>
            </div>
            <div className="customer-orders-controls">
              <label htmlFor="customer-order-sort">{t("orders.sortLabel")}</label>
              <select id="customer-order-sort" className="form-select" value={sort} onChange={(event) => {
                setSort(event.target.value);
                setPage(0);
              }}>
                {sortOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
              <Link to="/shop" className="btn btn-outline-secondary">{t("orders.continueShopping")}</Link>
            </div>
          </div>

          <div className="customer-orders-card">
            <div className="customer-orders-table-wrap">
              <table className="customer-orders-table">
                <thead><tr>
                  <th>{t("orders.columns.number")}</th><th>{t("orders.columns.productsPrice")}</th>
                  <th>{t("orders.columns.status")}</th><th>{t("orders.columns.payment")}</th>
                  <th>{t("orders.columns.shippingPhone")}</th><th>{t("orders.columns.voucherDiscount")}</th>
                  <th>{t("orders.columns.total")}</th><th>{t("orders.columns.actions")}</th>
                </tr></thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="8" className="customer-orders-empty">{t("orders.loading")}</td></tr>
                  ) : !hasError && pageData?.content?.length ? (
                    pageData.content.map((order, index) => {
                      const orderNumber = page * PAGE_SIZE + index + 1;
                      return (
                        <tr key={order.orderId}>
                          <td><strong>{orderNumber}</strong></td>
                          <td className="customer-orders-products">
                            {order.orderItems?.length ? order.orderItems.map((item) => (
                              <div className="customer-orders-product" key={item.orderItemId}>
                                <strong>{item.productName}</strong>
                                <small>{t("orders.quantityPrice", { quantity: item.quantity, price: formatOrderMoney(item.unitPrice, i18n.language) })}</small>
                              </div>
                            )) : <span className="light-gray">{t("orders.noProducts")}</span>}
                          </td>
                          <td><span className={`customer-order-status customer-order-status-${String(order.orderStatus || "unknown").toLowerCase()}`}>{orderStatusLabel(order.orderStatus, t)}</span></td>
                          <td><span>{paymentMethodLabel(order.paymentMethod, t)}</span><small>{paymentStatusLabel(order.paymentStatus, t)}</small></td>
                          <td><span>{shippingMethodLabel(order.shippingMethod, t)}</span><small>{order.phone || "—"}</small></td>
                          <td><span>{order.voucherCode || (order.voucherId ? `#${order.voucherId}` : "—")}</span><small>{t("orders.discountValue", { amount: formatOrderMoney(order.discountAmount, i18n.language) })}</small></td>
                          <td><strong className="customer-orders-total">{formatOrderMoney(order.totalCost, i18n.language)}</strong></td>
                          <td><div className="customer-orders-actions">
                            <button type="button" className="btn btn-outline-primary btn-sm" onClick={() => { setSelectedOrder(order); setSelectedOrderNumber(orderNumber); }}>{t("orders.details")}</button>
                            {order.orderStatus === "DELIVERED" && order.orderItems?.some(item => !item.reviewed) && (
                              <button
                                type="button"
                                className="btn btn-sm text-white"
                                style={{ backgroundColor: "#e9613f", borderColor: "#e9613f", fontSize: "12px", fontWeight: "600", whiteSpace: "nowrap" }}
                                onClick={() => { setSelectedOrder(order); setSelectedOrderNumber(orderNumber); }}
                              >
                                <i className="fa-solid fa-star text-warning me-1"></i>
                                {t("reviews.writeReview", "Đánh giá")}
                              </button>
                            )}
                            {order.orderStatus === "PENDING" && (
                              <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => cancelOrder(order.orderId, orderNumber)} disabled={cancelingId === order.orderId}>
                                {cancelingId === order.orderId ? t("orders.cancelling") : t("orders.cancelOrder")}
                              </button>
                            )}
                          </div></td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr><td colSpan="8" className="customer-orders-empty">{hasError ? t("orders.unableToDisplay") : t("orders.empty")}</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            {!loading && !hasError && pageData && (
              <div className="customer-orders-footer">
                <span>{t("orders.paginationSummary", { shown: pageData.content.length, total: pageData.totalElements })}</span>
                <Pagination page={page} totalPages={totalPages} onPageChange={setPage} ariaLabel={t("orders.paginationLabel")} />
              </div>
            )}
          </div>
        </div>
      </section>
      <CustomerOrderDetailModal order={selectedOrder} orderNumber={selectedOrderNumber} onClose={closeDetails} />
    </>
  );
};

export default OrderHistoryPage;
