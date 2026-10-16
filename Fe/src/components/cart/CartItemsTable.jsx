import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCartContext } from "../../providers/CartContext";
import { getProductImage } from "../../services/productService";
import { formatOrderMoney } from "../../utils/orderFormatters";

export default function CartItemsTable() {
  const { t, i18n } = useTranslation();
  const { cartItems, pendingItemIds, updateCartItem, removeCartItem } = useCartContext();
  return <div className="commerce-table-wrap"><table className="commerce-table">
    <thead><tr><th>{t("cart.products")}</th><th>{t("cart.price")}</th><th>{t("cart.quantity")}</th><th>{t("cart.subtotal")}</th><th><span className="visually-hidden">{t("commerce.remove")}</span></th></tr></thead>
    <tbody>{cartItems.map((item) => {
      const busy = pendingItemIds.has(String(item.cartItemId));
      return <tr key={item.cartItemId}>
        <td><Link to={`/product/${item.productId}`} className="commerce-product"><img src={getProductImage({ ...item, name: item.productName })} alt="" /><span>{item.productName}</span></Link>{item.available === false && <span className="text-danger small">{t("commerce.unavailable")}</span>}</td>
        <td>{formatOrderMoney(item.unitPrice, i18n.language)}</td>
        <td><div className="commerce-quantity"><button type="button" aria-label={t("commerce.decrease")} disabled={busy || item.quantity <= 1} onClick={() => updateCartItem(item.cartItemId, item.quantity - 1)}>−</button><span aria-live="polite">{item.quantity}</span><button type="button" aria-label={t("commerce.increase")} disabled={busy || item.quantity >= item.stockQuantity} onClick={() => updateCartItem(item.cartItemId, item.quantity + 1)}>+</button></div></td>
        <td><strong>{formatOrderMoney(item.subtotal, i18n.language)}</strong></td>
        <td><button type="button" className="btn btn-sm btn-outline-danger" disabled={busy} onClick={() => removeCartItem(item.cartItemId)} aria-label={`${t("commerce.remove")} ${item.productName}`}>×</button></td>
      </tr>;
    })}</tbody>
  </table></div>;
}
