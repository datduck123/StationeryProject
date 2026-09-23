import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import OtpVerificationStep from "../../components/auth/OtpVerificationStep";
import TitleBanner from "../../components/shared/TitleBanner";
import { useToast } from "../../providers/ToastContext";
import authService from "../../services/authService";

export const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  // 1: Enter email, 2: Enter OTP, 3: Enter new password
  const [step, setStep] = useState(1);

  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const validateEmailStep = () => {
    if (!email.trim()) {
      showToast("Email address is required.", "error");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      showToast("Please enter a valid email address.", "error");
      return false;
    }
    return true;
  };

  const validatePasswordStep = () => {
    if (!newPassword) {
      showToast("New password is required.", "error");
      return false;
    }
    if (newPassword.length < 8) {
      showToast("Password must be at least 8 characters.", "error");
      return false;
    }
    if (!confirmNewPassword) {
      showToast("Confirm password is required.", "error");
      return false;
    }
    if (newPassword !== confirmNewPassword) {
      showToast("Passwords do not match.", "error");
      return false;
    }
    return true;
  };

  // Step 1: Send OTP to email
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!validateEmailStep()) return;

    setIsSubmitting(true);
    try {
      await authService.sendForgotPasswordOtp({ email: email.trim() });
      setIsSubmitting(false);
      setStep(2);
      showToast("Verification code has been sent to your email.", "success");
    } catch (err) {
      setIsSubmitting(false);
      showToast(
        err?.response?.data?.message ||
          err.message ||
          "Failed to send reset code. Please check your email.",
        "error",
      );
    }
  };

  // Resend OTP in Step 2
  const handleResendOtp = async () => {
    setIsResending(true);
    try {
      await authService.sendForgotPasswordOtp({ email: email.trim() });
      setIsResending(false);
      showToast("A new verification code has been resent.", "success");
    } catch (err) {
      setIsResending(false);
      showToast(
        err?.response?.data?.message ||
          err.message ||
          "Failed to resend OTP. Please wait before retrying.",
        "error",
      );
    }
  };

  // Step 2 -> Step 3: Validate OTP entered
  const handleOtpValidated = async () => {
    if (!otpCode || otpCode.length < 6) {
      showToast("Please enter all 6 digits of the OTP code.", "warning");
      return;
    }
    setIsSubmitting(true);
    try {
      await authService.verifyForgotPasswordOtp({
        email: email.trim(),
        otpCode: otpCode.trim(),
      });
      setIsSubmitting(false);
      setStep(3);
      showToast(
        "Code verified successfully! Now set your new password.",
        "success",
      );
    } catch (err) {
      setIsSubmitting(false);
      showToast(
        err?.response?.data?.message ||
          err.message ||
          "Invalid or expired OTP code.",
        "error",
      );
    }
  };

  // Step 3: Submit reset password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!validatePasswordStep()) return;

    setIsSubmitting(true);
    try {
      await authService.resetPassword({
        email: email.trim(),
        otpCode,
        newPassword,
      });

      setIsSubmitting(false);
      showToast(
        "Password reset successfully! Redirecting to Sign In in 2 seconds...",
        "success",
      );
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setIsSubmitting(false);
      showToast(
        err?.response?.data?.message ||
          err.message ||
          "Failed to reset password. Please check your OTP code.",
        "error",
      );
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
                            className="form-control form-control-2"
                            placeholder="name@example.com"
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

                      <button
                        type="submit"
                        className="auth-btn-solid"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <span>
                            <i className="fa-solid fa-spinner fa-spin me-2"></i>
                            Sending Code...
                          </span>
                        ) : (
                          "Send Verification Code"
                        )}
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
                    title="Reset Password Verification"
                    subtitle="Enter the 6-digit code sent to your email to continue"
                    email={email}
                    otp={otpCode}
                    setOtp={setOtpCode}
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
                            className="form-control form-control-2 pe-5"
                            placeholder="At least 8 characters"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
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
                            className="form-control form-control-2 pe-5"
                            placeholder="Repeat new password"
                            value={confirmNewPassword}
                            onChange={(e) =>
                              setConfirmNewPassword(e.target.value)
                            }
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
                      </div>

                      <button
                        type="submit"
                        className="auth-btn-solid"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <span>
                            <i className="fa-solid fa-spinner fa-spin me-2"></i>
                            Resetting Password...
                          </span>
                        ) : (
                          "Reset Password"
                        )}
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
