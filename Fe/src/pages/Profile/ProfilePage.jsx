import { useEffect, useState } from "react";
import TitleBanner from "../../components/shared/TitleBanner";
import { useAuth } from "../../providers/AuthContext";
import { useToast } from "../../providers/ToastContext";
import userService from "../../services/userService";
import {
  validateChangePasswordForm,
  validateProfileForm,
} from "../../utils/validation";

export const ProfilePage = () => {
  const { user, setUser } = useAuth();
  const { showToast } = useToast();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Edit Profile modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFullName, setEditFullName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Change Password modal state
  const [isPwModalOpen, setIsPwModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [isChangingPw, setIsChangingPw] = useState(false);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const data = await userService.getProfile();
      setProfile(data);
      setEditFullName(data.fullName || "");
      setEditPhone(data.phone || "");
      setEditAddress(data.address || "");
    } catch (err) {
      showToast(
        err?.response?.data?.message ||
          err.message ||
          "Failed to load user profile.",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    const result = validateProfileForm({
      fullName: editFullName,
      phone: editPhone,
      address: editAddress,
    });
    if (!result.isValid) {
      showToast(result.error, "error");
      return;
    }

    setIsSavingProfile(true);
    try {
      const updated = await userService.updateProfile({
        fullName: editFullName.trim(),
        phone: editPhone.trim() || undefined,
        address: editAddress.trim() || undefined,
      });

      setProfile(updated);
      if (user) {
        const updatedUser = { ...user, fullName: updated.fullName };
        setUser(updatedUser);
        localStorage.setItem(
          "stationery_clinic_auth_user",
          JSON.stringify(updatedUser),
        );
      }

      setIsEditModalOpen(false);
      showToast("Profile updated successfully!", "success");
    } catch (err) {
      showToast(
        err?.response?.data?.message ||
          err.message ||
          "Failed to update profile.",
        "error",
      );
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

      setIsPwModalOpen(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      showToast("Password changed successfully!", "success");
    } catch (err) {
      showToast(
        err?.response?.data?.message ||
          err.message ||
          "Failed to change password. Please check your current password.",
        "error",
      );
    } finally {
      setIsChangingPw(false);
    }
  };

  return (
    <>
      <TitleBanner title="My Profile" />

      <section className="py-60 bg-light">
        <div className="container-2">
          <div className="row justify-content-center">
            <div className="col-lg-8 col-md-10 col-12 mb-5 mt-3">
              {loading ? (
                <div className="text-center py-5 bg-white br-20 border shadow-sm">
                  <div
                    className="spinner-border color-primary"
                    role="status"
                    style={{ width: "3rem", height: "3rem" }}
                  ></div>
                  <p className="mt-3 text-muted">Loading your profile...</p>
                </div>
              ) : profile ? (
                <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                  {/* Card Header with Avatar */}
                  <div
                    className="p-4 p-md-5 text-white position-relative"
                    style={{
                      background:
                        "linear-gradient(135deg, #1e1f20 0%, #374151 100%)",
                    }}
                  >
                    <div className="d-flex flex-wrap align-items-center gap-4">
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center text-white fw-700 shadow-sm"
                        style={{
                          width: 80,
                          height: 80,
                          background: "#e9613f",
                          fontSize: 32,
                        }}
                      >
                        {profile.fullName?.charAt(0) || "U"}
                      </div>
                      <div>
                        <h3 className="text-white fw-700 mb-1">
                          {profile.fullName}
                        </h3>
                        <p className="text-white-50 mb-2 fs-14">
                          <i className="fa-regular fa-envelope me-1"></i>
                          {profile.email}
                        </p>
                        <div className="d-flex gap-2">
                          <span
                            className={`badge px-3 py-2 rounded-pill fs-12 ${
                              profile.role === "ROLE_ADMIN" ||
                              profile.role === "ADMIN"
                                ? "bg-warning text-dark"
                                : "bg-primary"
                            }`}
                          >
                            {profile.role === "ROLE_ADMIN" ||
                            profile.role === "ADMIN"
                              ? "Administrator"
                              : "Customer"}
                          </span>
                          <span
                            className={`badge px-3 py-2 rounded-pill fs-12 ${
                              profile.status === "ACTIVE"
                                ? "bg-success text-white"
                                : "bg-danger text-white"
                            }`}
                          >
                            {profile.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Body - Details */}
                  <div className="card-body p-4 p-md-5 bg-white">
                    <h5 className="fw-700 mb-4 pb-2 border-bottom medium-black">
                      Account Details
                    </h5>

                    <div className="row g-4 mb-4">
                      <div className="col-sm-6">
                        <label className="text-muted fs-13 d-block mb-1">
                          Full Name
                        </label>
                        <div className="fw-600 fs-15 text-dark">
                          {profile.fullName}
                        </div>
                      </div>

                      <div className="col-sm-6">
                        <label className="text-muted fs-13 d-block mb-1">
                          Email Address
                        </label>
                        <div className="fw-600 fs-15 text-dark">
                          {profile.email}
                        </div>
                      </div>

                      <div className="col-sm-6">
                        <label className="text-muted fs-13 d-block mb-1">
                          Phone Number
                        </label>
                        <div className="fw-600 fs-15 text-dark">
                          {profile.phone || (
                            <span className="text-muted fst-italic">
                              Not provided
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="col-sm-6">
                        <label className="text-muted fs-13 d-block mb-1">
                          Address
                        </label>
                        <div className="fw-600 fs-15 text-dark">
                          {profile.address || (
                            <span className="text-muted fst-italic">
                              Not provided
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="d-flex flex-wrap gap-3 pt-3 border-top">
                      <button
                        type="button"
                        className="cus-btn border-0"
                        onClick={() => {
                          setEditFullName(profile.fullName || "");
                          setEditPhone(profile.phone || "");
                          setEditAddress(profile.address || "");
                          setIsEditModalOpen(true);
                        }}
                      >
                        <span className="btn-text">
                          <i className="fa-regular fa-pen-to-square me-1"></i>{" "}
                          Edit Profile
                        </span>
                        <span>
                          <i className="fa-regular fa-pen-to-square me-1"></i>{" "}
                          Edit Profile
                        </span>
                      </button>

                      <button
                        type="button"
                        className="btn btn-outline-dark px-4 py-2 rounded-pill fw-600 fs-14"
                        onClick={() => {
                          setCurrentPassword("");
                          setNewPassword("");
                          setConfirmPassword("");
                          setIsPwModalOpen(true);
                        }}
                      >
                        <i className="fa-solid fa-key me-1"></i> Change Password
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.55)",
            backdropFilter: "blur(2px)",
            zIndex: 1050,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget && !isSavingProfile) {
              setIsEditModalOpen(false);
            }
          }}
        >
          <div
            className="modal-dialog modal-dialog-centered"
            style={{ maxWidth: "480px", width: "95%" }}
          >
            <div
              className="modal-content shadow-lg border-0 rounded-4 p-4"
              style={{ background: "#ffffff" }}
            >
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="fw-700 mb-0">Edit Profile</h4>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={isSavingProfile}
                ></button>
              </div>

              <form onSubmit={handleSaveProfile} noValidate>
                {/* Full Name with User Icon */}
                <div className="auth-field-wrapper mb-3 position-relative">
                  <label className="form-label fw-600 mb-1">Full Name *</label>
                  <div className="input-block">
                    <input
                      type="text"
                      className="form-control form-control-2"
                      placeholder="Enter full name"
                      value={editFullName}
                      onChange={(e) => setEditFullName(e.target.value)}
                      disabled={isSavingProfile}
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

                {/* Phone Number with Phone Icon */}
                <div className="auth-field-wrapper mb-3 position-relative">
                  <label className="form-label fw-600 mb-1">Phone Number</label>
                  <div className="input-block">
                    <input
                      type="tel"
                      className="form-control form-control-2"
                      placeholder="0912345678"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      disabled={isSavingProfile}
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

                {/* Address with Location Icon */}
                <div className="auth-field-wrapper mb-4 position-relative">
                  <label className="form-label fw-600 mb-1">Address</label>
                  <div className="input-block">
                    <input
                      type="text"
                      className="form-control form-control-2"
                      placeholder="Street, City, Country"
                      value={editAddress}
                      onChange={(e) => setEditAddress(e.target.value)}
                      disabled={isSavingProfile}
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
                    className="btn btn-light rounded-pill px-4 fw-600 border"
                    onClick={() => setIsEditModalOpen(false)}
                    disabled={isSavingProfile}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="cus-btn border-0"
                    disabled={isSavingProfile}
                  >
                    <span className="btn-text">
                      {isSavingProfile ? "Saving..." : "Save Changes"}
                    </span>
                    <span>
                      {isSavingProfile ? "Saving..." : "Save Changes"}
                    </span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {isPwModalOpen && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.55)",
            backdropFilter: "blur(2px)",
            zIndex: 1050,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget && !isChangingPw) {
              setIsPwModalOpen(false);
            }
          }}
        >
          <div
            className="modal-dialog modal-dialog-centered"
            style={{ maxWidth: "480px", width: "95%" }}
          >
            <div
              className="modal-content shadow-lg border-0 rounded-4 p-4"
              style={{ background: "#ffffff" }}
            >
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="fw-700 mb-0">Change Password</h4>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setIsPwModalOpen(false)}
                  disabled={isChangingPw}
                ></button>
              </div>

              <form onSubmit={handleChangePassword} noValidate>
                {/* Current Password */}
                <div className="auth-field-wrapper mb-3 position-relative">
                  <label className="form-label fw-600 mb-1">
                    Current Password *
                  </label>
                  <div className="input-block">
                    <input
                      type={showCurrentPw ? "text" : "password"}
                      className="form-control form-control-2 pe-5"
                      placeholder="Enter current password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      disabled={isChangingPw}
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

                {/* New Password with Lock Icon */}
                <div className="auth-field-wrapper mb-3 position-relative">
                  <label className="form-label fw-600 mb-1">
                    New Password *
                  </label>
                  <div className="input-block">
                    <input
                      type={showNewPw ? "text" : "password"}
                      className="form-control form-control-2 pe-5"
                      placeholder="8-20 chars: uppercase, lowercase, digit, special (@#$!%*?&)"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      disabled={isChangingPw}
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

                {/* Confirm New Password with Lock Icon */}
                <div className="auth-field-wrapper mb-4 position-relative">
                  <label className="form-label fw-600 mb-1">
                    Confirm New Password *
                  </label>
                  <div className="input-block">
                    <input
                      type={showConfirmPw ? "text" : "password"}
                      className="form-control form-control-2 pe-5"
                      placeholder="Repeat new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={isChangingPw}
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
                    className="btn btn-light rounded-pill px-4 fw-600 border"
                    onClick={() => setIsPwModalOpen(false)}
                    disabled={isChangingPw}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="cus-btn border-0"
                    disabled={isChangingPw}
                  >
                    <span className="btn-text">
                      {isChangingPw ? "Changing..." : "Update Password"}
                    </span>
                    <span>
                      {isChangingPw ? "Changing..." : "Update Password"}
                    </span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProfilePage;
