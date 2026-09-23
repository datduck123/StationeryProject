import { useEffect, useState } from "react";
import TitleBanner from "../../components/shared/TitleBanner";
import { useAuth } from "../../providers/AuthContext";
import { useToast } from "../../providers/ToastContext";
import userService from "../../services/userService";

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

  // Validation for Edit Profile
  const validateEditForm = () => {
    if (!editFullName.trim()) {
      showToast("Full name is required.", "error");
      return false;
    }
    if (editFullName.trim().length < 2) {
      showToast("Full name must be at least 2 characters.", "error");
      return false;
    }
    if (editPhone.trim() && !/^(\+84|0)[0-9]{9,10}$/.test(editPhone.trim())) {
      showToast("Please enter a valid phone number (10 digits).", "error");
      return false;
    }
    return true;
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!validateEditForm()) return;

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

  // Validation for Change Password
  const validatePwForm = () => {
    if (!currentPassword) {
      showToast("Current password is required.", "error");
      return false;
    }
    if (!newPassword) {
      showToast("New password is required.", "error");
      return false;
    }
    if (newPassword.length < 8) {
      showToast("Password must be at least 8 characters.", "error");
      return false;
    }
    if (!confirmPassword) {
      showToast("Confirm password is required.", "error");
      return false;
    }
    if (newPassword !== confirmPassword) {
      showToast("Passwords do not match.", "error");
      return false;
    }
    return true;
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!validatePwForm()) return;

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
            <div className="col-lg-8 col-md-10 col-12">
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

                      <div className="col-sm-6">
                        <label className="text-muted fs-13 d-block mb-1">
                          Member Since
                        </label>
                        <div className="fw-600 fs-15 text-dark">
                          {profile.createdAt
                            ? new Date(profile.createdAt).toLocaleDateString(
                                "vi-VN",
                              )
                            : "N/A"}
                        </div>
                      </div>

                      <div className="col-sm-6">
                        <label className="text-muted fs-13 d-block mb-1">
                          Last Updated
                        </label>
                        <div className="fw-600 fs-15 text-dark">
                          {profile.updatedAt
                            ? new Date(profile.updatedAt).toLocaleDateString(
                                "vi-VN",
                              )
                            : "N/A"}
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
          <div className="modal-dialog modal-dialog-centered">
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
                <div className="auth-field-wrapper mb-3 position-relative">
                  <label className="form-label fw-600 mb-1">Full Name *</label>
                  <div className="input-block">
                    <input
                      type="text"
                      className="form-control form-control-2"
                      value={editFullName}
                      onChange={(e) => setEditFullName(e.target.value)}
                      disabled={isSavingProfile}
                    />
                  </div>
                </div>

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
                  </div>
                </div>

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
          <div className="modal-dialog modal-dialog-centered">
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
                    <button
                      type="button"
                      className="auth-password-toggle"
                      onClick={() => setShowCurrentPw((p) => !p)}
                      tabIndex="-1"
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

                <div className="auth-field-wrapper mb-3 position-relative">
                  <label className="form-label fw-600 mb-1">
                    New Password *
                  </label>
                  <div className="input-block">
                    <input
                      type={showNewPw ? "text" : "password"}
                      className="form-control form-control-2 pe-5"
                      placeholder="At least 8 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      disabled={isChangingPw}
                    />
                    <button
                      type="button"
                      className="auth-password-toggle"
                      onClick={() => setShowNewPw((p) => !p)}
                      tabIndex="-1"
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
                    <button
                      type="button"
                      className="auth-password-toggle"
                      onClick={() => setShowConfirmPw((p) => !p)}
                      tabIndex="-1"
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
