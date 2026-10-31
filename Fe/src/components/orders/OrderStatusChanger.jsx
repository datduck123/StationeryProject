import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useToast } from "../../providers/ToastContext";
import orderService from "../../services/orderService";
import { nextStatuses } from "./orderStatusTransitions";

const OrderStatusChanger = ({ order, onUpdated }) => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const options = nextStatuses[order.orderStatus] || [];
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setStatus("");
  }, [order.orderId, order.orderStatus]);

  const updateStatus = async () => {
    if (!status) return;
    if (status === "CANCELLED" && !window.confirm(t("adminOrders.statusEditor.confirmCancel", { id: order.orderId }))) return;
    setSaving(true);
    try {
      onUpdated(await orderService.updateOrderStatus(order.orderId, status));
    } catch (requestError) {
      showToast(requestError?.response?.data?.message || t("adminOrders.errors.updateStatus"), "error");
    } finally {
      setSaving(false);
    }
  };

  if (options.length === 0) return <p className="text-muted mb-0">{t("adminOrders.statusEditor.complete")}</p>;

  return (
    <div className="admin-order-status-changer">
      <label htmlFor="admin-order-next-status" className="fw-700 d-block mb-2">{t("adminOrders.statusEditor.change")}</label>
      <div className="d-flex flex-wrap gap-2">
        <select
          id="admin-order-next-status"
          className="form-select"
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          disabled={saving}
        >
          <option value="">{t("adminOrders.statusEditor.choose")}</option>
          {options.map((option) => <option key={option.value} value={option.value}>{t(`adminOrders.statusActions.${option.value}`)}</option>)}
        </select>
        <button type="button" className="btn btn-primary" disabled={!status || saving} onClick={updateStatus}>
          {saving ? t("adminOrders.statusEditor.saving") : t("adminOrders.statusEditor.update")}
        </button>
      </div>
    </div>
  );
};

export default OrderStatusChanger;
