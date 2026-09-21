import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../providers/AuthContext";
import AuthTooltip from "./AuthTooltip";

export const AuthModal = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalTab,
    setAuthModalTab,
    login,
    register,
  } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginErrors, setLoginErrors] = useState({});
  const [isLoginSubmitting, setIsLoginSubmitting] = useState(false);
  const [loginApiError, setLoginApiError] = useState("");

  // Register form state
  const [regFullName, setRegFullName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [regErrors, setRegErrors] = useState({});
  const [isRegSubmitting, setIsRegSubmitting] = useState(false);
  const [regSuccessMsg, setRegSuccessMsg] = useState("");
  const [regApiError, setRegApiError] = useState("");

  // Clear errors and messages when switching tabs or closing modal
  useEffect(() => {
    setLoginErrors({});
    setRegErrors({});
    setLoginApiError("");
    setRegApiError("");
    setRegSuccessMsg("");
  }, [authModalTab, isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  // Validation functions
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
    } else if (regFullName.trim().length > 100) {
      errors.fullName = "Full name must be under 100 characters.";
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
        navigate("/admin");
      }
    } catch (err) {
      setIsLoginSubmitting(false);
      setLoginApiError(
        err.message || "Login failed. Please verify your credentials.",
      );
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegApiError("");
    setRegSuccessMsg("");
    if (!validateRegisterForm()) return;

    setIsRegSubmitting(true);
    try {
      await register({
        fullName: regFullName,
        email: regEmail,
        password: regPassword,
      });
      setIsRegSubmitting(false);
      setRegSuccessMsg("Account created successfully! Please sign in.");
      // Pre-fill login email and switch to login tab after a short delay
      setLoginEmail(regEmail);
      setRegFullName("");
      setRegPassword("");
      setRegConfirmPassword("");
      setAgreeTerms(false);
      setTimeout(() => {
        setAuthModalTab("login");
      }, 1200);
    } catch (err) {
      setIsRegSubmitting(false);
      setRegApiError(err.message || "Registration failed. Please try again.");
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
        style={{ maxWidth: "480px", margin: "1.75rem auto" }}
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
                  src="assets/media/logo.png"
                  alt="Clinic Logo"
                  style={{ maxHeight: "46px" }}
                />
              </Link>
            </div>

            {/* Header Titles */}
            <div className="text-center mb-4">
              <h3 className="medium-black fw-700 mb-2">
                {authModalTab === "login"
                  ? "Welcome Back"
                  : "Create Your Account"}
              </h3>
              <p className="dark-gray subtitle" style={{ fontSize: "14px" }}>
                {authModalTab === "login"
                  ? "Sign in to continue your care journey."
                  : "Start your personalized care journey with us."}
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
            {regSuccessMsg && (
              <div className="alert alert-success py-2 px-3 br-10 mb-3 text-center fs-14">
                <i className="fa-solid fa-circle-check me-2"></i>
                {regSuccessMsg}
              </div>
            )}

            {/* LOGIN FORM */}
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
                  {/* Tooltip Error */}
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
                    <a
                      href="#forgot-password"
                      className="color-primary fs-13 fw-500 text-decoration-underline"
                      onClick={(e) => {
                        e.preventDefault();
                        alert(
                          "Please contact clinic support to reset your password.",
                        );
                      }}
                    >
                      Forgot password?
                    </a>
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
                    {/* Show/Hide password toggle */}
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
                  {/* Tooltip Error */}
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

            {/* REGISTER FORM */}
            {authModalTab === "register" && (
              <form onSubmit={handleRegisterSubmit} noValidate>
                {/* Full Name Field */}
                <div className="auth-field-wrapper mb-3 position-relative">
                  <label
                    htmlFor="reg-name"
                    className="form-label fw-600 medium-black mb-1"
                  >
                    Full Name
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
                          setRegErrors((prev) => ({ ...prev, fullName: "" }));
                        }
                      }}
                      disabled={isRegSubmitting}
                      autoComplete="name"
                    />
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="19"
                      height="18"
                      viewBox="0 0 19 18"
                      fill="none"
                    >
                      <path
                        d="M9.71387 0C7.09687 0 4.96777 2.1291 4.96777 4.74609C4.96777 7.36309 7.09687 9.49219 9.71387 9.49219C12.3309 9.49219 14.46 7.36309 14.46 4.74609C14.46 2.1291 12.3309 0 9.71387 0ZM9.71387 8.4375C7.67843 8.4375 6.02246 6.78154 6.02246 4.74609C6.02246 2.71065 7.67843 1.05469 9.71387 1.05469C11.7493 1.05469 13.4053 2.71065 13.4053 4.74609C13.4053 6.78154 11.7493 8.4375 9.71387 8.4375Z"
                        fill="#1E1F20"
                      />
                      <path
                        d="M15.6189 12.5928C14.3195 11.2734 12.597 10.5469 10.7686 10.5469H8.65918C6.83077 10.5469 5.10819 11.2734 3.80881 12.5928C2.5158 13.9057 1.80371 15.6387 1.80371 17.4727C1.80371 17.7639 2.03982 18 2.33105 18H17.0967C17.3879 18 17.624 17.7639 17.624 17.4727C17.624 15.6387 16.9119 13.9057 15.6189 12.5928ZM2.8816 16.9453C3.1458 13.954 5.63613 11.6016 8.65918 11.6016H10.7686C13.7916 11.6016 16.2819 13.954 16.5461 16.9453H2.8816Z"
                        fill="#1E1F20"
                      />
                    </svg>
                  </div>
                  {/* Tooltip Error */}
                  <AuthTooltip message={regErrors.fullName} position="top" />
                </div>

                {/* Email Field */}
                <div className="auth-field-wrapper mb-3 position-relative">
                  <label
                    htmlFor="reg-email"
                    className="form-label fw-600 medium-black mb-1"
                  >
                    Email Address
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
                  {/* Tooltip Error */}
                  <AuthTooltip message={regErrors.email} position="top" />
                </div>

                {/* Password Field */}
                <div className="auth-field-wrapper mb-3 position-relative">
                  <label
                    htmlFor="reg-password"
                    className="form-label fw-600 medium-black mb-1"
                  >
                    Password
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
                          setRegErrors((prev) => ({ ...prev, password: "" }));
                        }
                      }}
                      disabled={isRegSubmitting}
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
                      onClick={() => setShowRegPassword((prev) => !prev)}
                      aria-label={
                        showRegPassword ? "Hide password" : "Show password"
                      }
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
                  {/* Tooltip Error */}
                  <AuthTooltip message={regErrors.password} position="top" />
                </div>

                {/* Confirm Password Field */}
                <div className="auth-field-wrapper mb-3 position-relative">
                  <label
                    htmlFor="reg-confirm-password"
                    className="form-label fw-600 medium-black mb-1"
                  >
                    Confirm Password
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
                      onClick={() => setShowRegConfirmPassword((prev) => !prev)}
                      aria-label={
                        showRegConfirmPassword
                          ? "Hide password"
                          : "Show password"
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
                  {/* Tooltip Error */}
                  <AuthTooltip
                    message={regErrors.confirmPassword}
                    position="top"
                  />
                </div>

                {/* Terms and Conditions Checkbox */}
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
                        Terms of Service
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
                  {/* Tooltip Error */}
                  <AuthTooltip message={regErrors.terms} position="bottom" />
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
                        ? "Creating account..."
                        : "Create Account"}
                    </span>
                    <span>
                      {isRegSubmitting
                        ? "Creating account..."
                        : "Create Account"}
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
