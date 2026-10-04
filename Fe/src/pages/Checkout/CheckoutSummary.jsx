import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useCartContext } from "../../providers/CartContext";
import { useToast } from "../../providers/ToastContext";
import cartService from "../../services/cartService";

export const CheckoutSummary = ({ formData, setFormData, isSubmitting }) => {
  const { t } = useTranslation();
  const { cart, setCart } = useCartContext();
  const { showToast } = useToast();

  const [voucherInput, setVoucherInput] = useState("");
  const [activeVoucherId, setActiveVoucherId] = useState(null);

  const handleApplyVoucher = async (e) => {
    e.preventDefault();
    if (!voucherInput.trim()) return;

    // For simplicity, converting voucher code to numeric ID for mock
    const voucherId = Number(voucherInput.trim());
    if (isNaN(voucherId)) {
      showToast("Mã voucher không hợp lệ (nhập số 1 hoặc 2 cho bản demo)", "error");
      return;
    }

    try {
      const data = await cartService.getCart(formData.shippingMethod, voucherId);
      setCart(data);
      setActiveVoucherId(voucherId);
      setFormData(prev => ({ ...prev, voucherId }));
      showToast(`Áp dụng mã giảm giá ${voucherId} thành công!`, "success");
    } catch (err) {
      showToast(err?.response?.data?.message || "Mã giảm giá không hợp lệ", "error");
      setActiveVoucherId(null);
      setFormData(prev => ({ ...prev, voucherId: null }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (!cart) return null;

  return (
    <div className="checkout-sidebar">
      {/* Coupon Widget */}
      <div className="coupon-widget mb-24">
        <h6 className="fw-600 mb-16">Nhập mã giảm giá</h6>
        <div className="coupon-input">
          <input
            type="text"
            className="form-control mb-12"
            placeholder="Mã giảm giá (VD: 1 hoặc 2)"
            value={voucherInput}
            onChange={(e) => setVoucherInput(e.target.value)}
          />
          <button className="cus-btn w-100 mt-2" onClick={handleApplyVoucher}>
            Áp dụng
          </button>
        </div>
        {activeVoucherId && (
          <div className="mt-2 text-success" style={{ fontSize: "14px" }}>
            <i className="fa-solid fa-check-circle me-1"></i>
            Đang áp dụng mã: {activeVoucherId}
          </div>
        )}
      </div>

      <div className="cart-total-box bg-white br-10">
        <h5 className="fw-600 mb-24">Tóm tắt đơn hàng</h5>
        
        {/* Items Summary */}
        <div className="order-items mb-24">
          <h6 className="mb-12">Sản phẩm ({cart.totalItemsCount})</h6>
          {cart.items.filter(item => item.available && item.finalQuantity > 0).map((item) => (
            <div key={item.cartItemId || item.productId} className="d-flex justify-content-between mb-8" style={{ fontSize: "14px" }}>
              <span className="text-truncate" style={{ maxWidth: "70%" }}>
                {item.productName} <span className="text-muted">x{item.finalQuantity}</span>
              </span>
              <span>{item.subtotal.toLocaleString("vi-VN")} đ</span>
            </div>
          ))}
        </div>

        <ul className="list-unstyled mb-24">
          <li className="d-flex justify-content-between align-items-center mb-12">
            <span className="fw-500">Thành tiền</span>
            <span className="fw-500">{cart.subtotal.toLocaleString("vi-VN")} đ</span>
          </li>

          {/* Shipping Methods */}
          <li>
            <div className="shipping-radio w-100 mb-12">
              <span className="fw-500 mb-16 d-block">
                Vận chuyển
              </span>
              <div className="cus-radio mb-12">
                <input
                  type="radio"
                  id="standard"
                  name="shippingMethod"
                  value="STANDARD"
                  checked={formData.shippingMethod === "STANDARD"}
                  onChange={handleChange}
                />
                <label htmlFor="standard">Standard (Miễn phí {'>'} 100.000 đ)</label>
              </div>
              <div className="cus-radio">
                <input
                  type="radio"
                  id="express"
                  name="shippingMethod"
                  value="EXPRESS"
                  checked={formData.shippingMethod === "EXPRESS"}
                  onChange={handleChange}
                />
                <label htmlFor="express">Express</label>
              </div>
            </div>
          </li>
          <li className="d-flex justify-content-between align-items-center mb-12">
            <span className="fw-500">Phí giao hàng</span>
            <span className="fw-500">{cart.shippingFee === 0 ? "Miễn phí" : `${cart.shippingFee.toLocaleString("vi-VN")} đ`}</span>
          </li>
          
          {cart.discountAmount > 0 && (
            <li className="d-flex justify-content-between align-items-center mb-12 text-success">
              <span className="fw-500">Voucher giảm giá</span>
              <span className="fw-500">-{cart.discountAmount.toLocaleString("vi-VN")} đ</span>
            </li>
          )}

          <li className="total d-flex justify-content-between align-items-center mt-16 pt-16 border-top">
            <span className="fw-600 dark-black">Tổng cộng</span>
            <span className="fw-600 dark-black color-primary">
              {cart.totalCost.toLocaleString("vi-VN")} đ
            </span>
          </li>
        </ul>

        {/* Payment Methods */}
        <div className="payment-accordion mb-24">
          <h6 className="fw-600 mb-16">Phương thức thanh toán</h6>
          <div className="cus-radio mb-12">
            <input
              type="radio"
              id="payment-cod"
              name="paymentMethod"
              value="COD"
              checked={formData.paymentMethod === "COD"}
              onChange={handleChange}
            />
            <label htmlFor="payment-cod">Thanh toán khi nhận hàng (COD)</label>
          </div>
          <div className="cus-radio">
            <input
              type="radio"
              id="payment-vnpay"
              name="paymentMethod"
              value="VNPAY"
              checked={formData.paymentMethod === "VNPAY"}
              onChange={handleChange}
            />
            <label htmlFor="payment-vnpay">Chuyển khoản VNPAY</label>
          </div>
        </div>

        <button
          className="cus-btn w-100"
          type="submit"
          disabled={isSubmitting || !cart || cart.items.length === 0}
        >
          <span className="text-btn">
            {isSubmitting ? "Đang xử lý..." : "Đặt Hàng Ngay"}
          </span>
          <span>{isSubmitting ? "Đang xử lý..." : "Đặt Hàng Ngay"}</span>
        </button>
      </div>
    </div>
  );
};
