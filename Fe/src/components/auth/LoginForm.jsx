import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../providers/AuthContext";
import { useToast } from "../../providers/ToastContext";
import { validateLoginForm } from "../../utils/validation";

/**
 * Shared LoginForm component used across LoginPage and AuthModal.
 *
 * @param {Object} props
 * @param {string} [props.idPrefix="login"] - Prefix for form input IDs (e.g. "page" or "modal")
 * @param {string} [props.initialEmail=""] - Optional initial value for email input
 * @param {Function} [props.onSuccess] - Optional callback invoked after successful login
 * @param {Function} [props.onForgotPassword] - Optional callback; if omitted, links to /forgot-password
 * @param {Function} [props.onSwitchToRegister] - Optional callback; if omitted, links to /register
 */
export const LoginForm = ({
  idPrefix = "login",
  initialEmail = "",
  onSuccess,
  onForgotPassword,
  onSwitchToRegister,
}) => {
  const { login, openAuthModal } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialEmail) {
      setEmail(initialEmail);
    }
  }, [initialEmail]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = validateLoginForm({ email, password });
    if (!result.isValid) {
      showToast(result.error, "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await login(email, password);
      setIsSubmitting(false);
      showToast("Welcome back!", "success");

      if (onSuccess) {
        onSuccess(res);
      }

      if (res.isAdmin) {
        navigate("/admin/users");
      } else {
        navigate("/");
      }
    } catch (err) {
      setIsSubmitting(false);
      const msg = err.message || "Invalid email or password.";
      showToast(msg, "error");
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* Email Field */}
      <div className="auth-field-wrapper mb-3 position-relative">
        <label
          htmlFor={`${idPrefix}-email`}
          className="form-label fw-600 medium-black mb-1"
        >
          Email Address
        </label>
        <div className="input-block">
          <input
            type="email"
            id={`${idPrefix}-email`}
            name="email"
            className="form-control form-control-2"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
      </div>

      {/* Password Field */}
      <div className="auth-field-wrapper mb-2 position-relative">
        <div className="d-flex justify-content-between align-items-center mb-1">
          <label
            htmlFor={`${idPrefix}-password`}
            className="form-label fw-600 medium-black mb-0"
          >
            Password
          </label>
          {onForgotPassword ? (
            <button
              type="button"
              className="color-primary fs-13 fw-500 text-decoration-underline border-0 bg-transparent p-0"
              onClick={onForgotPassword}
            >
              Forgot password?
            </button>
          ) : (
            <Link
              to="/forgot-password"
              className="color-primary fs-13 fw-500 text-decoration-underline border-0 bg-transparent p-0"
            >
              Forgot password?
            </Link>
          )}
        </div>
        <div className="input-block">
          <input
            type={showPassword ? "text" : "password"}
            id={`${idPrefix}-password`}
            name="password"
            className="form-control form-control-2 pe-5"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isSubmitting}
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
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            tabIndex="-1"
          >
            <i
              className={
                showPassword ? "fa-regular fa-eye-slash" : "fa-regular fa-eye"
              }
            ></i>
          </button>
        </div>
      </div>

      {/* Primary CTA */}
      <div className="mt-4">
        <button
          type="submit"
          className="auth-btn-solid"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
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
            onClick={onSwitchToRegister || (() => openAuthModal("register"))}
          >
            Create an account
          </button>
        </p>
      </div>
    </form>
  );
};

export default LoginForm;

