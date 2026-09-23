import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthTooltip from "../../components/auth/AuthTooltip";
import OtpVerificationStep from "../../components/auth/OtpVerificationStep";
import TitleBanner from "../../components/shared/TitleBanner";
import authService from "../../services/authService";

export const ForgotPasswordPage = () => {
  const navigate = useNavigate();

  // 1: Enter email, 2: Enter OTP, 3: Enter new password
  const [step, setStep] = useState(1);

  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errors, setErrors] = useState({});
  const [otpError, setOtpError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [apiError, setApiError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const validateEmailStep = () => {
    const errs = {};
    if (!email.trim()) {
      errs.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = "Please enter a valid email address.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validatePasswordStep = () => {
    const errs = {};
    if (!newPassword) {
      errs.newPassword = "New password is required.";
    } else if (newPassword.length < 8) {
      errs.newPassword = "Password must be at least 8 characters.";
    }

    if (!confirmNewPassword) {
      errs.confirmNewPassword = "Confirm password is required.";
    } else if (newPassword !== confirmNewPassword) {
      errs.confirmNewPassword = "Passwords do not match.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Step 1: Send OTP to email
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setApiError("");
    setSuccessMsg("");
    if (!validateEmailStep()) return;

    setIsSubmitting(true);
    try {
      await authService.sendForgotPasswordOtp({ email: email.trim() });
      setIsSubmitting(false);
      setStep(2);
    } catch (err) {
      setIsSubmitting(false);
      setApiError(
        err?.response?.data?.message ||
          err.message ||
          "Failed to send reset code. Please check your email.",
      );
    }
  };

  // Resend OTP in Step 2
  const handleResendOtp = async () => {
    setIsResending(true);
    try {
      await authService.sendForgotPasswordOtp({ email: email.trim() });
      setIsResending(false);
    } catch (err) {
      setIsResending(false);
      setOtpError(
        err?.response?.data?.message ||
          err.message ||
          "Failed to resend OTP. Please wait before retrying.",
      );
    }
  };

  // Step 2 -> Step 3: Validate OTP entered
  const handleOtpValidated = () => {
    if (!otpCode || otpCode.length < 6) {
      setOtpError("Please enter the 6-digit OTP code.");
      return;
    }
    setStep(3);
  };

  // Step 3: Submit reset password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setApiError("");
    setSuccessMsg("");
    if (!validatePasswordStep()) return;

    setIsSubmitting(true);
    try {
      await authService.resetPassword({
        email: email.trim(),
        otpCode,
        newPassword,
      });

      setIsSubmitting(false);
      setSuccessMsg(
        "Password reset successfully! Redirecting to Sign In in 2 seconds...",
      );
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setIsSubmitting(false);
      const msg =
        err?.response?.data?.message ||
        err.message ||
        "Failed to reset password. Please check your OTP code.";
      setApiError(msg);
    }
  };

  return (
    <>
      <TitleBanner title="Reset Password" />

      <section className="py-60">
        <div className="container-2">
          <div className="row justify-content-center">
            <div className="col-xl-5 col-lg-6 col-md-8 col-sm-10 col-12">
              <div className="auth-modal-card p-4 p-sm-5 bg-white br-20 border shadow-sm">
                {/* Logo */}
                <div className="text-center mb-3">
                  <Link to="/" className="d-inline-block">
                    <img
                      src="/assets/media/logo.png"
                      alt="Clinic Logo"
                      style={{ maxHeight: "48px" }}
                    />
                  </Link>
                </div>

                {apiError && (
                  <div className="alert alert-danger py-2 px-3 br-10 mb-3 text-center fs-14">
                    <i className="fa-solid fa-circle-exclamation me-2"></i>
                    {apiError}
                  </div>
                )}
                {successMsg && (
                  <div className="alert alert-success py-2 px-3 br-10 mb-3 text-center fs-14">
                    <i className="fa-solid fa-circle-check me-2"></i>
                    {successMsg}
                  </div>
                )}

                {/* Step 1: Request OTP */}
                {step === 1 && (
                  <>
                    <div className="text-center mb-4">
                      <h3 className="medium-black fw-700 mb-2">
                        Forgot Password?
                      </h3>
                      <p className="dark-gray subtitle fs-14">
                        Enter your registered email address and we will send you
                        a 6-digit verification code.
                      </p>
                    </div>

                    <form onSubmit={handleSendOtp} noValidate>
                      <div className="auth-field-wrapper mb-4 position-relative">
                        <label
                          htmlFor="forgot-email"
                          className="form-label fw-600 medium-black mb-1"
                        >
                          Email Address
                        </label>
                        <div className="input-block">
                          <input
                            type="email"
                            id="forgot-email"
                            className={`form-control form-control-2 ${
                              errors.email ? "is-invalid-field" : ""
                            }`}
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => {
                              setEmail(e.target.value);
                              if (errors.email) {
                                setErrors((prev) => ({ ...prev, email: "" }));
                              }
                            }}
                            disabled={isSubmitting}
                            autoComplete="username"
                          />
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                            fill="none"
                          >
                            <path
                              d="M18.2422 2.96875H1.75781C0.786602 2.96875 0 3.76023 0 4.72656V15.2734C0 16.2455 0.792383 17.0312 1.75781 17.0312H18.2422C19.2053 17.0312 20 16.2488 20 15.2734V4.72656C20 3.76195 19.2165 2.96875 18.2422 2.96875ZM17.996 4.14062C17.6369 4.49785 11.4564 10.6458 11.243 10.8581C10.9109 11.1901 10.4695 11.3729 10 11.3729C9.53047 11.3729 9.08906 11.1901 8.75594 10.857C8.61242 10.7142 2.50012 4.63414 2.00398 4.14062H17.996ZM1.17188 15.0349V4.96582L6.23586 10.0031L1.17188 15.0349ZM2.00473 15.8594L7.06672 10.8296L7.9284 11.6867C8.48176 12.2401 9.21746 12.5448 10 12.5448C10.7825 12.5448 11.5182 12.2401 12.0705 11.6878L12.9333 10.8296L17.9953 15.8594H2.00473ZM18.8281 15.0349L13.7641 10.0031L18.8281 4.96582V15.0349Z"
                              fill="#141516"
                            />
                          </svg>
                        </div>
                        <AuthTooltip message={errors.email} position="top" />
                      </div>

                      <button
                        type="submit"
                        className="cus-btn w-100 text-center border-0"
                        disabled={isSubmitting}
                      >
                        <span className="btn-text">
                          {isSubmitting
                            ? "Sending Code..."
                            : "Send Verification Code"}
                        </span>
                        <span>
                          {isSubmitting
                            ? "Sending Code..."
                            : "Send Verification Code"}
                        </span>
                      </button>

                      <div className="text-center mt-3 pt-2">
                        <Link
                          to="/login"
                          className="color-primary fw-600 text-decoration-underline fs-14"
                        >
                          <i className="fa-solid fa-arrow-left me-1"></i> Back
                          to Sign In
                        </Link>
                      </div>
                    </form>
                  </>
                )}

                {/* Step 2: Verify OTP */}
                {step === 2 && (
                  <OtpVerificationStep
                    email={email}
                    otp={otpCode}
                    setOtp={setOtpCode}
                    otpError={otpError}
                    setOtpError={setOtpError}
                    onVerify={handleOtpValidated}
                    onResend={handleResendOtp}
                    onBack={() => setStep(1)}
                    isVerifying={isSubmitting}
                    isResending={isResending}
                    submitButtonText="Next: Set New Password"
                  />
                )}

                {/* Step 3: Enter New Password */}
                {step === 3 && (
                  <>
                    <div className="text-center mb-4">
                      <h3 className="medium-black fw-700 mb-2">
                        Set New Password
                      </h3>
                      <p className="dark-gray subtitle fs-14">
                        Please choose a strong password with at least 8
                        characters.
                      </p>
                    </div>

                    <form onSubmit={handleResetPassword} noValidate>
                      <div className="auth-field-wrapper mb-3 position-relative">
                        <label
                          htmlFor="reset-new-pw"
                          className="form-label fw-600 medium-black mb-1"
                        >
                          New Password
                        </label>
                        <div className="input-block">
                          <input
                            type={showPassword ? "text" : "password"}
                            id="reset-new-pw"
                            className={`form-control form-control-2 pe-5 ${
                              errors.newPassword ? "is-invalid-field" : ""
                            }`}
                            placeholder="At least 8 characters"
                            value={newPassword}
                            onChange={(e) => {
                              setNewPassword(e.target.value);
                              if (errors.newPassword) {
                                setErrors((prev) => ({
                                  ...prev,
                                  newPassword: "",
                                }));
                              }
                            }}
                            disabled={isSubmitting}
                            autoComplete="new-password"
                          />
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                            fill="none"
                          >
                            <path
                              d="M10 2C6.134 2 3 5.134 3 9V11H2C1.448 11 1 11.448 1 12V18C1 18.552 1.448 19 2 19H18C18.552 19 19 18.552 19 18V12C19 11.448 18.552 11 18 11H17V9C17 5.134 13.866 2 10 2ZM5 9C5 6.239 7.239 4 10 4C12.761 4 15 6.239 15 9V11H5V9Z"
                              fill="#141516"
                            />
                          </svg>
                          <button
                            type="button"
                            className="auth-password-toggle"
                            onClick={() => setShowPassword((prev) => !prev)}
                            tabIndex="-1"
                          >
                            <i
                              className={
                                showPassword
                                  ? "fa-regular fa-eye-slash"
                                  : "fa-regular fa-eye"
                              }
                            ></i>
                          </button>
                        </div>
                        <AuthTooltip
                          message={errors.newPassword}
                          position="top"
                        />
                      </div>

                      <div className="auth-field-wrapper mb-4 position-relative">
                        <label
                          htmlFor="reset-confirm-pw"
                          className="form-label fw-600 medium-black mb-1"
                        >
                          Confirm New Password
                        </label>
                        <div className="input-block">
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            id="reset-confirm-pw"
                            className={`form-control form-control-2 pe-5 ${
                              errors.confirmNewPassword
                                ? "is-invalid-field"
                                : ""
                            }`}
                            placeholder="Repeat new password"
                            value={confirmNewPassword}
                            onChange={(e) => {
                              setConfirmNewPassword(e.target.value);
                              if (errors.confirmNewPassword) {
                                setErrors((prev) => ({
                                  ...prev,
                                  confirmNewPassword: "",
                                }));
                              }
                            }}
                            disabled={isSubmitting}
                            autoComplete="new-password"
                          />
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                            fill="none"
                          >
                            <path
                              d="M10 2C6.134 2 3 5.134 3 9V11H2C1.448 11 1 11.448 1 12V18C1 18.552 1.448 19 2 19H18C18.552 19 19 18.552 19 18V12C19 11.448 18.552 11 18 11H17V9C17 5.134 13.866 2 10 2ZM5 9C5 6.239 7.239 4 10 4C12.761 4 15 6.239 15 9V11H5V9Z"
                              fill="#141516"
                            />
                          </svg>
                          <button
                            type="button"
                            className="auth-password-toggle"
                            onClick={() =>
                              setShowConfirmPassword((prev) => !prev)
                            }
                            tabIndex="-1"
                          >
                            <i
                              className={
                                showConfirmPassword
                                  ? "fa-regular fa-eye-slash"
                                  : "fa-regular fa-eye"
                              }
                            ></i>
                          </button>
                        </div>
                        <AuthTooltip
                          message={errors.confirmNewPassword}
                          position="top"
                        />
                      </div>

                      <button
                        type="submit"
                        className="cus-btn w-100 text-center border-0"
                        disabled={isSubmitting}
                      >
                        <span className="btn-text">
                          {isSubmitting
                            ? "Resetting Password..."
                            : "Reset Password"}
                        </span>
                        <span>
                          {isSubmitting
                            ? "Resetting Password..."
                            : "Reset Password"}
                        </span>
                      </button>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ForgotPasswordPage;
