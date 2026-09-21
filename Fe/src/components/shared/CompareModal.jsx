// Migrated from: index.html, lines 3505-3664
// HTML->JSX conversion: class -> className, th/td self-contained, modal show state, i18n support
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCartContext } from "../../providers/CartContext";

export const CompareModal = () => {
  const { isCompareOpen, closeCompare } = useCartContext();
  const { t } = useTranslation();

  if (!isCompareOpen) return null;

  return (
    <div
      className="modal fade show"
      id="comparepopup"
      tabIndex="-1"
      style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={closeCompare}
    >
      <div
        className="modal-dialog compare-dialog"
        style={{ maxWidth: "1100px", margin: "1.75rem auto" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content">
          <div className="modal-body">
            <div className="zui-wrapper">
              <div className="close-content text-end">
                <button
                  type="button"
                  className="btn-close"
                  aria-label="Close"
                  onClick={closeCompare}
                ></button>
              </div>
              <div id="container" className="zui-scroller">
                <table className="zui-table">
                  <thead>
                    <tr>
                      <th className="zui-sticky-col">&nbsp;</th>
                      <th id="product-col" className="table-col">
                        <img
                          className="product-img mb-16"
                          src="assets/media/products/product-1.png"
                          alt=""
                        />
                        <span className="h6">
                          <Link
                            to="/product-detail.html"
                            className="product-link"
                            onClick={closeCompare}
                          >
                            Daily Planner Pro
                          </Link>
                        </span>
                      </th>
                      <th className="table-col">
                        <img
                          className="product-img mb-16"
                          src="assets/media/products/product-2.png"
                          alt=""
                        />
                        <span className="h6">
                          <Link
                            to="/product-detail.html"
                            className="product-link"
                            onClick={closeCompare}
                          >
                            SmoothFlow Pens
                          </Link>
                        </span>
                      </th>
                      <th className="table-col">
                        <img
                          className="product-img mb-16"
                          src="assets/media/products/product-3.png"
                          alt=""
                        />
                        <span className="h6">
                          <Link
                            to="/product-detail.html"
                            className="product-link"
                            onClick={closeCompare}
                          >
                            Premium Bags
                          </Link>
                        </span>
                      </th>
                      <th className="table-col">
                        <img
                          className="product-img mb-16"
                          src="assets/media/products/product-4.png"
                          alt=""
                        />
                        <span className="h6">
                          <Link
                            to="/product-detail.html"
                            className="product-link"
                            onClick={closeCompare}
                          >
                            Premium Letter Paper
                          </Link>
                        </span>
                      </th>
                      <th className="table-col">
                        <img
                          className="product-img mb-16"
                          src="assets/media/products/product-5.png"
                          alt=""
                        />
                        <span className="h6">
                          <Link
                            to="/product-detail.html"
                            className="product-link"
                            onClick={closeCompare}
                          >
                            Classic Ballpoint Pens
                          </Link>
                        </span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="zui-sticky-col">{t("common.price")}</td>
                      <td className="text-center">
                        <strong>$2500.00</strong>
                      </td>
                      <td className="text-center">
                        <strong>$2400.00</strong>
                      </td>
                      <td className="text-center">
                        <strong>$3600.00</strong>
                      </td>
                      <td className="text-center">
                        <strong>$2500.00</strong>
                      </td>
                      <td className="text-center">
                        <strong>$2150.00</strong>
                      </td>
                    </tr>
                    <tr>
                      <td className="zui-sticky-col zui-stripe-row">
                        {t("productDetail.description")}
                      </td>
                      <td>AS4500</td>
                      <td>AS8500</td>
                      <td>AS6000</td>
                      <td>AS4600</td>
                      <td>AS1000</td>
                    </tr>
                    <tr>
                      <td className="zui-sticky-col">Storage</td>
                      <td>up to 16 samples</td>
                      <td>up to 48 samples</td>
                      <td>up to 16 samples</td>
                      <td>up to 16 samples</td>
                      <td>up to 32 samples</td>
                    </tr>
                    <tr>
                      <td className="zui-sticky-col zui-stripe-row">
                        {t("common.sku")}
                      </td>
                      <td>
                        <i className="far fa-check-circle"></i>Included
                      </td>
                      <td>
                        <i className="far fa-plus-circle"></i>Optional
                      </td>
                      <td>
                        <i className="far fa-times-circle"></i>Not Available
                      </td>
                      <td>
                        <i className="far fa-check-circle"></i>Included
                      </td>
                      <td>
                        <i className="far fa-check-circle"></i>Included
                      </td>
                    </tr>
                    <tr>
                      <td className="zui-sticky-col">
                        {t("shop.availability")}
                      </td>
                      <td>
                        <i className="far fa-plus-circle"></i>Optional
                      </td>
                      <td>
                        <i className="far fa-check-circle"></i>Included
                      </td>
                      <td>
                        <i className="far fa-check-circle"></i>Included
                      </td>
                      <td>
                        <i className="far fa-check-circle"></i>Included
                      </td>
                      <td>
                        <i className="far fa-check-circle"></i>Included
                      </td>
                    </tr>
                    <tr>
                      <td className="zui-sticky-col zui-stripe-row">Weight</td>
                      <td>
                        <i className="far fa-check-circle"></i>Included
                      </td>
                      <td>
                        <i className="far fa-check-circle"></i>Included
                      </td>
                      <td>
                        <i className="far fa-check-circle"></i>Included
                      </td>
                      <td>
                        <i className="far fa-check-circle"></i>Included
                      </td>
                      <td>
                        <i className="far fa-check-circle"></i>Included
                      </td>
                    </tr>
                    <tr>
                      <td className="zui-sticky-col">Dimensions</td>
                      <td>
                        <i className="far fa-check-circle"></i>Included
                      </td>
                      <td>
                        <i className="far fa-check-circle"></i>Included
                      </td>
                      <td>
                        <i className="far fa-check-circle"></i>Included
                      </td>
                      <td>
                        <i className="far fa-check-circle"></i>Included
                      </td>
                      <td>
                        <i className="far fa-check-circle"></i>Included
                      </td>
                    </tr>
                    <tr>
                      <td className="zui-sticky-col zui-stripe-row">Colors</td>
                      <td>
                        <i className="far fa-times-circle"></i>Not Available
                      </td>
                      <td>
                        <i className="far fa-check-circle"></i>Included
                      </td>
                      <td>
                        <i className="far fa-times-circle"></i>Not Available
                      </td>
                      <td>
                        <i className="far fa-times-circle"></i>Not Available
                      </td>
                      <td>
                        <i className="far fa-times-circle"></i>Not Available
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompareModal;
