// Migrated from: cart.html, lines 200-630
// HTML->JSX conversion: class -> className, for -> htmlFor, img / input self-closing, quantity handlers, Link integration, i18n support
import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import TitleBanner from "../../components/shared/TitleBanner";

export const Cart = () => {
  const { t } = useTranslation();
  const [items, setItems] = useState([
    {
      id: 1,
      title: "Hardcover Notebook",
      price: 85.0,
      quantity: 1,
      image: "assets/media/products/nav-image-1.png",
      boxId: "box1",
    },
    {
      id: 2,
      title: "Classic Ballpoint Pens",
      price: 15.0,
      quantity: 1,
      image: "assets/media/products/nav-image-2.png",
      boxId: "box2",
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

  const handleRemove = (id, e) => {
    if (e) e.preventDefault();
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const delivery = items.length > 0 ? 5.0 : 0;
  const discount = items.length > 0 ? 5.0 : 0;
  const total = Math.max(0, subtotal + delivery - discount);

  return (
    <>
      <TitleBanner title={t("cart.title")} />
      <section className="cart py-40">
        <div className="container-2">
          <div className="row row-gap-4">
            <div className="col-xl-8">
              <div className="d-lg-block d-none">
                <table className="cart-table mb-16">
                  <thead>
                    <tr>
                      <th>{t("cart.products")}</th>
                      <th>{t("cart.price")}</th>
                      <th>{t("cart.quantity")}</th>
                      <th>{t("cart.subtotal")}</th>
                    </tr>
                  </thead>
                </table>
                {items.map((item) => (
                  <table key={item.id} className="cart-table">
                    <tbody>
                      <tr className="table-row">
                        <td className="pd">
                          <div className="product-detail-box">
                            <div className="cus-checkBox">
                              <input type="checkbox" id={item.boxId} />
                              <label
                                htmlFor={item.boxId}
                                className="light-gray"
                              ></label>
                            </div>
                            <a
                              href="#remove"
                              className="h5 dark-black"
                              onClick={(e) => handleRemove(item.id, e)}
                            >
                              <i className="fal fa-times"></i>
                            </a>
                            <div className="img-block">
                              <Link to="/product-detail.html">
                                <img src={item.image} alt="" />
                              </Link>
                            </div>
                            <div className="d-block text-start">
                              <h6>
                                <Link
                                  to="/product-detail.html"
                                  className="fw-600 medium-black"
                                >
                                  {item.title}
                                </Link>
                              </h6>
                            </div>
                          </div>
                        </td>
                        <td>
                          <p className="fw-500">${item.price.toFixed(2)}</p>
                        </td>
                        <td>
                          <div className="quantity quantity-wrap">
                            <div className="input-area quantity-wrap">
                              <button
                                className="decrement"
                                type="button"
                                onClick={() => handleDecrement(item.id)}
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
                                value={item.quantity}
                                readOnly
                                maxLength={2}
                                size={1}
                                className="number"
                              />
                              <button
                                className="increment"
                                type="button"
                                onClick={() => handleIncrement(item.id)}
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
                        </td>
                        <td>
                          <h6 className="color-primary fw-600">
                            ${(item.price * item.quantity).toFixed(2)}
                          </h6>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                ))}
              </div>

              {/* Mobile cart items */}
              <div className="d-lg-none d-block">
                <div className="row row-gap-3">
                  {items.map((item) => (
                    <div key={item.id} className="col-md-6">
                      <div className="card-item bg-semi-white br-20 p-24">
                        <div className="d-flex align-items-center justify-content-between mb-16">
                          <div className="cus-checkBox">
                            <input
                              type="checkbox"
                              id={`mobile_${item.boxId}`}
                            />
                            <label
                              htmlFor={`mobile_${item.boxId}`}
                              className="light-gray"
                            ></label>
                          </div>
                          <a
                            href="#remove"
                            className="h5 dark-black"
                            onClick={(e) => handleRemove(item.id, e)}
                          >
                            <i className="fal fa-times"></i>
                          </a>
                        </div>
                        <div className="img-block mb-16">
                          <Link to="/product-detail.html">
                            <img src={item.image} alt="" />
                          </Link>
                        </div>
                        <h6 className="mb-16">
                          <Link
                            to="/product-detail.html"
                            className="fw-600 medium-black"
                          >
                            {item.title}
                          </Link>
                        </h6>
                        <ul className="list-unstyled p-0 m-0 d-flex flex-column gap-12">
                          <li className="d-flex justify-content-between align-items-center">
                            <span className="font-primary">
                              {t("cart.price")}
                            </span>
                            <h6 className="font-primary">
                              ${item.price.toFixed(2)}
                            </h6>
                          </li>
                          <li className="d-flex justify-content-between align-items-center">
                            <span className="font-primary">
                              {t("cart.quantity")}
                            </span>
                            <div className="quantity quantity-wrap">
                              <div className="input-area quantity-wrap">
                                <button
                                  className="decrement"
                                  type="button"
                                  onClick={() => handleDecrement(item.id)}
                                >
                                  -
                                </button>
                                <input
                                  type="text"
                                  name="quantity"
                                  value={item.quantity}
                                  readOnly
                                  maxLength={2}
                                  size={1}
                                  className="number"
                                />
                                <button
                                  className="increment"
                                  type="button"
                                  onClick={() => handleIncrement(item.id)}
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          </li>
                          <li className="d-flex justify-content-between align-items-center">
                            <span>{t("cart.subtotal")}</span>
                            <h6 className="color-primary">
                              ${(item.price * item.quantity).toFixed(2)}
                            </h6>
                          </li>
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="table-bottom-row bg-white">
                <Link to="/shop-grid-sidebar.html" className="cus-btn">
                  <span className="text-btn">{t("common.goToShop")}</span>
                  <span>{t("common.goToShop")}</span>
                </Link>
                <form
                  action="#"
                  method="post"
                  className="contact-form d-flex align-items-center gap-16"
                  onSubmit={(e) => e.preventDefault()}
                >
                  <input
                    type="text"
                    className="form-control"
                    placeholder={t("cart.couponCode")}
                    name="code"
                    id="cpCode"
                  />
                  <button type="submit" className="cus-btn border-0">
                    <span className="text-btn">{t("cart.applyCoupon")}</span>
                    <span>{t("cart.applyCoupon")}</span>
                  </button>
                </form>
              </div>
            </div>

            <div className="col-xl-4">
              <div className="checkout-box bg-semi-white">
                <div className="checkout-title mb-16">
                  <h6 className="fw-500 font-primary medium-black">
                    {t("cart.cartTotals")}
                  </h6>
                </div>
                <div className="bottom-box">
                  <div className="title-price mb-16">
                    <h6 className="font-sec fw-600 medium-black">
                      {t("cart.subtotal")}
                    </h6>
                    <p className="light-gray">${subtotal.toFixed(2)}</p>
                  </div>
                  <div className="hr-line mb-16"></div>
                  <div className="title-price mb-16">
                    <h6 className="font-sec fw-600 medium-black">
                      {t("cart.delivery")}
                    </h6>
                    <p className="light-gray">${delivery.toFixed(2)}</p>
                  </div>
                  <div className="hr-line mb-16"></div>
                  <div className="title-price mb-32">
                    <h6 className="font-sec fw-600 medium-black">
                      {t("cart.discount")}
                    </h6>
                    <p className="light-gray">-${discount.toFixed(2)}</p>
                  </div>
                  <div className="hr-line mb-24"></div>
                  <div className="title-price mb-32">
                    <h5 className="font-sec fw-700 medium-black">
                      {t("common.total")}
                    </h5>
                    <h5 className="font-sec fw-700 color-primary">
                      ${total.toFixed(2)}
                    </h5>
                  </div>
                  <Link
                    to="/checkout.html"
                    className="cus-btn w-100 text-center"
                  >
                    <span className="text-btn">
                      {t("cart.proceedToCheckout")}
                    </span>
                    <span>{t("cart.proceedToCheckout")}</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Cart;
