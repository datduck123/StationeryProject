// Migrated from: index.html, lines 3241-3270; assets/js/app.js lines 139-174
// HTML->JSX conversion: class -> className, Link integration, sub-menu accordion state, i18n support
import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCartContext } from "../../providers/CartContext";
import LanguageSwitcher from "../ui/LanguageSwitcher";

export const MobileMenu = () => {
  const { isMobileMenuOpen, closeMobileMenu } = useCartContext();
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
            <img src="assets/media/logo.png" alt="" />
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
                <Link to="/shop-grid-sidebar.html" onClick={closeMobileMenu}>
                  {t("header.categories")}
                </Link>
              </li>
              <li className={`dropdown ${expandedSubMenu ? "expanded" : ""}`}>
                <Link to="/shop-grid-sidebar.html" onClick={closeMobileMenu}>
                  {t("header.shop")}
                </Link>
                <button
                  type="button"
                  aria-label="dropdown toggler"
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
                      to="/shop-grid-sidebar.html"
                      onClick={closeMobileMenu}
                    >
                      {t("header.shopGrid")}
                    </Link>
                  </li>
                  <li>
                    <Link to="/product-detail.html" onClick={closeMobileMenu}>
                      {t("header.productDetail")}
                    </Link>
                  </li>
                  <li>
                    <Link to="/cart.html" onClick={closeMobileMenu}>
                      {t("header.cart")}
                    </Link>
                  </li>
                  <li>
                    <Link to="/checkout.html" onClick={closeMobileMenu}>
                      {t("header.checkout")}
                    </Link>
                  </li>
                </ul>
              </li>
              <li>
                <Link to="/shop-grid-sidebar.html" onClick={closeMobileMenu}>
                  {t("header.brands")}
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="px-3 mb-3">
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
