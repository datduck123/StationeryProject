// Migrated from: shop-grid-sidebar.html, lines 203-2241; assets/js/app.js lines 322-352
// HTML->JSX conversion: class -> className, for -> htmlFor, img / input self-closing, accordion states, mobile filter drawer state, i18n support
// API integration: replaced mock data with real /api/products, /api/categories/public, /api/brands/public calls
import { useState, useEffect, useCallback, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import TitleBanner from "../../components/shared/TitleBanner";
import PriceSlider from "../../components/ui/PriceSlider";
import CustomDropdown from "../../components/ui/CustomDropdown";
import { useCartContext } from "../../providers/CartContext";
import { getProducts, getCategories, getBrands, getProductImage } from "../../services/productService";
import ProductRatingSold from "../../components/shared/ProductRatingSold";
import { onProductChange } from "../../utils/syncEvents";

const SORT_OPTIONS = [
  { label: "Mặc định", value: "" },
  { label: "Bán chạy nhất", value: "sold,desc" },
  { label: "Giá: Thấp → Cao", value: "price,asc" },
  { label: "Giá: Cao → Thấp", value: "price,desc" },
  { label: "Tên A → Z", value: "name,asc" },
  { label: "Tên Z → A", value: "name,desc" },
];

const PAGE_SIZE = 12;

const SidebarSectionHeader = ({ title, isOpen, onToggle, activeCount = null }) => (
  <div className="shop-sidebar-header" onClick={onToggle}>
    <h6 className="shop-sidebar-title">
      <span>{title}</span>
      {activeCount !== null && activeCount > 0 && (
        <span className="shop-active-filter-badge">{activeCount}</span>
      )}
    </h6>
    <span className={`shop-sidebar-toggle-btn ${isOpen ? "is-open" : ""}`} aria-label="Toggle section">
      <svg
        width="13"
        height="13"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`shop-sidebar-chevron ${isOpen ? "is-open" : ""}`}
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </span>
  </div>
);

