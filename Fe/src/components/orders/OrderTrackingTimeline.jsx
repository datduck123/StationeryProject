const STEPS = ["PENDING", "CONFIRMED", "SHIPPING", "DELIVERED"];

const OrderTrackingTimeline = ({ status }) => {
  const normalizedStatus = String(status || "").toUpperCase();
  const activeIndex = STEPS.indexOf(normalizedStatus);
  const isCancelled = ["CANCELLED", "CANCELED"].includes(normalizedStatus);

  return (
    <ol className="list-unstyled d-flex flex-wrap gap-3 mb-0" aria-label="Order status">
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
              {step}
            </span>
          </li>
        );
      })}
      {isCancelled && (
        <li className="d-flex align-items-center gap-2 text-danger fw-600">
          <span className="badge rounded-circle border border-danger text-danger">
            ×
          </span>
          CANCELLED
        </li>
      )}
    </ol>
  );
};

export default OrderTrackingTimeline;
