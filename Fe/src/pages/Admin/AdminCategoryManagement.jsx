import React, { useCallback, useEffect, useMemo, useState } from "react";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import AdminPagination from "../../components/admin/AdminPagination";
import { useToast } from "../../providers/ToastContext";
import {
  adminCreateCategory,
  adminDeleteCategory,
  adminGetCategories,
  adminGetProducts,
  adminUpdateCategory,
  getProducts,
} from "../../services/productService";
import { notifyProductChange } from "../../utils/syncEvents";
import "../../styles/admin.css";

const FALLBACK_CATEGORIES = [
  {
    categoryId: 1,
    name: "Writing Instruments",
    slug: "pens-writing",
    description: "Pens and writing tools for students and office workers",
    productCount: 128,
    status: "ACTIVE",
    createdAt: "2024-01-15",
  },
  {
    categoryId: 2,
    name: "Notebooks",
    slug: "notebooks-journals",
    description: "Notebooks, journals and planners",
    productCount: 95,
    status: "ACTIVE",
    createdAt: "2024-01-18",
  },
  {
    categoryId: 3,
    name: "Paper",
    slug: "paper",
    description: "Printing paper, sticky notes and craft paper",
    productCount: 64,
    status: "ACTIVE",
    createdAt: "2024-02-05",
  },
  {
    categoryId: 4,
    name: "Study Supplies",
    slug: "study-supplies",
    description: "Supplies for studying and learning",
    productCount: 42,
    status: "ACTIVE",
    createdAt: "2024-02-20",
  },
  {
    categoryId: 5,
    name: "Office Supplies",
    slug: "office-supplies",
    description: "Products for office use",
    productCount: 38,
    status: "ACTIVE",
    createdAt: "2024-03-01",
  },
];

