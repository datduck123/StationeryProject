// Migrated from: index.html, lines 198-2992
// HTML->JSX conversion: class -> className, for -> htmlFor, img / br / input self-closing, Link integration, CartContext integration, i18n support
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import CountdownTimer from "../../components/ui/CountdownTimer";
import { useCartContext } from "../../providers/CartContext";

const RatingStars = () => (
  <div className="rating-stars">
    {[...Array(5)].map((_, i) => (
      <svg
        key={i}
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="13"
        viewBox="0 0 14 13"
        fill="none"
      >
        <path
          d="M6.42937 0.826541C6.60898 0.273755 7.39102 0.273757 7.57063 0.826543L8.6614 4.18359C8.74173 4.4308 8.9721 4.59818 9.23204 4.59818H12.7618C13.3431 4.59818 13.5847 5.34195 13.1145 5.68359L10.2588 7.75835C10.0485 7.91114 9.96055 8.18196 10.0409 8.42917L11.1316 11.7862C11.3113 12.339 10.6786 12.7987 10.2083 12.457L7.35267 10.3823C7.14238 10.2295 6.85762 10.2295 6.64733 10.3823L3.79166 12.457C3.32143 12.7987 2.68874 12.339 2.86835 11.7862L3.95912 8.42917C4.03945 8.18196 3.95145 7.91114 3.74116 7.75835L0.885485 5.68359C0.415257 5.34194 0.656924 4.59818 1.23816 4.59818H4.76796C5.0279 4.59818 5.25827 4.4308 5.3386 4.18359L6.42937 0.826541Z"
          fill="#E85F3E"
        />
      </svg>
    ))}
  </div>
);

const ProductCard = ({ product, openCart, openQuickView, t }) => {
  const { toggleWishlist, isInWishlist } = useCartContext();
  const prodId = product.id || product.productId;
  const isWishlisted = isInWishlist(prodId);
  const normalizedProduct = {
    ...product,
    name: product.name || product.title,
    imageUrl: product.imageUrl || product.image,
  };

  return (
    <div className="latest-product-card">
      <div className="image-box mb-16">
        {product.badge && (
          <span className="sale-label subtitle fw-400 white">
            {product.badge === "Sale" ? t("common.sale") : product.badge}
          </span>
        )}
        <Link to={`/product/${prodId}`} className="image">
          <img src={product.image} className="product-image" alt={product.title || product.name || ""} />
        </Link>
        <div className="side-icons">
          <ul className="list-unstyled">
            <li>
              <a
                href="#wishlist"
                title={isWishlisted ? "Xóa khỏi yêu thích" : "Thêm vào yêu thích"}
                onClick={(e) => {
                  e.preventDefault();
                  toggleWishlist(normalizedProduct);
                }}
                style={{ color: isWishlisted ? "#e57c32" : undefined }}
              >
                <i
                  className={isWishlisted ? "fa-solid fa-heart" : "fa-light fa-heart"}
                  style={{ color: isWishlisted ? "#e57c32" : undefined }}
                ></i>
              </a>
            </li>
            <li>
              <a
                href="#quickview"
                className="btn"
                title="Xem nhanh"
                onClick={(e) => {
                  e.preventDefault();
                  openQuickView(normalizedProduct, e);
                }}
              >
                <i className="fa-regular fa-eye"></i>
              </a>
            </li>
          </ul>
        </div>
      <a
        href="#cart"
        className="cus-btn"
        onClick={(e) => {
          e.preventDefault();
          openCart();
        }}
      >
        <span className="btn-text">{t("common.addCart")}</span>
        <span>{t("common.goToCart")}</span>
      </a>
    </div>
    <div className="product-desc">
      <div>
        <Link
          to={`/product/${prodId}`}
          className="product-title h6 fw-700 mb-8"
        >
          {product.title}
        </Link>
        <div className="d-flex align-items-center gap-8 justify-content-center mb-8">
          <RatingStars />
          <p className="fw-500">(02)</p>
        </div>
        <h5 className="medium-black fw-700">{product.price}</h5>
      </div>
    </div>
  </div>
  );
};

