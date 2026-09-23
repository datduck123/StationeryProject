import React, { useEffect, useState } from "react";
import { useAuth } from "../../providers/AuthContext";
import { useToast } from "../../providers/ToastContext";
import userService from "../../services/userService";

export const AdminProfileModal = ({ isOpen, onClose }) => {
  const { user, setUser } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState("info"); // 'info' | 'password'
  const [loading, setLoading] = useState(false);

  // Profile fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [isChangingPw, setIsChangingPw] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    setActiveTab("info");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");

    const loadProfile = async () => {
      setLoading(true);
      try {
        const data = await userService.getProfile();
        setFullName(data.fullName || user?.fullName || "");
        setEmail(data.email || user?.email || "");
        setPhone(data.phone || "");
        setAddress(data.address || "");
      } catch {
        setFullName(user?.fullName || "");
        setEmail(user?.email || "");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!fullName.trim()) {
      showToast("Full name is required.", "error");
      return;
    }
    if (fullName.trim().length < 2) {
      showToast("Full name must be at least 2 characters.", "error");
      return;
    }
    if (phone.trim() && !/^(\+84|0)[0-9]{9,10}$/.test(phone.trim())) {
      showToast("Please enter a valid phone number (10 digits).", "error");
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
    if (!currentPassword) {
      showToast("Current password is required.", "error");
      return;
    }
    if (!newPassword) {
      showToast("New password is required.", "error");
      return;
    }
    if (newPassword.length < 8) {
      showToast("New password must be at least 8 characters.", "error");
      return;
    }
    if (!confirmPassword) {
      showToast("Please confirm your new password.", "error");
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast("New password and confirm password do not match.", "error");
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
        style={{ maxWidth: "560px" }}
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
                  ROLE_ADMIN
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
              <div className="mb-3">
                <label className="form-label fw-600 fs-13 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  className="form-control form-control-sm bg-light"
                  value={email}
                  readOnly
                  disabled
                />
              </div>

              {/* Full Name */}
              <div className="mb-3">
                <label className="form-label fw-600 fs-13 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter full name"
                />
              </div>

              {/* Phone */}
              <div className="mb-3">
                <label className="form-label fw-600 fs-13 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  className="form-control form-control-sm"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 0912345678"
                />
              </div>

              {/* Address */}
              <div className="mb-4">
                <label className="form-label fw-600 fs-13 mb-1">Address</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street, City"
                />
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
              <div className="mb-3 position-relative">
                <label className="form-label fw-600 fs-13 mb-1">
                  Current Password *
                </label>
                <div className="position-relative">
                  <input
                    type={showCurrentPw ? "text" : "password"}
                    className="form-control form-control-sm pe-5"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    className="btn btn-link p-0 position-absolute text-muted"
                    style={{
                      right: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                    }}
                    onClick={() => setShowCurrentPw((p) => !p)}
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
              <div className="mb-3 position-relative">
                <label className="form-label fw-600 fs-13 mb-1">
                  New Password *
                </label>
                <div className="position-relative">
                  <input
                    type={showNewPw ? "text" : "password"}
                    className="form-control form-control-sm pe-5"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                  />
                  <button
                    type="button"
                    className="btn btn-link p-0 position-absolute text-muted"
                    style={{
                      right: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                    }}
                    onClick={() => setShowNewPw((p) => !p)}
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
              <div className="mb-4 position-relative">
                <label className="form-label fw-600 fs-13 mb-1">
                  Confirm New Password *
                </label>
                <div className="position-relative">
                  <input
                    type={showConfirmPw ? "text" : "password"}
                    className="form-control form-control-sm pe-5"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                  />
                  <button
                    type="button"
                    className="btn btn-link p-0 position-absolute text-muted"
                    style={{
                      right: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                    }}
                    onClick={() => setShowConfirmPw((p) => !p)}
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
