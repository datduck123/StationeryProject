import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useCartContext } from "../../providers/CartContext";
import { useToast } from "../../providers/ToastContext";
import cartService from "../../services/cartService";
import voucherService from "../../services/voucherService";

export const CheckoutSummary = ({ formData, setFormData, isSubmitting }) => {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language === "en";
  const { cart, setCart } = useCartContext();
  const { showToast } = useToast();

  const [vouchers, setVouchers] = useState([]);
  const [loadingVouchers, setLoadingVouchers] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isApplyingVoucher, setIsApplyingVoucher] = useState(false);
  const dropdownRef = useRef(null);

  // Load real active vouchers from Database
  useEffect(() => {
    let active = true;
    setLoadingVouchers(true);
    voucherService
      .getActiveVouchers()
      .then((data) => {
        if (active) {
          const list = Array.isArray(data) ? data : (data?.data ?? []);
          setVouchers(list.filter(v => v.isActive !== false && v.status !== "INACTIVE"));
        }
      })
      .catch((err) => {
        console.error("Failed to fetch vouchers from DB:", err);
        if (active) setVouchers([]);
      })
      .finally(() => {
        if (active) setLoadingVouchers(false);
      });

    return () => {
      active = false;
    };
  }, []);

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

  const formatVoucherTitle = (voucher) => {
    if (voucher.discountPercent) {
      return `${voucher.code} - Giảm ${voucher.discountPercent}%`;
    }
    if (voucher.discountAmount) {
      return `${voucher.code} - Giảm ${Number(voucher.discountAmount).toLocaleString("vi-VN")} đ`;
    }
    return voucher.code;
  };

  const formatVoucherDesc = (voucher) => {
    if (voucher.discountPercent) {
      const maxText = voucher.maxDiscount ? ` (Tối đa ${Number(voucher.maxDiscount).toLocaleString("vi-VN")} đ)` : "";
      return `Giảm ${voucher.discountPercent}% giá trị đơn hàng${maxText}`;
    }
    if (voucher.discountAmount) {
      return `Giảm trực tiếp ${Number(voucher.discountAmount).toLocaleString("vi-VN")} đ vào đơn hàng`;
    }
    return `Mã ưu đãi ${voucher.code}`;
  };

  const formatVoucherMinOrder = (voucher) => {
    if (voucher.minOrderAmount && Number(voucher.minOrderAmount) > 0) {
      return `Đơn hàng tối thiểu từ ${Number(voucher.minOrderAmount).toLocaleString("vi-VN")} đ`;
    }
    return "Không giới hạn đơn hàng tối thiểu";
  };

  const handleSelectVoucher = async (targetVoucher) => {
    if (isApplyingVoucher) return;

    const voucherId = targetVoucher ? (targetVoucher.voucherId ?? targetVoucher.id) : null;
    const targetVoucherId = formData.voucherId === voucherId ? null : voucherId;
    const targetVoucherCode = targetVoucherId && targetVoucher ? targetVoucher.code : "";

    setIsApplyingVoucher(true);
    try {
      const data = await cartService.getCart(formData.shippingMethod, targetVoucherId);
      setCart(data);
      setFormData(prev => ({
        ...prev,
        voucherId: targetVoucherId,
        voucherCode: targetVoucherCode
      }));

      if (targetVoucherId) {
        showToast(`Áp dụng Voucher ${targetVoucherCode || targetVoucherId} thành công!`, "success");
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

  const selectedVoucher = vouchers.find(v => (v.voucherId ?? v.id) === formData.voucherId);

  return (
    <div className="checkout-sidebar">
      {/* Voucher Dropdown Widget */}
      <div className="coupon-widget mb-24" ref={dropdownRef}>
        <h6 className="fw-600 mb-12">{t("checkout.voucherTitle", "Discount Code (Voucher)")}</h6>

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
                    {formatVoucherTitle(selectedVoucher)}
                  </div>
                  <span className="badge bg-success-subtle text-success" style={{ fontSize: "11px" }}>
                    ✓ Đang áp dụng (ID: {selectedVoucher.voucherId ?? selectedVoucher.id})
                  </span>
                </div>
              ) : formData.voucherId ? (
                <div>
                  <div className="fw-600 dark-black" style={{ fontSize: "14px" }}>
                    Voucher ID: {formData.voucherId}
                  </div>
                  <span className="badge bg-success-subtle text-success" style={{ fontSize: "11px" }}>
                    {t("checkout.applying", "✓ Applied")}
                  </span>
                </div>
              ) : (
                <span className="text-secondary" style={{ fontSize: "14px" }}>
                  {t("checkout.selectVoucher", "Choose a voucher...")}
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
              Danh sách mã voucher khả dụng:
              {t("checkout.voucherList", "Voucher list (select by ID):")}
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
                <div className="fw-500 text-dark" style={{ fontSize: "14px" }}>{t("checkout.noVoucher", "Do not use discount code")}</div>
                <div className="text-muted" style={{ fontSize: "12px" }}>{t("checkout.unselectVoucher", "Remove voucher")}</div>
              </label>
            </div>

            {/* Danh sách các mã voucher từ database */}
            {loadingVouchers ? (
              <div className="text-center py-3 text-muted" style={{ fontSize: "13px" }}>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                Đang tải danh sách voucher từ database...
              </div>
            ) : vouchers.length === 0 ? (
              <div className="text-center py-3 text-muted" style={{ fontSize: "13px" }}>
                Hiện không có mã giảm giá nào khả dụng.
              </div>
            ) : (
              vouchers.map((voucher) => {
                const vId = voucher.voucherId ?? voucher.id;
                const isSelected = formData.voucherId === vId;
                return (
                  <div
                    key={vId}
                    className={`p-2 br-8 mb-2 d-flex align-items-start gap-2 border ${isSelected ? "border-danger bg-light" : "border-light"}`}
                    style={{ cursor: "pointer", transition: "background-color 0.15s" }}
                    onClick={() => handleSelectVoucher(voucher)}
                  >
                    <input
                      type="radio"
                      id={`voucher-opt-${vId}`}
                      name="voucherOption"
                      checked={isSelected}
                      onChange={() => handleSelectVoucher(voucher)}
                      style={{ marginTop: "3px", accentColor: "#e9613f", cursor: "pointer" }}
                    />
                    <label htmlFor={`voucher-opt-${vId}`} className="m-0 w-100" style={{ cursor: "pointer" }}>
                      <div className="d-flex align-items-center justify-content-between mb-1">
                        <span className="fw-600 dark-black" style={{ fontSize: "14px" }}>
                          {formatVoucherTitle(voucher)}
                        </span>
                        <span className="badge bg-danger-subtle text-danger" style={{ fontSize: "11px" }}>
                          ID: {vId}
                        </span>
                      </div>
                      <div className="color-primary fw-500" style={{ fontSize: "13px" }}>
                        {formatVoucherDesc(voucher)}
                      </div>
                      <div className="text-muted" style={{ fontSize: "12px" }}>
                        <i className="fa-regular fa-clock me-1"></i>{formatVoucherMinOrder(voucher)}
                      </div>
                    </label>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Selected Voucher Indicator */}
        {formData.voucherId && (
          <div className="mt-2 d-flex align-items-center justify-content-between text-success" style={{ fontSize: "13px" }}>
            <span>
              <i className="fa-solid fa-circle-check me-1"></i>
              Đã kích hoạt Voucher: <strong>{selectedVoucher ? selectedVoucher.code : `ID #${formData.voucherId}`}</strong>
              {t("checkout.voucherActivated", "Activated Voucher ID:")} <strong>{formData.voucherId}</strong>
            </span>
            <button
              type="button"
              className="btn btn-link btn-sm p-0 text-danger text-decoration-none"
              style={{ fontSize: "12px" }}
              onClick={() => handleSelectVoucher(null)}
            >
              {t("checkout.cancelVoucher", "Cancel")}
            </button>
          </div>
        )}
      </div>

      <div className="cart-total-box bg-white br-10">
        <h5 className="fw-600 mb-24">{t("checkout.orderSummary", "Order Summary")}</h5>

        {/* Items Summary */}
        <div className="order-items mb-24">
          <h6 className="mb-12">
            {t("checkout.productsCount", { count: cart.totalItemsCount, defaultValue: `Products (${cart.totalItemsCount})` })}
          </h6>
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
            <span className="fw-500">{t("cart.subtotal", "Subtotal")}</span>
            <span className="fw-500">{cart.subtotal.toLocaleString("vi-VN")} đ</span>
          </li>

          {/* Shipping Methods */}
          <li>
            <div className="shipping-radio w-100 mb-12">
              <span className="fw-500 mb-16 d-block">
                {t("cart.delivery", "Shipping")}
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
                <label htmlFor="standard">{t("checkout.shippingStandard", "Standard (Free > 100.000 đ)")}</label>
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
            <span className="fw-500">{t("cart.delivery", "Shipping Fee")}</span>
            <span className="fw-500">{cart.shippingFee === 0 ? t("cart.freeShipping", "Free") : `${cart.shippingFee.toLocaleString("vi-VN")} đ`}</span>
          </li>

          {cart.discountAmount > 0 && (
            <li className="d-flex justify-content-between align-items-center mb-12 text-success">
              <span className="fw-500">{t("checkout.voucherDiscount", "Voucher Discount")}</span>
              <span className="fw-500">-{cart.discountAmount.toLocaleString("vi-VN")} đ</span>
            </li>
          )}

          <li className="total d-flex justify-content-between align-items-center mt-16 pt-16 border-top">
            <span className="fw-600 dark-black">{t("common.total", "Total")}</span>
            <span className="fw-600 dark-black color-primary">
              {cart.totalCost.toLocaleString("vi-VN")} đ
            </span>
          </li>
        </ul>

        {/* Payment Methods */}
        <div className="payment-accordion mb-24">
          <h6 className="fw-600 mb-16">{t("checkout.paymentMethod", "Payment Method")}</h6>
          <div className="cus-radio mb-12">
            <input
              type="radio"
              id="payment-cod"
              name="paymentMethod"
              value="COD"
              checked={formData.paymentMethod === "COD"}
              onChange={handleChange}
            />
            <label htmlFor="payment-cod">{t("checkout.cashOnDelivery", "Cash on delivery (COD)")}</label>
          </div>
          <div className="cus-radio">
            <input
              type="radio"
              id="payment-vnpay"
              name="paymentMethod"
              value="ONLINE"
              checked={formData.paymentMethod === "ONLINE" || formData.paymentMethod === "VNPAY"}
              onChange={handleChange}
            />
            <label htmlFor="payment-vnpay">{t("checkout.vnpay", "Thanh toán trực tuyến (ONLINE)")}</label>
          </div>
        </div>

        <button
          className="cus-btn w-100"
          type="submit"
          disabled={isSubmitting || !cart || cart.items.length === 0}
        >
          <span className="text-btn">
            {isSubmitting ? t("checkout.processing", "Processing...") : t("checkout.placeOrder", "Place Order Now")}
          </span>
          <span>{isSubmitting ? t("checkout.processing", "Processing...") : t("checkout.placeOrder", "Place Order Now")}</span>
        </button>
      </div>
    </div>
  );
};
