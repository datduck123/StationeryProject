import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../providers/AuthContext";
import authService from "../../services/authService";
import AuthTooltip from "./AuthTooltip";
import OtpVerificationStep from "./OtpVerificationStep";

export const AuthModal = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalTab,
    setAuthModalTab,
    login,
  } = useAuth();
  const navigate = useNavigate();

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginErrors, setLoginErrors] = useState({});
  const [isLoginSubmitting, setIsLoginSubmitting] = useState(false);
  const [loginApiError, setLoginApiError] = useState("");

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
  const [regOtpError, setRegOtpError] = useState("");
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isResendingOtp, setIsResendingOtp] = useState(false);

  const [regErrors, setRegErrors] = useState({});
  const [isRegSubmitting, setIsRegSubmitting] = useState(false);
  const [regSuccessMsg, setRegSuccessMsg] = useState("");
  const [regApiError, setRegApiError] = useState("");

  // Forgot Password state
  const [forgotStep, setForgotStep] = useState(1); // 1: Email, 2: OTP + New Password
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [forgotNewPassword, setForgotNewPassword] = useState("");
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState("");
  const [showForgotNewPassword, setShowForgotNewPassword] = useState(false);
  const [showForgotConfirmPassword, setShowForgotConfirmPassword] =
    useState(false);
  const [forgotErrors, setForgotErrors] = useState({});
  const [isForgotSubmitting, setIsForgotSubmitting] = useState(false);
  const [isForgotResending, setIsForgotResending] = useState(false);
  const [forgotApiError, setForgotApiError] = useState("");
  const [forgotSuccessMsg, setForgotSuccessMsg] = useState("");

  // Clear errors and messages when switching tabs or closing modal
  useEffect(() => {
    setLoginErrors({});
    setRegErrors({});
    setForgotErrors({});
    setLoginApiError("");
    setRegApiError("");
    setForgotApiError("");
    setRegSuccessMsg("");
    setForgotSuccessMsg("");
    setRegOtpError("");
    setRegStep(1);
    setForgotStep(1);
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
    const errors = {};
    if (!loginEmail.trim()) {
      errors.email = "Email is required.";
    } else if (!validateEmail(loginEmail)) {
      errors.email = "Please enter a valid email address.";
    }

    if (!loginPassword) {
      errors.password = "Password is required.";
    }

    setLoginErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateRegisterForm = () => {
    const errors = {};
    if (!regFullName.trim()) {
      errors.fullName = "Full name is required.";
    } else if (regFullName.trim().length < 2) {
      errors.fullName = "Full name must be at least 2 characters.";
    }

    if (!regEmail.trim()) {
      errors.email = "Email is required.";
    } else if (!validateEmail(regEmail)) {
      errors.email = "Please enter a valid email address.";
    }

    if (!regPassword) {
      errors.password = "Password must be at least 8 characters.";
    } else if (regPassword.length < 8) {
      errors.password = "Password must be at least 8 characters.";
    }

    if (!regConfirmPassword) {
      errors.confirmPassword = "Confirm password is required.";
    } else if (regPassword !== regConfirmPassword) {
      errors.confirmPassword = "Passwords do not match.";
    }

    if (!agreeTerms) {
      errors.terms = "Please agree to the Terms of Service and Privacy Policy.";
    }

    setRegErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateForgotEmail = () => {
    const errs = {};
    if (!forgotEmail.trim()) {
      errs.email = "Email address is required.";
    } else if (!validateEmail(forgotEmail.trim())) {
      errs.email = "Please enter a valid email address.";
    }
    setForgotErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateForgotReset = () => {
    const errs = {};
    if (!forgotOtp.trim() || forgotOtp.trim().length < 6) {
      errs.otp = "Please enter the 6-digit OTP code.";
    }
    if (!forgotNewPassword) {
      errs.newPassword = "New password is required.";
    } else if (forgotNewPassword.length < 8) {
      errs.newPassword = "Password must be at least 8 characters.";
    }
    if (!forgotConfirmPassword) {
      errs.confirmPassword = "Confirm password is required.";
    } else if (forgotNewPassword !== forgotConfirmPassword) {
      errs.confirmPassword = "Passwords do not match.";
    }
    setForgotErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Submit handlers
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginApiError("");
    if (!validateLoginForm()) return;

    setIsLoginSubmitting(true);
    try {
      const result = await login(loginEmail, loginPassword);
      setIsLoginSubmitting(false);
      closeAuthModal();

      if (result.isAdmin) {
        navigate("/admin/users");
      } else {
        navigate("/");
      }
    } catch (err) {
      setIsLoginSubmitting(false);
      setLoginApiError(
        err.message || "Login failed. Please verify your credentials.",
      );
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
    } catch (err) {
      setIsRegSubmitting(false);
      setRegApiError(
        err?.response?.data?.message ||
          err.message ||
          "Failed to send OTP. Please check your email.",
      );
    }
  };

  // Register Resend OTP
  const handleRegisterResendOtp = async () => {
    setIsResendingOtp(true);
    try {
      await authService.sendRegisterOtp({ email: regEmail.trim() });
      setIsResendingOtp(false);
    } catch (err) {
      setIsResendingOtp(false);
      setRegOtpError(
        err?.response?.data?.message ||
          err.message ||
          "Failed to resend OTP. Please wait before retrying.",
      );
    }
  };

  // Register Step 2: Verify & Register
  const handleRegisterVerifyAndComplete = async () => {
    if (!regOtp || regOtp.length < 6) {
      setRegOtpError("Please enter the 6-digit OTP code.");
      return;
    }

    setIsVerifyingOtp(true);
    setRegOtpError("");
    setRegApiError("");

    try {
      await authService.verifyAndRegister({
        fullName: regFullName.trim(),
        email: regEmail.trim(),
        password: regPassword,
        otpCode: regOtp,
      });

      setIsVerifyingOtp(false);
      setRegSuccessMsg(
        "Account registered successfully! Switching to sign in...",
      );
      setLoginEmail(regEmail);
      setTimeout(() => {
        setAuthModalTab("login");
        setRegStep(1);
      }, 1500);
    } catch (err) {
      setIsVerifyingOtp(false);
      const msg =
        err?.response?.data?.message ||
        err.message ||
        "Invalid or expired OTP code.";
      setRegOtpError(msg);
    }
  };

  // Forgot Password Step 1: Send OTP
  const handleForgotSendOtp = async (e) => {
    e?.preventDefault();
    setForgotApiError("");
    setForgotSuccessMsg("");
    if (!validateForgotEmail()) return;

    setIsForgotSubmitting(true);
    try {
      await authService.sendForgotPasswordOtp({ email: forgotEmail.trim() });
      setIsForgotSubmitting(false);
      setForgotStep(2);
      setForgotSuccessMsg("Reset code sent! Please check your email inbox.");
    } catch (err) {
      setIsForgotSubmitting(false);
      setForgotApiError(
        err?.response?.data?.message ||
          err.message ||
          "Failed to send reset code. Please check your email.",
      );
    }
  };

  // Forgot Password Resend OTP
  const handleForgotResendOtp = async () => {
    setIsForgotResending(true);
    setForgotApiError("");
    try {
      await authService.sendForgotPasswordOtp({ email: forgotEmail.trim() });
      setIsForgotResending(false);
      setForgotSuccessMsg("A new reset code has been resent to your email.");
    } catch (err) {
      setIsForgotResending(false);
      setForgotApiError(
        err?.response?.data?.message ||
          err.message ||
          "Failed to resend OTP. Please wait before retrying.",
      );
    }
  };

  // Forgot Password Step 2: Reset password
  const handleForgotResetPassword = async (e) => {
    e.preventDefault();
    setForgotApiError("");
    if (!validateForgotReset()) return;

    setIsForgotSubmitting(true);
    try {
      await authService.resetPassword({
        email: forgotEmail.trim(),
        otpCode: forgotOtp.trim(),
        newPassword: forgotNewPassword,
      });

      setIsForgotSubmitting(false);
      setForgotSuccessMsg(
        "Password reset successfully! Redirecting to Sign In...",
      );
      setLoginEmail(forgotEmail.trim());
      setTimeout(() => {
        setAuthModalTab("login");
        setForgotStep(1);
      }, 1500);
    } catch (err) {
      setIsForgotSubmitting(false);
      setForgotApiError(
        err?.response?.data?.message ||
          err.message ||
          "Failed to reset password. Please check your OTP code.",
      );
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
                    : "Reset Password"}
              </h3>
              <p className="dark-gray subtitle" style={{ fontSize: "14px" }}>
                {authModalTab === "login"
                  ? "Sign in to continue your stationery journey."
                  : authModalTab === "register"
                    ? "Join us to explore premium stationery and tools."
                    : forgotStep === 1
                      ? "Enter your email address to receive a verification code."
                      : "Enter your OTP code and create a new password."}
              </p>
            </div>

            {/* Global API Feedback */}
            {loginApiError && authModalTab === "login" && (
              <div className="alert alert-danger py-2 px-3 br-10 mb-3 text-center fs-14">
                <i className="fa-solid fa-circle-exclamation me-2"></i>
                {loginApiError}
              </div>
            )}
            {regApiError && authModalTab === "register" && (
              <div className="alert alert-danger py-2 px-3 br-10 mb-3 text-center fs-14">
                <i className="fa-solid fa-circle-exclamation me-2"></i>
                {regApiError}
              </div>
            )}
            {regSuccessMsg && authModalTab === "register" && (
              <div className="alert alert-success py-2 px-3 br-10 mb-3 text-center fs-14">
                <i className="fa-solid fa-circle-check me-2"></i>
                {regSuccessMsg}
              </div>
            )}
            {forgotApiError && authModalTab === "forgot" && (
              <div className="alert alert-danger py-2 px-3 br-10 mb-3 text-center fs-14">
                <i className="fa-solid fa-circle-exclamation me-2"></i>
                {forgotApiError}
              </div>
            )}
            {forgotSuccessMsg && authModalTab === "forgot" && (
              <div className="alert alert-success py-2 px-3 br-10 mb-3 text-center fs-14">
                <i className="fa-solid fa-circle-check me-2"></i>
                {forgotSuccessMsg}
              </div>
            )}

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
                      className={`form-control form-control-2 ${
                        loginErrors.email ? "is-invalid-field" : ""
                      }`}
                      placeholder="Enter your email"
                      value={loginEmail}
                      onChange={(e) => {
                        setLoginEmail(e.target.value);
                        if (loginErrors.email) {
                          setLoginErrors((prev) => ({ ...prev, email: "" }));
                        }
                      }}
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
                  <AuthTooltip message={loginErrors.email} position="top" />
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
                      className={`form-control form-control-2 pe-5 ${
                        loginErrors.password ? "is-invalid-field" : ""
                      }`}
                      placeholder="Enter your password"
                      value={loginPassword}
                      onChange={(e) => {
                        setLoginPassword(e.target.value);
                        if (loginErrors.password) {
                          setLoginErrors((prev) => ({ ...prev, password: "" }));
                        }
                      }}
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
                  <AuthTooltip message={loginErrors.password} position="top" />
                </div>

                {/* Submit CTA */}
                <div className="mt-4">
                  <button
                    type="submit"
                    className="cus-btn w-100 text-center border-0"
                    disabled={isLoginSubmitting}
                  >
                    <span className="btn-text">
                      {isLoginSubmitting ? "Signing in..." : "Sign In"}
                    </span>
                    <span>
                      {isLoginSubmitting ? "Signing in..." : "Sign In"}
                    </span>
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
                          className={`form-control form-control-2 ${
                            regErrors.fullName ? "is-invalid-field" : ""
                          }`}
                          placeholder="Enter your full name"
                          value={regFullName}
                          onChange={(e) => {
                            setRegFullName(e.target.value);
                            if (regErrors.fullName) {
                              setRegErrors((prev) => ({
                                ...prev,
                                fullName: "",
                              }));
                            }
                          }}
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
                      <AuthTooltip
                        message={regErrors.fullName}
                        position="top"
                      />
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
                          className={`form-control form-control-2 ${
                            regErrors.email ? "is-invalid-field" : ""
                          }`}
                          placeholder="Enter your email"
                          value={regEmail}
                          onChange={(e) => {
                            setRegEmail(e.target.value);
                            if (regErrors.email) {
                              setRegErrors((prev) => ({ ...prev, email: "" }));
                            }
                          }}
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
                      <AuthTooltip message={regErrors.email} position="top" />
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
                          className={`form-control form-control-2 pe-5 ${
                            regErrors.password ? "is-invalid-field" : ""
                          }`}
                          placeholder="Minimum 8 characters"
                          value={regPassword}
                          onChange={(e) => {
                            setRegPassword(e.target.value);
                            if (regErrors.password) {
                              setRegErrors((prev) => ({
                                ...prev,
                                password: "",
                              }));
                            }
                          }}
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
                      <AuthTooltip
                        message={regErrors.password}
                        position="top"
                      />
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
                          className={`form-control form-control-2 pe-5 ${
                            regErrors.confirmPassword ? "is-invalid-field" : ""
                          }`}
                          placeholder="Repeat your password"
                          value={regConfirmPassword}
                          onChange={(e) => {
                            setRegConfirmPassword(e.target.value);
                            if (regErrors.confirmPassword) {
                              setRegErrors((prev) => ({
                                ...prev,
                                confirmPassword: "",
                              }));
                            }
                          }}
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
                      <AuthTooltip
                        message={regErrors.confirmPassword}
                        position="top"
                      />
                    </div>

                    {/* Terms */}
                    <div className="auth-field-wrapper mb-3 position-relative">
                      <div className="cus-checkBox d-flex align-items-center">
                        <input
                          type="checkbox"
                          id="reg-terms"
                          checked={agreeTerms}
                          onChange={(e) => {
                            setAgreeTerms(e.target.checked);
                            if (regErrors.terms) {
                              setRegErrors((prev) => ({ ...prev, terms: "" }));
                            }
                          }}
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
                      <AuthTooltip
                        message={regErrors.terms}
                        position="bottom"
                      />
                    </div>

                    {/* Submit CTA */}
                    <div className="mt-4">
                      <button
                        type="submit"
                        className="cus-btn w-100 text-center border-0"
                        disabled={isRegSubmitting}
                      >
                        <span className="btn-text">
                          {isRegSubmitting
                            ? "Sending OTP..."
                            : "Continue (Send OTP)"}
                        </span>
                        <span>
                          {isRegSubmitting
                            ? "Sending OTP..."
                            : "Continue (Send OTP)"}
                        </span>
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
                    otpError={regOtpError}
                    setOtpError={setRegOtpError}
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
                          className={`form-control form-control-2 ${
                            forgotErrors.email ? "is-invalid-field" : ""
                          }`}
                          placeholder="Enter your registered email"
                          value={forgotEmail}
                          onChange={(e) => {
                            setForgotEmail(e.target.value);
                            if (forgotErrors.email) {
                              setForgotErrors((prev) => ({
                                ...prev,
                                email: "",
                              }));
                            }
                          }}
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
                      <AuthTooltip
                        message={forgotErrors.email}
                        position="top"
                      />
                    </div>

                    {/* Submit CTA */}
                    <div className="mt-4">
                      <button
                        type="submit"
                        className="cus-btn w-100 text-center border-0"
                        disabled={isForgotSubmitting}
                      >
                        <span className="btn-text">
                          {isForgotSubmitting
                            ? "Sending Reset Code..."
                            : "Send Reset Code"}
                        </span>
                        <span>
                          {isForgotSubmitting
                            ? "Sending Reset Code..."
                            : "Send Reset Code"}
                        </span>
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
                ) : (
                  <form onSubmit={handleForgotResetPassword} noValidate>
                    {/* Notice bar */}
                    <div className="p-3 bg-light rounded-3 mb-3 fs-13 text-muted text-center border">
                      Code sent to <strong>{forgotEmail}</strong>.{" "}
                      <button
                        type="button"
                        className="color-primary border-0 bg-transparent p-0 fs-13 text-decoration-underline ms-1"
                        onClick={() => setForgotStep(1)}
                      >
                        Change email
                      </button>
                    </div>

                    {/* OTP Code */}
                    <div className="auth-field-wrapper mb-3 position-relative">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <label
                          htmlFor="forgot-otp"
                          className="form-label fw-600 medium-black mb-0"
                        >
                          6-Digit OTP Code *
                        </label>
                        <button
                          type="button"
                          className="color-primary border-0 bg-transparent p-0 fs-12 text-decoration-underline"
                          onClick={handleForgotResendOtp}
                          disabled={isForgotResending}
                        >
                          {isForgotResending ? "Resending..." : "Resend Code"}
                        </button>
                      </div>
                      <div className="input-block">
                        <input
                          type="text"
                          id="forgot-otp"
                          name="otp"
                          maxLength="6"
                          className={`form-control form-control-2 text-center fw-700 ${
                            forgotErrors.otp ? "is-invalid-field" : ""
                          }`}
                          style={{ letterSpacing: "4px", fontSize: "16px" }}
                          placeholder="------"
                          value={forgotOtp}
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9]/g, "");
                            setForgotOtp(val);
                            if (forgotErrors.otp) {
                              setForgotErrors((prev) => ({
                                ...prev,
                                otp: "",
                              }));
                            }
                          }}
                          disabled={isForgotSubmitting}
                          autoComplete="one-time-code"
                        />
                        {/* Key Icon */}
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
                          <path d="M21 2l-2 2m-1.5 1.5L16 7m-1.5 1.5l-2 2M11 9l-7.5 7.5a2.121 2.121 0 0 0 3 3L14 12" />
                          <circle cx="18" cy="6" r="3" />
                        </svg>
                      </div>
                      <AuthTooltip message={forgotErrors.otp} position="top" />
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
                          className={`form-control form-control-2 pe-5 ${
                            forgotErrors.newPassword ? "is-invalid-field" : ""
                          }`}
                          placeholder="Minimum 8 characters"
                          value={forgotNewPassword}
                          onChange={(e) => {
                            setForgotNewPassword(e.target.value);
                            if (forgotErrors.newPassword) {
                              setForgotErrors((prev) => ({
                                ...prev,
                                newPassword: "",
                              }));
                            }
                          }}
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
                      <AuthTooltip
                        message={forgotErrors.newPassword}
                        position="top"
                      />
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
                          className={`form-control form-control-2 pe-5 ${
                            forgotErrors.confirmPassword
                              ? "is-invalid-field"
                              : ""
                          }`}
                          placeholder="Re-enter new password"
                          value={forgotConfirmPassword}
                          onChange={(e) => {
                            setForgotConfirmPassword(e.target.value);
                            if (forgotErrors.confirmPassword) {
                              setForgotErrors((prev) => ({
                                ...prev,
                                confirmPassword: "",
                              }));
                            }
                          }}
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
                      <AuthTooltip
                        message={forgotErrors.confirmPassword}
                        position="top"
                      />
                    </div>

                    {/* Submit CTA */}
                    <div className="mt-4">
                      <button
                        type="submit"
                        className="cus-btn w-100 text-center border-0"
                        disabled={isForgotSubmitting}
                      >
                        <span className="btn-text">
                          {isForgotSubmitting
                            ? "Resetting Password..."
                            : "Reset Password"}
                        </span>
                        <span>
                          {isForgotSubmitting
                            ? "Resetting Password..."
                            : "Reset Password"}
                        </span>
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
