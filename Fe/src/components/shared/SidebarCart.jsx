import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCartContext } from "../../providers/CartContext";

export const SidebarCart = () => {
  const {
    isCartOpen,
    closeCart,
    items,
    cartSubtotal,
    cartCount,
    updateQuantity,
    removeItem,
    isLoading,
  } = useCartContext();
  const { t } = useTranslation();

  return (
    <>
      <aside
        id="sidebar-cart"
        style={{
          right: isCartOpen ? "0" : "-101%",
          transition: "right 0.3s ease-in-out",
          zIndex: 99999,
          display: "flex",
          flexDirection: "column",
          maxHeight: "100vh",
        }}
      >
        {/* Header */}
        <div className="title-cart-block mb-16 bg-lightest-gray p-20 d-flex justify-content-between align-items-center">
          <h6 className="fw-600 black m-0">
            {t("modals.shoppingCart")}{" "}
            <span className="color-primary">({cartCount})</span>
          </h6>
          <button
            type="button"
            className="btn btn-link text-dark p-0 border-0 fs-5"
            onClick={() => closeCart()}
            aria-label="Close"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Product List */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {items.length === 0 ? (
            <div className="text-center py-48 px-24">
              <i className="fa-solid fa-bag-shopping text-muted mb-16" style={{ fontSize: "48px" }}></i>
              <h6 className="fw-600 text-muted mb-8">Giỏ hàng của bạn đang trống</h6>
              <p className="text-muted small mb-24">Hãy khám phá thêm các sản phẩm tuyệt vời của cửa hàng!</p>
              <Link
                to="/shop"
                className="cus-btn btn-sm d-inline-block"
                onClick={() => closeCart()}
              >
                <span>Mua sắm ngay</span>
              </Link>
            </div>
          ) : (
            <ul className="product-list p-24 list-unstyled m-0">
              {items.map((item) => {
                const quantity = item.finalQuantity || item.requestedQuantity || 1;
                const unitPrice = Number(item.unitPrice || 0);
                const maxStock = item.currentStock ?? 999;

                return (
                  <li
                    key={item.cartItemId || item.productId}
                    className="product-item mb-20 pb-20 border-bottom d-flex align-items-center justify-content-between gap-12"
                  >
                    <div className="d-flex align-items-center gap-12" style={{ flex: 1, minWidth: 0 }}>
                      <div
                        className="item-image br-8 overflow-hidden bg-semi-white"
                        style={{ width: "60px", height: "60px", flexShrink: 0 }}
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
                      <div className="prod-title text-truncate">
                        <Link
                          to={`/product-detail?id=${item.productId}`}
                          className="h6 medium-black font-sec fw-600 mb-4 d-block text-truncate text-decoration-none"
                          onClick={() => closeCart()}
                          title={item.productName}
                        >
                          {item.productName}
                        </Link>
                        <p className="subtitle mb-0 small text-muted">
                          {unitPrice.toLocaleString("vi-VN")} đ
                        </p>
                        {item.message && (
                          <small className="text-warning d-block" style={{ fontSize: "11px" }}>
                            {item.message}
                          </small>
                        )}
                      </div>
                    </div>

                    <div className="text-end" style={{ flexShrink: 0 }}>
                      <button
                        type="button"
                        className="btn btn-link text-danger p-0 border-0 mb-8 d-inline-block"
                        onClick={() => removeItem(item.cartItemId)}
                        title="Xóa"
                      >
                        <i className="fa-solid fa-trash-can" style={{ fontSize: "14px" }}></i>
                      </button>
                      <div className="quantity quantity-wrap">
                        <div className="input-area quantity-wrap d-flex align-items-center">
                          <button
                            className="decrement"
                            type="button"
                            disabled={quantity <= 1 || isLoading}
                            onClick={() => updateQuantity(item.cartItemId, quantity - 1)}
                          >
                            -
                          </button>
                          <input
                            type="text"
                            name="quantity"
                            value={quantity}
                            readOnly
                            className="number text-center"
                            style={{ width: "32px", height: "28px", fontSize: "13px" }}
                          />
                          <button
                            className="increment"
                            type="button"
                            disabled={quantity >= maxStock || isLoading}
                            onClick={() => updateQuantity(item.cartItemId, quantity + 1)}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-top bg-white p-20" style={{ flexShrink: 0 }}>
            <div className="d-flex justify-content-between align-items-center mb-16">
              <span className="h6 fw-600 medium-black m-0">{t("common.subtotal")}:</span>
              <span className="h6 fw-700 color-primary m-0">
                {cartSubtotal.toLocaleString("vi-VN")} đ
              </span>
            </div>
            <div className="row g-2">
              <div className="col-6">
                <Link
                  to="/cart"
                  className="cus-btn w-100 text-center py-2"
                  onClick={() => closeCart()}
                >
                  <span className="btn-text">Xem giỏ hàng</span>
                  <span>Xem giỏ hàng</span>
                </Link>
              </div>
              <div className="col-6">
                <Link
                  to="/checkout"
                  className="cus-btn-2 btn-sec w-100 text-center py-2"
                  onClick={() => closeCart()}
                >
                  <span className="btn-text">Thanh toán</span>
                  <span>Thanh toán</span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Backdrop Curtain */}
      <div
        id="sidebar-cart-curtain"
        className="close-popup"
        onClick={() => closeCart()}
        style={{
          display: isCartOpen ? "block" : "none",
          opacity: isCartOpen ? 1 : 0,
          transition: "opacity 0.2s ease-in-out",
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0,0,0,0.5)",
          zIndex: 99998,
        }}
      ></div>
    </>
  );
};

export default SidebarCart;
