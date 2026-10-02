import React, { useEffect, useRef, useState } from "react";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import { useToast } from "../../providers/ToastContext";
import {
  adminCreateProduct,
  adminDeleteProduct,
  adminGetProducts,
  adminUpdateProduct,
  adminUpdateStock,
  getBrands,
  getCategories,
  getProductImage,
  uploadProductImage,
} from "../../services/productService";
import { notifyProductChange } from "../../utils/syncEvents";
import "../../styles/admin.css";

export const AdminProductManagement = () => {
  const { showToast } = useToast();
  const fileInputRef = useRef(null);

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination & Filtering state (10 products per page as requested)
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("createdAt,desc");

  // Summary statistics state
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    outOfStock: 0,
  });

  const fetchStats = async () => {
    try {
      // Gọi song song: tổng, active, inactive — dùng size:1 để chỉ lấy totalElements
      const [totalRes, activeRes, inactiveRes, allStockRes] = await Promise.allSettled([
        adminGetProducts({ page: 0, size: 1 }),                        // Tổng tất cả
        adminGetProducts({ page: 0, size: 1, status: "ACTIVE" }),      // Chỉ ACTIVE
        adminGetProducts({ page: 0, size: 1, status: "INACTIVE" }),    // Chỉ INACTIVE
        adminGetProducts({ page: 0, size: 2000 }),                     // Fetch all để đếm outOfStock
      ]);

      const total =
        totalRes.status === "fulfilled"
          ? (totalRes.value.data?.totalElements ?? 0)
          : 0;

      const active =
        activeRes.status === "fulfilled"
          ? (activeRes.value.data?.totalElements ?? 0)
          : 0;

      const inactive =
        inactiveRes.status === "fulfilled"
          ? (inactiveRes.value.data?.totalElements ?? 0)
          : 0;

      // Đếm hết hàng từ toàn bộ danh sách content
      let outOfStock = 0;
      if (allStockRes.status === "fulfilled") {
        const allContent = allStockRes.value.data?.content || [];
        allContent.forEach((p) => {
          const stockNum = p.stockQuantity ?? p.stock_quantity ?? p.stock ?? 0;
          if (stockNum === 0) outOfStock++;
        });
      }

      setStats({ total, active, inactive, outOfStock });
    } catch (err) {
      console.warn("Could not fetch product stats:", err);
    }
  };


  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedProductDetail, setSelectedProductDetail] = useState(null);
  const [productToEdit, setProductToEdit] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const handleOpenDetail = (prod) => {
    setSelectedProductDetail(prod);
    setIsDetailModalOpen(true);
  };

  // Form states (Add / Edit)
  const [formName, setFormName] = useState("");
  const [formSku, setFormSku] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formStock, setFormStock] = useState("");
  const [formWeight, setFormWeight] = useState("0.1");
  const [formCategoryId, setFormCategoryId] = useState("");
  const [formBrandId, setFormBrandId] = useState("");
  const [formImageUrl, setFormImageUrl] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formStatus, setFormStatus] = useState("ACTIVE");
  const [formErrors, setFormErrors] = useState({});

  // Quick Stock form state
  const [stockToUpdate, setStockToUpdate] = useState(0);

  // Fetch categories, brands and stats on mount
  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const [catRes, brandRes] = await Promise.all([
          getCategories(),
          getBrands(),
        ]);
        const catList = catRes.data || [];
        const brandList = brandRes.data || [];
        setCategories(catList);
        setBrands(brandList);
      } catch (err) {
        console.error("Failed to load categories or brands:", err);
      }
    };
    fetchMeta();
    fetchStats();
  }, []);

  // Fetch product list
  const fetchProductList = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        size,
        sort: sortBy,
      };
      if (searchQuery.trim()) params.keyword = searchQuery.trim();
      if (selectedCategory) params.categoryId = selectedCategory;
      if (selectedBrand) params.brandId = selectedBrand;
      // Truyền status filter lên backend để phân trang chính xác
      if (statusFilter && statusFilter !== "ALL") params.status = statusFilter;

      const res = await adminGetProducts(params);
      const data = res.data;
      const newTotalPages = data.totalPages || 1;
      setTotalPages(newTotalPages);
      setTotalElements(data.totalElements || 0);

      if (page > 0 && (data.content || []).length === 0 && page >= newTotalPages) {
        setPage(Math.max(0, newTotalPages - 1));
        return;
      }

      setProducts(data.content || []);
    } catch (err) {
      console.error("Failed to fetch products:", err);
      showToast("Không thể tải danh sách sản phẩm. Vui lòng thử lại!", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(0);
    fetchProductList();
  }, [selectedCategory, selectedBrand, sortBy, statusFilter]);

  // Riêng page không reset về 0
  useEffect(() => {
    fetchProductList();
  }, [page]);

  // Tự động điều chỉnh trang nếu trang hiện tại vượt quá tổng số trang sau khi xoá/lọc
  useEffect(() => {
    if (page >= totalPages && totalPages > 0) {
      setPage(Math.max(0, totalPages - 1));
    }
  }, [totalPages, page]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(0);
      fetchProductList();
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // products đã được filter server-side theo statusFilter, không cần filter lại client-side
  const filteredProducts = products;

  // Reset form
  const resetForm = () => {
    setFormName("");
    setFormSku("");
    setFormPrice("");
    setFormStock("");
    setFormWeight("0.1");
    setFormCategoryId(categories[0]?.categoryId ? String(categories[0].categoryId) : "");
    setFormBrandId(brands[0]?.brandId ? String(brands[0].brandId) : "");
    setFormImageUrl("");
    setImagePreview("");
    setFormDescription("");
    setFormStatus("ACTIVE");
    setFormErrors({});
  };

  // Open Add Modal
  const openAddModal = () => {
    resetForm();
    if (categories.length > 0) setFormCategoryId(String(categories[0].categoryId));
    if (brands.length > 0) setFormBrandId(String(brands[0].brandId));
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
    setFormWeight(p.weightKg || p.weight || "0.1");
    setFormCategoryId(String(p.category?.categoryId || categories[0]?.categoryId || ""));
    setFormBrandId(String(p.brand?.brandId || brands[0]?.brandId || ""));
    setFormImageUrl(p.imageUrl || "");
    setImagePreview(p.imageUrl ? (getProductImage(p) || p.imageUrl) : "");
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

  // Handle Image File Upload from Computer
  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("Vui lòng chọn tệp hình ảnh hợp lệ (PNG, JPG, WEBP, GIF)", "error");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast("Dung lượng ảnh tối đa là 5MB", "error");
      return;
    }

    // Local instant preview
    const localUrl = URL.createObjectURL(file);
    setImagePreview(localUrl);

    setIsUploadingImage(true);
    try {
      const res = await uploadProductImage(file);
      const uploadedUrl = res.data?.url || res.data?.relativePath || "";
      setFormImageUrl(uploadedUrl);
      showToast("Tải ảnh từ máy tính lên thành công!", "success");
    } catch (err) {
      console.error("Image upload failed:", err);
      showToast(err.response?.data?.message || "Tải ảnh thất bại. Vui lòng thử lại!", "error");
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Validate form
  const validateForm = () => {
    const errs = {};

    // --- Tên sản phẩm ---
    const nameVal = formName.trim();
    if (!nameVal) {
      errs.name = "Tên sản phẩm không được để trống.";
    } else if (nameVal.length < 5) {
      errs.name = "Tên sản phẩm phải có ít nhất 5 ký tự.";
    } else if (nameVal.length > 50) {
      errs.name = "Tên sản phẩm không được vượt quá 50 ký tự.";
    } else if (/[^a-zA-Z0-9\sÀ-ỹà-ỹĐđ]/.test(nameVal)) {
      errs.name = "Tên sản phẩm chỉ được chứa chữ cái, chữ số và khoảng trắng (không có ký tự đặc biệt).";
    }

    // --- CODE (SKU) - tuỳ chọn, nếu nhập phải đúng chuẩn ---
    const skuVal = formSku.trim();
    if (skuVal) {
      // Chuẩn: PREFIX-SUFFIX, prefix chỉ chữ/số, suffix chỉ chữ/số và không quá 10 ký tự
      const skuRegex = /^[A-Za-z0-9]+-[A-Za-z0-9]{1,10}$/;
      if (!skuRegex.test(skuVal)) {
        errs.sku = "CODE phải theo chuẩn 'PREFIX-SUFFIX' (VD: SKU-123, SKU-LT14). Phần sau dấu '-' tối đa 10 ký tự, không chứa ký tự đặc biệt.";
      }
    }

    // --- Giá ---
    if (formPrice === "" || isNaN(formPrice)) {
      errs.price = "Giá sản phẩm không được để trống.";
    } else if (Number(formPrice) < 5000) {
      errs.price = "Giá sản phẩm tối thiểu là 5.000 VND.";
    } else if (Number(formPrice) > 1000000) {
      errs.price = "Giá sản phẩm tối đa là 1.000.000 VND.";
    }

    // --- Tồn kho ---
    if (formStock === "" || isNaN(formStock)) {
      errs.stock = "Số lượng tồn kho không được để trống.";
    } else if (Number(formStock) < 0) {
      errs.stock = "Số lượng tồn kho không được âm.";
    } else if (Number(formStock) > 10000) {
      errs.stock = "Số lượng tồn kho tối đa là 10.000 sản phẩm.";
    }

    // --- Trọng lượng ---
    if (formWeight === "" || isNaN(formWeight)) {
      errs.weight = "Trọng lượng không được để trống.";
    } else if (Number(formWeight) <= 0) {
      errs.weight = "Trọng lượng phải lớn hơn 0.";
    } else if (Number(formWeight) > 10) {
      errs.weight = "Trọng lượng tối đa là 10 kg.";
    }

    // --- Danh mục & Thương hiệu ---
    if (!formCategoryId || Number(formCategoryId) <= 0) {
      errs.categoryId = "Vui lòng chọn danh mục hợp lệ.";
    }
    if (!formBrandId || Number(formBrandId) <= 0) {
      errs.brandId = "Vui lòng chọn thương hiệu hợp lệ.";
    }

    const errorKeys = Object.keys(errs);
    if (errorKeys.length === 1) {
      // Chỉ có 1 lỗi: Không hiển thị lỗi trong modal, chỉ hiển thị pop up bên góc trên phải trong 8s
      setFormErrors({});
      showToast(errs[errorKeys[0]], "error", 8000);
      return false;
    } else if (errorKeys.length > 1) {
      // Nhiều trường phạm lỗi: Hiển thị lỗi bên trong modal để người dùng dễ chỉnh sửa và báo pop up trong 8s
      setFormErrors(errs);
      showToast(
        `Có ${errorKeys.length} trường thông tin chưa hợp lệ. Vui lòng kiểm tra lại biểu mẫu.`,
        "error",
        8000
      );
      return false;
    }

    setFormErrors({});
    return true;
  };

  // Handle Save (Add)
  const handleSaveAdd = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setActionLoading(true);
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
      showToast(`Đã thêm sản phẩm "${payload.name}" thành công!`, "success");
      fetchProductList();
      fetchStats();
      notifyProductChange();
    } catch (err) {
      console.error("Failed to create product:", err);
      const msg =
        err.response?.data?.message ||
        (err.response?.data?.errors
          ? Object.values(err.response.data.errors).join(", ")
          : "Không thể thêm sản phẩm. Kiểm tra mã SKU đã tồn tại chưa.");
      showToast(msg, "error");
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Save (Edit)
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setActionLoading(true);
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
      showToast(`Cập nhật sản phẩm "${payload.name}" thành công!`, "success");
      fetchProductList();
      fetchStats();
      notifyProductChange();
    } catch (err) {
      console.error("Failed to update product:", err);
      const msg = err.response?.data?.message || "Cập nhật sản phẩm thất bại.";
      showToast(msg, "error");
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Quick Stock Update
  const handleSaveStock = async (e) => {
    e.preventDefault();
    if (stockToUpdate < 0) {
      showToast("Số lượng tồn kho không được âm.", "error");
      return;
    }

    setActionLoading(true);
    try {
      const id = productToEdit.productId || productToEdit.id;
      await adminUpdateStock(id, parseInt(stockToUpdate, 10));
      setIsStockModalOpen(false);
      showToast(
        `Đã cập nhật tồn kho cho "${productToEdit.name}" thành ${stockToUpdate} sản phẩm.`,
        "success"
      );
      fetchProductList();
      fetchStats();
      notifyProductChange();
    } catch (err) {
      console.error("Failed to update stock:", err);
      showToast(err.response?.data?.message || "Cập nhật tồn kho thất bại.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Delete
  const handleConfirmDelete = async () => {
    if (!productToDelete) return;

    // Chặn xoá nếu sản phẩm đang ACTIVE
    if (productToDelete.status === "ACTIVE") {
      setIsDeleteConfirmOpen(false);
      showToast(
        `Không thể xoá sản phẩm "${productToDelete.name}" vì đang ở trạng thái ACTIVE. Hãy chuyển sang INACTIVE trước khi xoá.`,
        "error"
      );
      return;
    }

    setActionLoading(true);
    try {
      const id = productToDelete.productId || productToDelete.id;
      await adminDeleteProduct(id);
      setIsDeleteConfirmOpen(false);
      showToast(`Đã xoá sản phẩm "${productToDelete.name}".`, "success");
      fetchProductList();
      fetchStats();
      notifyProductChange();
    } catch (err) {
      console.error("Failed to delete product:", err);
      setIsDeleteConfirmOpen(false);
      showToast(
        err.response?.data?.message ||
        "Không thể xoá sản phẩm vì đã có đơn hàng hoặc giỏ hàng liên kết.",
        "error"
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
    <div className="p-4">
      {/* Page Header (Synchronized with User Management) */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
        <div>
          <h4 className="fw-700 medium-black mb-1">Product Management</h4>
          <p className="text-muted fs-13 mb-0">
            Quản lý danh sách sản phẩm, giá bán, trọng lượng, số lượng tồn kho và hình ảnh.
          </p>
        </div>

        <button
          type="button"
          className="admin-btn-primary"
          onClick={openAddModal}
        >
          <i className="fa-solid fa-plus me-1"></i> Add New Product
        </button>
      </div>

      {/* Top Banner Stats (Professional Cards with Icons - matching Category Management) */}
      <div className="row g-3 mb-4">
        {/* Total Products */}
        <div className="col-xl-3 col-sm-6">
          <div className="admin-stat-card p-3 bg-white rounded-3 border shadow-sm d-flex align-items-center justify-content-between">
            <div>
              <span className="text-muted fs-12 fw-600 text-uppercase">
                Tổng sản phẩm
              </span>
              <h3 className="mb-0 fw-700 mt-1">{stats.total}</h3>
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

        {/* Active Products */}
        <div className="col-xl-3 col-sm-6">
          <div className="admin-stat-card p-3 bg-white rounded-3 border shadow-sm d-flex align-items-center justify-content-between">
            <div>
              <span className="text-muted fs-12 fw-600 text-uppercase">
                Đang kinh doanh
              </span>
              <h3 className="mb-0 fw-700 mt-1 text-success">{stats.active}</h3>
            </div>
            <div
              className="d-flex align-items-center justify-content-center rounded-3 bg-success-subtle text-success"
              style={{ width: "48px", height: "48px" }}
            >
              <i className="fa-solid fa-circle-check fs-20"></i>
            </div>
          </div>
        </div>

        {/* Out of stock */}
        <div className="col-xl-3 col-sm-6">
          <div className="admin-stat-card p-3 bg-white rounded-3 border shadow-sm d-flex align-items-center justify-content-between">
            <div>
              <span className="text-muted fs-12 fw-600 text-uppercase">
                Hết hàng
              </span>
              <h3 className="mb-0 fw-700 mt-1" style={{ color: "#f59e0b" }}>{stats.outOfStock}</h3>
            </div>
            <div
              className="d-flex align-items-center justify-content-center rounded-3"
              style={{
                width: "48px",
                height: "48px",
                backgroundColor: "rgba(245, 158, 11, 0.12)",
                color: "#f59e0b",
              }}
            >
              <i className="fa-solid fa-triangle-exclamation fs-20"></i>
            </div>
          </div>
        </div>

        {/* Inactive Products */}
        <div className="col-xl-3 col-sm-6">
          <div className="admin-stat-card p-3 bg-white rounded-3 border shadow-sm d-flex align-items-center justify-content-between">
            <div>
              <span className="text-muted fs-12 fw-600 text-uppercase">
                Tạm ngưng / Đã ẩn
              </span>
              <h3 className="mb-0 fw-700 mt-1" style={{ color: "#ef4444" }}>{stats.inactive}</h3>
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
      </div>

      {/* TOOLBAR CARD (Clean horizontal layout, uniform search, filters, and sort like User Management) */}
      <div className="admin-card mb-4">
        <div className="d-flex flex-wrap align-items-center gap-3">
          {/* Live Auto Search */}
          <div className="admin-search-box">
            <i className="fa-solid fa-magnifying-glass text-muted fs-13"></i>
            <input
              type="text"
              placeholder="Search by name, CODE..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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

          {/* Category Filter */}
          <select
            className="admin-select-sm"
            style={{ width: "160px" }}
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

          {/* Brand Filter */}
          <select
            className="admin-select-sm"
            style={{ width: "160px" }}
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

          {/* Status Filter */}
          <select
            className="admin-select-sm"
            style={{ width: "140px" }}
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
            style={{ width: "165px" }}
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

      {/* PRODUCTS TABLE CARD (Synchronized with User Management) */}
      <div className="admin-card">
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: "60px" }}>STT</th>
                <th>PRODUCT</th>
                <th style={{ width: "130px" }}>CODE</th>
                <th>CATEGORY</th>
                <th>BRAND</th>
                <th>PRICE</th>
                <th>WEIGHT</th>
                <th className="text-center">STOCK</th>
                <th>STATUS</th>
                <th className="text-end">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="10" className="text-center py-5">
                    <div className="spinner-border color-primary" role="status"></div>
                    <p className="mt-2 text-muted fs-14">Loading product inventory...</p>
                  </td>
                </tr>
              ) : filteredProducts.length > 0 ? (
                filteredProducts.map((p, index) => {
                  const stockNum = p.stockQuantity ?? p.stock ?? 0;
                  const itemStt = page * size + index + 1;
                  const weightDisplay = p.weightKg || p.weight || "0.100";

                  return (
                    <tr key={p.productId || p.id}>
                      {/* STT */}
                      <td>
                        <span className="fw-700 color-primary fs-13">
                          #{itemStt}
                        </span>
                      </td>

                      {/* Product Name & Image */}
                      <td>
                        <div className="d-flex align-items-center gap-3">
                          <img
                            src={getProductImage(p)}
                            alt={p.name}
                            style={{
                              width: "44px",
                              height: "44px",
                              borderRadius: "8px",
                              objectFit: "cover",
                              border: "1px solid #edf2f7",
                              backgroundColor: "#f8f9fa",
                            }}
                            onError={(e) => {
                              e.target.src = "/assets/media/products/product-1.png";
                            }}
                          />
                          <div>
                            <span className="fw-600 medium-black d-block fs-14">
                              {p.name}
                            </span>
                            <span className="text-muted fs-12">
                              ID: #{p.productId || p.id}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* CODE */}
                      <td>
                        <span
                          className="font-monospace fw-600 px-2 py-1 rounded"
                          style={{
                            fontSize: "12px",
                            backgroundColor: "#f1f5f9",
                            color: "#475569",
                            border: "1px solid #e2e8f0",
                            letterSpacing: "0.3px",
                          }}
                        >
                          {p.sku || "—"}
                        </span>
                      </td>

                      {/* Category */}
                      <td>
                        <span className="badge bg-light text-dark border fs-12">
                          {p.category?.name || "General"}
                        </span>
                      </td>

                      {/* Brand */}
                      <td>
                        <span className="text-muted fs-13 fw-500">
                          {p.brand?.name || "—"}
                        </span>
                      </td>

                      {/* Price */}
                      <td>
                        <span className="fw-700 color-primary fs-13">
                          {formatVND(p.price)}
                        </span>
                      </td>

                      {/* Weight (DB Column weight_kg) */}
                      <td>
                        <span className="badge bg-light text-secondary border fs-12">
                          <i className="fa-solid fa-weight-hanging me-1 text-muted"></i>
                          {weightDisplay} kg
                        </span>
                      </td>

                      {/* Stock Quantity */}
                      <td className="text-center">
                        <button
                          type="button"
                          className={`badge border-0 cursor-pointer ${stockNum === 0
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
                        <span
                          className={`admin-badge ${p.status === "ACTIVE"
                              ? "user-status-active"
                              : "user-status-blocked"
                            }`}
                        >
                          {p.status || "ACTIVE"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="text-end">
                        <button
                          type="button"
                          className="admin-action-icon-btn me-1"
                          title="View Details"
                          onClick={() => handleOpenDetail(p)}
                        >
                          <i className="fa-regular fa-eye"></i>
                        </button>
                        <button
                          type="button"
                          className="admin-action-icon-btn me-1"
                          title="Edit Product"
                          onClick={() => openEditModal(p)}
                        >
                          <i className="fa-regular fa-pen-to-square"></i>
                        </button>
                        <button
                          type="button"
                          className="admin-action-icon-btn text-danger"
                          title="Delete Product"
                          onClick={() => openDeleteModal(p)}
                        >
                          <i className="fa-regular fa-trash-can"></i>
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="10" className="text-center py-5 text-muted">
                    <i className="fa-solid fa-box-open fa-2x mb-3 d-block text-muted"></i>
                    No products found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION BAR (Synchronized with User Management - 10 records max per page) */}
        <div className="d-flex flex-wrap justify-content-between align-items-center mt-3 pt-3 gap-2">
          <span className="text-muted fs-13">
            Showing{" "}
            <strong>
              {totalElements === 0 ? 0 : page * size + 1} to{" "}
              {Math.min((page + 1) * size, totalElements)}
            </strong>{" "}
            of <strong>{totalElements}</strong> products
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
                  className={`btn ${pageNum === page
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
      {/* ADD / EDIT PRODUCT MODAL WITH COMPUTER FILE UPLOAD       */}
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
                padding: "20px 24px",
                borderBottom: "1px solid #f0f2f5",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexShrink: 0,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "10px",
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
                      fontSize: "16px",
                      color: isAddModalOpen ? "#e9613f" : "#3b82f6",
                    }}
                  />
                </div>
                <div>
                  <h5 style={{ margin: 0, fontWeight: 700, fontSize: "16px", color: "#1e2229" }}>
                    {isAddModalOpen ? "Add New Product" : "Edit Product"}
                  </h5>
                  <p style={{ margin: 0, fontSize: "12px", color: "#8a94a6", marginTop: "2px" }}>
                    {isAddModalOpen
                      ? "Điền thông tin và tải ảnh lên từ máy tính để thêm sản phẩm mới"
                      : `Đang chỉnh sửa: ${productToEdit?.name || `#${productToEdit?.productId || productToEdit?.id}`}`}
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
                  color: "#8a94a6",
                  fontSize: "14px",
                }}
              >
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            {/* Scrollable Body */}
            <form
              noValidate
              onSubmit={isAddModalOpen ? handleSaveAdd : handleSaveEdit}
              style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}
            >
              <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
                {/* Section: Basic Info */}
                <div style={{ marginBottom: "16px" }}>
                  <p style={{ fontSize: "11px", fontWeight: 700, color: "#a0aec0", textTransform: "uppercase", letterSpacing: "0.7px", margin: "0 0 12px" }}>
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
                        placeholder="e.g. Bút bi Thiên Long TL-027"
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        style={{ borderRadius: "8px", fontSize: "13.5px" }}
                      />
                      {formErrors.name && <div className="invalid-feedback d-block">{formErrors.name}</div>}
                    </div>
                    <div className="col-md-4">
                      <label className="form-label" style={{ fontSize: "13px", fontWeight: 600, color: "#374151" }}>
                        CODE <span className="text-muted fw-400"></span>
                      </label>
                      <input
                        type="text"
                        className={`form-control ${formErrors.sku ? "is-invalid" : ""}`}
                        placeholder="Tự động tạo nếu để trống"
                        value={formSku}
                        onChange={(e) => setFormSku(e.target.value.toUpperCase())}
                        style={{ borderRadius: "8px", fontSize: "13.5px", fontFamily: "monospace" }}
                      />
                      {formErrors.sku && <div className="invalid-feedback d-block">{formErrors.sku}</div>}
                    </div>
                  </div>
                </div>

                <hr style={{ borderColor: "#f0f2f5", margin: "16px 0" }} />

                {/* Section: Classification */}
                <div style={{ marginBottom: "16px" }}>
                  <p style={{ fontSize: "11px", fontWeight: 700, color: "#a0aec0", textTransform: "uppercase", letterSpacing: "0.7px", margin: "0 0 12px" }}>
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
                        style={{ borderRadius: "8px", fontSize: "13.5px" }}
                      >
                        <option value="">— Select category —</option>
                        {categories.map((c) => (
                          <option key={c.categoryId} value={c.categoryId}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                      {formErrors.categoryId && <div className="invalid-feedback d-block">{formErrors.categoryId}</div>}
                    </div>
                    <div className="col-sm-6">
                      <label className="form-label" style={{ fontSize: "13px", fontWeight: 600, color: "#374151" }}>
                        Brand <span style={{ color: "#e9613f" }}>*</span>
                      </label>
                      <select
                        className={`form-select ${formErrors.brandId ? "is-invalid" : ""}`}
                        value={formBrandId}
                        onChange={(e) => setFormBrandId(e.target.value)}
                        style={{ borderRadius: "8px", fontSize: "13.5px" }}
                      >
                        <option value="">— Select brand —</option>
                        {brands.map((b) => (
                          <option key={b.brandId} value={b.brandId}>
                            {b.name}
                          </option>
                        ))}
                      </select>
                      {formErrors.brandId && <div className="invalid-feedback d-block">{formErrors.brandId}</div>}
                    </div>
                  </div>
                </div>

                <hr style={{ borderColor: "#f0f2f5", margin: "16px 0" }} />

                {/* Section: Pricing, Stock, Weight & Status */}
                <div style={{ marginBottom: "16px" }}>
                  <p style={{ fontSize: "11px", fontWeight: 700, color: "#a0aec0", textTransform: "uppercase", letterSpacing: "0.7px", margin: "0 0 12px" }}>
                    Pricing, Inventory &amp; Weight
                  </p>
                  <div className="row g-3">
                    <div className="col-sm-3">
                      <label className="form-label" style={{ fontSize: "13px", fontWeight: 600, color: "#374151" }}>
                        Price (VND) <span style={{ color: "#e9613f" }}>*</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="1000"
                        className={`form-control ${formErrors.price ? "is-invalid" : ""}`}
                        placeholder="25000"
                        value={formPrice}
                        onChange={(e) => setFormPrice(e.target.value)}
                        style={{ borderRadius: "8px", fontSize: "13.5px" }}
                      />
                      {formErrors.price && <div className="invalid-feedback d-block">{formErrors.price}</div>}
                    </div>

                    <div className="col-sm-3">
                      <label className="form-label" style={{ fontSize: "13px", fontWeight: 600, color: "#374151" }}>
                        Stock Qty <span style={{ color: "#e9613f" }}>*</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="10000"
                        className={`form-control ${formErrors.stock ? "is-invalid" : ""}`}
                        placeholder="100"
                        value={formStock}
                        onChange={(e) => setFormStock(e.target.value)}
                        style={{ borderRadius: "8px", fontSize: "13.5px" }}
                      />
                      {formErrors.stock && <div className="invalid-feedback d-block">{formErrors.stock}</div>}
                    </div>

                    {/* Weight (DB Column weight_kg) */}
                    <div className="col-sm-3">
                      <label className="form-label" style={{ fontSize: "13px", fontWeight: 600, color: "#374151" }}>
                        Weight (kg) <span style={{ color: "#e9613f" }}>*</span>
                      </label>
                      <input
                        type="number"
                        step="0.001"
                        min="0.001"
                        max="10"
                        className={`form-control ${formErrors.weight ? "is-invalid" : ""}`}
                        placeholder="0.1"
                        value={formWeight}
                        onChange={(e) => setFormWeight(e.target.value)}
                        style={{ borderRadius: "8px", fontSize: "13.5px" }}
                      />
                      {formErrors.weight && <div className="invalid-feedback d-block">{formErrors.weight}</div>}
                    </div>

                    <div className="col-sm-3">
                      <label className="form-label" style={{ fontSize: "13px", fontWeight: 600, color: "#374151" }}>
                        Status
                      </label>
                      <select
                        className="form-select"
                        value={formStatus}
                        onChange={(e) => setFormStatus(e.target.value)}
                        style={{ borderRadius: "8px", fontSize: "13.5px" }}
                      >
                        <option value="ACTIVE">🟢 Active</option>
                        <option value="INACTIVE">⚫ Inactive</option>
                      </select>
                    </div>
                  </div>
                </div>

                <hr style={{ borderColor: "#f0f2f5", margin: "16px 0" }} />

                {/* Section: Image Upload (Choose from machine) */}
                <div>
                  <p style={{ fontSize: "11px", fontWeight: 700, color: "#a0aec0", textTransform: "uppercase", letterSpacing: "0.7px", margin: "0 0 12px" }}>
                    Product Image &amp; Description
                  </p>
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label" style={{ fontSize: "13px", fontWeight: 600, color: "#374151" }}>
                        Hình ảnh sản phẩm (Chọn file tải lên từ máy tính)
                      </label>

                      {/* Hidden File Input */}
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handleFileSelect}
                        style={{ display: "none" }}
                      />

                      {!(imagePreview || formImageUrl) ? (
                        /* Empty state: large clickable dropzone with cloud-arrow-up icon */
                        <div
                          onClick={() => !isUploadingImage && fileInputRef.current?.click()}
                          style={{
                            border: "2px dashed #cbd5e1",
                            borderRadius: "14px",
                            padding: "36px 20px",
                            backgroundColor: "#f8fafc",
                            textAlign: "center",
                            cursor: isUploadingImage ? "not-allowed" : "pointer",
                            transition: "all 0.2s ease",
                          }}
                          onMouseEnter={(e) => {
                            if (!isUploadingImage) {
                              e.currentTarget.style.borderColor = "#e9613f";
                              e.currentTarget.style.backgroundColor = "rgba(233,97,63,0.02)";
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isUploadingImage) {
                              e.currentTarget.style.borderColor = "#cbd5e1";
                              e.currentTarget.style.backgroundColor = "#f8fafc";
                            }
                          }}
                        >
                          <div
                            style={{
                              width: "60px",
                              height: "60px",
                              borderRadius: "50%",
                              backgroundColor: "rgba(233, 97, 63, 0.1)",
                              color: "#e9613f",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              marginBottom: "12px",
                            }}
                          >
                            <i className="fa-solid fa-cloud-arrow-up fs-24"></i>
                          </div>
                          <div className="fw-700 fs-14 text-dark mb-1">
                            Nhấp vào đây để tải hình ảnh từ máy tính
                          </div>
                          <div className="text-muted fs-12 mb-3">
                            Hỗ trợ định dạng: PNG, JPG, JPEG, WEBP, GIF (Dung lượng tối đa 5MB)
                          </div>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary rounded-pill px-3 py-1 fw-600"
                            disabled={isUploadingImage}
                          >
                            {isUploadingImage ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" />
                                Đang tải lên...
                              </>
                            ) : (
                              <>
                                <i className="fa-solid fa-folder-open me-1"></i>
                                Duyệt tệp từ thiết bị
                              </>
                            )}
                          </button>
                        </div>
                      ) : (
                        /* Uploaded / Selected image preview */
                        <div
                          style={{
                            border: "1px solid #e2e8f0",
                            borderRadius: "14px",
                            padding: "16px 20px",
                            backgroundColor: "#fff",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: "16px",
                            flexWrap: "wrap",
                          }}
                        >
                          <div className="d-flex align-items-center gap-3">
                            <img
                              src={imagePreview || formImageUrl}
                              alt="Product Preview"
                              style={{
                                width: "70px",
                                height: "70px",
                                borderRadius: "10px",
                                objectFit: "cover",
                                border: "1px solid #edf2f7",
                                backgroundColor: "#f8f9fa",
                              }}
                              onError={(e) => {
                                e.target.style.display = "none";
                              }}
                            />
                            <div>
                              <div className="d-flex align-items-center gap-2">
                                <span className="badge bg-success-subtle text-success fs-11 fw-600">
                                  <i className="fa-solid fa-circle-check me-1"></i>
                                  Ảnh đã được tải lên
                                </span>
                              </div>
                              <div
                                className="fs-12 text-truncate text-secondary mt-1"
                                style={{ maxWidth: "320px", fontFamily: "monospace" }}
                              >
                                {formImageUrl || "Hình ảnh đã chọn"}
                              </div>
                              <span className="text-muted fs-11">
                                Nhấp vào "Đổi ảnh khác" nếu muốn thay đổi
                              </span>
                            </div>
                          </div>

                          <div className="d-flex align-items-center gap-2">
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-secondary rounded-3 px-3 py-2 fw-600"
                              onClick={() => fileInputRef.current?.click()}
                              disabled={isUploadingImage || actionLoading}
                            >
                              {isUploadingImage ? (
                                <>
                                  <span className="spinner-border spinner-border-sm me-2" role="status" />
                                  Đang tải lên...
                                </>
                              ) : (
                                <>
                                  <i className="fa-solid fa-arrow-rotate-right me-1"></i>
                                  Đổi ảnh khác
                                </>
                              )}
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-light border text-danger rounded-3 p-2"
                              title="Xoá ảnh"
                              onClick={() => {
                                setFormImageUrl("");
                                setImagePreview("");
                                if (fileInputRef.current) fileInputRef.current.value = "";
                              }}
                            >
                              <i className="fa-regular fa-trash-can"></i>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="col-12">
                      <label className="form-label" style={{ fontSize: "13px", fontWeight: 600, color: "#374151" }}>
                        Description
                      </label>
                      <textarea
                        className="form-control"
                        rows="3"
                        placeholder="Mô tả chi tiết về sản phẩm..."
                        value={formDescription}
                        onChange={(e) => setFormDescription(e.target.value)}
                        style={{ borderRadius: "8px", fontSize: "13.5px", resize: "vertical" }}
                      />
                    </div>
                  </div>
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
                  flexShrink: 0,
                  backgroundColor: "#fafbfc",
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setIsEditModalOpen(false);
                  }}
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
                  disabled={actionLoading || isUploadingImage}
                  className="admin-btn-primary"
                  style={{
                    padding: "9px 24px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  {actionLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm" />
                      Saving...
                    </>
                  ) : isAddModalOpen ? (
                    <>
                      <i className="fa-solid fa-plus" />
                      Create Product
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-floppy-disk" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* PRODUCT DETAILS MODAL                                     */}
      {/* ======================================================== */}
      {isDetailModalOpen && selectedProductDetail && (
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
              maxWidth: "620px",
              maxHeight: "90vh",
              backgroundColor: "#ffffff",
              borderRadius: "20px",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
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
                  <i className="fa-regular fa-eye fs-18"></i>
                </div>
                <div>
                  <h5 className="mb-0 fw-700 text-dark fs-16">Product Details</h5>
                  <span className="text-muted fs-12">
                    ID: #{selectedProductDetail.productId || selectedProductDetail.id}
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

            {/* Scrollable Body */}
            <div style={{ padding: "24px", overflowY: "auto", flex: 1, backgroundColor: "#ffffff" }}>
              {/* Product Hero Info */}
              <div
                className="d-flex align-items-center gap-3 p-3 rounded-3 mb-4"
                style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}
              >
                <img
                  src={getProductImage(selectedProductDetail)}
                  alt={selectedProductDetail.name}
                  style={{
                    width: "72px",
                    height: "72px",
                    borderRadius: "12px",
                    objectFit: "cover",
                    border: "1px solid #cbd5e1",
                    backgroundColor: "#ffffff",
                  }}
                  onError={(e) => {
                    e.target.src = "/assets/media/products/product-1.png";
                  }}
                />
                <div className="flex-grow-1">
                  <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
                    <span
                      className={`admin-badge ${selectedProductDetail.status === "ACTIVE"
                          ? "user-status-active"
                          : "user-status-blocked"
                        }`}
                    >
                      {selectedProductDetail.status || "ACTIVE"}
                    </span>
                    <span className="badge bg-light text-dark border fs-12">
                      {selectedProductDetail.category?.name || "General Category"}
                    </span>
                    <span className="badge bg-light text-secondary border fs-12">
                      {selectedProductDetail.brand?.name || "No Brand"}
                    </span>
                  </div>
                  <h6 className="fw-700 text-dark mb-1 fs-15">{selectedProductDetail.name}</h6>
                  <div className="fw-700 color-primary fs-16">
                    {formatVND(selectedProductDetail.price)}
                  </div>
                </div>
              </div>

              {/* Grid Information */}
              <div className="row g-3 fs-13 mb-3">
                <div className="col-sm-6">
                  <div className="p-3 rounded-3 border bg-white h-100">
                    <span className="text-muted d-block fs-11 text-uppercase fw-600 mb-1">
                      <i className="fa-solid fa-barcode me-1 text-primary"></i> Mã SKU
                    </span>
                    <code className="fw-700 fs-13 text-dark">
                      {selectedProductDetail.sku || "Chưa có SKU"}
                    </code>
                  </div>
                </div>

                <div className="col-sm-6">
                  <div className="p-3 rounded-3 border bg-white h-100">
                    <span className="text-muted d-block fs-11 text-uppercase fw-600 mb-1">
                      <i className="fa-solid fa-boxes-stacked me-1 text-primary"></i> Tồn kho (Stock)
                    </span>
                    <span className="fw-700 fs-14 text-dark">
                      {selectedProductDetail.stockQuantity ?? selectedProductDetail.stock ?? 0} pcs
                    </span>
                    {(selectedProductDetail.stockQuantity ?? selectedProductDetail.stock ?? 0) === 0 ? (
                      <span className="badge bg-danger ms-2">Hết hàng</span>
                    ) : (selectedProductDetail.stockQuantity ?? selectedProductDetail.stock ?? 0) < 10 ? (
                      <span className="badge bg-warning text-dark ms-2">Sắp hết</span>
                    ) : (
                      <span className="badge bg-success ms-2">Còn hàng</span>
                    )}
                  </div>
                </div>

                <div className="col-sm-6">
                  <div className="p-3 rounded-3 border bg-white h-100">
                    <span className="text-muted d-block fs-11 text-uppercase fw-600 mb-1">
                      <i className="fa-solid fa-weight-hanging me-1 text-primary"></i> Trọng lượng (Weight)
                    </span>
                    <span className="fw-700 fs-13 text-dark">
                      {selectedProductDetail.weightKg || selectedProductDetail.weight || "0.100"} kg
                    </span>
                  </div>
                </div>

                <div className="col-sm-6">
                  <div className="p-3 rounded-3 border bg-white h-100">
                    <span className="text-muted d-block fs-11 text-uppercase fw-600 mb-1">
                      <i className="fa-solid fa-clock me-1 text-primary"></i> Ngày cập nhật
                    </span>
                    <span className="fw-600 fs-13 text-dark">
                      {selectedProductDetail.updatedAt
                        ? new Date(selectedProductDetail.updatedAt).toLocaleString("vi-VN")
                        : selectedProductDetail.createdAt
                          ? new Date(selectedProductDetail.createdAt).toLocaleString("vi-VN")
                          : "—"}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <div className="col-12">
                  <div className="p-3 rounded-3 border bg-white">
                    <span className="text-muted d-block fs-11 text-uppercase fw-600 mb-1">
                      <i className="fa-solid fa-align-left me-1 text-primary"></i> Mô tả sản phẩm
                    </span>
                    <p className="mb-0 text-dark fs-13" style={{ whiteSpace: "pre-line", lineHeight: 1.6 }}>
                      {selectedProductDetail.description || "Chưa có mô tả chi tiết cho sản phẩm này."}
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
                Đóng
              </button>
              <button
                type="button"
                className="admin-btn-primary px-4 rounded-pill"
                onClick={() => {
                  const prod = selectedProductDetail;
                  setIsDetailModalOpen(false);
                  openEditModal(prod);
                }}
              >
                <i className="fa-regular fa-pen-to-square me-1"></i> Chỉnh sửa sản phẩm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* QUICK UPDATE STOCK MODAL                                 */}
      {/* ======================================================== */}
      {isStockModalOpen && (
        <div
          className="modal fade show d-block"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1055,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
          tabIndex="-1"
        >
          {/* Backdrop */}
          <div
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(15, 23, 42, 0.65)",
              backdropFilter: "blur(4px)",
            }}
            onClick={() => !actionLoading && setIsStockModalOpen(false)}
          />

          <div
            className="shadow-lg border-0 rounded-4"
            style={{
              position: "relative",
              width: "100%",
              maxWidth: "440px",
              backgroundColor: "#ffffff",
              borderRadius: "20px",
              overflow: "hidden",
              zIndex: 1,
            }}
          >
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
              <div>
                <h5 className="modal-title fw-700 medium-black mb-1 fs-16">Quick Stock Adjustment</h5>
                <p className="text-muted fs-12 mb-0 text-truncate" style={{ maxWidth: "300px" }}>
                  {productToEdit?.name}
                </p>
              </div>
              <button
                type="button"
                className="btn-close"
                onClick={() => setIsStockModalOpen(false)}
                disabled={actionLoading}
              ></button>
            </div>

            <form noValidate onSubmit={handleSaveStock}>
              <div className="p-4" style={{ backgroundColor: "#ffffff" }}>
                <div className="d-flex align-items-center gap-3 mb-3 p-3 bg-light rounded-3 border">
                  <img
                    src={getProductImage(productToEdit)}
                    alt={productToEdit?.name}
                    className="rounded-3 border"
                    style={{ width: "48px", height: "48px", objectFit: "cover", backgroundColor: "#fff" }}
                  />
                  <div>
                    <div className="fw-600 fs-13 text-dark">{productToEdit?.name}</div>
                    <span className="fs-12 text-muted">SKU: {productToEdit?.sku || "—"}</span>
                  </div>
                </div>

                <label className="form-label fs-13 fw-600 text-dark">
                  New Stock Quantity (pcs)
                </label>
                <input
                  type="number"
                  min="0"
                  className="form-control form-control-lg text-center fw-700 fs-20"
                  value={stockToUpdate}
                  onChange={(e) => setStockToUpdate(e.target.value)}
                  required
                  style={{ borderRadius: "10px", borderColor: "#cbd5e1" }}
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
                  onClick={() => setIsStockModalOpen(false)}
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-btn-primary px-4 rounded-pill"
                  disabled={actionLoading}
                >
                  {actionLoading ? "Updating..." : "Save Stock"}
                </button>
              </div>
            </form>
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
