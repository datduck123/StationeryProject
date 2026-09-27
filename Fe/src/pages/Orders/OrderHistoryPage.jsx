import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import TitleBanner from "../../components/shared/TitleBanner";
import orderService from "../../services/orderService";
import "../../styles/customer-orders.css";

const PAGE_SIZE = 8;
const sortOptions = [
  { value: "createdAt:desc", label: "Mới nhất" },
  { value: "createdAt:asc", label: "Cũ nhất" },
  { value: "totalCost:desc", label: "Tổng tiền: cao đến thấp" },
  { value: "totalCost:asc", label: "Tổng tiền: thấp đến cao" },
  { value: "orderId:desc", label: "Mã đơn: giảm dần" },
  { value: "orderId:asc", label: "Mã đơn: tăng dần" },
];

const money = (amount) => new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
}).format(Number(amount || 0));

const paymentStatusLabel = (status) => ({
  SUCCESS: "Đã thanh toán",
  PENDING: "Chưa thanh toán",
  FAILED: "Thanh toán thất bại",
  REFUNDED: "Đã hoàn tiền",
})[status] || (status || "Chưa có thông tin");

const paymentMethodLabel = (method) => ({
  COD: "Khi nhận hàng (COD)",
  ONLINE: "Trực tuyến",
})[method] || (method || "—");

const pageNumbers = (current, total) => {
  const visible = new Set([0, total - 1, current - 1, current, current + 1]);
  return [...visible].filter((number) => number >= 0 && number < total).sort((a, b) => a - b);
};

const OrderHistoryPage = () => {
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const [sort, setSort] = useState("createdAt:desc");
  const [refreshKey, setRefreshKey] = useState(0);
  const [cancelingId, setCancelingId] = useState(null);

  useEffect(() => {
    let active = true;
    const [sortBy, sortDir] = sort.split(":");
    setLoading(true);
    orderService.getMyOrders({ page, size: PAGE_SIZE, sortBy, sortDir })
      .then((data) => {
        if (active) {
          setPageData(data);
          setError("");
        }
      })
      .catch((requestError) => {
        if (active) setError(requestError?.response?.data?.message || "Không tải được đơn hàng. Vui lòng thử lại.");
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [page, sort, refreshKey]);

  const cancelOrder = async (orderId) => {
    if (!window.confirm(`Bạn muốn hủy đơn hàng #${orderId}?`)) return;
    setCancelingId(orderId);
    setError("");
    try {
      await orderService.cancelMyOrder(orderId);
      setPageData((current) => current && ({
        ...current,
        content: current.content.map((order) => order.orderId === orderId
          ? { ...order, orderStatus: "CANCELLED" }
          : order),
      }));
      setRefreshKey((value) => value + 1);
    } catch (requestError) {
      setError(requestError?.response?.data?.message || "Không hủy được đơn hàng.");
    } finally {
      setCancelingId(null);
    }
  };

  const totalPages = pageData?.totalPages || 0;
  const visiblePages = pageNumbers(page, totalPages);

  return (
    <>
      <TitleBanner title="Đơn hàng của tôi" />
      <section className="py-40">
        <div className="container-2">
          <div className="customer-orders-heading">
            <div>
              <h4 className="font-sec fw-700 medium-black mb-1">Lịch sử đơn hàng</h4>
              <p className="light-gray mb-0">Xem sản phẩm, thanh toán và trạng thái giao hàng.</p>
            </div>
            <div className="customer-orders-controls">
              <label htmlFor="customer-order-sort">Sắp xếp</label>
              <select id="customer-order-sort" className="form-select" value={sort} onChange={(event) => {
                setSort(event.target.value);
                setPage(0);
              }}>
                {sortOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
              <Link to="/shop" className="btn btn-outline-secondary">Tiếp tục mua sắm</Link>
            </div>
          </div>

          {error && <div className="alert alert-danger" role="alert">{error}</div>}
          <div className="customer-orders-card">
            <div className="customer-orders-table-wrap">
              <table className="customer-orders-table">
                <thead>
                  <tr>
                    <th>Đơn hàng</th>
                    <th>Sản phẩm / Đơn giá</th>
                    <th>Trạng thái</th>
                    <th>Thanh toán</th>
                    <th>Giao hàng / SĐT</th>
                    <th>Voucher / Giảm giá</th>
                    <th>Tổng tiền</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="8" className="customer-orders-empty">Đang tải đơn hàng...</td></tr>
                  ) : !error && pageData?.content?.length ? (
                    pageData.content.map((order) => (
                      <tr key={order.orderId}>
                        <td>
                          <strong>#{order.orderId}</strong>
                          <small>{order.createdAt ? new Date(order.createdAt).toLocaleString("vi-VN") : "—"}</small>
                        </td>
                        <td className="customer-orders-products">
                          {order.orderItems?.length ? order.orderItems.map((item) => (
                            <div className="customer-orders-product" key={item.orderItemId}>
                              <strong>{item.productName}</strong>
                              <small>{item.quantity} × {money(item.unitPrice)}</small>
                            </div>
                          )) : <span className="light-gray">Chưa có sản phẩm</span>}
                        </td>
                        <td><span className={`customer-order-status customer-order-status-${String(order.orderStatus || "unknown").toLowerCase()}`}>{order.orderStatus || "—"}</span></td>
                        <td>
                          <span>{paymentMethodLabel(order.paymentMethod)}</span>
                          <small>{paymentStatusLabel(order.paymentStatus)}</small>
                        </td>
                        <td>
                          <span>{order.shippingMethod || "—"}</span>
                          <small>{order.phone || "—"}</small>
                        </td>
                        <td>
                          <span>{order.voucherCode || (order.voucherId ? `#${order.voucherId}` : "—")}</span>
                          <small>Giảm {money(order.discountAmount)}</small>
                        </td>
                        <td><strong className="customer-orders-total">{money(order.totalCost)}</strong></td>
                        <td>
                          <div className="customer-orders-actions">
                            <Link className="btn btn-outline-primary btn-sm" to={`/account/orders/${order.orderId}`}>Chi tiết</Link>
                            {order.orderStatus === "PENDING" && (
                              <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => cancelOrder(order.orderId)} disabled={cancelingId === order.orderId}>
                                {cancelingId === order.orderId ? "Đang hủy..." : "Hủy đơn"}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="8" className="customer-orders-empty">{error ? "Không thể hiển thị đơn hàng." : "Bạn chưa có đơn hàng nào."}</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            {!loading && !error && pageData && (
              <div className="customer-orders-footer">
                <span>Hiển thị {pageData.content.length} / {pageData.totalElements} đơn hàng</span>
                {totalPages > 1 && (
                  <nav className="customer-orders-pages" aria-label="Phân trang đơn hàng">
                    <button type="button" disabled={page === 0} onClick={() => setPage(page - 1)} aria-label="Trang trước">‹</button>
                    {visiblePages.map((number, index) => (
                      <span key={number} className="customer-orders-page-group">
                        {index > 0 && number - visiblePages[index - 1] > 1 && <span className="customer-orders-ellipsis">…</span>}
                        <button type="button" className={number === page ? "active" : ""} aria-current={number === page ? "page" : undefined} onClick={() => setPage(number)}>{number + 1}</button>
                      </span>
                    ))}
                    <button type="button" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)} aria-label="Trang sau">›</button>
                  </nav>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default OrderHistoryPage;