export const Home = () => {
  const { openCart, openQuickView } = useCartContext();
  const { t } = useTranslation();

  useEffect(() => {
    if (window.$ && window.$.fn && window.$.fn.slick) {
      const $featured = window.$(".featured-product-slider");
      if ($featured.length && !$featured.hasClass("slick-initialized")) {
        $featured.slick({
          slidesToShow: 4,
          slidesToScroll: 1,
          autoplay: true,
          autoplaySpeed: 3000,
          dots: false,
          arrows: false,
          centerPadding: "0",
          cssEase: "linear",
          responsive: [
            { breakpoint: 1200, settings: { slidesToShow: 3 } },
            { breakpoint: 821, settings: { slidesToShow: 2 } },
            { breakpoint: 768, settings: { slidesToShow: 1 } },
          ],
        });
      }

      const $brand = window.$(".brand-slider");
      if ($brand.length && !$brand.hasClass("slick-initialized")) {
        $brand.slick({
          autoplay: true,
          autoplaySpeed: 0,
          speed: 10000,
          arrows: false,
          swipe: true,
          slidesToShow: 6,
          cssEase: "linear",
          pauseOnFocus: false,
          pauseOnHover: false,
          responsive: [
            { breakpoint: 1699, settings: { slidesToShow: 5 } },
            { breakpoint: 1499, settings: { slidesToShow: 4 } },
            { breakpoint: 1299, settings: { slidesToShow: 3 } },
            { breakpoint: 821, settings: { slidesToShow: 2 } },
          ],
        });
      }
    }

    return () => {
      if (window.$ && window.$.fn && window.$.fn.slick) {
        if (
          window.$(".featured-product-slider").hasClass("slick-initialized")
        ) {
          window.$(".featured-product-slider").slick("unslick");
        }
        if (window.$(".brand-slider").hasClass("slick-initialized")) {
          window.$(".brand-slider").slick("unslick");
        }
      }
    };
  }, []);

  const categories = [
    {
      id: 1,
      name: "Book Pin",
      count: "12",
      image: "/assets/media/collection/collection-1.png",
      delay: "200ms",
    },
    {
      id: 2,
      name: "Pencil",
      count: "18",
      image: "/assets/media/collection/collection-2.png",
      delay: "300ms",
    },
    {
      id: 3,
      name: "Pencil Pocket",
      count: "5",
      image: "/assets/media/collection/collection-3.png",
      delay: "400ms",
    },
    {
      id: 4,
      name: "Notebook",
      count: "8",
      image: "/assets/media/collection/collection-4.png",
      delay: "500ms",
    },
    {
      id: 5,
      name: "Tape",
      count: "16",
      image: "/assets/media/collection/collection-5.png",
      delay: "600ms",
    },
    {
      id: 6,
      name: "Book Pin",
      count: "10",
      image: "/assets/media/collection/collection-6.png",
      delay: "700ms",
    },
    {
      id: 7,
      name: "Geometry",
      count: "5",
      image: "/assets/media/collection/collection-7.png",
      delay: "400ms",
    },
  ];

  const featuredProducts = [
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
      price: "$59.00",
      badge: "",
    },
    {
      id: 3,
      title: "Premium Bags",
      image: "/assets/media/products/product-3.png",
      price: "$59.00",
      badge: "-15%",
    },
    {
      id: 4,
      title: "Premium Letter Paper",
      image: "/assets/media/products/product-4.png",
      price: "$59.00",
      badge: "Sale",
    },
    {
      id: 5,
      title: "Daily Planner Pro",
      image: "/assets/media/products/product-1.png",
      price: "$59.00",
      badge: "Sale",
    },
    {
      id: 6,
      title: "SmoothFlow Pens",
      image: "/assets/media/products/product-2.png",
      price: "$59.00",
      badge: "",
    },
    {
      id: 7,
      title: "Premium Bags",
      image: "/assets/media/products/product-3.png",
      price: "$59.00",
      badge: "-15%",
    },
    {
      id: 8,
      title: "Premium Letter Paper",
      image: "/assets/media/products/product-4.png",
      price: "$59.00",
      badge: "Sale",
    },
  ];

  const bestSellerProducts = [
    {
      id: 1,
      title: "Classic Ballpoint Pens",
      image: "/assets/media/products/product-5.png",
      price: "$59.00",
      badge: "Sale",
    },
    {
      id: 2,
      title: "Magnetic Paper Clips",
      image: "/assets/media/products/product-6.png",
      price: "$59.00",
      badge: "",
    },
    {
      id: 3,
      title: "Pen's Box",
      image: "/assets/media/products/product-7.png",
      price: "$59.00",
      badge: "-15%",
    },
    {
      id: 4,
      title: "Calculator",
      image: "/assets/media/products/product-8.png",
      price: "$59.00",
      badge: "Sale",
    },
    {
      id: 5,
      title: "Watercolor Paper Pad",
      image: "/assets/media/products/product-9.png",
      price: "$59.00",
      badge: "Sale",
    },
    {
      id: 6,
      title: "Watercolor Paper Pad",
      image: "/assets/media/products/product-10.png",
      price: "$59.00",
      badge: "",
    },
    {
      id: 7,
      title: "Daily Planner Pro",
      image: "/assets/media/products/product-11.png",
      price: "$59.00",
      badge: "-15%",
    },
    {
      id: 8,
      title: "Hardcover Notebook",
      image: "/assets/media/products/product-12.png",
      price: "$59.00",
      badge: "Sale",
    },
  ];

  const testimonials = [
    {
      id: 1,
      name: "- Charlie Quitzon",
      delay: "200ms",
      text: "Justo habitasse cubilia ridiculus pulvinar et consequat, donec sociosqu. Ullamcorper dignissim dolor adipiscing nulla, ligula dictum auctor iaculis nulla. Penatibus ipsum cras sollicitudin, vehicula phasellus litora. Rutrum ultrices phasellus adipiscing gravida diam erat.",
    },
    {
      id: 2,
      name: "- Yuki Japan",
      delay: "300ms",
      text: "Justo habitasse cubilia ridiculus pulvinar et consequat, donec sociosqu. Ullamcorper dignissim dolor adipiscing nulla, ligula dictum auctor iaculis nulla. Penatibus ipsum cras sollicitudin, vehicula phasellus litora.",
    },
    {
      id: 3,
      name: "- Mathew Aden",
      delay: "400ms",
      text: "Justo habitasse cubilia ridiculus pulvinar et consequat, donec sociosqu. Ullamcorper dignissim dolor adipiscing nulla, ligula dictum auctor iaculis nulla. Penatibus ipsum cras sollicitudin, vehicula phasellus litora.",
    },
    {
      id: 4,
      name: "- Eren Turkey",
      delay: "500ms",
      text: "Justo habitasse cubilia ridiculus pulvinar et consequat, donec sociosqu. Ullamcorper dignissim dolor adipiscing nulla, ligula dictum auctor iaculis nulla. Penatibus ipsum cras sollicitudin, vehicula phasellus litora.",
    },
    {
      id: 5,
      name: "- Kenny USA",
      delay: "600ms",
      text: "Justo habitasse cubilia ridiculus pulvinar et consequat, donec sociosqu. Ullamcorper dignissim dolor adipiscing nulla, ligula dictum auctor iaculis nulla. Penatibus ipsum cras sollicitudin, vehicula phasellus litora.",
    },
    {
      id: 6,
      name: "- John Smith",
      delay: "700ms",
      text: "Justo habitasse cubilia ridiculus pulvinar et consequat, donec sociosqu. Ullamcorper dignissim dolor adipiscing nulla, ligula dictum auctor iaculis nulla. Penatibus ipsum cras sollicitudin, vehicula phasellus litora. Rutrum ultrices phasellus adipiscing gravida diam erat.",
    },
  ];

  const blogs = [
    {
      id: 1,
      image: "/assets/media/blogs/blog-1.png",
      date: "By Admin • 24 Jan, 2025",
      title: "Why Quality Stationery Matters: Elevate Your Workspace",
      desc: "Lorem ipsum dolor sit amet consectetur. Velit mi vitae dolor curabitur duis sociis. Eget risus.",
      delay: "400ms",
    },
    {
      id: 2,
      image: "/assets/media/blogs/blog-2.png",
      date: "By Admin • 24 Jan, 2025",
      title: "Minimalist vs. Aesthetic: Finding Your Stationery Style",
      desc: "Lorem ipsum dolor sit amet consectetur. Velit mi vitae dolor curabitur duis sociis. Eget risus.",
      delay: "500ms",
    },
    {
      id: 3,
      image: "/assets/media/blogs/blog-3.png",
      date: "By Admin • 24 Jan, 2025",
      title: "The Ultimate Guide to Choosing the Perfect Notebook",
      desc: "Lorem ipsum dolor sit amet consectetur. Velit mi vitae dolor curabitur duis sociis. Eget risus.",
      delay: "600ms",
    },
  ];

  return (
    <>
      {/* HERO BANNER START */}
      <section className="hero-banner">
        <div className="container-2">
          <div className="hero-banner-wrapper">
            <img
              src="/assets/media/banner/hero-element.png"
              alt=""
              className="element-1"
            />
            <img
              src="/assets/media/banner/hero-element-2.png"
              alt=""
              className="element-2"
            />
            <img
              src="/assets/media/banner/hero-element-3.png"
              alt=""
              className="element-3"
            />
            <div className="row align-items-center row-gap-4">
              <div className="col-lg-6 col-md-6">
                <div className="hero-content-block">
                  <h1 className="medium-black fw-700 mb-16">
                    <span className="color-primary">
                      {t("home.heroTitle1")}{" "}
                    </span>
                    <br className="d-block" />
                    {t("home.heroTitle2")}
                  </h1>
                  <p className="mb-32">{t("home.heroDesc")}</p>
                  <Link to="/shop" className="cus-btn">
                    <span className="btn-text">{t("common.shopNow")}</span>
                    <span>{t("common.goToShop")}</span>
                  </Link>
                </div>
              </div>
              <div className="col-lg-6 col-md-6">
                <div className="hero-image">
                  <img
                    src="/assets/media/banner/hero-image.png"
                    alt=""
                    className="w-100"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* HERO BANNER END */}

      {/* COLLECTION SECTION START */}
      <div className="collection-sec pt-80 pb-40">
        <div className="container-2">
          <div
            className="heading mb-48 text-center wow fadeInUp animated"
            data-wow-delay="400ms"
          >
            <h2 className="medium-black fw-700 mb-16">
              {t("home.shopByCat")}{" "}
              <span className="color-primary">
                {t("home.shopByCatHighlight")}
              </span>
            </h2>
            <p>{t("home.catSubtitle")}</p>
          </div>
          <div className="collection-wrapper">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to="/shop"
                className="collection-block w-100 wow fadeInUp animated"
                data-wow-delay={cat.delay}
              >
                <div className="image-box mb-12">
                  <img src={cat.image} alt="" />
                </div>
                <div className="text-box">
                  <h6 className="title-text fw-700 text-center">{cat.name}</h6>
                  <p className="dark-gray">{cat.count}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
      {/* COLLECTION SECTION END */}

      {/* FEATURED PRODUCT START */}
      <section className="featured-product-sec py-40">
        <div className="container-2">
          <div
            className="heading mb-48 text-center wow fadeInUp animated"
            data-wow-delay="400ms"
          >
            <h2 className="medium-black fw-700 mb-16">
              {t("home.featuredProducts")}{" "}
              <span className="color-primary">
                {t("home.featuredProductsHighlight")}
              </span>
            </h2>
            <p>{t("home.featuredSubtitle")}</p>
          </div>
          <div className="featured-product-slider">
            {featuredProducts.map((prod) => (
              <ProductCard
                key={prod.id}
                product={prod}
                openCart={openCart}
                openQuickView={openQuickView}
                t={t}
              />
            ))}
          </div>
        </div>
      </section>
      {/* FEATURED PRODUCT END */}

      {/* COLLECTION GRIDS START */}
      <section className="collection-grid-sec py-40">
        <div className="container-2">
          <div className="row row-gap-3">
            <div className="col-lg-6">
              <div className="collection-grid">
                <img
                  src="/assets/media/collection/main-col-1.png"
                  alt=""
                  className="w-100"
                />
                <div className="col-lg-9">
                  <div className="grid-content">
                    <h2 className="title-text-1 fw-700 mb-8">
                      {t("home.gridTitle1")}
                    </h2>
                    <p className="mb-16">{t("home.gridDesc1")}</p>
                    <Link to="/shop" className="cus-btn-2">
                      <span className="btn-text">{t("common.shopNow")}</span>
                      <span>{t("common.goToShop")}</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="collection-grid mb-24">
                <img
                  src="/assets/media/collection/main-col-2.png"
                  alt=""
                  className="w-100"
                />
                <div className="col-lg-9">
                  <div className="grid-content grid-2">
                    <h4 className="title-text-2 fw-700 mb-8">
                      {t("home.gridTitle2")}
                    </h4>
                    <p className="mb-16">{t("home.gridDesc2")}</p>
                    <Link to="/shop" className="cus-btn-2">
                      <span className="btn-text">{t("common.shopNow")}</span>
                      <span>{t("common.goToShop")}</span>
                    </Link>
                  </div>
                </div>
              </div>
              <div className="collection-grid">
                <img
                  src="/assets/media/collection/main-col-3.png"
                  alt=""
                  className="w-100"
                />
                <div className="col-lg-9">
                  <div className="grid-content grid-2">
                    <h4 className="title-text-3 fw-700 mb-8">
                      {t("home.gridTitle3")}
                    </h4>
                    <p className="mb-16">{t("home.gridDesc3")}</p>
                    <Link to="/shop" className="cus-btn-2">
                      <span className="btn-text">{t("common.shopNow")}</span>
                      <span>{t("common.goToShop")}</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* COLLECTION GRIDS END */}

      {/* INNER BANNER START */}
      <section className="inner-banner py-40 my-40">
        <div className="container-2">
          <div className="inner-wrapper">
            <img
              src="/assets/media/images/inner-banner-element.png"
              alt=""
              className="element"
            />
            <div className="row align-items-center row-gap-3">
              <div className="col-lg-6 col-md-6">
                <h3 className="medium-black fw-700 mb-16">
                  {t("home.creativeIdeas")}
                </h3>
                <p className="text mb-16">{t("home.creativeIdeasDesc")}</p>
                <Link to="/shop" className="cus-btn">
                  <span className="btn-text">{t("common.shopNow")}</span>
                  <span>{t("common.goToShop")}</span>
                </Link>
              </div>
              <div className="col-lg-6 col-md-6">
                <div className="banner-image text-end">
                  <img
                    src="/assets/media/images/inner-banner-image.png"
                    alt=""
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* INNER BANNER END */}

      {/* BEST SELLER START */}
      <section className="best-seller-sec py-40">
        <img
          src="/assets/media/images/element-1.png"
          alt=""
          className="element-1"
        />
        <div className="container-2">
          <div
            className="heading mb-48 text-center wow fadeInUp animated"
            data-wow-delay="400ms"
          >
            <h2 className="medium-black fw-700 mb-16">
              <span className="color-primary">{t("home.bestSeller")}</span>{" "}
              {t("home.bestSellerHighlight")}
            </h2>
            <p>{t("home.bestSellerSubtitle")}</p>
          </div>
          <div className="row row-gap-4">
            {bestSellerProducts.map((prod) => (
              <div
                key={prod.id}
                className="col-xl-3 col-lg-4 col-md-6 col-sm-6"
              >
                <ProductCard
                  product={prod}
                  openCart={openCart}
                  openQuickView={openQuickView}
                  t={t}
                />
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* BEST SELLER END */}

      {/* INNER BANNER 2 START */}
      <section
        className="inner-banner-2 mt-40 wow fadeInUp animated"
        data-wow-delay="400ms"
      >
        <div className="container-2">
          <div className="row justify-content-center">
            <div className="col-lg-5">
              <div
                className="heading mb-48 text-center wow fadeInUp animated"
                data-wow-delay="400ms"
              >
                <h2 className="medium-black fw-700 mb-16">
                  <span className="color-primary">{t("home.dealOfDay")}</span>{" "}
                  {t("home.dealOfDayHighlight")}
                </h2>
                <p>{t("home.dealSubtitle")}</p>
              </div>
              <div className="coming-soon-wrapper mb-32">
                <CountdownTimer targetDate="2026/12/31" />
              </div>
              <div className="text-center">
                <Link to="/shop" className="cus-btn">
                  <span className="btn-text">{t("common.shopNow")}</span>
                  <span>{t("common.goToShop")}</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* INNER BANNER 2 END */}

      {/* BRAND SLIDER START */}
      <div
        className="brand-slider-wrapper py-80 wow fadeInUp animated"
        data-wow-delay="400ms"
      >
        <div className="container-fluid">
          <div className="brand-slider">
            <div className="brand-image">
              <img src="/assets/media/brands/brand-1.png" alt="" />
            </div>
            <div className="brand-image">
              <img src="/assets/media/brands/brand-2.png" alt="" />
            </div>
            <div className="brand-image">
              <img src="/assets/media/brands/brand-3.png" alt="" />
            </div>
            <div className="brand-image">
              <img src="/assets/media/brands/brand-4.png" alt="" />
            </div>
            <div className="brand-image">
              <img src="/assets/media/brands/brand-5.png" alt="" />
            </div>
            <div className="brand-image">
              <img src="/assets/media/brands/brand-1.png" alt="" />
            </div>
            <div className="brand-image">
              <img src="/assets/media/brands/brand-2.png" alt="" />
            </div>
            <div className="brand-image">
              <img src="/assets/media/brands/brand-3.png" alt="" />
            </div>
            <div className="brand-image">
              <img src="/assets/media/brands/brand-4.png" alt="" />
            </div>
            <div className="brand-image">
              <img src="/assets/media/brands/brand-5.png" alt="" />
            </div>
          </div>
        </div>
      </div>
      {/* BRAND SLIDER END */}

      {/* TESTIMONIALS SECTION START */}
      <section className="testimonials-sec pt-40 pb-80">
        <div className="container-2">
          <div
            className="heading mb-48 text-center wow fadeInUp animated"
            data-wow-delay="400ms"
          >
            <h2 className="medium-black fw-700 mb-16">
              {t("home.reviewsTitle")}{" "}
              <span className="color-primary">
                {t("home.reviewsHighlight")}
              </span>
            </h2>
            <p>{t("home.reviewsSubtitle")}</p>
          </div>
          <div className="row row-gap-sm-4 row-gap-3">
            {testimonials.map((test) => (
              <div
                key={test.id}
                className="col-lg-4 col-md-6 col-sm-6 wow fadeInUp animated"
                data-wow-delay={test.delay}
              >
                <div className="testimonials-block p-24 bg-sec br-12">
                  <div className="rating-star mb-16">
                    <h6 className="color-star">★★★★★</h6>
                  </div>
                  <p className="mb-24">{test.text}</p>
                  <p className="fw-600 medium-black">{test.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* TESTIMONIALS SECTION END */}

      {/* BLOG SECTION START */}
      <section className="blog-section pt-80 pb-40">
        <div className="container-2">
          <div
            className="heading mb-48 text-center wow fadeInUp animated"
            data-wow-delay="400ms"
          >
            <h2 className="medium-black fw-700 mb-16">
              {t("home.latestArticles")}{" "}
              <span className="color-primary">
                {t("home.latestArticlesHighlight")}
              </span>
            </h2>
            <p>{t("home.latestArticlesSubtitle")}</p>
          </div>
          <div className="row row-gap-4 mb-48">
            {blogs.map((b) => (
              <div
                key={b.id}
                className="col-lg-4 col-md-6 col-sm-6 wow fadeInUp animated"
                data-wow-delay={b.delay}
              >
                <div className="blog-card">
                  <Link to="/blog-detail.html" className="blog-image mb-8">
                    <img src={b.image} alt="" />
                  </Link>
                  <div className="blog-text">
                    <p className="subtitle mb-16 fw-500 light-gray">{b.date}</p>
                    <Link
                      to="/blog-detail.html"
                      className="h5 fw-700 font-sec mb-8"
                    >
                      {b.title}
                    </Link>
                    <p className="mb-24">{b.desc}</p>
                    <Link
                      to="/blog-detail.html"
                      className="medium-black fw-700 font-sec text-decoration-underline"
                    >
                      {t("common.readMore")}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* BLOG SECTION END */}
    </>
  );
};

export default Home;
