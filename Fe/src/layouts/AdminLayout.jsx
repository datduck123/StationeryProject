import React, { useEffect, useRef, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import AdminProfileModal from "../components/admin/AdminProfileModal";
import AuthModal from "../components/auth/AuthModal";
import { useAuth } from "../providers/AuthContext";
import "../styles/admin.css";

export const AdminLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Mobile sidebar open state
  const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);
  // Desktop sidebar collapsed state (compact mode with icons only)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  // Topbar profile dropdown state
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  // Admin Profile Modal state (stays within the dashboard)
  const [isAdminProfileOpen, setIsAdminProfileOpen] = useState(false);

  const profileRef = useRef(null);

  // Close mobile sidebar on route change
  useEffect(() => {
    setSidebarMobileOpen(false);
    setProfileDropdownOpen(false);
  }, [location.pathname]);

  // Click outside to close profile dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isActive = (path) => {
    if (path === "/admin") {
      return location.pathname === "/admin" || location.pathname === "/admin/";
    }
    return location.pathname.startsWith(path);
  };

  const getInitials = (name) => {
    if (!name) return "AD";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const handleToggleSidebar = () => {
    if (window.innerWidth < 992) {
      setSidebarMobileOpen((prev) => !prev);
    } else {
      setIsSidebarCollapsed((prev) => !prev);
    }
  };

  return (
    <div className="admin-layout">
      {/* Mobile backdrop */}
      {sidebarMobileOpen && (
        <div
          className="admin-sidebar-backdrop d-lg-none"
          onClick={() => setSidebarMobileOpen(false)}
        ></div>
      )}

      {/* ADMIN SIDEBAR */}
      <aside
        className={`admin-sidebar ${sidebarMobileOpen ? "open" : ""} ${
          isSidebarCollapsed ? "collapsed" : ""
        }`}
      >
        {/* Header / Shrunk Logo (No Station Admin Portal text) */}
        <div className="admin-sidebar-header">
          <Link
            to="/"
            className="admin-logo-link"
            style={{
              justifyContent: isSidebarCollapsed ? "center" : "flex-start",
              width: "100%",
              display: "flex",
              alignItems: "center",
            }}
          >
            <img
              src="/assets/media/logo.png"
              alt="Logo"
              style={{ maxHeight: "36px", width: "auto" }}
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          </Link>
          <button
            type="button"
            className="btn-close d-lg-none"
            aria-label="Close"
            onClick={() => setSidebarMobileOpen(false)}
          ></button>
        </div>

        {/* Navigation list */}
        <div className="py-3 flex-grow-1">
          <div className="admin-nav-group-title">MAIN MENU</div>
          <ul className="admin-nav-list">
            {/* 1. Dashboard */}
            <li className="admin-nav-item">
              <Link
                to="/admin"
                className={`admin-nav-link ${isActive("/admin") ? "active" : ""}`}
                title="Overview Dashboard"
              >
                <i className="fa-solid fa-chart-pie"></i>
                <span>Overview Dashboard</span>
              </Link>
            </li>

            {/* 2. User Management */}
            <li className="admin-nav-item">
              <Link
                to="/admin/users"
                className={`admin-nav-link ${isActive("/admin/users") ? "active" : ""}`}
                title="User Management"
              >
                <i className="fa-solid fa-users-gear"></i>
                <span>User Management</span>
              </Link>
            </li>

            {/* 3. Category Management */}
            <li className="admin-nav-item">
              <Link
                to="/admin/categories"
                className={`admin-nav-link ${
                  isActive("/admin/categories") ? "active" : ""
                }`}
                title="Category Management"
              >
                <i className="fa-solid fa-layer-group"></i>
                <span>Category Management</span>
              </Link>
            </li>

            {/* 4. Brand Management */}
            <li className="admin-nav-item">
              <Link
                to="/admin/brands"
                className={`admin-nav-link ${
                  isActive("/admin/brands") ? "active" : ""
                }`}
                title="Brand Management"
              >
                <i className="fa-solid fa-certificate"></i>
                <span>Brand Management</span>
              </Link>
            </li>
          </ul>

          <div className="admin-nav-group-title mt-3">QUICK LINKS</div>
          <ul className="admin-nav-list">
            <li className="admin-nav-item">
              <Link
                to="/shop"
                className="admin-nav-link"
                title="Product Catalog"
              >
                <i className="fa-solid fa-boxes-stacked"></i>
                <span>Product Catalog</span>
              </Link>
            </li>
            <li className="admin-nav-item">
              <Link to="/" className="admin-nav-link" title="Main Website">
                <i className="fa-solid fa-store"></i>
                <span>Main Website</span>
              </Link>
            </li>
            <li className="admin-nav-item">
              <button
                type="button"
                className="admin-nav-link"
                title="My Profile"
                onClick={() => setIsAdminProfileOpen(true)}
              >
                <i className="fa-regular fa-user"></i>
                <span>My Profile</span>
              </button>
            </li>
          </ul>
        </div>

        {/* Sidebar Footer (Only 1 single Sign Out button on the sidebar left bottom) */}
        <div className="admin-sidebar-footer">
          <button
            type="button"
            className="admin-btn-outline w-100 py-2 d-flex align-items-center justify-content-center gap-2 border rounded-3 bg-white text-muted"
            onClick={logout}
            style={{
              fontSize: "13px",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            title="Sign Out"
          >
            <i className="fa-solid fa-arrow-right-from-bracket text-danger"></i>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* MAIN ADMIN AREA */}
      <div
        className={`admin-main ${
          isSidebarCollapsed ? "sidebar-collapsed" : ""
        }`}
      >
        {/* Topbar Header */}
        <header className="admin-topbar">
          {/* Left: Hamburger toggle button + Admin Panel */}
          <div className="d-flex align-items-center gap-3">
            <button
              type="button"
              className="admin-action-btn"
              onClick={handleToggleSidebar}
              aria-label="Toggle Sidebar"
              title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <i className="fa-solid fa-bars"></i>
            </button>

            <h5 className="mb-0 fw-700 medium-black fs-18">Admin Panel</h5>
          </div>

          {/* Right: Only Bell icon + Username with role underneath & Profile dropdown */}
          <div className="d-flex align-items-center gap-3">
            {/* Notification Bell */}
            <button
              type="button"
              className="admin-action-btn position-relative"
              title="Notifications"
            >
              <i className="fa-regular fa-bell"></i>
              <span
                className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle"
                style={{ width: "8px", height: "8px" }}
              ></span>
            </button>

            {/* User Profile trigger with dropdown */}
            <div className="position-relative" ref={profileRef}>
              <button
                type="button"
                className="d-flex align-items-center gap-2 border-0 bg-transparent p-1 rounded-3"
                style={{ cursor: "pointer", textAlign: "left" }}
                onClick={() => setProfileDropdownOpen((prev) => !prev)}
                aria-expanded={profileDropdownOpen}
              >
                <div
                  className="admin-avatar"
                  style={{ width: "36px", height: "36px", fontSize: "13px" }}
                >
                  {getInitials(user?.fullName || "AD")}
                </div>
                <div className="d-flex flex-column" style={{ lineHeight: 1.2 }}>
                  <span className="fw-600 fs-13 medium-black">
                    {user?.fullName || "Administrator"}
                  </span>
                  <span className="fs-11 fw-500 text-muted">
                    {user?.role === "ROLE_ADMIN" || user?.role === "ADMIN"
                      ? "ADMIN"
                      : user?.role === "ROLE_CUSTOMER"
                        ? "CUSTOMER"
                        : user?.role || "USER"}
                  </span>
                </div>
                <i className="fa-solid fa-chevron-down fs-11 text-muted ms-1"></i>
              </button>

              {/* Profile Dropdown Menu */}
              {profileDropdownOpen && (
                <div
                  className="admin-profile-dropdown shadow-lg rounded-3 border bg-white position-absolute end-0 mt-2 py-2"
                  style={{ width: "210px", zIndex: 1100 }}
                >
                  <div className="px-3 py-2 border-bottom mb-1">
                    <div className="fw-600 fs-13 text-truncate">
                      {user?.fullName || "Administrator"}
                    </div>
                    <div className="fs-12 text-muted text-truncate">
                      {user?.email || "admin@stationery.com"}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="dropdown-item px-3 py-2 fs-13 d-flex align-items-center gap-2 border-0 bg-transparent text-dark w-100 text-start"
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      setIsAdminProfileOpen(true);
                    }}
                  >
                    <i className="fa-regular fa-user text-muted"></i> My Profile
                  </button>
                  <Link
                    to="/"
                    className="dropdown-item px-3 py-2 fs-13 d-flex align-items-center gap-2 text-decoration-none text-dark"
                    onClick={() => setProfileDropdownOpen(false)}
                  >
                    <i className="fa-solid fa-store text-muted"></i> Main
                    Website
                  </Link>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic Nested Content */}
        <main className="admin-content flex-grow-1">
          <Outlet />
        </main>
      </div>
      <AuthModal />
      <AdminProfileModal
        isOpen={isAdminProfileOpen}
        onClose={() => setIsAdminProfileOpen(false)}
      />
    </div>
  );
};

export default AdminLayout;
