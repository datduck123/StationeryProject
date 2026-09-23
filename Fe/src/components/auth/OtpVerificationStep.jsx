import { useEffect, useState } from "react";
import AuthTooltip from "./AuthTooltip";

export const OtpVerificationStep = ({
  email,
  otp,
  setOtp,
  otpError,
  setOtpError,
  onVerify,
  onResend,
  onBack,
  isVerifying = false,
  isResending = false,
  submitButtonText = "Verify & Complete",
}) => {
  // Expiry countdown: 5 minutes (300 seconds)
  const [expiryTimer, setExpiryTimer] = useState(300);
  // Resend cooldown: 60 seconds
  const [resendCooldown, setResendCooldown] = useState(60);

  useEffect(() => {
    const timer = setInterval(() => {
      setExpiryTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let cooldownTimer;
    if (resendCooldown > 0) {
      cooldownTimer = setInterval(() => {
        setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(cooldownTimer);
  }, [resendCooldown]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleResendClick = async () => {
    if (resendCooldown > 0 || isResending) return;
    try {
      await onResend();
      setResendCooldown(60);
      setExpiryTimer(300);
    } catch {
      // handled by parent
    }
  };

  const handleOtpChange = (e) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 6);
    setOtp(val);
    if (otpError && setOtpError) {
      setOtpError("");
    }
  };

  return (
    <div className="otp-step-container">
      <div className="text-center mb-4">
        <div
          className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
          style={{
            width: 64,
            height: 64,
            background: "#fff0eb",
            color: "#e9613f",
          }}
        >
          <i className="fa-solid fa-shield-halved fa-2xl"></i>
        </div>
        <h4 className="fw-700 medium-black mb-1">Verify Your Email</h4>
        <p className="dark-gray fs-14 mb-2">
          We sent a 6-digit verification code to
        </p>
        <div className="badge bg-light text-dark px-3 py-2 fs-14 rounded-pill border">
          <i className="fa-regular fa-envelope me-1 color-primary"></i>
          <strong>{email}</strong>
        </div>
      </div>

      <div className="auth-field-wrapper mb-3 position-relative">
        <label className="form-label fw-600 medium-black mb-1 text-center d-block">
          Enter 6-Digit OTP Code
        </label>
        <div className="input-block">
          <input
            type="text"
            className={`form-control form-control-2 text-center fs-20 fw-700 tracking-widest ${
              otpError ? "is-invalid-field" : ""
            }`}
            style={{ letterSpacing: "8px" }}
            placeholder="000000"
            maxLength="6"
            value={otp}
            onChange={handleOtpChange}
            disabled={isVerifying}
            autoFocus
          />
        </div>
        <AuthTooltip message={otpError} position="top" />
      </div>

      <div className="d-flex justify-content-between align-items-center mb-4 fs-13 text-muted">
        <span>
          <i className="fa-regular fa-clock me-1"></i>
          Expires in:{" "}
          <strong
            className={expiryTimer < 60 ? "text-danger" : "color-primary"}
          >
            {formatTime(expiryTimer)}
          </strong>
        </span>

        <button
          type="button"
          className="btn btn-link p-0 fs-13 text-decoration-none fw-600"
          style={{
            color: resendCooldown > 0 ? "#9ca3af" : "#e9613f",
            cursor: resendCooldown > 0 ? "not-allowed" : "pointer",
          }}
          onClick={handleResendClick}
          disabled={resendCooldown > 0 || isResending}
        >
          {isResending ? (
            "Sending..."
          ) : resendCooldown > 0 ? (
            `Resend OTP in ${resendCooldown}s`
          ) : (
            <span className="text-decoration-underline">Resend OTP</span>
          )}
        </button>
      </div>

      <div className="d-flex flex-column gap-2">
        <button
          type="button"
          className="cus-btn w-100 text-center border-0"
          onClick={onVerify}
          disabled={isVerifying || otp.length < 6 || expiryTimer === 0}
        >
          <span className="btn-text">
            {isVerifying ? "Verifying..." : submitButtonText}
          </span>
          <span>{isVerifying ? "Verifying..." : submitButtonText}</span>
        </button>

        {onBack && (
          <button
            type="button"
            className="btn btn-light w-100 py-2 rounded-pill fw-600 fs-14 border"
            onClick={onBack}
            disabled={isVerifying}
          >
            <i className="fa-solid fa-arrow-left me-1"></i> Change Information
          </button>
        )}
      </div>
    </div>
  );
};

export default OtpVerificationStep;
