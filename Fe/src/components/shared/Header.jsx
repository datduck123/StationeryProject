// Migrated from: index.html, lines 57-194; cart.html lines 55-197
// HTML->JSX conversion: class -> className, for -> htmlFor, img self-closing, Link integration, i18n support
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import { useStickyHeader } from "../../hooks/useStickyHeader";
import { useAuth } from "../../providers/AuthContext";
import { useCartContext } from "../../providers/CartContext";
import LanguageSwitcher from "../ui/LanguageSwitcher";

export const Header = () => {
  const { openCart, toggleMobileMenu } = useCartContext();
  const { user, isAdmin, openAuthModal, logout } = useAuth();
  const { t } = useTranslation();
  const isSticky = useStickyHeader(130);
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const isCurrent = (path) => {
    return (
      location.pathname === path ||
      (path === "/" && location.pathname === "/index.html")
    );
  };

  const handleUserClick = (e) => {
    e.preventDefault();
    if (user) {
      setShowUserMenu((prev) => !prev);
    } else {
      openAuthModal("login");
    }
  };

  return (
    <header
      className={`bg-sec ${isSticky ? "stricked-menu stricky-fixed" : ""}`}
    >
      <div className="container-2">
        <div className="header-top row align-items-center row-gap-sm-2 row-gap-3">
          <div className="col-lg-4 d-lg-block d-none">
            <div className="our-number">
              <p className="fw-500 medium-black">{t("header.needHelp")}</p>
              <p className="fw-700 color-primary">+1834 123 456 789</p>
            </div>
          </div>
          <div className="col-lg-4 col-md-6 col-sm-5 col-6">
            <div className="text-start text-lg-center">
              <Link to="/" className="header-logo">
                <img src="assets/media/logo.png" alt="" />
              </Link>
            </div>
          </div>

          <div className="col-lg-4 col-md-6 col-6">
            <div className="header-end">
              <div className="header-buttons d-flex align-items-center">
                <div className="user-menu-wrapper" ref={userMenuRef}>
                  <button
                    type="button"
                    className="button-block border-0 bg-transparent p-0"
                    onClick={handleUserClick}
                    aria-label={user ? "User Menu" : "Sign In / Register"}
                    title={
                      user
                        ? `${user.fullName} (${user.role})`
                        : "Sign In / Register"
                    }
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="19"
                      height="18"
                      viewBox="0 0 19 18"
                      fill="none"
                    >
                      <path
                        d="M9.71387 0C7.09687 0 4.96777 2.1291 4.96777 4.74609C4.96777 7.36309 7.09687 9.49219 9.71387 9.49219C12.3309 9.49219 14.46 7.36309 14.46 4.74609C14.46 2.1291 12.3309 0 9.71387 0ZM9.71387 8.4375C7.67843 8.4375 6.02246 6.78154 6.02246 4.74609C6.02246 2.71065 7.67843 1.05469 9.71387 1.05469C11.7493 1.05469 13.4053 2.71065 13.4053 4.74609C13.4053 6.78154 11.7493 8.4375 9.71387 8.4375Z"
                        fill={user ? "#e9613f" : "#1E1F20"}
                      />
                      <path
                        d="M15.6189 12.5928C14.3195 11.2734 12.597 10.5469 10.7686 10.5469H8.65918C6.83077 10.5469 5.10819 11.2734 3.80881 12.5928C2.5158 13.9057 1.80371 15.6387 1.80371 17.4727C1.80371 17.7639 2.03982 18 2.33105 18H17.0967C17.3879 18 17.624 17.7639 17.624 17.4727C17.624 15.6387 16.9119 13.9057 15.6189 12.5928ZM2.8816 16.9453C3.1458 13.954 5.63613 11.6016 8.65918 11.6016H10.7686C13.7916 11.6016 16.2819 13.954 16.5461 16.9453H2.8816Z"
                        fill={user ? "#e9613f" : "#1E1F20"}
                      />
                    </svg>
                  </button>

                  {/* Logged in User Menu Dropdown */}
                  {user && showUserMenu && (
                    <div className="user-menu-dropdown">
                      <div className="user-menu-header">
                        <div className="user-menu-name">
                          {user.fullName || "User"}
                        </div>
                        <div className="user-menu-email">{user.email}</div>
                        <span
                          className={`user-role-badge ${
                            isAdmin ? "user-role-admin" : "user-role-patient"
                          }`}
                        >
                          {isAdmin ? "Admin" : "Patient"}
                        </span>
                      </div>
                      {isAdmin && (
                        <Link
                          to="/admin"
                          className="user-menu-item"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <i className="fa-solid fa-gauge-high color-primary"></i>
                          <span>Admin Dashboard</span>
                        </Link>
                      )}
                      <button
                        type="button"
                        className="user-menu-item text-danger"
                        onClick={() => {
                          logout();
                          setShowUserMenu(false);
                        }}
                      >
                        <i className="fa-solid fa-arrow-right-from-bracket"></i>
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
                <LanguageSwitcher className="mx-2" />
                <a
                  href="#sidebar-cart"
                  className="button-block cart-button"
                  onClick={openCart}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="19"
                    height="18"
                    viewBox="0 0 19 18"
                    fill="none"
                  >
                    <path
                      d="M17.486 16.1063C17.0463 13.0299 15.9738 5.52124 15.9738 5.52124C15.9366 5.26112 15.7138 5.06792 15.4511 5.06792H13.1514V3.33377C12.9821 -1.11295 6.60775 -1.10957 6.4401 3.33377V5.06792H4.14048C3.87772 5.06792 3.65498 5.26112 3.61781 5.52124C3.61781 5.52124 2.54527 13.0299 2.1056 16.1063C2.03749 16.5828 2.17934 17.0645 2.49469 17.428C2.81003 17.7915 3.26685 18 3.74801 18H15.8436C16.3247 18 16.7815 17.7915 17.0969 17.428C17.4122 17.0646 17.5541 16.5828 17.486 16.1063ZM7.4961 3.33377C7.61208 0.286388 11.9805 0.288675 12.0954 3.33377V5.06792H7.4961V3.33377ZM16.2993 16.736C16.1845 16.8682 16.0184 16.944 15.8436 16.944H3.74801C3.57308 16.944 3.40701 16.8682 3.29233 16.736C3.17772 16.6039 3.12619 16.4289 3.15094 16.2557C3.52566 13.6339 4.36002 7.79284 4.59842 6.12389H6.44014V7.29249C6.46611 7.99228 7.47037 7.99175 7.4961 7.29249V6.12389H12.0954V7.29249C12.1214 7.99228 13.1257 7.99175 13.1514 7.29249V6.12389H14.9932C15.2316 7.79284 16.066 13.6339 16.4406 16.2557C16.4654 16.4289 16.4138 16.6039 16.2993 16.736Z"
                      fill="#1E1F20"
                    />
                  </svg>
                </a>
              </div>

              <a
                href="#mobile-menu"
                className="main-menu__toggler mobile-nav__toggler d-lg-none"
                onClick={toggleMobileMenu}
                aria-label="Toggle mobile menu"
              >
                <img src="assets/media/icons/menu-2.png" alt="" />
              </a>
            </div>
          </div>
        </div>
      </div>
      <div className="header-center">
        <div className="container-2">
          <div className="row align-items-center justify-content-between">
            <div className="col-lg-6 d-lg-flex d-none">
              <nav className="navigation d-flex align-items-center">
                <div className="menu-button-right">
                  <div className="main-menu__nav">
                    <ul className="main-menu__list">
                      <li
                        className={`dropdown ${isCurrent("/") ? "current" : ""}`}
                      >
                        <Link to="/" className={isCurrent("/") ? "active" : ""}>
                          {t("header.home")}
                          <i className="fa-light fa-chevron-down d-lg-block d-none"></i>
                        </Link>
                      </li>
                      <li>
                        <Link to="/shop-grid-sidebar.html">
                          {t("header.categories")}
                        </Link>
                      </li>
                      <li
                        className={`dropdown ${isCurrent("/shop-grid-sidebar.html") || isCurrent("/product-detail.html") || isCurrent("/cart.html") || isCurrent("/checkout.html") ? "current" : ""}`}
                      >
                        <Link to="/shop-grid-sidebar.html">
                          {t("header.shop")}
                          <i className="fa-light fa-chevron-down d-lg-block d-none"></i>
                        </Link>
                        <ul className="sub-menu">
                          <li>
                            <Link to="/shop-grid-sidebar.html">
                              {t("header.shopGrid")}
                            </Link>
                          </li>
                          <li>
                            <Link to="/product-detail.html">
                              {t("header.productDetail")}
                            </Link>
                          </li>
                          <li>
                            <Link to="/cart.html">{t("header.cart")}</Link>
                          </li>
                          <li>
                            <Link to="/checkout.html">
                              {t("header.checkout")}
                            </Link>
                          </li>
                        </ul>
                      </li>
                      <li>
                        <Link to="/shop-grid-sidebar.html">
                          {t("header.brands")}
                        </Link>
                      </li>
                    </ul>
                  </div>
                </div>
              </nav>
            </div>
            <div className="col-xl-3 col-lg-5 col-md-12 order-lg-3 order-3">
              <form action="#" onSubmit={(e) => e.preventDefault()}>
                <div className="search-block">
                  <input
                    type="search"
                    className="input-search form-control"
                    name="search"
                    id="search"
                    placeholder={t("header.searchPlaceholder")}
                  />
                  <button
                    type="submit"
                    id="magnifying-btn"
                    className="button-block"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                    >
                      <path
                        d="M8.11719 0C12.593 0 16.2344 3.64137 16.2344 8.11719C16.2344 10.1445 15.4873 12.0007 14.2539 13.4247L19.8284 18.9998C20.0572 19.2286 20.0572 19.5996 19.8284 19.8284C19.5995 20.0573 19.2286 20.0572 18.9997 19.8284L13.4254 14.2534C12.0012 15.4871 10.1448 16.2344 8.11719 16.2344C3.64137 16.2344 0 12.593 0 8.11719C0 3.64137 3.64137 0 8.11719 0ZM8.11719 15.0625C11.9469 15.0625 15.0625 11.9468 15.0625 8.11719C15.0625 4.28754 11.9468 1.17188 8.11719 1.17188C4.28754 1.17188 1.17188 4.28754 1.17188 8.11719C1.17188 11.9468 4.28754 15.0625 8.11719 15.0625Z"
                        fill="white"
                      />
                    </svg>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
