import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthTooltip from "../../components/auth/AuthTooltip";
import TitleBanner from "../../components/shared/TitleBanner";
import { useAuth } from "../../providers/AuthContext";

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");

  const validate = () => {
    const errs = {};
    if (!email.trim()) {
      errs.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = "Please enter a valid email address.";
    }
    if (!password) {
      errs.password = "Password is required.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const res = await login(email, password);
      setIsSubmitting(false);
      if (res.isAdmin) {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (err) {
      setIsSubmitting(false);
      setApiError(err.message || "Invalid email or password.");
    }
  };

  return (
    <>
      <TitleBanner title="Sign In" />

      <section className="login-section py-60">
        <div className="container-2">
          <div className="row justify-content-center">
            <div className="col-xl-5 col-lg-6 col-md-8 col-sm-10 col-12">
              <div className="auth-modal-card p-4 p-sm-5 bg-white br-20 border shadow-sm">
                {/* Logo */}
                <div className="text-center mb-3">
                  <Link to="/" className="d-inline-block">
                    <img
                      src="assets/media/logo.png"
                      alt="Clinic Logo"
                      style={{ maxHeight: "48px" }}
                    />
                  </Link>
                </div>

                {/* Title and Subtitle */}
                <div className="text-center mb-4">
                  <h3 className="medium-black fw-700 mb-2">Welcome Back</h3>
                  <p className="dark-gray subtitle fs-14">
                    Sign in to continue your care journey.
                  </p>
                </div>

                {apiError && (
                  <div className="alert alert-danger py-2 px-3 br-10 mb-3 text-center fs-14">
                    <i className="fa-solid fa-circle-exclamation me-2"></i>
                    {apiError}
                  </div>
                )}

                <form onSubmit={handleSubmit} noValidate>
                  {/* Email */}
                  <div className="auth-field-wrapper mb-3 position-relative">
                    <label
                      htmlFor="page-email"
                      className="form-label fw-600 medium-black mb-1"
                    >
                      Email Address
                    </label>
                    <div className="input-block">
                      <input
                        type="email"
                        id="page-email"
                        name="email"
                        className={`form-control form-control-2 ${
                          errors.email ? "is-invalid-field" : ""
                        }`}
                        placeholder="Enter your email"
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

                  {/* Password */}
                  <div className="auth-field-wrapper mb-2 position-relative">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <label
                        htmlFor="page-password"
                        className="form-label fw-600 medium-black mb-0"
                      >
                        Password
                      </label>
                      <a
                        href="#forgot"
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
                        type={showPassword ? "text" : "password"}
                        id="page-password"
                        name="password"
                        className={`form-control form-control-2 pe-5 ${
                          errors.password ? "is-invalid-field" : ""
                        }`}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (errors.password) {
                            setErrors((prev) => ({ ...prev, password: "" }));
                          }
                        }}
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
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
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
                    <AuthTooltip message={errors.password} position="top" />
                  </div>

                  {/* Primary CTA */}
                  <div className="mt-4">
                    <button
                      type="submit"
                      className="cus-btn w-100 text-center border-0"
                      disabled={isSubmitting}
                    >
                      <span className="btn-text">
                        {isSubmitting ? "Signing in..." : "Sign In"}
                      </span>
                      <span>{isSubmitting ? "Signing in..." : "Sign In"}</span>
                    </button>
                  </div>

                  {/* Register Switch Link */}
                  <div className="text-center mt-3 pt-2">
                    <p className="fs-14 dark-gray mb-0">
                      Don't have an account?{" "}
                      <Link
                        to="/register"
                        className="color-primary fw-600 text-decoration-underline"
                      >
                        Create an account
                      </Link>
                    </p>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default LoginPage;
