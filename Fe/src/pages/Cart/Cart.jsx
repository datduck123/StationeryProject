import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import TitleBanner from "../../components/shared/TitleBanner";
import CartItemsTable from "../../components/cart/CartItemsTable";
import { useCartContext } from "../../providers/CartContext";
import { useAuth } from "../../providers/AuthContext";
import { formatOrderMoney } from "../../utils/orderFormatters";
import "../../styles/checkout.css";

export const Cart = () => {
  const { t, i18n } = useTranslation();
  const { user, openAuthModal } = useAuth();
  const { cartItems, cartSubtotal, cartLoading, cartError, refreshCart } = useCartContext();
  return <>
    <TitleBanner title={t("cart.title")} />
    <section className="py-40 commerce-page"><div className="container-2">
      {!user ? <div className="commerce-empty"><p>{t("commerce.signInCart")}</p><button type="button" className="btn btn-primary" onClick={() => openAuthModal("login")}>{t("commerce.signIn")}</button></div> : <>
        {cartError && <div className="alert alert-danger" role="alert">{cartError} <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => refreshCart().catch(() => {})}>{t("commerce.retry")}</button></div>}
        {cartLoading && <p role="status">{t("commerce.loadingCart")}</p>}
        {!cartLoading && cartItems.length === 0 ? <div className="commerce-empty"><h4>{t("commerce.emptyCart")}</h4><Link to="/shop" className="btn btn-primary mt-3">{t("orders.continueShopping")}</Link></div> : <div className="commerce-grid">
          <div><CartItemsTable /><Link to="/shop" className="btn btn-outline-secondary mt-3">{t("orders.continueShopping")}</Link></div>
          <aside className="commerce-panel commerce-summary"><h4>{t("cart.cartTotals")}</h4><div className="commerce-total-row"><span>{t("cart.subtotal")}</span><strong>{formatOrderMoney(cartSubtotal, i18n.language)}</strong></div><p className="commerce-muted">{t("commerce.shippingAtCheckout")}</p>{cartItems.length > 0 && <Link to="/checkout" className="btn btn-primary w-100">{t("cart.proceedToCheckout")}</Link>}</aside>
        </div>}
      </>}
    </div></section>
  </>;
};
export default Cart;
