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
      
      // Redirect to Order History page
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

  return (
    <>
      <TitleBanner title={t("checkout.title")} />

      {/* Customer Container Start */}
      {!user && (
        <div className="customer-container py-40">
          <div className="container-2">
            <div className="customer-wrapper">
              <div className="title-box">
                <p className="fw-500">
                  {t("checkout.returningCustomer", "Returning customer?")}{" "}
                  <a
                    href="#login"
                    className="color-primary text-decoration-underline signin-button"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowSignIn((prev) => !prev);
                    }}
                  >
                    {t("checkout.clickToLogin", "Click here to login")}
                  </a>
                </p>
              </div>
              {showSignIn && (
                <div className="sign-form mt-32" style={{ display: "block" }}>
                  <p className="fw-500 mb-16">
                    {t("checkout.pleaseLoginPrompt", "Please login from the menu in the top right corner.")}
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
      </section>
      {/* Billing Details End */}
    </>
  );
};

export default Checkout;
