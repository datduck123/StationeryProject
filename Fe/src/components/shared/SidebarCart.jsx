// Migrated from: index.html, lines 3273-3377; assets/js/app.js lines 430-445
// HTML->JSX conversion: class -> className, input self-closing, quantity handlers, Link integration, i18n support
import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCartContext } from "../../providers/CartContext";

export const SidebarCart = () => {
  const { isCartOpen, closeCart } = useCartContext();
  const { t } = useTranslation();

  const [items, setItems] = useState([
    {
      id: 1,
      title: "Daily Planner Pro",
      image: "/assets/media/products/product-1.png",
      price: 30.0,
      quantity: 5,
    },
    {
      id: 2,
      title: "Brownies",
      image: "/assets/media/products/product-2.png",
      price: 12.0,
      quantity: 3,
    },
  ]);

  const handleDecrement = (id) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity - 1) }
          : item,
      ),
    );
  };

  const handleIncrement = (id) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item,
      ),
    );
  };

  const handleRemove = (id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const subtotal = items.reduce(
    (acc, curr) => acc + curr.price * curr.quantity,
    0,
  );

  return (
    <>
      <aside
        id="sidebar-cart"
        style={{
          right: isCartOpen ? "0" : "-101%",
          transition: "right 0.3s ease-in-out",
        }}
      >
        <div className="title-cart-block mb-32 bg-lightest-gray">
          <h6 className="fw-500 black">
            {t("modals.shoppingCart")} (
            {items.length < 10 ? `0${items.length}` : items.length})
          </h6>
          <a
            href="#close"
            className="close-button close-popup"
            onClick={closeCart}
          >
            <span className="close-icon">X</span>
          </a>
        </div>
        <ul className="product-list p-24">
          {items.map((item) => (
            <li key={item.id} className="product-item mb-24">
              <div className="d-flex align-items-center gap-12">
                <div className="item-image">
                  <img src={item.image} alt="Product Photo" />
                </div>
                <div className="prod-title">
                  <Link
                    to="/product-detail.html"
                    className="h6 medium-black font-sec fw-700 mb-8"
                    onClick={closeCart}
                  >
                    {item.title}
                  </Link>
                  <p className="subtitle mb-4p">
                    {t("common.quantity")}: {item.quantity}
                  </p>
                  <p className="subtitle">${item.price.toFixed(2)}</p>
                </div>
              </div>
              <div className="text-end">
                <a
                  href="#remove"
                  className="cancel mb-12"
                  onClick={(e) => {
                    e.preventDefault();
                    handleRemove(item.id);
                  }}
                >
                  <img src="/assets/media/icons/cancel.png" alt="" />
                </a>
                <div className="quantity quantity-wrap">
                  <div className="input-area quantity-wrap">
                    <input
                      className="decrement"
                      type="button"
                      value="-"
                      onClick={() => handleDecrement(item.id)}
                    />
                    <input
                      type="text"
                      name="quantity"
                      value={item.quantity}
                      readOnly
                      maxLength={2}
                      size={1}
                      className="number"
                    />
                    <input
                      className="increment"
                      type="button"
                      value="+"
                      onClick={() => handleIncrement(item.id)}
                    />
                  </div>
                </div>
              </div>
            </li>
          ))}
          <li className="hr-line mb-24"></li>
        </ul>
        <div className="price-total p-24">
          <span className="h6 fw-700 medium-black">{t("common.subtotal")}</span>
          <span className="h6 fw-700 medium-black">${subtotal.toFixed(2)}</span>
        </div>
        <div className="hr-line mb-24"></div>
        <div className="row row-gap-2 p-24">
          <div className="col-lg-6">
            <Link
              to="/cart.html"
              className="cus-btn w-100 text-center"
              onClick={closeCart}
            >
              <span className="btn-text">{t("common.addCart")}</span>
              <span>{t("common.goToCart")}</span>
            </Link>
          </div>
          <div className="col-lg-6">
            <Link
              to="/checkout.html"
              className="cus-btn-2 btn-sec w-100 text-center"
              onClick={closeCart}
            >
              <span className="btn-text">{t("header.checkout")}</span>
              <span>{t("header.checkout")}</span>
            </Link>
          </div>
        </div>
      </aside>
      <div
        id="sidebar-cart-curtain"
        className="close-popup"
        onClick={closeCart}
        style={{
          display: isCartOpen ? "block" : "none",
          opacity: isCartOpen ? 1 : 0,
          transition: "opacity 0.2s ease-in-out",
        }}
      ></div>
    </>
  );
};

export default SidebarCart;
