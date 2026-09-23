import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../providers/AuthContext";
import { useToast } from "../../providers/ToastContext";
import authService from "../../services/authService";
import OtpVerificationStep from "./OtpVerificationStep";

export const AuthModal = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalTab,
    setAuthModalTab,
    login,
  } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [isLoginSubmitting, setIsLoginSubmitting] = useState(false);

  // Register form state
  const [regStep, setRegStep] = useState(1);
  const [regFullName, setRegFullName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  // OTP state for register
  const [regOtp, setRegOtp] = useState("");
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isResendingOtp, setIsResendingOtp] = useState(false);
  const [isRegSubmitting, setIsRegSubmitting] = useState(false);

  // Forgot Password state: 1: Email, 2: OTP, 3: New Password
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [isForgotVerifying, setIsForgotVerifying] = useState(false);
  const [forgotNewPassword, setForgotNewPassword] = useState("");
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState("");
  const [showForgotNewPassword, setShowForgotNewPassword] = useState(false);
  const [showForgotConfirmPassword, setShowForgotConfirmPassword] =
    useState(false);
  const [isForgotSubmitting, setIsForgotSubmitting] = useState(false);
  const [isForgotResending, setIsForgotResending] = useState(false);

  // Reset steps on tab switch or open
  useEffect(() => {
    setRegStep(1);
    setForgotStep(1);
    setRegOtp("");
    setForgotOtp("");
    setForgotNewPassword("");
    setForgotConfirmPassword("");
  }, [authModalTab, isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const validateLoginForm = () => {
    if (!loginEmail.trim()) {
      showToast("Email address is required.", "error");
      return false;
    }
    if (!validateEmail(loginEmail)) {
      showToast("Please enter a valid email address.", "error");
      return false;
    }
    if (!loginPassword) {
      showToast("Password is required.", "error");
      return false;
    }
    return true;
  };

  const validateRegisterForm = () => {
    if (!regFullName.trim()) {
      showToast("Full name is required.", "error");
      return false;
    }
    if (regFullName.trim().length < 2) {
      showToast("Full name must be at least 2 characters.", "error");
      return false;
    }
    if (!regEmail.trim()) {
      showToast("Email address is required.", "error");
      return false;
    }
    if (!validateEmail(regEmail)) {
      showToast("Please enter a valid email address.", "error");
      return false;
    }
    if (!regPassword || regPassword.length < 8) {
      showToast("Password must be at least 8 characters.", "error");
      return false;
    }
    if (!regConfirmPassword) {
      showToast("Confirm password is required.", "error");
      return false;
    }
    if (regPassword !== regConfirmPassword) {
      showToast("Passwords do not match.", "error");
      return false;
    }
    if (!agreeTerms) {
      showToast(
        "Please agree to the Terms of Service and Privacy Policy.",
        "warning",
      );
      return false;
    }
    return true;
  };

  const validateForgotEmail = () => {
    if (!forgotEmail.trim()) {
      showToast("Email address is required.", "error");
      return false;
    }
    if (!validateEmail(forgotEmail.trim())) {
      showToast("Please enter a valid email address.", "error");
      return false;
    }
    return true;
  };

  const validateForgotReset = () => {
    if (!forgotNewPassword) {
      showToast("New password is required.", "error");
      return false;
    }
    if (forgotNewPassword.length < 8) {
      showToast("Password must be at least 8 characters.", "error");
      return false;
    }
    if (!forgotConfirmPassword) {
      showToast("Confirm password is required.", "error");
      return false;
    }
    if (forgotNewPassword !== forgotConfirmPassword) {
      showToast("Passwords do not match.", "error");
      return false;
    }
    return true;
  };

  // Submit handlers
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!validateLoginForm()) return;

    setIsLoginSubmitting(true);
    try {
      const result = await login(loginEmail, loginPassword);
      setIsLoginSubmitting(false);
      showToast("Welcome back!", "success");
      closeAuthModal();

      if (result.isAdmin) {
        navigate("/admin/users");
      } else {
        navigate("/");
      }
    } catch (err) {
      setIsLoginSubmitting(false);
      const msg =
        err.message || "Login failed. Please verify your credentials.";
      showToast(msg, "error");
    }
  };

  // Register Step 1: Send OTP
  const handleRegisterSendOtp = async (e) => {
    e.preventDefault();
    setRegApiError("");
    setRegSuccessMsg("");
    if (!validateRegisterForm()) return;

    setIsRegSubmitting(true);
    try {
      await authService.sendRegisterOtp({ email: regEmail.trim() });
      setIsRegSubmitting(false);
      setRegStep(2);
      showToast("Verification code has been sent to your email.", "success");
    } catch (err) {
      setIsRegSubmitting(false);
      const msg =
        err?.response?.data?.message ||
        err.message ||
        "Failed to send OTP. Please check your email.";
      showToast(msg, "error");
    }
  };

  // Register Resend OTP
  const handleRegisterResendOtp = async () => {
    setIsResendingOtp(true);
    try {
      await authService.sendRegisterOtp({ email: regEmail.trim() });
      setIsResendingOtp(false);
      showToast("A new verification code has been resent.", "success");
    } catch (err) {
      setIsResendingOtp(false);
      const msg =
        err?.response?.data?.message ||
        err.message ||
        "Failed to resend OTP. Please wait before retrying.";
      showToast(msg, "error");
    }
  };

  // Register Step 2: Verify & Register
  const handleRegisterVerifyAndComplete = async () => {
    if (!regOtp || regOtp.length < 6) {
      showToast("Please enter all 6 digits of the OTP code.", "warning");
      return;
    }

    setIsVerifyingOtp(true);

    try {
      await authService.verifyAndRegister({
        fullName: regFullName.trim(),
        email: regEmail.trim(),
        password: regPassword,
        otpCode: regOtp,
      });

      setIsVerifyingOtp(false);
      showToast(
        "Account registered successfully! Switching to sign in...",
        "success",
      );
      setLoginEmail(regEmail);
      setTimeout(() => {
        setAuthModalTab("login");
        setRegStep(1);
      }, 1200);
    } catch (err) {
      setIsVerifyingOtp(false);
      const msg =
        err?.response?.data?.message ||
        err.message ||
        "Invalid or expired OTP code.";
      showToast(msg, "error");
    }
  };

  // Forgot Password Step 1: Send OTP
  const handleForgotSendOtp = async (e) => {
    e?.preventDefault();
    if (!validateForgotEmail()) return;

    setIsForgotSubmitting(true);
    try {
      await authService.sendForgotPasswordOtp({ email: forgotEmail.trim() });
      setIsForgotSubmitting(false);
      setForgotStep(2);
      showToast(
        "Reset verification code sent! Please check your email.",
        "success",
      );
    } catch (err) {
      setIsForgotSubmitting(false);
      const msg =
        err?.response?.data?.message ||
        err.message ||
        "No account found with this email.";
      showToast(msg, "error");
    }
  };

  // Forgot Password Resend OTP
  const handleForgotResendOtp = async () => {
    setIsForgotResending(true);
    try {
      await authService.sendForgotPasswordOtp({ email: forgotEmail.trim() });
      setIsForgotResending(false);
      showToast(
        "A new verification code has been resent to your email.",
        "success",
      );
    } catch (err) {
      setIsForgotResending(false);
      const msg =
        err?.response?.data?.message ||
        err.message ||
        "Failed to resend OTP. Please wait before retrying.";
      showToast(msg, "error");
    }
  };

  // Forgot Password Step 2: Verify OTP
  const handleForgotVerifyOtp = async () => {
    if (!forgotOtp || forgotOtp.length < 6) {
      showToast("Please enter all 6 digits of the OTP code.", "warning");
      return;
    }

    setIsForgotVerifying(true);

    try {
      await authService.verifyForgotPasswordOtp({
        email: forgotEmail.trim(),
        otpCode: forgotOtp.trim(),
      });
      setIsForgotVerifying(false);
      showToast(
        "Code verified successfully! Now set your new password.",
        "success",
      );
      setForgotStep(3);
    } catch (err) {
      setIsForgotVerifying(false);
      const msg =
        err?.response?.data?.message ||
        err.message ||
        "Invalid or expired OTP code.";
      showToast(msg, "error");
    }
  };

  // Forgot Password Step 3: Reset password
  const handleForgotResetPassword = async (e) => {
    e.preventDefault();
    if (!validateForgotReset()) return;

    setIsForgotSubmitting(true);
    try {
      await authService.resetPassword({
        email: forgotEmail.trim(),
        otpCode: forgotOtp.trim(),
        newPassword: forgotNewPassword,
      });

      setIsForgotSubmitting(false);
      showToast(
        "Password reset successfully! Redirecting to Sign In...",
        "success",
      );
      setLoginEmail(forgotEmail.trim());
      setTimeout(() => {
        setAuthModalTab("login");
        setForgotStep(1);
      }, 1200);
    } catch (err) {
      setIsForgotSubmitting(false);
      const msg =
        err?.response?.data?.message ||
        err.message ||
        "Failed to reset password. Please check your OTP code.";
      showToast(msg, "error");
    }
  };

  return (
    <div
      className="modal fade show auth-modal-backdrop"
      tabIndex="-1"
      role="dialog"
      aria-modal="true"
      style={{ display: "block", backgroundColor: "rgba(0, 0, 0, 0.65)" }}
      onClick={closeAuthModal}
    >
      <div
        className="modal-dialog modal-dialog-centered"
        style={{ maxWidth: "620px", width: "94%", margin: "1.75rem auto" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="modal-content br-20 border-0 shadow-lg auth-modal-card"
          style={{ backgroundColor: "#ffffff", borderRadius: "20px" }}
        >
          {/* Close button */}
          <button
            type="button"
            className="btn-close auth-modal-close"
            aria-label="Close"
            onClick={closeAuthModal}
          ></button>

          <div
            className="modal-body p-4 p-sm-5"
            style={{ backgroundColor: "#ffffff", borderRadius: "20px" }}
          >
            {/* Logo */}
            <div className="text-center mb-3">
              <Link to="/" onClick={closeAuthModal} className="d-inline-block">
                <img
                  src="/assets/media/logo.png"
                  alt="Stationery Logo"
                  style={{ maxHeight: "46px" }}
                />
              </Link>
            </div>

            {/* Header Titles */}
            <div className="text-center mb-4">
              <h3 className="medium-black fw-700 mb-2">
                {authModalTab === "login"
                  ? "Welcome Back"
                  : authModalTab === "register"
                    ? "Create Your Account"
                    : forgotStep === 1
                      ? "Forgot Password"
                      : forgotStep === 2
                        ? "Verify Reset Code"
                        : "Set New Password"}
              </h3>
              <p className="dark-gray subtitle" style={{ fontSize: "14px" }}>
                {authModalTab === "login"
                  ? "Sign in to continue your stationery journey."
                  : authModalTab === "register"
                    ? "Join us to explore premium stationery and tools."
                    : forgotStep === 1
                      ? "Enter your email address to receive a verification code."
                      : forgotStep === 2
                        ? "Enter the 6-digit OTP code sent to your email."
                        : "Create a new strong password for your account."}
              </p>
            </div>

            {/* 1. LOGIN FORM */}
            {authModalTab === "login" && (
              <form onSubmit={handleLoginSubmit} noValidate>
                {/* Email Field */}
                <div className="auth-field-wrapper mb-3 position-relative">
                  <label
                    htmlFor="login-email"
                    className="form-label fw-600 medium-black mb-1"
                  >
                    Email Address
                  </label>
                  <div className="input-block">
                    <input
                      type="email"
                      id="login-email"
                      name="email"
                      className="form-control form-control-2"
                      placeholder="Enter your email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      disabled={isLoginSubmitting}
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
                </div>

                {/* Password Field */}
                <div className="auth-field-wrapper mb-2 position-relative">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <label
                      htmlFor="login-password"
                      className="form-label fw-600 medium-black mb-0"
                    >
                      Password
                    </label>
                    <button
                      type="button"
                      className="color-primary fs-13 fw-500 text-decoration-underline border-0 bg-transparent p-0"
                      onClick={() => setAuthModalTab("forgot")}
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="input-block">
                    <input
                      type={showLoginPassword ? "text" : "password"}
                      id="login-password"
                      name="password"
                      className="form-control form-control-2 pe-5"
                      placeholder="Enter your password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      disabled={isLoginSubmitting}
                      autoComplete="current-password"
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
                      onClick={() => setShowLoginPassword((prev) => !prev)}
                      aria-label={
                        showLoginPassword ? "Hide password" : "Show password"
                      }
                      tabIndex="-1"
                    >
                      <i
                        className={
                          showLoginPassword
                            ? "fa-regular fa-eye-slash"
                            : "fa-regular fa-eye"
                        }
                      ></i>
                    </button>
                  </div>
                </div>

                {/* Submit CTA */}
                <div className="mt-4">
                  <button
                    type="submit"
                    className="auth-btn-solid"
                    disabled={isLoginSubmitting}
                  >
                    {isLoginSubmitting ? (
                      <span>
                        <i className="fa-solid fa-spinner fa-spin me-2"></i>
                        Signing in...
                      </span>
                    ) : (
                      "Sign In"
                    )}
                  </button>
                </div>

                {/* Switch to Register */}
                <div className="text-center mt-3 pt-2">
                  <p className="fs-14 dark-gray mb-0">
                    Don't have an account?{" "}
                    <button
                      type="button"
                      className="color-primary fw-600 border-0 bg-transparent p-0 text-decoration-underline"
                      onClick={() => setAuthModalTab("register")}
                    >
                      Create an account
                    </button>
                  </p>
                </div>
              </form>
            )}

            {/* 2. REGISTER FORM */}
            {authModalTab === "register" && (
              <>
                {regStep === 1 ? (
                  <form onSubmit={handleRegisterSendOtp} noValidate>
                    {/* Full Name Field */}
                    <div className="auth-field-wrapper mb-3 position-relative">
                      <label
                        htmlFor="reg-name"
                        className="form-label fw-600 medium-black mb-1"
                      >
                        Full Name *
                      </label>
                      <div className="input-block">
                        <input
                          type="text"
                          id="reg-name"
                          name="fullName"
                          className="form-control form-control-2"
                          placeholder="Enter your full name"
                          value={regFullName}
                          onChange={(e) => setRegFullName(e.target.value)}
                          disabled={isRegSubmitting}
                          autoComplete="name"
                        />
                        {/* User Icon */}
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#141516"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                      </div>
                    </div>

                    {/* Email Field */}
                    <div className="auth-field-wrapper mb-3 position-relative">
                      <label
                        htmlFor="reg-email"
                        className="form-label fw-600 medium-black mb-1"
                      >
                        Email Address *
                      </label>
                      <div className="input-block">
                        <input
                          type="email"
                          id="reg-email"
                          name="email"
                          className="form-control form-control-2"
                          placeholder="Enter your email"
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          disabled={isRegSubmitting}
                          autoComplete="username"
                        />
                        {/* Mail Icon */}
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
                    </div>

                    {/* Password Field */}
                    <div className="auth-field-wrapper mb-3 position-relative">
                      <label
                        htmlFor="reg-password"
                        className="form-label fw-600 medium-black mb-1"
                      >
                        Password *
                      </label>
                      <div className="input-block">
                        <input
                          type={showRegPassword ? "text" : "password"}
                          id="reg-password"
                          name="password"
                          className="form-control form-control-2 pe-5"
                          placeholder="Minimum 8 characters"
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          disabled={isRegSubmitting}
                          autoComplete="new-password"
                        />
                        {/* Lock Icon */}
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
                          onClick={() => setShowRegPassword((prev) => !prev)}
                          tabIndex="-1"
                        >
                          <i
                            className={
                              showRegPassword
                                ? "fa-regular fa-eye-slash"
                                : "fa-regular fa-eye"
                            }
                          ></i>
                        </button>
                      </div>
                    </div>

                    {/* Confirm Password Field */}
                    <div className="auth-field-wrapper mb-3 position-relative">
                      <label
                        htmlFor="reg-confirm-password"
                        className="form-label fw-600 medium-black mb-1"
                      >
                        Confirm Password *
                      </label>
                      <div className="input-block">
                        <input
                          type={showRegConfirmPassword ? "text" : "password"}
                          id="reg-confirm-password"
                          name="confirmPassword"
                          className="form-control form-control-2 pe-5"
                          placeholder="Repeat your password"
                          value={regConfirmPassword}
                          onChange={(e) =>
                            setRegConfirmPassword(e.target.value)
                          }
                          disabled={isRegSubmitting}
                          autoComplete="new-password"
                        />
                        {/* Lock Icon */}
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
                            setShowRegConfirmPassword((prev) => !prev)
                          }
                          tabIndex="-1"
                        >
                          <i
                            className={
                              showRegConfirmPassword
                                ? "fa-regular fa-eye-slash"
                                : "fa-regular fa-eye"
                            }
                          ></i>
                        </button>
                      </div>
                    </div>

                    {/* Terms */}
                    <div className="auth-field-wrapper mb-3 position-relative">
                      <div className="cus-checkBox d-flex align-items-center">
                        <input
                          type="checkbox"
                          id="reg-terms"
                          checked={agreeTerms}
                          onChange={(e) => setAgreeTerms(e.target.checked)}
                        />
                        <label
                          htmlFor="reg-terms"
                          className="light-gray fs-13 ms-2"
                          style={{ cursor: "pointer", userSelect: "none" }}
                        >
                          I agree to the{" "}
                          <a
                            href="#terms"
                            className="color-primary text-decoration-underline"
                            onClick={(e) => e.preventDefault()}
                          >
                            Terms
                          </a>{" "}
                          and{" "}
                          <a
                            href="#privacy"
                            className="color-primary text-decoration-underline"
                            onClick={(e) => e.preventDefault()}
                          >
                            Privacy Policy
                          </a>
                          .
                        </label>
                      </div>
                    </div>

                    {/* Submit CTA */}
                    <div className="mt-4">
                      <button
                        type="submit"
                        className="auth-btn-solid"
                        disabled={isRegSubmitting}
                      >
                        {isRegSubmitting ? (
                          <span>
                            <i className="fa-solid fa-spinner fa-spin me-2"></i>
                            Sending OTP...
                          </span>
                        ) : (
                          "Continue (Send OTP)"
                        )}
                      </button>
                    </div>

                    {/* Switch to Login */}
                    <div className="text-center mt-3 pt-2">
                      <p className="fs-14 dark-gray mb-0">
                        Already have an account?{" "}
                        <button
                          type="button"
                          className="color-primary fw-600 border-0 bg-transparent p-0 text-decoration-underline"
                          onClick={() => setAuthModalTab("login")}
                        >
                          Sign In
                        </button>
                      </p>
                    </div>
                  </form>
                ) : (
                  /* Step 2: OtpVerificationStep */
                  <OtpVerificationStep
                    email={regEmail}
                    otp={regOtp}
                    setOtp={setRegOtp}
                    onVerify={handleRegisterVerifyAndComplete}
                    onResend={handleRegisterResendOtp}
                    onBack={() => setRegStep(1)}
                    isVerifying={isVerifyingOtp}
                    isResending={isResendingOtp}
                    submitButtonText="Verify & Register"
                  />
                )}
              </>
            )}

            {/* 3. FORGOT PASSWORD FORM */}
            {authModalTab === "forgot" && (
              <>
                {forgotStep === 1 ? (
                  <form onSubmit={handleForgotSendOtp} noValidate>
                    {/* Email Field */}
                    <div className="auth-field-wrapper mb-3 position-relative">
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
                          name="email"
                          className="form-control form-control-2"
                          placeholder="Enter your registered email"
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                          disabled={isForgotSubmitting}
                          autoComplete="email"
                        />
                        {/* Mail Icon */}
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
                    </div>

                    {/* Submit CTA */}
                    <div className="mt-4">
                      <button
                        type="submit"
                        className="auth-btn-solid"
                        disabled={isForgotSubmitting}
                      >
                        {isForgotSubmitting ? (
                          <span>
                            <i className="fa-solid fa-spinner fa-spin me-2"></i>
                            Sending Reset Code...
                          </span>
                        ) : (
                          "Send Reset Code"
                        )}
                      </button>
                    </div>

                    {/* Back to Sign In */}
                    <div className="text-center mt-3 pt-2">
                      <button
                        type="button"
                        className="color-primary fw-600 border-0 bg-transparent p-0 fs-14 text-decoration-underline"
                        onClick={() => setAuthModalTab("login")}
                      >
                        <i className="fa-solid fa-arrow-left me-1"></i> Back to
                        Sign In
                      </button>
                    </div>
                  </form>
                ) : forgotStep === 2 ? (
                  /* Step 2: OtpVerificationStep with 5' (300s) expiry & 60s resend timer */
                  <OtpVerificationStep
                    email={forgotEmail}
                    otp={forgotOtp}
                    setOtp={setForgotOtp}
                    onVerify={handleForgotVerifyOtp}
                    onResend={handleForgotResendOtp}
                    onBack={() => setForgotStep(1)}
                    isVerifying={isForgotVerifying}
                    isResending={isForgotResending}
                    title="Reset Password Verification"
                    subtitle="We sent a reset verification code to"
                    submitButtonText="Next: Set New Password"
                  />
                ) : (
                  <form onSubmit={handleForgotResetPassword} noValidate>
                    {/* Notice bar */}
                    <div className="p-3 bg-light rounded-3 mb-3 fs-13 text-muted text-center border">
                      Verified for <strong>{forgotEmail}</strong>. Create your
                      new password below.
                    </div>

                    {/* New Password */}
                    <div className="auth-field-wrapper mb-3 position-relative">
                      <label
                        htmlFor="forgot-new-pass"
                        className="form-label fw-600 medium-black mb-1"
                      >
                        New Password *
                      </label>
                      <div className="input-block">
                        <input
                          type={showForgotNewPassword ? "text" : "password"}
                          id="forgot-new-pass"
                          name="newPassword"
                          className="form-control form-control-2 pe-5"
                          placeholder="Minimum 8 characters"
                          value={forgotNewPassword}
                          onChange={(e) => setForgotNewPassword(e.target.value)}
                          disabled={isForgotSubmitting}
                          autoComplete="new-password"
                        />
                        {/* Lock Icon */}
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
                            setShowForgotNewPassword((prev) => !prev)
                          }
                          tabIndex="-1"
                        >
                          <i
                            className={
                              showForgotNewPassword
                                ? "fa-regular fa-eye-slash"
                                : "fa-regular fa-eye"
                            }
                          ></i>
                        </button>
                      </div>
                    </div>

                    {/* Confirm New Password */}
                    <div className="auth-field-wrapper mb-3 position-relative">
                      <label
                        htmlFor="forgot-confirm-pass"
                        className="form-label fw-600 medium-black mb-1"
                      >
                        Confirm New Password *
                      </label>
                      <div className="input-block">
                        <input
                          type={showForgotConfirmPassword ? "text" : "password"}
                          id="forgot-confirm-pass"
                          name="confirmPassword"
                          className="form-control form-control-2 pe-5"
                          placeholder="Re-enter new password"
                          value={forgotConfirmPassword}
                          onChange={(e) =>
                            setForgotConfirmPassword(e.target.value)
                          }
                          disabled={isForgotSubmitting}
                          autoComplete="new-password"
                        />
                        {/* Lock Icon */}
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
                            setShowForgotConfirmPassword((prev) => !prev)
                          }
                          tabIndex="-1"
                        >
                          <i
                            className={
                              showForgotConfirmPassword
                                ? "fa-regular fa-eye-slash"
                                : "fa-regular fa-eye"
                            }
                          ></i>
                        </button>
                      </div>
                    </div>

                    {/* Submit CTA */}
                    <div className="mt-4">
                      <button
                        type="submit"
                        className="auth-btn-solid"
                        disabled={isForgotSubmitting}
                      >
                        {isForgotSubmitting ? (
                          <span>
                            <i className="fa-solid fa-spinner fa-spin me-2"></i>
                            Resetting Password...
                          </span>
                        ) : (
                          "Reset Password"
                        )}
                      </button>
                    </div>

                    {/* Back to Sign In */}
                    <div className="text-center mt-3 pt-2">
                      <button
                        type="button"
                        className="color-primary fw-600 border-0 bg-transparent p-0 fs-14 text-decoration-underline"
                        onClick={() => setAuthModalTab("login")}
                      >
                        <i className="fa-solid fa-arrow-left me-1"></i> Back to
                        Sign In
                      </button>
                    </div>
                  </form>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
