import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import useQuantityInput from "../../hooks/useQuantityInput";

export const CartItemRow = ({ item, onUpdateQuantity, onRemove }) => {
  const { t } = useTranslation();
  const [isRemoving, setIsRemoving] = useState(false);
  const quantity = item.finalQuantity || item.requestedQuantity || 1;
  const maxStock = item.currentStock ?? 999;
  const unitPrice = Number(item.unitPrice || 0);
  const subtotal = Number(item.subtotal || unitPrice * quantity);

  const {
    inputProps,
    handleIncrement,
    handleDecrement,
    isAtMin,
    isAtMax,
  } = useQuantityInput({
    value: quantity,
    maxStock,
    min: 1,
    onChange: (nextQty) => onUpdateQuantity(item.cartItemId, nextQty),
    commitOnBlurOnly: true,
  });

  const handleRemove = (e) => {
    if (e?.stopPropagation) e.stopPropagation();
    if (isRemoving) return;
    setIsRemoving(true);
    // Chờ 500ms cho hiệu ứng bounceOutLeft
    setTimeout(() => {
      onRemove(item.cartItemId);
    }, 500);
  };

  return (
    <div
      className={`cart-item-row-wrapper ${isRemoving ? "cart-item-removing" : ""
        }`}
    >
      <table className="cart-table mb-16">
        <tbody>
          <tr className="table-row">
            <td className="pd" style={{ width: "45%" }}>
              <div className="product-detail-box d-flex align-items-center gap-16">
                <button
                  type="button"
                  className="btn btn-link text-danger p-0 border-0 me-2"
                  title={t("cart.removeProduct", "Remove product")}
                  onClick={handleRemove}
                  disabled={isRemoving}
                >
                  <i className="fa-solid fa-xmark fs-5"></i>
                </button>
                <div
                  className="img-block br-8 overflow-hidden bg-semi-white"
                  style={{ width: "70px", height: "70px", flexShrink: 0 }}
                >
                  <img
                    src={item.imageUrl || "/assets/media/products/product-1.png"}
                    alt={item.productName}
                    className="w-100 h-100 object-fit-contain"
                    onError={(e) => {
                      e.target.src = "/assets/media/products/product-1.png";
                    }}
                  />
                </div>
                <div className="d-block text-start">
                  <h6 className="mb-4p">
                    <Link
                      to={`/product-detail?id=${item.productId}`}
                      className="fw-600 medium-black text-decoration-none"
                    >
                      {item.productName}
                    </Link>
                  </h6>
                  {item.sku && (
                    <small className="text-muted d-block">SKU: {item.sku}</small>
                  )}
                  {item.message && (
                    <small className="text-warning d-block">
                      <i className="fa-solid fa-triangle-exclamation me-1"></i>
                      {item.message}
                    </small>
                  )}
                </div>
              </div>
            </td>
            <td style={{ width: "15%" }}>
              <p className="fw-500 mb-0">{unitPrice.toLocaleString("vi-VN")} đ</p>
            </td>
            <td style={{ width: "20%" }}>
              <div className="quantity quantity-wrap d-inline-flex align-items-center">
                <div className="input-area quantity-wrap d-flex align-items-center">
                  <button
                    className="decrement"
                    type="button"
                    disabled={isAtMin}
                    onClick={handleDecrement}
                  >
                    -
                  </button>
                  <input
                    name="quantity"
                    className="number text-center"
                    style={{ width: "45px" }}
                    {...inputProps}
                  />
                  <button
                    className="increment"
                    type="button"
                    disabled={isAtMax}
                    onClick={handleIncrement}
                  >
                    +
                  </button>
                </div>
              </div>
              {maxStock <= 5 && maxStock > 0 && (
                <small className="text-danger d-block mt-1">
                  {t("cart.onlyLeft", { count: maxStock, defaultValue: `Only ${maxStock} left` })}
                </small>
              )}
            </td>
            <td style={{ width: "20%" }}>
              <h6 className="color-primary fw-600 mb-0">
                {subtotal.toLocaleString("vi-VN")} đ
              </h6>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default CartItemRow;
