import { useEffect, useState } from "react";
import { useAuth } from "../../providers/AuthContext";
import { useToast } from "../../providers/ToastContext";
import userService from "../../services/userService";
import {
  validateChangePasswordForm,
  validateProfileForm,
} from "../../utils/validation";

export const AdminProfileModal = ({ isOpen, onClose }) => {
  const { user, setUser } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState("info"); // 'info' | 'password'

  // Personal Info Form
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Change Password Form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [isChangingPw, setIsChangingPw] = useState(false);

  const [loading, setLoading] = useState(false);

  // Load latest profile from API when modal opens
  useEffect(() => {
    if (!isOpen) return;

    const loadProfile = async () => {
      setLoading(true);
      try {
        const data = await userService.getProfile();
        setFullName(data.fullName || "");
        setEmail(data.email || "");
        setPhone(data.phone || "");
        setAddress(data.address || "");
      } catch {
        if (user) {
          setFullName(user.fullName || "");
          setEmail(user.email || "");
        }
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    const result = validateProfileForm({
      fullName,
      phone,
      address,
    });
    if (!result.isValid) {
      showToast(result.error, "error");
      return;
    }

    setIsSavingProfile(true);
    try {
      const updated = await userService.updateProfile({
        fullName: fullName.trim(),
        phone: phone.trim() || undefined,
        address: address.trim() || undefined,
      });

      if (user) {
        const updatedUser = { ...user, fullName: updated.fullName };
        setUser(updatedUser);
        localStorage.setItem(
          "stationery_clinic_auth_user",
          JSON.stringify(updatedUser),
        );
      }

      showToast("Profile information updated successfully!", "success");
      onClose();
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err.message ||
        "Failed to update profile.";
      showToast(msg, "error");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    const result = validateChangePasswordForm({
      currentPassword,
      newPassword,
      confirmPassword,
    });
    if (!result.isValid) {
      showToast(result.error, "error");
      return;
    }

    setIsChangingPw(true);
    try {
      await userService.changePassword({
        currentPassword,
        newPassword,
      });
      showToast("Password changed successfully!", "success");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      onClose();
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err.message ||
        "Failed to change password. Please verify your current password.";
      showToast(msg, "error");
    } finally {
      setIsChangingPw(false);
    }
  };

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{
        backgroundColor: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(2px)",
        zIndex: 1060,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSavingProfile && !isChangingPw) {
          onClose();
        }
      }}
    >
      <div
        className="modal-dialog modal-dialog-centered"
        style={{ maxWidth: "600px", width: "95%" }}
      >
        <div
          className="modal-content shadow-lg border-0 rounded-4 p-4"
          style={{ background: "#ffffff" }}
        >
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div className="d-flex align-items-center gap-3">
              <div
                className="admin-avatar"
                style={{ width: "42px", height: "42px", fontSize: "16px" }}
              >
                {fullName ? fullName.charAt(0).toUpperCase() : "A"}
              </div>
              <div>
                <h5 className="fw-700 mb-0">Administrator Profile</h5>
                <span className="badge bg-danger-subtle text-danger fs-11">
                  ADMIN
                </span>
              </div>
            </div>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              disabled={isSavingProfile || isChangingPw}
            ></button>
          </div>

          {/* Navigation Tabs */}
          <div className="d-flex gap-2 border-bottom pb-2 mb-3">
            <button
              type="button"
              className={`btn btn-sm ${
                activeTab === "info"
                  ? "btn-dark bg-color-primary border-0 fw-600 text-white"
                  : "btn-light border text-muted"
              } rounded-pill px-3`}
              onClick={() => setActiveTab("info")}
            >
              <i className="fa-regular fa-user me-1"></i> Personal Info
            </button>
            <button
              type="button"
              className={`btn btn-sm ${
                activeTab === "password"
                  ? "btn-dark bg-color-primary border-0 fw-600 text-white"
                  : "btn-light border text-muted"
              } rounded-pill px-3`}
              onClick={() => setActiveTab("password")}
            >
              <i className="fa-solid fa-lock me-1"></i> Change Password
            </button>
          </div>

          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border color-primary" role="status"></div>
            </div>
          ) : activeTab === "info" ? (
            /* TAB 1: PERSONAL INFO */
            <form onSubmit={handleSaveProfile} noValidate>
              {/* Email (Read-only) */}
              <div className="auth-field-wrapper mb-3 position-relative">
                <label className="form-label fw-600 fs-13 mb-1">
                  Email Address
                </label>
                <div className="input-block">
                  <input
                    type="email"
                    className="form-control form-control-2 bg-light"
                    value={email}
                    readOnly
                    disabled
                  />
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#718096"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </div>
              </div>

              {/* Full Name */}
              <div className="auth-field-wrapper mb-3 position-relative">
                <label className="form-label fw-600 fs-13 mb-1">
                  Full Name *
                </label>
                <div className="input-block">
                  <input
                    type="text"
                    className="form-control form-control-2"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter full name"
                  />
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#718096"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
              </div>

              {/* Phone */}
              <div className="auth-field-wrapper mb-3 position-relative">
                <label className="form-label fw-600 fs-13 mb-1">
                  Phone Number
                </label>
                <div className="input-block">
                  <input
                    type="tel"
                    className="form-control form-control-2"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 0912345678"
                  />
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#718096"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </div>
              </div>

              {/* Address */}
              <div className="auth-field-wrapper mb-4 position-relative">
                <label className="form-label fw-600 fs-13 mb-1">Address</label>
                <div className="input-block">
                  <input
                    type="text"
                    className="form-control form-control-2"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Street, City"
                  />
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#718096"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
              </div>

              <div className="d-flex justify-content-end gap-2">
                <button
                  type="button"
                  className="btn btn-light btn-sm rounded-pill px-3 border"
                  onClick={onClose}
                  disabled={isSavingProfile}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-btn-primary btn-sm px-4"
                  disabled={isSavingProfile}
                >
                  {isSavingProfile ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          ) : (
            /* TAB 2: CHANGE PASSWORD */
            <form onSubmit={handleChangePassword} noValidate>
              {/* Current Password */}
              <div className="auth-field-wrapper mb-3 position-relative">
                <label className="form-label fw-600 fs-13 mb-1">
                  Current Password *
                </label>
                <div className="input-block">
                  <input
                    type={showCurrentPw ? "text" : "password"}
                    className="form-control form-control-2 pe-5"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
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
                    onClick={() => setShowCurrentPw((p) => !p)}
                    tabIndex="-1"
                    aria-label={
                      showCurrentPw
                        ? "Hide current password"
                        : "Show current password"
                    }
                  >
                    <i
                      className={
                        showCurrentPw
                          ? "fa-regular fa-eye-slash"
                          : "fa-regular fa-eye"
                      }
                    ></i>
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="auth-field-wrapper mb-3 position-relative">
                <label className="form-label fw-600 fs-13 mb-1">
                  New Password *
                </label>
                <div className="input-block">
                  <input
                    type={showNewPw ? "text" : "password"}
                    className="form-control form-control-2 pe-5"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="8-20 chars: uppercase, lowercase, digit, special (@#$!%*?&)"
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
                    onClick={() => setShowNewPw((p) => !p)}
                    tabIndex="-1"
                    aria-label={
                      showNewPw ? "Hide new password" : "Show new password"
                    }
                  >
                    <i
                      className={
                        showNewPw
                          ? "fa-regular fa-eye-slash"
                          : "fa-regular fa-eye"
                      }
                    ></i>
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div className="auth-field-wrapper mb-4 position-relative">
                <label className="form-label fw-600 fs-13 mb-1">
                  Confirm New Password *
                </label>
                <div className="input-block">
                  <input
                    type={showConfirmPw ? "text" : "password"}
                    className="form-control form-control-2 pe-5"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
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
                    onClick={() => setShowConfirmPw((p) => !p)}
                    tabIndex="-1"
                    aria-label={
                      showConfirmPw
                        ? "Hide confirm password"
                        : "Show confirm password"
                    }
                  >
                    <i
                      className={
                        showConfirmPw
                          ? "fa-regular fa-eye-slash"
                          : "fa-regular fa-eye"
                      }
                    ></i>
                  </button>
                </div>
              </div>

              <div className="d-flex justify-content-end gap-2">
                <button
                  type="button"
                  className="btn btn-light btn-sm rounded-pill px-3 border"
                  onClick={onClose}
                  disabled={isChangingPw}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-btn-primary btn-sm px-4"
                  disabled={isChangingPw}
                >
                  {isChangingPw ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminProfileModal;
