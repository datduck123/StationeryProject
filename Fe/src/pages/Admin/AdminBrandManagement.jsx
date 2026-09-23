import React, { useMemo, useState } from "react";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import "../../styles/admin.css";

const INITIAL_BRANDS = [
  {
    id: 1,
    name: "Pilot",
    country: "Japan",
    website: "https://pilotpen.com",
    description:
      "Renowned Japanese writing instruments manufacturer, famous for G2, Juice Up, and Vanishing Point pens.",
    productCount: 48,
    status: "ACTIVE",
    establishedYear: 1918,
  },
  {
    id: 2,
    name: "Tombow",
    country: "Japan",
    website: "https://tombowusa.com",
    description:
      "Creative stationery icons: Dual Brush Pens, Mono plastic erasers, and precision correction tapes.",
    productCount: 34,
    status: "ACTIVE",
    establishedYear: 1913,
  },
  {
    id: 3,
    name: "Kokuyo",
    country: "Japan",
    website: "https://kokuyo-st.com",
    description:
      "Innovative Japanese study and office supplies, creators of silky Campus paper and staple-free Harinacs.",
    productCount: 42,
    status: "ACTIVE",
    establishedYear: 1905,
  },
  {
    id: 4,
    name: "Faber-Castell",
    country: "Germany",
    website: "https://faber-castell.com",
    description:
      "World leader in fine art pencils, Polychromos colored pencils, and ergonomic writing instruments.",
    productCount: 39,
    status: "ACTIVE",
    establishedYear: 1761,
  },
  {
    id: 5,
    name: "Midori / MD Paper",
    country: "Japan",
    website: "https://midori-japan.co.jp",
    description:
      "Minimalist notebooks with bleed-resistant MD paper, brass desk tools, and aesthetic clips.",
    productCount: 27,
    status: "ACTIVE",
    establishedYear: 1950,
  },
  {
    id: 6,
    name: "Zebra",
    country: "Japan",
    website: "https://zebrapen.com",
    description:
      "Famous for Sarasa Clip vintage gel pens, DelGuard unbreakable mechanical pencils, and Mildliners.",
    productCount: 36,
    status: "ACTIVE",
    establishedYear: 1897,
  },
  {
    id: 7,
    name: "Rhodia",
    country: "France",
    website: "https://rhodiapads.com",
    description:
      "Iconic orange and black French stapled notepads with ultra-smooth 80g Clairefontaine vellum paper.",
    productCount: 22,
    status: "INACTIVE",
    establishedYear: 1934,
  },
];

