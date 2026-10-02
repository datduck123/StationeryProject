export const nextStatuses = {
  PENDING: [
    { value: "CONFIRMED", label: "Confirm order" },
    { value: "CANCELLED", label: "Cancel order" },
  ],
  CONFIRMED: [
    { value: "SHIPPING", label: "Mark as shipping" },
    { value: "CANCELLED", label: "Cancel order" },
  ],
  SHIPPING: [{ value: "DELIVERED", label: "Mark as delivered" }],
};
