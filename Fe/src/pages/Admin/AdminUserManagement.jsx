import React, { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthTooltip from "../../components/auth/AuthTooltip";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import { useAuth } from "../../providers/AuthContext";
import adminUserService from "../../services/adminUserService";
import "../../styles/admin.css";

export const AdminUserManagement = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Filter & Pagination states
  const [keyword, setKeyword] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [sortBy, setSortBy] = useState("userId");
  const [sortDir, setSortDir] = useState("desc");

  // Data states
  const [users, setUsers] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

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
  const [addErrors, setAddErrors] = useState({});
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
  });
  const [editErrors, setEditErrors] = useState({});
  const [isEditing, setIsEditing] = useState(false);

  // 4. Lock/Unlock Confirm Dialog
  const [isConfirmStatusOpen, setIsConfirmStatusOpen] = useState(false);
  const [userToToggle, setUserToToggle] = useState(null);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);

  // Fetch users from API
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setApiError("");
    try {
      const response = await adminUserService.getUsers({
        page,
        size,
        sortBy,
        sortDir,
        keyword: keyword.trim() || undefined,
        status: statusFilter,
        role: roleFilter,
      });

      setUsers(response.content || []);
      setTotalPages(response.totalPages || 0);
      setTotalElements(response.totalElements || 0);
    } catch (err) {
      setApiError(
        err?.response?.data?.message ||
          err.message ||
          "Failed to load users list.",
      );
    } finally {
      setLoading(false);
    }
  }, [page, size, sortBy, sortDir, keyword, statusFilter, roleFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Handle search submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    setKeyword(searchInput);
  };

  // --- ADD USER LOGIC ---
  const validateAddForm = () => {
    const errs = {};
    if (!addForm.fullName.trim()) {
      errs.fullName = "Full name is required.";
    }
    if (!addForm.email.trim()) {
      errs.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(addForm.email.trim())) {
      errs.email = "Please enter a valid email address.";
    }
    if (
      addForm.phone.trim() &&
      !/^(\+84|0)[0-9]{9,10}$/.test(addForm.phone.trim())
    ) {
      errs.phone = "Invalid phone number (10 digits).";
    }
    setAddErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!validateAddForm()) return;

    setIsAdding(true);
    setApiError("");
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
      setSuccessMsg(
        "User created successfully! A secure password has been generated.",
      );
      setTimeout(() => setSuccessMsg(""), 5000);
      fetchUsers();
    } catch (err) {
      const msg =
        err?.response?.data?.message || err.message || "Failed to create user.";
      setAddErrors((prev) => ({ ...prev, email: msg }));
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
    });
    setEditErrors({});
    setIsEditModalOpen(true);
  };

  const validateEditForm = () => {
    const errs = {};
    if (!editForm.fullName.trim()) {
      errs.fullName = "Full name is required.";
    }
    if (
      editForm.phone.trim() &&
      !/^(\+84|0)[0-9]{9,10}$/.test(editForm.phone.trim())
    ) {
      errs.phone = "Invalid phone number (10 digits).";
    }
    setEditErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!validateEditForm()) return;

    setIsEditing(true);
    try {
      await adminUserService.updateUser(editForm.userId, {
        fullName: editForm.fullName.trim(),
        phone: editForm.phone.trim() || undefined,
        address: editForm.address.trim() || undefined,
        role: editForm.role,
      });

      setIsEditModalOpen(false);
      setSuccessMsg("User updated successfully!");
      setTimeout(() => setSuccessMsg(""), 4000);
      fetchUsers();
    } catch (err) {
      const msg =
        err?.response?.data?.message || err.message || "Failed to update user.";
      setEditErrors((prev) => ({ ...prev, fullName: msg }));
    } finally {
      setIsEditing(false);
    }
  };

  // --- TOGGLE STATUS (LOCK / UNLOCK) LOGIC ---
  const handleOpenToggleStatus = (targetUser) => {
    // Admin cannot lock own account
    if (
      user?.email === targetUser.email ||
      user?.userId === targetUser.userId
    ) {
      alert("You cannot lock your own administrator account.");
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
      setSuccessMsg("User status updated successfully!");
      setTimeout(() => setSuccessMsg(""), 4000);
      fetchUsers();
    } catch (err) {
      alert(
        err?.response?.data?.message ||
          err.message ||
          "Failed to toggle user status.",
      );
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
    <div className="admin-wrapper">
      {/* Sidebar Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark opacity-50 z-index-1030 d-lg-none"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* SIDEBAR */}
      <aside className={`admin-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="admin-sidebar-brand">
          <Link
            to="/"
            className="d-flex align-items-center gap-2 text-decoration-none"
          >
            <img
              src="/assets/media/logo.png"
              alt="Logo"
              style={{ maxHeight: "36px" }}
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
            <span className="fw-700 fs-18 text-white">Clinic Admin</span>
          </Link>
          <button
            type="button"
            className="btn-close btn-close-white d-lg-none"
            aria-label="Close"
            onClick={() => setSidebarOpen(false)}
          ></button>
        </div>

        <div className="py-2">
          <div className="admin-nav-group-title">MAIN MENU</div>
          <ul className="admin-nav-list">
            <li className="admin-nav-item">
              <Link to="/admin" className="admin-nav-link text-decoration-none">
                <i className="fa-solid fa-chart-pie"></i>
                <span>Overview Dashboard</span>
              </Link>
            </li>
            <li className="admin-nav-item">
              <Link
                to="/admin/users"
                className="admin-nav-link active text-decoration-none"
              >
                <i className="fa-solid fa-users-gear"></i>
                <span>User Management</span>
                <span className="admin-nav-badge bg-light text-dark">
                  {totalElements}
                </span>
              </Link>
            </li>
          </ul>

          <div className="admin-nav-group-title">QUICK LINKS</div>
          <ul className="admin-nav-list">
            <li className="admin-nav-item">
              <Link to="/" className="admin-nav-link text-decoration-none">
                <i className="fa-solid fa-store"></i>
                <span>Main Website</span>
              </Link>
            </li>
            <li className="admin-nav-item">
              <Link
                to="/profile"
                className="admin-nav-link text-decoration-none"
              >
                <i className="fa-regular fa-user"></i>
                <span>My Profile</span>
              </Link>
            </li>
          </ul>
        </div>
      </aside>

      {/* MAIN ADMIN CONTENT AREA */}
      <div className="admin-main">
        {/* TOP HEADER */}
        <header className="admin-topbar">
          <div className="d-flex align-items-center gap-3">
            <button
              type="button"
              className="btn btn-sm btn-light d-lg-none border"
              onClick={() => setSidebarOpen(true)}
            >
              <i className="fa-solid fa-bars"></i>
            </button>
            <h4 className="fw-700 mb-0 d-none d-sm-block medium-black">
              User Management
            </h4>
          </div>

          <div className="d-flex align-items-center gap-3">
            <div className="d-flex align-items-center gap-2">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center text-white fw-700"
                style={{
                  width: 36,
                  height: 36,
                  background: "#e9613f",
                  fontSize: 14,
                }}
              >
                {user?.fullName?.charAt(0) || "A"}
              </div>
              <div className="d-none d-md-block text-start">
                <div className="fw-600 fs-13 lh-1">
                  {user?.fullName || "Admin"}
                </div>
                <small className="text-muted fs-11">Administrator</small>
              </div>
            </div>

            <button
              type="button"
              className="btn btn-sm btn-outline-danger rounded-pill px-3"
              onClick={logout}
              title="Sign Out"
            >
              <i className="fa-solid fa-arrow-right-from-bracket me-1"></i>
              <span className="d-none d-sm-inline">Sign Out</span>
            </button>
          </div>
        </header>

        {/* CONTENT BODY */}
        <main className="admin-content p-4">
          {/* Success / Error alerts */}
          {successMsg && (
            <div className="alert alert-success py-3 px-4 br-10 mb-4 shadow-sm">
              <i className="fa-solid fa-circle-check me-2"></i>
              {successMsg}
            </div>
          )}
          {apiError && (
            <div className="alert alert-danger py-3 px-4 br-10 mb-4 shadow-sm">
              <i className="fa-solid fa-circle-exclamation me-2"></i>
              {apiError}
            </div>
          )}

          {/* TOOLBAR CARD */}
          <div className="admin-card mb-4">
            <div className="row g-3 align-items-center justify-content-between">
              {/* Search Form */}
              <div className="col-xl-4 col-lg-5 col-md-6">
                <form onSubmit={handleSearchSubmit} className="d-flex gap-2">
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0">
                      <i className="fa-solid fa-magnifying-glass text-muted"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control border-start-0 ps-0"
                      placeholder="Search by name or email..."
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn btn-dark bg-color-primary border-0 px-3 fw-600"
                  >
                    Search
                  </button>
                  {keyword && (
                    <button
                      type="button"
                      className="btn btn-light border"
                      onClick={() => {
                        setSearchInput("");
                        setKeyword("");
                        setPage(0);
                      }}
                      title="Clear search"
                    >
                      <i className="fa-solid fa-xmark"></i>
                    </button>
                  )}
                </form>
              </div>

              {/* Filters & Actions */}
              <div className="col-xl-8 col-lg-7 col-md-6 d-flex flex-wrap align-items-center justify-content-md-end gap-2">
                {/* Status Filter */}
                <select
                  className="form-select form-select-sm"
                  style={{ width: "135px" }}
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(0);
                  }}
                >
                  <option value="ALL">All Statuses</option>
                  <option value="ACTIVE">Active</option>
                  <option value="BLOCKED">Blocked</option>
                </select>

                {/* Role Filter */}
                <select
                  className="form-select form-select-sm"
                  style={{ width: "135px" }}
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
                  className="form-select form-select-sm"
                  style={{ width: "150px" }}
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

                {/* Add User Button */}
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
                    setAddErrors({});
                    setIsAddModalOpen(true);
                  }}
                >
                  <i className="fa-solid fa-user-plus"></i>
                  <span>Add New User</span>
                </button>
              </div>
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
                        <p className="mt-2 text-muted fs-14">
                          Loading users...
                        </p>
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
                                  background: isUserAdmin
                                    ? "#e9613f"
                                    : "#10b981",
                                  fontSize: 12,
                                }}
                              >
                                {u.fullName?.charAt(0) || "U"}
                              </div>
                              <div>
                                <span className="fw-600 d-block">
                                  {u.fullName}
                                </span>
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
                              className={`badge rounded-pill px-3 py-1 fs-12 ${
                                u.status === "ACTIVE"
                                  ? "bg-success text-white"
                                  : "bg-danger text-white"
                              }`}
                            >
                              {u.status}
                            </span>
                          </td>
                          <td className="text-muted fs-13">
                            {u.createdAt
                              ? new Date(u.createdAt).toLocaleDateString(
                                  "vi-VN",
                                )
                              : "—"}
                          </td>
                          <td className="text-end">
                            {/* View Detail */}
                            <button
                              type="button"
                              className="admin-action-icon-btn"
                              title="View User Details"
                              onClick={() => handleOpenDetail(u)}
                            >
                              <i className="fa-regular fa-eye"></i>
                            </button>

                            {/* Edit */}
                            <button
                              type="button"
                              className="admin-action-icon-btn"
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
            <div className="d-flex flex-wrap justify-content-between align-items-center mt-3 pt-3 border-top gap-2">
              <div className="d-flex align-items-center gap-3">
                <span className="text-muted fs-13">
                  Showing{" "}
                  <strong>
                    {totalElements === 0 ? 0 : page * size + 1} to{" "}
                    {Math.min((page + 1) * size, totalElements)}
                  </strong>{" "}
                  of <strong>{totalElements}</strong> users
                </span>

                <div className="d-flex align-items-center gap-1">
                  <label className="text-muted fs-13 mb-0">Show:</label>
                  <select
                    className="form-select form-select-sm"
                    style={{ width: "75px" }}
                    value={size}
                    onChange={(e) => {
                      setSize(Number(e.target.value));
                      setPage(0);
                    }}
                  >
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="20">20</option>
                    <option value="50">50</option>
                  </select>
                </div>
              </div>

              {totalPages > 1 && (
                <div className="btn-group btn-group-sm">
                  <button
                    type="button"
                    className="btn btn-light border"
                    disabled={page === 0}
                    onClick={() => setPage((p) => Math.max(p - 1, 0))}
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i)
                    .filter(
                      (i) =>
                        i === 0 ||
                        i === totalPages - 1 ||
                        Math.abs(i - page) <= 1,
                    )
                    .map((pageNum, idx, arr) => {
                      const prev = arr[idx - 1];
                      return (
                        <React.Fragment key={pageNum}>
                          {prev !== undefined && pageNum - prev > 1 && (
                            <button
                              type="button"
                              className="btn btn-light border disabled"
                            >
                              ...
                            </button>
                          )}
                          <button
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
                        </React.Fragment>
                      );
                    })}
                  <button
                    type="button"
                    className="btn btn-light border"
                    disabled={page >= totalPages - 1}
                    onClick={() =>
                      setPage((p) => Math.min(p + 1, totalPages - 1))
                    }
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        </main>
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
                <h4 className="fw-700 mb-0">User Details</h4>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setIsDetailModalOpen(false)}
                ></button>
              </div>

              <div className="d-flex align-items-center gap-3 mb-4 pb-3 border-bottom">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center text-white fw-700"
                  style={{
                    width: 56,
                    height: 56,
                    background: "#e9613f",
                    fontSize: 22,
                  }}
                >
                  {selectedUser.fullName?.charAt(0) || "U"}
                </div>
                <div>
                  <h5 className="fw-700 mb-0">{selectedUser.fullName}</h5>
                  <span className="text-muted fs-13">{selectedUser.email}</span>
                  <div className="mt-1">
                    <span className="badge bg-secondary me-2">
                      {selectedUser.role}
                    </span>
                    <span
                      className={`badge ${
                        selectedUser.status === "ACTIVE"
                          ? "bg-success"
                          : "bg-danger"
                      }`}
                    >
                      {selectedUser.status}
                    </span>
                  </div>
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
                <div className="auth-field-wrapper mb-3 position-relative">
                  <label className="form-label fw-600 mb-1">Full Name *</label>
                  <div className="input-block">
                    <input
                      type="text"
                      className={`form-control form-control-2 ${
                        addErrors.fullName ? "is-invalid-field" : ""
                      }`}
                      placeholder="e.g. Le Thi Lan"
                      value={addForm.fullName}
                      onChange={(e) => {
                        setAddForm((p) => ({ ...p, fullName: e.target.value }));
                        if (addErrors.fullName) {
                          setAddErrors((p) => ({ ...p, fullName: "" }));
                        }
                      }}
                      disabled={isAdding}
                    />
                  </div>
                  <AuthTooltip message={addErrors.fullName} position="top" />
                </div>

                <div className="auth-field-wrapper mb-3 position-relative">
                  <label className="form-label fw-600 mb-1">
                    Email Address *
                  </label>
                  <div className="input-block">
                    <input
                      type="email"
                      className={`form-control form-control-2 ${
                        addErrors.email ? "is-invalid-field" : ""
                      }`}
                      placeholder="user@example.com"
                      value={addForm.email}
                      onChange={(e) => {
                        setAddForm((p) => ({ ...p, email: e.target.value }));
                        if (addErrors.email) {
                          setAddErrors((p) => ({ ...p, email: "" }));
                        }
                      }}
                      disabled={isAdding}
                    />
                  </div>
                  <AuthTooltip message={addErrors.email} position="top" />
                </div>

                <div className="row">
                  <div className="col-sm-6 mb-3">
                    <div className="auth-field-wrapper position-relative">
                      <label className="form-label fw-600 mb-1">
                        Phone Number
                      </label>
                      <div className="input-block">
                        <input
                          type="tel"
                          className={`form-control form-control-2 ${
                            addErrors.phone ? "is-invalid-field" : ""
                          }`}
                          placeholder="0912345678"
                          value={addForm.phone}
                          onChange={(e) => {
                            setAddForm((p) => ({
                              ...p,
                              phone: e.target.value,
                            }));
                            if (addErrors.phone) {
                              setAddErrors((p) => ({ ...p, phone: "" }));
                            }
                          }}
                          disabled={isAdding}
                        />
                      </div>
                      <AuthTooltip message={addErrors.phone} position="top" />
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
                    className="cus-btn border-0"
                    disabled={isAdding}
                  >
                    <span className="btn-text">
                      {isAdding ? "Creating..." : "Create User"}
                    </span>
                    <span>{isAdding ? "Creating..." : "Create User"}</span>
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
                  </div>
                </div>

                {/* Full Name */}
                <div className="auth-field-wrapper mb-3 position-relative">
                  <label className="form-label fw-600 mb-1">Full Name *</label>
                  <div className="input-block">
                    <input
                      type="text"
                      className={`form-control form-control-2 ${
                        editErrors.fullName ? "is-invalid-field" : ""
                      }`}
                      value={editForm.fullName}
                      onChange={(e) => {
                        setEditForm((p) => ({
                          ...p,
                          fullName: e.target.value,
                        }));
                        if (editErrors.fullName) {
                          setEditErrors((p) => ({ ...p, fullName: "" }));
                        }
                      }}
                      disabled={isEditing}
                    />
                  </div>
                  <AuthTooltip message={editErrors.fullName} position="top" />
                </div>

                <div className="row">
                  <div className="col-sm-6 mb-3">
                    <div className="auth-field-wrapper position-relative">
                      <label className="form-label fw-600 mb-1">
                        Phone Number
                      </label>
                      <div className="input-block">
                        <input
                          type="tel"
                          className={`form-control form-control-2 ${
                            editErrors.phone ? "is-invalid-field" : ""
                          }`}
                          value={editForm.phone}
                          onChange={(e) => {
                            setEditForm((p) => ({
                              ...p,
                              phone: e.target.value,
                            }));
                            if (editErrors.phone) {
                              setEditErrors((p) => ({ ...p, phone: "" }));
                            }
                          }}
                          disabled={isEditing}
                        />
                      </div>
                      <AuthTooltip message={editErrors.phone} position="top" />
                    </div>
                  </div>

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
                </div>

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
                    className="cus-btn border-0"
                    disabled={isEditing}
                  >
                    <span className="btn-text">
                      {isEditing ? "Updating..." : "Save Changes"}
                    </span>
                    <span>{isEditing ? "Updating..." : "Save Changes"}</span>
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