export const ShopGridSidebar = () => {
  const {
    openCart,
    openQuickView,
    openCompare,
    addToCart,
    addCompareProduct,
    toggleWishlist,
    isInWishlist,
  } = useCartContext();
  const { t, i18n } = useTranslation();

  const sortOptions = [
    { label: t("shop.defaultSorting", "Default"), value: "" },
    { label: t("shop.priceLowHigh", "Price: Low to High"), value: "price,asc" },
    { label: t("shop.priceHighLow", "Price: High to Low"), value: "price,desc" },
    { label: t("shop.sortNameAsc", "Name: A → Z"), value: "name,asc" },
    { label: t("shop.sortNameDesc", "Name: Z → A"), value: "name,desc" },
  ];

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
  const [searchParams, setSearchParams] = useSearchParams();
  const urlKeyword = searchParams.get("keyword") || searchParams.get("search") || "";
  const urlBrandId = searchParams.get("brandId") || searchParams.get("brand") || null;
  const urlCategoryId = searchParams.get("categoryId") || searchParams.get("category") || null;

  const [keyword, setKeyword] = useState(urlKeyword);

  const [selectedCategoryId, setSelectedCategoryId] = useState(urlCategoryId ? Number(urlCategoryId) : null);
  const [selectedBrandId, setSelectedBrandId] = useState(urlBrandId ? Number(urlBrandId) : null);
  const [stockFilter, setStockFilter] = useState(null);
  const [minPrice, setMinPrice] = useState(null);
  const [maxPrice, setMaxPrice] = useState(null);
  const [sortValue, setSortValue] = useState("");
  const [currentPage, setCurrentPage] = useState(0);

  // Sync filter state khi URL params thay đổi (ví dụ click brand từ trang Home)
  useEffect(() => {
    const q = searchParams.get("keyword") || searchParams.get("search") || "";
    const bId = searchParams.get("brandId") || searchParams.get("brand") || null;
    const cId = searchParams.get("categoryId") || searchParams.get("category") || null;
    const parsedBrandId = bId ? Number(bId) : null;
    const parsedCategoryId = cId ? Number(cId) : null;

    setKeyword((prev) => (prev !== q ? q : prev));
    setSelectedBrandId((prev) => (prev !== parsedBrandId ? parsedBrandId : prev));
    setSelectedCategoryId((prev) => (prev !== parsedCategoryId ? parsedCategoryId : prev));
  }, [searchParams]);

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

  // ── Fetch sidebar data (categories + brands) ─────────────────────────────
  const fetchSidebarData = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchSidebarData();
  }, [fetchSidebarData]);

  // ── Fetch products whenever filters / page change ────────────────────────
  const fetchReqIdRef = useRef(0);

  const fetchProducts = useCallback(async () => {
    const reqId = ++fetchReqIdRef.current;
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

      if (reqId !== fetchReqIdRef.current) return;

      const data = res.data;
      // Spring Page response shape: { content, totalPages, totalElements, ... }
      if (data && Array.isArray(data.content)) {
        const newTotalPages = data.totalPages ?? 1;
        setTotalPages(newTotalPages);
        setTotalElements(data.totalElements ?? data.content.length);

        // Nếu trang hiện tại rỗng do sản phẩm vừa bị chuyển sang INACTIVE/xoá, tự động nhảy về trang trước
        if (data.content.length === 0 && currentPage > 0 && currentPage >= newTotalPages) {
          setCurrentPage(Math.max(0, newTotalPages - 1));
          return;
        }

        setProducts(data.content);
      } else if (Array.isArray(data)) {
        setProducts(data);
        setTotalPages(1);
        setTotalElements(data.length);
      } else {
        setProducts([]);
      }
    } catch (err) {
      if (reqId !== fetchReqIdRef.current) return;
      console.error("Failed to fetch products:", err);
      setError(t("commerce.productLoadError", "Could not load products."));
      setProducts([]);
    } finally {
      if (reqId === fetchReqIdRef.current) {
        setLoading(false);
      }
    }
  }, [currentPage, keyword, selectedCategoryId, selectedBrandId, minPrice, maxPrice, sortValue, t]);

  // ── Auto-adjust page if current page exceeds total pages ─────────────────
  useEffect(() => {
    if (currentPage >= totalPages && totalPages > 0) {
      setCurrentPage(Math.max(0, totalPages - 1));
    }
  }, [totalPages, currentPage]);

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

  // ── Real-time synchronization with Admin changes (cross-tab & in-tab) ─────
  useEffect(() => {
    const unsubscribe = onProductChange(() => {
      fetchProducts();
      fetchSidebarData();
    });
    return unsubscribe;
  }, [fetchProducts, fetchSidebarData]);

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleCategoryChange = (id) => {
    const nextId = selectedCategoryId === id ? null : id;
    setSelectedCategoryId(nextId);
    setCurrentPage(0);

    const nextParams = new URLSearchParams(searchParams);
    if (nextId) {
      nextParams.set("categoryId", String(nextId));
    } else {
      nextParams.delete("categoryId");
      nextParams.delete("category");
    }
    setSearchParams(nextParams, { replace: true });
  };

  const handleBrandChange = (id) => {
    const nextId = selectedBrandId === id ? null : id;
    setSelectedBrandId(nextId);
    setCurrentPage(0);

    const nextParams = new URLSearchParams(searchParams);
    if (nextId) {
      nextParams.set("brandId", String(nextId));
    } else {
      nextParams.delete("brandId");
      nextParams.delete("brand");
    }
    setSearchParams(nextParams, { replace: true });
  };

  const handleSortSelect = (label) => {
    const found = sortOptions.find((o) => o.label === label);
    setSortValue(found ? found.value : "");
    setCurrentPage(0);
  };

  const handlePageChange = (page) => {
    if (page >= 0 && page < totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const hasActiveFilters = Boolean(
    stockFilter ||
    minPrice !== null ||
    maxPrice !== null ||
    selectedCategoryId !== null ||
    selectedBrandId !== null ||
    keyword
  );

  const resetAllFilters = () => {
    setStockFilter(null);
    setMinPrice(null);
    setMaxPrice(null);
    setSelectedCategoryId(null);
    setSelectedBrandId(null);
    setKeyword("");
    setSearchParams({}, { replace: true });
    setCurrentPage(0);
  };

  // ── Sidebar content (shared between desktop & mobile) ────────────────────
  const renderSidebarContent = (prefix = "desktop") => (
    <div className={`shop-sidebar-card sidebar ${prefix === "desktop" ? "shop-sidebar-sticky" : ""}`}>
      {/* Header bar with Active Filter Summary and Reset */}
      <div className="d-flex align-items-center justify-content-between mb-16 pb-12" style={{ borderBottom: "1px solid #f1f5f9" }}>
        <div className="d-flex align-items-center gap-8">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e57c32" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
          </svg>
          <span style={{ fontWeight: 700, fontSize: "15px", color: "#0f172a", letterSpacing: "-0.2px" }}>
            {t("shop.filterTitle", "Filters")}
          </span>
        </div>
        {hasActiveFilters && (
          <button
            type="button"
            className="shop-reset-filters-btn"
            onClick={resetAllFilters}
            title={t("common.reset", "Reset")}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
            <span>{t("common.clearAll", "Clear all")}</span>
          </button>
        )}
      </div>

      {/* Availability Filter */}
      <div className="category-block mb-12">
        <SidebarSectionHeader
          title={t("shop.availability", "Availability")}
          isOpen={openCategories.availability}
          onToggle={() => toggleCategory("availability")}
          activeCount={stockFilter ? 1 : null}
        />
        {openCategories.availability && (
          <div className="content-block mt-12">
            <div
              className={`shop-filter-option ${stockFilter === "inStock" ? "is-selected" : ""}`}
              onClick={() => setStockFilter((prev) => (prev === "inStock" ? null : "inStock"))}
            >
              <div className="cus-checkBox" style={{ pointerEvents: "none" }}>
                <input
                  type="checkbox"
                  className="inp-cbx"
                  checked={stockFilter === "inStock"}
                  readOnly
                  tabIndex={-1}
                />
                <label className="cbx shop-filter-label" style={{ pointerEvents: "none", marginBottom: 0 }}>
                  {t("common.inStock", "In Stock")}
                </label>
              </div>
            </div>
            <div
              className={`shop-filter-option ${stockFilter === "outStock" ? "is-selected" : ""}`}
              onClick={() => setStockFilter((prev) => (prev === "outStock" ? null : "outStock"))}
            >
              <div className="cus-checkBox" style={{ pointerEvents: "none" }}>
                <input
                  type="checkbox"
                  className="inp-cbx"
                  checked={stockFilter === "outStock"}
                  readOnly
                  tabIndex={-1}
                />
                <label className="cbx shop-filter-label" style={{ pointerEvents: "none", marginBottom: 0 }}>
                  {t("common.outOfStock", "Out of Stock")}
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="shop-sidebar-divider"></div>

      {/* Price Filter */}
      <div className="category-block mb-12">
        <SidebarSectionHeader
          title={t("shop.filterByPrice", "Filter By Price")}
          isOpen={openCategories.price}
          onToggle={() => toggleCategory("price")}
          activeCount={minPrice !== null || maxPrice !== null ? 1 : null}
        />
        {openCategories.price && (
          <div className="content-block mt-16">
            <PriceSlider
              initialMin={minPrice !== null ? minPrice : 0}
              initialMax={maxPrice !== null ? maxPrice : 150000}
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
      <div className="shop-sidebar-divider"></div>

      {/* Category Filter */}
      <div className="category-block mb-12">
        <SidebarSectionHeader
          title={t("shop.productCategories", "Product Categories")}
          isOpen={openCategories.categories}
          onToggle={() => toggleCategory("categories")}
          activeCount={selectedCategoryId ? 1 : null}
        />
        {openCategories.categories && (
          <div className="content-block mt-12 shop-filter-scroll-list">
            {sidebarLoading ? (
              <p className="dark-gray py-8" style={{ fontSize: "13px" }}>{t("common.loading", "Loading...")}</p>
            ) : categories.length === 0 ? (
              <p className="dark-gray py-8" style={{ fontSize: "13px" }}>{t("shop.noCategories", "No categories available")}</p>
            ) : (
              categories.map((cat) => (
                <div
                  key={cat.id}
                  className={`shop-filter-option ${selectedCategoryId === cat.id ? "is-selected" : ""}`}
                  onClick={() => handleCategoryChange(cat.id)}
                >
                  <div className="cus-checkBox" style={{ pointerEvents: "none" }}>
                    <input
                      type="checkbox"
                      className="inp-cbx"
                      checked={selectedCategoryId === cat.id}
                      readOnly
                      tabIndex={-1}
                    />
                    <label className="cbx shop-filter-label" style={{ pointerEvents: "none", marginBottom: 0 }}>
                      {cat.name}
                    </label>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
      <div className="shop-sidebar-divider"></div>

      {/* Brand Filter */}
      <div className="category-block mb-12">
        <SidebarSectionHeader
          title={t("shop.brands", "Brands")}
          isOpen={openCategories.brands}
          onToggle={() => toggleCategory("brands")}
          activeCount={selectedBrandId ? 1 : null}
        />
        {openCategories.brands && (
          <div className="content-block mt-12 shop-filter-scroll-list">
            {sidebarLoading ? (
              <p className="dark-gray py-8" style={{ fontSize: "13px" }}>{t("common.loading", "Loading...")}</p>
            ) : brands.length === 0 ? (
              <p className="dark-gray py-8" style={{ fontSize: "13px" }}>{t("shop.noBrands", "No brands available")}</p>
            ) : (
              brands.map((brand) => (
                <div
                  key={brand.id}
                  className={`shop-filter-option ${selectedBrandId === brand.id ? "is-selected" : ""}`}
                  onClick={() => handleBrandChange(brand.id)}
                >
                  <div className="cus-checkBox" style={{ pointerEvents: "none" }}>
                    <input
                      type="checkbox"
                      className="inp-cbx"
                      checked={selectedBrandId === brand.id}
                      readOnly
                      tabIndex={-1}
                    />
                    <label className="cbx shop-filter-label" style={{ pointerEvents: "none", marginBottom: 0 }}>
                      {brand.name}
                    </label>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
      <div className="shop-sidebar-divider"></div>

      {/* Tags Filter */}
      <div className="category-block mb-12">
        <SidebarSectionHeader
          title={t("shop.popularTags", "Tags")}
          isOpen={openCategories.tags}
          onToggle={() => toggleCategory("tags")}
          activeCount={keyword ? 1 : null}
        />
        {openCategories.tags && (
          <div className="content-block mt-12">
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
                      } else {
                        setKeyword(tag);
                      }
                      setCurrentPage(0);
                    }}
                    style={{
                      padding: "6px 14px",
                      borderRadius: "20px",
                      border: isTagActive ? "1px solid var(--color-primary, #e57c32)" : "1px solid #e2e8f0",
                      backgroundColor: isTagActive ? "var(--color-primary, #e57c32)" : "#f8fafc",
                      color: isTagActive ? "#ffffff" : "#475569",
                      fontSize: "12px",
                      fontWeight: "600",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      boxShadow: isTagActive ? "0 2px 8px rgba(229, 124, 50, 0.25)" : "none",
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
        className="sidebar-promotional-image w-100 object-fit-cover br-12 mt-16 overflow-hidden"
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

    const maxVisible = 5;
    let start = Math.max(0, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages - 1, start + maxVisible - 1);
    if (end - start < maxVisible - 1) {
      start = Math.max(0, end - maxVisible + 1);
    }
    const pages = [];
    for (let i = start; i <= end; i++) pages.push(i);

    const btnBase = {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: "40px",
      height: "40px",
      borderRadius: "50%",
      border: "1.5px solid #e5e7eb",
      backgroundColor: "#fff",
      color: "#374151",
      fontSize: "14px",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.2s ease",
      textDecoration: "none",
    };

    const btnActive = {
      ...btnBase,
      backgroundColor: "#e9613f",
      border: "1.5px solid #e9613f",
      color: "#fff",
      boxShadow: "0 4px 12px rgba(233,97,63,0.35)",
    };

    const btnNav = {
      ...btnBase,
      width: "40px",
      fontSize: "16px",
      color: "#6b7280",
    };

    const btnNavDisabled = {
      ...btnNav,
      opacity: 0.35,
      cursor: "not-allowed",
    };

    return (
      <div style={{ textAlign: "center", paddingBottom: "16px", marginTop: "16px" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
          {/* Prev */}
          <button
            type="button"
            style={currentPage === 0 ? btnNavDisabled : btnNav}
            disabled={currentPage === 0}
            onClick={() => handlePageChange(currentPage - 1)}
            onMouseEnter={(e) => { if (currentPage !== 0) e.currentTarget.style.borderColor = "#e9613f"; e.currentTarget.style.color = "#e9613f"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.color = "#6b7280"; }}
            title={t("common.previousPage", "Previous page")}
          >
            &#8592;
          </button>

          {/* First page + ellipsis */}
          {start > 0 && (
            <>
              <button type="button" style={btnBase} onClick={() => handlePageChange(0)}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#e9613f"; e.currentTarget.style.color = "#e9613f"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.color = "#374151"; }}
              >1</button>
              {start > 1 && <span style={{ color: "#9ca3af", fontSize: "14px" }}>…</span>}
            </>
          )}

          {/* Numbered pages */}
          {pages.map((p) => (
            <button
              key={p}
              type="button"
              style={p === currentPage ? btnActive : btnBase}
              onClick={() => handlePageChange(p)}
              onMouseEnter={(e) => { if (p !== currentPage) { e.currentTarget.style.borderColor = "#e9613f"; e.currentTarget.style.color = "#e9613f"; } }}
              onMouseLeave={(e) => { if (p !== currentPage) { e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.color = "#374151"; } }}
            >
              {p + 1}
            </button>
          ))}

          {/* Ellipsis + last page */}
          {end < totalPages - 1 && (
            <>
              {end < totalPages - 2 && <span style={{ color: "#9ca3af", fontSize: "14px" }}>…</span>}
              <button type="button" style={btnBase} onClick={() => handlePageChange(totalPages - 1)}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#e9613f"; e.currentTarget.style.color = "#e9613f"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.color = "#374151"; }}
              >{totalPages}</button>
            </>
          )}

          {/* Next */}
          <button
            type="button"
            style={currentPage >= totalPages - 1 ? btnNavDisabled : btnNav}
            disabled={currentPage >= totalPages - 1}
            onClick={() => handlePageChange(currentPage + 1)}
            onMouseEnter={(e) => { if (currentPage < totalPages - 1) { e.currentTarget.style.borderColor = "#e9613f"; e.currentTarget.style.color = "#e9613f"; } }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.color = "#6b7280"; }}
            title={t("common.nextPage", "Next page")}
          >
            &#8594;
          </button>
        </div>
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
            <div className="col-xxl-2 col-xl-3 col-lg-4 d-lg-block d-none">
              {renderSidebarContent("desktop")}
            </div>

            {/* Products Main Column */}
            <div className="col-xxl-10 col-xl-9 col-lg-8">
              <div className="row row-gap-3 align-items-center justify-content-between mb-24">
                <div className="col-xl-4 col-lg-5 col-md-7 col-6">
                  <p className="d-md-block d-none">
                    {loading
                      ? t("common.loading", "Loading...")
                      : t("shop.showingProductCount", {
                          count: products.length,
                          total: totalElements,
                          defaultValue: `Showing ${products.length} / ${totalElements} products`,
                        })}
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
                    <p className="dark-gray">{t("shop.sortBy", "Sort By")}:</p>
                    <div className="drop-container">
                      <CustomDropdown
                        options={sortOptions.map((o) => o.label)}
                        defaultValue={(sortOptions.find((o) => o.value === sortValue) || sortOptions[0]).label}
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
                    <span className="visually-hidden">{t("common.loading", "Loading...")}</span>
                  </div>
                  <p className="mt-16 dark-gray">{t("shop.loadingProducts", "Loading products...")}</p>
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
                    <span>{t("shop.retryButton", "Try again")}</span>
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
                  <h5 className="fw-700 medium-black mb-8">{t("shop.noProductsFound", "No matching products found")}</h5>
                  <p className="dark-gray mb-24" style={{ maxWidth: "420px", margin: "0 auto 20px", fontSize: "14px" }}>
                    {t("shop.noProductsDesc", "Sorry, no products match your search keyword or price range.")}
                  </p>
                  {(selectedCategoryId || selectedBrandId || minPrice !== null || maxPrice !== null || stockFilter !== null) && (
                    <button
                      type="button"
                      onClick={() => {
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
                      <span>{t("shop.clearAllFilters", "Clear all filters")}</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="row row-gap-4 mb-48">
                  {filteredProducts.map((prod) => {
                    const prodId = prod.id || prod.productId;
                    const isWishlisted = isInWishlist(prodId);
                    const inStock = (prod.stockQuantity ?? prod.stock_quantity ?? 0) > 0;
                    return (
                      <div
                        key={prodId}
                        className="col-xxl-3 col-xl-4 col-md-6 col-sm-6 wow fadeInUp animated"
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
                                {t("common.outOfStock", "Out of Stock")}
                              </span>
                            )}
                            <div className="side-icons">
                              <ul className="list-unstyled">
                                {/* Wishlist */}
                                <li>
                                  <a
                                    href="#wishlist"
                                    title={isWishlisted ? t("wishlist.remove", "Remove from wishlist") : t("wishlist.add", "Add to wishlist")}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      toggleWishlist(prod);
                                    }}
                                    style={{ color: isWishlisted ? "#e57c32" : undefined }}
                                  >
                                    <i className={isWishlisted ? "fa-solid fa-heart" : "fa-regular fa-heart"} style={{ color: isWishlisted ? "#e57c32" : undefined }}></i>
                                  </a>
                                </li>
                                {/* Quick View */}
                                <li>
                                  <a
                                    href="#quickview"
                                    title={t("modals.quickView", "Xem nhanh")}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      openQuickView(prod);
                                    }}
                                  >
                                    <i className="fa-regular fa-eye"></i>
                                  </a>
                                </li>
                              </ul>
                            </div>
                            <Link
                              to="/cart.html"
                              className="cus-btn"
                              onClick={(e) => {
                                e.preventDefault();
                                addToCart(prodId, 1, true);
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
                              <div className="d-flex align-items-center gap-8 justify-content-center mb-8 flex-wrap">
                                <span className="color-primary">★★★★★</span>
                                <span className="dark-gray font-sm fw-500">
                                  ({prod.sold != null ? `${prod.sold} đã bán` : "0 đã bán"})
                                </span>
                              </div>
                              <h5 className="medium-black fw-700">
                                {formatOrderMoney(prod.price, i18n.language)}
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
