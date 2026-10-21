// Migrated from: product-detail.html, lines 205-1705
// HTML->JSX conversion: class -> className, for -> htmlFor, img / input self-closing, gallery thumbnail active state, tab switcher state, i18n support
// API integration: useParams to read product ID, fetch real data from /api/products/:id
import { useState, useEffect } from "react";
import { Link, useSearchParams, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCartContext } from "../../providers/CartContext";
import { getProductById, getProductImage, getProducts } from "../../services/productService";
import ProductReviewsList from "../../components/reviews/ProductReviewsList";
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
  const productId = id ? Number(id) : (searchParams.get("id") ? Number(searchParams.get("id")) : 1);
  const { openCart, openQuickView, openCompare, addToCart } = useCartContext();
  const { t } = useTranslation();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("review");
  const [quantity, setQuantity] = useState(1);

  // API state
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(!!id);
  const [error, setError] = useState(null);
  const [reviewCount, setReviewCount] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const handleRatingUpdated = useCallback(({ averageRating: avg, reviewCount: count }) => {
    setAverageRating(avg);
    setReviewCount(count);
  }, []);

  useEffect(() => {
    if (!id) return;
    setQuantity(1);
    setLoading(true);
    setError(null);
    getProductById(id)
      .then((res) => setProduct(res.data))
      .catch(() => setError("Không thể tải thông tin sản phẩm."))
      .finally(() => setLoading(false));
  }, [id]);

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
      if (active) setRelatedProducts(list.filter((item) => String(item.productId ?? item.id) !== String(id)).slice(0, 4).map((item) => ({ ...item, id: item.productId ?? item.id, title: item.name, image: getProductImage(item) })));
    }).catch(() => { if (active) setRelatedProducts([]); });
    return () => { active = false; };
  }, [id]);

  if (loading) {
    return (
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
          Quay lại cửa hàng
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
                <div className="product-review-summary mb-16">
                  <ReviewStars rating={averageRating} label={t("reviews.ratingOutOfFive", { rating: averageRating.toFixed(1) })} />
                  <p className="dark-gray fw-500 mb-0">
                    {t("reviews.summary", { rating: averageRating.toFixed(1), count: reviewCount })}
                  </p>
                </div>
                <div className="d-flex align-items-center gap-16 mb-24">
                  <h4 className="color-primary fw-700">
                    {product ? formatCurrency(product.price) : "$59.00"}
                  </h4>
                </div>
                <p className="quick-view-text mb-24">
                  {product?.description || "Sản phẩm văn phòng phẩm chất lượng cao, bền đẹp và tiện lợi."}
                </p>
                {product?.stockQuantity != null && (
                  <p className="fw-500 mb-16">
                    Còn lại: <span className="color-primary fw-700">{product.stockQuantity}</span> sản phẩm trong kho!
                  </p>
                )}
                <p className="fw-500 medium-black mb-8">
                  {t("common.quantity")}:
                </p>
                <div className="quantity mb-24">
                  <div className="input-area quantity-wrap">
                    <button
                      className="decrement"
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
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
                          fill="#1E1F20"
                        />
                      </svg>
                    </button>
                    <input
                      type="text"
                      name="quantity"
                      value={quantity}
                      readOnly
                      maxLength={2}
                      size={1}
                      className="number"
                    />
                    <button
                      className="increment"
                      type="button"
                      disabled={quantity >= (product?.stockQuantity ?? 1)}
                      onClick={() => setQuantity((q) => Math.min(product?.stockQuantity ?? 1, q + 1))}
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
                          fill="#1E1F20"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
                <p className="medium-black fw-500 mb-24">
                  {t("common.sku")}:{" "}
                  <span className="dark-gray fw-400">AK-251-KT</span>
                </p>
                <div className="row row-gap-2 mb-24">
                  <div className="col-sm-6">
                    <button
                      type="button"
                      className="w-100 text-center cus-btn-2 border-0"
                      onClick={() => addToCart(productId, quantity, true)}
                    >
                      <span className="btn-text">{t("common.addCart")}</span>
                      <span>{t("common.addCart")}</span>
                    </button>
                  </div>
                  <div className="col-sm-6">
                    <Link
                      to="/checkout.html"
                      className="w-100 text-center cus-btn"
                      onClick={async (event) => { event.preventDefault(); if (await addToCart(product, quantity, { open: false })) navigate("/checkout"); }}
                    >
                      <span className="btn-text">
                        {t("productDetail.buyNow")}
                      </span>
                      <span>{t("productDetail.buyNow")}</span>
                    </Link>
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
          <div className="product-tab-wrapper mb-80">
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
                  <p className="mb-16">{t("footer.desc")}</p>
                </div>
              )}
              {activeTab === "additional" && (
                <div className="tab-pane fade show active p-24 bg-white br-12">
                  <table className="table table-bordered mb-0">
                    <tbody>
                      <tr>
                        <th style={{ width: "200px" }}>Weight</th>
                        <td>0.5 kg</td>
                      </tr>
                      <tr>
                        <th>Dimensions</th>
                        <td>15 x 20 x 2 cm</td>
                      </tr>
                      <tr>
                        <th>Material</th>
                        <td>Recycled Paper, Premium Ink</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
              {activeTab === "review" && (
                <div className="tab-pane fade show active p-24 bg-white br-12">
                  <ProductReviewsList
                    productId={id}
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
                    <Link to="/product-detail.html" className="image">
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
                            onClick={(e) => e.preventDefault()}
                          >
                            <i className="fa-light fa-heart"></i>
                          </a>
                        </li>
                        <li>
                          <a
                            href="#quickview"
                            className="btn"
                            onClick={(e) => openQuickView(prod, e)}
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
                      <div className="d-flex align-items-center gap-8 justify-content-center mb-8">
                        <span className="color-primary">★★★★★</span>
                      </div>
                      <h6 className="fw-700 color-primary">{formatCurrency(prod.price)}</h6>
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
