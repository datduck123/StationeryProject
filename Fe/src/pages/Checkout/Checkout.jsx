// Migrated from: checkout.html, lines 200-1358; assets/js/app.js lines 378-382
// HTML->JSX conversion: class -> className, for -> htmlFor, stroke-width -> strokeWidth, clip-path -> clipPath, xlink:href -> xlinkHref, img / input self-closing
import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import TitleBanner from "../../components/shared/TitleBanner";

export const Checkout = () => {
  const { t } = useTranslation();
  const [showSignIn, setShowSignIn] = useState(false);
  const [shipDifferent, setShipDifferent] = useState(false);
  const [shippingMethod, setShippingMethod] = useState("basic");
  const [paymentMethod, setPaymentMethod] = useState("credit");

  return (
    <>
      <TitleBanner title={t("checkout.title")} />

      {/* Customer Container Start */}
      <div className="customer-container py-40">
        <div className="container-2">
          <div className="customer-wrapper">
            <div className="title-box">
              <p className="fw-500">
                Returning Customer?{" "}
                <a
                  href="#login"
                  className="color-primary text-decoration-underline signin-button"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowSignIn((prev) => !prev);
                  }}
                >
                  Click here to login
                </a>
              </p>
            </div>
            {showSignIn && (
              <div className="sign-form mt-32" style={{ display: "block" }}>
                <p className="fw-500 mb-16">
                  If you’ve shopped with us before, enter your information
                  below. New customers, please continue to the Billing section.
                </p>
                <form
                  action="#"
                  method="post"
                  onSubmit={(e) => e.preventDefault()}
                >
                  <div className="row row-gap-3">
                    <div className="col-lg-6">
                      <div className="input-block">
                        <input
                          type="text"
                          name="name"
                          id="firstname"
                          className="form-control form-control-2"
                          placeholder="Username or email address"
                        />
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="none"
                        >
                          <path
                            d="M18.2422 2.96875H1.75781C0.786602 2.96875 0 3.76023 0 4.72656V15.2734C0 16.2455 0.792383 17.0312 1.75781 17.0312H18.2422C19.2053 17.0312 20 16.2488 20 15.2734V4.72656C20 3.76195 19.2165 2.96875 18.2422 2.96875ZM17.996 4.14062C17.6369 4.49785 11.4564 10.6458 11.243 10.8581C10.9109 11.1901 10.4695 11.3729 10 11.3729C9.53047 11.3729 9.08906 11.1901 8.75594 10.857C8.61242 10.7142 2.50012 4.63414 2.00398 4.14062H17.996ZM1.17188 15.0349V4.96582L6.23586 10.0031L1.17188 15.0349ZM2.00473 15.8594L7.06672 10.8296L7.9284 11.6867C8.48176 12.2401 9.21746 12.5448 10 12.5448C10.7825 12.5448 11.5182 12.2401 12.0705 11.6878L12.9333 10.8296L17.9953 15.8594H2.00473ZM18.8281 15.0349L13.7641 10.0031L18.8281 4.96582V15.0349Z"
                            fill="#141516"
                          />
                        </svg>
                      </div>
                    </div>
                    <div className="col-lg-6">
                      <div className="input-block">
                        <input
                          type="password"
                          name="password"
                          id="passWord"
                          className="form-control form-control-2"
                          placeholder="Password"
                        />
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="none"
                        >
                          <path
                            d="M19.8898 10.3421C20.0368 10.1378 20.0368 9.86227 19.8898 9.65785C19.8451 9.5957 18.7753 8.11922 17.0388 6.62602L19.8898 10.3421ZM19.8898 10.3421C19.8451 10.4043 18.7753 11.8808 17.0388 13.374C16.0117 14.2571 14.9628 14.9625 13.9213 15.4705M19.8898 10.3421L6.33476 14.9827M2.96124 13.374L3.31779 12.9593L0.110303 10.3421C0.15499 10.4043 1.22472 11.8808 2.96124 13.374ZM2.96124 13.374L3.31781 12.9593M2.96124 13.374L3.31781 12.9593M3.31781 12.9593C3.32463 12.9652 3.33146 12.971 3.3383 12.9769C3.78259 13.3578 4.30002 13.7615 4.87535 14.1434C4.94379 14.1888 5.01304 14.2339 5.08309 14.2787L5.09608 14.287L5.10946 14.2946L5.99122 14.7983L6.16418 14.8971L6.17856 14.9054L6.19335 14.9128C6.23538 14.9339 6.27765 14.9549 6.32015 14.9756L6.07878 15.4705M3.31781 12.9593L5.73444 15.2904C5.83141 15.341 5.9444 15.3999 6.07878 15.4705M6.07878 15.4705L6.33476 14.9827M6.07878 15.4705C7.40507 16.1173 8.72437 16.4453 10 16.4453C11.2757 16.4453 12.595 16.1173 13.9213 15.4705M6.33476 14.9827C7.43018 15.5147 8.67705 15.8984 10 15.8984C11.3151 15.8984 12.56 15.5261 13.6814 14.9787L13.9213 15.4705M6.33476 14.9827L13.6814 14.9787L13.9213 15.4705M13.5053 9.93776C13.5053 11.8737 11.936 13.443 10 13.443C8.06414 13.443 6.49478 11.8737 6.49478 9.93776C6.49478 8.00186 8.06414 6.4325 10 6.4325C11.936 6.4325 13.5053 8.00186 13.5053 9.93776ZM13.9212 4.52961L13.9212 4.52972L13.9212 4.52961Z"
                            stroke="#141516"
                            strokeWidth="1.25"
                          />
                        </svg>
                      </div>
                    </div>
                    <div className="col-lg-8">
                      <div className="cus-checkBox mb-8">
                        <input type="checkbox" id="remember3" />
                        <label htmlFor="remember3" className="light-gray">
                          Remember me
                        </label>
                      </div>
                    </div>
                    <div className="col-lg-6">
                      <button type="submit" className="cus-btn border-0">
                        <span className="text-btn">Sign In</span>
                        <span>Sign In</span>
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Customer Container End */}

      {/* Billing Details Start */}
      <section className="billing-detail pb-80">
        <div className="container-2">
          <div className="row row-gap-4">
            <div className="col-xl-8">
              <div className="title-row title-row-2 bg-white mb-16">
                <h5 className="fw-600 medium-black">
                  {t("checkout.billingDetails")}
                </h5>
              </div>
              <div className="billing-wrapper bg-white br-10 mb-40">
                <form
                  action="#"
                  method="post"
                  className="contact-form"
                  onSubmit={(e) => e.preventDefault()}
                >
                  <div className="row">
                    <div className="col-md-6">
                      <div className="input-block mb-16">
                        <input
                          type="text"
                          name="name"
                          id="name"
                          className="form-control form-control-2"
                          placeholder="First Name"
                        />
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="21"
                          height="20"
                          viewBox="0 0 21 20"
                          fill="none"
                        >
                          <path
                            d="M10.5 0C7.59223 0 5.22656 2.36566 5.22656 5.27344C5.22656 8.18121 7.59223 10.5469 10.5 10.5469C13.4078 10.5469 15.7734 8.18121 15.7734 5.27344C15.7734 2.36566 13.4078 0 10.5 0ZM10.5 9.375C8.2384 9.375 6.39844 7.53504 6.39844 5.27344C6.39844 3.01184 8.2384 1.17188 10.5 1.17188C12.7616 1.17188 14.6016 3.01184 14.6016 5.27344C14.6016 7.53504 12.7616 9.375 10.5 9.375Z"
                            fill="#141516"
                          />
                          <path
                            d="M17.0612 13.992C15.6174 12.5261 13.7035 11.7188 11.6719 11.7188H9.32812C7.29656 11.7188 5.38258 12.5261 3.93883 13.992C2.50215 15.4507 1.71094 17.3763 1.71094 19.4141C1.71094 19.7377 1.97328 20 2.29688 20H18.7031C19.0267 20 19.2891 19.7377 19.2891 19.4141C19.2891 17.3763 18.4979 15.4507 17.0612 13.992ZM2.90859 18.8281C3.20215 15.5045 5.96918 12.8906 9.32812 12.8906H11.6719C15.0308 12.8906 17.7979 15.5045 18.0914 18.8281H2.90859Z"
                            fill="#141516"
                          />
                        </svg>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="input-block mb-16">
                        <input
                          type="text"
                          name="lname"
                          id="lastName"
                          className="form-control form-control-2"
                          placeholder="Last Name"
                        />
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="21"
                          height="20"
                          viewBox="0 0 21 20"
                          fill="none"
                        >
                          <path
                            d="M10.5 0C7.59223 0 5.22656 2.36566 5.22656 5.27344C5.22656 8.18121 7.59223 10.5469 10.5 10.5469C13.4078 10.5469 15.7734 8.18121 15.7734 5.27344C15.7734 2.36566 13.4078 0 10.5 0ZM10.5 9.375C8.2384 9.375 6.39844 7.53504 6.39844 5.27344C6.39844 3.01184 8.2384 1.17188 10.5 1.17188C12.7616 1.17188 14.6016 3.01184 14.6016 5.27344C14.6016 7.53504 12.7616 9.375 10.5 9.375Z"
                            fill="#141516"
                          />
                          <path
                            d="M17.0612 13.992C15.6174 12.5261 13.7035 11.7188 11.6719 11.7188H9.32812C7.29656 11.7188 5.38258 12.5261 3.93883 13.992C2.50215 15.4507 1.71094 17.3763 1.71094 19.4141C1.71094 19.7377 1.97328 20 2.29688 20H18.7031C19.0267 20 19.2891 19.7377 19.2891 19.4141C19.2891 17.3763 18.4979 15.4507 17.0612 13.992ZM2.90859 18.8281C3.20215 15.5045 5.96918 12.8906 9.32812 12.8906H11.6719C15.0308 12.8906 17.7979 15.5045 18.0914 18.8281H2.90859Z"
                            fill="#141516"
                          />
                        </svg>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="input-block mb-16">
                        <input
                          type="email"
                          name="email"
                          id="e-mail"
                          className="form-control form-control-2"
                          placeholder="Email Address"
                        />
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="21"
                          height="20"
                          viewBox="0 0 21 20"
                          fill="none"
                        >
                          <path
                            d="M18.7422 2.96875H2.25781C1.2866 2.96875 0.5 3.76023 0.5 4.72656V15.2734C0.5 16.2455 1.29238 17.0312 2.25781 17.0312H18.7422C19.7053 17.0312 20.5 16.2488 20.5 15.2734V4.72656C20.5 3.76195 19.7165 2.96875 18.7422 2.96875ZM18.496 4.14062C18.1369 4.49785 11.9564 10.6458 11.743 10.8581C11.4109 11.1901 10.9695 11.3729 10.5 11.3729C10.0305 11.3729 9.58906 11.1901 9.25594 10.857C9.11242 10.7142 3.00012 4.63414 2.50398 4.14062H18.496ZM1.67188 15.0349V4.96582L6.73586 10.0031L1.67188 15.0349ZM2.50473 15.8594L7.56672 10.8296L8.4284 11.6867C8.98176 12.2401 9.71746 12.5448 10.5 12.5448C11.2825 12.5448 12.0182 12.2401 12.5705 11.6878L13.4333 10.8296L18.4953 15.8594H2.50473ZM19.3281 15.0349L14.2641 10.0031L19.3281 4.96582V15.0349Z"
                            fill="#141516"
                          />
                        </svg>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="input-block mb-16">
                        <input
                          type="tel"
                          name="phone"
                          id="phoneNumber"
                          className="form-control form-control-2"
                          placeholder="Phone Number"
                        />
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="none"
                        >
                          <path
                            d="M16.2509 15.5304L15.8338 14.8339C15.0836 13.5971 14.0484 12.1776 12.6904 12.1776C12.4389 12.1776 12.1897 12.2282 11.9431 12.3307L11.2142 12.6432C11.1477 12.6708 11.083 12.7022 11.0145 12.7355C10.828 12.8262 10.6165 12.929 10.3989 12.929C9.86217 12.929 9.2403 12.2305 8.64811 10.9623C8.06692 9.71762 8.10399 9.06508 8.23741 8.73673C8.38462 8.37447 8.72695 8.21959 9.09471 8.08041C9.14585 8.06101 9.19204 8.04342 9.23696 8.02493L9.97501 7.71418C11.8978 6.9101 11.1825 4.10014 10.948 3.17889L10.7491 2.3868C10.579 1.734 10.1282 0 8.63277 0C8.35594 0 8.06061 0.064496 7.75527 0.191774C7.55492 0.271334 4.79792 1.39672 3.79909 3.37382C2.60532 5.72716 2.82605 8.88296 4.45451 12.7515C6.07079 16.625 8.16669 18.9942 10.684 19.7933C11.1158 19.9305 11.6038 19.9999 12.1346 19.9999H12.1349C13.8721 19.9999 15.587 19.2608 15.7262 19.1994C16.3251 18.9457 16.7123 18.5601 16.8768 18.0532C17.1557 17.1937 16.6878 16.2519 16.2509 15.5304ZM15.5897 17.6356C15.5514 17.7534 15.4185 17.8609 15.1948 17.9551C15.1911 17.9567 15.1866 17.9586 15.1828 17.9603C15.1673 17.9672 13.615 18.647 12.1345 18.6469C11.7428 18.6469 11.3926 18.5988 11.0935 18.5037C8.97266 17.8305 7.1592 15.72 5.70231 12.2286C4.23459 8.7416 4.00006 5.96837 5.0062 3.98495C5.78746 2.43858 8.23335 1.45761 8.25734 1.44823C8.26221 1.44625 8.26699 1.44435 8.27177 1.44237C8.41105 1.38391 8.53589 1.35306 8.63277 1.35306C8.9309 1.35306 9.20223 1.81545 9.43803 2.72173L9.63602 3.51048C10.0632 5.18828 9.99819 6.23772 9.45129 6.46647L8.71675 6.77587C8.68753 6.78796 8.65334 6.80068 8.61563 6.81502C8.20989 6.96864 7.36558 7.28814 6.98375 8.22735C6.63727 9.0796 6.7807 10.1615 7.42178 11.535C8.28521 13.3835 9.25897 14.2821 10.3987 14.2821C10.9277 14.2821 11.3523 14.0757 11.6059 13.9525C11.6526 13.9298 11.6944 13.909 11.7393 13.8904L12.4693 13.5774C12.5446 13.546 12.6169 13.5307 12.6903 13.5307C13.0417 13.5307 13.6717 13.8786 14.6749 15.5325L15.0918 16.2285C15.6055 17.0767 15.6461 17.4618 15.5897 17.6356Z"
                            fill="#141516"
                          />
                        </svg>
                      </div>
                    </div>
                    <div className="col-md-12">
                      <div className="input-block mb-16">
                        <input
                          type="text"
                          name="address"
                          id="location"
                          className="form-control form-control-2"
                          placeholder="Your Address House or Street Name"
                        />
                      </div>
                    </div>
                    <div className="col-md-12">
                      <div className="input-block mb-16">
                        <input
                          type="text"
                          name="apartment"
                          id="apartMent"
                          className="form-control form-control-2"
                          placeholder="Apartment, Suite, Unit, ect. (optional)"
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="input-block mb-16">
                        <input
                          type="text"
                          name="town"
                          id="city"
                          className="form-control form-control-2"
                          placeholder="Town / City"
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="input-block mb-16">
                        <input
                          type="text"
                          name="country"
                          id="region"
                          className="form-control form-control-2"
                          placeholder="Country / Region"
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="input-block mb-16">
                        <input
                          type="text"
                          name="state"
                          id="states"
                          className="form-control form-control-2"
                          placeholder="State"
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="input-block mb-16">
                        <input
                          type="text"
                          name="postal"
                          id="zip"
                          className="form-control form-control-2"
                          placeholder="Postcode / Zip"
                        />
                      </div>
                    </div>
                    <div className="col-md-12">
                      <div className="cus-checkBox ship-address mb-32">
                        <input
                          type="checkbox"
                          id="shipAddress"
                          checked={shipDifferent}
                          onChange={(e) => setShipDifferent(e.target.checked)}
                        />
                        <label htmlFor="shipAddress" className="fw-500">
                          Ship to a diffrent address?
                        </label>
                      </div>
                    </div>

                    <div className="col-md-12">
                      <div className="input-block">
                        <label htmlFor="textbox" className="fw-500 mb-16">
                          Order notes (optional)
                        </label>
                        <textarea
                          name="textarea"
                          id="textbox"
                          cols="8"
                          rows="5"
                          className="form-control form-control-2"
                          placeholder="Note About Your Order, e.g. special notes for delivery."
                        ></textarea>
                      </div>
                    </div>
                  </div>
                </form>

                {/* Different Billing Address Form */}
                {shipDifferent && (
                  <form
                    action="#"
                    method="post"
                    className="billing-address contact-form mt-16"
                    onSubmit={(e) => e.preventDefault()}
                  >
                    <div className="row">
                      <div className="col-md-6">
                        <div className="input-block mb-16">
                          <input
                            type="text"
                            name="name1"
                            id="name1"
                            className="form-control form-control-2"
                            placeholder="First Name"
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="input-block mb-16">
                          <input
                            type="text"
                            name="lname2"
                            id="lastName2"
                            className="form-control form-control-2"
                            placeholder="Last Name"
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="input-block mb-16">
                          <input
                            type="email"
                            name="email2"
                            id="e-mail2"
                            className="form-control form-control-2"
                            placeholder="Email Address"
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="input-block mb-16">
                          <input
                            type="tel"
                            name="phone2"
                            id="phoneNumber2"
                            className="form-control form-control-2"
                            placeholder="Phone Number"
                          />
                        </div>
                      </div>
                      <div className="col-md-12">
                        <div className="input-block mb-16">
                          <input
                            type="text"
                            name="address2"
                            id="location2"
                            className="form-control form-control-2"
                            placeholder="Your Address House or Street Name"
                          />
                        </div>
                      </div>
                    </div>
                  </form>
                )}
              </div>

              {/* Shipping Method */}
              <div className="title-row title-row-2 mb-16">
                <h5 className="fw-600 medium-black">Shipping Methods</h5>
              </div>
              <div className="shipping-radio-container mb-40">
                <div className="plans mb-16">
                  <label className="plan basic-plan" htmlFor="basic">
                    <input
                      type="radio"
                      name="plan"
                      id="basic"
                      checked={shippingMethod === "basic"}
                      onChange={() => setShippingMethod("basic")}
                    />
                    <span className="plan-content">
                      <img src="assets/media/icons/fedex.png" alt="" />
                      <span className="plan-details">
                        <span className="fw-500 medium-black">FedEx</span>
                        <span className="light-gray d-block">
                          Delivery, Tomorrow
                        </span>
                      </span>
                      <span className="fw-500 dark-black">$1.00</span>
                    </span>
                  </label>
                  <label className="plan basic-plan" htmlFor="basic2">
                    <input
                      type="radio"
                      name="plan"
                      id="basic2"
                      checked={shippingMethod === "basic2"}
                      onChange={() => setShippingMethod("basic2")}
                    />
                    <span className="plan-content">
                      <img
                        src="assets/media/icons/shipping-icon-2.png"
                        alt=""
                      />
                      <span className="plan-details">
                        <span className="fw-500 medium-black">American</span>
                        <span className="light-gray d-block">
                          Delivery, Today
                        </span>
                      </span>
                      <span className="fw-500 dark-black">$5.00</span>
                    </span>
                  </label>
                </div>
                <div className="plans">
                  <label className="plan basic-plan" htmlFor="basic3">
                    <input
                      type="radio"
                      name="plan"
                      id="basic3"
                      checked={shippingMethod === "basic3"}
                      onChange={() => setShippingMethod("basic3")}
                    />
                    <span className="plan-content">
                      <img
                        src="assets/media/icons/shipping-icon-3.png"
                        alt=""
                      />
                      <span className="plan-details">
                        <span className="fw-500 medium-black">DHL</span>
                        <span className="light-gray d-block">
                          Delivery, Today
                        </span>
                      </span>
                      <span className="fw-500 dark-black">$1.00</span>
                    </span>
                  </label>
                  <label className="plan basic-plan" htmlFor="basic4">
                    <input
                      type="radio"
                      name="plan"
                      id="basic4"
                      checked={shippingMethod === "basic4"}
                      onChange={() => setShippingMethod("basic4")}
                    />
                    <span className="plan-content">
                      <img
                        src="assets/media/icons/shipping-icon-4.png"
                        alt=""
                      />
                      <span className="plan-details">
                        <span className="fw-500 medium-black">American</span>
                        <span className="light-gray d-block">
                          Delivery, Today
                        </span>
                      </span>
                      <span className="fw-500 dark-black">$5.00</span>
                    </span>
                  </label>
                </div>
              </div>

              {/* Payment Method */}
              <div className="title-row title-row-2 mb-16">
                <h5 className="fw-600 medium-black">Payments Methods</h5>
              </div>
              <div className="shipping-radio-container">
                <form
                  action="#"
                  method="post"
                  onSubmit={(e) => e.preventDefault()}
                >
                  <div className="plans mb-16">
                    <label className="plan basic-plan" htmlFor="credit">
                      <input
                        type="radio"
                        name="paymentPlan"
                        id="credit"
                        checked={paymentMethod === "credit"}
                        onChange={() => setPaymentMethod("credit")}
                      />
                      <span className="plan-content content-2">
                        <img
                          src="assets/media/icons/payment-card-1.png"
                          alt=""
                        />
                        <span className="plan-details">
                          <span className="fw-500 medium-black">
                            Credit or Debit Card
                          </span>
                        </span>
                      </span>
                    </label>
                    <label className="plan basic-plan" htmlFor="paypal">
                      <input
                        type="radio"
                        name="paymentPlan"
                        id="paypal"
                        checked={paymentMethod === "paypal"}
                        onChange={() => setPaymentMethod("paypal")}
                      />
                      <span className="plan-content content-2">
                        <img
                          src="assets/media/icons/payment-card-2.png"
                          alt=""
                        />
                        <span className="plan-details">
                          <span className="fw-500 medium-black">Paypal</span>
                        </span>
                      </span>
                    </label>
                  </div>

                  <div className="plans mb-40">
                    <label className="plan basic-plan" htmlFor="bank">
                      <input
                        type="radio"
                        name="paymentPlan"
                        id="bank"
                        checked={paymentMethod === "bank"}
                        onChange={() => setPaymentMethod("bank")}
                      />
                      <span className="plan-content content-2">
                        <img
                          src="assets/media/icons/payment-card-3.png"
                          alt=""
                        />
                        <span className="plan-details">
                          <span className="fw-500 medium-black">
                            Direct Bank Transfer
                          </span>
                        </span>
                      </span>
                    </label>
                    <label className="plan basic-plan" htmlFor="cod">
                      <input
                        type="radio"
                        name="paymentPlan"
                        id="cod"
                        checked={paymentMethod === "cod"}
                        onChange={() => setPaymentMethod("cod")}
                      />
                      <span className="plan-content content-2">
                        <img
                          src="assets/media/icons/payment-card-1.png"
                          alt=""
                        />
                        <span className="plan-details">
                          <span className="fw-500 medium-black">
                            Cash on Delivery
                          </span>
                        </span>
                      </span>
                    </label>
                  </div>
                </form>

                <h5 className="fw-600 medium-black mb-24">Payments Details</h5>
                <div className="row">
                  <div className="col-md-6">
                    <div className="input-block mb-16">
                      <input
                        type="number"
                        name="name"
                        id="name01"
                        className="form-control form-control-2"
                        placeholder="First Name"
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="input-block mb-16">
                      <input
                        type="text"
                        name="lstName"
                        id="nameLast"
                        className="form-control form-control-2"
                        placeholder="Last Name"
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="input-block mb-16">
                      <input
                        type="text"
                        name="date"
                        id="checkIn"
                        className="form-control form-control-2 sel-input date_from"
                        placeholder="Select Date"
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="input-block mb-16">
                      <input
                        type="number"
                        name="cvv"
                        id="cvvCode"
                        className="form-control form-control-2"
                        placeholder="CVV Code"
                      />
                    </div>
                  </div>
                  <div className="col-md-12">
                    <div className="d-flex align-items-center gap-8">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                      >
                        <path
                          d="M18.0132 3.23975C17.0084 2.89459 16.2035 2.08511 15.8598 1.07437C15.6413 0.431671 15.0397 0 14.3625 0H5.63751C4.96048 0 4.35867 0.431671 4.14017 1.07437C3.79654 2.08511 2.99164 2.89459 1.98685 3.23975C1.3475 3.45947 0.917969 4.06296 0.917969 4.74152V6.9487C0.917969 9.82895 1.78101 12.6022 3.41385 14.9689C4.90784 17.1342 6.96655 18.8287 9.36768 19.8694C9.56863 19.9565 9.78424 20 10 20C10.2156 20 10.4312 19.9565 10.6322 19.8694C13.0333 18.8289 15.092 17.1342 16.586 14.9689C18.2188 12.6022 19.082 9.8288 19.082 6.9487V4.74152C19.082 4.06296 18.6525 3.45947 18.0132 3.23975ZM17.9102 6.9487C17.9102 9.59 17.1187 12.1332 15.6213 14.3034C14.2522 16.288 12.3657 17.8409 10.1662 18.7941C10.0607 18.8399 9.93942 18.84 9.83368 18.7941C7.63397 17.8409 5.74768 16.288 4.37851 14.3034C2.88132 12.1333 2.08984 9.59015 2.08984 6.9487V4.74152C2.08984 4.56329 2.20154 4.40521 2.36771 4.34814C3.71277 3.88596 4.79019 2.80319 5.24963 1.45157C5.30655 1.28433 5.46234 1.17188 5.63751 1.17188H14.3625C14.5375 1.17188 14.6935 1.28433 14.7504 1.45157C15.2098 2.80319 16.2872 3.88596 17.6323 4.34814C17.7985 4.40521 17.9102 4.56329 17.9102 4.74152V6.9487Z"
                          fill="#141516"
                        />
                        <path
                          d="M12.4898 7.59705H12.45V5.92834C12.45 4.57748 11.3509 3.47839 10 3.47839C8.64914 3.47839 7.55005 4.57748 7.55005 5.92834V7.59705H7.51022C6.73218 7.59705 6.09924 8.23013 6.09924 9.00818V12.3804C6.09924 13.8293 7.27814 15.0084 8.72696 15.0084H11.273C12.722 15.0084 13.9008 13.8293 13.9008 12.3804V9.00818C13.9008 8.23013 13.2678 7.59705 12.4898 7.59705ZM8.72192 5.92834C8.72192 5.22369 9.29535 4.65027 10 4.65027C10.7047 4.65027 11.2781 5.22369 11.2781 5.92834V7.5972H8.72192V5.92834ZM12.7289 12.3804C12.7289 13.1833 12.0758 13.8364 11.273 13.8364H8.72696C7.92419 13.8364 7.27112 13.1833 7.27112 12.3804V9.00818C7.27112 8.87634 7.37839 8.76907 7.51022 8.76907H12.4898C12.6216 8.76907 12.7289 8.87634 12.7289 9.00818V12.3804Z"
                          fill="#141516"
                        />
                      </svg>
                      <p className="light-gray">
                        Your Transaction is Secured with SSL Encryption
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xl-4">
              <div className="title-row title-row-2 mb-16">
                <h5 className="fw-600 medium-black">
                  {t("checkout.yourOrder")}
                </h5>
              </div>
              <div className="summary-container bg-white">
                <div className="item-container mb-16">
                  <div className="left-box d-flex align-items-center gap-16">
                    <div className="icon-box">
                      <img src="assets/media/products/nav-image-1.png" alt="" />
                    </div>
                    <Link
                      to="/product-detail.html"
                      className="h6 fw-600 medium-black"
                    >
                      Classic Printed Caps x 1
                    </Link>
                  </div>
                  <div className="right-box">
                    <p className="light-gray">$80.00</p>
                  </div>
                </div>
                <div className="hr-line mb-16"></div>
                <div className="item-container mb-32">
                  <div className="left-box d-flex align-items-center gap-16">
                    <div className="icon-box">
                      <img src="assets/media/products/nav-image-2.png" alt="" />
                    </div>
                    <Link
                      to="/product-detail.html"
                      className="h6 fw-600 medium-black"
                    >
                      High-Quality Booklets x 1
                    </Link>
                  </div>
                  <div className="right-box">
                    <p className="light-gray">$350.00</p>
                  </div>
                </div>

                <div className="input-block mb-32">
                  <input
                    type="text"
                    name="cp-Code"
                    className="form-control"
                    id="codeCp"
                    placeholder={t("cart.couponCode")}
                  />
                  <button type="button" className="cus-btn border-0">
                    <span className="text-btn">{t("cart.applyCoupon")}</span>
                    <span>{t("cart.applyCoupon")}</span>
                  </button>
                </div>

                <div className="d-flex align-items-center justify-content-between mb-16">
                  <h6 className="medium-black font-primary">
                    {t("cart.subtotal")}
                  </h6>
                  <h6 className="font-primary light-gray">$430.00</h6>
                </div>
                <div className="hr-line mb-16"></div>
                <div className="d-flex align-items-center justify-content-between mb-16">
                  <h6 className="medium-black font-primary">
                    {t("cart.delivery")}
                  </h6>
                  <h6 className="font-primary light-gray">$5.00</h6>
                </div>
                <div className="hr-line mb-16"></div>
                <div className="d-flex align-items-center justify-content-between mb-16">
                  <h6 className="medium-black font-primary">
                    {t("cart.discount")}
                  </h6>
                  <h6 className="font-primary light-gray">-$5.00</h6>
                </div>
                <div className="hr-line mb-16"></div>
                <div className="d-flex align-items-center justify-content-between mb-16">
                  <h5 className="fw-600 color-primary">{t("common.total")}</h5>
                  <h5 className="fw-600 color-primary">$430.00</h5>
                </div>
                <div className="hr-line mb-16"></div>
                <p className="light-gray mb-16">
                  Your personal data will be used to process your order, support
                  your experience throughout this website, and for other
                  purposes described in our
                  <span className="color-primary"> privacy policy.</span>
                </p>
                <div className="col-md-12">
                  <div className="cus-checkBox mb-32">
                    <input type="checkbox" id="terms" defaultChecked />
                    <label htmlFor="terms">
                      I have read and agree to the website terms and conditions
                    </label>
                  </div>
                </div>

                <button
                  type="button"
                  className="cus-btn w-100 border-0"
                  onClick={() => alert("Order Placed Successfully!")}
                >
                  <span className="text-btn">{t("checkout.placeOrder")}</span>
                  <span>{t("checkout.placeOrder")}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Billing Details End */}
    </>
  );
};

export default Checkout;
