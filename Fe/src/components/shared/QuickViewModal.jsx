// Migrated from: index.html, lines 3380-3502
// HTML->JSX conversion: class -> className, input self-closing, quantity handling, modal show state, i18n support
import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCartContext } from "../../providers/CartContext";

export const QuickViewModal = () => {
  const { quickViewProduct, closeQuickView } = useCartContext();
  const { t } = useTranslation();
  const [quantity, setQuantity] = useState(1);

  if (!quickViewProduct) return null;

  return (
    <>
      <div
        className="modal fade show"
        id="productQuickView"
        tabIndex="-1"
        style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
        onClick={closeQuickView}
      >
        <div
          className="modal-dialog"
          style={{ maxWidth: "900px", margin: "1.75rem auto" }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-content">
            <div className="modal-body">
              <div className="shop-detail">
                <div className="detail-wrapper">
                  <div className="row row-gap-4">
                    <div className="col-lg-6">
                      <div className="quick-image-box">
                        <img
                          src={
                            quickViewProduct.image ||
                            "assets/media/products/large-image-1.png"
                          }
                          alt=""
                        />
                      </div>
                    </div>
                    <div className="col-lg-6">
                      <div className="product-text-container bg-white br-20">
                        <div className="close-content text-end">
                          <button
                            type="button"
                            className="btn-close"
                            aria-label="Close"
                            onClick={closeQuickView}
                          ></button>
                        </div>
                        <h4 className="medium-black fw-700 mb-16">
                          {quickViewProduct.title || "Hardcover Notebook"}
                        </h4>
                        <div className="d-flex align-items-center flex-wrap gap-8 mb-16">
                          <h6 className="color-star">★★★★★</h6>
                          <p className="dark-gray subtitle">
                            (02 {t("common.reviews")})
                          </p>
                        </div>
                        <div className="d-flex align-items-center justify-content-between mb-24">
                          <div className="d-flex align-items-center gap-16">
                            <h5 className="fw-600 color-primary">
                              {quickViewProduct.price || "$180.00"}
                            </h5>
                            <p className="fw-500">
                              {quickViewProduct.oldPrice || "$200.00"}
                            </p>
                          </div>
                        </div>
                        <p className="mb-24">{t("footer.desc")}</p>
                        <p className="subtitle color-primary mb-24">
                          40 {t("common.inStock")}
                        </p>
                        <div className="function-bar mb-24">
                          <div className="quantity quantity-wrap">
                            <div className="input-area quantity-wrap">
                              <input
                                className="decrement"
                                type="button"
                                value="-"
                                onClick={() =>
                                  setQuantity((q) => Math.max(1, q - 1))
                                }
                              />
                              <input
                                type="text"
                                name="quantity"
                                value={quantity}
                                readOnly
                                maxLength={2}
                                size={1}
                                className="number"
                              />
                              <input
                                className="increment"
                                type="button"
                                value="+"
                                onClick={() => setQuantity((q) => q + 1)}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="d-flex align-items-center gap-12 mb-24">
                          <p className="fw-600 medium-black">
                            {t("common.subtotal")}:
                          </p>
                          <p>$180.00</p>
                        </div>
                        <div className="row mb-24 row-gap-2">
                          <div className="col-md-6">
                            <Link
                              to="/cart.html"
                              className="cus-btn w-100 text-center"
                              onClick={closeQuickView}
                            >
                              <span className="btn-text">
                                {t("common.addCart")}
                              </span>
                              <span>{t("common.goToCart")}</span>
                            </Link>
                          </div>
                          <div className="col-md-6">
                            <Link
                              to="/checkout.html"
                              className="cus-btn-2 btn-sec w-100 text-center"
                              onClick={closeQuickView}
                            >
                              <span className="btn-text">
                                {t("productDetail.buyNow")}
                              </span>
                              <span>{t("common.checkout")}</span>
                            </Link>
                          </div>
                        </div>
                        <div className="d-sm-flex d-none align-items-center gap-12 mb-16">
                          <p className="fw-600 medium-black">
                            {t("common.sku")}:
                          </p>
                          <p>AF-001-KT</p>
                        </div>
                        <div className="d-sm-flex d-none align-items-center gap-12 mb-16">
                          <p className="fw-600 medium-black">
                            {t("common.categories")}:
                          </p>
                          <p>Notebook</p>
                        </div>
                        <div className="d-sm-flex d-none align-items-center gap-12 mb-16">
                          <p className="fw-600 medium-black">
                            {t("productDetail.freeShipping")}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default QuickViewModal;
