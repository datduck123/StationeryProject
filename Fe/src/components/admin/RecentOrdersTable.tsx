import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import orderService from "../../services/orderService";

export interface OrderItemDTO {
  orderId: number;
  userId?: number;
  customerName?: string;
  customerEmail?: string;
  orderStatus: string;
  totalCost: number | string;
  createdAt?: string;
  itemCount?: number;
}

export interface RecentOrdersTableProps {
  orders?: OrderItemDTO[];
  loading?: boolean;
  onRefresh?: () => void;
  onOrderUpdated?: () => void;
}

const formatCurrency = (val: number | string): string => {
  if (val === undefined || val === null) return "0 ₫";
  const num = typeof val === "string" ? parseFloat(val) : val;
  if (isNaN(num)) return "0 ₫";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(num);
};

const formatDate = (dateStr?: string): string => {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(d);
  } catch {
    return dateStr;
  }
};

const getStatusBadge = (status: string) => {
  switch (status?.toUpperCase()) {
    case "PENDING":
      return (
        <span className="badge bg-warning-subtle text-warning border border-warning-subtle px-2.5 py-1 rounded-pill fs-11 fw-600">
          <i className="fa-solid fa-clock me-1"></i> Chờ duyệt
        </span>
      );
    case "CONFIRMED":
      return (
        <span className="badge bg-purple-subtle text-purple border border-purple-subtle px-2.5 py-1 rounded-pill fs-11 fw-600">
          <i className="fa-solid fa-clipboard-check me-1"></i> Đã xác nhận
        </span>
      );
    case "SHIPPING":
      return (
        <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-2.5 py-1 rounded-pill fs-11 fw-600">
          <i className="fa-solid fa-truck-fast me-1"></i> Đang giao
        </span>
      );
    case "DELIVERED":
      return (
        <span className="badge bg-success-subtle text-success border border-success-subtle px-2.5 py-1 rounded-pill fs-11 fw-600">
          <i className="fa-solid fa-circle-check me-1"></i> Hoàn thành
        </span>
      );
    case "CANCELLED":
      return (
        <span className="badge bg-danger-subtle text-danger border border-danger-subtle px-2.5 py-1 rounded-pill fs-11 fw-600">
          <i className="fa-solid fa-ban me-1"></i> Đã hủy
        </span>
      );
    default:
      return (
        <span className="badge bg-light text-muted border px-2.5 py-1 rounded-pill fs-11">
          {status}
        </span>
      );
  }
};