export const AdminCategoryManagement = () => {
  const { showToast } = useToast();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("name-asc");

  // Pagination state (Numbered pagination identical to User Management)
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [categoryDetail, setCategoryDetail] = useState(null);
  const [categoryToEdit, setCategoryToEdit] = useState(null);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [totalProductsCount, setTotalProductsCount] = useState(0);

  const handleOpenDetail = (cat) => {
    setCategoryDetail(cat);
    setIsDetailModalOpen(true);
  };

  // Form states
  const [formName, setFormName] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formStatus, setFormStatus] = useState("ACTIVE");
  const [formErrors, setFormErrors] = useState({});

  // Auto-generate slug from name
  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");
  };

  const handleNameChange = (e) => {
    const val = e.target.value;
    setFormName(val);
    if (!categoryToEdit) {
      setFormSlug(generateSlug(val));
    }
  };

  // Fetch categories & total products from API
  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const [catRes, prodRes] = await Promise.allSettled([
        adminGetCategories(),
        adminGetProducts({ page: 0, size: 1 }),
      ]);

      // Fetch all products including inactive for accurate statistics
      if (prodRes.status === "fulfilled" && prodRes.value?.data?.totalElements !== undefined) {
        setTotalProductsCount(prodRes.value.data.totalElements);
      } else {
        // Fallback: fetch via adminGetProducts
        try {
          const allProdRes = await adminGetProducts({ page: 0, size: 2000 });
          const total = allProdRes.data?.totalElements || allProdRes.data?.content?.length || 0;
          setTotalProductsCount(total);
        } catch (_) {}
      }

      if (catRes.status === "fulfilled") {
        const list = catRes.value.data || [];
        if (list.length > 0) {
          setCategories(
            list.map((c) => ({
              ...c,
              id: c.categoryId,
              slug: c.slug || generateSlug(c.name),
              status: c.status || "ACTIVE",
              productCount: c.productCount !== undefined && c.productCount !== null ? c.productCount : 0,
            }))
          );
        } else {
          setCategories(FALLBACK_CATEGORIES);
        }
      } else {
        console.warn("Falling back to local categories:", catRes.reason);
        setCategories(FALLBACK_CATEGORIES);
      }
    } catch (err) {
      console.warn("Falling back to local categories:", err);
      setCategories(FALLBACK_CATEGORIES);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Open Add Modal
  const openAddModal = () => {
    setCategoryToEdit(null);
    setFormName("");
    setFormSlug("");
    setFormDescription("");
    setFormStatus("ACTIVE");
    setFormErrors({});
    setIsAddModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (cat) => {
    setCategoryToEdit(cat);
    setFormName(cat.name);
    setFormSlug(cat.slug || generateSlug(cat.name));
    setFormDescription(cat.description || "");
    setFormStatus(cat.status || "ACTIVE");
    setFormErrors({});
    setIsEditModalOpen(true);
  };

  // Validate form
  const validateForm = (isEdit = false) => {
    const errors = {};
    const nameVal = formName.trim();

    if (!nameVal) {
      errors.name = "Category name cannot be empty.";
    } else if (nameVal.length < 5) {
      errors.name = "Category name must be at least 5 characters.";
    } else if (nameVal.length > 50) {
      errors.name = "Category name cannot exceed 50 characters.";
    } else if (/[^a-zA-Z\sÀ-ỹà-ỹĐđ]/.test(nameVal)) {
      errors.name = "Category name can only contain letters and spaces (no numbers or special characters).";
    } else {
      // Validate unique category name (case-insensitive)
      const currentId = isEdit && categoryToEdit ? (categoryToEdit.categoryId || categoryToEdit.id) : null;
      const isDuplicate = categories.some((c) => {
        const cId = c.categoryId || c.id;
        if (isEdit && cId === currentId) return false;
        return (c.name || "").trim().toLowerCase() === nameVal.toLowerCase();
      });
      if (isDuplicate) {
        errors.name = "Category name already exists. Please choose a different name.";
      }
    }

    const errorKeys = Object.keys(errors);
    if (errorKeys.length === 1) {
      setFormErrors({});
      showToast(errors[errorKeys[0]], "error", 8000);
      return false;
    } else if (errorKeys.length > 1) {
      setFormErrors(errors);
      showToast("Please review the invalid fields in the form.", "error", 8000);
      return false;
    }

    setFormErrors({});
    return true;
  };

  // Save new category
  const handleSaveAdd = async (e) => {
    e.preventDefault();
    if (!validateForm(false)) return;

    setActionLoading(true);
    try {
      await adminCreateCategory({
        name: formName.trim(),
        description: formDescription.trim(),
        status: formStatus,
      });
      setIsAddModalOpen(false);
      showToast(`Category "${formName.trim()}" created successfully!`, "success");
      fetchCategories();
      notifyProductChange();
    } catch (err) {
      console.error("API add category failed:", err);
      showToast(
        err.response?.data?.message || "Failed to create category. Name may already exist.",
        "error"
      );
    } finally {
      setActionLoading(false);
    }
  };

  // Save edited category
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!validateForm(true)) return;

    setActionLoading(true);
    const catId = categoryToEdit.categoryId || categoryToEdit.id;
    try {
      await adminUpdateCategory(catId, {
        name: formName.trim(),
        description: formDescription.trim(),
        status: formStatus,
      });
      setIsEditModalOpen(false);
      showToast(`Category "${formName.trim()}" updated successfully!`, "success");
      fetchCategories();
      notifyProductChange();
    } catch (err) {
      console.error("API update category failed:", err);
      showToast(err.response?.data?.message || "Failed to update category.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // Toggle status
  const handleToggleStatus = async (cat) => {
    const nextStatus = cat.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    const catId = cat.categoryId || cat.id;
    try {
      await adminUpdateCategory(catId, {
        name: cat.name,
        description: cat.description || "",
        status: nextStatus,
      });
      setCategories((prev) =>
        prev.map((c) =>
          (c.categoryId || c.id) === catId ? { ...c, status: nextStatus } : c
        )
      );
      showToast(`Category "${cat.name}" status changed to ${nextStatus}.`, "success");
      notifyProductChange();
    } catch (err) {
      console.error("Toggle status failed:", err);
      showToast(err.response?.data?.message || "Failed to change category status.", "error");
    }
  };

  // Delete category
  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return;

    setActionLoading(true);
    const catId = categoryToDelete.categoryId || categoryToDelete.id;
    try {
      await adminDeleteCategory(catId);
      setIsDeleteConfirmOpen(false);
      showToast(`Category "${categoryToDelete.name}" deleted successfully.`, "success");
      setCategoryToDelete(null);
      fetchCategories();
      notifyProductChange();
    } catch (err) {
      console.error("API delete category failed:", err);
      setIsDeleteConfirmOpen(false);
      setCategoryToDelete(null);
      showToast(
        err.response?.data?.message ||
        "Cannot delete category as it is linked to other products.",
        "error"
      );
    } finally {
      setActionLoading(false);
    }
  };

  // Filtered & sorted categories
  const filteredCategories = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    let result = categories.filter((cat) => {
      const matchQuery =
        !query ||
        cat.name.toLowerCase().includes(query) ||
        (cat.slug && cat.slug.toLowerCase().includes(query)) ||
        (cat.description && cat.description.toLowerCase().includes(query));
      const matchStatus =
        statusFilter === "ALL" ? true : cat.status === statusFilter;
      return matchQuery && matchStatus;
    });

    // Sorting
    result.sort((a, b) => {
      if (sortBy === "name-asc") return a.name.localeCompare(b.name);
      if (sortBy === "name-desc") return b.name.localeCompare(a.name);
      if (sortBy === "id-desc") return (b.categoryId || b.id || 0) - (a.categoryId || a.id || 0);
      if (sortBy === "id-asc") return (a.categoryId || a.id || 0) - (b.categoryId || b.id || 0);
      return 0;
    });

    return result;
  }, [categories, searchQuery, statusFilter, sortBy]);

  // Paginated slice
  const totalElements = filteredCategories.length;
  const totalPages = Math.ceil(totalElements / pageSize) || 1;

  // Auto adjust page when page exceeds totalPages (e.g. after deletion or filtering)
  useEffect(() => {
    if (page >= totalPages && totalPages > 0) {
      setPage(Math.max(0, totalPages - 1));
    }
  }, [totalPages, page]);

  const paginatedCategories = useMemo(() => {
    const start = page * pageSize;
    return filteredCategories.slice(start, start + pageSize);
  }, [filteredCategories, page, pageSize]);

  const activeCount = categories.filter((c) => c.status === "ACTIVE").length;
  const inactiveCount = categories.filter((c) => c.status === "INACTIVE").length;
  const totalProductsInSystem = useMemo(() => {
    const sumFromCats = categories.reduce((sum, c) => sum + (Number(c.productCount) || 0), 0);
    return Math.max(sumFromCats, totalProductsCount);
  }, [categories, totalProductsCount]);

  return (
    <div className="p-4">
      {/* Page Header (Synchronized with User Management) */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
        <div>
          <h4 className="fw-700 medium-black mb-1">Stationery Categories</h4>
          <p className="text-muted fs-13 mb-0">
            Manage stationery categories, classification, and store visibility.
          </p>
        </div>

        <button
          type="button"
          className="admin-btn-primary"
          onClick={openAddModal}
        >
          <i className="fa-solid fa-plus me-1"></i> Add Category
        </button>
      </div>

      {/* Top Banner Stats (Professional Cards with Icons) */}
      <div className="row g-3 mb-4">
        {/* Total Categories */}
        <div className="col-xl-3 col-sm-6">
          <div className="admin-stat-card p-3 bg-white rounded-3 border shadow-sm d-flex align-items-center justify-content-between">
            <div>
              <span className="text-muted fs-12 fw-600 text-uppercase">
                Total Categories
              </span>
              <h3 className="mb-0 fw-700 mt-1">{categories.length}</h3>
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
              <i className="fa-solid fa-layer-group fs-20"></i>
            </div>
          </div>
        </div>

        {/* Active Categories */}
        <div className="col-xl-3 col-sm-6">
          <div className="admin-stat-card p-3 bg-white rounded-3 border shadow-sm d-flex align-items-center justify-content-between">
            <div>
              <span className="text-muted fs-12 fw-600 text-uppercase">
                Active Categories
              </span>
              <h3 className="mb-0 fw-700 mt-1 text-success">{activeCount}</h3>
            </div>
            <div
              className="d-flex align-items-center justify-content-center rounded-3 bg-success-subtle text-success"
              style={{ width: "48px", height: "48px" }}
            >
              <i className="fa-solid fa-circle-check fs-20"></i>
            </div>
          </div>
        </div>

        {/* Inactive Categories */}
        <div className="col-xl-3 col-sm-6">
          <div className="admin-stat-card p-3 bg-white rounded-3 border shadow-sm d-flex align-items-center justify-content-between">
            <div>
              <span className="text-muted fs-12 fw-600 text-uppercase">
                Inactive / Hidden
              </span>
              <h3 className="mb-0 fw-700 mt-1" style={{ color: "#ef4444" }}>{inactiveCount}</h3>
            </div>
            <div
              className="d-flex align-items-center justify-content-center rounded-3"
              style={{
                width: "48px",
                height: "48px",
                backgroundColor: "rgba(239, 68, 68, 0.12)",
                color: "#ef4444",
              }}
            >
              <i className="fa-solid fa-eye-slash fs-20"></i>
            </div>
          </div>
        </div>

        {/* Total Products in System */}
        <div className="col-xl-3 col-sm-6">
          <div className="admin-stat-card p-3 bg-white rounded-3 border shadow-sm d-flex align-items-center justify-content-between">
            <div>
              <span className="text-muted fs-12 fw-600 text-uppercase">
                Total Products
              </span>
              <h3 className="mb-0 fw-700 mt-1 text-primary">{totalProductsInSystem}</h3>
            </div>
            <div
              className="d-flex align-items-center justify-content-center rounded-3 bg-primary-subtle text-primary"
              style={{ width: "48px", height: "48px" }}
            >
              <i className="fa-solid fa-boxes-stacked fs-20"></i>
            </div>
          </div>
        </div>
      </div>

      {/* TOOLBAR CARD (Clean horizontal layout, uniform search, filters, and sort like User Management) */}
      <div className="admin-card mb-4">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
          {/* Live Auto Search */}
          <div className="admin-search-box" style={{ flex: "1 1 260px", maxWidth: "380px" }}>
            <i className="fa-solid fa-magnifying-glass text-muted fs-13"></i>
            <input
              type="text"
              placeholder="Search category name, slug..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(0);
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                title="Clear search"
              >
                <i className="fa-solid fa-xmark fs-13"></i>
              </button>
            )}
          </div>

          {/* Filter Controls Group */}
          <div className="d-flex flex-wrap align-items-center gap-2 ms-auto">
            {/* Status Filter */}
            <select
              className="admin-select-sm"
              style={{ minWidth: "140px" }}
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(0);
              }}
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>

            {/* Sort dropdown */}
            <select
              className="admin-select-sm"
              style={{ minWidth: "165px" }}
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(0);
              }}
            >
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              <option value="id-desc">Newest First</option>
              <option value="id-asc">Oldest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* CATEGORIES TABLE CARD (Synchronized with User Management - NO ICONS, ONLY STT) */}
      <div className="admin-card">
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: "60px" }}>STT</th>
                <th>CATEGORY NAME</th>
                <th>DESCRIPTION</th>
                <th className="text-center">PRODUCTS</th>
                <th>STATUS</th>
                <th className="text-end">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-5">
                    <div className="spinner-border color-primary" role="status"></div>
                    <p className="mt-2 text-muted fs-14">Loading categories...</p>
                  </td>
                </tr>
              ) : paginatedCategories.length > 0 ? (
                paginatedCategories.map((cat, index) => {
                  const itemStt = page * pageSize + index + 1;
                  const catId = cat.categoryId || cat.id;

                  return (
                    <tr key={catId}>
                      {/* Item Index */}
                      <td>
                        <span className="fw-700 color-primary fs-13">
                          #{itemStt}
                        </span>
                      </td>

                      {/* Category Name (NO ICONS as requested) */}
                      <td>
                        <div>
                          <span className="fw-600 medium-black d-block fs-14">
                            {cat.name}
                          </span>
                          <span className="text-muted fs-12">
                            ID: #{catId}
                          </span>
                        </div>
                      </td>

                      {/* Description */}
                      <td style={{ maxWidth: "280px" }}>
                        <span className="text-truncate d-inline-block w-100 fs-13 text-muted">
                          {cat.description || "—"}
                        </span>
                      </td>

                      {/* Product Count */}
                      <td className="text-center">
                        <span className="badge bg-light text-dark border fs-12">
                          {cat.productCount || 0} items
                        </span>
                      </td>

                      {/* Status */}
                      <td>
                        <span
                          className={`admin-badge ${
                            cat.status === "ACTIVE"
                              ? "user-status-active"
                              : "user-status-blocked"
                          }`}
                        >
                          {cat.status || "ACTIVE"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="text-end">
                        <button
                          type="button"
                          className="admin-action-icon-btn me-1"
                          onClick={() => handleOpenDetail(cat)}
                          title="View category details"
                        >
                          <i className="fa-regular fa-eye"></i>
                        </button>
                        <button
                          type="button"
                          className="admin-action-icon-btn me-1"
                          onClick={() => openEditModal(cat)}
                          title="Edit Category"
                        >
                          <i className="fa-regular fa-pen-to-square"></i>
                        </button>
                        <button
                          type="button"
                          className="admin-action-icon-btn text-danger"
                          onClick={() => {
                            setCategoryToDelete(cat);
                            setIsDeleteConfirmOpen(true);
                          }}
                          title="Delete Category"
                        >
                          <i className="fa-regular fa-trash-can"></i>
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-5 text-muted">
                    <i className="fa-solid fa-folder-open fa-2x mb-3 d-block text-muted"></i>
                    No categories found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION BAR */}
        <AdminPagination
          page={page}
          pageSize={pageSize}
          totalElements={totalElements}
          totalPages={totalPages}
          onPageChange={setPage}
          noun="categories"
        />
      </div>

      {/* ======================================================== */}
      {/* ADD CATEGORY MODAL                                       */}
      {/* ======================================================== */}
      {isAddModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1060,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          {/* Backdrop */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundColor: "rgba(15, 20, 30, 0.6)",
              backdropFilter: "blur(4px)",
            }}
            onClick={() => {
              if (!actionLoading) setIsAddModalOpen(false);
            }}
          />

          {/* Modal Panel */}
          <div
            style={{
              position: "relative",
              width: "100%",
              maxWidth: "520px",
              backgroundColor: "#fff",
              borderRadius: "20px",
              boxShadow: "0 24px 60px rgba(0,0,0,0.18)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "20px 24px",
                borderBottom: "1px solid #f0f2f5",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "10px",
                    backgroundColor: "rgba(233,97,63,0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <i className="fa-solid fa-plus" style={{ fontSize: "16px", color: "#e9613f" }} />
                </div>
                <div>
                  <h5 style={{ margin: 0, fontWeight: 700, fontSize: "16px", color: "#1e2229" }}>
                    Add New Category
                  </h5>
                  <p style={{ margin: 0, fontSize: "12px", color: "#8a94a6", marginTop: "2px" }}>
                    Create a new category to organize stationery products
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                style={{
                  background: "#f5f6f8",
                  border: "none",
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "#8a94a6",
                  fontSize: "14px",
                }}
              >
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            <form noValidate onSubmit={handleSaveAdd}>
              <div style={{ padding: "20px 24px" }}>
                <div className="mb-3">
                  <label className="form-label" style={{ fontSize: "13px", fontWeight: 600, color: "#374151" }}>
                    Category Name <span style={{ color: "#e9613f" }}>*</span>
                  </label>
                  <input
                    type="text"
                    className={`form-control ${formErrors.name ? "is-invalid" : ""}`}
                    placeholder="e.g. Writing Instruments & Inks"
                    value={formName}
                    onChange={handleNameChange}
                    style={{ borderRadius: "8px", fontSize: "13.5px" }}
                  />
                  {formErrors.name && <div className="invalid-feedback d-block">{formErrors.name}</div>}
                </div>



                <div className="mb-3">
                  <label className="form-label" style={{ fontSize: "13px", fontWeight: 600, color: "#374151" }}>
                    Description
                  </label>
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="Brief description of products in this category..."
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    style={{ borderRadius: "8px", fontSize: "13.5px", resize: "vertical" }}
                  />
                </div>

                <div className="mb-2">
                  <label className="form-label" style={{ fontSize: "13px", fontWeight: 600, color: "#374151" }}>
                    Status
                  </label>
                  <select
                    className="form-select"
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    style={{ borderRadius: "8px", fontSize: "13.5px" }}
                  >
                    <option value="ACTIVE">🟢 Active — Visible</option>
                    <option value="INACTIVE">⚫ Inactive — Hidden</option>
                  </select>
                </div>
              </div>

              <div
                style={{
                  padding: "16px 24px",
                  borderTop: "1px solid #f0f2f5",
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "10px",
                  backgroundColor: "#fafbfc",
                }}
              >
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  disabled={actionLoading}
                  style={{
                    padding: "9px 20px",
                    borderRadius: "8px",
                    border: "1px solid #e2e6ea",
                    background: "#fff",
                    color: "#4a5568",
                    fontSize: "13.5px",
                    fontWeight: 600,
                    cursor: actionLoading ? "not-allowed" : "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="admin-btn-primary"
                  style={{ padding: "9px 24px" }}
                >
                  {actionLoading ? "Creating..." : "Create Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* EDIT CATEGORY MODAL                                      */}
      {/* ======================================================== */}
      {isEditModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1060,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          {/* Backdrop */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundColor: "rgba(15, 20, 30, 0.6)",
              backdropFilter: "blur(4px)",
            }}
            onClick={() => {
              if (!actionLoading) setIsEditModalOpen(false);
            }}
          />

          {/* Modal Panel */}
          <div
            style={{
              position: "relative",
              width: "100%",
              maxWidth: "520px",
              backgroundColor: "#fff",
              borderRadius: "20px",
              boxShadow: "0 24px 60px rgba(0,0,0,0.18)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "20px 24px",
                borderBottom: "1px solid #f0f2f5",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "10px",
                    backgroundColor: "rgba(59,130,246,0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <i className="fa-regular fa-pen-to-square" style={{ fontSize: "16px", color: "#3b82f6" }} />
                </div>
                <div>
                  <h5 style={{ margin: 0, fontWeight: 700, fontSize: "16px", color: "#1e2229" }}>
                    Edit Category
                  </h5>
                  <p style={{ margin: 0, fontSize: "12px", color: "#8a94a6", marginTop: "2px" }}>
                    Update category details and information
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                style={{
                  background: "#f5f6f8",
                  border: "none",
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "#8a94a6",
                  fontSize: "14px",
                }}
              >
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            <form noValidate onSubmit={handleSaveEdit}>
              <div style={{ padding: "20px 24px" }}>
                <div className="mb-3">
                  <label className="form-label" style={{ fontSize: "13px", fontWeight: 600, color: "#374151" }}>
                    Category Name <span style={{ color: "#e9613f" }}>*</span>
                  </label>
                  <input
                    type="text"
                    className={`form-control ${formErrors.name ? "is-invalid" : ""}`}
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    style={{ borderRadius: "8px", fontSize: "13.5px" }}
                  />
                  {formErrors.name && <div className="invalid-feedback d-block">{formErrors.name}</div>}
                </div>



                <div className="mb-3">
                  <label className="form-label" style={{ fontSize: "13px", fontWeight: 600, color: "#374151" }}>
                    Description
                  </label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    style={{ borderRadius: "8px", fontSize: "13.5px", resize: "vertical" }}
                  />
                </div>

                <div className="mb-2">
                  <label className="form-label" style={{ fontSize: "13px", fontWeight: 600, color: "#374151" }}>
                    Status
                  </label>
                  <select
                    className="form-select"
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    style={{ borderRadius: "8px", fontSize: "13.5px" }}
                  >
                    <option value="ACTIVE">🟢 Active — Visible</option>
                    <option value="INACTIVE">⚫ Inactive — Hidden</option>
                  </select>
                </div>
              </div>

              <div
                style={{
                  padding: "16px 24px",
                  borderTop: "1px solid #f0f2f5",
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "10px",
                  backgroundColor: "#fafbfc",
                }}
              >
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={actionLoading}
                  style={{
                    padding: "9px 20px",
                    borderRadius: "8px",
                    border: "1px solid #e2e6ea",
                    background: "#fff",
                    color: "#4a5568",
                    fontSize: "13.5px",
                    fontWeight: 600,
                    cursor: actionLoading ? "not-allowed" : "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="admin-btn-primary"
                  style={{ padding: "9px 24px" }}
                >
                  {actionLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* CATEGORY DETAILS MODAL                                   */}
      {/* ======================================================== */}
      {isDetailModalOpen && categoryDetail && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1050,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          {/* Backdrop */}
          <div
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(15, 23, 42, 0.65)",
              backdropFilter: "blur(4px)",
            }}
            onClick={() => setIsDetailModalOpen(false)}
          />

          {/* Modal Panel */}
          <div
            className="shadow-lg border-0 rounded-4"
            style={{
              position: "relative",
              width: "100%",
              maxWidth: "540px",
              backgroundColor: "#ffffff",
              borderRadius: "20px",
              overflow: "hidden",
              zIndex: 1,
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: "20px 24px",
                borderBottom: "1px solid #f1f5f9",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: "#ffffff",
              }}
            >
              <div className="d-flex align-items-center gap-3">
                <div
                  style={{
                    width: "42px",
                    height: "42px",
                    borderRadius: "10px",
                    backgroundColor: "rgba(233, 97, 63, 0.12)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#e9613f",
                  }}
                >
                  <i className="fa-solid fa-layer-group fs-18"></i>
                </div>
                <div>
                  <h5 className="mb-0 fw-700 text-dark fs-16">Category Details</h5>
                  <span className="text-muted fs-12">
                    ID: #{categoryDetail.categoryId || categoryDetail.id}
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="btn-close"
                onClick={() => setIsDetailModalOpen(false)}
                title="Close"
              ></button>
            </div>

            {/* Body */}
            <div style={{ padding: "24px", backgroundColor: "#ffffff" }}>
              <div className="d-flex align-items-center justify-content-between p-3 rounded-3 mb-3 bg-light border">
                <div>
                  <h6 className="fw-700 text-dark mb-1 fs-16">{categoryDetail.name}</h6>
                  <span className="text-muted fs-12">
                    Slug: <code>{categoryDetail.slug || generateSlug(categoryDetail.name)}</code>
                  </span>
                </div>
                <span
                  className={`admin-badge ${
                    categoryDetail.status === "ACTIVE"
                      ? "user-status-active"
                      : "user-status-blocked"
                  }`}
                >
                  {categoryDetail.status || "ACTIVE"}
                </span>
              </div>

              <div className="row g-3 fs-13 mb-3">
                <div className="col-6">
                  <div className="p-3 rounded-3 border bg-white h-100">
                    <span className="text-muted d-block fs-11 text-uppercase fw-600 mb-1">
                      <i className="fa-solid fa-boxes-stacked me-1 text-primary"></i> Product Count
                    </span>
                    <span className="fw-700 fs-16 text-dark">
                      {categoryDetail.productCount || 0} products
                    </span>
                  </div>
                </div>

                <div className="col-6">
                  <div className="p-3 rounded-3 border bg-white h-100">
                    <span className="text-muted d-block fs-11 text-uppercase fw-600 mb-1">
                      <i className="fa-solid fa-toggle-on me-1 text-primary"></i> Status
                    </span>
                    <span className="fw-700 fs-14 text-dark">
                      {categoryDetail.status === "ACTIVE" ? "Active / Displayed" : "Inactive / Hidden"}
                    </span>
                  </div>
                </div>

                <div className="col-12">
                  <div className="p-3 rounded-3 border bg-white">
                    <span className="text-muted d-block fs-11 text-uppercase fw-600 mb-1">
                      <i className="fa-solid fa-align-left me-1 text-primary"></i> Category Description
                    </span>
                    <p className="mb-0 text-dark fs-13" style={{ lineHeight: 1.6 }}>
                      {categoryDetail.description || "No detailed description available for this category."}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div
              style={{
                padding: "16px 24px",
                borderTop: "1px solid #f1f5f9",
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
                backgroundColor: "#ffffff",
              }}
            >
              <button
                type="button"
                className="btn btn-light rounded-pill px-4 fw-600 border"
                onClick={() => setIsDetailModalOpen(false)}
              >
                Close
              </button>
              <button
                type="button"
                className="admin-btn-primary px-4 rounded-pill"
                onClick={() => {
                  const cat = categoryDetail;
                  setIsDetailModalOpen(false);
                  openEditModal(cat);
                }}
              >
                <i className="fa-regular fa-pen-to-square me-1"></i> Edit Category
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE DIALOG */}
      <ConfirmDialog
        isOpen={isDeleteConfirmOpen}
        title="Delete Category"
        message={`Are you sure you want to delete "${categoryToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete Category"
        cancelText="Cancel"
        confirmVariant="danger"
        isLoading={actionLoading}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setIsDeleteConfirmOpen(false);
          setCategoryToDelete(null);
        }}
      />
    </div>
  );
};

export default AdminCategoryManagement;
