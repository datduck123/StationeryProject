import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../providers/AuthContext";
import "../../styles/admin.css";

export const AdminDashboard = () => {
  const { user, isAdmin, openAuthModal, logout } = useAuth();
  const navigate = useNavigate();

  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("week");

  // Sample data for patients and clinic users
  const [patients, setPatients] = useState([
    {
      id: "MED-001",
      name: "Clinic Administrator",
      email: "admin01@gmail.com",
      role: "ADMIN",
      joined: "15 Jan 2024",
      status: "Active",
      therapy: "Chief Clinic Director",
      lastVisit: "Today",
    },
    {
      id: "MED-104",
      name: "Tran Van Minh",
      email: "minh.tran@gmail.com",
      role: "PATIENT",
      joined: "02 Mar 2024",
      status: "In Treatment",
      therapy: "Acupuncture & Moxibustion for Spinal Pain",
      lastVisit: "20 Sep 2026",
    },
    {
      id: "MED-119",
      name: "Nguyen Thi Lan",
      email: "lan.nguyen@outlook.com",
      role: "PATIENT",
      joined: "11 Mar 2024",
      status: "Active",
      therapy: "Herbal Sleep Decoction & Qi Balance",
      lastVisit: "18 Sep 2026",
    },
    {
      id: "MED-132",
      name: "Le Hoang Nam",
      email: "nam.le@gmail.com",
      role: "PATIENT",
      joined: "05 Apr 2024",
      status: "Follow-up",
      therapy: "Herbal Poultice & Joint Rehabilitation",
      lastVisit: "14 Sep 2026",
    },
    {
      id: "MED-148",
      name: "Pham Thu Ha",
      email: "ha.pham@yahoo.com",
      role: "PATIENT",
      joined: "18 Apr 2024",
      status: "In Treatment",
      therapy: "Digestive Tonics & Spleen Care",
      lastVisit: "19 Sep 2026",
    },
    {
      id: "MED-165",
      name: "Sarah Jenkins",
      email: "patient@clinic.com",
      role: "PATIENT",
      joined: "01 May 2024",
      status: "Active",
      therapy: "Preventive Pulse Exam & Vitality Herbs",
      lastVisit: "10 Sep 2026",
    },
  ]);

  // Today's schedule
  const scheduleList = [
    {
      id: "APT-101",
      time: "08:30 AM",
      patient: "Tran Van Minh",
      practitioner: "Dr. Nguyen Duc Anh",
      therapy: "Acupuncture Therapy",
      room: "Suite 3",
      status: "Completed",
    },
    {
      id: "APT-102",
      time: "10:15 AM",
      patient: "Nguyen Thi Lan",
      practitioner: "Dr. Vo Thi Mai",
      therapy: "Herbal Prescription & Pulse Exam",
      room: "Room 1",
      status: "In Progress",
    },
    {
      id: "APT-103",
      time: "02:00 PM",
      patient: "Le Hoang Nam",
      practitioner: "Dr. Nguyen Duc Anh",
      therapy: "Cupping & Joint Relief",
      room: "Suite 2",
      status: "Upcoming",
    },
    {
      id: "APT-104",
      time: "03:45 PM",
      patient: "Pham Thu Ha",
      practitioner: "Dr. Vo Thi Mai",
      therapy: "Herbal Decoction Review",
      room: "Room 2",
      status: "Upcoming",
    },
  ];

  // Weekly bar data for chart
  const weeklyChartData = [
    { day: "Mon", height: "45%", value: "$3,800", consults: 28 },
    { day: "Tue", height: "60%", value: "$5,200", consults: 36 },
    { day: "Wed", height: "85%", value: "$7,100", consults: 48, active: true },
    { day: "Thu", height: "70%", value: "$5,900", consults: 41 },
    { day: "Fri", height: "90%", value: "$8,400", consults: 55 },
    { day: "Sat", height: "95%", value: "$9,200", consults: 62 },
    { day: "Sun", height: "40%", value: "$3,400", consults: 22 },
  ];

  // Filtered patients
  const filteredPatients = useMemo(() => {
    return patients.filter((p) => {
      const matchQuery =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchRole = roleFilter === "ALL" ? true : p.role === roleFilter;
      return matchQuery && matchRole;
    });
  }, [patients, searchQuery, roleFilter]);

  // If user is not admin, show dedicated login guard
  if (!isAdmin) {
    return (
      <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light p-4">
        <div
          className="bg-white p-5 rounded-4 shadow-sm text-center border"
          style={{ maxWidth: "500px" }}
        >
          <div className="mb-3 text-warning">
            <i className="fa-solid fa-shield-halved fa-3x color-primary"></i>
          </div>
          <h3 className="fw-700 medium-black mb-2">Admin Dashboard Access</h3>
          <p className="text-muted fs-14 mb-4">
            This management dashboard is restricted to clinic administrators.
            Please sign in with administrator credentials (e.g.{" "}
            <strong>admin01@gmail.com</strong>) to continue.
          </p>
          <div className="d-flex justify-content-center gap-2">
            <button
              type="button"
              className="admin-btn-primary"
              onClick={() => openAuthModal("login")}
            >
              <i className="fa-solid fa-lock me-1"></i> Sign In as Admin
            </button>
            <Link to="/" className="admin-btn-outline">
              <i className="fa-solid fa-arrow-left me-1"></i> Return to Site
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="admin-sidebar-backdrop d-lg-none"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* ADMIN SIDEBAR */}
      <aside className={`admin-sidebar ${sidebarOpen ? "open" : ""}`}>
        {/* Header / Logo */}
        <div className="admin-sidebar-header">
          <Link to="/" className="admin-logo-link">
            <img
              src="assets/media/logo.png"
              alt="Clinic Logo"
              className="admin-logo-img"
            />
          </Link>
          <button
            type="button"
            className="btn-close d-lg-none"
            aria-label="Close"
            onClick={() => setSidebarOpen(false)}
          ></button>
        </div>

        {/* Navigation list */}
        <div className="py-2">
          <div className="admin-nav-group-title">MAIN MENU</div>
          <ul className="admin-nav-list">
            <li className="admin-nav-item">
              <button
                type="button"
                className={`admin-nav-link ${
                  activeMenu === "dashboard" ? "active" : ""
                }`}
                onClick={() => setActiveMenu("dashboard")}
              >
                <i className="fa-solid fa-chart-pie"></i>
                <span>Overview Dashboard</span>
              </button>
            </li>
            <li className="admin-nav-item">
              <Link
                to="/admin/users"
                className="admin-nav-link text-decoration-none"
              >
                <i className="fa-solid fa-hospital-user"></i>
                <span>Patients & Users</span>
                <span className="admin-nav-badge bg-light text-dark">
                  Manage
                </span>
              </Link>
            </li>
            <li className="admin-nav-item">
              <button
                type="button"
                className={`admin-nav-link ${
                  activeMenu === "schedule" ? "active" : ""
                }`}
                onClick={() => setActiveMenu("schedule")}
              >
                <i className="fa-solid fa-calendar-check"></i>
                <span>Care Schedule</span>
                <span className="admin-nav-badge bg-danger text-white">4</span>
              </button>
            </li>
          </ul>

          <div className="admin-nav-group-title">CLINIC PHARMACY</div>
          <ul className="admin-nav-list">
            <li className="admin-nav-item">
              <button
                type="button"
                className={`admin-nav-link ${
                  activeMenu === "herbs" ? "active" : ""
                }`}
                onClick={() => setActiveMenu("herbs")}
              >
                <i className="fa-solid fa-mortar-pestle"></i>
                <span>Herbal Formulations</span>
              </button>
            </li>
            <li className="admin-nav-item">
              <button
                type="button"
                className={`admin-nav-link ${
                  activeMenu === "prescriptions" ? "active" : ""
                }`}
                onClick={() => setActiveMenu("prescriptions")}
              >
                <i className="fa-solid fa-file-prescription"></i>
                <span>Prescriptions & Orders</span>
              </button>
            </li>
          </ul>

          <div className="admin-nav-group-title">SYSTEM & REPORTS</div>
          <ul className="admin-nav-list">
            <li className="admin-nav-item">
              <button
                type="button"
                className={`admin-nav-link ${
                  activeMenu === "reports" ? "active" : ""
                }`}
                onClick={() => setActiveMenu("reports")}
              >
                <i className="fa-solid fa-chart-line"></i>
                <span>Financial Analytics</span>
              </button>
            </li>
            <li className="admin-nav-item">
              <button
                type="button"
                className={`admin-nav-link ${
                  activeMenu === "settings" ? "active" : ""
                }`}
                onClick={() => setActiveMenu("settings")}
              >
                <i className="fa-solid fa-sliders"></i>
                <span>System Settings</span>
              </button>
            </li>
          </ul>
        </div>

        {/* Sidebar Footer / User card */}
        <div className="admin-sidebar-footer">
          <div className="admin-user-card">
            <div className="admin-avatar">AD</div>
            <div className="admin-user-info">
              <div className="admin-user-name">
                {user?.fullName || "Administrator"}
              </div>
              <div className="admin-user-role">Super Admin</div>
            </div>
          </div>

          <div className="d-grid gap-2">
            <Link
              to="/"
              className="admin-btn-outline w-100 justify-content-center"
            >
              <i className="fa-solid fa-store"></i>
              <span>View Public Website</span>
            </Link>
            <button
              type="button"
              className="btn btn-sm btn-light text-danger w-100 fw-600 rounded-pill"
              onClick={() => {
                logout();
                navigate("/");
              }}
            >
              <i className="fa-solid fa-arrow-right-from-bracket me-1"></i> Sign
              Out
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="admin-main">
        {/* TOPBAR */}
        <header className="admin-topbar">
          <div className="d-flex align-items-center gap-3">
            <button
              type="button"
              className="admin-action-btn d-lg-none"
              onClick={() => setSidebarOpen(true)}
              aria-label="Toggle Sidebar"
            >
              <i className="fa-solid fa-bars"></i>
            </button>

            <div className="admin-search-wrapper d-none d-sm-block">
              <i className="fa-solid fa-magnifying-glass admin-search-icon"></i>
              <input
                type="search"
                className="admin-search-input"
                placeholder="Search patient, ID, medicine..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="admin-topbar-actions">
            <Link
              to="/"
              className="admin-btn-outline d-none d-md-inline-flex"
              title="Return to Shop / Clinic homepage"
            >
              <i className="fa-solid fa-globe"></i>
              <span>Live Website</span>
            </Link>

            <button
              type="button"
              className="admin-action-btn"
              title="Notifications"
              onClick={() =>
                alert("3 new patient consultation requests pending.")
              }
            >
              <i className="fa-regular fa-bell"></i>
              <span className="admin-notif-dot"></span>
            </button>

            <button
              type="button"
              className="admin-btn-primary"
              onClick={() => openAuthModal("register")}
            >
              <i className="fa-solid fa-plus"></i>
              <span className="d-none d-sm-inline">New Patient</span>
            </button>

            <div
              className="admin-avatar ms-1"
              style={{ width: 34, height: 34 }}
            >
              A
            </div>
          </div>
        </header>

        {/* CONTENT BODY */}
        <main className="admin-content">
          {/* Welcome Banner */}
          <div className="admin-page-header">
            <div>
              <h1 className="admin-page-title">
                Traditional Medicine Clinic Dashboard
              </h1>
              <p className="admin-page-desc">
                Welcome back,{" "}
                <strong>{user?.fullName || "Administrator"}</strong>. Here is
                the real-time operational overview of patient care & clinic
                metrics.
              </p>
            </div>

            <div className="d-flex align-items-center gap-2">
              <div className="btn-group btn-group-sm bg-white border rounded-pill p-1">
                <button
                  type="button"
                  className={`btn btn-sm rounded-pill px-3 fw-600 ${
                    dateFilter === "today"
                      ? "btn-dark bg-color-primary border-0"
                      : "btn-light border-0"
                  }`}
                  onClick={() => setDateFilter("today")}
                >
                  Today
                </button>
                <button
                  type="button"
                  className={`btn btn-sm rounded-pill px-3 fw-600 ${
                    dateFilter === "week"
                      ? "btn-dark bg-color-primary border-0"
                      : "btn-light border-0"
                  }`}
                  onClick={() => setDateFilter("week")}
                >
                  This Week
                </button>
                <button
                  type="button"
                  className={`btn btn-sm rounded-pill px-3 fw-600 ${
                    dateFilter === "month"
                      ? "btn-dark bg-color-primary border-0"
                      : "btn-light border-0"
                  }`}
                  onClick={() => setDateFilter("month")}
                >
                  This Month
                </button>
              </div>

              <button
                type="button"
                className="admin-btn-outline"
                onClick={() =>
                  alert("Exporting clinic activity report as CSV...")
                }
              >
                <i className="fa-solid fa-download"></i>
                <span className="d-none d-md-inline">Export</span>
              </button>
            </div>
          </div>

          {/* 4 KEY PERFORMANCE METRICS */}
          <div className="row row-gap-3 mb-4">
            <div className="col-xl-3 col-sm-6">
              <div className="admin-stat-card">
                <div className="admin-stat-top">
                  <span className="admin-stat-label">Total Patients</span>
                  <div
                    className="admin-stat-icon-wrapper"
                    style={{ background: "#fff0eb", color: "#e9613f" }}
                  >
                    <i className="fa-solid fa-hospital-user"></i>
                  </div>
                </div>
                <div className="admin-stat-val">1,428</div>
                <div className="admin-stat-trend text-success">
                  <i className="fa-solid fa-arrow-trend-up"></i>
                  <span>+12.5% vs last month</span>
                </div>
              </div>
            </div>

            <div className="col-xl-3 col-sm-6">
              <div className="admin-stat-card">
                <div className="admin-stat-top">
                  <span className="admin-stat-label">Today's Consults</span>
                  <div
                    className="admin-stat-icon-wrapper"
                    style={{ background: "#eafaf1", color: "#27ae60" }}
                  >
                    <i className="fa-solid fa-stethoscope"></i>
                  </div>
                </div>
                <div className="admin-stat-val">42</div>
                <div className="admin-stat-trend text-primary">
                  <i className="fa-solid fa-circle-check"></i>
                  <span>26 completed · 8 in progress</span>
                </div>
              </div>
            </div>

            <div className="col-xl-3 col-sm-6">
              <div className="admin-stat-card">
                <div className="admin-stat-top">
                  <span className="admin-stat-label">Herbal Formulations</span>
                  <div
                    className="admin-stat-icon-wrapper"
                    style={{ background: "#fef7e7", color: "#d97706" }}
                  >
                    <i className="fa-solid fa-mortar-pestle"></i>
                  </div>
                </div>
                <div className="admin-stat-val">186</div>
                <div className="admin-stat-trend text-success">
                  <i className="fa-solid fa-arrow-trend-up"></i>
                  <span>98% active compliance</span>
                </div>
              </div>
            </div>

            <div className="col-xl-3 col-sm-6">
              <div className="admin-stat-card">
                <div className="admin-stat-top">
                  <span className="admin-stat-label">Clinic Revenue</span>
                  <div
                    className="admin-stat-icon-wrapper"
                    style={{ background: "#eef2ff", color: "#4f46e5" }}
                  >
                    <i className="fa-solid fa-chart-line"></i>
                  </div>
                </div>
                <div className="admin-stat-val">$48,250</div>
                <div className="admin-stat-trend text-success">
                  <i className="fa-solid fa-arrow-trend-up"></i>
                  <span>+15.2% growth rate</span>
                </div>
              </div>
            </div>
          </div>

          {/* MIDDLE SECTION: CHARTS & APPOINTMENTS TIMELINE */}
          <div className="row row-gap-4 mb-4">
            {/* Chart: Patient Consultations & Revenue */}
            <div className="col-xl-7 col-12">
              <div className="admin-card h-100">
                <div className="admin-card-header">
                  <h3 className="admin-card-title">
                    <i className="fa-solid fa-chart-column color-primary"></i>
                    <span>Weekly Patient Consultations & Revenue</span>
                  </h3>
                  <span className="text-muted fs-13">Updated 5 mins ago</span>
                </div>

                <p className="fs-13 text-muted mb-3">
                  Daily patient volume across Acupuncture, Moxibustion, and
                  Herbal Decoction consults.
                </p>

                {/* Simulated Visual Chart */}
                <div className="admin-chart-bar-group">
                  {weeklyChartData.map((item) => (
                    <div key={item.day} className="admin-bar-col">
                      <div
                        className={`admin-bar ${item.active ? "active" : ""}`}
                        style={{ height: item.height }}
                        title={`${item.day}: ${item.consults} consults (${item.value})`}
                      ></div>
                      <span className="admin-bar-day">{item.day}</span>
                    </div>
                  ))}
                </div>

                <div className="d-flex justify-content-between align-items-center mt-3 pt-2">
                  <div className="d-flex align-items-center gap-3 fs-13">
                    <span className="d-flex align-items-center gap-1">
                      <span
                        className="d-inline-block rounded-circle"
                        style={{ width: 10, height: 10, background: "#e9613f" }}
                      ></span>
                      Peak Day (Wed: 48 Consults)
                    </span>
                    <span className="d-flex align-items-center gap-1 text-muted">
                      <span
                        className="d-inline-block rounded-circle"
                        style={{ width: 10, height: 10, background: "#ffd8cc" }}
                      ></span>
                      Regular Days
                    </span>
                  </div>
                  <span className="fw-700 color-primary fs-14">
                    Avg. 41 Consultations / Day
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Today's Clinical Schedule */}
            <div className="col-xl-5 col-12">
              <div className="admin-card h-100">
                <div className="admin-card-header">
                  <h3 className="admin-card-title">
                    <i className="fa-solid fa-clock color-primary"></i>
                    <span>Today's Care Schedule</span>
                  </h3>
                  <span className="badge bg-success rounded-pill px-2 py-1 fs-11">
                    Live
                  </span>
                </div>

                <div className="admin-schedule-list">
                  {scheduleList.map((apt) => (
                    <div key={apt.id} className="admin-schedule-item">
                      <div className="admin-time-badge">{apt.time}</div>
                      <div className="admin-schedule-content">
                        <div className="d-flex justify-content-between align-items-center">
                          <h4 className="admin-schedule-patient mb-0">
                            {apt.patient}
                          </h4>
                          <span
                            className={`badge rounded-pill fs-11 ${
                              apt.status === "Completed"
                                ? "bg-secondary text-white"
                                : apt.status === "In Progress"
                                  ? "bg-primary text-white"
                                  : "bg-warning text-dark"
                            }`}
                          >
                            {apt.status}
                          </span>
                        </div>
                        <p className="admin-schedule-desc">
                          {apt.therapy} · <em>{apt.room}</em>
                        </p>
                        <span className="text-muted fs-11">
                          Doctor: {apt.practitioner}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-3 pt-2 text-center">
                  <button
                    type="button"
                    className="btn btn-sm btn-light border w-100 fw-600"
                    onClick={() =>
                      alert("Viewing complete monthly care calendar.")
                    }
                  >
                    View Full Clinic Schedule
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* PATIENT DIRECTORY & USER MANAGEMENT TABLE */}
          <div className="admin-card">
            <div className="admin-card-header">
              <div>
                <h3 className="admin-card-title mb-1">
                  <i className="fa-solid fa-users color-primary"></i>
                  <span>Patient Dossier & User Directory</span>
                </h3>
                <p className="text-muted fs-13 mb-0">
                  Manage patient clinical cards, diagnostic history, role
                  authorizations, and treatment progress.
                </p>
              </div>

              <div className="d-flex flex-wrap align-items-center gap-2">
                <select
                  className="form-select form-select-sm"
                  style={{ width: "140px" }}
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                >
                  <option value="ALL">All Roles</option>
                  <option value="PATIENT">Patients</option>
                  <option value="ADMIN">Admins</option>
                </select>

                <button
                  type="button"
                  className="admin-btn-primary"
                  onClick={() => openAuthModal("register")}
                >
                  <i className="fa-solid fa-user-plus"></i>
                  <span>Add Patient</span>
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>PATIENT ID</th>
                    <th>PATIENT NAME</th>
                    <th>EMAIL ADDRESS</th>
                    <th>ROLE</th>
                    <th>CARE FOCUS / DIAGNOSIS</th>
                    <th>STATUS</th>
                    <th>LAST VISIT</th>
                    <th className="text-end">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPatients.length > 0 ? (
                    filteredPatients.map((p) => (
                      <tr key={p.id}>
                        <td>
                          <span className="fw-700 color-primary fs-13">
                            {p.id}
                          </span>
                        </td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <div
                              className="rounded-circle d-flex align-items-center justify-content-center fw-700 text-white"
                              style={{
                                width: 32,
                                height: 32,
                                background:
                                  p.role === "ADMIN" ? "#e9613f" : "#27ae60",
                                fontSize: 12,
                              }}
                            >
                              {p.name.charAt(0)}
                            </div>
                            <span className="fw-600">{p.name}</span>
                          </div>
                        </td>
                        <td className="text-muted fs-13">{p.email}</td>
                        <td>
                          <span
                            className={`admin-badge ${
                              p.role === "ADMIN"
                                ? "user-role-admin"
                                : "user-role-patient"
                            }`}
                          >
                            {p.role}
                          </span>
                        </td>
                        <td className="fs-13">{p.therapy}</td>
                        <td>
                          <span
                            className={`admin-badge ${
                              p.status === "Active"
                                ? "admin-badge-active"
                                : p.status === "In Treatment"
                                  ? "admin-badge-treatment"
                                  : "admin-badge-followup"
                            }`}
                          >
                            {p.status}
                          </span>
                        </td>
                        <td className="text-muted fs-13">{p.lastVisit}</td>
                        <td className="text-end">
                          <button
                            type="button"
                            className="admin-action-icon-btn"
                            title="View Medical File"
                            onClick={() =>
                              alert(`Opening medical chart for ${p.name}`)
                            }
                          >
                            <i className="fa-regular fa-file-lines"></i>
                          </button>
                          <button
                            type="button"
                            className="admin-action-icon-btn"
                            title="Edit Patient Info"
                            onClick={() =>
                              alert(`Editing clinical profile for ${p.name}`)
                            }
                          >
                            <i className="fa-regular fa-pen-to-square"></i>
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="text-center py-4 text-muted">
                        No patient records found matching your query.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="d-flex flex-wrap justify-content-between align-items-center mt-3 pt-3 border-top">
              <span className="text-muted fs-13">
                Showing <strong>1 to {filteredPatients.length}</strong> of{" "}
                <strong>1,428</strong> patients
              </span>

              <div className="btn-group btn-group-sm">
                <button type="button" className="btn btn-light border" disabled>
                  Previous
                </button>
                <button
                  type="button"
                  className="btn btn-dark bg-color-primary border-0"
                >
                  1
                </button>
                <button type="button" className="btn btn-light border">
                  2
                </button>
                <button type="button" className="btn btn-light border">
                  3
                </button>
                <button type="button" className="btn btn-light border">
                  Next
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
