import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import AdminListControls from "../../components/admin/AdminListControls";
import OrderDetailsContent from "../../components/orders/OrderDetailsContent";
import OrderStatusChanger from "../../components/orders/OrderStatusChanger";
import { nextStatuses } from "../../components/orders/orderStatusTransitions";
import Pagination from "../../components/ui/Pagination";
import { useToast } from "../../providers/ToastContext";
import orderService from "../../services/orderService";

const PAGE_SIZE = 10;
const statusColors = {
  PENDING: "warning",
  CONFIRMED: "primary",
  SHIPPING: "info",
  DELIVERED: "success",
  CANCELLED: "secondary",
};
const money = (amount, language) =>
  new Intl.NumberFormat(language === "vi" ? "vi-VN" : "en-US", { style: "currency", currency: "VND" }).format(Number(amount || 0));

const AdminOrderManagement = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { id: routeOrderId } = useParams();
  const { showToast } = useToast();
  const [searchInput, setSearchInput] = useState("");
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState("createdAt:desc");
  const [page, setPage] = useState(0);
  const [pageData, setPageData] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailOrderId, setDetailOrderId] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [statusOrder, setStatusOrder] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    totalOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0,
    deliveredRevenue: 0,
  });
  const detailRequestId = useRef(0);
  const detailDialogRef = useRef(null);
  const closeDetailButton = useRef(null);
  const closeStatusButton = useRef(null);
  const statusOptions = [
    { value: "", label: t("adminOrders.filters.allStatuses") },
    ...["PENDING", "CONFIRMED", "SHIPPING", "DELIVERED", "CANCELLED"].map((value) => ({
      value,
      label: t(`orders.statuses.${value}`),
    })),
  ];
  const sortOptions = [
    { value: "createdAt:desc", label: t("orders.sort.newest") },
    { value: "createdAt:asc", label: t("orders.sort.oldest") },
    { value: "totalCost:desc", label: t("orders.sort.totalHighLow") },
    { value: "totalCost:asc", label: t("orders.sort.totalLowHigh") },
    { value: "orderId:desc", label: t("orders.sort.idDescending") },
    { value: "orderId:asc", label: t("orders.sort.idAscending") },
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      setKeyword(searchInput.trim());
      setPage(0);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    const [sortBy, sortDir] = sort.split(":");
    orderService.getOrders({
      page,
      size: PAGE_SIZE,
      sortBy,
      sortDir,
      ...(status ? { status } : {}),
      ...(keyword ? { keyword } : {}),
    }).then((data) => {
      if (active) setPageData(data);
    }).catch((requestError) => {
      if (active) {
        const message = requestError?.response?.data?.message || t("adminOrders.errors.loadOrders");
        setError(message);
        showToast(message, "error");
      }
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [page, sort, status, keyword, refreshKey, showToast, t]);

  useEffect(() => {
    let active = true;
    orderService.getOrderStats()
      .then((data) => {
        if (active) setStats(data);
      })
      .catch((requestError) => {
        if (active) showToast(requestError?.response?.data?.message || t("adminOrders.errors.loadStats"), "error");
      });
    return () => { active = false; };
  }, [refreshKey, showToast, t]);

  const closeDetail = () => {
    navigate("/admin/orders");
  };

  useEffect(() => {
    if (!detailOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    const previouslyFocusedElement = document.activeElement;
    document.body.style.overflow = "hidden";
    closeDetailButton.current?.focus();
    const onKeyDown = (event) => {
      if (event.key === "Escape") closeDetail();
      if (event.key !== "Tab" || !detailDialogRef.current) return;
      const focusable = [...detailDialogRef.current.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')]
        .filter((element) => element.getClientRects().length > 0);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!detailDialogRef.current.contains(document.activeElement)) {
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
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      if (previouslyFocusedElement?.isConnected) previouslyFocusedElement.focus();
    };
  }, [detailOpen]);

  useEffect(() => {
    if (!statusOrder) return undefined;
    closeStatusButton.current?.focus();
    const onKeyDown = (event) => {
      if (event.key === "Escape") setStatusOrder(null);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [statusOrder]);

  useEffect(() => {
    if (!routeOrderId) {
      detailRequestId.current += 1;
      setDetailOpen(false);
      setSelectedOrder(null);
      return;
    }
    const orderId = Number(routeOrderId);
    const requestId = ++detailRequestId.current;
    setDetailOrderId(orderId);
    setSelectedOrder(null);
    setDetailError("");
    setDetailLoading(true);
    setDetailOpen(true);
    if (!Number.isSafeInteger(orderId) || orderId < 1) {
      setDetailError(t("adminOrders.errors.invalidOrderId"));
      setDetailLoading(false);
      return;
    }
    orderService.getOrder(orderId)
      .then((order) => {
        if (requestId === detailRequestId.current) setSelectedOrder(order);
      })
      .catch((requestError) => {
        if (requestId === detailRequestId.current) {
          setDetailError(requestError?.response?.data?.message || t("adminOrders.errors.loadDetail"));
        }
      })
      .finally(() => {
        if (requestId === detailRequestId.current) setDetailLoading(false);
      });
  }, [routeOrderId, t]);

  const onStatusUpdated = (updatedOrder) => {
    setPageData((current) => current && ({
      ...current,
      content: current.content.map((order) => order.orderId === updatedOrder.orderId
        ? { ...order, orderStatus: updatedOrder.orderStatus }
        : order),
    }));
    showToast(t("adminOrders.toast.statusUpdated", {
      id: updatedOrder.orderId,
      status: t(`orders.statuses.${updatedOrder.orderStatus}`),
    }), "success");
    setStatusOrder(null);
    setRefreshKey((value) => value + 1);
  };

  return (
    <section className="p-4">
      <div className="mb-4">
        <h4 className="fw-700 medium-black mb-1">{t("adminOrders.title")}</h4>
        <p className="text-muted fs-13 mb-0">{t("adminOrders.subtitle")}</p>
      </div>
      <div className="admin-order-stats" aria-label={t("adminOrders.stats.ariaLabel")}>
        <article className="admin-order-stat-card admin-order-stat-total">
          <div><p>{t("adminOrders.stats.total")}</p><strong>{Number(stats.totalOrders || 0).toLocaleString(i18n.language)}</strong></div>
          <span className="admin-order-stat-icon" aria-hidden="true"><i className="fa-solid fa-receipt" /></span>
        </article>
        <article className="admin-order-stat-card admin-order-stat-delivered">
          <div><p>{t("adminOrders.stats.delivered")}</p><strong>{Number(stats.deliveredOrders || 0).toLocaleString(i18n.language)}</strong></div>
          <span className="admin-order-stat-icon" aria-hidden="true"><i className="fa-solid fa-circle-check" /></span>
        </article>
        <article className="admin-order-stat-card admin-order-stat-cancelled">
          <div><p>{t("adminOrders.stats.cancelled")}</p><strong>{Number(stats.cancelledOrders || 0).toLocaleString(i18n.language)}</strong></div>
          <span className="admin-order-stat-icon" aria-hidden="true"><i className="fa-solid fa-ban" /></span>
        </article>
        <article className="admin-order-stat-card admin-order-stat-revenue">
          <div><p>{t("adminOrders.stats.revenue")}</p><strong>{money(stats.deliveredRevenue, i18n.language)}</strong></div>
          <span className="admin-order-stat-icon" aria-hidden="true"><i className="fa-solid fa-coins" /></span>
        </article>
      </div>
      <AdminListControls
        search={searchInput}
        onSearchChange={setSearchInput}
        searchPlaceholder={t("adminOrders.searchPlaceholder")}
        filters={[{
          label: t("adminOrders.filters.status"),
          value: status,
          onChange: (value) => { setStatus(value); setPage(0); },
          options: statusOptions,
        }]}
        sort={sort}
        sortLabel={t("adminOrders.filters.sort")}
        onSortChange={(value) => { setSort(value); setPage(0); }}
        sortOptions={sortOptions}
      />
      <div className="admin-card">
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr><th>{t("adminOrders.columns.number")}</th><th>{t("adminOrders.columns.customer")}</th><th>{t("adminOrders.columns.date")}</th><th>{t("adminOrders.columns.status")}</th><th>{t("adminOrders.columns.items")}</th><th>{t("adminOrders.columns.total")}</th><th>{t("adminOrders.columns.actions")}</th></tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" className="text-center py-5">{t("adminOrders.loading")}</td></tr>
              ) : error ? (
                <tr><td colSpan="7" className="text-center py-5">{t("adminOrders.unableToDisplay")}</td></tr>
              ) : pageData?.content?.length ? (
                pageData.content.map((order, index) => (
                  <tr key={order.orderId}>
                    <td>{page * PAGE_SIZE + index + 1}</td>
                    <td>{order.customerName}<small className="d-block text-muted">{order.customerEmail}</small></td>
                    <td>{order.createdAt ? new Date(order.createdAt).toLocaleDateString(i18n.language === "vi" ? "vi-VN" : "en-US") : "—"}</td>
                    <td><span className={`badge text-bg-${statusColors[order.orderStatus] || "secondary"}`}>{t(`orders.statuses.${order.orderStatus}`)}</span></td>
                    <td>{order.itemCount}</td>
                    <td>{money(order.totalCost, i18n.language)}</td>
                    <td>
                      <div className="d-flex flex-wrap gap-2">
                        <button type="button" className="btn btn-outline-primary btn-sm" onClick={() => navigate(`/admin/orders/${order.orderId}`)}>{t("adminOrders.actions.details")}</button>
                        <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setStatusOrder(order)} disabled={!nextStatuses[order.orderStatus]?.length}>{t("adminOrders.actions.editStatus")}</button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="7" className="text-center py-5">{t("adminOrders.empty")}</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {!loading && !error && pageData && (
          <div className="admin-order-pagination">
            <span>
              {t("adminOrders.paginationSummary", {
                from: page * PAGE_SIZE + (pageData.content?.length ? 1 : 0),
                to: Math.min((page + 1) * PAGE_SIZE, pageData.totalElements || 0),
                total: pageData.totalElements || 0,
              })}
            </span>
            <Pagination
              page={page}
              totalPages={pageData.totalPages || 0}
              onPageChange={setPage}
              ariaLabel={t("adminOrders.paginationLabel")}
            />
          </div>
        )}
      </div>
      {detailOpen && createPortal(
        <div
          className="admin-order-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeDetail();
          }}
        >
          <div ref={detailDialogRef} className="admin-order-dialog admin-order-detail-dialog" role="dialog" aria-modal="true" aria-labelledby="admin-order-detail-title">
            <div className="admin-order-dialog-header">
              <h5 id="admin-order-detail-title">{t("adminOrders.detail.title", { id: detailOrderId })}</h5>
              <button ref={closeDetailButton} type="button" className="btn-close" aria-label={t("adminOrders.detail.closeAria")} onClick={closeDetail} />
            </div>
            <div className="admin-order-dialog-body">
              {detailLoading && <p className="mb-0">{t("adminOrders.detail.loading")}</p>}
              {detailError && <div className="alert alert-danger mb-0" role="alert">{detailError}</div>}
              {selectedOrder && <OrderDetailsContent order={selectedOrder} />}
            </div>
            <div className="admin-order-dialog-footer">
              <button type="button" className="btn btn-outline-secondary" onClick={closeDetail}>{t("common.close")}</button>
            </div>
          </div>
        </div>,
        document.body,
      )}
      {statusOrder && createPortal(
        <div className="admin-order-overlay" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setStatusOrder(null);
        }}>
          <div className="admin-order-dialog admin-order-status-dialog" role="dialog" aria-modal="true" aria-labelledby="admin-order-status-title">
            <div className="admin-order-dialog-header">
              <h5 id="admin-order-status-title">{t("adminOrders.statusEditor.title", { id: statusOrder.orderId })}</h5>
              <button ref={closeStatusButton} type="button" className="btn-close" aria-label={t("adminOrders.statusEditor.closeAria")} onClick={() => setStatusOrder(null)} />
            </div>
            <div className="admin-order-dialog-body">
              <p className="mb-0"><strong>{t("adminOrders.statusEditor.current")}:</strong> {t(`orders.statuses.${statusOrder.orderStatus}`)}</p>
              <OrderStatusChanger order={statusOrder} onUpdated={onStatusUpdated} />
            </div>
          </div>
        </div>,
        document.body,
      )}
    </section>
  );
};

export default AdminOrderManagement;
