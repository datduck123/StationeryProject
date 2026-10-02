import { useEffect, useState } from "react";
import orderService from "../../services/orderService";
import { nextStatuses } from "./orderStatusTransitions";

const OrderStatusChanger = ({ order, onUpdated }) => {
  const options = nextStatuses[order.orderStatus] || [];
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setStatus("");
    setError("");
  }, [order.orderId, order.orderStatus]);

  const updateStatus = async () => {
    if (!status) return;
    if (status === "CANCELLED" && !window.confirm(`Cancel order #${order.orderId}?`)) return;
    setSaving(true);
    setError("");
    try {
      onUpdated(await orderService.updateOrderStatus(order.orderId, status));
    } catch (requestError) {
      setError(requestError?.response?.data?.message || "Could not update order status.");
    } finally {
      setSaving(false);
    }
  };

  if (options.length === 0) return <p className="text-muted mb-0">This order is complete. Its status cannot be changed.</p>;

  return (
    <div className="admin-order-status-changer">
      <label htmlFor="admin-order-next-status" className="fw-700 d-block mb-2">Change order status</label>
      <div className="d-flex flex-wrap gap-2">
        <select
          id="admin-order-next-status"
          className="form-select"
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          disabled={saving}
        >
          <option value="">Choose next status</option>
          {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
        <button type="button" className="btn btn-primary" disabled={!status || saving} onClick={updateStatus}>
          {saving ? "Saving..." : "Update status"}
        </button>
      </div>
      {error && <div className="alert alert-danger mt-2 mb-0" role="alert">{error}</div>}
    </div>
  );
};

export default OrderStatusChanger;
