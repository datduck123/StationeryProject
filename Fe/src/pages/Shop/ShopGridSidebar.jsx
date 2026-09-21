// Migrated from: shop-grid-sidebar.html, lines 203-2241; assets/js/app.js lines 322-352
// HTML->JSX conversion: class -> className, for -> htmlFor, img / input self-closing, accordion states, mobile filter drawer state, i18n support
import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import TitleBanner from "../../components/shared/TitleBanner";
import PriceSlider from "../../components/ui/PriceSlider";
import CustomDropdown from "../../components/ui/CustomDropdown";
import { useCartContext } from "../../providers/CartContext";

export const ShopGridSidebar = () => {
  const { openCart, openQuickView, openCompare } = useCartContext();
  const { t } = useTranslation();

  const [openCategories, setOpenCategories] = useState({
    availability: true,
    price: true,
    categories: true,
    tags: true,
  });

  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const toggleCategory = (key) => {
    setOpenCategories((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const products = [
    {
      id: 1,
      title: "Daily Planner Pro",
      image: "assets/media/products/product-1.png",
      price: "$59.00",
      badge: "Sale",
    },
    {
      id: 2,
      title: "SmoothFlow Pens",
      image: "assets/media/products/product-2.png",
      price: "$59.00",
      badge: "",
    },
    {
      id: 3,
      title: "Premium Bags",
      image: "assets/media/products/product-3.png",
      price: "$59.00",
      badge: "-15%",
    },
    {
      id: 4,
      title: "Pencil Case Mockup",
      image: "assets/media/products/product-4.png",
      price: "$59.00",
      badge: "Sale",
    },
    {
      id: 5,
      title: "Classic Ballpoint Pens",
      image: "assets/media/products/product-5.png",
      price: "$59.00",
      badge: "Sale",
    },
    {
      id: 6,
      title: "Magnetic Paper Clips",
      image: "assets/media/products/product-6.png",
      price: "$59.00",
      badge: "",
    },
    {
      id: 7,
      title: "Pen's Box",
      image: "assets/media/products/product-7.png",
      price: "$59.00",
      badge: "Sale",
    },
    {
      id: 8,
      title: "Calculator",
      image: "assets/media/products/product-8.png",
      price: "$59.00",
      badge: "",
    },
    {
      id: 9,
      title: "Watercolor Paper Pad",
      image: "assets/media/products/product-9.png",
      price: "$59.00",
      badge: "Sale",
    },
  ];

  const renderSidebarContent = () => (
    <div className="sidebar">
      {/* Search Bar */}
      <form
        action="#"
        method="post"
        className="search-bar-container mb-24"
        onSubmit={(e) => e.preventDefault()}
      >
        <div className="search-input-block">
          <input
            type="text"
            name="search"
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
                <input type="checkbox" id="inStock" className="inp-cbx" />
                <label htmlFor="inStock" className="cbx">
                  {t("common.inStock", "In Stock")}
                </label>
              </div>
              <p>(05)</p>
            </div>
            <div className="d-flex align-items-center justify-content-between mb-12">
              <div className="cus-checkBox">
                <input type="checkbox" id="outStock" className="inp-cbx" />
                <label htmlFor="outStock" className="cbx">
                  {t("common.outOfStock", "Out Stock")}
                </label>
              </div>
              <p>(08)</p>
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
            <PriceSlider />
          </div>
        )}
      </div>
      <div className="hr-line line-2 mb-24"></div>

      {/* Blog Categories Filter */}
      <div
        className="category-block box-1 mb-32 wow fadeInUp animated"
        data-wow-delay="300ms"
      >
        <div className="title" onClick={() => toggleCategory("categories")}>
          <h6 className="fw-600 font-sec medium-black">
            {t("shop.productCategories", "Blog Categories")}
          </h6>
          <span>
            <i
              className={`fa-light ${openCategories.categories ? "fa-chevron-up" : "fa-chevron-down"}`}
            ></i>
          </span>
        </div>
        {openCategories.categories && (
          <div className="content-block mt-24">
            <div className="d-flex align-items-center justify-content-between mb-12">
              <div className="cus-checkBox">
                <input type="checkbox" id="sketchbooks" className="inp-cbx" />
                <label htmlFor="sketchbooks" className="cbx">
                  Sketchbooks
                </label>
              </div>
              <p>(05)</p>
            </div>
            <div className="d-flex align-items-center justify-content-between mb-12">
              <div className="cus-checkBox">
                <input type="checkbox" id="hardcover" className="inp-cbx" />
                <label htmlFor="hardcover" className="cbx">
                  Hardcover Notebooks
                </label>
              </div>
              <p>(08)</p>
            </div>
            <div className="d-flex align-items-center justify-content-between mb-12">
              <div className="cus-checkBox">
                <input type="checkbox" id="markers" className="inp-cbx" />
                <label htmlFor="markers" className="cbx">
                  Markers
                </label>
              </div>
              <p>(12)</p>
            </div>
            <div className="d-flex align-items-center justify-content-between mb-12">
              <div className="cus-checkBox">
                <input type="checkbox" id="brownies" className="inp-cbx" />
                <label htmlFor="brownies" className="cbx">
                  Choco-Luxe Brownies
                </label>
              </div>
              <p>(12)</p>
            </div>
            <div className="d-flex align-items-center justify-content-between mb-12">
              <div className="cus-checkBox">
                <input type="checkbox" id="smallAnimals" className="inp-cbx" />
                <label htmlFor="smallAnimals" className="cbx">
                  Small Animals
                </label>
              </div>
              <p>(12)</p>
            </div>
            <div className="d-flex align-items-center justify-content-between">
              <div className="cus-checkBox">
                <input
                  type="checkbox"
                  id="caramelCookies"
                  className="inp-cbx"
                />
                <label htmlFor="caramelCookies" className="cbx">
                  Caramel Swirl Cookies
                </label>
              </div>
              <p>(04)</p>
            </div>
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
            <div className="tags-wrapper">
              <Link to="/shop-grid-sidebar.html" className="tag">
                <p>Pencils</p>
              </Link>
              <Link to="/shop-grid-sidebar.html" className="tag">
                <p>Notebooks</p>
              </Link>
              <Link to="/shop-grid-sidebar.html" className="tag">
                <p>Pens & Markers</p>
              </Link>
              <Link to="/shop-grid-sidebar.html" className="tag">
                <p>Art Supplies</p>
              </Link>
              <Link to="/shop-grid-sidebar.html" className="tag">
                <p>Organizers</p>
              </Link>
              <Link to="/shop-grid-sidebar.html" className="tag">
                <p>Craft Supplies</p>
              </Link>
              <Link to="/shop-grid-sidebar.html" className="tag">
                <p>Planners & Journals</p>
              </Link>
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
          src="assets/media/images/sidebar-image.png"
          alt=""
          className="w-100 object-fit-cover br-12"
        />
      </div>
    </div>
  );

  return (
    <>
      <TitleBanner title={t("shop.title")} />

      <section className="shop-section py-80">
        <div className="container-2">
          <div className="row">
            {/* Desktop Sidebar */}
            <div className="col-lg-3 d-lg-block d-none">
              {renderSidebarContent()}
            </div>

            {/* Products Main Column */}
            <div className="col-lg-9">
              <div className="row row-gap-3 align-items-center justify-content-between mb-24">
                <div className="col-xl-4 col-lg-5 col-md-7 col-6">
                  <p className="d-md-block d-none">
                    {t("shop.showingResults", "Showing 01 - 09 of 30 Results")}
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
                    <p className="dark-gray">{t("shop.sortBy", "Short by")}:</p>
                    <div className="drop-container">
                      <CustomDropdown />
                    </div>
                  </div>
                </div>
              </div>

              {/* Product Grid */}
              <div className="row row-gap-4 mb-48">
                {products.map((prod) => (
                  <div
                    key={prod.id}
                    className="col-lg-4 col-md-6 col-sm-6 wow fadeInUp animated"
                    data-wow-delay="400ms"
                  >
                    <div className="latest-product-card">
                      <div className="image-box mb-16">
                        {prod.badge && (
                          <span className="sale-label subtitle fw-400 white">
                            {prod.badge === "Sale"
                              ? t("common.sale")
                              : prod.badge}
                          </span>
                        )}
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
                              <a href="wishlist.html">
                                <i className="fa-light fa-heart"></i>
                              </a>
                            </li>
                            <li>
                              <a
                                href="#quickview"
                                className="btn"
                                onClick={(e) => {
                                  e.preventDefault();
                                  openQuickView(prod);
                                }}
                              >
                                <i className="fa-regular fa-eye"></i>
                              </a>
                            </li>
                            <li>
                              <a
                                href="#compare"
                                className="zui-wrapper-button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  openCompare();
                                }}
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
                                  ></path>
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
                            to="/product-detail.html"
                            className="product-title h6 fw-700 mb-8"
                          >
                            {prod.title}
                          </Link>
                          <div className="d-flex align-items-center gap-8 justify-content-center mb-8">
                            <span className="color-primary">★★★★★</span>
                            <p className="fw-500">(02)</p>
                          </div>
                          <h5 className="medium-black fw-700">{prod.price}</h5>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <div className="pagination-wrapper mb-32">
                <ul className="pagination justify-content-center">
                  <li className="page-item active">
                    <a
                      className="page-link"
                      href="#page1"
                      onClick={(e) => e.preventDefault()}
                    >
                      1
                    </a>
                  </li>
                  <li className="page-item">
                    <a
                      className="page-link"
                      href="#page2"
                      onClick={(e) => e.preventDefault()}
                    >
                      2
                    </a>
                  </li>
                  <li className="page-item">
                    <a
                      className="page-link"
                      href="#page3"
                      onClick={(e) => e.preventDefault()}
                    >
                      3
                    </a>
                  </li>
                  <li className="page-item">
                    <a
                      className="page-link"
                      href="#next"
                      onClick={(e) => e.preventDefault()}
                    >
                      Next
                    </a>
                  </li>
                </ul>
              </div>
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
        {renderSidebarContent()}
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
