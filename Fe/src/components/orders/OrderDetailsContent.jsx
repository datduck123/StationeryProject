import { useTranslation } from "react-i18next";
import OrderTrackingTimeline from "./OrderTrackingTimeline";
import {
  formatOrderDateTime,
  formatOrderMoney,
  orderStatusLabel,
  paymentMethodLabel,
  paymentStatusLabel,
  shippingMethodLabel,
} from "../../utils/orderFormatters";
import "../../styles/order-details.css";

const statusColors = {
  PENDING: "warning",
  CONFIRMED: "primary",
  SHIPPING: "info",
  DELIVERED: "success",
  CANCELLED: "secondary",
};

const OrderDetailsContent = ({ order, renderItemAction }) => {
  const { t, i18n } = useTranslation();
  const information = (value) => value || t("orders.noInformation");
  const money = (value) => value == null ? "—" : formatOrderMoney(value, i18n.language);

  return (
    <div className="admin-order-details">
      <dl className="admin-order-overview">
        <div>
          <dt>{t("adminOrders.detail.status")}</dt>
          <dd><span className={`badge text-bg-${statusColors[order.orderStatus] || "secondary"}`}>{orderStatusLabel(order.orderStatus, t)}</span></dd>
        </div>
        <div>
          <dt>{t("orders.placedAt")}</dt>
          <dd>{formatOrderDateTime(order.createdAt, i18n.language)}</dd>
        </div>
        <div>
          <dt>{t("commerce.trackingCode")}</dt>
          <dd>{order.trackingCode || t("commerce.trackingPending")}</dd>
        </div>
      </dl>

      <div className="admin-order-timeline">
        <OrderTrackingTimeline status={order.orderStatus} />
      </div>

      <div className="admin-order-contact-grid">
        <section className="admin-order-info-card" aria-labelledby="order-details-customer-heading">
          <h6 id="order-details-customer-heading">{t("adminOrders.detail.customerSection")}</h6>
          <dl className="admin-order-fields">
            <div><dt>{t("adminOrders.detail.customerName")}</dt><dd>{information(order.customerName)}</dd></div>
            <div><dt>{t("adminOrders.detail.email")}</dt><dd>{information(order.customerEmail)}</dd></div>
          </dl>
        </section>
        <section className="admin-order-info-card" aria-labelledby="order-details-shipping-heading">
          <h6 id="order-details-shipping-heading">{t("orders.delivery")}</h6>
          <dl className="admin-order-fields">
            <div><dt>{t("adminOrders.detail.deliveryPhone")}</dt><dd>{information(order.phone)}</dd></div>
            <div><dt>{t("commerce.address")}</dt><dd>{information(order.shippingAddress)}</dd></div>
            <div><dt>{t("commerce.shipping")}</dt><dd>{shippingMethodLabel(order.shippingMethod, t)}</dd></div>
          </dl>
        </section>
      </div>

      <section className="admin-order-products" aria-labelledby="order-details-products-heading">
        <h6 id="order-details-products-heading">{t("adminOrders.detail.items")}</h6>
        <div className="admin-order-products-scroll">
          <table className={`admin-order-products-table${renderItemAction ? " has-actions" : ""}`}>
            <thead>
              <tr>
                <th scope="col">{t("adminOrders.detail.productName")}</th>
                <th scope="col">{t("adminOrders.detail.unitPrice")}</th>
                <th scope="col">{t("adminOrders.detail.quantity")}</th>
                <th scope="col">{t("adminOrders.detail.lineTotal")}</th>
                {renderItemAction && <th scope="col">{t("orders.columns.actions")}</th>}
              </tr>
            </thead>
            <tbody>
              {order.orderItems?.length ? order.orderItems.map((item) => (
                <tr key={item.orderItemId}>
                  <td>{information(item.productName)}</td>
                  <td>{money(item.unitPrice)}</td>
                  <td>{item.quantity ?? "—"}</td>
                  <td>{money(item.subtotal)}</td>
                  {renderItemAction && <td className="admin-order-product-action">{renderItemAction(item)}</td>}
                </tr>
              )) : <tr><td colSpan={renderItemAction ? 5 : 4}>{t("orders.noProducts")}</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      <div className="admin-order-payment-grid">
        <section className="admin-order-payment-info" aria-labelledby="order-details-payment-heading">
          <h6 id="order-details-payment-heading">{t("orders.payment")}</h6>
          <dl className="admin-order-fields">
            <div><dt>{t("commerce.payment")}</dt><dd>{paymentMethodLabel(order.paymentMethod, t)}</dd></div>
            <div><dt>{t("adminOrders.detail.paymentStatus")}</dt><dd>{paymentStatusLabel(order.paymentStatus, t)}</dd></div>
            {order.voucherCode && <div><dt>{t("adminOrders.detail.voucherCode")}</dt><dd>{order.voucherCode}</dd></div>}
          </dl>
        </section>
        <dl className="admin-order-amounts">
          <div><dt>{t("adminOrders.detail.subtotal")}</dt><dd>{money(order.subtotal)}</dd></div>
          <div><dt>{t("orders.shippingFee")}</dt><dd>{money(order.shippingFee)}</dd></div>
          <div><dt>{t("orders.discount")}</dt><dd>{Number(order.discountAmount) > 0 ? "−" : ""}{money(order.discountAmount)}</dd></div>
          <div className="admin-order-amount-total"><dt>{t("adminOrders.detail.total")}</dt><dd>{money(order.totalCost)}</dd></div>
        </dl>
      </div>

      {order.note && <section className="admin-order-note" aria-labelledby="order-details-note-heading">
        <h6 id="order-details-note-heading">{t("adminOrders.detail.note")}</h6>
        <p>{order.note}</p>
      </section>}
    </div>
  );
};

export default OrderDetailsContent;
