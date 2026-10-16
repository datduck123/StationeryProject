import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCartContext } from "../../providers/CartContext";
import { getProductImage } from "../../services/productService";
import { formatOrderMoney } from "../../utils/orderFormatters";
import "../../styles/checkout.css";

export const SidebarCart = () => {
  const { isCartOpen, closeCart, cartItems, cartSubtotal, cartLoading, cartError, pendingItemIds, updateCartItem, removeCartItem } = useCartContext();
  const { t, i18n } = useTranslation();
  return <>
    <aside id="sidebar-cart" aria-label={t("cart.title")} aria-hidden={!isCartOpen} inert={!isCartOpen ? true : undefined} style={{ right: isCartOpen ? "0" : "-101%", transition: "right 0.3s ease-in-out" }}>
      <div className="title-cart-block mb-16 bg-lightest-gray"><h6>{t("modals.shoppingCart")} ({cartItems.length})</h6><button type="button" className="btn close-button" onClick={closeCart} aria-label={t("commerce.close")}>×</button></div>
      <ul className="product-list p-24">
        {cartLoading && <li role="status">{t("commerce.loadingCart")}</li>}
        {cartError && <li className="alert alert-danger" role="alert">{cartError}</li>}
        {!cartLoading && cartItems.length === 0 && <li className="commerce-muted">{t("commerce.emptyCart")}</li>}
        {cartItems.map((item) => {
          const busy = pendingItemIds.has(String(item.cartItemId));
          return <li key={item.cartItemId} className="product-item mb-24">
            <div className="d-flex align-items-center gap-12"><div className="item-image"><img src={getProductImage({ ...item, name: item.productName })} alt="" /></div><div className="prod-title"><Link to={`/product/${item.productId}`} className="h6 medium-black" onClick={closeCart}>{item.productName}</Link><p className="subtitle">{formatOrderMoney(item.unitPrice, i18n.language)}</p></div></div>
            <div className="text-end"><button type="button" className="btn btn-sm text-danger mb-2" disabled={busy} onClick={() => removeCartItem(item.cartItemId)} aria-label={`${t("commerce.remove")} ${item.productName}`}>×</button><div className="commerce-quantity"><button type="button" aria-label={t("commerce.decrease")} disabled={busy || item.quantity <= 1} onClick={() => updateCartItem(item.cartItemId, item.quantity - 1)}>−</button><span>{item.quantity}</span><button type="button" aria-label={t("commerce.increase")} disabled={busy || item.quantity >= item.stockQuantity} onClick={() => updateCartItem(item.cartItemId, item.quantity + 1)}>+</button></div></div>
          </li>;
        })}
      </ul>
      <div className="price-total p-24"><strong>{t("common.subtotal")}</strong><strong>{formatOrderMoney(cartSubtotal, i18n.language)}</strong></div>
      <div className="d-flex gap-3 p-24"><Link to="/cart" className="btn btn-outline-secondary flex-fill" onClick={closeCart}>{t("common.goToCart")}</Link>{cartItems.length > 0 && <Link to="/checkout" className="btn btn-primary flex-fill" onClick={closeCart}>{t("header.checkout")}</Link>}</div>
    </aside>
    <div id="sidebar-cart-curtain" className="close-popup" onClick={closeCart} style={{ display: isCartOpen ? "block" : "none", opacity: isCartOpen ? 1 : 0 }} />
  </>;
};
export default SidebarCart;
