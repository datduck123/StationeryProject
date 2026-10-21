import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import TitleBanner from "../../components/shared/TitleBanner";
import { ShippingAddressForm } from "./ShippingAddressForm";
import { CheckoutSummary } from "./CheckoutSummary";
import { useAuth } from "../../providers/AuthContext";
import { useCartContext } from "../../providers/CartContext";
import { useToast } from "../../providers/ToastContext";
import checkoutService from "../../services/checkoutService";
import cartService from "../../services/cartService";

export const Checkout = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart, setCart, clearCart } = useCartContext();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    shippingAddress: "",
    email: "",
    orderNotes: "",
    shippingMethod: "STANDARD",
    paymentMethod: "COD",
    voucherId: null,
    isPrefilled: false
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);

  // When shipping method changes, refresh the cart calculations
  useEffect(() => {
    if (user) {
      cartService.getCart(formData.shippingMethod, formData.voucherId)
        .then(data => setCart(data))
        .catch(err => console.error("Error updating shipping method:", err));
    }
  }, [formData.shippingMethod, formData.voucherId, user, setCart]); // Fetch cart whenever shipping or voucher changes

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName?.trim()) newErrors.fullName = "Vui lòng nhập họ và tên";
    if (!formData.phoneNumber?.trim()) {
      newErrors.phoneNumber = "Vui lòng nhập số điện thoại";
    } else if (!/^(0[3|5|7|8|9])+([0-9]{8})$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Số điện thoại không hợp lệ";
    }
    if (!formData.shippingAddress?.trim()) newErrors.shippingAddress = "Vui lòng nhập địa chỉ nhận hàng";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      showToast("Vui lòng kiểm tra lại thông tin giao hàng", "error");
      return;
    }

    if (!cart || cart.items.length === 0) {
      showToast("Giỏ hàng của bạn đang trống", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await checkoutService.validateCheckout(formData);
      showToast(response.message || "Khởi tạo đơn hàng thành công!", "success");
      
      // In a real flow, we would redirect to a success page or payment gateway (like VNPAY)
      // Redirect to Order History page as requested
      await clearCart(false);
      setTimeout(() => navigate("/account/orders"), 2000);
      
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || "Lỗi khi xử lý đơn hàng";
      showToast(message, "error", 5000);
      
      // If stock changed, we should refresh the cart
      if (err?.response?.data?.data?.validatedCart) {
        setCart(err.response.data.data.validatedCart);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    voucherService.getActiveVouchers().then(setVouchers).catch(() => setVouchers([]));
  }, []);

      {/* Customer Container Start */}
      {!user && (
        <div className="customer-container py-40">
          <div className="container-2">
            <div className="customer-wrapper">
              <div className="title-box">
                <p className="fw-500">
                  Khách hàng cũ?{" "}
                  <a
                    href="#login"
                    className="color-primary text-decoration-underline signin-button"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowSignIn((prev) => !prev);
                    }}
                  >
                    Nhấn vào đây để đăng nhập
                  </a>
                </p>
              </div>
              {showSignIn && (
                <div className="sign-form mt-32" style={{ display: "block" }}>
                  <p className="fw-500 mb-16">
                    Vui lòng đăng nhập ở menu bên góc phải phía trên.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Customer Container End */}

      {/* Billing Details Start */}
      <section className="billing-detail pb-80 pt-40">
        <div className="container-2">
          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="row row-gap-4">
              <div className="col-xl-8">
                <div className="title-row title-row-2 bg-white mb-16">
                  <h5 className="fw-600 medium-black">
                    {t("checkout.billingDetails")}
                  </h5>
                </div>
                
                {/* Reusable Shipping Address Form Component (M3-07) */}
                <ShippingAddressForm 
                  formData={formData} 
                  setFormData={setFormData}
                  errors={errors}
                />
                
              </div>
              <div className="col-xl-4">
                {/* Reusable Checkout Summary Component (M3-08) */}
                <CheckoutSummary 
                  formData={formData}
                  setFormData={setFormData}
                  isSubmitting={isSubmitting}
                />
              </div>
            </div>
          </form>
        </div>
        <aside className="commerce-panel commerce-summary">
          <h4 className="mb-3">{t("commerce.yourOrder")}</h4>
          {items.map((item) => <div className="commerce-order-item" key={item.cartItemId}><div><strong>{item.productName}</strong><p>{item.quantity} × {money(item.unitPrice)}</p></div><strong>{money(item.subtotal)}</strong></div>)}
          <label htmlFor="checkout-voucher" className="fw-bold mb-2">{t("cart.couponCode")}</label>
          <div className="d-flex gap-2 mb-2"><input id="checkout-voucher" className="form-control" list="checkout-vouchers" maxLength={50} value={voucherInput} disabled={submitting} onChange={(event) => setVoucherInput(event.target.value.toUpperCase())} /><button type="button" className="btn btn-outline-primary" disabled={submitting || loading} onClick={() => { const code = voucherInput.trim().toUpperCase(); if (code === voucherCode) setQuoteVersion((version) => version + 1); else setVoucherCode(code); }}>{t("cart.applyCoupon")}</button></div>
          <datalist id="checkout-vouchers">{vouchers.map((voucher) => <option key={voucher.voucherId ?? voucher.code} value={voucher.code}>{money(voucher.discountAmount)}</option>)}</datalist>
          {voucherCode && <button type="button" className="btn btn-link btn-sm p-0 mb-3" onClick={() => { setVoucherCode(""); setVoucherInput(""); }}>{t("commerce.removeVoucher", { code: voucherCode })}</button>}
          <div className="commerce-total-row"><span>{t("cart.subtotal")}</span><span>{money(quote?.subtotal)}</span></div>
          <div className="commerce-total-row"><span>{t("orders.shippingFee")}</span><span>{money(quote?.shippingFee)}</span></div>
          <div className="commerce-total-row"><span>{t("orders.discount")}</span><span>−{money(quote?.discountAmount)}</span></div>
          <div className="commerce-total-row commerce-grand-total"><strong>{t("orders.total")}</strong><strong>{money(quote?.totalCost)}</strong></div>
          {(quote?.notifications || []).map((message, index) => <p key={index} className="text-warning small">{message}</p>)}
          <button type="submit" className="btn btn-primary w-100" disabled={submitting || loading || !items.length || Boolean(error) || items.some((item) => item.available === false)}>{submitting ? t("commerce.placingOrder") : t("commerce.placeOrder")}</button>
        </aside>
      </form>}
    </div></section>
  </>;
};
export default Checkout;
