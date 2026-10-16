export const languageCode = (language = "vi") =>
  String(language).toLowerCase().startsWith("en") ? "en" : "vi";

export const localeFor = (language) =>
  languageCode(language) === "en" ? "en-US" : "vi-VN";

export const formatOrderMoney = (amount, language) =>
  new Intl.NumberFormat(localeFor(language), {
    style: "currency",
    currency: "VND",
    currencyDisplay: "symbol",
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));

export const formatOrderDateTime = (value, language) => {
  if (!value) return "—";
  return new Intl.DateTimeFormat(localeFor(language), {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(value));
};

export const orderStatusLabel = (status, t) =>
  status ? t(`orders.statuses.${String(status).toUpperCase()}`, { defaultValue: status }) : "—";

export const paymentMethodLabel = (method, t) =>
  method ? t(`orders.paymentMethods.${String(method).toUpperCase()}`, { defaultValue: method }) : "—";

export const paymentStatusLabel = (status, t) =>
  status
    ? t(`orders.paymentStatuses.${String(status).toUpperCase()}`, { defaultValue: status })
    : t("orders.noInformation");

export const shippingMethodLabel = (method, t) =>
  method ? t(`orders.shippingMethods.${String(method).toUpperCase()}`, { defaultValue: method }) : "—";
