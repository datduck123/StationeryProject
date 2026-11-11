import { useTranslation } from "react-i18next";
import { formatOrderMoney } from "../../utils/orderFormatters";
import "../../styles/order-price-breakdown.css";

const OrderPriceBreakdown = ({ order }) => {
  const { t, i18n } = useTranslation();
  const money = (amount) => amount == null ? "—" : formatOrderMoney(amount, i18n.language);
  const voucher = order.voucherCode || (order.voucherId ? `#${order.voucherId}` : null);

  return (
    <div className="order-price-breakdown">
      <div className="order-price-breakdown-row">
        <span>{t("orders.subtotal")}</span>
        <strong>{money(order.subtotal)}</strong>
      </div>
      <div className="order-price-breakdown-row">
        <span>{t("orders.shippingFee")}</span>
        <strong>{order.shippingFee != null && Number(order.shippingFee) === 0 ? t("cart.freeShipping") : money(order.shippingFee)}</strong>
      </div>
      {Number(order.discountAmount || 0) > 0 && (
        <div className="order-price-breakdown-row order-price-breakdown-discount">
          <span>{t("checkout.voucherDiscount")}{voucher ? ` (${voucher})` : ""}</span>
          <strong>−{money(order.discountAmount)}</strong>
        </div>
      )}
      <div className="order-price-breakdown-row order-price-breakdown-total">
        <span>{t("orders.total")}</span>
        <strong>{money(order.totalCost)}</strong>
      </div>
    </div>
  );
};

export default OrderPriceBreakdown;
