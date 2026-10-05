import React, { useCallback, useEffect, useState } from "react";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import { useAuth } from "../../providers/AuthContext";
import { useToast } from "../../providers/ToastContext";
import adminUserService from "../../services/adminUserService";
import "../../styles/admin.css";
import { validateAdminUserForm } from "../../utils/validation";

export const AdminUserManagement = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  // Filter & Pagination states
  const [keyword, setKeyword] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [sortBy, setSortBy] = useState("userId");
  const [sortDir, setSortDir] = useState("desc");

  // Data states
  const [users, setUsers] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);

  // User Statistics states (4 cards)
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    blockedUsers: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  // Modals state
  // 1. View Detail Modal
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // 2. Add User Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addForm, setAddForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    role: "CUSTOMER",
  });
  const [isAdding, setIsAdding] = useState(false);

  // 3. Edit User Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    userId: null,
    fullName: "",
    email: "",
    phone: "",
    address: "",
    role: "CUSTOMER",
    status: "ACTIVE",
  });
  const [isEditing, setIsEditing] = useState(false);

  // 4. Lock/Unlock Confirm Dialog
  const [isConfirmStatusOpen, setIsConfirmStatusOpen] = useState(false);
  const [userToToggle, setUserToToggle] = useState(null);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);

  // Live auto-search debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      setKeyword(searchInput.trim());
      setPage(0);
    }, 350);
    return () => clearTimeout(handler);
  }, [searchInput]);

  // Fetch users from API
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await adminUserService.getUsers({
        page,
        size,
        sortBy,
        sortDir,
        keyword: keyword || undefined,
        status: statusFilter,
        role: roleFilter,
      });

      setUsers(response.content || []);
      setTotalPages(response.totalPages || 0);
      setTotalElements(response.totalElements || 0);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err.message ||
        "Failed to load users list.";
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  }, [
    page,
    size,
    sortBy,
    sortDir,
    keyword,
    statusFilter,
    roleFilter,
    showToast,
  ]);

  // Fetch user statistics
  const fetchStats = useCallback(async () => {
    try {
      const data = await adminUserService.getUserStats();
      if (data) {
        setStats(data);
      }
    } catch (err) {
      console.error("Failed to load user stats:", err);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // --- ADD USER LOGIC ---
  const handleCreateUser = async (e) => {
    e.preventDefault();
    const result = validateAdminUserForm({
      fullName: addForm.fullName,
      email: addForm.email,
      phone: addForm.phone,
      isEdit: false,
    });
    if (!result.isValid) {
      showToast(result.error, "error");
      return;
    }

    setIsAdding(true);
    try {
      await adminUserService.createUser({
        fullName: addForm.fullName.trim(),
        email: addForm.email.trim(),
        phone: addForm.phone.trim() || undefined,
        address: addForm.address.trim() || undefined,
        role: addForm.role,
      });

      setIsAddModalOpen(false);
      setAddForm({
        fullName: "",
        email: "",
        phone: "",
        address: "",
        role: "CUSTOMER",
      });
      showToast(
        "User created successfully! A secure password has been generated.",
        "success",
      );
      fetchUsers();
      fetchStats();
    } catch (err) {
      const msg =
        err?.response?.data?.message || err.message || "Failed to create user.";
      showToast(msg, "error");
    } finally {
      setIsAdding(false);
    }
  };

  // --- EDIT USER LOGIC ---
  const handleOpenEdit = (targetUser) => {
    setEditForm({
      userId: targetUser.userId,
      fullName: targetUser.fullName || "",
      email: targetUser.email || "",
      phone: targetUser.phone || "",
      address: targetUser.address || "",
      role:
        targetUser.role === "ROLE_ADMIN" || targetUser.role === "ADMIN"
          ? "ADMIN"
          : "CUSTOMER",
      status: targetUser.status || "ACTIVE",
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    const result = validateAdminUserForm({
      fullName: editForm.fullName,
      phone: editForm.phone,
      isEdit: true,
    });
    if (!result.isValid) {
      showToast(result.error, "error");
      return;
    }

    setIsEditing(true);
    try {
      await adminUserService.updateUser(editForm.userId, {
        fullName: editForm.fullName.trim(),
        phone: editForm.phone.trim() || undefined,
        address: editForm.address.trim() || undefined,
        role: editForm.role,
        isAdmin: editForm.role === "ADMIN" ? 1 : 0,
        status: editForm.status,
      });

      setIsEditModalOpen(false);
      showToast("User updated successfully!", "success");
      fetchUsers();
      fetchStats();
    } catch (err) {
      const msg =
        err?.response?.data?.message || err.message || "Failed to update user.";
      showToast(msg, "error");
    } finally {
      setIsEditing(false);
    }
  };

  // --- TOGGLE STATUS (LOCK / UNLOCK) LOGIC ---
  const handleOpenToggleStatus = (targetUser) => {
    if (
      user?.email === targetUser.email ||
      user?.userId === targetUser.userId
    ) {
      showToast("You cannot lock your own administrator account.", "warning");
      return;
    }
    setUserToToggle(targetUser);
    setIsConfirmStatusOpen(true);
  };

  const handleConfirmToggleStatus = async () => {
    if (!userToToggle) return;
    setIsTogglingStatus(true);
    try {
      await adminUserService.toggleUserStatus(userToToggle.userId);
      setIsConfirmStatusOpen(false);
      setUserToToggle(null);
      showToast("User status updated successfully!", "success");
      fetchUsers();
      fetchStats();
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err.message ||
        "Failed to toggle user status.";
      showToast(msg, "error");
      setIsConfirmStatusOpen(false);
    } finally {
      setIsTogglingStatus(false);
    }
  };

  // --- VIEW DETAILS LOGIC ---
  const handleOpenDetail = async (targetUser) => {
    try {
      const fullData = await adminUserService.getUserById(targetUser.userId);
      setSelectedUser(fullData);
    } catch {
      setSelectedUser(targetUser);
    }
    setIsDetailModalOpen(true);
  };

  return (
    <div className="p-4">
      {/* Page Header */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
        <div>
          <h4 className="fw-700 medium-black mb-1">
            User & Customer Management
          </h4>
          <p className="text-muted fs-13 mb-0">
            View, search, filter, edit, and manage system accounts and customer
            profiles.
          </p>
        </div>
        <button
          type="button"
          className="admin-btn-primary"
          onClick={() => {
            setAddForm({
              fullName: "",
              email: "",
              phone: "",
              address: "",
              role: "CUSTOMER",
            });
            setIsAddModalOpen(true);
          }}
        >
          <i className="fa-solid fa-user-plus me-1"></i> Add New User
        </button>
      </div>

      {/* Top Banner Stats */}
      <div className="row g-3 mb-4">
        {/* Card 1: Total Users */}
        <div className="col-xl-3 col-sm-6">
          <div className="admin-stat-card p-3 bg-white rounded-3 border shadow-sm d-flex align-items-center justify-content-between">
            <div>
              <span className="text-muted fs-12 fw-600 text-uppercase">
                Total Users
              </span>
              <h3 className="mb-0 fw-700 mt-1">
                {statsLoading ? (
                  <span className="spinner-border spinner-border-sm text-secondary"></span>
                ) : (
                  stats.totalUsers.toLocaleString()
                )}
              </h3>
            </div>
            <div
              className="d-flex align-items-center justify-content-center rounded-3"
              style={{
                width: "48px",
                height: "48px",
                backgroundColor: "rgba(233, 97, 63, 0.12)",
                color: "#e9613f",
              }}
            >
              <i className="fa-solid fa-users fs-20"></i>
            </div>
          </div>
        </div>

        {/* Card 2: Active Users */}
        <div className="col-xl-3 col-sm-6">
          <div className="admin-stat-card p-3 bg-white rounded-3 border shadow-sm d-flex align-items-center justify-content-between">
            <div>
              <span className="text-muted fs-12 fw-600 text-uppercase">
                Active Users
              </span>
              <h3 className="mb-0 fw-700 mt-1 text-success">
                {statsLoading ? (
                  <span className="spinner-border spinner-border-sm text-secondary"></span>
                ) : (
                  stats.activeUsers.toLocaleString()
                )}
              </h3>
            </div>
            <div
              className="d-flex align-items-center justify-content-center rounded-3 bg-success-subtle text-success"
              style={{ width: "48px", height: "48px" }}
            >
              <i className="fa-solid fa-circle-check fs-20"></i>
            </div>
          </div>
        </div>

        {/* Card 3: Inactive Users */}
        <div className="col-xl-3 col-sm-6">
          <div className="admin-stat-card p-3 bg-white rounded-3 border shadow-sm d-flex align-items-center justify-content-between">
            <div>
              <span className="text-muted fs-12 fw-600 text-uppercase">
                Inactive Users
              </span>
              <h3 className="mb-0 fw-700 mt-1 text-secondary">
                {statsLoading ? (
                  <span className="spinner-border spinner-border-sm text-secondary"></span>
                ) : (
                  stats.inactiveUsers.toLocaleString()
                )}
              </h3>
            </div>
            <div
              className="d-flex align-items-center justify-content-center rounded-3 bg-light text-secondary"
              style={{ width: "48px", height: "48px" }}
            >
              <i className="fa-solid fa-pause fs-20"></i>
            </div>
          </div>
        </div>

        {/* Card 4: Blocked Users */}
        <div className="col-xl-3 col-sm-6">
          <div className="admin-stat-card p-3 bg-white rounded-3 border shadow-sm d-flex align-items-center justify-content-between">
            <div>
              <span className="text-muted fs-12 fw-600 text-uppercase">
                Blocked Users
              </span>
              <h3 className="mb-0 fw-700 mt-1 text-danger">
                {statsLoading ? (
                  <span className="spinner-border spinner-border-sm text-secondary"></span>
                ) : (
                  stats.blockedUsers.toLocaleString()
                )}
              </h3>
            </div>
            <div
              className="d-flex align-items-center justify-content-center rounded-3 bg-danger-subtle text-danger"
              style={{ width: "48px", height: "48px" }}
            >
              <i className="fa-solid fa-ban fs-20"></i>
            </div>
          </div>
        </div>
      </div>

      {/* TOOLBAR CARD */}
      <div className="admin-card mb-4">
        <div className="d-flex flex-wrap align-items-center gap-3">
          {/* Live Auto Search */}
          <div className="admin-search-box">
            <i className="fa-solid fa-magnifying-glass text-muted fs-13"></i>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput("")}
                title="Clear search"
              >
                <i className="fa-solid fa-xmark fs-13"></i>
              </button>
            )}
          </div>

          {/* Status Filter */}
          <select
            className="admin-select-sm"
            style={{ width: "140px" }}
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(0);
            }}
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="BLOCKED">Blocked</option>
          </select>

          {/* Role Filter */}
          <select
            className="admin-select-sm"
            style={{ width: "140px" }}
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(0);
            }}
          >
            <option value="ALL">All Roles</option>
            <option value="ADMIN">Admin</option>
            <option value="CUSTOMER">Customer</option>
          </select>

          {/* Sort dropdown */}
          <select
            className="admin-select-sm"
            style={{ width: "160px" }}
            value={`${sortBy}-${sortDir}`}
            onChange={(e) => {
              const [sb, sd] = e.target.value.split("-");
              setSortBy(sb);
              setSortDir(sd);
              setPage(0);
            }}
          >
            <option value="userId-desc">Newest First</option>
            <option value="userId-asc">Oldest First</option>
            <option value="fullName-asc">Name (A-Z)</option>
            <option value="fullName-desc">Name (Z-A)</option>
          </select>
        </div>
      </div>

      {/* USERS TABLE CARD */}
      <div className="admin-card">
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>USER ID</th>
                <th>FULL NAME</th>
                <th>EMAIL ADDRESS</th>
                <th>PHONE</th>
                <th>ROLE</th>
                <th>STATUS</th>
                <th>CREATED AT</th>
                <th className="text-end">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-5">
                    <div
                      className="spinner-border color-primary"
                      role="status"
                    ></div>
                    <p className="mt-2 text-muted fs-14">Loading users...</p>
                  </td>
                </tr>
              ) : users.length > 0 ? (
                users.map((u) => {
                  const isCurrentUser =
                    user?.email === u.email || user?.userId === u.userId;
                  const isUserAdmin =
                    u.role === "ROLE_ADMIN" || u.role === "ADMIN";

                  return (
                    <tr key={u.userId}>
                      <td>
                        <span className="fw-700 color-primary fs-13">
                          #{u.userId}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div
                            className="rounded-circle d-flex align-items-center justify-content-center text-white fw-700"
                            style={{
                              width: 34,
                              height: 34,
                              background: isUserAdmin ? "#e9613f" : "#10b981",
                              fontSize: 12,
                            }}
                          >
                            {u.fullName?.charAt(0) || "U"}
                          </div>
                          <div>
                            <span className="fw-600 d-block">{u.fullName}</span>
                            {isCurrentUser && (
                              <span className="badge bg-secondary rounded-pill fs-10">
                                You
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="text-muted fs-13">{u.email}</td>
                      <td className="fs-13">{u.phone || "—"}</td>
                      <td>
                        <span
                          className={`admin-badge ${
                            isUserAdmin
                              ? "user-role-admin"
                              : "user-role-patient"
                          }`}
                        >
                          {isUserAdmin ? "ADMIN" : "CUSTOMER"}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`admin-badge ${
                            u.status === "ACTIVE"
                              ? "user-status-active"
                              : u.status === "INACTIVE"
                                ? "bg-warning-subtle text-warning border border-warning"
                                : "user-status-blocked"
                          }`}
                        >
                          {u.status || "ACTIVE"}
                        </span>
                      </td>
                      <td className="text-muted fs-13">
                        {u.createdAt
                          ? new Date(u.createdAt).toLocaleDateString("vi-VN")
                          : "—"}
                      </td>
                      <td className="text-end">
                        {/* View Detail */}
                        <button
                          type="button"
                          className="admin-action-icon-btn me-1"
                          title="View Details"
                          onClick={() => handleOpenDetail(u)}
                        >
                          <i className="fa-regular fa-eye"></i>
                        </button>

                        {/* Edit */}
                        <button
                          type="button"
                          className="admin-action-icon-btn me-1"
                          title="Edit User"
                          onClick={() => handleOpenEdit(u)}
                        >
                          <i className="fa-regular fa-pen-to-square"></i>
                        </button>

                        {/* Lock / Unlock */}
                        <button
                          type="button"
                          className={`admin-action-icon-btn ${
                            u.status === "ACTIVE"
                              ? "text-danger"
                              : "text-success"
                          }`}
                          title={
                            isCurrentUser
                              ? "You cannot lock your own account"
                              : u.status === "ACTIVE"
                                ? "Lock Account"
                                : "Unlock Account"
                          }
                          disabled={isCurrentUser}
                          onClick={() => handleOpenToggleStatus(u)}
                        >
                          {u.status === "ACTIVE" ? (
                            <i className="fa-solid fa-lock"></i>
                          ) : (
                            <i className="fa-solid fa-lock-open"></i>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" className="text-center py-5 text-muted">
                    <i className="fa-solid fa-user-slash fa-2x mb-3 d-block text-muted"></i>
                    No users found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION BAR */}
        <div className="d-flex flex-wrap justify-content-between align-items-center mt-3 pt-3 gap-2">
          <span className="text-muted fs-13">
            Showing{" "}
            <strong>
              {totalElements === 0 ? 0 : page * size + 1} to{" "}
              {Math.min((page + 1) * size, totalElements)}
            </strong>{" "}
            of <strong>{totalElements}</strong> users
          </span>

          {totalPages > 1 && (
            <div className="btn-group btn-group-sm">
              <button
                type="button"
                className="btn btn-light border"
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(p - 1, 0))}
                title="Previous page"
              >
                &lt;
              </button>
              {Array.from({ length: totalPages }, (_, i) => i).map(
                (pageNum) => (
                  <button
                    key={pageNum}
                    type="button"
                    className={`btn ${
                      pageNum === page
                        ? "btn-dark bg-color-primary border-0 fw-700"
                        : "btn-light border"
                    }`}
                    onClick={() => setPage(pageNum)}
                  >
                    {pageNum + 1}
                  </button>
                ),
              )}
              <button
                type="button"
                className="btn btn-light border"
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => Math.min(p + 1, totalPages - 1))}
                title="Next page"
              >
                &gt;
              </button>
            </div>
          )}
        </div>
      </div>

      {/* --- 1. USER DETAILS MODAL --- */}
      {isDetailModalOpen && selectedUser && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{
            backgroundColor: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(2px)",
            zIndex: 1050,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsDetailModalOpen(false);
          }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div
              className="modal-content shadow-lg border-0 rounded-4 p-4"
              style={{ background: "#ffffff" }}
            >
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="fw-700 mb-0">User Profile Details</h4>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setIsDetailModalOpen(false)}
                ></button>
              </div>

              <div className="d-flex align-items-center gap-3 p-3 bg-light rounded-3 mb-3">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center text-white fw-700"
                  style={{
                    width: 50,
                    height: 50,
                    background:
                      selectedUser.role === "ROLE_ADMIN" ||
                      selectedUser.role === "ADMIN"
                        ? "#e9613f"
                        : "#10b981",
                    fontSize: 20,
                  }}
                >
                  {selectedUser.fullName?.charAt(0) || "U"}
                </div>
                <div>
                  <h5 className="mb-0 fw-700">{selectedUser.fullName}</h5>
                  <p className="text-muted fs-13 mb-0">{selectedUser.email}</p>
                </div>
                <div className="ms-auto d-flex flex-column align-items-end gap-1">
                  <span
                    className={`admin-badge ${
                      selectedUser.role === "ROLE_ADMIN" ||
                      selectedUser.role === "ADMIN"
                        ? "user-role-admin"
                        : "user-role-patient"
                    }`}
                  >
                    {selectedUser.role === "ROLE_ADMIN" ||
                    selectedUser.role === "ADMIN"
                      ? "ADMIN"
                      : "CUSTOMER"}
                  </span>
                  <span
                    className={`admin-badge ${
                      selectedUser.status === "ACTIVE"
                        ? "user-status-active"
                        : selectedUser.status === "INACTIVE"
                          ? "bg-warning-subtle text-warning border border-warning"
                          : "user-status-blocked"
                    }`}
                  >
                    {selectedUser.status}
                  </span>
                </div>
              </div>

              <div className="row g-3 fs-14">
                <div className="col-6">
                  <span className="text-muted d-block">User ID:</span>
                  <strong>#{selectedUser.userId}</strong>
                </div>
                <div className="col-6">
                  <span className="text-muted d-block">Phone:</span>
                  <strong>{selectedUser.phone || "Not provided"}</strong>
                </div>
                <div className="col-12">
                  <span className="text-muted d-block">Address:</span>
                  <strong>{selectedUser.address || "Not provided"}</strong>
                </div>
                <div className="col-6">
                  <span className="text-muted d-block">Created At:</span>
                  <span>
                    {selectedUser.createdAt
                      ? new Date(selectedUser.createdAt).toLocaleString("vi-VN")
                      : "—"}
                  </span>
                </div>
                <div className="col-6">
                  <span className="text-muted d-block">Last Updated:</span>
                  <span>
                    {selectedUser.updatedAt
                      ? new Date(selectedUser.updatedAt).toLocaleString("vi-VN")
                      : "—"}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-top text-end">
                <button
                  type="button"
                  className="btn btn-light rounded-pill px-4 fw-600 border"
                  onClick={() => setIsDetailModalOpen(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- 2. ADD USER MODAL --- */}
      {isAddModalOpen && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{
            backgroundColor: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(2px)",
            zIndex: 1050,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget && !isAdding) {
              setIsAddModalOpen(false);
            }
          }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div
              className="modal-content shadow-lg border-0 rounded-4 p-4"
              style={{ background: "#ffffff" }}
            >
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="fw-700 mb-0">Add New User</h4>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setIsAddModalOpen(false)}
                  disabled={isAdding}
                ></button>
              </div>

              <div className="alert alert-info py-2 px-3 fs-13 br-10 mb-3">
                <i className="fa-solid fa-circle-info me-1"></i>
                Password will be <strong>automatically generated</strong>{" "}
                securely by the system and sent to the user.
              </div>

              <form onSubmit={handleCreateUser} noValidate>
                {/* Full Name */}
                <div className="auth-field-wrapper mb-3 position-relative">
                  <label className="form-label fw-600 mb-1">Full Name *</label>
                  <div className="input-block">
                    <input
                      type="text"
                      className="form-control form-control-2"
                      placeholder="e.g. Le Thi Lan"
                      value={addForm.fullName}
                      onChange={(e) =>
                        setAddForm((p) => ({ ...p, fullName: e.target.value }))
                      }
                      disabled={isAdding}
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

                {/* Email Address */}
                <div className="auth-field-wrapper mb-3 position-relative">
                  <label className="form-label fw-600 mb-1">
                    Email Address *
                  </label>
                  <div className="input-block">
                    <input
                      type="email"
                      className="form-control form-control-2"
                      placeholder="user@example.com"
                      value={addForm.email}
                      onChange={(e) =>
                        setAddForm((p) => ({ ...p, email: e.target.value }))
                      }
                      disabled={isAdding}
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

                {/* Phone & Role */}
                <div className="row">
                  <div className="col-sm-6 mb-3">
                    <div className="auth-field-wrapper position-relative">
                      <label className="form-label fw-600 mb-1">
                        Phone Number
                      </label>
                      <div className="input-block">
                        <input
                          type="tel"
                          className="form-control form-control-2"
                          placeholder="0912345678"
                          value={addForm.phone}
                          onChange={(e) =>
                            setAddForm((p) => ({
                              ...p,
                              phone: e.target.value,
                            }))
                          }
                          disabled={isAdding}
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
                  </div>

                  <div className="col-sm-6 mb-3">
                    <label className="form-label fw-600 mb-1">Role *</label>
                    <select
                      className="form-select form-control-2"
                      value={addForm.role}
                      onChange={(e) =>
                        setAddForm((p) => ({ ...p, role: e.target.value }))
                      }
                      disabled={isAdding}
                    >
                      <option value="CUSTOMER">Customer</option>
                      <option value="ADMIN">Administrator</option>
                    </select>
                  </div>
                </div>

                {/* Address */}
                <div className="auth-field-wrapper mb-4 position-relative">
                  <label className="form-label fw-600 mb-1">Address</label>
                  <div className="input-block">
                    <input
                      type="text"
                      className="form-control form-control-2"
                      placeholder="Street, City"
                      value={addForm.address}
                      onChange={(e) =>
                        setAddForm((p) => ({ ...p, address: e.target.value }))
                      }
                      disabled={isAdding}
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
                    onClick={() => setIsAddModalOpen(false)}
                    disabled={isAdding}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="admin-btn-primary px-4"
                    disabled={isAdding}
                  >
                    {isAdding ? "Creating..." : "Create User"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* --- 3. EDIT USER MODAL --- */}
      {isEditModalOpen && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{
            backgroundColor: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(2px)",
            zIndex: 1050,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget && !isEditing) {
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
                <h4 className="fw-700 mb-0">Edit User</h4>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={isEditing}
                ></button>
              </div>

              <form onSubmit={handleUpdateUser} noValidate>
                {/* Email Read-only */}
                <div className="auth-field-wrapper mb-3 position-relative">
                  <label className="form-label fw-600 mb-1">
                    Email Address (Read-Only)
                  </label>
                  <div className="input-block">
                    <input
                      type="email"
                      className="form-control form-control-2 bg-light"
                      value={editForm.email}
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
                  <label className="form-label fw-600 mb-1">Full Name *</label>
                  <div className="input-block">
                    <input
                      type="text"
                      className="form-control form-control-2"
                      value={editForm.fullName}
                      onChange={(e) =>
                        setEditForm((p) => ({
                          ...p,
                          fullName: e.target.value,
                        }))
                      }
                      disabled={isEditing}
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
                  <label className="form-label fw-600 mb-1">Phone Number</label>
                  <div className="input-block">
                    <input
                      type="tel"
                      className="form-control form-control-2"
                      value={editForm.phone}
                      onChange={(e) =>
                        setEditForm((p) => ({
                          ...p,
                          phone: e.target.value,
                        }))
                      }
                      disabled={isEditing}
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

                {/* Role & Status */}
                <div className="row">
                  <div className="col-sm-6 mb-3">
                    <label className="form-label fw-600 mb-1">Role *</label>
                    <select
                      className="form-select form-control-2"
                      value={editForm.role}
                      onChange={(e) =>
                        setEditForm((p) => ({ ...p, role: e.target.value }))
                      }
                      disabled={isEditing}
                    >
                      <option value="CUSTOMER">Customer</option>
                      <option value="ADMIN">Administrator</option>
                    </select>
                  </div>

                  <div className="col-sm-6 mb-3">
                    <label className="form-label fw-600 mb-1">
                      Account Status *
                    </label>
                    <select
                      className="form-select form-control-2"
                      value={editForm.status}
                      onChange={(e) =>
                        setEditForm((p) => ({ ...p, status: e.target.value }))
                      }
                      disabled={isEditing}
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="INACTIVE">INACTIVE</option>
                      <option value="BLOCKED">BLOCKED</option>
                    </select>
                  </div>
                </div>

                {/* Address */}
                <div className="auth-field-wrapper mb-4 position-relative">
                  <label className="form-label fw-600 mb-1">Address</label>
                  <div className="input-block">
                    <input
                      type="text"
                      className="form-control form-control-2"
                      value={editForm.address}
                      onChange={(e) =>
                        setEditForm((p) => ({ ...p, address: e.target.value }))
                      }
                      disabled={isEditing}
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
                    disabled={isEditing}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="admin-btn-primary px-4"
                    disabled={isEditing}
                  >
                    {isEditing ? "Updating..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* --- 4. CONFIRM LOCK/UNLOCK DIALOG --- */}
      <ConfirmDialog
        isOpen={isConfirmStatusOpen}
        title={
          userToToggle?.status === "ACTIVE" ? "Lock Account" : "Unlock Account"
        }
        message={
          userToToggle?.status === "ACTIVE"
            ? `Are you sure you want to lock the account for "${userToToggle?.fullName}" (${userToToggle?.email})? They will no longer be able to log in.`
            : `Are you sure you want to unlock the account for "${userToToggle?.fullName}" (${userToToggle?.email})? They will be able to log in normally.`
        }
        confirmText={
          userToToggle?.status === "ACTIVE" ? "Lock Account" : "Unlock Account"
        }
        cancelText="Cancel"
        confirmVariant={
          userToToggle?.status === "ACTIVE" ? "danger" : "success"
        }
        isLoading={isTogglingStatus}
        onConfirm={handleConfirmToggleStatus}
        onCancel={() => {
          setIsConfirmStatusOpen(false);
          setUserToToggle(null);
        }}
      />
    </div>
  );
};

export default AdminUserManagement;