export const RecentOrdersTable: React.FC<RecentOrdersTableProps> = ({
  orders = [],
  loading = false,
  onRefresh,
  onOrderUpdated,
}) => {
  const navigate = useNavigate();
  const [filterPendingOnly, setFilterPendingOnly] = useState(false);
  const [processingId, setProcessingId] = useState<number | null>(null);

  const pendingCount = useMemo(() => {
    return orders.filter((o) => o.orderStatus?.toUpperCase() === "PENDING").length;
  }, [orders]);

  const displayedOrders = useMemo(() => {
    if (filterPendingOnly) {
      return orders.filter((o) => o.orderStatus?.toUpperCase() === "PENDING");
    }
    return orders;
  }, [orders, filterPendingOnly]);

  // Quick confirm approval action
  const handleQuickApprove = async (orderId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setProcessingId(orderId);
      await orderService.updateOrderStatus(orderId, "CONFIRMED");
      if (onOrderUpdated) {
        onOrderUpdated();
      } else if (onRefresh) {
        onRefresh();
      }
    } catch (err) {
      console.error("Failed to approve order:", err);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="card border-0 shadow-sm rounded-3 p-4 bg-white h-100 d-flex flex-column">
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <div className="d-flex align-items-center gap-2.5">
          <div
            className="d-flex align-items-center justify-content-center rounded-3 bg-primary-subtle text-primary"
            style={{ width: "40px", height: "40px" }}
          >
            <i className="fa-solid fa-cart-shopping fs-18"></i>
          </div>
          <div>
            <h5 className="fw-700 medium-black mb-0 d-flex align-items-center gap-2">
              Đơn hàng cần duyệt & Mới nhất
              {pendingCount > 0 && (
                <span className="badge bg-warning text-dark px-2 py-0.5 rounded-pill fs-11 fw-700">
                  {pendingCount} chờ duyệt
                </span>
              )}
            </h5>
            <span className="fs-12 text-muted">
              Đơn hàng khách đặt trực tiếp trên hệ thống
            </span>
          </div>
        </div>

        <div className="d-flex align-items-center gap-2">
          {/* Toggle Filter: Pending vs All */}
          <div className="btn-group btn-group-sm bg-light p-1 rounded-pill border">
            <button
              type="button"
              className={`btn btn-sm rounded-pill px-2.5 py-1 ${
                !filterPendingOnly
                  ? "btn-white shadow-sm fw-600 text-dark"
                  : "text-muted border-0"
              }`}
              onClick={() => setFilterPendingOnly(false)}
            >
              Tất cả ({orders.length})
            </button>
            <button
              type="button"
              className={`btn btn-sm rounded-pill px-2.5 py-1 ${
                filterPendingOnly
                  ? "btn-white shadow-sm fw-600 text-warning"
                  : "text-muted border-0"
              }`}
              onClick={() => setFilterPendingOnly(true)}
            >
              Chờ duyệt ({pendingCount})
            </button>
          </div>

          {onRefresh && (
            <button
              type="button"
              className="btn btn-sm btn-outline-light text-muted border rounded-pill px-2.5"
              onClick={onRefresh}
              title="Làm mới đơn hàng"
            >
              <i className={`fa-solid fa-rotate-right ${loading ? "fa-spin" : ""}`}></i>
            </button>
          )}

          {/* Nút chuyển nhanh tới trang xử lý đơn hàng */}
          <Link
            to="/admin/orders"
            className="btn btn-sm btn-outline-primary rounded-pill px-3 fs-12 fw-600 d-flex align-items-center gap-1.5 hover-scale"
          >
            <span>Quản lý đơn</span>
            <i className="fa-solid fa-arrow-right fs-11"></i>
          </Link>
        </div>
      </div>

      {/* Body Table */}
      <div className="table-responsive flex-grow-1">
        {loading ? (
          <div className="d-flex flex-column align-items-center justify-content-center py-5">
            <div className="spinner-border spinner-border-sm text-primary mb-2" role="status"></div>
            <span className="text-muted fs-13">Đang tải danh sách đơn hàng...</span>
          </div>
        ) : displayedOrders.length === 0 ? (
          <div className="text-center py-5">
            <div
              className="d-inline-flex align-items-center justify-content-center rounded-circle bg-light text-muted mb-2"
              style={{ width: "48px", height: "48px" }}
            >
              <i className="fa-solid fa-inbox fs-20"></i>
            </div>
            <h6 className="fw-700 medium-black mb-1 fs-14">
              {filterPendingOnly ? "Không có đơn chờ duyệt" : "Chưa có đơn hàng nào"}
            </h6>
            <p className="text-muted fs-12 mb-0">
              {filterPendingOnly
                ? "Tất cả các đơn hàng đều đã được xử lý."
                : "Các đơn hàng mới sẽ tự động hiển thị tại đây."}
            </p>
          </div>
        ) : (
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr className="fs-11 text-uppercase text-muted">
                <th>Mã đơn</th>
                <th>Khách hàng</th>
                <th>Tổng tiền</th>
                <th>Thời gian</th>
                <th>Trạng thái</th>
                <th className="text-end">Thao tác xử lý</th>
              </tr>
            </thead>
            <tbody>
              {displayedOrders.map((ord) => {
                const isPending = ord.orderStatus?.toUpperCase() === "PENDING";
                const isProcessing = processingId === ord.orderId;

                return (
                  <tr
                    key={ord.orderId}
                    style={{ cursor: "pointer" }}
                    onClick={() => navigate(`/admin/orders/${ord.orderId}`)}
                  >
                    <td>
                      <span className="fw-700 fs-12 text-primary">
                        #ORD-{ord.orderId}
                      </span>
                      {ord.itemCount ? (
                        <div className="fs-10 text-muted">{ord.itemCount} sản phẩm</div>
                      ) : null}
                    </td>
                    <td>
                      <div className="fw-600 fs-13 medium-black">
                        {ord.customerName || "Khách vãng lai"}
                      </div>
                      <div className="fs-11 text-muted">{ord.customerEmail || "N/A"}</div>
                    </td>
                    <td>
                      <div className="fw-700 fs-13 text-dark">
                        {formatCurrency(ord.totalCost)}
                      </div>
                    </td>
                    <td>
                      <span className="fs-12 text-muted">{formatDate(ord.createdAt)}</span>
                    </td>
                    <td>{getStatusBadge(ord.orderStatus)}</td>
                    {/* Nút chuyển nhanh tới trang xử lý & Duyệt nhanh */}
                    <td className="text-end" onClick={(e) => e.stopPropagation()}>
                      <div className="d-flex align-items-center justify-content-end gap-1.5">
                        {isPending && (
                          <button
                            type="button"
                            className="btn btn-sm btn-success rounded-pill px-2.5 py-1 fs-11 fw-600 d-inline-flex align-items-center gap-1 shadow-sm"
                            onClick={(e) => handleQuickApprove(ord.orderId, e)}
                            disabled={isProcessing}
                            title="Xác nhận duyệt đơn hàng ngay"
                          >
                            {isProcessing ? (
                              <span className="spinner-border spinner-border-sm" role="status"></span>
                            ) : (
                              <>
                                <i className="fa-solid fa-check fs-10"></i>
                                <span>Duyệt</span>
                              </>
                            )}
                          </button>
                        )}
                        <Link
                          to={`/admin/orders/${ord.orderId}`}
                          className="btn btn-sm btn-light border rounded-pill px-2.5 py-1 fs-11 fw-600 text-dark hover-card"
                          title="Mở chi tiết và xử lý đơn hàng"
                        >
                          <i className="fa-solid fa-arrow-up-right-from-square me-1 text-primary"></i>
                          Chi tiết
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer */}
      {displayedOrders.length > 0 && (
        <div className="pt-3 border-top mt-auto d-flex justify-content-between align-items-center fs-12 text-muted">
          <span>
            Hiển thị <strong>{displayedOrders.length} đơn hàng</strong> mới nhất.
          </span>
          <Link to="/admin/orders" className="text-decoration-none fw-600 text-primary fs-12">
            Xem toàn bộ đơn hàng &rarr;
          </Link>
        </div>
      )}
    </div>
  );
};

export default RecentOrdersTable;
