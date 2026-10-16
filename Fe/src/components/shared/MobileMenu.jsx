// Migrated from: index.html, lines 3241-3270; assets/js/app.js lines 139-174
// HTML->JSX conversion: class -> className, Link integration, sub-menu accordion state, i18n support
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useAuth } from "../../providers/AuthContext";
import { useCartContext } from "../../providers/CartContext";
import LanguageSwitcher from "../ui/LanguageSwitcher";

export const MobileMenu = () => {
  const { isMobileMenuOpen, closeMobileMenu } = useCartContext();
  const { user, isAdmin, openAuthModal, logout } = useAuth();
  const { t } = useTranslation();
  const [expandedSubMenu, setExpandedSubMenu] = useState(false);

  const toggleSubMenu = (e) => {
    e.preventDefault();
    setExpandedSubMenu((prev) => !prev);
  };

  return (
    <div
      className={`mobile-nav__wrapper ${isMobileMenuOpen ? "expanded" : ""}`}
    >
      <div
        className="mobile-nav__overlay mobile-nav__toggler"
        onClick={closeMobileMenu}
      ></div>
      <div className="mobile-nav__content">
        <span
          className="mobile-nav__close mobile-nav__toggler"
          onClick={closeMobileMenu}
        >
          <i className="fa fa-times"></i>
        </span>
        <div className="logo-box">
          <Link to="/" aria-label="logo image" onClick={closeMobileMenu}>
            <img src="/assets/media/logo.png" alt="" />
          </Link>
        </div>
        <div className="mobile-nav__container">
          <div className="main-menu__nav">
            <ul className="main-menu__list">
              <li className="dropdown">
                <Link to="/" onClick={closeMobileMenu} className="active">
                  {t("header.home")}
                </Link>
              </li>
              <li>
                <Link to="/shop" onClick={closeMobileMenu}>
                  {t("header.categories")}
                </Link>
              </li>
              <li className={`dropdown ${expandedSubMenu ? "expanded" : ""}`}>
                <Link to="/shop" onClick={closeMobileMenu}>
                  {t("header.shop")}
                </Link>
                <button
                  type="button"
                  aria-label={t("header.shop")}
                  className={expandedSubMenu ? "expanded" : ""}
                  onClick={toggleSubMenu}
                  style={{
                    background: "none",
                    border: "none",
                    marginLeft: "8px",
                  }}
                >
                  <i className="fa fa-angle-down"></i>
                </button>
                <ul
                  className="sub-menu"
                  style={{ display: expandedSubMenu ? "block" : "none" }}
                >
                  <li>
                    <Link
                      to="/shop"
                      onClick={closeMobileMenu}
                    >
                      {t("header.shopGrid")}
                    </Link>
                  </li>
                  <li>
                    <Link to="/cart" onClick={closeMobileMenu}>
                      {t("header.cart")}
                    </Link>
                  </li>
                  <li>
                    <Link to="/checkout" onClick={closeMobileMenu}>
                      {t("header.checkout")}
                    </Link>
                  </li>
                </ul>
              </li>
              <li>
                <Link to="/shop" onClick={closeMobileMenu}>
                  {t("header.brands")}
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="px-3 mb-3">
          {user ? (
            <div className="bg-white p-3 rounded br-10 mb-2 border">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="fw-600 fs-14">{user.fullName}</span>
                <span
                  className={`user-role-badge ${
                    isAdmin ? "user-role-admin" : "user-role-patient"
                  }`}
                >
                  {isAdmin ? t("header.roleAdmin") : t("header.roleCustomer")}
                </span>
              </div>
              <div className="fs-13 text-muted mb-2">{user.email}</div>
              {isAdmin && (
                <Link
                  to="/admin"
                  className="btn btn-sm btn-outline-danger w-100 mb-2"
                  onClick={closeMobileMenu}
                >
                  <i className="fa-solid fa-gauge-high me-1"></i> {t("header.adminDashboard")}
                </Link>
              )}
              <button
                type="button"
                className="btn btn-sm btn-light w-100 text-danger"
                onClick={() => {
                  logout();
                  closeMobileMenu();
                }}
              >
                <i className="fa-solid fa-arrow-right-from-bracket me-1"></i>{" "}
                {t("header.signOut")}
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="cus-btn w-100 text-center mb-2 border-0"
              onClick={() => {
                closeMobileMenu();
                openAuthModal("login");
              }}
            >
              <span className="btn-text">{t("header.signIn")} / {t("header.register")}</span>
              <span>{t("header.signIn")} / {t("header.register")}</span>
            </button>
          )}
          <LanguageSwitcher />
        </div>
        <ul className="mobile-nav__contact list-unstyled">
          <li>
            <i className="fas fa-envelope"></i>
            <a href="mailto:example@company.com">example@company.com</a>
          </li>
          <li>
            <i className="fa fa-phone-alt"></i>
            <a href="tel:+12345678">+123 (4567) -890</a>
          </li>
        </ul>
        <div className="mobile-nav__social">
          <a href="https://twitter.com" target="_blank" rel="noreferrer">
            <i className="fa-brands fa-x-twitter"></i>
          </a>
          <a href="https://facebook.com" target="_blank" rel="noreferrer">
            <i className="fab fa-facebook"></i>
          </a>
          <a href="https://instagram.com" target="_blank" rel="noreferrer">
            <i className="fab fa-instagram"></i>
          </a>
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;
