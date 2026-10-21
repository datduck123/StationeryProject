import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import TitleBanner from "../../components/shared/TitleBanner";
import { useAuth } from "../../providers/AuthContext";
import { useCartContext } from "../../providers/CartContext";
import { useToast } from "../../providers/ToastContext";
import cartService from "../../services/cartService";
import orderService from "../../services/orderService";
import voucherService from "../../services/voucherService";
import { formatOrderMoney } from "../../utils/orderFormatters";
import "../../styles/checkout.css";

export const Checkout = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { refreshCart, clearCart } = useCartContext();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [phone, setPhone] = useState(user?.phone || "");
  const [shippingAddress, setShippingAddress] = useState(user?.address || user?.shippingAddress || "");
  const [shippingMethod, setShippingMethod] = useState("STANDARD");
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [voucherInput, setVoucherInput] = useState("");
  const [voucherCode, setVoucherCode] = useState("");
  const [vouchers, setVouchers] = useState([]);
  const [note, setNote] = useState("");
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [quoteVersion, setQuoteVersion] = useState(0);
  const money = (value) => formatOrderMoney(value, i18n.language);
  const errorMessage = (requestError) => requestError?.response?.data?.message || t("commerce.checkoutError");

  useEffect(() => {
    voucherService.getActiveVouchers().then(setVouchers).catch(() => setVouchers([]));
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    cartService.getCart({ shippingMethod, voucherCode: voucherCode || undefined })
      .then((data) => { if (active) setQuote(data); })
      .catch((requestError) => { if (active) { setQuote(null); setError(errorMessage(requestError)); } })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [shippingMethod, voucherCode, quoteVersion, t]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting || loading || !quote?.items?.length || quote.items.some((item) => item.available === false)) return;
    setSubmitting(true);
    setError("");
    try {
      const response = await orderService.createOrder({ shippingAddress: shippingAddress.trim(), phone: phone.trim(), shippingMethod, paymentMethod, voucherCode: voucherCode || null, note: note.trim() || null });
      const order = response?.data ?? response;
      if (!order?.orderId) throw new Error(t("commerce.checkoutError"));
      await clearCart({ server: false });
      showToast(t("commerce.orderCreated"), "success");
      navigate(`/order-success?orderId=${encodeURIComponent(order.orderId)}`, { replace: true, state: { orderId: order.orderId, order } });
    } catch (requestError) {
      const message = requestError?.response?.data?.message || requestError.message || t("commerce.checkoutError");
      setError(message);
      showToast(message, "error");
      refreshCart({ silent: true }).catch(() => {});
      setQuoteVersion((version) => version + 1);
    } finally { setSubmitting(false); }
  };

  const items = quote?.items || [];
  return <>
    <TitleBanner title={t("checkout.title")} />
    <section className="py-40 commerce-page"><div className="container-2">
      <Link to="/cart" className="d-inline-block mb-4">← {t("common.goToCart")}</Link>
      {error && <div className="alert alert-danger" role="alert">{error}<button type="button" className="btn btn-sm btn-outline-danger ms-3" onClick={() => setQuoteVersion((version) => version + 1)}>{t("commerce.retry")}</button></div>}
      {loading && <p role="status">{t("commerce.loadingCart")}</p>}
      {!loading && quote && items.length === 0 ? <div className="commerce-empty"><h4>{t("commerce.emptyCart")}</h4><Link to="/shop" className="btn btn-primary mt-3">{t("orders.continueShopping")}</Link></div> : <form onSubmit={handleSubmit} className="commerce-grid">
        <div className="commerce-panel">
          <h4 className="mb-4">{t("checkout.billingDetails")}</h4>
          <div className="commerce-field"><label htmlFor="checkout-recipient">{t("commerce.recipient")}</label><input id="checkout-recipient" className="form-control" value={user?.fullName || user?.name || user?.email || ""} disabled /></div>
          <div className="commerce-field"><label htmlFor="checkout-phone">{t("commerce.phone")}</label><input id="checkout-phone" className="form-control" type="tel" autoComplete="tel" required minLength={8} maxLength={20} pattern="[+0-9 \-]{8,20}" value={phone} onChange={(event) => setPhone(event.target.value)} /></div>
          <div className="commerce-field"><label htmlFor="checkout-address">{t("commerce.address")}</label><textarea id="checkout-address" className="form-control" autoComplete="street-address" required minLength={5} maxLength={255} rows={3} value={shippingAddress} onChange={(event) => setShippingAddress(event.target.value)} /></div>
          <fieldset className="commerce-field"><legend>{t("commerce.shipping")}</legend>
            {["STANDARD", "EXPRESS"].map((method) => <label key={method} className="commerce-choice"><input type="radio" name="shipping" value={method} checked={shippingMethod === method} disabled={submitting} onChange={() => setShippingMethod(method)} /><span>{t(`orders.shippingMethods.${method}`)}</span></label>)}
          </fieldset>
          <fieldset className="commerce-field"><legend>{t("commerce.payment")}</legend>
            {["COD", "ONLINE"].map((method) => <label key={method} className="commerce-choice"><input type="radio" name="payment" value={method} checked={paymentMethod === method} disabled={submitting || method === "ONLINE"} onChange={() => setPaymentMethod(method)} /><span>{t(`orders.paymentMethods.${method}`)}</span></label>)}
            <p className="commerce-muted">{t("commerce.onlineUnavailable")}</p>
          </fieldset>
          <div className="commerce-field"><label htmlFor="checkout-note">{t("commerce.note")}</label><textarea id="checkout-note" className="form-control" rows={3} maxLength={500} value={note} onChange={(event) => setNote(event.target.value)} /></div>
        </div>
        <aside className="commerce-panel commerce-summary">
          <h4 className="mb-3">{t("commerce.yourOrder")}</h4>
          {items.map((item) => <div className="commerce-order-item" key={item.cartItemId}><div><strong>{item.productName}</strong><p>{item.quantity} × {money(item.unitPrice)}</p></div><strong>{money(item.subtotal)}</strong></div>)}
          <label htmlFor="checkout-voucher" className="fw-bold mb-2">{t("cart.couponCode")}</label>
          <div className="d-flex gap-2 mb-2"><input id="checkout-voucher" className="form-control" list="checkout-vouchers" maxLength={50} value={voucherInput} disabled={submitting} onChange={(event) => setVoucherInput(event.target.value.toUpperCase())} /><button type="button" className="btn btn-outline-primary" disabled={submitting || loading} onClick={() => { const code = voucherInput.trim().toUpperCase(); if (code === voucherCode) setQuoteVersion((version) => version + 1); else setVoucherCode(code); }}>{t("cart.applyCoupon")}</button></div>
          <datalist id="checkout-vouchers">{vouchers.map((voucher) => <option key={voucher.voucherId ?? voucher.code} value={voucher.code}>{money(voucher.discountAmount)}</option>)}</datalist>
          {voucherCode && <button type="button" className="btn btn-link btn-sm p-0 mb-3" onClick={() => { setVoucherCode(""); setVoucherInput(""); }}>{t("commerce.removeVoucher", { code: voucherCode })}</button>}
          <div className="commerce-total-row"><span>{t("cart.subtotal")}</span><span>{money(quote?.subtotal)}</span></div>
          <div className="commerce-total-row"><span>{t("orders.shippingFee")}</span><span>{money(quote?.shippingFee)}</span></div>
          <div className="commerce-total-row"><span>{t("orders.discount")}</span><span>−{money(quote?.discountAmount)}</span></div>
          <div className="commerce-total-row commerce-grand-total"><strong>{t("orders.total")}</strong><strong>{money(quote?.totalCost)}</strong></div>
          {(quote?.notifications || []).map((message, index) => <p key={index} className="text-warning small">{message}</p>)}
          <button type="submit" className="btn btn-primary w-100" disabled={submitting || loading || !items.length || Boolean(error) || items.some((item) => item.available === false)}>{submitting ? t("commerce.placingOrder") : t("commerce.placeOrder")}</button>
        </aside>
      </form>}
    </div></section>
  </>;
};
export default Checkout;
