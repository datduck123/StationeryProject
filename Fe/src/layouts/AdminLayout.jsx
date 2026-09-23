import React, { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import AuthModal from "../components/auth/AuthModal";
import { useAuth } from "../providers/AuthContext";
import "../styles/admin.css";

export const AdminLayout = () => {
  const { user, isAdmin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close mobile sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const isActive = (path) => {
    if (path === "/admin") {
      return location.pathname === "/admin" || location.pathname === "/admin/";
    }
    return location.pathname.startsWith(path);
  };

  // Determine current page title for breadcrumbs
  const getPageTitle = () => {
    if (location.pathname === "/admin" || location.pathname === "/admin/") {
      return "Overview Dashboard";
    }
    if (location.pathname.startsWith("/admin/users")) {
      return "User Management";
    }
    if (location.pathname.startsWith("/admin/categories")) {
      return "Category Management";
    }
    if (location.pathname.startsWith("/admin/brands")) {
      return "Brand Management";
    }
    return "Admin Portal";
  };

  const getInitials = (name) => {
    if (!name) return "AD";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <div className="admin-layout">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="admin-sidebar-backdrop d-lg-none"
          onClick={() => setSidebarOpen(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 1040,
          }}
        ></div>
      )}

      {/* ADMIN SIDEBAR */}
      <aside className={`admin-sidebar ${sidebarOpen ? "open" : ""}`}>
        {/* Header / Logo */}
        <div className="admin-sidebar-header">
          <Link to="/" className="admin-logo-link">
            <img
              src="/assets/media/logo.png"
              alt="Stationery Tales"
              className="admin-logo-img"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
            <div>
              <div
                className="fw-700 fs-15 medium-black"
                style={{ lineHeight: 1.2 }}
              >
                Stationery Admin
              </div>
              <span className="admin-badge-portal">PORTAL CMS</span>
            </div>
          </Link>
          <button
            type="button"
            className="btn-close d-lg-none"
            aria-label="Close"
            onClick={() => setSidebarOpen(false)}
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
              >
                <i className="fa-solid fa-certificate"></i>
                <span>Brand Management</span>
              </Link>
            </li>
          </ul>

          <div className="admin-nav-group-title mt-3">QUICK LINKS</div>
          <ul className="admin-nav-list">
            <li className="admin-nav-item">
              <Link to="/shop" className="admin-nav-link">
                <i className="fa-solid fa-boxes-stacked"></i>
                <span>Product Catalog</span>
              </Link>
            </li>
            <li className="admin-nav-item">
              <Link to="/" className="admin-nav-link">
                <i className="fa-solid fa-store"></i>
                <span>Main Website</span>
              </Link>
            </li>
            <li className="admin-nav-item">
              <Link to="/profile" className="admin-nav-link">
                <i className="fa-regular fa-user"></i>
                <span>My Profile</span>
              </Link>
            </li>
          </ul>
        </div>

        {/* Sidebar Footer (Admin Profile & Logout) */}
        <div className="admin-sidebar-footer">
          <div className="admin-user-card">
            <div className="admin-avatar">
              {getInitials(user?.fullName || "AD")}
            </div>
            <div className="admin-user-info">
              <div
                className="admin-user-name"
                title={user?.fullName || "Admin"}
              >
                {user?.fullName || "Administrator"}
              </div>
              <div className="admin-user-role">
                <span className="badge bg-danger-subtle text-danger fs-11">
                  ADMIN
                </span>
              </div>
            </div>
          </div>
          <button
            type="button"
            className="admin-btn-outline w-100 mt-2 py-2 d-flex align-items-center justify-content-center gap-2 border rounded-3 bg-white text-muted"
            onClick={logout}
            style={{
              fontSize: "13px",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            <i className="fa-solid fa-arrow-right-from-bracket text-danger"></i>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* MAIN ADMIN AREA */}
      <div className="admin-main">
        {/* Topbar Header */}
        <header className="admin-topbar">
          <div className="d-flex align-items-center gap-3">
            {/* Hamburger for mobile */}
            <button
              type="button"
              className="admin-action-btn d-lg-none"
              onClick={() => setSidebarOpen((prev) => !prev)}
              aria-label="Toggle Sidebar"
            >
              <i className="fa-solid fa-bars"></i>
            </button>

            {/* Breadcrumb / Title */}
            <div>
              <div className="fs-12 text-muted text-uppercase fw-600 letter-spacing-1">
                Admin Panel
              </div>
              <h5 className="mb-0 fw-700 medium-black fs-18">
                {getPageTitle()}
              </h5>
            </div>
          </div>

          {/* Topbar Actions */}
          <div className="admin-topbar-actions">
            <Link
              to="/"
              className="admin-action-btn text-decoration-none"
              title="Go to storefront"
            >
              <i className="fa-solid fa-store"></i>
            </Link>

            <Link
              to="/profile"
              className="admin-action-btn text-decoration-none"
              title="My Profile"
            >
              <i className="fa-regular fa-user"></i>
            </Link>

            <button
              type="button"
              className="admin-btn-primary ms-2 d-none d-sm-inline-flex"
              onClick={logout}
            >
              <i className="fa-solid fa-arrow-right-from-bracket me-1"></i> Sign
              Out
            </button>
          </div>
        </header>

        {/* Dynamic Nested Content */}
        <main className="admin-content flex-grow-1">
          <Outlet />
        </main>
      </div>
      <AuthModal />
    </div>
  );
};

export default AdminLayout;
