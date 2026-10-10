import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useCartContext } from "../../providers/CartContext";
import { useToast } from "../../providers/ToastContext";
import cartService from "../../services/cartService";

const AVAILABLE_VOUCHERS = [
  {
    id: 1,
    title: "Voucher #1 - Giảm 10%",
    discountDesc: "Giảm 10% giá trị đơn hàng (Tối đa 50.000 đ)",
    minOrderText: "Đơn hàng tối thiểu từ 100.000 đ",
    minOrder: 100
  },
  {
    id: 2,
    title: "Voucher #2 - Giảm 15.000 đ",
    discountDesc: "Giảm trực tiếp 15.000 đ vào đơn hàng",
    minOrderText: "Đơn hàng tối thiểu từ 50.000 đ",
    minOrder: 50
  }
];

export const CheckoutSummary = ({ formData, setFormData, isSubmitting }) => {
  const { t } = useTranslation();
  const { cart, setCart } = useCartContext();
  const { showToast } = useToast();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isApplyingVoucher, setIsApplyingVoucher] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelectVoucher = async (voucherId) => {
    if (isApplyingVoucher) return;

    // Bấm lại mã đang chọn -> hủy chọn
    const targetVoucherId = formData.voucherId === voucherId ? null : voucherId;

    setIsApplyingVoucher(true);
    try {
      const data = await cartService.getCart(formData.shippingMethod, targetVoucherId);
      setCart(data);
      setFormData(prev => ({ ...prev, voucherId: targetVoucherId }));

      if (targetVoucherId) {
        showToast(`Áp dụng Voucher ID: ${targetVoucherId} thành công!`, "success");
      } else {
        showToast("Đã hủy áp dụng mã giảm giá", "info");
      }
      setIsDropdownOpen(false);
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || "Không thể áp dụng mã giảm giá này";
      showToast(message, "error");
    } finally {
      setIsApplyingVoucher(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (!cart) return null;

  const selectedVoucher = AVAILABLE_VOUCHERS.find(v => v.id === formData.voucherId);

  return (
    <div className="checkout-sidebar">
      {/* Voucher Dropdown Widget */}
      <div className="coupon-widget mb-24" ref={dropdownRef}>
        <h6 className="fw-600 mb-12">Mã giảm giá (Voucher)</h6>

        {/* Dropdown Toggle Header */}
        <div
          className="voucher-dropdown-toggle p-3 br-10 border bg-white d-flex align-items-center justify-content-between"
          style={{ cursor: "pointer", transition: "all 0.2s" }}
          onClick={() => setIsDropdownOpen(prev => !prev)}
        >
          <div className="d-flex align-items-center gap-2">
            <i className="fa-solid fa-ticket color-primary fs-5"></i>
            <div>
              {selectedVoucher ? (
                <div>
                  <div className="fw-600 dark-black" style={{ fontSize: "14px" }}>
                    Voucher ID: {selectedVoucher.id} - {selectedVoucher.title}
                  </div>
                  <span className="badge bg-success-subtle text-success" style={{ fontSize: "11px" }}>
                    ✓ Đang áp dụng
                  </span>
                </div>
              ) : formData.voucherId ? (
                <div>
                  <div className="fw-600 dark-black" style={{ fontSize: "14px" }}>
                    Voucher ID: {formData.voucherId}
                  </div>
                  <span className="badge bg-success-subtle text-success" style={{ fontSize: "11px" }}>
                    ✓ Đang áp dụng
                  </span>
                </div>
              ) : (
                <span className="text-secondary" style={{ fontSize: "14px" }}>
                  Chọn mã giảm giá (Voucher)...
                </span>
              )}
            </div>
          </div>
          <i
            className="fa-solid fa-chevron-down text-muted"
            style={{
              transform: isDropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.2s ease"
            }}
          ></i>
        </div>

        {/* Dropdown Menu Options */}
        {isDropdownOpen && (
          <div
            className="voucher-dropdown-menu mt-2 p-3 br-10 bg-white border shadow-sm"
            style={{ maxHeight: "320px", overflowY: "auto", position: "relative", zIndex: 10 }}
          >
            <div className="text-muted mb-2 fw-500" style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Danh sách mã voucher (chọn theo ID):
            </div>

            {/* Option: Không sử dụng mã giảm giá */}
            <div
              className={`p-2 br-8 mb-2 d-flex align-items-start gap-2 border ${!formData.voucherId ? "border-primary bg-light" : "border-light"}`}
              style={{ cursor: "pointer", transition: "background-color 0.15s" }}
              onClick={() => handleSelectVoucher(null)}
            >
              <input
                type="radio"
                id="voucher-opt-none"
                name="voucherOption"
                checked={!formData.voucherId}
                onChange={() => handleSelectVoucher(null)}
                style={{ marginTop: "3px", accentColor: "#e9613f", cursor: "pointer" }}
              />
              <label htmlFor="voucher-opt-none" className="m-0 w-100" style={{ cursor: "pointer" }}>
                <div className="fw-500 text-dark" style={{ fontSize: "14px" }}>Không sử dụng mã giảm giá</div>
                <div className="text-muted" style={{ fontSize: "12px" }}>Bỏ chọn voucher</div>
              </label>
            </div>

            {/* Danh sách các mã voucher lần lượt theo ID */}
            {AVAILABLE_VOUCHERS.map((voucher) => {
              const isSelected = formData.voucherId === voucher.id;
              return (
                <div
                  key={voucher.id}
                  className={`p-2 br-8 mb-2 d-flex align-items-start gap-2 border ${isSelected ? "border-danger bg-light" : "border-light"}`}
                  style={{ cursor: "pointer", transition: "background-color 0.15s" }}
                  onClick={() => handleSelectVoucher(voucher.id)}
                >
                  <input
                    type="radio"
                    id={`voucher-opt-${voucher.id}`}
                    name="voucherOption"
                    checked={isSelected}
                    onChange={() => handleSelectVoucher(voucher.id)}
                    style={{ marginTop: "3px", accentColor: "#e9613f", cursor: "pointer" }}
                  />
                  <label htmlFor={`voucher-opt-${voucher.id}`} className="m-0 w-100" style={{ cursor: "pointer" }}>
                    <div className="d-flex align-items-center justify-content-between mb-1">
                      <span className="fw-600 dark-black" style={{ fontSize: "14px" }}>{voucher.title}</span>
                      <span className="badge bg-danger-subtle text-danger" style={{ fontSize: "11px" }}>
                        ID: {voucher.id}
                      </span>
                    </div>
                    <div className="color-primary fw-500" style={{ fontSize: "13px" }}>
                      {voucher.discountDesc}
                    </div>
                    <div className="text-muted" style={{ fontSize: "12px" }}>
                      <i className="fa-regular fa-clock me-1"></i>{voucher.minOrderText}
                    </div>
                  </label>
                </div>
              );
            })}
          </div>
        )}

        {/* Selected Voucher Indicator */}
        {formData.voucherId && (
          <div className="mt-2 d-flex align-items-center justify-content-between text-success" style={{ fontSize: "13px" }}>
            <span>
              <i className="fa-solid fa-circle-check me-1"></i>
              Đã kích hoạt Voucher ID: <strong>{formData.voucherId}</strong>
            </span>
            <button
              type="button"
              className="btn btn-link btn-sm p-0 text-danger text-decoration-none"
              style={{ fontSize: "12px" }}
              onClick={() => handleSelectVoucher(null)}
            >
              Hủy áp dụng
            </button>
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
