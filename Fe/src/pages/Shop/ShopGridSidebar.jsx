// Migrated from: shop-grid-sidebar.html, lines 203-2241; assets/js/app.js lines 322-352
// HTML->JSX conversion: class -> className, for -> htmlFor, img / input self-closing, accordion states, mobile filter drawer state, i18n support
// API integration: replaced mock data with real /api/products, /api/categories/public, /api/brands/public calls
import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import TitleBanner from "../../components/shared/TitleBanner";
import PriceSlider from "../../components/ui/PriceSlider";
import CustomDropdown from "../../components/ui/CustomDropdown";
import { useCartContext } from "../../providers/CartContext";
import { getProducts, getCategories, getBrands, getProductImage } from "../../services/productService";

const SORT_OPTIONS = [
  { label: "Mặc định", value: "" },
  { label: "Giá: Thấp → Cao", value: "price,asc" },
  { label: "Giá: Cao → Thấp", value: "price,desc" },
  { label: "Tên A → Z", value: "name,asc" },
  { label: "Tên Z → A", value: "name,desc" },
];

const PAGE_SIZE = 9;

const formatCurrency = (amount) => {
  if (amount == null) return "";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

export const ShopGridSidebar = () => {
  const { openCart, openQuickView, openCompare, addCompareProduct } = useCartContext();
  const [wishlist, setWishlist] = useState([]);
  const { t } = useTranslation();

  // ── Sidebar accordion state ──────────────────────────────────────────────
  const [openCategories, setOpenCategories] = useState({
    availability: true,
    price: true,
    categories: true,
    brands: true,
    tags: true,
  });
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const toggleCategory = (key) => {
    setOpenCategories((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // ── Filter / Pagination state ────────────────────────────────────────────
  const [keyword, setKeyword] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [selectedBrandId, setSelectedBrandId] = useState(null);
  const [stockFilter, setStockFilter] = useState(null);
  const [minPrice, setMinPrice] = useState(null);
  const [maxPrice, setMaxPrice] = useState(null);
  const [sortValue, setSortValue] = useState("");
  const [currentPage, setCurrentPage] = useState(0);

  // ── Data state ───────────────────────────────────────────────────────────
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  // ── Loading / Error state ────────────────────────────────────────────────
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sidebarLoading, setSidebarLoading] = useState(true);

  // ── Fetch sidebar data (categories + brands) once ────────────────────────
  useEffect(() => {
    const fetchSidebarData = async () => {
      try {
        setSidebarLoading(true);
        const [catRes, brandRes] = await Promise.all([
          getCategories(),
          getBrands(),
        ]);
        const rawCats = catRes.data?.data ?? catRes.data ?? [];
        const rawBrands = brandRes.data?.data ?? brandRes.data ?? [];
        setCategories(
          rawCats.map((c) => ({
            ...c,
            id: c.categoryId ?? c.id,
          }))
        );
        setBrands(
          rawBrands.map((b) => ({
            ...b,
            id: b.brandId ?? b.id,
          }))
        );
      } catch (err) {
        console.warn("Could not load categories/brands:", err);
      } finally {
        setSidebarLoading(false);
      }
    };
    fetchSidebarData();
  }, []);

  // ── Fetch products whenever filters / page change ────────────────────────
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getProducts({
        page: currentPage,
        size: PAGE_SIZE,
        keyword: keyword || undefined,
        categoryId: selectedCategoryId || undefined,
        brandId: selectedBrandId || undefined,
        minPrice: minPrice !== null ? minPrice : undefined,
        maxPrice: maxPrice !== null ? maxPrice : undefined,
        sort: sortValue || undefined,
      });

      const data = res.data;
      // Spring Page response shape: { content, totalPages, totalElements, ... }
      if (data && Array.isArray(data.content)) {
        setProducts(data.content);
        setTotalPages(data.totalPages ?? 1);
        setTotalElements(data.totalElements ?? data.content.length);
      } else if (Array.isArray(data)) {
        setProducts(data);
        setTotalPages(1);
        setTotalElements(data.length);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error("Failed to fetch products:", err);
      setError("Không thể tải danh sách sản phẩm. Vui lòng thử lại.");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, keyword, selectedCategoryId, selectedBrandId, minPrice, maxPrice, sortValue]);

  // ── Apply client-side stock filter after fetch ────────────────────────────
  useEffect(() => {
    if (!stockFilter) {
      setFilteredProducts(products);
    } else if (stockFilter === "inStock") {
      setFilteredProducts(products.filter((p) => (p.stockQuantity ?? p.stock_quantity ?? 0) > 0));
    } else if (stockFilter === "outStock") {
      setFilteredProducts(products.filter((p) => (p.stockQuantity ?? p.stock_quantity ?? 0) <= 0));
    }
  }, [products, stockFilter]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(0);
    setKeyword(searchInput.trim());
  };

  const handleCategoryChange = (id) => {
    setSelectedCategoryId((prev) => (prev === id ? null : id));
    setCurrentPage(0);
  };

  const handleBrandChange = (id) => {
    setSelectedBrandId((prev) => (prev === id ? null : id));
    setCurrentPage(0);
  };

  const handleSortSelect = (label) => {
    const found = SORT_OPTIONS.find((o) => o.label === label);
    setSortValue(found ? found.value : "");
    setCurrentPage(0);
  };

  const handlePageChange = (page) => {
    if (page >= 0 && page < totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // ── Sidebar content (shared between desktop & mobile) ────────────────────
  const renderSidebarContent = (prefix = "desktop") => (
    <div className="sidebar">
      {/* Search Bar */}
      <form
        className="search-bar-container mb-24"
        onSubmit={handleSearchSubmit}
      >
        <div className="search-input-block">
          <input
            type="text"
            name="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={t("header.searchPlaceholder", "Search Here...")}
          />
        </div>
        <button type="submit" aria-label="Search">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M9.74062 0C15.1116 0 19.4812 4.36964 19.4812 9.74063C19.4812 12.1734 18.5847 14.4008 17.1047 16.1097L23.7941 22.7997C24.0687 23.0743 24.0686 23.5195 23.794 23.7941C23.5194 24.0687 23.0743 24.0686 22.7997 23.7941L16.1104 17.1041C14.4014 18.5845 12.1738 19.4813 9.74062 19.4813C4.36964 19.4813 0 15.1116 0 9.74063C0 4.36964 4.36964 0 9.74062 0ZM9.74062 18.075C14.3362 18.075 18.075 14.3362 18.075 9.74063C18.075 5.14505 14.3362 1.40625 9.74062 1.40625C5.14505 1.40625 1.40625 5.14505 1.40625 9.74063C1.40625 14.3362 5.14505 18.075 9.74062 18.075Z"
              fill="white"
            />
          </svg>
        </button>
      </form>

      {/* Availability Filter */}
      <div
        className="category-block box-2 mb-32 wow fadeInUp animated"
        data-wow-delay="200ms"
      >
        <div className="title" onClick={() => toggleCategory("availability")}>
          <h6 className="fw-600 font-sec medium-black">
            {t("shop.availability", "Availablity")}
          </h6>
          <span>
            <i
              className={`fa-light ${openCategories.availability ? "fa-chevron-up" : "fa-chevron-down"}`}
            ></i>
          </span>
        </div>
        {openCategories.availability && (
          <div className="content-block mt-24">
            <div className="d-flex align-items-center justify-content-between mb-12">
              <div className="cus-checkBox">
                <input
                  type="checkbox"
                  id={`${prefix}-inStock`}
                  className="inp-cbx"
                  checked={stockFilter === "inStock"}
                  onChange={() => setStockFilter(stockFilter === "inStock" ? null : "inStock")}
                />
                <label htmlFor={`${prefix}-inStock`} className="cbx">
                  {t("common.inStock", "Còn hàng")}
                </label>
              </div>
            </div>
            <div className="d-flex align-items-center justify-content-between mb-12">
              <div className="cus-checkBox">
                <input
                  type="checkbox"
                  id={`${prefix}-outStock`}
                  className="inp-cbx"
                  checked={stockFilter === "outStock"}
                  onChange={() => setStockFilter(stockFilter === "outStock" ? null : "outStock")}
                />
                <label htmlFor={`${prefix}-outStock`} className="cbx">
                  {t("common.outOfStock", "Hết hàng")}
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="hr-line line-2 mb-24"></div>

      {/* Price Filter */}
      <div
        className="category-block box-5 wow fadeInUp animated mb-32 animated"
        data-wow-delay="200ms"
      >
        <div className="title mb-24" onClick={() => toggleCategory("price")}>
          <h6 className="fw-600 font-sec medium-black">
            {t("shop.filterByPrice", "Filter By Price")}
          </h6>
          <span>
            <i
              className={`fa-light ${openCategories.price ? "fa-chevron-up" : "fa-chevron-down"}`}
            ></i>
          </span>
        </div>
        {openCategories.price && (
          <div className="content-block">
            <PriceSlider
              initialMin={0}
              initialMax={150000}
              maxLimit={150000}
              step={5000}
              isFiltered={minPrice !== null || maxPrice !== null}
              onApplyPrice={(min, max) => {
                setMinPrice(min);
                setMaxPrice(max);
                setCurrentPage(0);
              }}
              onResetPrice={() => {
                setMinPrice(null);
                setMaxPrice(null);
                setCurrentPage(0);
              }}
            />
          </div>
        )}
      </div>
      <div className="hr-line line-2 mb-24"></div>

      {/* Category Filter */}
      <div
        className="category-block box-1 mb-32 wow fadeInUp animated"
        data-wow-delay="300ms"
      >
        <div className="title" onClick={() => toggleCategory("categories")}>
          <h6 className="fw-600 font-sec medium-black">
            {t("shop.productCategories", "Danh mục")}
          </h6>
          <span>
            <i
              className={`fa-light ${openCategories.categories ? "fa-chevron-up" : "fa-chevron-down"}`}
            ></i>
          </span>
        </div>
        {openCategories.categories && (
          <div className="content-block mt-24">
            {sidebarLoading ? (
              <p className="dark-gray" style={{ fontSize: "13px" }}>Đang tải...</p>
            ) : categories.length === 0 ? (
              <p className="dark-gray" style={{ fontSize: "13px" }}>Không có danh mục</p>
            ) : (
              categories.map((cat) => (
                <div
                  key={cat.id}
                  className="d-flex align-items-center justify-content-between mb-12"
                >
                  <div className="cus-checkBox">
                    <input
                      type="checkbox"
                      id={`${prefix}-cat-${cat.id}`}
                      className="inp-cbx"
                      checked={selectedCategoryId === cat.id}
                      onChange={() => handleCategoryChange(cat.id)}
                    />
                    <label htmlFor={`${prefix}-cat-${cat.id}`} className="cbx">
                      {cat.name}
                    </label>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
      <div className="hr-line line-2 mb-24"></div>

      {/* Brand Filter */}
      <div
        className="category-block box-1 mb-32 wow fadeInUp animated"
        data-wow-delay="350ms"
      >
        <div className="title" onClick={() => toggleCategory("brands")}>
          <h6 className="fw-600 font-sec medium-black">
            Thương hiệu
          </h6>
          <span>
            <i
              className={`fa-light ${openCategories.brands ? "fa-chevron-up" : "fa-chevron-down"}`}
            ></i>
          </span>
        </div>
        {openCategories.brands && (
          <div className="content-block mt-24">
            {sidebarLoading ? (
              <p className="dark-gray" style={{ fontSize: "13px" }}>Đang tải...</p>
            ) : brands.length === 0 ? (
              <p className="dark-gray" style={{ fontSize: "13px" }}>Không có thương hiệu</p>
            ) : (
              brands.map((brand) => (
                <div
                  key={brand.id}
                  className="d-flex align-items-center justify-content-between mb-12"
                >
                  <div className="cus-checkBox">
                    <input
                      type="checkbox"
                      id={`${prefix}-brand-${brand.id}`}
                      className="inp-cbx"
                      checked={selectedBrandId === brand.id}
                      onChange={() => handleBrandChange(brand.id)}
                    />
                    <label htmlFor={`${prefix}-brand-${brand.id}`} className="cbx">
                      {brand.name}
                    </label>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
      <div className="hr-line line-2 mb-24"></div>

      {/* Tags Filter */}
      <div
        className="category-block box-4 mb-24 wow fadeInUp animated"
        data-wow-delay="400ms"
      >
        <div className="title mb-24" onClick={() => toggleCategory("tags")}>
          <h6 className="fw-600 font-sec medium-black">
            {t("shop.popularTags", "Tags")}
          </h6>
          <span>
            <i
              className={`fa-light ${openCategories.tags ? "fa-chevron-up" : "fa-chevron-down"}`}
            ></i>
          </span>
        </div>
        {openCategories.tags && (
          <div className="content-block mt-24">
            <div className="tags-wrapper d-flex flex-wrap gap-8">
              {["Pen", "Notebook", "Paper", "Highlighter", "Puncher", "Deli", "Thien Long"].map((tag) => {
                const isTagActive = keyword.toLowerCase() === tag.toLowerCase();
                return (
                  <button
                    key={tag}
                    type="button"
                    className={`tag ${isTagActive ? "active" : ""}`}
                    onClick={() => {
                      if (isTagActive) {
                        setKeyword("");
                        setSearchInput("");
                      } else {
                        setKeyword(tag);
                        setSearchInput(tag);
                      }
                      setCurrentPage(0);
                    }}
                    style={{
                      padding: "6px 14px",
                      borderRadius: "20px",
                      border: isTagActive ? "1px solid var(--color-primary, #e57c32)" : "1px solid #e5e7eb",
                      backgroundColor: isTagActive ? "var(--color-primary, #e57c32)" : "#f9fafb",
                      color: isTagActive ? "#ffffff" : "#4b5563",
                      fontSize: "12px",
                      fontWeight: "600",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Sidebar Promotional Image */}
      <div
        className="sidebar-promotional-image w-100 object-fit-cover br-12 wow fadeInUp animated"
        data-wow-delay="500ms"
      >
        <img
          src="/assets/media/images/sidebar-image.png"
          alt=""
          className="w-100 object-fit-cover br-12"
        />
      </div>
    </div>
  );

  // ── Pagination renderer ──────────────────────────────────────────────────
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisible = 5;
    let start = Math.max(0, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages - 1, start + maxVisible - 1);
    if (end - start < maxVisible - 1) {
      start = Math.max(0, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return (
      <div className="pagination-wrapper mb-32">
        <ul className="pagination justify-content-center">
          <li className={`page-item ${currentPage === 0 ? "disabled" : ""}`}>
            <a
              className="page-link"
              href="#prev"
              onClick={(e) => {
                e.preventDefault();
                handlePageChange(currentPage - 1);
              }}
            >
              Prev
            </a>
          </li>
          {pages.map((p) => (
            <li key={p} className={`page-item ${p === currentPage ? "active" : ""}`}>
              <a
                className="page-link"
                href={`#page${p + 1}`}
                onClick={(e) => {
                  e.preventDefault();
                  handlePageChange(p);
                }}
              >
                {p + 1}
              </a>
            </li>
          ))}
          <li className={`page-item ${currentPage >= totalPages - 1 ? "disabled" : ""}`}>
            <a
              className="page-link"
              href="#next"
              onClick={(e) => {
                e.preventDefault();
                handlePageChange(currentPage + 1);
              }}
            >
              Next
            </a>
          </li>
        </ul>
      </div>
    );
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <TitleBanner title={t("shop.title")} />

      <section className="shop-section py-80">
        <div className="container-2">
          <div className="row">
            {/* Desktop Sidebar */}
            <div className="col-lg-3 d-lg-block d-none">
              {renderSidebarContent("desktop")}
            </div>

            {/* Products Main Column */}
            <div className="col-lg-9">
              <div className="row row-gap-3 align-items-center justify-content-between mb-24">
                <div className="col-xl-4 col-lg-5 col-md-7 col-6">
                  <p className="d-md-block d-none">
                    {loading
                      ? "Đang tải..."
                      : `Hiển thị ${products.length} / ${totalElements} sản phẩm`}
                  </p>
                  <button
                    type="button"
                    className="cus-btn filter-btn d-lg-none"
                    onClick={() => setIsMobileFilterOpen(true)}
                  >
                    <span>{t("shop.filter")}</span>
                  </button>
                </div>
                <div className="col-xl-4 col-lg-4 col-md-5 col-6">
                  <div className="d-flex align-items-center justify-content-end gap-8">
                    <p className="dark-gray">{t("shop.sortBy", "Sắp xếp")}:</p>
                    <div className="drop-container">
                      <CustomDropdown
                        options={SORT_OPTIONS.map((o) => o.label)}
                        defaultValue={SORT_OPTIONS[0].label}
                        onSelect={handleSortSelect}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Product Grid */}
              {loading ? (
                <div className="text-center py-80">
                  <div
                    className="spinner-border"
                    role="status"
                    style={{ color: "var(--color-primary, #e57c32)", width: "3rem", height: "3rem" }}
                  >
                    <span className="visually-hidden">Đang tải...</span>
                  </div>
                  <p className="mt-16 dark-gray">Đang tải sản phẩm...</p>
                </div>
              ) : error ? (
                <div className="text-center py-80">
                  <p style={{ color: "red" }}>{error}</p>
                  <button
                    type="button"
                    onClick={fetchProducts}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "8px 20px",
                      backgroundColor: "#e57c32",
                      color: "#fff",
                      border: "none",
                      borderRadius: "24px",
                      fontWeight: "600",
                      fontSize: "13px",
                      cursor: "pointer",
                      marginTop: "16px",
                    }}
                  >
                    <span>Thử lại</span>
                  </button>
                </div>
              ) : products.length === 0 ? (
                <div
                  className="text-center py-60 px-24 my-32"
                  style={{
                    backgroundColor: "#fafafa",
                    borderRadius: "16px",
                    border: "1px dashed #d1d5db",
                  }}
                >
                  <div
                    style={{
                      width: "60px",
                      height: "60px",
                      borderRadius: "50%",
                      backgroundColor: "rgba(229, 124, 50, 0.12)",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: "16px",
                    }}
                  >
                    <svg
                      width="28"
                      height="28"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#e57c32"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="11" cy="11" r="8"></circle>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                      <line x1="8" y1="11" x2="14" y2="11"></line>
                    </svg>
                  </div>
                  <h5 className="fw-700 medium-black mb-8">Không tìm thấy sản phẩm phù hợp</h5>
                  <p className="dark-gray mb-24" style={{ maxWidth: "420px", margin: "0 auto 20px", fontSize: "14px" }}>
                    Rất tiếc, không có sản phẩm nào khớp với từ khóa tìm kiếm hoặc khoảng giá bạn đã chọn.
                  </p>
                  {(keyword || selectedCategoryId || selectedBrandId || minPrice !== null || maxPrice !== null || stockFilter !== null) && (
                    <button
                      type="button"
                      onClick={() => {
                        setKeyword("");
                        setSearchInput("");
                        setSelectedCategoryId(null);
                        setSelectedBrandId(null);
                        setStockFilter(null);
                        setMinPrice(null);
                        setMaxPrice(null);
                        setCurrentPage(0);
                      }}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "10px 24px",
                        backgroundColor: "#e57c32",
                        color: "#ffffff",
                        border: "none",
                        borderRadius: "30px",
                        fontWeight: "600",
                        fontSize: "14px",
                        cursor: "pointer",
                        boxShadow: "0 4px 12px rgba(229, 124, 50, 0.25)",
                        transition: "opacity 0.2s ease",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
                      onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                        <path d="M3 3v5h5"></path>
                      </svg>
                      <span>Xóa tất cả bộ lọc</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="row row-gap-4 mb-48">
                  {filteredProducts.map((prod) => {
                    const prodId = prod.id || prod.productId;
                    const isWishlisted = wishlist.includes(prodId);
                    const inStock = (prod.stockQuantity ?? prod.stock_quantity ?? 0) > 0;
                    return (
                      <div
                        key={prodId}
                        className="col-lg-4 col-md-6 col-sm-6 wow fadeInUp animated"
                        data-wow-delay="400ms"
                      >
                        <div className="latest-product-card">
                          <div className="image-box mb-16">
                            <Link to={`/product/${prodId}`} className="image">
                              <img
                                src={getProductImage(prod)}
                                className="product-image"
                                alt={prod.name}
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = "/assets/media/products/product-7.png";
                                }}
                              />
                            </Link>
                            {!inStock && (
                              <span
                                style={{
                                  position: "absolute",
                                  top: "10px",
                                  left: "10px",
                                  background: "#ef4444",
                                  color: "#fff",
                                  fontSize: "11px",
                                  fontWeight: 700,
                                  padding: "3px 8px",
                                  borderRadius: "6px",
                                  zIndex: 2,
                                }}
                              >
                                Hết hàng
                              </span>
                            )}
                            <div className="side-icons">
                              <ul className="list-unstyled">
                                {/* Wishlist */}
                                <li>
                                  <a
                                    href="#wishlist"
                                    title={isWishlisted ? "Xóa yêu thích" : "Thêm yêu thích"}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      setWishlist((prev) =>
                                        prev.includes(prodId)
                                          ? prev.filter((id) => id !== prodId)
                                          : [...prev, prodId]
                                      );
                                    }}
                                    style={{ color: isWishlisted ? "#e57c32" : undefined }}
                                  >
                                    <i className={isWishlisted ? "fa-solid fa-heart" : "fa-light fa-heart"} style={{ color: isWishlisted ? "#e57c32" : undefined }}></i>
                                  </a>
                                </li>
                                {/* Quick View */}
                                <li>
                                  <a
                                    href="#quickview"
                                    title="Xem nhanh"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      openQuickView(prod);
                                    }}
                                  >
                                    <i className="fa-regular fa-eye"></i>
                                  </a>
                                </li>
                                {/* Compare - bar chart icon */}
                                <li>
                                  <a
                                    href="#compare"
                                    title="So sánh sản phẩm"
                                    className="zui-wrapper-button"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      addCompareProduct(prod);
                                      openCompare(prod);
                                    }}
                                  >
                                    <svg
                                      width="17"
                                      height="17"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="#363636"
                                      strokeWidth="2.2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    >
                                      <line x1="18" y1="20" x2="18" y2="10" />
                                      <line x1="12" y1="20" x2="12" y2="4" />
                                      <line x1="6" y1="20" x2="6" y2="14" />
                                    </svg>
                                  </a>
                                </li>
                              </ul>
                            </div>
                            <Link
                              to="/cart.html"
                              className="cus-btn"
                              onClick={(e) => {
                                e.preventDefault();
                                openCart();
                              }}
                            >
                              <span className="btn-text">
                                {t("common.addCart")}
                              </span>
                              <span>{t("common.goToCart")}</span>
                            </Link>
                          </div>
                          <div className="product-desc">
                            <div>
                              <Link
                                to={`/product/${prodId}`}
                                className="product-title h6 fw-700 mb-8"
                              >
                                {prod.name}
                              </Link>
                              {prod.category && (
                                <p
                                  className="dark-gray mb-4"
                                  style={{ fontSize: "12px" }}
                                >
                                  {prod.category.name}
                                </p>
                              )}
                              <div className="d-flex align-items-center gap-8 justify-content-center mb-8">
                                <span className="color-primary">★★★★★</span>
                                <p className="fw-500">(02)</p>
                              </div>
                              <h5 className="medium-black fw-700">
                                {formatCurrency(prod.price)}
                              </h5>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Dynamic Pagination */}
              {!loading && !error && renderPagination()}
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Offcanvas Filter Sidebar */}
      <div
        className="toggle-sidebar"
        style={{
          position: "fixed",
          top: 0,
          left: isMobileFilterOpen ? "0" : "-800px",
          width: "320px",
          height: "100%",
          zIndex: 1050,
          backgroundColor: "#fff",
          overflowY: "auto",
          padding: "24px",
          transition: "left 0.3s ease",
        }}
      >
        <div className="d-flex justify-content-between align-items-center mb-24">
          <h5 className="fw-700 medium-black">{t("shop.filterTitle")}</h5>
          <button
            type="button"
            className="btn-close"
            onClick={() => setIsMobileFilterOpen(false)}
          ></button>
        </div>
        {renderSidebarContent("mobile")}
      </div>
      {isMobileFilterOpen && (
        <div
          className="modal-backdrop fade show"
          onClick={() => setIsMobileFilterOpen(false)}
          style={{ zIndex: 1040 }}
        ></div>
      )}
    </>
  );
};

export default ShopGridSidebar;
