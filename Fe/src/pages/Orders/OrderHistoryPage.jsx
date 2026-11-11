import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import CustomerOrderDetailModal from "../../components/orders/CustomerOrderDetailModal";
import OrderCardItem from "../../components/orders/OrderCardItem";
import OrderItemReviewAction from "../../components/orders/OrderItemReviewAction";
import ProductReviewModal from "../../components/reviews/ProductReviewModal";
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

const STATUS_TABS = [
  { key: "ALL", label: "Tất cả" },
  { key: "PENDING", label: "Chờ thanh toán" },
  { key: "CONFIRMED", label: "Đang xử lý" },
  { key: "SHIPPING", label: "Đang giao" },
  { key: "DELIVERED", label: "Đã giao hàng" },
  { key: "CANCELLED", label: "Đã hủy" },
];

const OrderHistoryPage = () => {
  const { t, i18n } = useTranslation();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [page, setPage] = useState(0);
  const [sort, setSort] = useState("createdAt:desc");
  const [refreshKey, setRefreshKey] = useState(0);
  const [cancelingId, setCancelingId] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedOrderNumber, setSelectedOrderNumber] = useState(null);

  // Review & View States
  const [statusTab, setStatusTab] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("card"); // default to "card" matching Shopee/TikTok style
  const [reviewItem, setReviewItem] = useState(null);
  const [reviewedOrderItemIds, setReviewedOrderItemIds] = useState(() => new Set());

  const sortOptions = useMemo(() => [
    { value: "createdAt:desc", label: t("orders.sort.newest") },
    { value: "createdAt:asc", label: t("orders.sort.oldest") },
    { value: "totalCost:desc", label: t("orders.sort.totalHighLow") },
    { value: "totalCost:asc", label: t("orders.sort.totalLowHigh") },
    { value: "orderId:desc", label: t("orders.sort.idDescending") },
    { value: "orderId:asc", label: t("orders.sort.idAscending") },
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

  const handleItemReviewed = useCallback((orderItemId) => {
    if (!orderItemId) return;
    setReviewedOrderItemIds((prev) => new Set(prev).add(orderItemId));
  }, []);

  const handleReviewSubmitted = useCallback((review) => {
    if (reviewItem?.orderItemId) {
      setReviewedOrderItemIds((prev) => new Set(prev).add(reviewItem.orderItemId));
    }
    setReviewItem(null);
  }, [reviewItem]);

  // Client-side filtering by Status Tab and Search query
  const filteredOrders = useMemo(() => {
    const list = pageData?.content || [];
    return list.filter((order) => {
      // 1. Status Tab filter
      if (statusTab !== "ALL") {
        if (statusTab === "CANCELLED") {
          if (order.orderStatus !== "CANCELLED" && order.orderStatus !== "CANCELED") {
            return false;
          }
        } else if (order.orderStatus !== statusTab) {
          return false;
        }
      }
      // 2. Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchId = String(order.orderId).includes(q);
        const matchTracking = (order.trackingCode || "").toLowerCase().includes(q);
        const matchProduct = (order.orderItems || []).some((item) =>
          (item.productName || "").toLowerCase().includes(q)
        );
        return matchId || matchTracking || matchProduct;
      }
      return true;
    });
  }, [pageData?.content, statusTab, searchQuery]);

  const totalPages = pageData?.totalPages || 0;

  return (
    <>
      <TitleBanner title={t("orders.pageTitle")} />
      <section className="py-40">
        <div className="container-2">
          {/* Header */}
          <div className="customer-orders-heading mb-4">
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

          {/* 1. Status Filter Tabs (matching Shopee/TikTok style) */}
          <div className="order-status-tabs-wrapper mb-3 border-bottom bg-white rounded-3 shadow-sm p-2">
            <div className="d-flex align-items-center gap-2 overflow-auto py-1" style={{ whiteSpace: "nowrap" }}>
              {STATUS_TABS.map((tab) => {
                const isActive = statusTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    className={`btn btn-sm px-3 py-2 fw-600 rounded-pill border-0 ${
                      isActive ? "btn-primary text-white shadow-sm" : "btn-light text-muted"
                    }`}
                    style={{
                      transition: "all 0.2s ease",
                      backgroundColor: isActive ? "#e9613f" : undefined,
                      fontSize: "13.5px",
                    }}
                    onClick={() => setStatusTab(tab.key)}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Search & View Mode Switcher Toolbar */}
          <div className="d-flex align-items-center justify-content-between gap-3 mb-4 flex-wrap">
            <div className="position-relative flex-grow-1" style={{ maxWidth: "420px" }}>
              <i
                className="fa-solid fa-magnifying-glass position-absolute text-muted"
                style={{ left: "14px", top: "50%", transform: "translateY(-50%)", fontSize: "14px" }}
              ></i>
              <input
                type="text"
                className="form-control"
                placeholder="Tìm kiếm đơn hàng theo mã hoặc tên sản phẩm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: "38px", borderRadius: "10px", fontSize: "13.5px", height: "42px" }}
              />
              {searchQuery && (
                <button
                  type="button"
                  className="border-0 bg-transparent text-muted position-absolute"
                  style={{ right: "12px", top: "50%", transform: "translateY(-50%)", cursor: "pointer", fontSize: "16px" }}
                  onClick={() => setSearchQuery("")}
                >
                  ×
                </button>
              )}
            </div>

            <div className="d-flex align-items-center gap-2">
              <span className="text-muted fs-13 d-none d-sm-inline">Giao diện:</span>
              <div className="btn-group" role="group">
                <button
                  type="button"
                  className={`btn btn-sm ${viewMode === "card" ? "btn-dark text-white fw-600" : "btn-outline-secondary"}`}
                  onClick={() => setViewMode("card")}
                  style={{ borderRadius: "8px 0 0 8px", padding: "8px 14px" }}
                >
                  <i className="fa-solid fa-table-cells-large me-1"></i> Dạng thẻ
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${viewMode === "table" ? "btn-dark text-white fw-600" : "btn-outline-secondary"}`}
                  onClick={() => setViewMode("table")}
                  style={{ borderRadius: "0 8px 8px 0", padding: "8px 14px" }}
                >
                  <i className="fa-solid fa-table-list me-1"></i> Dạng bảng
                </button>
              </div>
            </div>
          </div>

          {/* 3. Main Orders Content */}
          {loading ? (
            <div className="p-5 text-center bg-white rounded-3 border shadow-sm">
              <div className="spinner-border text-primary mb-3" role="status"></div>
              <p className="text-muted mb-0">{t("orders.loading", "Đang tải đơn hàng...")}</p>
            </div>
          ) : hasError ? (
            <div className="alert alert-danger rounded-3 p-4 text-center">
              <i className="fa-solid fa-triangle-exclamation fs-24 mb-2 d-block"></i>
              {t("orders.unableToDisplay", "Không thể hiển thị danh sách đơn hàng.")}
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-5 text-center bg-white rounded-3 border shadow-sm">
              <div
                style={{
                  width: "70px",
                  height: "70px",
                  borderRadius: "50%",
                  backgroundColor: "#fef3f2",
                  color: "#e9613f",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "30px",
                  margin: "0 auto 16px auto",
                }}
              >
                <i className="fa-regular fa-clipboard"></i>
              </div>
              <h5 className="fw-700 medium-black mb-2">Chưa tìm thấy đơn hàng nào</h5>
              <p className="text-muted fs-14 mb-4">
                {searchQuery || statusTab !== "ALL"
                  ? "Không có đơn hàng nào khớp với bộ lọc hiện tại. Vui lòng thử tìm kiếm khác."
                  : t("orders.empty", "Bạn chưa có đơn hàng nào.")}
              </p>
              <Link to="/shop" className="admin-btn-primary d-inline-block text-decoration-none">
                {t("orders.continueShopping", "Khám phá cửa hàng")}
              </Link>
            </div>
          ) : viewMode === "card" ? (
            /* Card View (bám sát theo mẫu Shopee / TikTok) */
            <div className="orders-cards-list">
              {filteredOrders.map((order, index) => {
                const orderNumber = page * PAGE_SIZE + index + 1;
                return (
                  <OrderCardItem
                    key={order.orderId}
                    order={order}
                    orderNumber={orderNumber}
                    onOpenDetails={(ord, num) => {
                      setSelectedOrder(ord);
                      setSelectedOrderNumber(num);
                    }}
                    onCancelOrder={cancelOrder}
                    onOpenReviewModal={(item) => setReviewItem(item)}
                    reviewedOrderItemIds={reviewedOrderItemIds}
                    onItemReviewed={handleItemReviewed}
                    isCanceling={cancelingId === order.orderId}
                  />
                );
              })}
            </div>
          ) : (
            /* Table View */
            <div className="customer-orders-card">
              <div className="customer-orders-table-wrap">
                <table className="customer-orders-table">
                  <thead>
                    <tr>
                      <th>{t("orders.columns.number")}</th>
                      <th>{t("orders.columns.productsPrice")}</th>
                      <th>{t("orders.columns.status")}</th>
                      <th>{t("orders.columns.payment")}</th>
                      <th>{t("orders.columns.shippingPhone")}</th>
                      <th>{t("orders.columns.voucherDiscount")}</th>
                      <th>{t("orders.columns.total")}</th>
                      <th>{t("orders.columns.actions")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((order, index) => {
                      const orderNumber = page * PAGE_SIZE + index + 1;
                      const isDelivered = order.orderStatus === "DELIVERED";
                      return (
                        <tr key={order.orderId}>
                          <td><strong>{orderNumber}</strong></td>
                          <td className="customer-orders-products">
                            {order.orderItems?.length ? order.orderItems.map((item) => (
                              <div className="customer-orders-product" key={item.orderItemId}>
                                <div>
                                  <Link
                                    to={`/product/${item.productId}`}
                                    className="text-dark fw-600 text-decoration-none d-block mb-1"
                                    style={{ fontSize: "13.5px" }}
                                  >
                                    {item.productName}
                                  </Link>
                                  <small className="text-muted">
                                    {t("orders.quantityPrice", { quantity: item.quantity, price: formatOrderMoney(item.unitPrice, i18n.language) })}
                                  </small>
                                </div>
                                {isDelivered && (
                                  <OrderItemReviewAction
                                    item={item}
                                    orderStatus={order.orderStatus}
                                    reviewedItemIds={reviewedOrderItemIds}
                                    onOpenReviewModal={(it) => setReviewItem(it)}
                                    onItemReviewed={handleItemReviewed}
                                    variant="table"
                                  />
                                )}
                              </div>
                            )) : <span className="light-gray">{t("orders.noProducts")}</span>}
                          </td>
                          <td>
                            <span className={`customer-order-status customer-order-status-${String(order.orderStatus || "unknown").toLowerCase()}`}>
                              {orderStatusLabel(order.orderStatus, t)}
                            </span>
                          </td>
                          <td>
                            <span>{paymentMethodLabel(order.paymentMethod, t)}</span>
                            <small>{paymentStatusLabel(order.paymentStatus, t)}</small>
                          </td>
                          <td>
                            <span>{shippingMethodLabel(order.shippingMethod, t)}</span>
                            <small>{order.phone || "—"}</small>
                          </td>
                          <td>
                            <span>{order.voucherCode || (order.voucherId ? `#${order.voucherId}` : "—")}</span>
                            <small>{t("orders.discountValue", { amount: formatOrderMoney(order.discountAmount, i18n.language) })}</small>
                          </td>
                          <td>
                            <strong className="customer-orders-total">{formatOrderMoney(order.totalCost, i18n.language)}</strong>
                          </td>
                          <td>
                            <div className="customer-orders-actions">
                              <button
                                type="button"
                                className="btn btn-outline-primary btn-sm"
                                onClick={() => { setSelectedOrder(order); setSelectedOrderNumber(orderNumber); }}
                              >
                                {t("orders.details")}
                              </button>
                              {order.orderStatus === "PENDING" && (
                                <button
                                  type="button"
                                  className="btn btn-outline-danger btn-sm"
                                  onClick={() => cancelOrder(order.orderId, orderNumber)}
                                  disabled={cancelingId === order.orderId}
                                >
                                  {cancelingId === order.orderId ? t("orders.cancelling") : t("orders.cancelOrder")}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Pagination */}
          {!loading && !hasError && pageData && totalPages > 1 && (
            <div className="customer-orders-footer mt-4 bg-white rounded-3 border p-3">
              <span>{t("orders.paginationSummary", { shown: pageData.content.length, total: pageData.totalElements })}</span>
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} ariaLabel={t("orders.paginationLabel")} />
            </div>
          )}
        </div>
      </section>

      {/* Modal chi tiết đơn hàng */}
      <CustomerOrderDetailModal order={selectedOrder} orderNumber={selectedOrderNumber} onClose={closeDetails} />

      {/* Modal Đánh giá chi tiết (mở khi nhấn 'Viết đánh giá') */}
      <ProductReviewModal
        item={reviewItem}
        onClose={() => setReviewItem(null)}
        onSubmitted={handleReviewSubmitted}
      />
    </>
  );
};

export default OrderHistoryPage;
