import React, { useEffect, useMemo, useState } from "react";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import {
  adminCreateProduct,
  adminDeleteProduct,
  adminUpdateProduct,
  adminUpdateStock,
  getBrands,
  getCategories,
  getProductImage,
  getProducts,
} from "../../services/productService";
import "../../styles/admin.css";

export const AdminProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination & Filtering state
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("createdAt,desc");

  // Alerts
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Form states (Add / Edit)
  const [formName, setFormName] = useState("");
  const [formSku, setFormSku] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formStock, setFormStock] = useState("");
  const [formWeight, setFormWeight] = useState("0.1");
  const [formCategoryId, setFormCategoryId] = useState("");
  const [formBrandId, setFormBrandId] = useState("");
  const [formImageUrl, setFormImageUrl] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formStatus, setFormStatus] = useState("ACTIVE");
  const [formErrors, setFormErrors] = useState({});

  // Quick Stock form state
  const [stockToUpdate, setStockToUpdate] = useState(0);

  // Fetch categories and brands on mount
  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const [catRes, brandRes] = await Promise.all([
          getCategories(),
          getBrands(),
        ]);
        setCategories(catRes.data || []);
        setBrands(brandRes.data || []);
      } catch (err) {
        console.error("Failed to load categories or brands:", err);
      }
    };
    fetchMeta();
  }, []);

  // Fetch product list
  const fetchProductList = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        size: 10,
        sort: sortBy,
      };
      if (searchQuery.trim()) params.keyword = searchQuery.trim();
      if (selectedCategory) params.categoryId = selectedCategory;
      if (selectedBrand) params.brandId = selectedBrand;

      const res = await getProducts(params);
      const data = res.data;
      setProducts(data.content || []);
      setTotalPages(data.totalPages || 1);
      setTotalElements(data.totalElements || 0);
    } catch (err) {
      console.error("Failed to fetch products:", err);
      setErrorMsg("Failed to fetch product list. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductList();
  }, [page, selectedCategory, selectedBrand, sortBy]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(0);
      fetchProductList();
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Filter products by status
  const filteredProducts = useMemo(() => {
    if (statusFilter === "ALL") return products;
    return products.filter((p) => p.status === statusFilter);
  }, [products, statusFilter]);

  // Stat computations
  const lowStockCount = useMemo(() => {
    return products.filter((p) => (p.stockQuantity ?? p.stock ?? 0) < 10).length;
  }, [products]);

  // Reset form
  const resetForm = () => {
    setFormName("");
    setFormSku("");
    setFormPrice("");
    setFormStock("");
    setFormWeight("0.1");
    setFormCategoryId(categories[0]?.categoryId || "");
    setFormBrandId(brands[0]?.brandId || "");
    setFormImageUrl("");
    setFormDescription("");
    setFormStatus("ACTIVE");
    setFormErrors({});
  };

  // Open Add Modal
  const openAddModal = () => {
    resetForm();
    if (categories.length > 0) setFormCategoryId(categories[0].categoryId);
    if (brands.length > 0) setFormBrandId(brands[0].brandId);
    setProductToEdit(null);
    setIsAddModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (p) => {
    setProductToEdit(p);
    setFormName(p.name || "");
    setFormSku(p.sku || "");
    setFormPrice(p.price !== undefined ? p.price : "");
    setFormStock(p.stockQuantity ?? p.stock ?? 0);
    setFormWeight(p.weightKg || "0.1");
    setFormCategoryId(p.category?.categoryId || (categories[0]?.categoryId || ""));
    setFormBrandId(p.brand?.brandId || (brands[0]?.brandId || ""));
    setFormImageUrl(p.imageUrl || "");
    setFormDescription(p.description || "");
    setFormStatus(p.status || "ACTIVE");
    setFormErrors({});
    setIsEditModalOpen(true);
  };

  // Open Quick Stock Modal
  const openStockModal = (p) => {
    setProductToEdit(p);
    setStockToUpdate(p.stockQuantity ?? p.stock ?? 0);
    setIsStockModalOpen(true);
  };

  // Open Delete Confirm
  const openDeleteModal = (p) => {
    setProductToDelete(p);
    setIsDeleteConfirmOpen(true);
  };

  // Validate form
  const validateForm = () => {
    const errs = {};
    if (!formName.trim()) errs.name = "Product name is required.";
    if (!formSku.trim()) errs.sku = "SKU code is required.";
    if (formPrice === "" || isNaN(formPrice) || Number(formPrice) < 0) {
      errs.price = "Valid price >= 0 is required.";
    }
    if (formStock === "" || isNaN(formStock) || Number(formStock) < 0) {
      errs.stock = "Valid stock quantity >= 0 is required.";
    }
    if (!formCategoryId) errs.categoryId = "Category is required.";
    if (!formBrandId) errs.brandId = "Brand is required.";
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Handle Save (Add)
  const handleSaveAdd = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setActionLoading(true);
    setErrorMsg("");
    try {
      const payload = {
        name: formName.trim(),
        sku: formSku.trim(),
        price: parseFloat(formPrice),
        stockQuantity: parseInt(formStock, 10),
        weightKg: parseFloat(formWeight) || 0.1,
        categoryId: Number(formCategoryId),
        brandId: Number(formBrandId),
        imageUrl: formImageUrl.trim() || undefined,
        description: formDescription.trim() || undefined,
        status: formStatus,
      };

      await adminCreateProduct(payload);
      setIsAddModalOpen(false);
      setSuccessMsg(`Product "${payload.name}" has been created successfully!`);
      setTimeout(() => setSuccessMsg(""), 4000);
      fetchProductList();
    } catch (err) {
      console.error("Failed to create product:", err);
      const msg = err.response?.data?.message || err.response?.data?.errors
        ? JSON.stringify(err.response?.data?.errors)
        : "Failed to create product. Check if SKU is unique.";
      setErrorMsg(msg);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Save (Edit)
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setActionLoading(true);
    setErrorMsg("");
    try {
      const payload = {
        name: formName.trim(),
        sku: formSku.trim(),
        price: parseFloat(formPrice),
        stockQuantity: parseInt(formStock, 10),
        weightKg: parseFloat(formWeight) || 0.1,
        categoryId: Number(formCategoryId),
        brandId: Number(formBrandId),
        imageUrl: formImageUrl.trim() || undefined,
        description: formDescription.trim() || undefined,
        status: formStatus,
      };

      const id = productToEdit.productId || productToEdit.id;
      await adminUpdateProduct(id, payload);
      setIsEditModalOpen(false);
      setSuccessMsg(`Product "${payload.name}" has been updated successfully!`);
      setTimeout(() => setSuccessMsg(""), 4000);
      fetchProductList();
    } catch (err) {
      console.error("Failed to update product:", err);
      const msg = err.response?.data?.message || "Failed to update product.";
      setErrorMsg(msg);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Quick Stock Update
  const handleSaveStock = async (e) => {
    e.preventDefault();
    if (stockToUpdate < 0) {
      setErrorMsg("Stock quantity cannot be negative.");
      return;
    }

    setActionLoading(true);
    try {
      const id = productToEdit.productId || productToEdit.id;
      await adminUpdateStock(id, parseInt(stockToUpdate, 10));
      setIsStockModalOpen(false);
      setSuccessMsg(`Updated stock for "${productToEdit.name}" to ${stockToUpdate} items.`);
      setTimeout(() => setSuccessMsg(""), 4000);
      fetchProductList();
    } catch (err) {
      console.error("Failed to update stock:", err);
      setErrorMsg(err.response?.data?.message || "Failed to update stock.");
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Delete
  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    setActionLoading(true);
    setErrorMsg("");
    try {
      const id = productToDelete.productId || productToDelete.id;
      await adminDeleteProduct(id);
      setIsDeleteConfirmOpen(false);
      setSuccessMsg(`Product "${productToDelete.name}" has been deleted.`);
      setTimeout(() => setSuccessMsg(""), 4000);
      fetchProductList();
    } catch (err) {
      console.error("Failed to delete product:", err);
      setIsDeleteConfirmOpen(false);
      setErrorMsg(
        err.response?.data?.message ||
          "Cannot delete product as it is referenced by existing orders or carts."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // Format currency in VND
  const formatVND = (amount) => {
    if (amount === undefined || amount === null) return "0 ₫";
    return Number(amount).toLocaleString("vi-VN") + " ₫";
  };

  return (
    <div className="container-fluid p-4">
      {/* Page Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h3 className="fw-700 medium-black mb-1">Product Management</h3>
          <p className="text-muted fs-14 mb-0">
            Create, update, manage stock and catalog visibility for stationery items.
          </p>
        </div>

        <button
          type="button"
          className="admin-btn-primary d-inline-flex align-items-center gap-2"
          onClick={openAddModal}
        >
          <i className="fa-solid fa-plus"></i> Add New Product
        </button>
      </div>

      {/* Stat Cards */}
      <div className="row g-3 mb-4">
        <div className="col-xl-3 col-sm-6">
          <div className="admin-stat-card p-3 bg-white rounded-3 border shadow-sm d-flex align-items-center justify-content-between">
            <div>
              <span className="text-muted fs-12 fw-600 text-uppercase">Total Catalog</span>
              <h3 className="mb-0 fw-700 mt-1 medium-black">{totalElements}</h3>
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
              <i className="fa-solid fa-boxes-stacked fs-20"></i>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-sm-6">
          <div className="admin-stat-card p-3 bg-white rounded-3 border shadow-sm d-flex align-items-center justify-content-between">
            <div>
              <span className="text-muted fs-12 fw-600 text-uppercase">Categories</span>
              <h3 className="mb-0 fw-700 mt-1 text-primary">{categories.length}</h3>
            </div>
            <div
              className="d-flex align-items-center justify-content-center rounded-3 bg-primary-subtle text-primary"
              style={{ width: "48px", height: "48px" }}
            >
              <i className="fa-solid fa-layer-group fs-20"></i>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-sm-6">
          <div className="admin-stat-card p-3 bg-white rounded-3 border shadow-sm d-flex align-items-center justify-content-between">
            <div>
              <span className="text-muted fs-12 fw-600 text-uppercase">Brands</span>
              <h3 className="mb-0 fw-700 mt-1 text-success">{brands.length}</h3>
            </div>
            <div
              className="d-flex align-items-center justify-content-center rounded-3 bg-success-subtle text-success"
              style={{ width: "48px", height: "48px" }}
            >
              <i className="fa-solid fa-certificate fs-20"></i>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-sm-6">
          <div className="admin-stat-card p-3 bg-white rounded-3 border shadow-sm d-flex align-items-center justify-content-between">
            <div>
              <span className="text-muted fs-12 fw-600 text-uppercase">Low / Out of Stock</span>
              <h3 className={`mb-0 fw-700 mt-1 ${lowStockCount > 0 ? "text-danger" : "text-muted"}`}>
                {lowStockCount}
              </h3>
            </div>
            <div
              className={`d-flex align-items-center justify-content-center rounded-3 ${
                lowStockCount > 0 ? "bg-danger-subtle text-danger" : "bg-light text-muted"
              }`}
              style={{ width: "48px", height: "48px" }}
            >
              <i className="fa-solid fa-triangle-exclamation fs-20"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Alert Messages */}
      {successMsg && (
        <div className="alert alert-success alert-dismissible fade show mb-4 d-flex align-items-center">
          <i className="fa-solid fa-circle-check me-2 fs-18"></i>
          <div>{successMsg}</div>
          <button type="button" className="btn-close" onClick={() => setSuccessMsg("")}></button>
        </div>
      )}
      {errorMsg && (
        <div className="alert alert-danger alert-dismissible fade show mb-4 d-flex align-items-center">
          <i className="fa-solid fa-circle-xmark me-2 fs-18"></i>
          <div>{errorMsg}</div>
          <button type="button" className="btn-close" onClick={() => setErrorMsg("")}></button>
        </div>
      )}

      {/* Main Table Card */}
      <div className="bg-white rounded-3 border shadow-sm p-4">
        {/* Filter Toolbar */}
        <div className="row g-3 mb-4">
          <div className="col-md-4 col-lg-3">
            <div className="position-relative">
              <input
                type="text"
                className="form-control ps-4"
                style={{ borderRadius: "20px", fontSize: "13px" }}
                placeholder="Search name, SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <i
                className="fa-solid fa-magnifying-glass position-absolute text-muted"
                style={{ left: "14px", top: "50%", transform: "translateY(-50%)", fontSize: "12px" }}
              ></i>
            </div>
          </div>

          <div className="col-md-3 col-lg-2">
            <select
              className="form-select"
              style={{ borderRadius: "20px", fontSize: "13px" }}
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPage(0);
              }}
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.categoryId} value={c.categoryId}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-3 col-lg-2">
            <select
              className="form-select"
              style={{ borderRadius: "20px", fontSize: "13px" }}
              value={selectedBrand}
              onChange={(e) => {
                setSelectedBrand(e.target.value);
                setPage(0);
              }}
            >
              <option value="">All Brands</option>
              {brands.map((b) => (
                <option key={b.brandId} value={b.brandId}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-3 col-lg-2">
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

          <div className="col-md-3 col-lg-3 text-md-end">
            <select
              className="form-select d-inline-block w-auto"
              style={{ borderRadius: "20px", fontSize: "13px" }}
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(0);
              }}
            >
              <option value="createdAt,desc">Newest First</option>
              <option value="price,asc">Price: Low to High</option>
              <option value="price,desc">Price: High to Low</option>
              <option value="stockQuantity,asc">Stock: Low to High</option>
              <option value="stockQuantity,desc">Stock: High to Low</option>
            </select>
          </div>
        </div>

        {/* Product Table */}
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr className="fs-12 text-uppercase text-muted">
                <th>Product</th>
                <th>SKU</th>
                <th>Category / Brand</th>
                <th>Price</th>
                <th className="text-center">Stock</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-5">
                    <div className="spinner-border text-primary" role="status"></div>
                    <div className="mt-2 text-muted fs-13">Loading product inventory...</div>
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-5 text-muted">
                    <i className="fa-solid fa-box-open fa-3x mb-3 d-block text-secondary"></i>
                    No products found matching your search.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const stockNum = p.stockQuantity ?? p.stock ?? 0;
                  const imgSrc = getProductImage(p);
                  return (
                    <tr key={p.productId || p.id}>
                      {/* Product Name & Image */}
                      <td>
                        <div className="d-flex align-items-center gap-3">
                          <img
                            src={imgSrc}
                            alt={p.name}
                            className="rounded-3 border object-fit-cover"
                            style={{ width: "44px", height: "44px", backgroundColor: "#f8f9fa" }}
                            onError={(e) => {
                              e.target.src = "/assets/media/products/product-1.png";
                            }}
                          />
                          <div>
                            <div className="fw-600 medium-black fs-14">{p.name}</div>
                            <span className="fs-11 text-muted">ID: #{p.productId || p.id}</span>
                          </div>
                        </div>
                      </td>

                      {/* SKU */}
                      <td>
                        <code className="bg-light px-2 py-1 rounded text-primary fs-12 fw-600">
                          {p.sku}
                        </code>
                      </td>

                      {/* Category & Brand */}
                      <td>
                        <div className="fs-13 fw-500 medium-black">
                          {p.category?.name || "—"}
                        </div>
                        <span className="fs-11 text-muted">
                          {p.brand?.name || "—"}
                        </span>
                      </td>

                      {/* Price */}
                      <td>
                        <span className="fw-700 text-danger fs-14">
                          {formatVND(p.price)}
                        </span>
                      </td>

                      {/* Stock Quantity */}
                      <td className="text-center">
                        <button
                          type="button"
                          className={`badge border-0 cursor-pointer ${
                            stockNum === 0
                              ? "bg-danger text-white"
                              : stockNum < 10
                              ? "bg-warning text-dark"
                              : "bg-light text-dark border"
                          }`}
                          style={{ fontSize: "12px", padding: "6px 10px", cursor: "pointer" }}
                          onClick={() => openStockModal(p)}
                          title="Click to quick update stock"
                        >
                          {stockNum} pcs <i className="fa-solid fa-pencil ms-1 fs-10"></i>
                        </button>
                      </td>

                      {/* Status */}
                      <td>
                        {p.status === "ACTIVE" ? (
                          <span className="badge bg-success-subtle text-success fs-12 px-2 py-1">
                            <i className="fa-solid fa-circle-check me-1"></i> Active
                          </span>
                        ) : (
                          <span className="badge bg-secondary-subtle text-secondary fs-12 px-2 py-1">
                            <i className="fa-solid fa-circle-pause me-1"></i> Inactive
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="text-end">
                        <div className="d-flex align-items-center justify-content-end gap-1">
                          <button
                            type="button"
                            className="btn btn-sm btn-light border text-muted"
                            title="Quick Adjust Stock"
                            onClick={() => openStockModal(p)}
                          >
                            <i className="fa-solid fa-boxes-packing"></i>
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-light border text-primary"
                            title="Edit Product"
                            onClick={() => openEditModal(p)}
                          >
                            <i className="fa-regular fa-pen-to-square"></i>
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-light border text-danger"
                            title="Delete Product"
                            onClick={() => openDeleteModal(p)}
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

        {/* Pagination Bar */}
        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center mt-4 pt-3 border-top gap-3">
          <span className="text-muted fs-13">
            Showing Page <span className="fw-600 text-dark">{page + 1}</span> of{" "}
            <span className="fw-600 text-dark">{totalPages}</span> ({totalElements} items total)
          </span>

          <div className="d-flex gap-2">
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary px-3"
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              <i className="fa-solid fa-chevron-left me-1"></i> Previous
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary px-3"
              disabled={page + 1 >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next <i className="fa-solid fa-chevron-right ms-1"></i>
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* ADD / EDIT PRODUCT MODAL                                  */}
      {/* ======================================================== */}
      {(isAddModalOpen || isEditModalOpen) && (
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
              if (!actionLoading) {
                setIsAddModalOpen(false);
                setIsEditModalOpen(false);
              }
            }}
          />

          {/* Modal Panel */}
          <div
            style={{
              position: "relative",
              width: "100%",
              maxWidth: "680px",
              maxHeight: "90vh",
              backgroundColor: "#fff",
              borderRadius: "20px",
              boxShadow: "0 24px 60px rgba(0,0,0,0.18)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: "24px 28px 20px",
                borderBottom: "1px solid #f0f2f5",
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                flexShrink: 0,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "12px",
                    backgroundColor: isAddModalOpen ? "rgba(233,97,63,0.1)" : "rgba(59,130,246,0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <i
                    className={isAddModalOpen ? "fa-solid fa-plus" : "fa-regular fa-pen-to-square"}
                    style={{
                      fontSize: "18px",
                      color: isAddModalOpen ? "#e9613f" : "#3b82f6",
                    }}
                  />
                </div>
                <div>
                  <h5 style={{ margin: 0, fontWeight: 700, fontSize: "17px", color: "#1e2229" }}>
                    {isAddModalOpen ? "Add New Product" : "Edit Product"}
                  </h5>
                  <p style={{ margin: 0, fontSize: "13px", color: "#8a94a6", marginTop: "2px" }}>
                    {isAddModalOpen
                      ? "Fill in the details below to add a new stationery item"
                      : `Editing: ${productToEdit?.name || `#${productToEdit?.productId || productToEdit?.id}`}`}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!actionLoading) {
                    setIsAddModalOpen(false);
                    setIsEditModalOpen(false);
                  }
                }}
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
                  flexShrink: 0,
                  color: "#8a94a6",
                  fontSize: "14px",
                }}
              >
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            {/* Scrollable Body */}
            <form
              onSubmit={isAddModalOpen ? handleSaveAdd : handleSaveEdit}
              style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}
            >
              <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>

                {/* Section: Basic Info */}
                <div style={{ marginBottom: "8px" }}>
                  <p style={{ fontSize: "11px", fontWeight: 700, color: "#a0aec0", textTransform: "uppercase", letterSpacing: "0.7px", margin: "0 0 14px" }}>
                    Basic Information
                  </p>
                  <div className="row g-3">
                    <div className="col-md-8">
                      <label className="form-label" style={{ fontSize: "13px", fontWeight: 600, color: "#374151" }}>
                        Product Name <span style={{ color: "#e9613f" }}>*</span>
                      </label>
                      <input
                        type="text"
                        className={`form-control ${formErrors.name ? "is-invalid" : ""}`}
                        placeholder="e.g. Pilot FriXion Ball Erasable Gel Pen"
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        style={{ borderRadius: "10px", fontSize: "13.5px" }}
                      />
                      {formErrors.name && <div className="invalid-feedback">{formErrors.name}</div>}
                    </div>
                    <div className="col-md-4">
                      <label className="form-label" style={{ fontSize: "13px", fontWeight: 600, color: "#374151" }}>
                        SKU Code <span style={{ color: "#e9613f" }}>*</span>
                      </label>
                      <input
                        type="text"
                        className={`form-control ${formErrors.sku ? "is-invalid" : ""}`}
                        placeholder="e.g. PILOT-FRX05"
                        value={formSku}
                        onChange={(e) => setFormSku(e.target.value.toUpperCase())}
                        style={{ borderRadius: "10px", fontSize: "13.5px", fontFamily: "monospace", letterSpacing: "0.5px" }}
                      />
                      {formErrors.sku && <div className="invalid-feedback">{formErrors.sku}</div>}
                    </div>
                  </div>
                </div>

                <hr style={{ borderColor: "#f0f2f5", margin: "20px 0" }} />

                {/* Section: Classification */}
                <div style={{ marginBottom: "8px" }}>
                  <p style={{ fontSize: "11px", fontWeight: 700, color: "#a0aec0", textTransform: "uppercase", letterSpacing: "0.7px", margin: "0 0 14px" }}>
                    Classification
                  </p>
                  <div className="row g-3">
                    <div className="col-sm-6">
                      <label className="form-label" style={{ fontSize: "13px", fontWeight: 600, color: "#374151" }}>
                        Category <span style={{ color: "#e9613f" }}>*</span>
                      </label>
                      <select
                        className={`form-select ${formErrors.categoryId ? "is-invalid" : ""}`}
                        value={formCategoryId}
                        onChange={(e) => setFormCategoryId(e.target.value)}
                        style={{ borderRadius: "10px", fontSize: "13.5px" }}
                      >
                        <option value="">— Select category —</option>
                        {categories.map((c) => (
                          <option key={c.categoryId} value={c.categoryId}>{c.name}</option>
                        ))}
                      </select>
                      {formErrors.categoryId && <div className="invalid-feedback">{formErrors.categoryId}</div>}
                    </div>
                    <div className="col-sm-6">
                      <label className="form-label" style={{ fontSize: "13px", fontWeight: 600, color: "#374151" }}>
                        Brand <span style={{ color: "#e9613f" }}>*</span>
                      </label>
                      <select
                        className={`form-select ${formErrors.brandId ? "is-invalid" : ""}`}
                        value={formBrandId}
                        onChange={(e) => setFormBrandId(e.target.value)}
                        style={{ borderRadius: "10px", fontSize: "13.5px" }}
                      >
                        <option value="">— Select brand —</option>
                        {brands.map((b) => (
                          <option key={b.brandId} value={b.brandId}>{b.name}</option>
                        ))}
                      </select>
                      {formErrors.brandId && <div className="invalid-feedback">{formErrors.brandId}</div>}
                    </div>
                  </div>
                </div>

                <hr style={{ borderColor: "#f0f2f5", margin: "20px 0" }} />

                {/* Section: Pricing & Inventory */}
                <div style={{ marginBottom: "8px" }}>
                  <p style={{ fontSize: "11px", fontWeight: 700, color: "#a0aec0", textTransform: "uppercase", letterSpacing: "0.7px", margin: "0 0 14px" }}>
                    Pricing &amp; Inventory
                  </p>
                  <div className="row g-3">
                    <div className="col-sm-4">
                      <label className="form-label" style={{ fontSize: "13px", fontWeight: 600, color: "#374151" }}>
                        Price (VND) <span style={{ color: "#e9613f" }}>*</span>
                      </label>
                      <div style={{ position: "relative" }}>
                        <input
                          type="number"
                          min="0"
                          step="1000"
                          className={`form-control ${formErrors.price ? "is-invalid" : ""}`}
                          placeholder="25000"
                          value={formPrice}
                          onChange={(e) => setFormPrice(e.target.value)}
                          style={{ borderRadius: "10px", fontSize: "13.5px", paddingRight: "40px" }}
                        />
                        <span style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", fontSize: "12px", color: "#aab", pointerEvents: "none" }}>₫</span>
                      </div>
                      {formErrors.price && <div className="invalid-feedback d-block">{formErrors.price}</div>}
                    </div>
                    <div className="col-sm-4">
                      <label className="form-label" style={{ fontSize: "13px", fontWeight: 600, color: "#374151" }}>
                        Stock Qty <span style={{ color: "#e9613f" }}>*</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        className={`form-control ${formErrors.stock ? "is-invalid" : ""}`}
                        placeholder="100"
                        value={formStock}
                        onChange={(e) => setFormStock(e.target.value)}
                        style={{ borderRadius: "10px", fontSize: "13.5px" }}
                      />
                      {formErrors.stock && <div className="invalid-feedback">{formErrors.stock}</div>}
                    </div>
                    <div className="col-sm-4">
                      <label className="form-label" style={{ fontSize: "13px", fontWeight: 600, color: "#374151" }}>Status</label>
                      <select
                        className="form-select"
                        value={formStatus}
                        onChange={(e) => setFormStatus(e.target.value)}
                        style={{ borderRadius: "10px", fontSize: "13.5px" }}
                      >
                        <option value="ACTIVE">🟢 Active — Visible</option>
                        <option value="INACTIVE">⚫ Inactive — Hidden</option>
                      </select>
                    </div>
                  </div>
                </div>

                <hr style={{ borderColor: "#f0f2f5", margin: "20px 0" }} />

                {/* Section: Image & Description */}
                <div>
                  <p style={{ fontSize: "11px", fontWeight: 700, color: "#a0aec0", textTransform: "uppercase", letterSpacing: "0.7px", margin: "0 0 14px" }}>
                    Image &amp; Description
                  </p>
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label" style={{ fontSize: "13px", fontWeight: 600, color: "#374151" }}>Image URL</label>
                      <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                        <div style={{ flexShrink: 0 }}>
                          <img
                            src={formImageUrl || "/assets/media/products/product-1.png"}
                            alt="Preview"
                            style={{
                              width: "60px",
                              height: "60px",
                              borderRadius: "10px",
                              objectFit: "cover",
                              border: "2px solid #f0f2f5",
                              backgroundColor: "#f8f9fa",
                            }}
                            onError={(e) => { e.target.src = "/assets/media/products/product-1.png"; }}
                          />
                        </div>
                        <div style={{ flex: 1 }}>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="/assets/media/products/product-7.png  or  https://..."
                            value={formImageUrl}
                            onChange={(e) => setFormImageUrl(e.target.value)}
                            style={{ borderRadius: "10px", fontSize: "13px" }}
                          />
                          <span style={{ fontSize: "11.5px", color: "#a0aec0", marginTop: "4px", display: "block" }}>
                            Local paths: <code style={{ fontSize: "11px" }}>/assets/media/products/product-1.png</code> to product-12.png, or any public URL
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="col-12">
                      <label className="form-label" style={{ fontSize: "13px", fontWeight: 600, color: "#374151" }}>Description</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        placeholder="Short description of the product (optional)"
                        value={formDescription}
                        onChange={(e) => setFormDescription(e.target.value)}
                        style={{ borderRadius: "10px", fontSize: "13.5px", resize: "vertical" }}
                      />
                    </div>
                  </div>
                </div>

              </div>

              {/* Footer */}
              <div
                style={{
                  padding: "16px 28px 20px",
                  borderTop: "1px solid #f0f2f5",
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "10px",
                  flexShrink: 0,
                  backgroundColor: "#fafbfc",
                }}
              >
                <button
                  type="button"
                  onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }}
                  disabled={actionLoading}
                  style={{
                    padding: "9px 22px",
                    borderRadius: "10px",
                    border: "1px solid #e2e6ea",
                    background: "#fff",
                    color: "#4a5568",
                    fontSize: "13.5px",
                    fontWeight: 600,
                    cursor: actionLoading ? "not-allowed" : "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  style={{
                    padding: "9px 26px",
                    borderRadius: "10px",
                    border: "none",
                    background: isAddModalOpen ? "#e9613f" : "#3b82f6",
                    color: "#fff",
                    fontSize: "13.5px",
                    fontWeight: 600,
                    cursor: actionLoading ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    opacity: actionLoading ? 0.75 : 1,
                    transition: "all 0.15s",
                  }}
                >
                  {actionLoading ? (
                    <><span className="spinner-border spinner-border-sm" />Saving...</>
                  ) : isAddModalOpen ? (
                    <><i className="fa-solid fa-plus" />Create Product</>
                  ) : (
                    <><i className="fa-solid fa-floppy-disk" />Save Changes</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* QUICK UPDATE STOCK MODAL                                 */}
      {/* ======================================================== */}
      {isStockModalOpen && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)", zIndex: 1055 }}
          tabIndex="-1"
        >
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: "420px" }}>
            <div className="modal-content shadow-lg border-0 rounded-4">
              <div className="modal-header border-0 pb-0 pt-4 px-4">
                <div>
                  <h5 className="modal-title fw-700 medium-black">Quick Stock Adjustment</h5>
                  <p className="text-muted fs-13 mb-0">{productToEdit?.name}</p>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setIsStockModalOpen(false)}
                ></button>
              </div>

              <form onSubmit={handleSaveStock}>
                <div className="modal-body p-4">
                  <div className="d-flex align-items-center gap-3 mb-3 p-3 bg-light rounded-3">
                    <img
                      src={getProductImage(productToEdit)}
                      alt={productToEdit?.name}
                      className="rounded-3 border"
                      style={{ width: "44px", height: "44px" }}
                    />
                    <div>
                      <div className="fw-600 fs-13">{productToEdit?.name}</div>
                      <span className="fs-12 text-muted">SKU: {productToEdit?.sku}</span>
                    </div>
                  </div>

                  <label className="form-label fs-13 fw-600">
                    New Stock Quantity (pcs)
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="form-control form-control-lg text-center fw-700 fs-20"
                    value={stockToUpdate}
                    onChange={(e) => setStockToUpdate(e.target.value)}
                    required
                  />
                  <div className="d-flex justify-content-center gap-2 mt-3">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => setStockToUpdate((s) => Math.max(0, Number(s) - 10))}
                    >
                      -10
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => setStockToUpdate((s) => Math.max(0, Number(s) - 1))}
                    >
                      -1
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => setStockToUpdate((s) => Number(s) + 1)}
                    >
                      +1
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => setStockToUpdate((s) => Number(s) + 10)}
                    >
                      +10
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => setStockToUpdate((s) => Number(s) + 50)}
                    >
                      +50
                    </button>
                  </div>
                </div>

                <div className="modal-footer border-0 pt-0 pb-4 px-4">
                  <button
                    type="button"
                    className="btn btn-light px-4 rounded-3 border"
                    onClick={() => setIsStockModalOpen(false)}
                    disabled={actionLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="admin-btn-primary px-4 rounded-3"
                    disabled={actionLoading}
                  >
                    {actionLoading ? "Updating..." : "Save Stock"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteConfirmOpen}
        title="Delete Stationery Product"
        message={`Are you sure you want to delete "${productToDelete?.name}" (${productToDelete?.sku})? This action cannot be undone.`}
        confirmText="Yes, Delete Product"
        cancelText="Cancel"
        confirmVariant="danger"
        isLoading={actionLoading}
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsDeleteConfirmOpen(false)}
      />
    </div>
  );
};

export default AdminProductManagement;