export const AdminBrandManagement = () => {
  const [brands, setBrands] = useState(INITIAL_BRANDS);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [countryFilter, setCountryFilter] = useState("ALL");
  const [successMsg, setSuccessMsg] = useState("");

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [brandToEdit, setBrandToEdit] = useState(null);
  const [brandToDelete, setBrandToDelete] = useState(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  // Form states
  const [formName, setFormName] = useState("");
  const [formCountry, setFormCountry] = useState("Japan");
  const [formWebsite, setFormWebsite] = useState("");
  const [formYear, setFormYear] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formStatus, setFormStatus] = useState("ACTIVE");
  const [formErrors, setFormErrors] = useState({});

  // Unique country list for filter
  const countries = useMemo(() => {
    const list = Array.from(new Set(brands.map((b) => b.country)));
    return list.sort();
  }, [brands]);

  // Open Add Modal
  const openAddModal = () => {
    setBrandToEdit(null);
    setFormName("");
    setFormCountry("Japan");
    setFormWebsite("");
    setFormYear(new Date().getFullYear());
    setFormDescription("");
    setFormStatus("ACTIVE");
    setFormErrors({});
    setIsAddModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (brand) => {
    setBrandToEdit(brand);
    setFormName(brand.name);
    setFormCountry(brand.country);
    setFormWebsite(brand.website || "");
    setFormYear(brand.establishedYear || "");
    setFormDescription(brand.description || "");
    setFormStatus(brand.status);
    setFormErrors({});
    setIsEditModalOpen(true);
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    if (!formName.trim()) {
      errors.name = "Brand name is required.";
    }
    if (!formCountry.trim()) {
      errors.country = "Country of origin is required.";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle Add
  const handleSaveAdd = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const newBrand = {
      id: Date.now(),
      name: formName.trim(),
      country: formCountry.trim(),
      website: formWebsite.trim() || undefined,
      establishedYear: formYear ? parseInt(formYear, 10) : undefined,
      description: formDescription.trim() || "Stationery brand partner.",
      productCount: 0,
      status: formStatus,
    };

    setBrands((prev) => [newBrand, ...prev]);
    setIsAddModalOpen(false);
    setSuccessMsg(`Brand "${newBrand.name}" was added successfully!`);
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  // Handle Edit
  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setBrands((prev) =>
      prev.map((b) =>
        b.id === brandToEdit.id
          ? {
              ...b,
              name: formName.trim(),
              country: formCountry.trim(),
              website: formWebsite.trim() || undefined,
              establishedYear: formYear
                ? parseInt(formYear, 10)
                : b.establishedYear,
              description: formDescription.trim(),
              status: formStatus,
            }
          : b,
      ),
    );

    setIsEditModalOpen(false);
    setSuccessMsg(`Brand "${formName.trim()}" updated successfully!`);
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  // Toggle status
  const handleToggleStatus = (brand) => {
    const nextStatus = brand.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    setBrands((prev) =>
      prev.map((b) => (b.id === brand.id ? { ...b, status: nextStatus } : b)),
    );
    setSuccessMsg(`Status of "${brand.name}" changed to ${nextStatus}.`);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  // Confirm delete
  const handleDeleteConfirm = () => {
    if (!brandToDelete) return;
    setBrands((prev) => prev.filter((b) => b.id !== brandToDelete.id));
    setIsDeleteConfirmOpen(false);
    setSuccessMsg(`Brand "${brandToDelete.name}" deleted.`);
    setBrandToDelete(null);
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  // Filtered brands
  const filteredBrands = useMemo(() => {
    return brands.filter((brand) => {
      const matchQuery =
        brand.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        brand.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (brand.description &&
          brand.description.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchStatus =
        statusFilter === "ALL" ? true : brand.status === statusFilter;
      const matchCountry =
        countryFilter === "ALL" ? true : brand.country === countryFilter;
      return matchQuery && matchStatus && matchCountry;
    });
  }, [brands, searchQuery, statusFilter, countryFilter]);

  const activeCount = brands.filter((b) => b.status === "ACTIVE").length;
  const totalItems = brands.reduce((sum, b) => sum + b.productCount, 0);

  return (
    <div className="p-4">
      {/* Top Banner Stats */}
      <div className="row g-3 mb-4">
        <div className="col-xl-3 col-sm-6">
          <div className="admin-stat-card p-3 bg-white rounded-3 border shadow-sm d-flex align-items-center justify-content-between">
            <div>
              <span className="text-muted fs-12 fw-600 text-uppercase">
                Total Brands
              </span>
              <h3 className="mb-0 fw-700 mt-1">{brands.length}</h3>
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
              <i className="fa-solid fa-certificate fs-20"></i>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-sm-6">
          <div className="admin-stat-card p-3 bg-white rounded-3 border shadow-sm d-flex align-items-center justify-content-between">
            <div>
              <span className="text-muted fs-12 fw-600 text-uppercase">
                Active Partners
              </span>
              <h3 className="mb-0 fw-700 mt-1 text-success">{activeCount}</h3>
            </div>
            <div
              className="d-flex align-items-center justify-content-center rounded-3 bg-success-subtle text-success"
              style={{ width: "48px", height: "48px" }}
            >
              <i className="fa-solid fa-handshake fs-20"></i>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-sm-6">
          <div className="admin-stat-card p-3 bg-white rounded-3 border shadow-sm d-flex align-items-center justify-content-between">
            <div>
              <span className="text-muted fs-12 fw-600 text-uppercase">
                Countries of Origin
              </span>
              <h3 className="mb-0 fw-700 mt-1 text-info">{countries.length}</h3>
            </div>
            <div
              className="d-flex align-items-center justify-content-center rounded-3 bg-info-subtle text-info"
              style={{ width: "48px", height: "48px" }}
            >
              <i className="fa-solid fa-earth-americas fs-20"></i>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-sm-6">
          <div className="admin-stat-card p-3 bg-white rounded-3 border shadow-sm d-flex align-items-center justify-content-between">
            <div>
              <span className="text-muted fs-12 fw-600 text-uppercase">
                Products Supplied
              </span>
              <h3 className="mb-0 fw-700 mt-1 text-primary">{totalItems}</h3>
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

      {/* Success Notification */}
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
            <h4 className="fw-700 medium-black mb-1">
              Stationery Brand Partners
            </h4>
            <p className="text-muted fs-13 mb-0">
              Manage international stationery makers, authentic brands, and
              supplier relationships.
            </p>
          </div>

          <button
            type="button"
            className="admin-btn-primary"
            onClick={openAddModal}
          >
            <i className="fa-solid fa-plus me-1"></i> Add Brand
          </button>
        </div>

        {/* Filter Toolbar */}
        <div className="row g-3 mb-3">
          <div className="col-md-5 col-lg-5">
            <div className="position-relative">
              <input
                type="text"
                className="form-control ps-4"
                style={{ borderRadius: "20px", fontSize: "13px" }}
                placeholder="Search brand name, country or info..."
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

          <div className="col-md-3 col-lg-3">
            <select
              className="form-select"
              style={{ borderRadius: "20px", fontSize: "13px" }}
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
            >
              <option value="ALL">All Countries</option>
              {countries.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
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
                <th>Brand Name</th>
                <th>Country</th>
                <th>Description</th>
                <th className="text-center">Products</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBrands.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-5 text-muted">
                    <i className="fa-solid fa-award fa-3x mb-3 d-block text-secondary"></i>
                    No brands found matching your search.
                  </td>
                </tr>
              ) : (
                filteredBrands.map((b) => (
                  <tr key={b.id}>
                    <td>
                      <div className="d-flex align-items-center gap-3">
                        <div
                          className="d-flex align-items-center justify-content-center rounded-3 fw-700 fs-14"
                          style={{
                            width: "40px",
                            height: "40px",
                            backgroundColor: "#f1f3f7",
                            color: "#1e2229",
                            border: "1px solid #e2e8f0",
                          }}
                        >
                          {b.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="fw-600 medium-black d-flex align-items-center gap-2">
                            <span>{b.name}</span>
                            {b.establishedYear && (
                              <span className="badge bg-light text-muted border fs-10">
                                Est. {b.establishedYear}
                              </span>
                            )}
                          </div>
                          {b.website ? (
                            <a
                              href={b.website}
                              target="_blank"
                              rel="noreferrer"
                              className="fs-12 color-primary text-decoration-none"
                            >
                              <i className="fa-solid fa-arrow-up-right-from-square me-1 fs-10"></i>
                              {b.website.replace("https://", "")}
                            </a>
                          ) : (
                            <span className="fs-11 text-muted">No URL</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge bg-light text-dark border px-2 py-1 fs-12">
                        <i className="fa-solid fa-location-dot text-danger me-1"></i>
                        {b.country}
                      </span>
                    </td>
                    <td style={{ maxWidth: "280px" }}>
                      <span className="text-truncate d-inline-block w-100 fs-13 text-muted">
                        {b.description}
                      </span>
                    </td>
                    <td className="text-center">
                      <span className="badge bg-light text-dark border fs-12">
                        {b.productCount} items
                      </span>
                    </td>
                    <td>
                      {b.status === "ACTIVE" ? (
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
                          onClick={() => handleToggleStatus(b)}
                          title={
                            b.status === "ACTIVE" ? "Deactivate" : "Activate"
                          }
                        >
                          <i
                            className={`fa-solid ${
                              b.status === "ACTIVE" ? "fa-eye-slash" : "fa-eye"
                            }`}
                          ></i>
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => openEditModal(b)}
                          title="Edit brand"
                        >
                          <i className="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => {
                            setBrandToDelete(b);
                            setIsDeleteConfirmOpen(true);
                          }}
                          title="Delete brand"
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

      {/* ADD BRAND MODAL */}
      {isAddModalOpen && (
        <div
          className="modal fade show"
          style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header">
                <h5 className="modal-title fw-700 medium-black">
                  <i className="fa-solid fa-certificate color-primary me-2"></i>
                  Add Stationery Brand
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
                      Brand Name *
                    </label>
                    <input
                      type="text"
                      className={`form-control ${formErrors.name ? "is-invalid" : ""}`}
                      placeholder="e.g. Kaweco"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                    />
                    {formErrors.name && (
                      <div className="invalid-feedback">{formErrors.name}</div>
                    )}
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-sm-6">
                      <label className="form-label fw-600 fs-13 medium-black">
                        Country of Origin *
                      </label>
                      <input
                        type="text"
                        className={`form-control ${formErrors.country ? "is-invalid" : ""}`}
                        placeholder="e.g. Germany"
                        value={formCountry}
                        onChange={(e) => setFormCountry(e.target.value)}
                      />
                      {formErrors.country && (
                        <div className="invalid-feedback">
                          {formErrors.country}
                        </div>
                      )}
                    </div>
                    <div className="col-sm-6">
                      <label className="form-label fw-600 fs-13 medium-black">
                        Established Year
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        placeholder="e.g. 1883"
                        value={formYear}
                        onChange={(e) => setFormYear(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-600 fs-13 medium-black">
                      Website URL
                    </label>
                    <input
                      type="url"
                      className="form-control"
                      placeholder="https://..."
                      value={formWebsite}
                      onChange={(e) => setFormWebsite(e.target.value)}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-600 fs-13 medium-black">
                      Description
                    </label>
                    <textarea
                      className="form-control"
                      rows="3"
                      placeholder="Brand background, signature products..."
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
                    onClick={() => setIsAddModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="admin-btn-primary">
                    Create Brand
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* EDIT BRAND MODAL */}
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
                  Edit Brand
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
                      Brand Name *
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

                  <div className="row g-2 mb-3">
                    <div className="col-sm-6">
                      <label className="form-label fw-600 fs-13 medium-black">
                        Country of Origin *
                      </label>
                      <input
                        type="text"
                        className={`form-control ${formErrors.country ? "is-invalid" : ""}`}
                        value={formCountry}
                        onChange={(e) => setFormCountry(e.target.value)}
                      />
                      {formErrors.country && (
                        <div className="invalid-feedback">
                          {formErrors.country}
                        </div>
                      )}
                    </div>
                    <div className="col-sm-6">
                      <label className="form-label fw-600 fs-13 medium-black">
                        Established Year
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        value={formYear}
                        onChange={(e) => setFormYear(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-600 fs-13 medium-black">
                      Website URL
                    </label>
                    <input
                      type="url"
                      className="form-control"
                      value={formWebsite}
                      onChange={(e) => setFormWebsite(e.target.value)}
                    />
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
        title="Delete Brand"
        message={`Are you sure you want to delete brand "${brandToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete Brand"
        cancelText="Cancel"
        isDanger={true}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setIsDeleteConfirmOpen(false);
          setBrandToDelete(null);
        }}
      />
    </div>
  );
};

export default AdminBrandManagement;
