import { useState } from "react";
import orderService from "../../services/orderService";
import { nextStatuses } from "./orderStatusTransitions";

const OrderStatusQuickSelect = ({ order, onUpdated }) => {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const options = nextStatuses[order.orderStatus] || [];

  const updateStatus = async (event) => {
    const nextStatus = event.target.value;
    if (nextStatus === order.orderStatus) return;
    if (nextStatus === "CANCELLED" && !window.confirm(`Cancel order #${order.orderId}?`)) {
      event.target.value = order.orderStatus;
      return;
    }

    setSaving(true);
    setError("");
    try {
      const updatedOrder = await orderService.updateOrderStatus(order.orderId, nextStatus);
      onUpdated(updatedOrder);
    } catch (requestError) {
      setError(requestError?.response?.data?.message || "Could not update order status.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-order-inline-status">
      <select
        className={`form-select form-select-sm admin-order-inline-status-select admin-order-inline-status-${order.orderStatus.toLowerCase()}`}
        aria-label={`Change status for order #${order.orderId}`}
        value={order.orderStatus}
        onChange={updateStatus}
        disabled={saving || options.length === 0}
      >
        <option value={order.orderStatus}>{order.orderStatus}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
      {saving && <small className="d-block mt-1" role="status">Saving...</small>}
      {error && <small className="d-block text-danger mt-1" role="alert">{error}</small>}
    </div>
  );
};

export default OrderStatusQuickSelect;
