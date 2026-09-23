import React, { useMemo, useState } from "react";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import "../../styles/admin.css";

const INITIAL_CATEGORIES = [
  {
    id: 1,
    name: "Pens & Writing Instruments",
    slug: "pens-writing",
    description:
      "Fountain pens, gel pens, rollerballs, fineliners, and mechanical pencils.",
    productCount: 128,
    status: "ACTIVE",
    createdAt: "2024-01-15",
    icon: "fa-pen-fancy",
  },
  {
    id: 2,
    name: "Notebooks, Journals & Paper",
    slug: "notebooks-journals",
    description:
      "Premium dot grid journals, ruled notebooks, sketchpads, and fountain-pen-friendly paper.",
    productCount: 95,
    status: "ACTIVE",
    createdAt: "2024-01-18",
    icon: "fa-book-open",
  },
  {
    id: 3,
    name: "Art & Calligraphy Supplies",
    slug: "art-calligraphy",
    description:
      "Watercolors, acrylic inks, calligraphy nibs, brush pens, and sketching sets.",
    productCount: 64,
    status: "ACTIVE",
    createdAt: "2024-02-05",
    icon: "fa-palette",
  },
  {
    id: 4,
    name: "Desk Organizers & Storage",
    slug: "desk-organizers",
    description:
      "Minimalist wooden desk tidies, pen cups, document trays, and modular drawers.",
    productCount: 42,
    status: "ACTIVE",
    createdAt: "2024-02-20",
    icon: "fa-cubes",
  },
  {
    id: 5,
    name: "Filing & Binding Essentials",
    slug: "filing-essentials",
    description:
      "Ring binders, expanding files, archival folders, staple-free fasteners, and clips.",
    productCount: 38,
    status: "ACTIVE",
    createdAt: "2024-03-01",
    icon: "fa-folder-tree",
  },
  {
    id: 6,
    name: "Sticky Notes, Memos & Tabs",
    slug: "sticky-notes-tabs",
    description:
      "Aesthetic sticky flags, gradient index tabs, daily planners, and to-do memo pads.",
    productCount: 56,
    status: "ACTIVE",
    createdAt: "2024-03-12",
    icon: "fa-note-sticky",
  },
  {
    id: 7,
    name: "Tapes, Adhesives & Cutting",
    slug: "tapes-adhesives",
    description:
      "Japanese washi tapes, dot glue tapes, precision craft cutters, and self-healing mats.",
    productCount: 31,
    status: "INACTIVE",
    createdAt: "2024-04-02",
    icon: "fa-scissors",
  },
];

