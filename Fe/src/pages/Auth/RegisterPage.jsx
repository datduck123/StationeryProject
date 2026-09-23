import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthTooltip from "../../components/auth/AuthTooltip";
import OtpVerificationStep from "../../components/auth/OtpVerificationStep";
import TitleBanner from "../../components/shared/TitleBanner";
import authService from "../../services/authService";

export const RegisterPage = () => {
  const navigate = useNavigate();

  // Step 1: info form, Step 2: OTP verification
  const [step, setStep] = useState(1);

  // Form fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);

  // OTP field
  const [otpCode, setOtpCode] = useState("");
  const [otpError, setOtpError] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [apiError, setApiError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const validateStep1 = () => {
    const errs = {};
    if (!fullName.trim()) {
      errs.fullName = "Full name is required.";
    } else if (fullName.trim().length < 2) {
      errs.fullName = "Full name must be at least 2 characters.";
    }

    if (!email.trim()) {
      errs.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = "Please enter a valid email address.";
    }

    if (!password) {
      errs.password = "Password is required (minimum 8 characters).";
    } else if (password.length < 8) {
      errs.password = "Password must be at least 8 characters.";
    }

    if (!confirmPassword) {
      errs.confirmPassword = "Confirm password is required.";
    } else if (password !== confirmPassword) {
      errs.confirmPassword = "Passwords do not match.";
    }

    if (!agreeTerms) {
      errs.terms = "Please agree to the Terms of Service and Privacy Policy.";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setApiError("");
    setSuccessMsg("");
    if (!validateStep1()) return;

    setIsSubmitting(true);
    try {
      await authService.sendRegisterOtp({ email: email.trim() });
      setIsSubmitting(false);
      setStep(2);
    } catch (err) {
      setIsSubmitting(false);
      setApiError(
        err?.response?.data?.message ||
          err.message ||
          "Failed to send OTP. Please check your email.",
      );
    }
  };

  const handleResendOtp = async () => {
    setApiError("");
    setIsResending(true);
    try {
      await authService.sendRegisterOtp({ email: email.trim() });
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

  const handleVerifyAndRegister = async () => {
    if (!otpCode || otpCode.length < 6) {
      setOtpError("Please enter the 6-digit OTP code.");
      return;
    }

    setIsSubmitting(true);
    setOtpError("");
    setApiError("");

    try {
      await authService.verifyAndRegister({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        otpCode,
      });

      setIsSubmitting(false);
      setSuccessMsg(
        "Registration successful! Redirecting to Sign In in 2 seconds...",
      );
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setIsSubmitting(false);
      const msg =
        err?.response?.data?.message ||
        err.message ||
        "Invalid or expired OTP code.";
      setOtpError(msg);
    }
  };

  return (
    <>
      <TitleBanner title="Create Account" />

      <section className="register-section py-60">
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

                {step === 1 ? (
                  <>
                    <div className="text-center mb-4">
                      <h3 className="medium-black fw-700 mb-2">
                        Create Your Account
                      </h3>
                      <p className="dark-gray subtitle fs-14">
                        Step 1 of 2: Fill in your account information.
                      </p>
                    </div>

                    <form onSubmit={handleSendOtp} noValidate>
                      {/* Full Name */}
                      <div className="auth-field-wrapper mb-3 position-relative">
                        <label
                          htmlFor="page-reg-name"
                          className="form-label fw-600 medium-black mb-1"
                        >
                          Full Name *
                        </label>
                        <div className="input-block">
                          <input
                            type="text"
                            id="page-reg-name"
                            name="fullName"
                            className={`form-control form-control-2 ${
                              errors.fullName ? "is-invalid-field" : ""
                            }`}
                            placeholder="e.g. Nguyen Van A"
                            value={fullName}
                            onChange={(e) => {
                              setFullName(e.target.value);
                              if (errors.fullName) {
                                setErrors((prev) => ({
                                  ...prev,
                                  fullName: "",
                                }));
                              }
                            }}
                            disabled={isSubmitting}
                            autoComplete="name"
                          />
                        </div>
                        <AuthTooltip message={errors.fullName} position="top" />
                      </div>

                      {/* Email */}
                      <div className="auth-field-wrapper mb-3 position-relative">
                        <label
                          htmlFor="page-reg-email"
                          className="form-label fw-600 medium-black mb-1"
                        >
                          Email Address *
                        </label>
                        <div className="input-block">
                          <input
                            type="email"
                            id="page-reg-email"
                            name="email"
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
                        </div>
                        <AuthTooltip message={errors.email} position="top" />
                      </div>

                      {/* Password */}
                      <div className="auth-field-wrapper mb-3 position-relative">
                        <label
                          htmlFor="page-reg-password"
                          className="form-label fw-600 medium-black mb-1"
                        >
                          Password *
                        </label>
                        <div className="input-block">
                          <input
                            type={showPassword ? "text" : "password"}
                            id="page-reg-password"
                            name="password"
                            className={`form-control form-control-2 pe-5 ${
                              errors.password ? "is-invalid-field" : ""
                            }`}
                            placeholder="At least 8 characters"
                            value={password}
                            onChange={(e) => {
                              setPassword(e.target.value);
                              if (errors.password) {
                                setErrors((prev) => ({
                                  ...prev,
                                  password: "",
                                }));
                              }
                            }}
                            disabled={isSubmitting}
                            autoComplete="new-password"
                          />
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

                      {/* Confirm Password */}
                      <div className="auth-field-wrapper mb-3 position-relative">
                        <label
                          htmlFor="page-reg-confirm-password"
                          className="form-label fw-600 medium-black mb-1"
                        >
                          Confirm Password *
                        </label>
                        <div className="input-block">
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            id="page-reg-confirm-password"
                            name="confirmPassword"
                            className={`form-control form-control-2 pe-5 ${
                              errors.confirmPassword ? "is-invalid-field" : ""
                            }`}
                            placeholder="Repeat password"
                            value={confirmPassword}
                            onChange={(e) => {
                              setConfirmPassword(e.target.value);
                              if (errors.confirmPassword) {
                                setErrors((prev) => ({
                                  ...prev,
                                  confirmPassword: "",
                                }));
                              }
                            }}
                            disabled={isSubmitting}
                            autoComplete="new-password"
                          />
                          <button
                            type="button"
                            className="auth-password-toggle"
                            onClick={() =>
                              setShowConfirmPassword((prev) => !prev)
                            }
                            aria-label={
                              showConfirmPassword
                                ? "Hide password"
                                : "Show password"
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
                          message={errors.confirmPassword}
                          position="top"
                        />
                      </div>

                      {/* Terms */}
                      <div className="auth-field-wrapper mb-3 position-relative">
                        <div className="cus-checkBox d-flex align-items-center">
                          <input
                            type="checkbox"
                            id="page-reg-terms"
                            checked={agreeTerms}
                            onChange={(e) => {
                              setAgreeTerms(e.target.checked);
                              if (errors.terms) {
                                setErrors((prev) => ({ ...prev, terms: "" }));
                              }
                            }}
                          />
                          <label
                            htmlFor="page-reg-terms"
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
                        <AuthTooltip message={errors.terms} position="bottom" />
                      </div>

                      {/* Primary CTA */}
                      <div className="mt-4">
                        <button
                          type="submit"
                          className="cus-btn w-100 text-center border-0"
                          disabled={isSubmitting}
                        >
                          <span className="btn-text">
                            {isSubmitting
                              ? "Sending OTP..."
                              : "Continue (Send OTP)"}
                          </span>
                          <span>
                            {isSubmitting
                              ? "Sending OTP..."
                              : "Continue (Send OTP)"}
                          </span>
                        </button>
                      </div>

                      {/* Login Switch Link */}
                      <div className="text-center mt-3 pt-2">
                        <p className="fs-14 dark-gray mb-0">
                          Already have an account?{" "}
                          <Link
                            to="/login"
                            className="color-primary fw-600 text-decoration-underline"
                          >
                            Sign In
                          </Link>
                        </p>
                      </div>
                    </form>
                  </>
                ) : (
                  /* Step 2: OTP Verification */
                  <OtpVerificationStep
                    email={email}
                    otp={otpCode}
                    setOtp={setOtpCode}
                    otpError={otpError}
                    setOtpError={setOtpError}
                    onVerify={handleVerifyAndRegister}
                    onResend={handleResendOtp}
                    onBack={() => setStep(1)}
                    isVerifying={isSubmitting}
                    isResending={isResending}
                    submitButtonText="Verify & Register"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default RegisterPage;
