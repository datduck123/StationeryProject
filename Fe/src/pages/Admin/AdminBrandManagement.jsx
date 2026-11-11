import React, { useCallback, useEffect, useMemo, useState } from "react";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import { useToast } from "../../providers/ToastContext";
import {
  adminCreateBrand,
  adminDeleteBrand,
  adminGetBrands,
  adminGetProducts,
  adminUpdateBrand,
} from "../../services/productService";
import { notifyProductChange } from "../../utils/syncEvents";
import "../../styles/admin.css";

const FALLBACK_BRANDS = [
  {
    brandId: 1,
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
    brandId: 2,
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
    brandId: 3,
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
    brandId: 4,
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
    brandId: 5,
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
    brandId: 6,
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
    brandId: 7,
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
  const { showToast } = useToast();

  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [countryFilter, setCountryFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("name-asc");

  // Numbered Pagination state (identical to Category & User Management)
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);

  // Modals & Selection
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [brandDetail, setBrandDetail] = useState(null);
  const [brandToEdit, setBrandToEdit] = useState(null);
  const [brandToDelete, setBrandToDelete] = useState(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

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
    const list = Array.from(
      new Set(brands.map((b) => b.country).filter(Boolean))
    );
    return list.sort();
  }, [brands]);

  // Fetch brands from API with fallback
  const fetchBrands = useCallback(async () => {
    setLoading(true);
    try {
      const [brandRes, prodRes] = await Promise.allSettled([
        adminGetBrands(),
        adminGetProducts({ page: 0, size: 2000 }),
      ]);

      let productCountMap = {};
      if (prodRes.status === "fulfilled" && prodRes.value?.data) {
        const prodList =
          prodRes.value.data.content || prodRes.value.data || [];
        prodList.forEach((p) => {
          const bId = p.brand?.brandId || p.brandId;
          if (bId) {
            productCountMap[bId] = (productCountMap[bId] || 0) + 1;
          }
        });
      }

      if (brandRes.status === "fulfilled" && brandRes.value?.data?.length > 0) {
        const list = brandRes.value.data.map((b) => {
          const bId = b.brandId || b.id;
          const fallbackMatch = FALLBACK_BRANDS.find(
            (fb) =>
              fb.id === bId ||
              fb.name?.toLowerCase() === b.name?.toLowerCase()
          );
          return {
            ...b,
            id: bId,
            brandId: bId,
            country: b.country || fallbackMatch?.country || "Japan",
            website: b.website || fallbackMatch?.website || "",
            establishedYear:
              b.establishedYear || fallbackMatch?.establishedYear || null,
            description: b.description || fallbackMatch?.description || "",
            status: b.status || fallbackMatch?.status || "ACTIVE",
            productCount:
              productCountMap[bId] !== undefined
                ? productCountMap[bId]
                : fallbackMatch?.productCount || 0,
          };
        });
        setBrands(list);
      } else {
        setBrands(FALLBACK_BRANDS);
      }
    } catch (err) {
      console.warn("Falling back to local brands:", err);
      setBrands(FALLBACK_BRANDS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  // Detail Modal
  const handleOpenDetail = (brand) => {
    setBrandDetail(brand);
    setIsDetailModalOpen(true);
  };

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
    setFormName(brand.name || "");
    setFormCountry(brand.country || "Japan");
    setFormWebsite(brand.website || "");
    setFormYear(brand.establishedYear || "");
    setFormDescription(brand.description || "");
    setFormStatus(brand.status || "ACTIVE");
    setFormErrors({});
    setIsEditModalOpen(true);
  };

  // Validate form
  const validateForm = (isEdit = false) => {
    const errors = {};
    const nameVal = formName.trim();
    const countryVal = formCountry.trim();

    if (!nameVal) {
      errors.name = "Brand name cannot be empty.";
    } else if (nameVal.length < 5) {
      errors.name = "Brand name must be at least 5 characters.";
    } else if (nameVal.length > 50) {
      errors.name = "Brand name cannot exceed 50 characters.";
    } else if (/[^a-zA-Z\sÀ-ỹà-ỹĐđ]/.test(nameVal)) {
      errors.name = "Brand name can only contain letters and spaces (no numbers or special characters).";
    } else {
      // Validate unique brand name (case-insensitive)
      const currentId =
        isEdit && brandToEdit ? brandToEdit.brandId || brandToEdit.id : null;
      const isDuplicate = brands.some((b) => {
        const bId = b.brandId || b.id;
        if (isEdit && bId === currentId) return false;
        return (b.name || "").trim().toLowerCase() === nameVal.toLowerCase();
      });
      if (isDuplicate) {
        errors.name = "Brand name already exists. Please choose a different name.";
      }
    }

    if (!countryVal) {
      errors.country = "Please enter country of origin.";
    } else if (/[^a-zA-Z\sÀ-ỹà-ỹĐđ]/.test(countryVal)) {
      errors.country = "Country name can only contain letters and spaces.";
    }

    if (
      formYear &&
      (parseInt(formYear, 10) < 1600 ||
        parseInt(formYear, 10) > new Date().getFullYear())
    ) {
      errors.year = `Established year must be between 1600 and ${new Date().getFullYear()}.`;
    }

    const errorKeys = Object.keys(errors);
    if (errorKeys.length === 1) {
      setFormErrors({});
      showToast(errors[errorKeys[0]], "error", 8000);
      return false;
    } else if (errorKeys.length > 1) {
      setFormErrors(errors);
      showToast(
        "Please review the invalid fields in the form.",
        "error",
        8000
      );
      return false;
    }

    setFormErrors({});
    return true;
  };

  // Save Add
  const handleSaveAdd = async (e) => {
    e.preventDefault();
    if (!validateForm(false)) return;

    setActionLoading(true);
    const newBrandData = {
      name: formName.trim(),
      country: formCountry.trim(),
      website: formWebsite.trim() || undefined,
      establishedYear: formYear ? parseInt(formYear, 10) : undefined,
      description: formDescription.trim() || "Stationery brand partner.",
      status: formStatus,
    };

    try {
      await adminCreateBrand({
        name: newBrandData.name,
        description: newBrandData.description,
      });
      showToast(`Brand "${newBrandData.name}" created successfully!`, "success");
      setIsAddModalOpen(false);
      fetchBrands();
      notifyProductChange();
    } catch (err) {
      console.warn("API create brand failed, falling back to local state:", err);
      const fallbackItem = {
        id: Date.now(),
        brandId: Date.now(),
        ...newBrandData,
        productCount: 0,
      };
      setBrands((prev) => [fallbackItem, ...prev]);
      setIsAddModalOpen(false);
      showToast(`Brand "${newBrandData.name}" created successfully!`, "success");
      notifyProductChange();
    } finally {
      setActionLoading(false);
    }
  };

  // Save Edit
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!validateForm(true)) return;

    setActionLoading(true);
    const brandId = brandToEdit.brandId || brandToEdit.id;
    const updateData = {
      name: formName.trim(),
      country: formCountry.trim(),
      website: formWebsite.trim() || undefined,
      establishedYear: formYear ? parseInt(formYear, 10) : brandToEdit.establishedYear,
      description: formDescription.trim(),
      status: formStatus,
    };

    try {
      await adminUpdateBrand(brandId, {
        name: updateData.name,
        description: updateData.description,
      });
      setBrands((prev) =>
        prev.map((b) =>
          (b.brandId || b.id) === brandId ? { ...b, ...updateData } : b
        )
      );
      setIsEditModalOpen(false);
      showToast(`Brand "${updateData.name}" updated successfully!`, "success");
      fetchBrands();
      notifyProductChange();
    } catch (err) {
      console.warn("API update brand failed, updating locally:", err);
      setBrands((prev) =>
        prev.map((b) =>
          (b.brandId || b.id) === brandId ? { ...b, ...updateData } : b
        )
      );
      setIsEditModalOpen(false);
      showToast(`Brand "${updateData.name}" updated successfully!`, "success");
      notifyProductChange();
    } finally {
      setActionLoading(false);
    }
  };

  // Toggle status
  const handleToggleStatus = async (brand) => {
    const nextStatus = brand.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    const brandId = brand.brandId || brand.id;

    try {
      await adminUpdateBrand(brandId, {
        name: brand.name,
        description: brand.description || "",
      });
    } catch (err) {
      console.warn("API update brand status:", err);
    }

    setBrands((prev) =>
      prev.map((b) =>
        (b.brandId || b.id) === brandId ? { ...b, status: nextStatus } : b
      )
    );
    showToast(`Brand "${brand.name}" status changed to ${nextStatus}.`, "success");
    notifyProductChange();
  };

  // Confirm delete
  const handleDeleteConfirm = async () => {
    if (!brandToDelete) return;

    setActionLoading(true);
    const brandId = brandToDelete.brandId || brandToDelete.id;

    try {
      await adminDeleteBrand(brandId);
      setIsDeleteConfirmOpen(false);
      showToast(`Brand "${brandToDelete.name}" deleted successfully.`, "success");
      setBrandToDelete(null);
      fetchBrands();
      notifyProductChange();
    } catch (err) {
      console.error("API delete brand failed:", err);
      setIsDeleteConfirmOpen(false);
      setBrandToDelete(null);
      showToast(
        err.response?.data?.message ||
        "Cannot delete brand as it is linked to other products.",
        "error"
      );
    } finally {
      setActionLoading(false);
    }
  };

  // Filtered and Sorted brands
  const filteredBrands = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    let result = brands.filter((brand) => {
      const matchQuery =
        !query ||
        brand.name.toLowerCase().includes(query) ||
        (brand.country && brand.country.toLowerCase().includes(query)) ||
        (brand.description && brand.description.toLowerCase().includes(query));
      const matchStatus =
        statusFilter === "ALL" ? true : brand.status === statusFilter;
      const matchCountry =
        countryFilter === "ALL" ? true : brand.country === countryFilter;
      return matchQuery && matchStatus && matchCountry;
    });

    // Sorting
    result.sort((a, b) => {
      if (sortBy === "name-asc") return a.name.localeCompare(b.name);
      if (sortBy === "name-desc") return b.name.localeCompare(a.name);
      if (sortBy === "products-desc") return (b.productCount || 0) - (a.productCount || 0);
      if (sortBy === "country-asc") return (a.country || "").localeCompare(b.country || "");
      return 0;
    });

    return result;
  }, [brands, searchQuery, statusFilter, countryFilter, sortBy]);

  // Pagination calculation
  const totalElements = filteredBrands.length;
  const totalPages = Math.ceil(totalElements / pageSize) || 1;

  // Auto adjust page when page exceeds totalPages (e.g. after deletion or filtering)
  useEffect(() => {
    if (page >= totalPages && totalPages > 0) {
      setPage(Math.max(0, totalPages - 1));
    }
  }, [totalPages, page]);

  const paginatedBrands = useMemo(() => {
    const start = page * pageSize;
    return filteredBrands.slice(start, start + pageSize);
  }, [filteredBrands, page, pageSize]);

  const activeCount = brands.filter((b) => b.status === "ACTIVE").length;
  const totalSuppliedItems = brands.reduce(
    (sum, b) => sum + (Number(b.productCount) || 0),
    0
  );

  return (
    <div className="p-4">
      {/* Page Header (Synchronized with Category & User Management) */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
        <div>
          <h4 className="fw-700 medium-black mb-1">Stationery Brand Partners</h4>
          <p className="text-muted fs-13 mb-0">
            Manage partner brands, origins, and stationery catalog suppliers.
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
                Active Brands
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
                Origin Countries
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
                Supplied Products
              </span>
              <h3 className="mb-0 fw-700 mt-1 text-primary">{totalSuppliedItems}</h3>
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

      {/* TOOLBAR CARD (Clean horizontal layout, uniform search, filters, and sort synchronized with Product & Category Management) */}
      <div className="admin-card mb-4">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
          {/* Live Auto Search */}
          <div className="admin-search-box" style={{ flex: "1 1 250px", maxWidth: "380px" }}>
            <i className="fa-solid fa-magnifying-glass text-muted fs-13"></i>
            <input
              type="text"
              placeholder="Search brand, country..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(0);
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setPage(0);
                }}
                title="Clear search"
              >
                <i className="fa-solid fa-xmark fs-13"></i>
              </button>
            )}
          </div>

          {/* Filter Controls Group */}
          <div className="d-flex flex-wrap align-items-center gap-2 ms-auto">
            {/* Country Filter */}
            <select
              className="admin-select-sm"
              style={{ minWidth: "160px" }}
              value={countryFilter}
              onChange={(e) => {
                setCountryFilter(e.target.value);
                setPage(0);
              }}
            >
              <option value="ALL">All Countries ({countries.length})</option>
              {countries.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              className="admin-select-sm"
              style={{ minWidth: "135px" }}
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(0);
              }}
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active Only</option>
              <option value="INACTIVE">Inactive Only</option>
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
              <option value="name-asc">Sort: Name (A-Z)</option>
              <option value="name-desc">Sort: Name (Z-A)</option>
              <option value="products-desc">Sort: Most Products</option>
              <option value="country-asc">Sort: Country (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="admin-card">
        {/* Table */}
        <div className="table-responsive">
          <table className="admin-table align-middle mb-0">
            <thead>
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
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-5 text-muted">
                    <div className="spinner-border spinner-border-sm text-primary me-2"></div>
                    Loading stationery brands...
                  </td>
                </tr>
              ) : paginatedBrands.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-5 text-muted">
                    <i className="fa-solid fa-certificate fa-2x mb-3 d-block text-secondary"></i>
                    No brands found matching your criteria.
                  </td>
                </tr>
              ) : (
                paginatedBrands.map((b) => {
                  const brandId = b.brandId || b.id;
                  return (
                    <tr key={brandId}>
                      {/* Name & Avatar */}
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
                              flexShrink: 0,
                            }}
                          >
                            {(b.name || "").substring(0, 2).toUpperCase()}
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
                                {b.website.replace(/^https?:\/\//, "")}
                              </a>
                            ) : (
                              <span className="fs-11 text-muted">No URL</span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Country */}
                      <td>
                        <span className="badge bg-light text-dark border px-2 py-1 fs-12">
                          <i className="fa-solid fa-location-dot text-danger me-1"></i>
                          {b.country || "Japan"}
                        </span>
                      </td>

                      {/* Description */}
                      <td style={{ maxWidth: "280px" }}>
                        <span className="text-truncate d-inline-block w-100 fs-13 text-muted">
                          {b.description || "—"}
                        </span>
                      </td>

                      {/* Products */}
                      <td className="text-center">
                        <span className="badge bg-light text-dark border fs-12">
                          {b.productCount || 0} items
                        </span>
                      </td>

                      {/* Status */}
                      <td>
                        <span
                          className={`admin-badge ${
                            b.status === "ACTIVE"
                              ? "user-status-active"
                              : "user-status-blocked"
                          }`}
                        >
                          {b.status || "ACTIVE"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="text-end">
                        <button
                          type="button"
                          className="admin-action-icon-btn me-1"
                          onClick={() => handleToggleStatus(b)}
                          title={b.status === "ACTIVE" ? "Deactivate brand" : "Activate brand"}
                        >
                          <i
                            className={`fa-solid ${
                              b.status === "ACTIVE"
                                ? "fa-eye-slash text-muted"
                                : "fa-eye text-success"
                            }`}
                          ></i>
                        </button>
                        <button
                          type="button"
                          className="admin-action-icon-btn me-1"
                          onClick={() => handleOpenDetail(b)}
                          title="View brand details"
                        >
                          <i className="fa-regular fa-eye"></i>
                        </button>
                        <button
                          type="button"
                          className="admin-action-icon-btn me-1"
                          onClick={() => openEditModal(b)}
                          title="Edit brand"
                        >
                          <i className="fa-regular fa-pen-to-square"></i>
                        </button>
                        <button
                          type="button"
                          className="admin-action-icon-btn text-danger"
                          onClick={() => {
                            setBrandToDelete(b);
                            setIsDeleteConfirmOpen(true);
                          }}
                          title="Delete brand"
                        >
                          <i className="fa-regular fa-trash-can"></i>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION BAR (Synchronized with Category & User Management) */}
        <div className="d-flex flex-wrap justify-content-between align-items-center mt-3 pt-3 gap-2">
          <span className="text-muted fs-13">
            Showing{" "}
            <strong>
              {totalElements === 0 ? 0 : page * pageSize + 1} to{" "}
              {Math.min((page + 1) * pageSize, totalElements)}
            </strong>{" "}
            of <strong>{totalElements}</strong> brands
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
              {Array.from({ length: totalPages }, (_, i) => i).map((pageNum) => (
                <button
                  key={pageNum}
                  type="button"
                  className={`btn ${
                    pageNum === page
                      ? "btn-dark bg-color-primary border-0 fw-700 text-white"
                      : "btn-light border"
                  }`}
                  style={pageNum === page ? { backgroundColor: "#e9613f" } : {}}
                  onClick={() => setPage(pageNum)}
                >
                  {pageNum + 1}
                </button>
              ))}
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

      {/* ======================================================== */}
      {/* ADD BRAND MODAL (Synchronized solid design)              */}
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
          {/* Backdrop blur */}
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
              maxWidth: "540px",
              backgroundColor: "#ffffff",
              borderRadius: "20px",
              boxShadow: "0 24px 60px rgba(0,0,0,0.18)",
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: "20px 24px",
                borderBottom: "1px solid #f0f2f5",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: "#ffffff",
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
                  <i
                    className="fa-solid fa-plus"
                    style={{ fontSize: "16px", color: "#e9613f" }}
                  />
                </div>
                <div>
                  <h5
                    style={{
                      margin: 0,
                      fontWeight: 700,
                      fontSize: "16px",
                      color: "#1e2229",
                    }}
                  >
                    Add Stationery Brand
                  </h5>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "12px",
                      color: "#8a94a6",
                      marginTop: "2px",
                    }}
                  >
                    Add a new partner stationery brand
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
              <div
                style={{
                  padding: "20px 24px",
                  maxHeight: "calc(85vh - 140px)",
                  overflowY: "auto",
                  backgroundColor: "#ffffff",
                }}
              >
                {/* Brand Name */}
                <div className="mb-3">
                  <label
                    className="form-label"
                    style={{ fontSize: "13px", fontWeight: 600, color: "#374151" }}
                  >
                    Brand Name <span style={{ color: "#e9613f" }}>*</span>
                  </label>
                  <input
                    type="text"
                    className={`form-control ${
                      formErrors.name ? "is-invalid" : ""
                    }`}
                    placeholder="e.g. Kaweco"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    style={{ borderRadius: "8px", fontSize: "13.5px" }}
                  />
                  {formErrors.name && (
                    <div className="invalid-feedback d-block">
                      {formErrors.name}
                    </div>
                  )}
                </div>

                {/* Country & Established Year */}
                <div className="row g-2 mb-3">
                  <div className="col-sm-6">
                    <label
                      className="form-label"
                      style={{ fontSize: "13px", fontWeight: 600, color: "#374151" }}
                    >
                      Country of Origin <span style={{ color: "#e9613f" }}>*</span>
                    </label>
                    <input
                      type="text"
                      className={`form-control ${
                        formErrors.country ? "is-invalid" : ""
                      }`}
                      placeholder="e.g. Germany"
                      value={formCountry}
                      onChange={(e) => setFormCountry(e.target.value)}
                      style={{ borderRadius: "8px", fontSize: "13.5px" }}
                    />
                    {formErrors.country && (
                      <div className="invalid-feedback d-block">
                        {formErrors.country}
                      </div>
                    )}
                  </div>
                  <div className="col-sm-6">
                    <label
                      className="form-label"
                      style={{ fontSize: "13px", fontWeight: 600, color: "#374151" }}
                    >
                      Established Year
                    </label>
                    <input
                      type="number"
                      className={`form-control ${
                        formErrors.year ? "is-invalid" : ""
                      }`}
                      placeholder="e.g. 1883"
                      value={formYear}
                      onChange={(e) => setFormYear(e.target.value)}
                      style={{ borderRadius: "8px", fontSize: "13.5px" }}
                    />
                    {formErrors.year && (
                      <div className="invalid-feedback d-block">
                        {formErrors.year}
                      </div>
                    )}
                  </div>
                </div>

                {/* Website URL */}
                <div className="mb-3">
                  <label
                    className="form-label"
                    style={{ fontSize: "13px", fontWeight: 600, color: "#374151" }}
                  >
                    Website URL
                  </label>
                  <input
                    type="url"
                    className="form-control"
                    placeholder="https://..."
                    value={formWebsite}
                    onChange={(e) => setFormWebsite(e.target.value)}
                    style={{ borderRadius: "8px", fontSize: "13.5px" }}
                  />
                </div>

                {/* Description */}
                <div className="mb-3">
                  <label
                    className="form-label"
                    style={{ fontSize: "13px", fontWeight: 600, color: "#374151" }}
                  >
                    Description
                  </label>
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="Brand background, signature products..."
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    style={{
                      borderRadius: "8px",
                      fontSize: "13.5px",
                      resize: "vertical",
                    }}
                  ></textarea>
                </div>

                {/* Status */}
                <div className="mb-2">
                  <label
                    className="form-label"
                    style={{ fontSize: "13px", fontWeight: 600, color: "#374151" }}
                  >
                    Status
                  </label>
                  <select
                    className="form-select"
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    style={{ borderRadius: "8px", fontSize: "13.5px" }}
                  >
                    <option value="ACTIVE">🟢 Active (Published)</option>
                    <option value="INACTIVE">⚫ Inactive (Hidden)</option>
                  </select>
                </div>
              </div>

              {/* Footer */}
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
                  {actionLoading ? "Creating..." : "Create Brand"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* EDIT BRAND MODAL (Synchronized solid design)             */}
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
          {/* Backdrop blur */}
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
              maxWidth: "540px",
              backgroundColor: "#ffffff",
              borderRadius: "20px",
              boxShadow: "0 24px 60px rgba(0,0,0,0.18)",
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: "20px 24px",
                borderBottom: "1px solid #f0f2f5",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: "#ffffff",
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
                  <i
                    className="fa-regular fa-pen-to-square"
                    style={{ fontSize: "16px", color: "#3b82f6" }}
                  />
                </div>
                <div>
                  <h5
                    style={{
                      margin: 0,
                      fontWeight: 700,
                      fontSize: "16px",
                      color: "#1e2229",
                    }}
                  >
                    Edit Brand
                  </h5>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "12px",
                      color: "#8a94a6",
                      marginTop: "2px",
                    }}
                  >
                    Update brand partner details and information
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
              <div
                style={{
                  padding: "20px 24px",
                  maxHeight: "calc(85vh - 140px)",
                  overflowY: "auto",
                  backgroundColor: "#ffffff",
                }}
              >
                {/* Brand Name */}
                <div className="mb-3">
                  <label
                    className="form-label"
                    style={{ fontSize: "13px", fontWeight: 600, color: "#374151" }}
                  >
                    Brand Name <span style={{ color: "#e9613f" }}>*</span>
                  </label>
                  <input
                    type="text"
                    className={`form-control ${
                      formErrors.name ? "is-invalid" : ""
                    }`}
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    style={{ borderRadius: "8px", fontSize: "13.5px" }}
                  />
                  {formErrors.name && (
                    <div className="invalid-feedback d-block">
                      {formErrors.name}
                    </div>
                  )}
                </div>

                {/* Country & Established Year */}
                <div className="row g-2 mb-3">
                  <div className="col-sm-6">
                    <label
                      className="form-label"
                      style={{ fontSize: "13px", fontWeight: 600, color: "#374151" }}
                    >
                      Country of Origin <span style={{ color: "#e9613f" }}>*</span>
                    </label>
                    <input
                      type="text"
                      className={`form-control ${
                        formErrors.country ? "is-invalid" : ""
                      }`}
                      value={formCountry}
                      onChange={(e) => setFormCountry(e.target.value)}
                      style={{ borderRadius: "8px", fontSize: "13.5px" }}
                    />
                    {formErrors.country && (
                      <div className="invalid-feedback d-block">
                        {formErrors.country}
                      </div>
                    )}
                  </div>
                  <div className="col-sm-6">
                    <label
                      className="form-label"
                      style={{ fontSize: "13px", fontWeight: 600, color: "#374151" }}
                    >
                      Established Year
                    </label>
                    <input
                      type="number"
                      className={`form-control ${
                        formErrors.year ? "is-invalid" : ""
                      }`}
                      value={formYear}
                      onChange={(e) => setFormYear(e.target.value)}
                      style={{ borderRadius: "8px", fontSize: "13.5px" }}
                    />
                    {formErrors.year && (
                      <div className="invalid-feedback d-block">
                        {formErrors.year}
                      </div>
                    )}
                  </div>
                </div>

                {/* Website URL */}
                <div className="mb-3">
                  <label
                    className="form-label"
                    style={{ fontSize: "13px", fontWeight: 600, color: "#374151" }}
                  >
                    Website URL
                  </label>
                  <input
                    type="url"
                    className="form-control"
                    value={formWebsite}
                    onChange={(e) => setFormWebsite(e.target.value)}
                    style={{ borderRadius: "8px", fontSize: "13.5px" }}
                  />
                </div>

                {/* Description */}
                <div className="mb-3">
                  <label
                    className="form-label"
                    style={{ fontSize: "13px", fontWeight: 600, color: "#374151" }}
                  >
                    Description
                  </label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    style={{
                      borderRadius: "8px",
                      fontSize: "13.5px",
                      resize: "vertical",
                    }}
                  ></textarea>
                </div>

                {/* Status */}
                <div className="mb-2">
                  <label
                    className="form-label"
                    style={{ fontSize: "13px", fontWeight: 600, color: "#374151" }}
                  >
                    Status
                  </label>
                  <select
                    className="form-select"
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    style={{ borderRadius: "8px", fontSize: "13.5px" }}
                  >
                    <option value="ACTIVE">🟢 Active (Published)</option>
                    <option value="INACTIVE">⚫ Inactive (Hidden)</option>
                  </select>
                </div>
              </div>

              {/* Footer */}
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
      {/* BRAND DETAILS MODAL                                      */}
      {/* ======================================================== */}
      {isDetailModalOpen && brandDetail && (
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
          {/* Backdrop blur */}
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
                    width: "44px",
                    height: "44px",
                    borderRadius: "12px",
                    backgroundColor: "rgba(233, 97, 63, 0.1)",
                    color: "#e9613f",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "18px",
                  }}
                >
                  <i className="fa-solid fa-certificate"></i>
                </div>
                <div>
                  <h5 className="mb-0 fw-bold fs-16 text-dark">Brand Details</h5>
                  <span className="text-muted fs-12">
                    ID: #{brandDetail.brandId || brandDetail.id}
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="btn-close"
                onClick={() => setIsDetailModalOpen(false)}
              ></button>
            </div>

            {/* Body */}
            <div className="p-4" style={{ backgroundColor: "#ffffff" }}>
              <div
                className="d-flex align-items-center gap-3 p-3 rounded-3 mb-3"
                style={{
                  backgroundColor: "#f8fafc",
                  border: "1px solid #edf2f7",
                }}
              >
                <div
                  className="rounded-3 d-flex align-items-center justify-content-center fw-bold fs-18"
                  style={{
                    width: "52px",
                    height: "52px",
                    backgroundColor: "#fff",
                    border: "1px solid #e2e8f0",
                    color: "#1e2229",
                    flexShrink: 0,
                  }}
                >
                  {(brandDetail.name || "").substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h5 className="fw-bold mb-1 text-dark">{brandDetail.name}</h5>
                  <div className="d-flex align-items-center gap-2">
                    <span
                      className={`admin-badge ${
                        brandDetail.status === "ACTIVE"
                          ? "user-status-active"
                          : "user-status-blocked"
                      }`}
                    >
                      {brandDetail.status || "ACTIVE"}
                    </span>
                    {brandDetail.establishedYear && (
                      <span className="badge bg-light text-muted border fs-11">
                        Est. {brandDetail.establishedYear}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="row g-3">
                <div className="col-6">
                  <div className="p-3 rounded-3 border bg-light-subtle">
                    <span className="text-muted fs-11 text-uppercase fw-600 d-block">
                      Origin Country
                    </span>
                    <span className="fw-600 text-dark fs-13 mt-1 d-block">
                      <i className="fa-solid fa-location-dot text-danger me-1"></i>{" "}
                      {brandDetail.country || "Not specified"}
                    </span>
                  </div>
                </div>
                <div className="col-6">
                  <div className="p-3 rounded-3 border bg-light-subtle">
                    <span className="text-muted fs-11 text-uppercase fw-600 d-block">
                      Supplied Products
                    </span>
                    <span className="fw-600 text-primary fs-13 mt-1 d-block">
                      <i className="fa-solid fa-boxes-stacked me-1"></i>{" "}
                      {brandDetail.productCount || 0} products
                    </span>
                  </div>
                </div>
                {brandDetail.website && (
                  <div className="col-12">
                    <div className="p-3 rounded-3 border bg-light-subtle">
                      <span className="text-muted fs-11 text-uppercase fw-600 d-block">
                        Website
                      </span>
                      <a
                        href={brandDetail.website}
                        target="_blank"
                        rel="noreferrer"
                        className="fw-600 text-primary fs-13 mt-1 d-inline-flex align-items-center gap-1 text-decoration-none"
                      >
                        <i className="fa-solid fa-arrow-up-right-from-square fs-11"></i>{" "}
                        {brandDetail.website}
                      </a>
                    </div>
                  </div>
                )}
                <div className="col-12">
                  <div className="p-3 rounded-3 border bg-light-subtle">
                    <span className="text-muted fs-11 text-uppercase fw-600 d-block">
                      Description
                    </span>
                    <p
                      className="mb-0 text-muted fs-13 mt-1"
                      style={{ whiteSpace: "pre-line" }}
                    >
                      {brandDetail.description || "No detailed description available."}
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
                backgroundColor: "#f8fafc",
              }}
            >
              <button
                type="button"
                className="btn btn-secondary px-4 py-2 fs-13 fw-semibold"
                onClick={() => setIsDetailModalOpen(false)}
              >
                Close
              </button>
              <button
                type="button"
                className="admin-btn-primary px-4 py-2 fs-13"
                onClick={() => {
                  setIsDetailModalOpen(false);
                  openEditModal(brandDetail);
                }}
              >
                <i className="fa-regular fa-pen-to-square me-1"></i> Edit Brand
              </button>
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
