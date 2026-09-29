import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import TitleBanner from "../../components/shared/TitleBanner";
import CartItemRow from "./CartItemRow";
import { useCartContext } from "../../providers/CartContext";

export const Cart = () => {
  const { t } = useTranslation();
  const {
    items,
    cartSubtotal,
    cartShippingFee,
    cartDiscount,
    cartTotal,
    updateQuantity,
    removeItem,
    clearCart,
    isLoading,
    cart,
  } = useCartContext();

  return (
    <>
      <TitleBanner title={t("cart.title") || "Shopping Cart"} />
      <section className="cart py-40">
        <div className="container-2">
          {/* Notifications / Stock Alert Banner */}
          {cart?.notifications && cart.notifications.length > 0 && (
            <div className="alert alert-warning mb-24 d-flex flex-column gap-2" role="alert">
              <div className="d-flex align-items-center gap-2 fw-600">
                <i className="fa-solid fa-triangle-exclamation text-warning fs-5"></i>
                <span>Cập nhật tồn kho sản phẩm:</span>
              </div>
              <ul className="mb-0 ps-4">
                {cart.notifications.map((msg, idx) => (
                  <li key={idx}>{msg}</li>
                ))}
              </ul>
            </div>
          )}

          {items.length === 0 ? (
            <div className="text-center py-60 bg-white br-20 border shadow-sm">
              <div className="mb-24">
                <i className="fa-solid fa-cart-shopping text-muted" style={{ fontSize: "64px" }}></i>
              </div>
              <h4 className="fw-700 medium-black mb-12">Giỏ hàng của bạn đang trống</h4>
              <p className="text-muted mb-0">
                Bạn chưa có sản phẩm nào trong giỏ hàng. Hãy khám phá và thêm các món đồ văn phòng phẩm ưng ý nhé!
              </p>
            </div>
          ) : (
            <div className="row row-gap-4">
              {/* Left Column: Cart Items */}
              <div className="col-xl-8">
                {/* Desktop View Table */}
                <div className="d-lg-block d-none">
                  <table className="cart-table mb-16">
                    <thead>
                      <tr>
                        <th style={{ width: "45%" }}>{t("cart.products")}</th>
                        <th style={{ width: "15%" }}>{t("cart.price")}</th>
                        <th style={{ width: "20%" }}>{t("cart.quantity")}</th>
                        <th style={{ width: "20%" }}>{t("cart.subtotal")}</th>
                      </tr>
                    </thead>
                  </table>

                  {items.map((item) => (
                    <CartItemRow
                      key={item.cartItemId || item.productId}
                      item={item}
                      onUpdateQuantity={updateQuantity}
                      onRemove={removeItem}
                    />
                  ))}
                </div>

                {/* Mobile View Cards */}
                <div className="d-lg-none d-block">
                  <div className="row row-gap-3">
                    {items.map((item) => {
                      const qty = item.finalQuantity || item.requestedQuantity || 1;
                      const maxStock = item.currentStock ?? 999;
                      const price = Number(item.unitPrice || 0);

                      return (
                        <div key={item.cartItemId || item.productId} className="col-md-6">
                          <div className="card-item bg-semi-white br-20 p-24">
                            <div className="d-flex align-items-center justify-content-between mb-16">
                              <h6 className="m-0 text-truncate" style={{ maxWidth: "80%" }}>
                                {item.productName}
                              </h6>
                              <button
                                type="button"
                                className="btn btn-link text-danger p-0 border-0"
                                onClick={() => removeItem(item.cartItemId)}
                              >
                                <i className="fa-solid fa-xmark fs-5"></i>
                              </button>
                            </div>
                            <div className="img-block mb-16 text-center bg-white p-2 br-12" style={{ height: "140px" }}>
                              <img
                                src={item.imageUrl || "/assets/media/products/product-1.png"}
                                alt={item.productName}
                                className="h-100 object-fit-contain"
                                onError={(e) => {
                                  e.target.src = "/assets/media/products/product-1.png";
                                }}
                              />
                            </div>
                            <ul className="list-unstyled p-0 m-0 d-flex flex-column gap-12">
                              <li className="d-flex justify-content-between align-items-center">
                                <span className="font-primary text-muted">{t("cart.price")}</span>
                                <h6 className="font-primary m-0">{price.toLocaleString("vi-VN")} đ</h6>
                              </li>
                              <li className="d-flex justify-content-between align-items-center">
                                <span className="font-primary text-muted">{t("cart.quantity")}</span>
                                <div className="quantity quantity-wrap">
                                  <div className="input-area quantity-wrap d-flex align-items-center">
                                    <button
                                      className="decrement"
                                      type="button"
                                      disabled={qty <= 1}
                                      onClick={() => updateQuantity(item.cartItemId, qty - 1)}
                                    >
                                      -
                                    </button>
                                    <input
                                      type="text"
                                      name="quantity"
                                      value={qty}
                                      readOnly
                                      className="number text-center"
                                    />
                                    <button
                                      className="increment"
                                      type="button"
                                      disabled={qty >= maxStock}
                                      onClick={() => updateQuantity(item.cartItemId, qty + 1)}
                                    >
                                      +
                                    </button>
                                  </div>
                                </div>
                              </li>
                              <li className="d-flex justify-content-between align-items-center">
                                <span className="font-primary text-muted">{t("cart.subtotal")}</span>
                                <h6 className="color-primary m-0">
                                  {(price * qty).toLocaleString("vi-VN")} đ
                                </h6>
                              </li>
                            </ul>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Table Bottom Actions */}
                <div className="table-bottom-row bg-white mt-24 d-flex justify-content-between align-items-center flex-wrap gap-12">
                  <div className="d-flex gap-12 align-items-center">
                    <Link to="/shop" className="cus-btn">
                      <span className="text-btn">{t("common.goToShop") || "Tiếp tục mua hàng"}</span>
                      <span>{t("common.goToShop") || "Tiếp tục mua hàng"}</span>
                    </Link>
                    <button
                      type="button"
                      className="btn btn-outline-danger btn-sm px-3 py-2"
                      onClick={clearCart}
                      disabled={isLoading}
                    >
                      <i className="fa-regular fa-trash-can me-2"></i>
                      Xóa toàn bộ giỏ
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Cart Totals */}
              <div className="col-xl-4">
                <div className="checkout-box bg-semi-white p-24 br-20 border">
                  <div className="checkout-title mb-20 border-bottom pb-12">
                    <h5 className="fw-600 font-primary medium-black m-0">
                      {t("cart.cartTotals") || "Tóm tắt đơn hàng"}
                    </h5>
                  </div>
                  <div className="bottom-box">
                    <div className="d-flex justify-content-between align-items-center mb-16">
                      <span className="font-sec fw-500 medium-black">
                        {t("cart.subtotal") || "Tạm tính"}
                      </span>
                      <span className="fw-600 medium-black">
                        {cartSubtotal.toLocaleString("vi-VN")} đ
                      </span>
                    </div>

                    <div className="d-flex justify-content-between align-items-center mb-16">
                      <span className="font-sec fw-500 medium-black">
                        {t("cart.delivery") || "Phí vận chuyển"}
                      </span>
                      <span className="fw-600 text-success">
                        {cartShippingFee === 0
                          ? "Miễn phí"
                          : `${cartShippingFee.toLocaleString("vi-VN")} đ`}
                      </span>
                    </div>

                    {cartDiscount > 0 && (
                      <div className="d-flex justify-content-between align-items-center mb-16">
                        <span className="font-sec fw-500 medium-black">
                          {t("cart.discount") || "Giảm giá Voucher"}
                        </span>
                        <span className="fw-600 text-danger">
                          -{cartDiscount.toLocaleString("vi-VN")} đ
                        </span>
                      </div>
                    )}

                    <div className="hr-line my-20 border-top"></div>

                    <div className="d-flex justify-content-between align-items-center mb-24">
                      <h5 className="font-sec fw-700 medium-black m-0">
                        {t("common.total") || "Tổng cộng"}
                      </h5>
                      <h4 className="font-sec fw-700 color-primary m-0">
                        {cartTotal.toLocaleString("vi-VN")} đ
                      </h4>
                    </div>

                    <Link to="/checkout" className="cus-btn w-100 text-center py-3">
                      <span className="text-btn">
                        {t("cart.proceedToCheckout") || "Tiến hành thanh toán"}
                      </span>
                      <span>{t("cart.proceedToCheckout") || "Tiến hành thanh toán"}</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default Cart;
