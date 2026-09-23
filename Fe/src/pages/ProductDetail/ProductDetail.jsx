// Migrated from: product-detail.html, lines 205-1705
// HTML->JSX conversion: class -> className, for -> htmlFor, img / input self-closing, gallery thumbnail active state, tab switcher state, i18n support
import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCartContext } from "../../providers/CartContext";

export const ProductDetail = () => {
  const { openCart, openQuickView, openCompare } = useCartContext();
  const { t } = useTranslation();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("review");
  const [quantity, setQuantity] = useState(1);

  const galleryImages = [
    "/assets/media/products/large-image-1.png",
    "/assets/media/products/large-image-2.png",
    "/assets/media/products/large-image-3.png",
    "/assets/media/products/large-image-4.png",
  ];

  const thumbImages = [
    "/assets/media/products/nav-image-1.png",
    "/assets/media/products/nav-image-2.png",
    "/assets/media/products/nav-image-3.png",
    "/assets/media/products/nav-image-4.png",
  ];

  const relatedProducts = [
    {
      id: 1,
      title: "Daily Planner Pro",
      image: "/assets/media/products/product-1.png",
      price: "$59.00",
      badge: "Sale",
    },
    {
      id: 2,
      title: "SmoothFlow Pens",
      image: "/assets/media/products/product-2.png",
      price: "$15.00",
      badge: "Sale",
    },
    {
      id: 3,
      title: "Premium Bags",
      image: "/assets/media/products/product-3.png",
      price: "$45.00",
      badge: "Sale",
    },
    {
      id: 4,
      title: "Premium Letter Paper",
      image: "/assets/media/products/product-4.png",
      price: "$20.00",
      badge: "Sale",
    },
  ];

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
                  Classic Ballpoint Pens
                </h3>
                <div className="d-flex align-items-center gap-8 mb-16">
                  <span className="color-primary">★★★★★</span>
                  <p className="dark-gray fw-500">(02 {t("common.reviews")})</p>
                </div>
                <div className="d-flex align-items-center gap-16 mb-24">
                  <h4 className="color-primary fw-700">$59.00</h4>
                  <h5 className="light-gray text-decoration-line-through fw-500">
                    $75.00
                  </h5>
                </div>
                <p className="quick-view-text mb-24">
                  The Clean Wave Washing Machine Automatic Washing Machine is
                  engineered to make laundry effortless with its advanced
                  cleaning technology. Featuring multiple wash cycles, water
                  level sensors, and a quiet motor...
                </p>
                <p className="fw-500 mb-16">
                  Hurry! Only <span className="color-primary">35/100</span>{" "}
                  units left in stock!
                </p>
                <div className="progress mb-24" style={{ height: "8px" }}>
                  <div
                    className="progress-bar bg-primary"
                    role="progressbar"
                    style={{ width: "35%" }}
                  ></div>
                </div>
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
                      onClick={() => setQuantity((q) => q + 1)}
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
                    <Link
                      to="/cart.html"
                      className="w-100 text-center cus-btn-2"
                      onClick={openCart}
                    >
                      <span className="btn-text">{t("common.addCart")}</span>
                      <span>{t("common.addCart")}</span>
                    </Link>
                  </div>
                  <div className="col-sm-6">
                    <Link
                      to="/checkout.html"
                      className="w-100 text-center cus-btn"
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
                  {t("productDetail.reviewsTab")}
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
                <div className="tab-pane fade show active">
                  <div className="review-box mb-48">
                    <div className="comment-box mb-24">
                      <img
                        src="/assets/media/users/user-2.png"
                        alt=""
                        className="br-4"
                      />
                      <div className="block">
                        <div className="top-row mb-16">
                          <div className="info">
                            <h6 className="fw-600 medium-black">
                              Ethan Clarke
                            </h6>
                          </div>
                          <div className="rating-star mb-12">
                            <p className="color-star">★★★★★</p>
                          </div>
                        </div>
                        <p>
                          Lorem ipsum dolor sit amet consectetur. Est morbi cum
                          bibendum id eleifend ultrices enim nec. Vitae morbi
                          mus imperdiet tincidunt ultrices hendrerit. Lobortis
                          donec massa fermentum aliquet sapien. Magna risus
                          donec aliquam diam aliquet consectetur.
                        </p>
                      </div>
                    </div>
                    <div className="hr-line bg-light-gray mb-24"></div>
                    <div className="comment-box">
                      <img
                        src="/assets/media/users/user-3.png"
                        alt=""
                        className="br-4"
                      />
                      <div className="block">
                        <div className="top-row mb-16">
                          <div className="info">
                            <h6 className="fw-600 medium-black">
                              Sophia Reynolds
                            </h6>
                          </div>
                          <div className="rating-star mb-12">
                            <p className="color-star">★★★★★</p>
                          </div>
                        </div>
                        <p>
                          Lorem ipsum dolor sit amet consectetur. Est morbi cum
                          bibendum id eleifend ultrices enim nec. Vitae morbi
                          mus imperdiet tincidunt ultrices hendrerit. Lobortis
                          donec massa fermentum aliquet sapien. Magna risus
                          donec aliquam diam aliquet consectetur.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="review-form">
                    <h5 className="medium-black fw-600 mb-16">
                      Write a Review
                    </h5>
                    <p className="mb-24">
                      Your email address will not be published. Required fields
                      are marked.
                    </p>

                    <p className="mb-8">Your Rating</p>
                    <div className="star-rating mb-32">
                      <input type="radio" id="1-star" name="rating" value="1" />
                      <label htmlFor="1-star" className="star">
                        &#9733;
                      </label>
                      <input
                        type="radio"
                        id="2-stars"
                        name="rating"
                        value="2"
                      />
                      <label htmlFor="2-stars" className="star">
                        &#9733;
                      </label>
                      <input
                        type="radio"
                        id="3-stars"
                        defaultChecked
                        name="rating"
                        value="3"
                      />
                      <label htmlFor="3-stars" className="star">
                        &#9733;
                      </label>
                      <input
                        type="radio"
                        id="4-stars"
                        name="rating"
                        value="4"
                      />
                      <label htmlFor="4-stars" className="star">
                        &#9733;
                      </label>
                      <input
                        type="radio"
                        id="5-stars"
                        name="rating"
                        value="5"
                      />
                      <label htmlFor="5-stars" className="star">
                        &#9733;
                      </label>
                    </div>
                    <p className="medium-black fw-600 mb-16">Your Review</p>
                    <form
                      method="post"
                      action="#"
                      className="form-group product-form"
                      onSubmit={(e) => {
                        e.preventDefault();
                        alert("Review submitted successfully!");
                      }}
                    >
                      <div className="row">
                        <div className="col-sm-12">
                          <div className="input-block mb-24">
                            <textarea
                              className="form-control"
                              name="message"
                              id="comment"
                              rows="4"
                              placeholder="Write Your Review here..."
                            ></textarea>
                          </div>
                        </div>
                        <div className="col-sm-6">
                          <div className="input-block mb-24">
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Name"
                            />
                          </div>
                        </div>
                        <div className="col-sm-6">
                          <div className="input-block mb-24">
                            <input
                              type="email"
                              className="form-control"
                              placeholder="Email"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="cus-checkBox mb-32">
                        <input type="checkbox" id="remember" defaultChecked />
                        <label htmlFor="remember">
                          Save my name, email, and website in this browser for
                          the next time I comment.
                        </label>
                      </div>
                      <button type="submit" className="cus-btn">
                        <span className="btn-text">Submit</span>
                        <span>Submit</span>
                      </button>
                    </form>
                  </div>
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
                        <li>
                          <a
                            href="#compare"
                            className="zui-wrapper-button"
                            onClick={openCompare}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="17"
                              viewBox="0 0 16 17"
                              fill="none"
                            >
                              <path
                                d="M12.979 16.5293C12.8173 16.5293 12.6557 16.4669 12.5333 16.3425C12.2913 16.0964 12.2947 15.7007 12.5408 15.4586L14.6415 13.393C14.7584 13.2759 14.8228 13.1207 14.8228 12.9558C14.8228 12.7913 14.7588 12.6366 14.6426 12.5197L12.5432 10.4773C11.9709 9.87765 12.8002 9.02596 13.4148 9.5813L15.5176 11.627C15.5194 11.6288 15.5213 11.6305 15.523 11.6323C15.8775 11.9858 16.0728 12.4558 16.0727 12.9558C16.0727 13.4559 15.8775 13.9259 15.523 14.2793C15.522 14.2803 15.521 14.2813 15.5199 14.2823L13.4172 16.35C13.2955 16.4696 13.1372 16.5293 12.979 16.5293ZM12.979 13.5293H3.82275C1.755 13.5293 0.0727539 11.8471 0.0727539 9.7793V8.18555C0.103473 7.35718 1.29232 7.3578 1.32275 8.18555V9.7793C1.32275 11.1578 2.44425 12.2793 3.82275 12.2793H12.979C13.8074 12.31 13.8068 13.4989 12.979 13.5293ZM15.4478 9.49805C15.1026 9.49805 14.8228 9.21824 14.8228 8.87305V7.2793C14.8228 5.9008 13.7013 4.7793 12.3228 4.7793H3.1665C2.33813 4.74858 2.33875 3.55974 3.1665 3.5293H12.3228C14.3905 3.5293 16.0728 5.21155 16.0728 7.2793V8.87305C16.0728 9.21824 15.7929 9.49805 15.4478 9.49805ZM3.16644 7.6543C3.00938 7.6543 2.85216 7.59549 2.73069 7.47727L0.627879 5.43162C0.626035 5.42983 0.624223 5.42805 0.622441 5.42624C0.267973 5.07283 0.0727539 4.60283 0.0727539 4.1028C0.0727539 3.60277 0.267973 3.13274 0.622441 2.77937C0.623473 2.77833 0.624473 2.77733 0.625504 2.77633L2.72832 0.708647C2.97444 0.466647 3.37016 0.46996 3.61216 0.716085C3.85416 0.96221 3.85085 1.35793 3.60472 1.59993L1.50397 3.66562C1.26438 3.89593 1.26388 4.30799 1.50285 4.5389L3.60232 6.5813C3.84972 6.82199 3.85516 7.21768 3.61447 7.46512C3.492 7.59102 3.32925 7.6543 3.16644 7.6543Z"
                                fill="#363636"
                              />
                            </svg>
                          </a>
                        </li>
                      </ul>
                    </div>
                    <Link
                      to="/cart.html"
                      className="cus-btn"
                      onClick={openCart}
                    >
                      <span className="btn-text">{t("common.addCart")}</span>
                      <span>{t("common.goToCart")}</span>
                    </Link>
                  </div>
                  <div className="product-desc">
                    <div>
                      <Link
                        to="/product-detail.html"
                        className="product-title h6 fw-700 mb-8"
                      >
                        {prod.title}
                      </Link>
                      <div className="d-flex align-items-center gap-8 justify-content-center mb-8">
                        <span className="color-primary">★★★★★</span>
                      </div>
                      <h6 className="fw-700 color-primary">{prod.price}</h6>
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
