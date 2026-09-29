import React, { useEffect, useMemo, useState } from "react";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import voucherService from "../../services/voucherService";
import "../../styles/admin.css";

const money = (amount) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    Number(amount || 0)
  );

const formatDate = (isoString) => {
  if (!isoString) return "No expiration";
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return isoString;
  }
};

const formatForInput = (isoString) => {
  if (!isoString) return "";
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return "";
    const pad = (num) => String(num).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
      d.getHours()
    )}:${pad(d.getMinutes())}`;
  } catch {
    return "";
  }
};

export const AdminVoucherManagement = () => {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("createdAt:desc");

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [voucherToDelete, setVoucherToDelete] = useState(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [copiedCode, setCopiedCode] = useState(null);

  // Form State matching ERD (code, discount_percent, max_discount, min_order_amount, start_date, end_date, usage_limit)
  const [formCode, setFormCode] = useState("");
  const [formDiscountPercent, setFormDiscountPercent] = useState("");
  const [formMaxDiscount, setFormMaxDiscount] = useState("");
  const [formMinOrderAmount, setFormMinOrderAmount] = useState("0");
  const [formStartDate, setFormStartDate] = useState("");
  const [formEndDate, setFormEndDate] = useState("");
  const [isUnlimitedUsage, setIsUnlimitedUsage] = useState(true);
  const [formUsageLimit, setFormUsageLimit] = useState("");
  const [formIsActive, setFormIsActive] = useState(true);

  const [formErrors, setFormErrors] = useState({});
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formServerDuplicateError, setFormServerDuplicateError] = useState("");

  // Fetch Vouchers
  const fetchVouchers = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await voucherService.getAllVouchers();
      setVouchers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load vouchers:", err);
      setError(
        err.response?.data?.message ||
          "Failed to load voucher list. Please check backend connection."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  // Flash auto-dismiss success notice
  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(""), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  // Copy code helper
  const handleCopyCode = (code, e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Generate random voucher code
  const handleGenerateRandomCode = () => {
    const prefixes = ["PROMO", "SAVE", "DEAL", "SUMMER", "VIP", "STATIONERY"];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const newCode = `${prefix}${randomNum}`;
    setFormCode(newCode);
    setFormServerDuplicateError("");
    setFormErrors((prev) => ({ ...prev, code: null }));
  };

  // Status helper badge info
  const getStatusBadge = (voucher) => {
    const now = new Date();
    if (!voucher.isActive) {
      return {
        label: "Inactive",
        className: "bg-secondary text-white",
        icon: "fa-circle-xmark",
      };
    }
    if (voucher.endDate && new Date(voucher.endDate) < now) {
      return {
        label: "Expired",
        className: "bg-danger text-white",
        icon: "fa-calendar-xmark",
      };
    }
    if (voucher.startDate && new Date(voucher.startDate) > now) {
      return {
        label: "Upcoming",
        className: "bg-info text-dark",
        icon: "fa-clock",
      };
    }
    if (
      voucher.usageLimit != null &&
      voucher.usedCount != null &&
      voucher.usedCount >= voucher.usageLimit
    ) {
      return {
        label: "Depleted",
        className: "bg-warning text-dark",
        icon: "fa-battery-empty",
      };
    }
    return {
      label: "Active",
      className: "bg-success text-white",
      icon: "fa-circle-check",
    };
  };

  // KPI Calculations
  const stats = useMemo(() => {
    const total = vouchers.length;
    let active = 0;
    let expiredOrInactive = 0;
    let totalRedemptions = 0;

    const now = new Date();
    vouchers.forEach((v) => {
      totalRedemptions += v.usedCount || 0;
      const isExpired = v.endDate && new Date(v.endDate) < now;
      const isDepleted =
        v.usageLimit != null && v.usedCount != null && v.usedCount >= v.usageLimit;
      if (v.isActive && !isExpired && !isDepleted) {
        active++;
      } else {
        expiredOrInactive++;
      }
    });

    return { total, active, expiredOrInactive, totalRedemptions };
  }, [vouchers]);

  // Filtered & Sorted vouchers
  const filteredVouchers = useMemo(() => {
    const now = new Date();
    return vouchers
      .filter((v) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchCode = v.code?.toLowerCase().includes(q);
          if (!matchCode) return false;
        }

        // Status filter
        if (statusFilter !== "ALL") {
          const isExpired = v.endDate && new Date(v.endDate) < now;
          const isDepleted =
            v.usageLimit != null &&
            v.usedCount != null &&
            v.usedCount >= v.usageLimit;
          const isUpcoming = v.startDate && new Date(v.startDate) > now;

          if (statusFilter === "ACTIVE") {
            if (!v.isActive || isExpired || isDepleted || isUpcoming) return false;
          } else if (statusFilter === "INACTIVE") {
            if (v.isActive) return false;
          } else if (statusFilter === "EXPIRED") {
            if (!isExpired) return false;
          } else if (statusFilter === "DEPLETED") {
            if (!isDepleted) return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "createdAt:desc":
            return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
          case "createdAt:asc":
            return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
          case "discountPercent:desc":
            return Number(b.discountPercent || 0) - Number(a.discountPercent || 0);
          case "discountPercent:asc":
            return Number(a.discountPercent || 0) - Number(b.discountPercent || 0);
          case "usedCount:desc":
            return Number(b.usedCount || 0) - Number(a.usedCount || 0);
          case "code:asc":
            return (a.code || "").localeCompare(b.code || "");
          default:
            return 0;
        }
      });
  }, [vouchers, searchQuery, statusFilter, sortBy]);

  // Form Reset
  const resetForm = () => {
    setFormCode("");
    setFormDiscountPercent("");
    setFormMaxDiscount("");
    setFormMinOrderAmount("0");
    setFormStartDate("");
    setFormEndDate("");
    setIsUnlimitedUsage(true);
    setFormUsageLimit("");
    setFormIsActive(true);
    setFormErrors({});
    setFormServerDuplicateError("");
  };

  const openAddModal = () => {
    resetForm();
    setIsAddModalOpen(true);
  };

  const openEditModal = (v) => {
    resetForm();
    setSelectedVoucher(v);
    setFormCode(v.code || "");
    setFormDiscountPercent(
      v.discountPercent != null ? String(v.discountPercent) : ""
    );
    setFormMaxDiscount(v.maxDiscount != null ? String(v.maxDiscount) : "");
    setFormMinOrderAmount(
      v.minOrderAmount != null ? String(v.minOrderAmount) : "0"
    );
    setFormStartDate(formatForInput(v.startDate));
    setFormEndDate(formatForInput(v.endDate));
    setIsUnlimitedUsage(v.usageLimit == null);
    setFormUsageLimit(v.usageLimit != null ? String(v.usageLimit) : "");
    setFormIsActive(Boolean(v.isActive));
    setIsEditModalOpen(true);
  };

  const openDetailModal = (v) => {
    setSelectedVoucher(v);
    setIsDetailModalOpen(true);
  };

  // Form Validation
  const validateForm = () => {
    const errors = {};
    const code = formCode.trim().toUpperCase();

    if (!code) {
      errors.code = "Voucher code is required";
    } else if (code.length < 2 || code.length > 50) {
      errors.code = "Code must be between 2 and 50 characters";
    } else if (!/^[A-Z0-9_-]+$/.test(code)) {
      errors.code = "Code can only contain letters, numbers, hyphens, and underscores";
    }

    const pctVal = parseFloat(formDiscountPercent);
    if (isNaN(pctVal) || pctVal <= 0 || pctVal > 100) {
      errors.discountPercent = "Discount percentage must be between 0.01% and 100%";
    }

    const minVal = parseFloat(formMinOrderAmount);
    if (!isNaN(minVal) && minVal < 0) {
      errors.minOrderAmount = "Minimum order amount cannot be negative";
    }

    if (formMaxDiscount) {
      const maxVal = parseFloat(formMaxDiscount);
      if (!isNaN(maxVal) && maxVal < 0) {
        errors.maxDiscount = "Max discount cap cannot be negative";
      }
    }

    if (!isUnlimitedUsage) {
      const limitVal = parseInt(formUsageLimit, 10);
      if (isNaN(limitVal) || limitVal < 1) {
        errors.usageLimit = "Usage limit must be at least 1";
      }
    }

    if (formStartDate && formEndDate) {
      if (new Date(formEndDate) <= new Date(formStartDate)) {
        errors.endDate = "End date must be later than start date";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit Create
  const handleCreateVoucher = async (e) => {
    e.preventDefault();
    setFormServerDuplicateError("");

    if (!validateForm()) return;

    try {
      setFormSubmitting(true);
      const payload = {
        code: formCode.trim().toUpperCase(),
        discountPercent: parseFloat(formDiscountPercent),
        maxDiscount: formMaxDiscount ? parseFloat(formMaxDiscount) : null,
        minOrderAmount: formMinOrderAmount ? parseFloat(formMinOrderAmount) : 0,
        startDate: formStartDate ? new Date(formStartDate).toISOString() : null,
        endDate: formEndDate ? new Date(formEndDate).toISOString() : null,
        usageLimit: !isUnlimitedUsage && formUsageLimit ? parseInt(formUsageLimit, 10) : null,
        isActive: formIsActive,
      };

      const created = await voucherService.createVoucher(payload);
      setVouchers((prev) => [created, ...prev]);
      setSuccessMsg(`Voucher code "${created.code}" created successfully!`);
      setIsAddModalOpen(false);
      resetForm();
    } catch (err) {
      console.error("Failed to create voucher:", err);
      if (err.response?.status === 409) {
        setFormServerDuplicateError(
          `Voucher code "${formCode.trim().toUpperCase()}" already exists! Please use a unique code.`
        );
      } else {
        setFormServerDuplicateError(
          err.response?.data?.message || "Failed to create voucher. Please check inputs."
        );
      }
    } finally {
      setFormSubmitting(false);
    }
  };

  // Submit Update
  const handleUpdateVoucher = async (e) => {
    e.preventDefault();
    if (!selectedVoucher) return;
    setFormServerDuplicateError("");

    if (!validateForm()) return;

    try {
      setFormSubmitting(true);
      const payload = {
        code: formCode.trim().toUpperCase(),
        discountPercent: parseFloat(formDiscountPercent),
        maxDiscount: formMaxDiscount ? parseFloat(formMaxDiscount) : null,
        minOrderAmount: formMinOrderAmount ? parseFloat(formMinOrderAmount) : 0,
        startDate: formStartDate ? new Date(formStartDate).toISOString() : null,
        endDate: formEndDate ? new Date(formEndDate).toISOString() : null,
        usageLimit: !isUnlimitedUsage && formUsageLimit ? parseInt(formUsageLimit, 10) : null,
        isActive: formIsActive,
      };

      const updated = await voucherService.updateVoucher(
        selectedVoucher.voucherId,
        payload
      );
      setVouchers((prev) =>
        prev.map((v) => (v.voucherId === updated.voucherId ? updated : v))
      );
      setSuccessMsg(`Voucher code "${updated.code}" updated successfully!`);
      setIsEditModalOpen(false);
      resetForm();
    } catch (err) {
      console.error("Failed to update voucher:", err);
      if (err.response?.status === 409) {
        setFormServerDuplicateError(
          `Voucher code "${formCode.trim().toUpperCase()}" already exists for another voucher!`
        );
      } else {
        setFormServerDuplicateError(
          err.response?.data?.message || "Failed to update voucher. Please try again."
        );
      }
    } finally {
      setFormSubmitting(false);
    }
  };

  // Toggle Status
  const handleToggleStatus = async (voucher, e) => {
    e.stopPropagation();
    try {
      setActionLoadingId(voucher.voucherId);
      const updated = await voucherService.toggleVoucherStatus(voucher.voucherId);
      setVouchers((prev) =>
        prev.map((v) => (v.voucherId === updated.voucherId ? updated : v))
      );
      setSuccessMsg(
        `Voucher "${updated.code}" is now ${updated.isActive ? "ACTIVE" : "INACTIVE"}.`
      );
    } catch (err) {
      console.error("Failed to toggle status:", err);
      setError(
        err.response?.data?.message || "Failed to change voucher status."
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  // Delete Voucher
  const confirmDelete = (v, e) => {
    e.stopPropagation();
    setVoucherToDelete(v);
    setIsDeleteConfirmOpen(true);
  };

  const handleDeleteVoucher = async () => {
    if (!voucherToDelete) return;
    try {
      setDeleteLoading(true);
      await voucherService.deleteVoucher(voucherToDelete.voucherId);
      setVouchers((prev) =>
        prev.filter((v) => v.voucherId !== voucherToDelete.voucherId)
      );
      setSuccessMsg(`Voucher "${voucherToDelete.code}" deleted permanently.`);
      setIsDeleteConfirmOpen(false);
      setVoucherToDelete(null);
    } catch (err) {
      console.error("Failed to delete voucher:", err);
      setError(
        err.response?.data?.message || "Failed to delete voucher from system."
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="admin-content">
      {/* Toast / Notice Alerts */}
      {successMsg && (
        <div
          className="alert alert-success alert-dismissible fade show d-flex align-items-center gap-2 mb-4 shadow-sm"
          role="alert"
        >
          <i className="fa-solid fa-circle-check fs-5"></i>
          <span className="flex-grow-1 fw-medium">{successMsg}</span>
          <button
            type="button"
            className="btn-close"
            onClick={() => setSuccessMsg("")}
          ></button>
        </div>
      )}

      {error && (
        <div
          className="alert alert-danger alert-dismissible fade show d-flex align-items-center gap-2 mb-4 shadow-sm"
          role="alert"
        >
          <i className="fa-solid fa-triangle-exclamation fs-5"></i>
          <span className="flex-grow-1">{error}</span>
          <button
            type="button"
            className="btn-close"
            onClick={() => setError("")}
          ></button>
        </div>
      )}

      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title d-flex align-items-center gap-2">
            <i className="fa-solid fa-ticket text-primary"></i>
            Voucher & Coupon Management
          </h1>
          <p className="admin-page-desc">
            Manage promotional coupons based on ERD schema (Unique Code, Discount %, Max Discount, Min Order Amount, Start/End Date, Usage Limit).
          </p>
        </div>
        <div className="d-flex align-items-center gap-2">
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2 px-3 py-2 rounded-3"
            onClick={fetchVouchers}
            disabled={loading}
            title="Reload vouchers from database"
          >
            <i className={`fa-solid fa-arrows-rotate ${loading ? "fa-spin" : ""}`}></i>
            Refresh
          </button>
          <button
            type="button"
            className="btn btn-primary d-flex align-items-center gap-2 px-4 py-2 rounded-3 shadow-sm fw-semibold"
            style={{ backgroundColor: "var(--admin-primary)", borderColor: "var(--admin-primary)" }}
            onClick={openAddModal}
          >
            <i className="fa-solid fa-plus"></i>
            Create New Voucher
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="admin-stat-card">
            <div className="admin-stat-top">
              <span className="admin-stat-label">Total Vouchers</span>
              <div
                className="admin-stat-icon-wrapper"
                style={{ background: "#e0f2fe", color: "#0284c7" }}
              >
                <i className="fa-solid fa-tags"></i>
              </div>
            </div>
            <div className="admin-stat-val">{stats.total}</div>
            <div className="admin-stat-trend text-muted">
              <i className="fa-solid fa-circle-info"></i> All campaigns in system
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="admin-stat-card">
            <div className="admin-stat-top">
              <span className="admin-stat-label">Active & Valid</span>
              <div
                className="admin-stat-icon-wrapper"
                style={{ background: "#dcfce7", color: "#16a34a" }}
              >
                <i className="fa-solid fa-bolt"></i>
              </div>
            </div>
            <div className="admin-stat-val text-success">{stats.active}</div>
            <div className="admin-stat-trend text-success">
              <i className="fa-solid fa-circle-check"></i> Usable by customers
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="admin-stat-card">
            <div className="admin-stat-top">
              <span className="admin-stat-label">Inactive / Expired</span>
              <div
                className="admin-stat-icon-wrapper"
                style={{ background: "#fee2e2", color: "#dc2626" }}
              >
                <i className="fa-solid fa-clock-rotate-left"></i>
              </div>
            </div>
            <div className="admin-stat-val text-danger">{stats.expiredOrInactive}</div>
            <div className="admin-stat-trend text-muted">
              <i className="fa-solid fa-ban"></i> Disabled or out of date
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="admin-stat-card">
            <div className="admin-stat-top">
              <span className="admin-stat-label">Total Redemptions</span>
              <div
                className="admin-stat-icon-wrapper"
                style={{ background: "#fef3c7", color: "#d97706" }}
              >
                <i className="fa-solid fa-fire"></i>
              </div>
            </div>
            <div className="admin-stat-val text-warning">{stats.totalRedemptions}</div>
            <div className="admin-stat-trend text-muted">
              <i className="fa-solid fa-receipt"></i> Total times claimed
            </div>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="admin-card">
        {/* Filter Toolbar */}
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4 pb-3 border-bottom">
          <div className="d-flex flex-wrap align-items-center gap-2 flex-grow-1">
            {/* Search Box */}
            <div className="admin-search-box" style={{ maxWidth: 360 }}>
              <i className="fa-solid fa-magnifying-glass text-muted me-2"></i>
              <input
                type="text"
                placeholder="Search by voucher code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  title="Clear search"
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              )}
            </div>

            {/* Status Filter */}
            <select
              className="admin-select-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active Only</option>
              <option value="INACTIVE">Inactive Only</option>
              <option value="EXPIRED">Expired</option>
              <option value="DEPLETED">Depleted</option>
            </select>

            {/* Sort */}
            <select
              className="admin-select-sm"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="createdAt:desc">Newest Created</option>
              <option value="createdAt:asc">Oldest Created</option>
              <option value="discountPercent:desc">Highest Discount %</option>
              <option value="usedCount:desc">Most Used</option>
              <option value="code:asc">Code A-Z</option>
            </select>

            {(searchQuery || statusFilter !== "ALL") && (
              <button
                type="button"
                className="btn btn-link text-muted btn-sm text-decoration-none"
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("ALL");
                }}
              >
                <i className="fa-solid fa-rotate-left me-1"></i> Reset
              </button>
            )}
          </div>

          <div className="text-muted small fw-medium">
            Showing <strong className="text-dark">{filteredVouchers.length}</strong> of{" "}
            <strong>{vouchers.length}</strong> vouchers
          </div>
        </div>

        {/* Table Content */}
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: 60 }}>#</th>
                <th style={{ minWidth: 170 }}>VOUCHER CODE</th>
                <th style={{ minWidth: 160 }}>DISCOUNT %</th>
                <th style={{ minWidth: 140 }}>MIN ORDER AMOUNT</th>
                <th style={{ minWidth: 200 }}>VALIDITY PERIOD</th>
                <th style={{ minWidth: 140 }}>USAGE LIMIT</th>
                <th style={{ minWidth: 120 }}>STATUS</th>
                <th style={{ width: 140, textAlign: "right" }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <div className="mt-2 text-muted small">Loading vouchers...</div>
                  </td>
                </tr>
              ) : filteredVouchers.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-5">
                    <div className="d-flex flex-column align-items-center justify-content-center">
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center mb-3"
                        style={{
                          width: 64,
                          height: 64,
                          background: "#f1f5f9",
                          color: "#94a3b8",
                        }}
                      >
                        <i className="fa-solid fa-ticket-simple fa-2x"></i>
                      </div>
                      <h6 className="fw-semibold text-dark mb-1">No vouchers found</h6>
                      <p className="text-muted small mb-3">
                        {searchQuery || statusFilter !== "ALL"
                          ? "Try adjusting your filters or search terms."
                          : "Start boosting sales by creating your first promotional coupon!"}
                      </p>
                      {searchQuery || statusFilter !== "ALL" ? (
                        <button
                          type="button"
                          className="btn btn-outline-secondary btn-sm"
                          onClick={() => {
                            setSearchQuery("");
                            setStatusFilter("ALL");
                          }}
                        >
                          Clear Filters
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          style={{ backgroundColor: "var(--admin-primary)" }}
                          onClick={openAddModal}
                        >
                          <i className="fa-solid fa-plus me-1"></i> Create First Voucher
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredVouchers.map((v, idx) => {
                  const badge = getStatusBadge(v);
                  const usagePercent =
                    v.usageLimit && v.usageLimit > 0
                      ? Math.min(100, Math.round(((v.usedCount || 0) / v.usageLimit) * 100))
                      : null;

                  return (
                    <tr key={v.voucherId}>
                      <td className="text-muted small">{idx + 1}</td>

                      {/* Code Badge & Copy */}
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <span
                            className="badge px-2.5 py-1.5 font-monospace fw-bold shadow-sm d-inline-flex align-items-center gap-1.5"
                            style={{
                              background: "#f8fafc",
                              border: "1.5px dashed #cbd5e1",
                              color: "#0f172a",
                              fontSize: "13px",
                              letterSpacing: "0.5px",
                            }}
                          >
                            <i className="fa-solid fa-ticket text-primary"></i>
                            {v.code}
                          </span>
                          <button
                            type="button"
                            className="btn btn-sm btn-link text-muted p-0"
                            title="Copy code"
                            onClick={(e) => handleCopyCode(v.code, e)}
                          >
                            {copiedCode === v.code ? (
                              <i className="fa-solid fa-check text-success"></i>
                            ) : (
                              <i className="fa-regular fa-copy"></i>
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Discount Percent & Max Discount */}
                      <td>
                        <div className="d-flex flex-column">
                          <span className="fw-bold text-dark fs-6">
                            {v.discountPercent}% OFF
                          </span>
                          {v.maxDiscount ? (
                            <small className="text-muted">
                              Max discount: {money(v.maxDiscount)}
                            </small>
                          ) : (
                            <small className="text-muted">No max discount limit</small>
                          )}
                        </div>
                      </td>

                      {/* Min Order Amount */}
                      <td>
                        {v.minOrderAmount && Number(v.minOrderAmount) > 0 ? (
                          <span className="fw-medium text-dark">
                            {money(v.minOrderAmount)}
                          </span>
                        ) : (
                          <span className="text-muted small">No minimum</span>
                        )}
                      </td>

                      {/* Validity Period */}
                      <td>
                        <div className="d-flex flex-column small">
                          <div className="text-dark">
                            <i className="fa-regular fa-calendar text-muted me-1"></i>
                            {v.startDate ? formatDate(v.startDate) : "Anytime"}
                          </div>
                          <div className="text-muted mt-0.5">
                            <i className="fa-solid fa-arrow-right-long text-muted me-1"></i>
                            {v.endDate ? (
                              <span
                                className={
                                  new Date(v.endDate) < new Date()
                                    ? "text-danger fw-semibold"
                                    : ""
                                }
                              >
                                {formatDate(v.endDate)}
                              </span>
                            ) : (
                              "Never expires"
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Usage */}
                      <td>
                        <div className="d-flex flex-column">
                          <div className="d-flex align-items-center justify-content-between small mb-1">
                            <span className="fw-medium text-dark">
                              {v.usedCount || 0}
                            </span>
                            <span className="text-muted">
                              {v.usageLimit ? `/ ${v.usageLimit}` : "(Unlimited)"}
                            </span>
                          </div>
                          {usagePercent !== null && (
                            <div
                              className="progress"
                              style={{ height: 5, borderRadius: 4 }}
                            >
                              <div
                                className={`progress-bar ${
                                  usagePercent >= 100
                                    ? "bg-danger"
                                    : usagePercent > 75
                                    ? "bg-warning"
                                    : "bg-success"
                                }`}
                                role="progressbar"
                                style={{ width: `${usagePercent}%` }}
                                aria-valuenow={usagePercent}
                                aria-valuemin="0"
                                aria-valuemax="100"
                              ></div>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Status & Quick Switch */}
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <span className={`badge ${badge.className} d-inline-flex align-items-center gap-1`}>
                            <i className={`fa-solid ${badge.icon}`}></i>
                            {badge.label}
                          </span>
                          <div
                            className="form-check form-switch m-0"
                            title={v.isActive ? "Deactivate" : "Activate"}
                          >
                            <input
                              className="form-check-input"
                              type="checkbox"
                              role="switch"
                              style={{ cursor: "pointer" }}
                              checked={Boolean(v.isActive)}
                              disabled={actionLoadingId === v.voucherId}
                              onChange={(e) => handleToggleStatus(v, e)}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="text-end">
                        <div className="d-inline-flex align-items-center">
                          <button
                            type="button"
                            className="admin-action-icon-btn"
                            title="View Voucher Details"
                            onClick={() => openDetailModal(v)}
                          >
                            <i className="fa-regular fa-eye"></i>
                          </button>
                          <button
                            type="button"
                            className="admin-action-icon-btn"
                            title="Edit Voucher"
                            onClick={() => openEditModal(v)}
                          >
                            <i className="fa-regular fa-pen-to-square"></i>
                          </button>
                          <button
                            type="button"
                            className="admin-action-icon-btn text-danger"
                            title="Delete Voucher"
                            onClick={(e) => confirmDelete(v, e)}
                          >
                            <i className="fa-regular fa-trash-can"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ADD / CREATE VOUCHER MODAL                                                */}
      {/* ========================================================================= */}
      {isAddModalOpen && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(15, 23, 42, 0.65)" }}
          tabIndex="-1"
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content rounded-4 border-0 shadow-lg overflow-hidden">
              {/* Modal Header */}
              <div
                className="modal-header px-4 py-3 border-bottom text-white"
                style={{ backgroundColor: "var(--admin-primary)" }}
              >
                <div className="d-flex align-items-center gap-2">
                  <div
                    className="rounded-circle bg-white text-primary d-flex align-items-center justify-content-center"
                    style={{ width: 34, height: 34, color: "var(--admin-primary) !important" }}
                  >
                    <i className="fa-solid fa-plus fw-bold"></i>
                  </div>
                  <div>
                    <h5 className="modal-title fw-bold text-white mb-0">Create New Voucher</h5>
                    <small className="text-white-50">
                      Configure coupon code, discount percentage, limits, and expiration
                    </small>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setIsAddModalOpen(false)}
                ></button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleCreateVoucher}>
                <div className="modal-body p-4" style={{ maxHeight: "70vh", overflowY: "auto" }}>
                  {/* Server Duplicate Error Alert */}
                  {formServerDuplicateError && (
                    <div className="alert alert-danger d-flex align-items-center gap-2 mb-3">
                      <i className="fa-solid fa-circle-exclamation fs-5"></i>
                      <div className="flex-grow-1 fw-medium">{formServerDuplicateError}</div>
                    </div>
                  )}

                  <div className="row g-3">
                    {/* Voucher Code */}
                    <div className="col-12 col-md-7">
                      <label className="form-label fw-semibold text-dark">
                        Voucher Code <span className="text-danger">*</span>
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-light text-muted">
                          <i className="fa-solid fa-barcode"></i>
                        </span>
                        <input
                          type="text"
                          className={`form-control font-monospace fw-bold text-uppercase ${
                            formErrors.code || formServerDuplicateError ? "is-invalid" : ""
                          }`}
                          placeholder="e.g. SUMMER50, WELCOME10"
                          value={formCode}
                          onChange={(e) => {
                            setFormCode(e.target.value.toUpperCase());
                            setFormServerDuplicateError("");
                            setFormErrors((prev) => ({ ...prev, code: null }));
                          }}
                          required
                        />
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={handleGenerateRandomCode}
                          title="Generate random coupon code"
                        >
                          <i className="fa-solid fa-shuffle me-1"></i> Random
                        </button>
                      </div>
                      {formErrors.code && (
                        <div className="text-danger small mt-1">{formErrors.code}</div>
                      )}
                      <small className="text-muted">Unique coupon identifier.</small>
                    </div>

                    {/* Active Switch */}
                    <div className="col-12 col-md-5 d-flex align-items-center justify-content-md-end pt-3">
                      <div className="form-check form-switch fs-6">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          role="switch"
                          id="createActiveSwitch"
                          checked={formIsActive}
                          onChange={(e) => setFormIsActive(e.target.checked)}
                        />
                        <label className="form-check-label fw-semibold ms-2" htmlFor="createActiveSwitch">
                          {formIsActive ? "Status: Active" : "Status: Inactive"}
                        </label>
                      </div>
                    </div>

                    {/* Discount Percentage */}
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold text-dark">
                        Discount Percentage (%) <span className="text-danger">*</span>
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-light text-muted">%</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0.01"
                          max="100"
                          className={`form-control ${formErrors.discountPercent ? "is-invalid" : ""}`}
                          placeholder="e.g. 15 (for 15% OFF)"
                          value={formDiscountPercent}
                          onChange={(e) => {
                            setFormDiscountPercent(e.target.value);
                            setFormErrors((prev) => ({ ...prev, discountPercent: null }));
                          }}
                          required
                        />
                      </div>
                      {formErrors.discountPercent && (
                        <div className="text-danger small mt-1">{formErrors.discountPercent}</div>
                      )}
                    </div>

                    {/* Max Discount Amount */}
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold text-dark">
                        Max Discount Cap ($)
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-light text-muted">$</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          className="form-control"
                          placeholder="Optional maximum discount (e.g. 50.00)"
                          value={formMaxDiscount}
                          onChange={(e) => setFormMaxDiscount(e.target.value)}
                        />
                      </div>
                      <small className="text-muted">Leave empty for no maximum cap.</small>
                    </div>

                    {/* Minimum Order Amount */}
                    <div className="col-12">
                      <label className="form-label fw-semibold text-dark">
                        Minimum Order Amount ($)
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-light text-muted">$</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          className={`form-control ${formErrors.minOrderAmount ? "is-invalid" : ""}`}
                          placeholder="0 for no minimum"
                          value={formMinOrderAmount}
                          onChange={(e) => setFormMinOrderAmount(e.target.value)}
                        />
                      </div>
                      <small className="text-muted">Minimum subtotal before voucher can be applied.</small>
                    </div>

                    {/* Date Range */}
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold text-dark">Start Date (Optional)</label>
                      <input
                        type="datetime-local"
                        className="form-control"
                        value={formStartDate}
                        onChange={(e) => setFormStartDate(e.target.value)}
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold text-dark">End Date / Expiry</label>
                      <input
                        type="datetime-local"
                        className={`form-control ${formErrors.endDate ? "is-invalid" : ""}`}
                        value={formEndDate}
                        onChange={(e) => setFormEndDate(e.target.value)}
                      />
                      {formErrors.endDate && (
                        <div className="text-danger small mt-1">{formErrors.endDate}</div>
                      )}
                    </div>

                    {/* Usage Limits */}
                    <div className="col-12">
                      <label className="form-label fw-semibold text-dark">Usage Limit</label>
                      <div className="d-flex align-items-center gap-3">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="unlimitedCreateCheck"
                            checked={isUnlimitedUsage}
                            onChange={(e) => {
                              setIsUnlimitedUsage(e.target.checked);
                              if (e.target.checked) setFormUsageLimit("");
                            }}
                          />
                          <label className="form-check-label text-dark" htmlFor="unlimitedCreateCheck">
                            Unlimited redemptions
                          </label>
                        </div>
                        {!isUnlimitedUsage && (
                          <div className="input-group" style={{ maxWidth: 220 }}>
                            <span className="input-group-text bg-light text-muted">
                              <i className="fa-solid fa-users"></i>
                            </span>
                            <input
                              type="number"
                              min="1"
                              className={`form-control ${formErrors.usageLimit ? "is-invalid" : ""}`}
                              placeholder="e.g. 100"
                              value={formUsageLimit}
                              onChange={(e) => setFormUsageLimit(e.target.value)}
                              required={!isUnlimitedUsage}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="modal-footer px-4 py-3 bg-light border-top">
                  <button
                    type="button"
                    className="btn btn-outline-secondary px-4"
                    onClick={() => setIsAddModalOpen(false)}
                    disabled={formSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary px-4 fw-semibold"
                    style={{ backgroundColor: "var(--admin-primary)", borderColor: "var(--admin-primary)" }}
                    disabled={formSubmitting}
                  >
                    {formSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Creating...
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-check me-1"></i> Create Voucher
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* EDIT VOUCHER MODAL                                                        */}
      {/* ========================================================================= */}
      {isEditModalOpen && selectedVoucher && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(15, 23, 42, 0.65)" }}
          tabIndex="-1"
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content rounded-4 border-0 shadow-lg overflow-hidden">
              {/* Modal Header */}
              <div
                className="modal-header px-4 py-3 border-bottom text-white"
                style={{ backgroundColor: "#1e293b" }}
              >
                <div className="d-flex align-items-center gap-2">
                  <div
                    className="rounded-circle bg-white text-dark d-flex align-items-center justify-content-center"
                    style={{ width: 34, height: 34 }}
                  >
                    <i className="fa-solid fa-pen-to-square"></i>
                  </div>
                  <div>
                    <h5 className="modal-title fw-bold text-white mb-0">
                      Edit Voucher: {selectedVoucher.code}
                    </h5>
                    <small className="text-white-50">
                      Update coupon code, discount percentage, validity, and limits
                    </small>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setIsEditModalOpen(false)}
                ></button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleUpdateVoucher}>
                <div className="modal-body p-4" style={{ maxHeight: "70vh", overflowY: "auto" }}>
                  {/* Server Duplicate Error Alert */}
                  {formServerDuplicateError && (
                    <div className="alert alert-danger d-flex align-items-center gap-2 mb-3">
                      <i className="fa-solid fa-circle-exclamation fs-5"></i>
                      <div className="flex-grow-1 fw-medium">{formServerDuplicateError}</div>
                    </div>
                  )}

                  <div className="row g-3">
                    {/* Voucher Code */}
                    <div className="col-12 col-md-7">
                      <label className="form-label fw-semibold text-dark">
                        Voucher Code <span className="text-danger">*</span>
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-light text-muted">
                          <i className="fa-solid fa-barcode"></i>
                        </span>
                        <input
                          type="text"
                          className={`form-control font-monospace fw-bold text-uppercase ${
                            formErrors.code || formServerDuplicateError ? "is-invalid" : ""
                          }`}
                          value={formCode}
                          onChange={(e) => {
                            setFormCode(e.target.value.toUpperCase());
                            setFormServerDuplicateError("");
                            setFormErrors((prev) => ({ ...prev, code: null }));
                          }}
                          required
                        />
                      </div>
                      {formErrors.code && (
                        <div className="text-danger small mt-1">{formErrors.code}</div>
                      )}
                    </div>

                    {/* Active Switch */}
                    <div className="col-12 col-md-5 d-flex align-items-center justify-content-md-end pt-3">
                      <div className="form-check form-switch fs-6">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          role="switch"
                          id="editActiveSwitch"
                          checked={formIsActive}
                          onChange={(e) => setFormIsActive(e.target.checked)}
                        />
                        <label className="form-check-label fw-semibold ms-2" htmlFor="editActiveSwitch">
                          {formIsActive ? "Status: Active" : "Status: Inactive"}
                        </label>
                      </div>
                    </div>

                    {/* Discount Percentage */}
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold text-dark">
                        Discount Percentage (%) <span className="text-danger">*</span>
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-light text-muted">%</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0.01"
                          max="100"
                          className={`form-control ${formErrors.discountPercent ? "is-invalid" : ""}`}
                          value={formDiscountPercent}
                          onChange={(e) => {
                            setFormDiscountPercent(e.target.value);
                            setFormErrors((prev) => ({ ...prev, discountPercent: null }));
                          }}
                          required
                        />
                      </div>
                      {formErrors.discountPercent && (
                        <div className="text-danger small mt-1">{formErrors.discountPercent}</div>
                      )}
                    </div>

                    {/* Max Discount Amount */}
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold text-dark">
                        Max Discount Cap ($)
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-light text-muted">$</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          className="form-control"
                          value={formMaxDiscount}
                          onChange={(e) => setFormMaxDiscount(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Minimum Order Amount */}
                    <div className="col-12">
                      <label className="form-label fw-semibold text-dark">
                        Minimum Order Amount ($)
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-light text-muted">$</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          className={`form-control ${formErrors.minOrderAmount ? "is-invalid" : ""}`}
                          value={formMinOrderAmount}
                          onChange={(e) => setFormMinOrderAmount(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Date Range */}
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold text-dark">Start Date</label>
                      <input
                        type="datetime-local"
                        className="form-control"
                        value={formStartDate}
                        onChange={(e) => setFormStartDate(e.target.value)}
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold text-dark">End Date / Expiry</label>
                      <input
                        type="datetime-local"
                        className={`form-control ${formErrors.endDate ? "is-invalid" : ""}`}
                        value={formEndDate}
                        onChange={(e) => setFormEndDate(e.target.value)}
                      />
                      {formErrors.endDate && (
                        <div className="text-danger small mt-1">{formErrors.endDate}</div>
                      )}
                    </div>

                    {/* Usage Limits */}
                    <div className="col-12">
                      <label className="form-label fw-semibold text-dark">Usage Limit</label>
                      <div className="d-flex align-items-center gap-3">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="unlimitedEditCheck"
                            checked={isUnlimitedUsage}
                            onChange={(e) => {
                              setIsUnlimitedUsage(e.target.checked);
                              if (e.target.checked) setFormUsageLimit("");
                            }}
                          />
                          <label className="form-check-label text-dark" htmlFor="unlimitedEditCheck">
                            Unlimited redemptions
                          </label>
                        </div>
                        {!isUnlimitedUsage && (
                          <div className="input-group" style={{ maxWidth: 220 }}>
                            <span className="input-group-text bg-light text-muted">
                              <i className="fa-solid fa-users"></i>
                            </span>
                            <input
                              type="number"
                              min="1"
                              className={`form-control ${formErrors.usageLimit ? "is-invalid" : ""}`}
                              value={formUsageLimit}
                              onChange={(e) => setFormUsageLimit(e.target.value)}
                              required={!isUnlimitedUsage}
                            />
                          </div>
                        )}
                      </div>
                      <div className="text-muted small mt-2">
                        Currently used: <strong>{selectedVoucher.usedCount || 0}</strong> times
                      </div>
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="modal-footer px-4 py-3 bg-light border-top">
                  <button
                    type="button"
                    className="btn btn-outline-secondary px-4"
                    onClick={() => setIsEditModalOpen(false)}
                    disabled={formSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary px-4 fw-semibold"
                    style={{ backgroundColor: "var(--admin-primary)", borderColor: "var(--admin-primary)" }}
                    disabled={formSubmitting}
                  >
                    {formSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Saving...
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-check me-1"></i> Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VOUCHER DETAIL MODAL                                                      */}
      {/* ========================================================================= */}
      {isDetailModalOpen && selectedVoucher && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(15, 23, 42, 0.65)" }}
          tabIndex="-1"
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow-lg overflow-hidden">
              <div
                className="modal-header px-4 py-3 border-bottom text-white"
                style={{ backgroundColor: "var(--admin-primary)" }}
              >
                <div className="d-flex align-items-center gap-2">
                  <i className="fa-solid fa-ticket fa-lg"></i>
                  <h5 className="modal-title fw-bold text-white mb-0">Voucher Details</h5>
                </div>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setIsDetailModalOpen(false)}
                ></button>
              </div>

              <div className="modal-body p-4">
                {/* Visual Card Banner */}
                <div
                  className="p-3 rounded-3 text-center mb-3"
                  style={{
                    background: "linear-gradient(135deg, #fff0eb 0%, #ffe4dc 100%)",
                    border: "1.5px dashed var(--admin-primary)",
                  }}
                >
                  <span className="badge bg-primary px-3 py-1 font-monospace fs-5 fw-bold mb-2">
                    {selectedVoucher.code}
                  </span>
                  <h4 className="fw-bold text-dark mb-1">
                    {selectedVoucher.discountPercent}% DISCOUNT
                  </h4>
                </div>

                <div className="list-group list-group-flush small">
                  <div className="list-group-item d-flex justify-content-between px-0 py-2">
                    <span className="text-muted">Status:</span>
                    <span className={`badge ${getStatusBadge(selectedVoucher).className}`}>
                      {getStatusBadge(selectedVoucher).label}
                    </span>
                  </div>
                  <div className="list-group-item d-flex justify-content-between px-0 py-2">
                    <span className="text-muted">Discount Percent:</span>
                    <span className="fw-semibold text-dark">
                      {selectedVoucher.discountPercent}%
                    </span>
                  </div>
                  <div className="list-group-item d-flex justify-content-between px-0 py-2">
                    <span className="text-muted">Max Discount Cap:</span>
                    <span className="fw-semibold text-dark">
                      {selectedVoucher.maxDiscount
                        ? money(selectedVoucher.maxDiscount)
                        : "No maximum limit"}
                    </span>
                  </div>
                  <div className="list-group-item d-flex justify-content-between px-0 py-2">
                    <span className="text-muted">Minimum Order Amount:</span>
                    <span className="fw-semibold text-dark">
                      {selectedVoucher.minOrderAmount && Number(selectedVoucher.minOrderAmount) > 0
                        ? money(selectedVoucher.minOrderAmount)
                        : "No minimum spend"}
                    </span>
                  </div>
                  <div className="list-group-item d-flex justify-content-between px-0 py-2">
                    <span className="text-muted">Start Date:</span>
                    <span className="fw-semibold text-dark">
                      {formatDate(selectedVoucher.startDate)}
                    </span>
                  </div>
                  <div className="list-group-item d-flex justify-content-between px-0 py-2">
                    <span className="text-muted">Expiration Date:</span>
                    <span className="fw-semibold text-dark">
                      {formatDate(selectedVoucher.endDate)}
                    </span>
                  </div>
                  <div className="list-group-item d-flex justify-content-between px-0 py-2">
                    <span className="text-muted">Times Used:</span>
                    <span className="fw-semibold text-dark">
                      {selectedVoucher.usedCount || 0}
                      {selectedVoucher.usageLimit ? ` / ${selectedVoucher.usageLimit}` : " (Unlimited)"}
                    </span>
                  </div>
                  <div className="list-group-item d-flex justify-content-between px-0 py-2">
                    <span className="text-muted">Created At:</span>
                    <span className="fw-semibold text-dark">
                      {formatDate(selectedVoucher.createdAt)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="modal-footer px-4 py-2.5 bg-light border-top">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm px-4"
                  onClick={() => setIsDetailModalOpen(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DELETE CONFIRM DIALOG                                                     */}
      {/* ========================================================================= */}
      <ConfirmDialog
        isOpen={isDeleteConfirmOpen}
        title="Delete Voucher"
        message={`Are you sure you want to permanently delete voucher "${voucherToDelete?.code}"? This action cannot be undone.`}
        confirmText="Yes, Delete"
        cancelText="Cancel"
        confirmVariant="danger"
        isLoading={deleteLoading}
        onConfirm={handleDeleteVoucher}
        onCancel={() => {
          setIsDeleteConfirmOpen(false);
          setVoucherToDelete(null);
        }}
      />
    </div>
  );
};

export default AdminVoucherManagement;
