import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useParams } from "react-router-dom";
import AdminListControls from "../../components/admin/AdminListControls";
import AdminPagination from "../../components/admin/AdminPagination";
import OrderStatusChanger from "../../components/orders/OrderStatusChanger";
import { nextStatuses } from "../../components/orders/orderStatusTransitions";
import orderService from "../../services/orderService";

const PAGE_SIZE = 10;
const statusOptions = [
  { value: "", label: "All statuses" },
  { value: "PENDING", label: "Pending" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "SHIPPING", label: "Shipping" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
];
const sortOptions = [
  { value: "createdAt:desc", label: "Newest first" },
  { value: "createdAt:asc", label: "Oldest first" },
  { value: "totalCost:desc", label: "Total: high to low" },
  { value: "totalCost:asc", label: "Total: low to high" },
  { value: "orderId:desc", label: "Order ID: high to low" },
  { value: "orderId:asc", label: "Order ID: low to high" },
];
const statusColors = {
  PENDING: "warning",
  CONFIRMED: "primary",
  SHIPPING: "info",
  DELIVERED: "success",
  CANCELLED: "secondary",
};
const money = (amount) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(Number(amount || 0));

const AdminOrderManagement = () => {
  const navigate = useNavigate();
  const { id: routeOrderId } = useParams();
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
  const [listNotice, setListNotice] = useState("");
  const detailRequestId = useRef(0);
  const closeDetailButton = useRef(null);
  const closeStatusButton = useRef(null);

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
      if (active) setError(requestError?.response?.data?.message || "Could not load orders.");
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [page, sort, status, keyword, refreshKey]);

  const closeDetail = () => {
    navigate("/admin/orders");
  };

  useEffect(() => {
    if (!detailOpen) return undefined;
    closeDetailButton.current?.focus();
    const onKeyDown = (event) => {
      if (event.key === "Escape") closeDetail();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
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
      setDetailError("Invalid order ID.");
      setDetailLoading(false);
      return;
    }
    orderService.getOrder(orderId)
      .then((order) => {
        if (requestId === detailRequestId.current) setSelectedOrder(order);
      })
      .catch((requestError) => {
        if (requestId === detailRequestId.current) {
          setDetailError(requestError?.response?.data?.message || "Could not load order details.");
        }
      })
      .finally(() => {
        if (requestId === detailRequestId.current) setDetailLoading(false);
      });
  }, [routeOrderId]);

  const onStatusUpdated = (updatedOrder) => {
    setPageData((current) => current && ({
      ...current,
      content: current.content.map((order) => order.orderId === updatedOrder.orderId
        ? { ...order, orderStatus: updatedOrder.orderStatus }
        : order),
    }));
    setListNotice(`Order #${updatedOrder.orderId} is now ${updatedOrder.orderStatus}.`);
    setStatusOrder(null);
    setRefreshKey((value) => value + 1);
  };

  return (
    <section className="p-4">
      <div className="mb-4">
        <h4 className="fw-700 medium-black mb-1">Order Management</h4>
        <p className="text-muted fs-13 mb-0">View, find and update customer orders.</p>
      </div>
      <AdminListControls
        search={searchInput}
        onSearchChange={setSearchInput}
        searchPlaceholder="Search by order ID, customer name or email..."
        filters={[{
          label: "Filter by order status",
          value: status,
          onChange: (value) => { setStatus(value); setPage(0); },
          options: statusOptions,
        }]}
        sort={sort}
        onSortChange={(value) => { setSort(value); setPage(0); }}
        sortOptions={sortOptions}
      />
      {error && <div className="alert alert-danger" role="alert">{error}</div>}
      {listNotice && <div className="alert alert-success" role="status">{listNotice}</div>}
      <div className="admin-card">
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr><th>ORDER ID</th><th>CUSTOMER</th><th>DATE</th><th>STATUS</th><th>ITEMS</th><th>TOTAL</th><th>ACTIONS</th></tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" className="text-center py-5">Loading orders...</td></tr>
              ) : error ? (
                <tr><td colSpan="7" className="text-center py-5">Unable to display orders.</td></tr>
              ) : pageData?.content?.length ? (
                pageData.content.map((order) => (
                  <tr key={order.orderId}>
                    <td>#{order.orderId}</td>
                    <td>{order.customerName}<small className="d-block text-muted">{order.customerEmail}</small></td>
                    <td>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "—"}</td>
                    <td><span className={`badge text-bg-${statusColors[order.orderStatus] || "secondary"}`}>{order.orderStatus}</span></td>
                    <td>{order.itemCount}</td>
                    <td>{money(order.totalCost)}</td>
                    <td>
                      <div className="d-flex flex-wrap gap-2">
                        <button type="button" className="btn btn-outline-primary btn-sm" onClick={() => navigate(`/admin/orders/${order.orderId}`)}>Details</button>
                        <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setStatusOrder(order)} disabled={!nextStatuses[order.orderStatus]?.length}>Edit status</button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="7" className="text-center py-5">No orders found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {!loading && !error && pageData && (
          <AdminPagination
            page={page}
            pageSize={PAGE_SIZE}
            totalElements={pageData.totalElements || 0}
            totalPages={pageData.totalPages || 0}
            onPageChange={setPage}
            noun="orders"
          />
        )}
      </div>
      {detailOpen && createPortal(
        <div
          className="admin-order-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeDetail();
          }}
        >
          <div className="admin-order-dialog" role="dialog" aria-modal="true" aria-labelledby="admin-order-detail-title">
            <div className="admin-order-dialog-header">
              <h5 id="admin-order-detail-title">Order #{detailOrderId}</h5>
              <button ref={closeDetailButton} type="button" className="btn-close" aria-label="Close order details" onClick={closeDetail} />
            </div>
            <div className="admin-order-dialog-body">
              {detailLoading && <p className="mb-0">Loading order details...</p>}
              {detailError && <div className="alert alert-danger mb-0" role="alert">{detailError}</div>}
              {selectedOrder && (
                <>
                  <p className="mb-1"><strong>Customer:</strong> {selectedOrder.customerName} ({selectedOrder.customerEmail})</p>
                  <p className="mb-1"><strong>Status:</strong> {selectedOrder.orderStatus}</p>
                  <p className="mb-3"><strong>Ship to:</strong> {selectedOrder.shippingAddress}, {selectedOrder.phone}</p>
                  <h6 className="fw-700">Items</h6>
                  {(selectedOrder.orderItems || []).map((item) => (
                    <div className="d-flex justify-content-between border-bottom py-2" key={item.orderItemId}>
                      <span>{item.productName} × {item.quantity}</span><span>{money(item.subtotal)}</span>
                    </div>
                  ))}
                  <div className="d-flex justify-content-between pt-3 fw-700"><span>Total</span><span>{money(selectedOrder.totalCost)}</span></div>
                </>
              )}
            </div>
            <div className="admin-order-dialog-footer">
              <button type="button" className="btn btn-outline-secondary" onClick={closeDetail}>Close</button>
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
              <h5 id="admin-order-status-title">Edit status · Order #{statusOrder.orderId}</h5>
              <button ref={closeStatusButton} type="button" className="btn-close" aria-label="Close status editor" onClick={() => setStatusOrder(null)} />
            </div>
            <div className="admin-order-dialog-body">
              <p className="mb-0"><strong>Current status:</strong> {statusOrder.orderStatus}</p>
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
