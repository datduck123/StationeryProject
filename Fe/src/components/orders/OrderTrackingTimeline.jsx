import { useTranslation } from "react-i18next";
import { orderStatusLabel } from "../../utils/orderFormatters";

const STEPS = ["PENDING", "CONFIRMED", "SHIPPING", "DELIVERED"];

const OrderTrackingTimeline = ({ status }) => {
  const { t } = useTranslation();
  const normalizedStatus = String(status || "").toUpperCase();
  const activeIndex = STEPS.indexOf(normalizedStatus);
  const isCancelled = ["CANCELLED", "CANCELED"].includes(normalizedStatus);

  return (
    <ol className="list-unstyled d-flex flex-wrap gap-3 mb-0" aria-label={t("orders.status")}>
      {STEPS.map((step, index) => {
        const complete = activeIndex >= 0 && index <= activeIndex;
        return (
          <li className="d-flex align-items-center gap-2" key={step}>
            <span
              className={`badge rounded-circle border ${
                complete ? "bg-success text-white border-success" : "bg-white text-muted"
              }`}
              aria-hidden="true"
            >
              {complete ? "✓" : index + 1}
            </span>
            <span className={complete ? "fw-600 medium-black" : "light-gray"}>
              {orderStatusLabel(step, t)}
            </span>
          </li>
        );
      })}
      {isCancelled && (
        <li className="d-flex align-items-center gap-2 text-danger fw-600">
          <span className="badge rounded-circle border border-danger text-danger">
            ×
          </span>
          {orderStatusLabel("CANCELLED", t)}
        </li>
      )}
    </ol>
  );
};

export default OrderTrackingTimeline;
