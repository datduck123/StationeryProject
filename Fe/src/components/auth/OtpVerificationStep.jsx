import { useEffect, useState } from "react";
import { useToast } from "../../providers/ToastContext";
import OtpSixBoxInput from "./OtpSixBoxInput";

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
  title = "Verify Your Email",
  subtitle = "We sent a 6-digit verification code to",
  submitButtonText = "Verify & Complete",
}) => {
  const { showToast } = useToast();

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
      showToast("Failed to send OTP. Please try again.", "warning");
    }
  };

  const handleOtpChange = (val) => {
    setOtp(val);
    if (otpError && setOtpError) {
      setOtpError("");
    }
  };

  const handleVerifySubmit = (e) => {
    e?.preventDefault();
    if (otp.length < 6) {
      showToast("Please enter all 6 digits of the OTP code.", "warning");
      return;
    }
    onVerify();
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
        <h4 className="fw-700 medium-black mb-1">{title}</h4>
        <p className="dark-gray fs-14 mb-2">{subtitle}</p>
        <div className="badge bg-light text-dark px-3 py-2 fs-14 rounded-pill border">
          <i className="fa-regular fa-envelope me-1 color-primary"></i>
          <strong>{email}</strong>
        </div>
      </div>

      <div className="auth-field-wrapper mb-3 position-relative">
        <label className="form-label fw-600 medium-black mb-1 text-center d-block">
          Enter 6-Digit OTP Code
        </label>
        <OtpSixBoxInput
          value={otp}
          onChange={handleOtpChange}
          disabled={isVerifying}
          autoFocus={true}
        />
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
          className="auth-btn-solid"
          onClick={handleVerifySubmit}
          disabled={isVerifying || otp.length < 6 || expiryTimer === 0}
        >
          {isVerifying ? (
            <span>
              <i className="fa-solid fa-spinner fa-spin me-2"></i>Verifying...
            </span>
          ) : (
            submitButtonText
          )}
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
