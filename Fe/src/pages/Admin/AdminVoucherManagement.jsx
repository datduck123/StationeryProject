import React, { useEffect, useMemo, useState } from "react";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import { useToast } from "../../providers/ToastContext";
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

const getPageNumbers = (current, total) => {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  if (current <= 4) {
    return [1, 2, 3, 4, 5, "...", total];
  }
  if (current >= total - 3) {
    return [1, "...", total - 4, total - 3, total - 2, total - 1, total];
  }
  return [1, "...", current - 1, current, current + 1, "...", total];
};

export const AdminVoucherManagement = () => {
  const { showToast } = useToast();
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Filters & Search & Pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("createdAt:desc");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

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
      const msg =
        err.response?.data?.message ||
        (err.response?.status === 403
          ? "Access denied: Admin permission is required. Please login with an Admin account."
          : err.response?.status === 401
          ? "Your login session has expired. Please log in again."
          : "Failed to load voucher list. Please check backend connection.");
      setError(msg);
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
    showToast(`Voucher code "${code}" copied to clipboard!`, "success");
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Generate random voucher code (max 8 chars)
  const handleGenerateRandomCode = () => {
    const prefixes = ["PROMO", "SAVE", "DEAL", "SUM", "VIP", "SALE"];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const remainingDigits = 8 - prefix.length;
    const minNum = Math.pow(10, remainingDigits - 1);
    const maxNum = Math.pow(10, remainingDigits) - 1;
    const randomNum = Math.floor(minNum + Math.random() * (maxNum - minNum + 1));
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

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredVouchers.length / pageSize));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(Math.max(1, totalPages));
    }
  }, [filteredVouchers.length, totalPages, currentPage]);

  const displayedVouchers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredVouchers.slice(start, start + pageSize);
  }, [filteredVouchers, currentPage, pageSize]);

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
    } else if (code.length < 2 || code.length > 8) {
      errors.code = "Voucher code must be between 2 and 8 characters";
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
      } else if (
        isEditModalOpen &&
        selectedVoucher &&
        selectedVoucher.usedCount != null &&
        limitVal < selectedVoucher.usedCount
      ) {
        errors.usageLimit = `Usage limit (${limitVal}) cannot be less than current used count (${selectedVoucher.usedCount})`;
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

  // Helper to format date for API payload without UTC shift
  const formatDateTimePayload = (dateStr) => {
    if (!dateStr) return null;
    if (dateStr.length === 16) return `${dateStr}:00`;
    return dateStr;
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
        startDate: formatDateTimePayload(formStartDate),
        endDate: formatDateTimePayload(formEndDate),
        usageLimit: !isUnlimitedUsage && formUsageLimit ? parseInt(formUsageLimit, 10) : null,
        isActive: formIsActive,
      };

      const created = await voucherService.createVoucher(payload);
      setVouchers((prev) => [created, ...prev]);
      showToast(`Voucher code "${created.code}" created successfully!`, "success");
      setSuccessMsg(`Voucher code "${created.code}" created successfully!`);
      setIsAddModalOpen(false);
      resetForm();
    } catch (err) {
      console.error("Failed to create voucher:", err);
      const errMsg =
        err.response?.status === 409
          ? `Voucher code "${formCode.trim().toUpperCase()}" already exists! Please use a unique code.`
          : err.response?.data?.message || "Failed to create voucher. Please check inputs.";
      setFormServerDuplicateError(errMsg);
      showToast(errMsg, "error");
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
        startDate: formatDateTimePayload(formStartDate),
        endDate: formatDateTimePayload(formEndDate),
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
      showToast(`Voucher code "${updated.code}" updated successfully!`, "success");
      setSuccessMsg(`Voucher code "${updated.code}" updated successfully!`);
      setIsEditModalOpen(false);
      resetForm();
    } catch (err) {
      console.error("Failed to update voucher:", err);
      const errMsg =
        err.response?.status === 409
          ? `Voucher code "${formCode.trim().toUpperCase()}" already exists for another voucher!`
          : err.response?.data?.message || "Failed to update voucher. Please try again.";
      setFormServerDuplicateError(errMsg);
      showToast(errMsg, "error");
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
      const msg = `Voucher "${updated.code}" is now ${updated.isActive ? "ACTIVE" : "INACTIVE"}.`;
      showToast(msg, "success");
      setSuccessMsg(msg);
    } catch (err) {
      console.error("Failed to toggle status:", err);
      const errMsg = err.response?.data?.message || "Failed to change voucher status.";
      setError(errMsg);
      showToast(errMsg, "error");
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
      const msg = `Voucher "${voucherToDelete.code}" deleted permanently.`;
      showToast(msg, "success");
      setSuccessMsg(msg);
      setIsDeleteConfirmOpen(false);
      setVoucherToDelete(null);
    } catch (err) {
      console.error("Failed to delete voucher:", err);
      const errMsg = err.response?.data?.message || "Failed to delete voucher from system.";
      setError(errMsg);
      showToast(errMsg, "error");
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
                displayedVouchers.map((v, idx) => {
                  const badge = getStatusBadge(v);
                  const usagePercent =
                    v.usageLimit && v.usageLimit > 0
                      ? Math.min(100, Math.round(((v.usedCount || 0) / v.usageLimit) * 100))
                      : null;
                  const itemIndex = (currentPage - 1) * pageSize + idx + 1;

                  return (
                    <tr key={v.voucherId}>
                      <td className="text-muted small">{itemIndex}</td>

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

        {/* Pagination Footer */}
        <div className="d-flex flex-wrap justify-content-between align-items-center mt-3 pt-3 border-top gap-3">
          <span className="text-muted fs-13">
            Showing{" "}
            <strong>
              {filteredVouchers.length === 0
                ? 0
                : (currentPage - 1) * pageSize + 1}{" "}
              to{" "}
              {Math.min(currentPage * pageSize, filteredVouchers.length)}
            </strong>{" "}
            of <strong>{filteredVouchers.length}</strong> vouchers
          </span>

          {totalPages > 1 && (
            <div className="btn-group btn-group-sm" role="group" aria-label="Voucher pagination">
              <button
                type="button"
                className="btn btn-light border"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                title="Previous page"
              >
                &lt;
              </button>
              {getPageNumbers(currentPage, totalPages).map((item, idx) =>
                item === "..." ? (
                  <span key={`ellipsis-${idx}`} className="btn btn-light border disabled px-2">
                    ...
                  </span>
                ) : (
                  <button
                    key={item}
                    type="button"
                    className={`btn ${
                      item === currentPage
                        ? "btn-dark bg-color-primary border-0 fw-700 text-white"
                        : "btn-light border"
                    }`}
                    onClick={() => setCurrentPage(item)}
                  >
                    {item}
                  </button>
                )
              )}
              <button
                type="button"
                className="btn btn-light border"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                title="Next page"
              >
                &gt;
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ADD / CREATE VOUCHER MODAL                                                */}
      {/* ========================================================================= */}
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
            if (e.target === e.currentTarget && !formSubmitting) {
              setIsAddModalOpen(false);
            }
          }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div
              className="modal-content admin-modal-card shadow-lg border-0 rounded-4 p-4"
              style={{ background: "#ffffff" }}
            >
              {/* Header */}
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="fw-700 mb-0">Create New Voucher</h4>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setIsAddModalOpen(false)}
                  disabled={formSubmitting}
                ></button>
              </div>

              {/* Form */}
              <form onSubmit={handleCreateVoucher} noValidate>
                {/* Server Duplicate Error Alert */}
                {formServerDuplicateError && (
                  <div className="alert alert-danger d-flex align-items-center gap-2 mb-3 py-2 px-3 br-10 fs-13">
                    <i className="fa-solid fa-circle-exclamation"></i>
                    <div>{formServerDuplicateError}</div>
                  </div>
                )}

                {/* Voucher Code */}
                <div className="auth-field-wrapper mb-3 position-relative">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <label className="form-label fw-600 mb-0">
                      Voucher Code <span className="text-danger">*</span>
                    </label>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary rounded-pill py-0 px-2 fs-12"
                      onClick={handleGenerateRandomCode}
                      title="Generate random coupon code"
                    >
                      <i className="fa-solid fa-shuffle me-1"></i> Random
                    </button>
                  </div>
                  <div className="input-block">
                    <input
                      type="text"
                      maxLength={8}
                      className={`form-control form-control-2 font-monospace fw-bold text-uppercase ${
                        formErrors.code || formServerDuplicateError ? "is-invalid" : ""
                      }`}
                      placeholder="e.g. SAVE20, VIP50"
                      value={formCode}
                      onChange={(e) => {
                        setFormCode(e.target.value.toUpperCase().slice(0, 8));
                        setFormServerDuplicateError("");
                        setFormErrors((prev) => ({ ...prev, code: null }));
                      }}
                      disabled={formSubmitting}
                      required
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
                      <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
                      <path d="M13 5v2" />
                      <path d="M13 17v2" />
                      <path d="M13 11v2" />
                    </svg>
                  </div>
                  {formErrors.code && (
                    <div className="text-danger small mt-1">{formErrors.code}</div>
                  )}
                </div>

                {/* Discount Percentage & Max Discount Cap */}
                <div className="row">
                  <div className="col-sm-6 mb-3">
                    <div className="auth-field-wrapper position-relative">
                      <label className="form-label fw-600 mb-1">
                        Discount Percentage (%) <span className="text-danger">*</span>
                      </label>
                      <div className="input-block">
                        <input
                          type="number"
                          step="0.01"
                          min="0.01"
                          max="100"
                          className={`form-control form-control-2 ${
                            formErrors.discountPercent ? "is-invalid" : ""
                          }`}
                          placeholder="e.g. 15"
                          value={formDiscountPercent}
                          onChange={(e) => {
                            setFormDiscountPercent(e.target.value);
                            setFormErrors((prev) => ({ ...prev, discountPercent: null }));
                          }}
                          disabled={formSubmitting}
                          required
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
                          <line x1="19" y1="5" x2="5" y2="19" />
                          <circle cx="6.5" cy="6.5" r="2.5" />
                          <circle cx="17.5" cy="17.5" r="2.5" />
                        </svg>
                      </div>
                      {formErrors.discountPercent && (
                        <div className="text-danger small mt-1">{formErrors.discountPercent}</div>
                      )}
                    </div>
                  </div>

                  <div className="col-sm-6 mb-3">
                    <div className="auth-field-wrapper position-relative">
                      <label className="form-label fw-600 mb-1">
                        Max Discount Cap ($)
                      </label>
                      <div className="input-block">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          className="form-control form-control-2"
                          placeholder="No cap if empty"
                          value={formMaxDiscount}
                          onChange={(e) => setFormMaxDiscount(e.target.value)}
                          disabled={formSubmitting}
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
                          <line x1="12" y1="2" x2="12" y2="22" />
                          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Minimum Order Amount & Account Status */}
                <div className="row">
                  <div className="col-sm-6 mb-3">
                    <div className="auth-field-wrapper position-relative">
                      <label className="form-label fw-600 mb-1">
                        Min Order Amount ($)
                      </label>
                      <div className="input-block">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          className={`form-control form-control-2 ${
                            formErrors.minOrderAmount ? "is-invalid" : ""
                          }`}
                          placeholder="0 for no min"
                          value={formMinOrderAmount}
                          onChange={(e) => setFormMinOrderAmount(e.target.value)}
                          disabled={formSubmitting}
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
                          <circle cx="8" cy="21" r="1" />
                          <circle cx="19" cy="21" r="1" />
                          <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="col-sm-6 mb-3">
                    <label className="form-label fw-600 mb-1">
                      Account Status *
                    </label>
                    <select
                      className="form-select form-control-2"
                      value={formIsActive ? "ACTIVE" : "INACTIVE"}
                      onChange={(e) => setFormIsActive(e.target.value === "ACTIVE")}
                      disabled={formSubmitting}
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="INACTIVE">INACTIVE</option>
                    </select>
                  </div>
                </div>

                {/* Start Date & End Date */}
                <div className="row">
                  <div className="col-sm-6 mb-3">
                    <div className="auth-field-wrapper position-relative">
                      <label className="form-label fw-600 mb-1">Start Date</label>
                      <div className="input-block">
                        <input
                          type="datetime-local"
                          className="form-control form-control-2"
                          value={formStartDate}
                          onChange={(e) => setFormStartDate(e.target.value)}
                          disabled={formSubmitting}
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
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="col-sm-6 mb-3">
                    <div className="auth-field-wrapper position-relative">
                      <label className="form-label fw-600 mb-1">End Date / Expiry</label>
                      <div className="input-block">
                        <input
                          type="datetime-local"
                          className={`form-control form-control-2 ${
                            formErrors.endDate ? "is-invalid" : ""
                          }`}
                          value={formEndDate}
                          onChange={(e) => setFormEndDate(e.target.value)}
                          disabled={formSubmitting}
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
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                      </div>
                      {formErrors.endDate && (
                        <div className="text-danger small mt-1">{formErrors.endDate}</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Usage Limits */}
                <div className="auth-field-wrapper mb-4 position-relative">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <label className="form-label fw-600 mb-0">Usage Limit</label>
                    <div className="form-check form-check-inline m-0">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="unlimitedCreateCheck"
                        checked={isUnlimitedUsage}
                        onChange={(e) => {
                          setIsUnlimitedUsage(e.target.checked);
                          if (e.target.checked) setFormUsageLimit("");
                        }}
                        disabled={formSubmitting}
                      />
                      <label
                        className="form-check-label fs-13 text-muted"
                        htmlFor="unlimitedCreateCheck"
                      >
                        Unlimited redemptions
                      </label>
                    </div>
                  </div>
                  <div className="input-block">
                    {!isUnlimitedUsage ? (
                      <input
                        type="number"
                        min="1"
                        className={`form-control form-control-2 ${
                          formErrors.usageLimit ? "is-invalid" : ""
                        }`}
                        placeholder="e.g. 100"
                        value={formUsageLimit}
                        onChange={(e) => setFormUsageLimit(e.target.value)}
                        disabled={formSubmitting}
                        required={!isUnlimitedUsage}
                      />
                    ) : (
                      <input
                        type="text"
                        className="form-control form-control-2 bg-light text-muted"
                        value="Unlimited (No redemption limit)"
                        disabled
                        readOnly
                      />
                    )}
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
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  </div>
                  {formErrors.usageLimit && (
                    <div className="text-danger small mt-1">{formErrors.usageLimit}</div>
                  )}
                </div>

                {/* Footer Buttons */}
                <div className="d-flex justify-content-end gap-2 mt-4 pt-2">
                  <button
                    type="button"
                    className="btn btn-light rounded-pill px-4 fw-600 border"
                    onClick={() => setIsAddModalOpen(false)}
                    disabled={formSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="admin-btn-primary px-4"
                    disabled={formSubmitting}
                  >
                    {formSubmitting ? "Creating..." : "Create Voucher"}
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
          tabIndex="-1"
          style={{
            backgroundColor: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(2px)",
            zIndex: 1050,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget && !formSubmitting) {
              setIsEditModalOpen(false);
            }
          }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div
              className="modal-content admin-modal-card shadow-lg border-0 rounded-4 p-4"
              style={{ background: "#ffffff" }}
            >
              {/* Header */}
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="fw-700 mb-0">Edit Voucher</h4>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={formSubmitting}
                ></button>
              </div>

              {/* Form */}
              <form onSubmit={handleUpdateVoucher} noValidate>
                {/* Server Duplicate Error Alert */}
                {formServerDuplicateError && (
                  <div className="alert alert-danger d-flex align-items-center gap-2 mb-3 py-2 px-3 br-10 fs-13">
                    <i className="fa-solid fa-circle-exclamation"></i>
                    <div>{formServerDuplicateError}</div>
                  </div>
                )}

                {/* Voucher Code */}
                <div className="auth-field-wrapper mb-3 position-relative">
                  <label className="form-label fw-600 mb-1">
                    Voucher Code <span className="text-danger">*</span>
                  </label>
                  <div className="input-block">
                    <input
                      type="text"
                      maxLength={8}
                      className={`form-control form-control-2 font-monospace fw-bold text-uppercase ${
                        formErrors.code || formServerDuplicateError ? "is-invalid" : ""
                      }`}
                      placeholder="e.g. SAVE20, VIP50"
                      value={formCode}
                      onChange={(e) => {
                        setFormCode(e.target.value.toUpperCase().slice(0, 8));
                        setFormServerDuplicateError("");
                        setFormErrors((prev) => ({ ...prev, code: null }));
                      }}
                      disabled={formSubmitting}
                      required
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
                      <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
                      <path d="M13 5v2" />
                      <path d="M13 17v2" />
                      <path d="M13 11v2" />
                    </svg>
                  </div>
                  {formErrors.code && (
                    <div className="text-danger small mt-1">{formErrors.code}</div>
                  )}
                </div>

                {/* Discount Percentage & Max Discount Cap */}
                <div className="row">
                  <div className="col-sm-6 mb-3">
                    <div className="auth-field-wrapper position-relative">
                      <label className="form-label fw-600 mb-1">
                        Discount Percentage (%) <span className="text-danger">*</span>
                      </label>
                      <div className="input-block">
                        <input
                          type="number"
                          step="0.01"
                          min="0.01"
                          max="100"
                          className={`form-control form-control-2 ${
                            formErrors.discountPercent ? "is-invalid" : ""
                          }`}
                          value={formDiscountPercent}
                          onChange={(e) => {
                            setFormDiscountPercent(e.target.value);
                            setFormErrors((prev) => ({ ...prev, discountPercent: null }));
                          }}
                          disabled={formSubmitting}
                          required
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
                          <line x1="19" y1="5" x2="5" y2="19" />
                          <circle cx="6.5" cy="6.5" r="2.5" />
                          <circle cx="17.5" cy="17.5" r="2.5" />
                        </svg>
                      </div>
                      {formErrors.discountPercent && (
                        <div className="text-danger small mt-1">{formErrors.discountPercent}</div>
                      )}
                    </div>
                  </div>

                  <div className="col-sm-6 mb-3">
                    <div className="auth-field-wrapper position-relative">
                      <label className="form-label fw-600 mb-1">
                        Max Discount Cap ($)
                      </label>
                      <div className="input-block">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          className="form-control form-control-2"
                          placeholder="No cap"
                          value={formMaxDiscount}
                          onChange={(e) => setFormMaxDiscount(e.target.value)}
                          disabled={formSubmitting}
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
                          <line x1="12" y1="2" x2="12" y2="22" />
                          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Minimum Order Amount & Account Status */}
                <div className="row">
                  <div className="col-sm-6 mb-3">
                    <div className="auth-field-wrapper position-relative">
                      <label className="form-label fw-600 mb-1">
                        Min Order Amount ($)
                      </label>
                      <div className="input-block">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          className={`form-control form-control-2 ${
                            formErrors.minOrderAmount ? "is-invalid" : ""
                          }`}
                          value={formMinOrderAmount}
                          onChange={(e) => setFormMinOrderAmount(e.target.value)}
                          disabled={formSubmitting}
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
                          <circle cx="8" cy="21" r="1" />
                          <circle cx="19" cy="21" r="1" />
                          <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="col-sm-6 mb-3">
                    <label className="form-label fw-600 mb-1">
                      Account Status *
                    </label>
                    <select
                      className="form-select form-control-2"
                      value={formIsActive ? "ACTIVE" : "INACTIVE"}
                      onChange={(e) => setFormIsActive(e.target.value === "ACTIVE")}
                      disabled={formSubmitting}
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="INACTIVE">INACTIVE</option>
                    </select>
                  </div>
                </div>

                {/* Start Date & End Date */}
                <div className="row">
                  <div className="col-sm-6 mb-3">
                    <div className="auth-field-wrapper position-relative">
                      <label className="form-label fw-600 mb-1">Start Date</label>
                      <div className="input-block">
                        <input
                          type="datetime-local"
                          className="form-control form-control-2"
                          value={formStartDate}
                          onChange={(e) => setFormStartDate(e.target.value)}
                          disabled={formSubmitting}
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
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="col-sm-6 mb-3">
                    <div className="auth-field-wrapper position-relative">
                      <label className="form-label fw-600 mb-1">End Date / Expiry</label>
                      <div className="input-block">
                        <input
                          type="datetime-local"
                          className={`form-control form-control-2 ${
                            formErrors.endDate ? "is-invalid" : ""
                          }`}
                          value={formEndDate}
                          onChange={(e) => setFormEndDate(e.target.value)}
                          disabled={formSubmitting}
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
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                      </div>
                      {formErrors.endDate && (
                        <div className="text-danger small mt-1">{formErrors.endDate}</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Usage Limits */}
                <div className="auth-field-wrapper mb-4 position-relative">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <label className="form-label fw-600 mb-0">Usage Limit</label>
                    <div className="form-check form-check-inline m-0">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="unlimitedEditCheck"
                        checked={isUnlimitedUsage}
                        onChange={(e) => {
                          setIsUnlimitedUsage(e.target.checked);
                          if (e.target.checked) setFormUsageLimit("");
                        }}
                        disabled={formSubmitting}
                      />
                      <label
                        className="form-check-label fs-13 text-muted"
                        htmlFor="unlimitedEditCheck"
                      >
                        Unlimited redemptions
                      </label>
                    </div>
                  </div>
                  <div className="input-block">
                    {!isUnlimitedUsage ? (
                      <input
                        type="number"
                        min="1"
                        className={`form-control form-control-2 ${
                          formErrors.usageLimit ? "is-invalid" : ""
                        }`}
                        value={formUsageLimit}
                        onChange={(e) => setFormUsageLimit(e.target.value)}
                        disabled={formSubmitting}
                        required={!isUnlimitedUsage}
                      />
                    ) : (
                      <input
                        type="text"
                        className="form-control form-control-2 bg-light text-muted"
                        value="Unlimited (No redemption limit)"
                        disabled
                        readOnly
                      />
                    )}
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
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  </div>
                  {formErrors.usageLimit && (
                    <div className="text-danger small mt-1">{formErrors.usageLimit}</div>
                  )}
                  <div className="text-muted small mt-2">
                    Currently used: <strong>{selectedVoucher.usedCount || 0}</strong> times
                  </div>
                  {selectedVoucher.usedCount > 0 && !isUnlimitedUsage && (
                    <div className="alert alert-warning py-1.5 px-3 mt-2 mb-0 d-flex align-items-center gap-2 fs-13">
                      <i className="fa-solid fa-triangle-exclamation text-warning"></i>
                      <span>
                        Usage limit must be at least <strong>{selectedVoucher.usedCount}</strong> (cannot be lower than the {selectedVoucher.usedCount} already redeemed).
                      </span>
                    </div>
                  )}
                </div>

                {/* Footer Buttons */}
                <div className="d-flex justify-content-end gap-2 mt-4 pt-2">
                  <button
                    type="button"
                    className="btn btn-light rounded-pill px-4 fw-600 border"
                    onClick={() => setIsEditModalOpen(false)}
                    disabled={formSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="admin-btn-primary px-4"
                    disabled={formSubmitting}
                  >
                    {formSubmitting ? "Saving..." : "Save Changes"}
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
              className="modal-content admin-modal-card shadow-lg border-0 rounded-4 p-4"
              style={{ background: "#ffffff" }}
            >
              {/* Header */}
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="fw-700 mb-0">Voucher Details</h4>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setIsDetailModalOpen(false)}
                ></button>
              </div>

              {/* Visual Card Banner matching User Details */}
              <div className="d-flex align-items-center gap-3 p-3 bg-light rounded-3 mb-3">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center text-white fw-700"
                  style={{
                    width: 50,
                    height: 50,
                    background: "#e9613f",
                    fontSize: 20,
                  }}
                >
                  <i className="fa-solid fa-ticket"></i>
                </div>
                <div>
                  <h5 className="mb-0 fw-700 font-monospace">{selectedVoucher.code}</h5>
                  <p className="text-muted fs-13 mb-0">
                    {selectedVoucher.discountPercent}% DISCOUNT
                  </p>
                </div>
                <div className="ms-auto d-flex flex-column align-items-end gap-1">
                  <span
                    className={`badge ${getStatusBadge(selectedVoucher).className} d-inline-flex align-items-center gap-1`}
                  >
                    <i className={`fa-solid ${getStatusBadge(selectedVoucher).icon}`}></i>
                    {getStatusBadge(selectedVoucher).label}
                  </span>
                </div>
              </div>

              {/* Information Grid */}
              <div className="row g-3 fs-14">
                <div className="col-6">
                  <span className="text-muted d-block">Voucher Code:</span>
                  <strong className="font-monospace text-primary">{selectedVoucher.code}</strong>
                </div>
                <div className="col-6">
                  <span className="text-muted d-block">Discount Rate:</span>
                  <strong>{selectedVoucher.discountPercent}% OFF</strong>
                </div>
                <div className="col-6">
                  <span className="text-muted d-block">Max Discount Cap:</span>
                  <strong>
                    {selectedVoucher.maxDiscount
                      ? money(selectedVoucher.maxDiscount)
                      : "No max cap"}
                  </strong>
                </div>
                <div className="col-6">
                  <span className="text-muted d-block">Min Order Amount:</span>
                  <strong>
                    {selectedVoucher.minOrderAmount && Number(selectedVoucher.minOrderAmount) > 0
                      ? money(selectedVoucher.minOrderAmount)
                      : "No minimum"}
                  </strong>
                </div>
                <div className="col-6">
                  <span className="text-muted d-block">Start Date:</span>
                  <span>{formatDate(selectedVoucher.startDate)}</span>
                </div>
                <div className="col-6">
                  <span className="text-muted d-block">Expiration Date:</span>
                  <span
                    className={
                      selectedVoucher.endDate &&
                      new Date(selectedVoucher.endDate) < new Date()
                        ? "text-danger fw-semibold"
                        : ""
                    }
                  >
                    {formatDate(selectedVoucher.endDate)}
                  </span>
                </div>
                <div className="col-6">
                  <span className="text-muted d-block">Times Used:</span>
                  <strong>
                    {selectedVoucher.usedCount || 0}
                    {selectedVoucher.usageLimit ? ` / ${selectedVoucher.usageLimit}` : " (Unlimited)"}
                  </strong>
                </div>
                <div className="col-6">
                  <span className="text-muted d-block">Created At:</span>
                  <span>{formatDate(selectedVoucher.createdAt)}</span>
                </div>
              </div>

              {/* Modal Footer */}
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
