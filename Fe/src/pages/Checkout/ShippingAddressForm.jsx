import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../providers/AuthContext";

export const ShippingAddressForm = ({ formData, setFormData, errors }) => {
  const { t } = useTranslation();
  const { user } = useAuth();

  // Prefill user data if available
  useEffect(() => {
    if (user && !formData.isPrefilled) {
      setFormData(prev => ({
        ...prev,
        fullName: user.fullName || prev.fullName,
        phoneNumber: user.phone || prev.phoneNumber,
        shippingAddress: user.address || prev.shippingAddress,
        email: user.email || prev.email,
        isPrefilled: true
      }));
    }
  }, [user, formData.isPrefilled, setFormData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="billing-wrapper bg-white br-10 mb-40">
      <div className="row">
        {/* Full Name */}
        <div className="col-md-12">
          <div className="input-block mb-16">
            <input
              type="text"
              name="fullName"
              className={`form-control form-control-2 ${errors.fullName ? "is-invalid" : ""}`}
              placeholder={t("checkout.fullName", "Full Name")}
              value={formData.fullName}
              onChange={handleChange}
            />
            {errors.fullName && <div className="invalid-feedback">{errors.fullName}</div>}
          </div>
        </div>

        {/* Email & Phone */}
        <div className="col-md-6">
          <div className="input-block mb-16">
            <input
              type="email"
              name="email"
              className="form-control form-control-2"
              placeholder={t("checkout.emailOptional", "Email (Optional)")}
              value={formData.email}
              onChange={handleChange}
            />
          </div>
        </div>
        <div className="col-md-6">
          <div className="input-block mb-16">
            <input
              type="tel"
              name="phoneNumber"
              className={`form-control form-control-2 ${errors.phoneNumber ? "is-invalid" : ""}`}
              placeholder={t("checkout.phoneNumber", "Phone Number")}
              value={formData.phoneNumber}
              onChange={handleChange}
            />
            {errors.phoneNumber && <div className="invalid-feedback">{errors.phoneNumber}</div>}
          </div>
        </div>

        {/* Shipping Address */}
        <div className="col-md-12">
          <div className="input-block mb-16">
            <input
              type="text"
              name="shippingAddress"
              className={`form-control form-control-2 ${errors.shippingAddress ? "is-invalid" : ""}`}
              placeholder={t("checkout.shippingAddressPlaceholder", "Delivery address (House no, Street, Ward, District, City)")}
              value={formData.shippingAddress}
              onChange={handleChange}
            />
            {errors.shippingAddress && <div className="invalid-feedback">{errors.shippingAddress}</div>}
          </div>
        </div>

        {/* Order Notes */}
        <div className="col-md-12">
          <div className="input-block">
            <textarea
              name="orderNotes"
              className="form-control form-control-2"
              placeholder={t("checkout.orderNotesPlaceholder", "Order notes (e.g. deliver during office hours)")}
              rows={4}
              value={formData.orderNotes}
              onChange={handleChange}
            ></textarea>
          </div>
        </div>
      </div>
    </div>
  );
};
