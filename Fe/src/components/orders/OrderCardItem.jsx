import { Link } from "react-router-dom";

const formatCurrency = (amount) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(Number(amount || 0));

const formatDate = (value) =>
  value ? new Date(value).toLocaleString() : "—";

const statusClass = (status) => {
  switch (String(status || "").toUpperCase()) {
    case "DELIVERED":
      return "text-bg-success";
    case "CANCELLED":
    case "CANCELED":
      return "text-bg-danger";
    case "PENDING":
      return "text-bg-warning";
    default:
      return "text-bg-info";
  }
};

const OrderCardItem = ({ order }) => (
  <article className="checkout-box bg-semi-white p-24 mb-16">
    <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-16">
      <div>
        <h6 className="fw-600 medium-black mb-1">Order #{order.orderId}</h6>
        <span className="light-gray fs-14">{formatDate(order.createdAt)}</span>
      </div>
      <span className={`badge ${statusClass(order.orderStatus)}`}>
        {order.orderStatus || "UNKNOWN"}
      </span>
    </div>
    <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
      <span className="light-gray">
        {order.itemCount ?? 0} item{order.itemCount === 1 ? "" : "s"}
      </span>
      <strong className="color-primary">{formatCurrency(order.totalCost)}</strong>
      <Link className="cus-btn" to={`/account/orders/${order.orderId}`}>
        <span className="text-btn">View details</span>
        <span>View details</span>
      </Link>
    </div>
  </article>
);

export default OrderCardItem;
