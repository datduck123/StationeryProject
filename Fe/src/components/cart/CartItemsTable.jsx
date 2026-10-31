import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCartContext } from "../../providers/CartContext";
import { getProductImage } from "../../services/productService";
import { formatOrderMoney } from "../../utils/orderFormatters";
import useQuantityInput from "../../hooks/useQuantityInput";

const CartItemTableRow = ({ item, busy, updateCartItem, removeCartItem, t, i18n }) => {
  const {
    inputProps,
    handleIncrement,
    handleDecrement,
    isAtMin,
    isAtMax,
  } = useQuantityInput({
    value: item.quantity,
    maxStock: item.stockQuantity ?? 999,
    min: 1,
    onChange: (nextQty) => updateCartItem(item.cartItemId, nextQty),
    commitOnBlurOnly: true,
  });

  return (
    <tr>
      <td>
        <Link to={`/product/${item.productId}`} className="commerce-product">
          <img src={getProductImage({ ...item, name: item.productName })} alt="" />
          <span>{item.productName}</span>
        </Link>
        {item.available === false && (
          <span className="text-danger small">{t("commerce.unavailable")}</span>
        )}
      </td>
      <td>{formatOrderMoney(item.unitPrice, i18n.language)}</td>
      <td>
        <div className="commerce-quantity">
          <button
            type="button"
            aria-label={t("commerce.decrease")}
            disabled={busy || isAtMin}
            onClick={handleDecrement}
          >
            −
          </button>
          <input
            className="commerce-quantity-input"
            disabled={busy}
            style={{ width: "45px", textAlign: "center", border: "none", background: "transparent" }}
            {...inputProps}
          />
          <button
            type="button"
            aria-label={t("commerce.increase")}
            disabled={busy || isAtMax}
            onClick={handleIncrement}
          >
            +
          </button>
        </div>
      </td>
      <td>
        <strong>{formatOrderMoney(item.subtotal, i18n.language)}</strong>
      </td>
      <td>
        <button
          type="button"
          className="btn btn-sm btn-outline-danger"
          disabled={busy}
          onClick={() => removeCartItem(item.cartItemId)}
          aria-label={`${t("commerce.remove")} ${item.productName}`}
        >
          ×
        </button>
      </td>
    </tr>
  );
};

export default function CartItemsTable() {
  const { t, i18n } = useTranslation();
  const { cartItems, pendingItemIds, updateCartItem, removeCartItem } = useCartContext();

  return (
    <div className="commerce-table-wrap">
      <table className="commerce-table">
        <thead>
          <tr>
            <th>{t("cart.products")}</th>
            <th>{t("cart.price")}</th>
            <th>{t("cart.quantity")}</th>
            <th>{t("cart.subtotal")}</th>
            <th>
              <span className="visually-hidden">{t("commerce.remove")}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {cartItems.map((item) => {
            const busy = pendingItemIds.has(String(item.cartItemId));
            return (
              <CartItemTableRow
                key={item.cartItemId}
                item={item}
                busy={busy}
                updateCartItem={updateCartItem}
                removeCartItem={removeCartItem}
                t={t}
                i18n={i18n}
              />
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