export const AdminCategoryManagement = () => {
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [successMsg, setSuccessMsg] = useState("");

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState(null);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

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
    setFormSlug(cat.slug);
    setFormDescription(cat.description);
    setFormStatus(cat.status);
    setFormErrors({});
    setIsEditModalOpen(true);
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    if (!formName.trim()) {
      errors.name = "Category name is required.";
    }
    if (!formSlug.trim()) {
      errors.slug = "Category slug is required.";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Save new category
  const handleSaveAdd = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const newCat = {
      id: Date.now(),
      name: formName.trim(),
      slug: formSlug.trim(),
      description: formDescription.trim() || "No description provided.",
      productCount: 0,
      status: formStatus,
      createdAt: new Date().toISOString().split("T")[0],
      icon: "fa-tag",
    };

    setCategories((prev) => [newCat, ...prev]);
    setIsAddModalOpen(false);
    setSuccessMsg(`Category "${newCat.name}" was created successfully!`);
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  // Save edited category
  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === categoryToEdit.id
          ? {
              ...cat,
              name: formName.trim(),
              slug: formSlug.trim(),
              description: formDescription.trim(),
              status: formStatus,
            }
          : cat,
      ),
    );
    setIsEditModalOpen(false);
    setSuccessMsg(`Category "${formName.trim()}" updated successfully!`);
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  // Toggle status
  const handleToggleStatus = (cat) => {
    const nextStatus = cat.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    setCategories((prev) =>
      prev.map((c) => (c.id === cat.id ? { ...c, status: nextStatus } : c)),
    );
    setSuccessMsg(`Status of "${cat.name}" changed to ${nextStatus}.`);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  // Delete category
  const handleDeleteConfirm = () => {
    if (!categoryToDelete) return;
    setCategories((prev) => prev.filter((c) => c.id !== categoryToDelete.id));
    setIsDeleteConfirmOpen(false);
    setSuccessMsg(`Category "${categoryToDelete.name}" deleted.`);
    setCategoryToDelete(null);
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  // Filtered categories
  const filteredCategories = useMemo(() => {
    return categories.filter((cat) => {
      const matchQuery =
        cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cat.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cat.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus =
        statusFilter === "ALL" ? true : cat.status === statusFilter;
      return matchQuery && matchStatus;
    });
  }, [categories, searchQuery, statusFilter]);

  const activeCount = categories.filter((c) => c.status === "ACTIVE").length;
  const totalProducts = categories.reduce((sum, c) => sum + c.productCount, 0);

  return (
    <div className="p-4">
      {/* Top Banner Stats */}
      <div className="row g-3 mb-4">
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

        <div className="col-xl-3 col-sm-6">
          <div className="admin-stat-card p-3 bg-white rounded-3 border shadow-sm d-flex align-items-center justify-content-between">
            <div>
              <span className="text-muted fs-12 fw-600 text-uppercase">
                Inactive Categories
              </span>
              <h3 className="mb-0 fw-700 mt-1 text-secondary">
                {categories.length - activeCount}
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

        <div className="col-xl-3 col-sm-6">
          <div className="admin-stat-card p-3 bg-white rounded-3 border shadow-sm d-flex align-items-center justify-content-between">
            <div>
              <span className="text-muted fs-12 fw-600 text-uppercase">
                Cataloged Items
              </span>
              <h3 className="mb-0 fw-700 mt-1 text-primary">{totalProducts}</h3>
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

      {/* Action Bar & Success Message */}
      {successMsg && (
        <div className="alert alert-success alert-dismissible fade show mb-4 d-flex align-items-center">
          <i className="fa-solid fa-circle-check me-2 fs-18"></i>
          <div>{successMsg}</div>
          <button
            type="button"
            className="btn-close"
            onClick={() => setSuccessMsg("")}
          ></button>
        </div>
      )}

      {/* Main Table Card */}
      <div className="bg-white rounded-3 border shadow-sm p-4">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
          <div>
            <h4 className="fw-700 medium-black mb-1">Stationery Categories</h4>
            <p className="text-muted fs-13 mb-0">
              Manage product classifications, hierarchy, and visibility in your
              store.
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

        {/* Filter Toolbar */}
        <div className="row g-3 mb-3">
          <div className="col-md-6 col-lg-5">
            <div className="position-relative">
              <input
                type="text"
                className="form-control ps-4"
                style={{ borderRadius: "20px", fontSize: "13px" }}
                placeholder="Search by category name, slug or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <i
                className="fa-solid fa-magnifying-glass position-absolute text-muted"
                style={{
                  left: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  fontSize: "12px",
                }}
              ></i>
            </div>
          </div>

          <div className="col-md-4 col-lg-3">
            <select
              className="form-select"
              style={{ borderRadius: "20px", fontSize: "13px" }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active Only</option>
              <option value="INACTIVE">Inactive Only</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr className="fs-12 text-uppercase text-muted">
                <th>Category Name</th>
                <th>Slug</th>
                <th>Description</th>
                <th className="text-center">Products</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-5 text-muted">
                    <i className="fa-solid fa-folder-open fa-3x mb-3 d-block text-secondary"></i>
                    No categories found matching your search.
                  </td>
                </tr>
              ) : (
                filteredCategories.map((cat) => (
                  <tr key={cat.id}>
                    <td>
                      <div className="d-flex align-items-center gap-3">
                        <div
                          className="d-flex align-items-center justify-content-center rounded-circle"
                          style={{
                            width: "36px",
                            height: "36px",
                            backgroundColor: "rgba(233, 97, 63, 0.1)",
                            color: "#e9613f",
                          }}
                        >
                          <i className={`fa-solid ${cat.icon || "fa-tag"}`}></i>
                        </div>
                        <div>
                          <div className="fw-600 medium-black">{cat.name}</div>
                          <span className="fs-11 text-muted">
                            ID: #{cat.id}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <code className="bg-light px-2 py-1 rounded text-primary fs-12">
                        {cat.slug}
                      </code>
                    </td>
                    <td style={{ maxWidth: "280px" }}>
                      <span className="text-truncate d-inline-block w-100 fs-13 text-muted">
                        {cat.description}
                      </span>
                    </td>
                    <td className="text-center">
                      <span className="badge bg-light text-dark border fs-12">
                        {cat.productCount} items
                      </span>
                    </td>
                    <td>
                      {cat.status === "ACTIVE" ? (
                        <span className="badge bg-success-subtle text-success fs-12">
                          <i className="fa-solid fa-circle-check me-1"></i>{" "}
                          Active
                        </span>
                      ) : (
                        <span className="badge bg-secondary-subtle text-secondary fs-12">
                          <i className="fa-solid fa-circle-xmark me-1"></i>{" "}
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="text-end">
                      <div className="d-inline-flex gap-2">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => handleToggleStatus(cat)}
                          title={
                            cat.status === "ACTIVE" ? "Deactivate" : "Activate"
                          }
                        >
                          <i
                            className={`fa-solid ${
                              cat.status === "ACTIVE"
                                ? "fa-eye-slash"
                                : "fa-eye"
                            }`}
                          ></i>
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => openEditModal(cat)}
                          title="Edit category"
                        >
                          <i className="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => {
                            setCategoryToDelete(cat);
                            setIsDeleteConfirmOpen(true);
                          }}
                          title="Delete category"
                        >
                          <i className="fa-solid fa-trash-can"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD CATEGORY MODAL */}
      {isAddModalOpen && (
        <div
          className="modal fade show"
          style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header">
                <h5 className="modal-title fw-700 medium-black">
                  <i className="fa-solid fa-folder-plus color-primary me-2"></i>
                  Add New Category
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setIsAddModalOpen(false)}
                ></button>
              </div>
              <form onSubmit={handleSaveAdd}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label fw-600 fs-13 medium-black">
                      Category Name *
                    </label>
                    <input
                      type="text"
                      className={`form-control ${formErrors.name ? "is-invalid" : ""}`}
                      placeholder="e.g. Fine Fountain Pens"
                      value={formName}
                      onChange={handleNameChange}
                    />
                    {formErrors.name && (
                      <div className="invalid-feedback">{formErrors.name}</div>
                    )}
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-600 fs-13 medium-black">
                      URL Slug *
                    </label>
                    <input
                      type="text"
                      className={`form-control ${formErrors.slug ? "is-invalid" : ""}`}
                      placeholder="e.g. fine-fountain-pens"
                      value={formSlug}
                      onChange={(e) => setFormSlug(e.target.value)}
                    />
                    {formErrors.slug && (
                      <div className="invalid-feedback">{formErrors.slug}</div>
                    )}
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-600 fs-13 medium-black">
                      Description
                    </label>
                    <textarea
                      className="form-control"
                      rows="3"
                      placeholder="Brief description of products in this category..."
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                    ></textarea>
                  </div>

                  <div className="mb-2">
                    <label className="form-label fw-600 fs-13 medium-black">
                      Initial Status
                    </label>
                    <select
                      className="form-select"
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value)}
                    >
                      <option value="ACTIVE">Active (Published)</option>
                      <option value="INACTIVE">Inactive (Hidden)</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer bg-light rounded-bottom-4">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setIsAddModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="admin-btn-primary">
                    Create Category
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* EDIT CATEGORY MODAL */}
      {isEditModalOpen && (
        <div
          className="modal fade show"
          style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header">
                <h5 className="modal-title fw-700 medium-black">
                  <i className="fa-solid fa-pen-to-square color-primary me-2"></i>
                  Edit Category
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setIsEditModalOpen(false)}
                ></button>
              </div>
              <form onSubmit={handleSaveEdit}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label fw-600 fs-13 medium-black">
                      Category Name *
                    </label>
                    <input
                      type="text"
                      className={`form-control ${formErrors.name ? "is-invalid" : ""}`}
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                    />
                    {formErrors.name && (
                      <div className="invalid-feedback">{formErrors.name}</div>
                    )}
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-600 fs-13 medium-black">
                      URL Slug *
                    </label>
                    <input
                      type="text"
                      className={`form-control ${formErrors.slug ? "is-invalid" : ""}`}
                      value={formSlug}
                      onChange={(e) => setFormSlug(e.target.value)}
                    />
                    {formErrors.slug && (
                      <div className="invalid-feedback">{formErrors.slug}</div>
                    )}
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-600 fs-13 medium-black">
                      Description
                    </label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                    ></textarea>
                  </div>

                  <div className="mb-2">
                    <label className="form-label fw-600 fs-13 medium-black">
                      Status
                    </label>
                    <select
                      className="form-select"
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value)}
                    >
                      <option value="ACTIVE">Active (Published)</option>
                      <option value="INACTIVE">Inactive (Hidden)</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer bg-light rounded-bottom-4">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setIsEditModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="admin-btn-primary">
                    Save Changes
                  </button>
                </div>
              </form>
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
        isDanger={true}
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
