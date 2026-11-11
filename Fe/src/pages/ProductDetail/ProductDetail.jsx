// Migrated from: product-detail.html, lines 205-1705
// HTML->JSX conversion: class -> className, for -> htmlFor, img / input self-closing, gallery thumbnail active state, tab switcher state, i18n support
// API integration: useParams to read product ID, fetch real data from /api/products/:id
import { useState, useEffect, useCallback } from "react";
import { Link, useSearchParams, useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCartContext } from "../../providers/CartContext";
import { getProductById, getProductImage, getProducts } from "../../services/productService";
import ProductReviewsList from "../../components/reviews/ProductReviewsList";
import ProductRatingSold from "../../components/shared/ProductRatingSold";
import { formatOrderMoney } from "../../utils/orderFormatters";
import useQuantityInput from "../../hooks/useQuantityInput";
import "../../styles/reviews.css";

const ReviewStars = ({ rating, label }) => {
  const filled = Math.max(0, Math.min(5, Math.round(Number(rating) || 0)));
  return (
    <span className="product-review-stars" aria-label={label}>
      <span aria-hidden="true">{"★".repeat(filled)}</span>
      <span className="empty" aria-hidden="true">{"★".repeat(5 - filled)}</span>
    </span>
  );
};

export const ProductDetail = () => {
  const [searchParams] = useSearchParams();
  const { id } = useParams();
  const navigate = useNavigate();
  const rawId = id || searchParams.get("id");
  const productId = rawId ? Number(rawId) : 1;
  const { openCart, openQuickView, openCompare, addToCart, isInWishlist, toggleWishlist } = useCartContext();
  const { t, i18n } = useTranslation();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("review");
  const [quantity, setQuantity] = useState(1);

  // API state
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(!!productId);
  const [error, setError] = useState(null);
  const [reviewCount, setReviewCount] = useState(0);
  const [averageRating, setAverageRating] = useState(0);

  const maxStock = product?.stockQuantity != null ? product.stockQuantity : 999;
  const isOutOfStock = product?.stockQuantity != null && product.stockQuantity <= 0;

  const {
    inputProps,
    handleIncrement,
    handleDecrement,
    isAtMin,
    isAtMax,
    numericValue,
  } = useQuantityInput({
    value: quantity,
    maxStock,
    min: 1,
    onChange: setQuantity,
  });
  const handleRatingUpdated = useCallback(({ averageRating: avg, reviewCount: count }) => {
    setAverageRating(avg);
    setReviewCount(count);
  }, []);

  useEffect(() => {
    if (!productId) return;
    setQuantity(1);
    setLoading(true);
    setError(null);
    getProductById(productId)
      .then((res) => setProduct(res.data?.data ?? res.data))
      .catch(() => setError(t("commerce.productLoadError", "Could not load products.")))
      .finally(() => setLoading(false));
  }, [productId]);

  useEffect(() => {
    const isReview =
      searchParams.get("tab") === "review" ||
      window.location.hash === "#reviews" ||
      window.location.hash === "#review";
    if (isReview) {
      setActiveTab("review");
      const timer = setTimeout(() => {
        const el =
          document.getElementById("product-reviews-section") ||
          document.querySelector(".product-tab-wrapper");
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [productId, searchParams]);

  const formatCurrency = (amount) => {
    if (amount == null) return "";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Use standardized product image matching product name and id
  const primaryImage = getProductImage(product);

  const galleryImages = [primaryImage,
    "/assets/media/products/large-image-2.png",
    "/assets/media/products/large-image-3.png",
    "/assets/media/products/large-image-4.png",
  ];

  const thumbImages = [
    primaryImage,
    "/assets/media/products/nav-image-2.png",
    "/assets/media/products/nav-image-3.png",
    "/assets/media/products/nav-image-4.png",
  ];

  const [relatedProducts, setRelatedProducts] = useState([]);
  useEffect(() => {
    let active = true;
    getProducts({ size: 5 }).then((response) => {
      const payload = response.data?.data ?? response.data;
      const list = Array.isArray(payload) ? payload : payload?.content ?? [];
      if (active) setRelatedProducts(list.filter((item) => String(item.productId ?? item.id) !== String(productId)).slice(0, 4).map((item) => ({ ...item, id: item.productId ?? item.id, title: item.name, image: getProductImage(item) })));
    }).catch(() => { if (active) setRelatedProducts([]); });
    return () => { active = false; };
  }, [productId]);

  if (loading) {
    return (
      <div className="text-center py-80">
        <div
          className="spinner-border"
          role="status"
          style={{ color: "var(--color-primary, #e57c32)", width: "3rem", height: "3rem" }}
        >
          <span className="visually-hidden">{t("common.loading", "Loading...")}</span>
        </div>
        <p className="mt-16 dark-gray">{t("common.loading", "Loading...")}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-80">
        <p style={{ color: "red" }}>{error}</p>
        <Link
          to="/shop"
          style={{
            display: "inline-flex",
            alignItems: "center",
            padding: "10px 24px",
            backgroundColor: "#e57c32",
            color: "#ffffff",
            borderRadius: "30px",
            fontWeight: "600",
            fontSize: "14px",
            textDecoration: "none",
            marginTop: "16px",
            boxShadow: "0 4px 12px rgba(229, 124, 50, 0.25)",
          }}
        >
          {t("common.goToShop", "Go to Shop")}
        </Link>
      </div>
    );
  }

  return (
    <>
      <section className="product-detail-sec py-80">
        <div className="container-2">
          <div className="row row-gap-4 mb-80">
            {/* Gallery Left Column */}
            <div className="col-lg-6">
              <div className="detail-gallery-wrapper">
                <div className="main-image-display mb-16 br-12 overflow-hidden text-center bg-semi-white p-24">
                  <img
                    src={galleryImages[activeImageIndex]}
                    alt=""
                    className="w-100 object-fit-contain"
                    style={{ maxHeight: "450px" }}
                  />
                </div>
                <div className="d-flex gap-16 justify-content-center">
                  {thumbImages.map((img, idx) => (
                    <div
                      key={idx}
                      className={`thumbnail-item br-8 overflow-hidden p-2 bg-semi-white cursor-pointer ${
                        activeImageIndex === idx ? "border border-primary" : ""
                      }`}
                      style={{
                        width: "80px",
                        height: "80px",
                        cursor: "pointer",
                      }}
                      onClick={() => setActiveImageIndex(idx)}
                    >
                      <img
                        src={img}
                        alt=""
                        className="w-100 h-100 object-fit-contain"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Details Right Column */}
            <div className="col-lg-6">
              <div className="product-text-container">
                <h3 className="medium-black fw-700 mb-16">
                  {product?.name ?? "Classic Ballpoint Pens"}
                </h3>
                <ProductRatingSold
                  product={product}
                  rating={averageRating}
                  reviewCount={reviewCount}
                  variant="detail"
                  className="mb-16"
                />
                <div className="d-flex align-items-center gap-16 mb-24">
                  <h4 className="color-primary fw-700">
                    {product ? formatOrderMoney(product.price, i18n.language) : "$59.00"}
                  </h4>
                </div>

                {/* Out of Stock dynamic message */}
                {isOutOfStock && (
                  <div
                    className="alert alert-danger d-flex align-items-center gap-12 p-16 mb-24"
                    style={{
                      borderRadius: "12px",
                      backgroundColor: "#fef2f2",
                      border: "1.5px solid #fecaca",
                      color: "#991b1b",
                    }}
                    role="alert"
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#dc2626"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ flexShrink: 0 }}
                    >
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <div>
                      <h6 className="fw-700 mb-1" style={{ color: "#991b1b", fontSize: "16px" }}>
                        {t("productDetail.productOutOfStock", "Sản Phẩm Này Hết Hàng")}
                      </h6>
                      <p className="mb-0" style={{ fontSize: "13px", color: "#b91c1c" }}>
                        {t("productDetail.outOfStockDesc", "Sản phẩm hiện đang tạm hết hàng. Quý khách vui lòng quay lại sau hoặc tham khảo các sản phẩm tương tự.")}
                      </p>
                    </div>
                  </div>
                )}

                {isOutOfStock ? (
                  <p className="fw-500 mb-16">
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        backgroundColor: "#fee2e2",
                        color: "#dc2626",
                        fontWeight: 700,
                        fontSize: "13px",
                        padding: "5px 14px",
                        borderRadius: "20px",
                        border: "1px solid #fecaca",
                      }}
                    >
                      <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#dc2626" }}></span>
                      {t("common.outOfStock", "Hết hàng")}
                    </span>
                  </p>
                ) : product?.stockQuantity != null ? (
                  <p className="fw-500 mb-16">
                    {t("productDetail.remainingStock", "Remaining:")}{" "}
                    <span className="color-primary fw-700">{product.stockQuantity}</span>{" "}
                    {t("productDetail.itemsInStock", "items in stock!")}
                  </p>
                ) : null}

                <p className="fw-500 medium-black mb-8">
                  {t("common.quantity")}:
                </p>
                <div className="quantity mb-24">
                  <div
                    className="input-area quantity-wrap"
                    style={isOutOfStock ? {
                      opacity: 0.5,
                      pointerEvents: "none",
                      cursor: "not-allowed",
                      backgroundColor: "#f1f5f9",
                      borderColor: "#cbd5e1"
                    } : {}}
                  >
                    <button
                      className="decrement"
                      type="button"
                      disabled={isAtMin || isOutOfStock}
                      onClick={handleDecrement}
                      style={isOutOfStock ? { cursor: "not-allowed" } : {}}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                      >
                        <path
                          d="M15.375 7.375H0.625C0.279813 7.375 0 7.65481 0 8C0 8.34519 0.279813 8.625 0.625 8.625H15.375C15.7202 8.625 16 8.34519 16 8C16 7.65481 15.7202 7.375 15.375 7.375Z"
                          fill="currentColor"
                        />
                      </svg>
                    </button>
                    <input
                      name="quantity"
                      disabled={isOutOfStock}
                      className="number text-center"
                      style={{
                        width: "48px",
                        ...(isOutOfStock ? { cursor: "not-allowed", backgroundColor: "transparent", color: "#94a3b8" } : {})
                      }}
                      {...inputProps}
                    />
                    <button
                      className="increment"
                      type="button"
                      disabled={isAtMax || isOutOfStock}
                      onClick={handleIncrement}
                      style={isOutOfStock ? { cursor: "not-allowed" } : {}}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                      >
                        <path
                          d="M15.375 7.375H8.625V0.625C8.625 0.279813 8.34519 0 8 0C7.65481 0 7.375 0.279813 7.375 0.625V7.375H0.625C0.279813 7.375 0 7.65481 0 8C0 8.34519 0.279813 8.625 0.625 8.625H7.375V15.375C7.375 15.7202 7.65481 16 8 16C8.34519 16 8.625 15.7202 8.625 15.375V8.625H15.375C15.7202 8.625 16 8.34519 16 8C16 7.65481 15.7202 7.375 15.375 7.375Z"
                          fill="currentColor"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
                <p className="medium-black fw-500 mb-24">
                  {t("common.sku")}:{" "}
                  <span className="dark-gray fw-400">{product?.sku || `SKU-${productId}`}</span>
                </p>
                <div className="row row-gap-2 mb-24">
                  <div className="col-sm-6">
                    <button
                      type="button"
                      className={`w-100 text-center cus-btn-2 border-0 ${isOutOfStock ? "disabled pe-none opacity-50" : ""}`}
                      disabled={isOutOfStock}
                      style={isOutOfStock ? {
                        backgroundColor: "#e2e8f0",
                        color: "#94a3b8",
                        borderColor: "#cbd5e1",
                        cursor: "not-allowed",
                        pointerEvents: "none",
                        boxShadow: "none",
                      } : {}}
                      onClick={() => !isOutOfStock && addToCart(productId, numericValue, true)}
                    >
                      <span className="btn-text">{isOutOfStock ? t("common.outOfStock", "Hết hàng") : t("common.addCart")}</span>
                      <span>{isOutOfStock ? t("common.outOfStock", "Hết hàng") : t("common.addCart")}</span>
                    </button>
                  </div>
                  <div className="col-sm-6">
                    <button
                      type="button"
                      className={`w-100 text-center cus-btn ${isOutOfStock ? "disabled pe-none opacity-50" : ""}`}
                      disabled={isOutOfStock}
                      style={isOutOfStock ? {
                        backgroundColor: "#94a3b8",
                        borderColor: "#94a3b8",
                        cursor: "not-allowed",
                        pointerEvents: "none",
                        boxShadow: "none",
                      } : {}}
                      onClick={async (event) => {
                        event.preventDefault();
                        if (isOutOfStock) return;
                        if (await addToCart(product, numericValue, { open: false })) navigate("/checkout");
                      }}
                    >
                      <span className="btn-text">
                        {isOutOfStock ? t("common.outOfStock", "Hết hàng") : t("productDetail.buyNow")}
                      </span>
                      <span>{isOutOfStock ? t("common.outOfStock", "Hết hàng") : t("productDetail.buyNow")}</span>
                    </button>
                  </div>
                </div>
                <div className="info-container">
                  <div className="more-info mb-24">
                    <div className="icon">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                      >
                        <path
                          d="M17.0312 8.90625H18.75V13.75C18.75 14.4404 18.1904 15 17.5 15H17.0312V8.90625Z"
                          fill="#141516"
                        />
                      </svg>
                    </div>
                    <div className="text-block">
                      <p className="fw-600 medium-black">
                        {t("productDetail.freeShipping")}
                      </p>
                    </div>
                  </div>
                  <div className="more-info">
                    <div className="icon">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                      >
                        <path
                          d="M10 0C4.47715 0 0 4.47715 0 10C0 15.5228 4.47715 20 10 20C15.5228 20 20 15.5228 20 10C20 4.47715 15.5228 0 10 0Z"
                          fill="#141516"
                        />
                      </svg>
                    </div>
                    <div className="text-block">
                      <p className="fw-600 medium-black">
                        {t("productDetail.satisfaction")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Description / Additional / Review Tabs */}
          <div className="product-tab-wrapper mb-80" id="product-reviews-section">
            <ul className="nav nav-tabs border-bottom mb-32 justify-content-center">
              <li className="nav-item">
                <button
                  className={`nav-link border-0 fw-600 ${
                    activeTab === "desc" ? "active text-primary" : "text-muted"
                  }`}
                  onClick={() => setActiveTab("desc")}
                >
                  {t("productDetail.description")}
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link border-0 fw-600 ${
                    activeTab === "additional"
                      ? "active text-primary"
                      : "text-muted"
                  }`}
                  onClick={() => setActiveTab("additional")}
                >
                  {t("productDetail.additionalInfo")}
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link border-0 fw-600 ${
                    activeTab === "review"
                      ? "active text-primary"
                      : "text-muted"
                  }`}
                  onClick={() => setActiveTab("review")}
                >
                  {t("productDetail.reviewsTab", { count: reviewCount })}
                </button>
              </li>
            </ul>

            <div className="tab-content">
              {activeTab === "desc" && (
                <div className="tab-pane fade show active p-24 bg-white br-12">
                  <p
                    className="mb-0 dark-gray"
                    style={{ whiteSpace: "pre-line", lineHeight: "1.8", fontSize: "15px" }}
                  >
                    {product?.description || t("productDetail.noDescription", "No detailed description available for this product.")}
                  </p>
                </div>
              )}
              {activeTab === "additional" && (
                <div className="tab-pane fade show active p-24 bg-white br-12">
                  <table className="table table-bordered mb-0">
                    <tbody>
                      <tr>
                        <th style={{ width: "200px" }}>{t("productDetail.skuCode", "SKU Code")}</th>
                        <td>{product?.sku || `SKU-${productId}`}</td>
                      </tr>
                      {product?.brand?.name && (
                        <tr>
                          <th>{t("common.brand", "Brand")}</th>
                          <td>{product.brand.name}</td>
                        </tr>
                      )}
                      {product?.category?.name && (
                        <tr>
                          <th>{t("common.categories", "Categories")}</th>
                          <td>{product.category.name}</td>
                        </tr>
                      )}
                      <tr>
                        <th>{t("productDetail.weight", "Weight")}</th>
                        <td>{product?.weightKg ?? product?.weight ?? "0.1"} kg</td>
                      </tr>
                      {product?.stockQuantity != null && (
                        <tr>
                          <th>{t("productDetail.stockStatus", "Stock Status")}</th>
                          <td>{product.stockQuantity > 0 ? `${t("common.inStock", "In Stock")} (${product.stockQuantity})` : t("common.outOfStock", "Out of Stock")}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
              {activeTab === "review" && (
                <div className="tab-pane fade show active p-24 bg-white br-12">
                  <ProductReviewsList
                    productId={productId}
                    productName={product?.name}
                    onRatingUpdated={handleRatingUpdated}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Related Products Section Start */}
      <section className="featured-product-sec pt-40 pb-80">
        <div className="container-2">
          <div className="heading mb-48 text-center wow fadeInUp animated">
            <h2 className="medium-black fw-700 mb-16">
              {t("productDetail.relatedProducts")}
            </h2>
          </div>
          <div className="row row-gap-4">
            {relatedProducts.map((prod) => (
              <div
                key={prod.id}
                className="col-xl-3 col-lg-4 col-md-6 col-sm-6"
              >
                <div className="latest-product-card">
                  <div className="image-box mb-16">
                    <span className="sale-label subtitle fw-400 white">
                      {prod.badge === "Sale" ? t("common.sale") : prod.badge}
                    </span>
                    <Link to={`/product/${prod.id}`} className="image">
                      <img
                        src={prod.image}
                        className="product-image"
                        alt={prod.title}
                      />
                    </Link>
                    <div className="side-icons">
                      <ul className="list-unstyled">
                        <li>
                          <a
                            href="#wishlist"
                            title={isInWishlist(prod.id) ? t("wishlist.remove", "Remove from wishlist") : t("wishlist.add", "Add to wishlist")}
                            onClick={(e) => {
                              e.preventDefault();
                              toggleWishlist(prod);
                            }}
                            style={{ color: isInWishlist(prod.id) ? "#e57c32" : undefined }}
                          >
                            <i className={isInWishlist(prod.id) ? "fa-solid fa-heart" : "fa-regular fa-heart"} style={{ color: isInWishlist(prod.id) ? "#e57c32" : undefined }}></i>
                          </a>
                        </li>
                        <li>
                          <a
                            href="#quickview"
                            className="btn"
                            title={t("modals.quickView", "Quick View")}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              openQuickView(prod, e);
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
                      onClick={(event) => { event.preventDefault(); addToCart(prod.id, 1); }}
                    >
                      <span className="btn-text">{t("common.addCart")}</span>
                      <span>{t("common.goToCart")}</span>
                    </Link>
                  </div>
                  <div className="product-desc">
                    <div>
                      <Link
                        to={`/product/${prod.id}`}
                        className="product-title h6 fw-700 mb-8"
                      >
                        {prod.title}
                      </Link>
                      <ProductRatingSold product={prod} variant="card" className="mb-8" />
                      <h6 className="fw-700 color-primary">{formatOrderMoney(prod.price, i18n.language)}</h6>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default ProductDetail;
