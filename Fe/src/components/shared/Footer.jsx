// Migrated from: index.html, lines 2994-3228
// HTML->JSX conversion: class -> className, br / img / input self-closing, onSubmit handling, Link integration, i18n support
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="pt-40 pb-32">
      <div className="container-2">
        <div className="row row-gap-3 mb-48">
          <div
            className="col-xl-3 col-lg-4 col-md-10 col-sm-5 wow fadeInUp animated"
            data-wow-delay="400ms"
          >
            <div className="footer-info-block">
              <Link to="/" className="mb-24">
                <img src="/assets/media/logo.png" alt="" />
              </Link>
              <p className="mb-24">{t("footer.desc")}</p>
              <div className="mb-1">
                <p className="medium-black fw-500">
                  {t("footer.emailLabel")}:
                  <a
                    href="mailto:stationarytales@domain.com"
                    className="fw-400 dark-gray"
                  >
                    {" "}
                    stationarytales@domain.com
                  </a>
                </p>
              </div>
              <div className="mb-1">
                <p className="medium-black fw-500">
                  {t("footer.phoneLabel")}:
                  <a href="tel:1235498" className="fw-400 dark-gray">
                    {" "}
                    (+68) 123 456 7890
                  </a>
                </p>
              </div>
              <div className="mb-24">
                <p className="medium-black fw-500">
                  {t("footer.addressLabel")}:
                  <span className="fw-400 dark-gray">
                    {" "}
                    {t("footer.addressValue")}
                  </span>
                </p>
              </div>
              <ul className="list-unstyled social-link mb-0">
                <li>
                  <a
                    href="index.html"
                    className="blog-icons"
                    onClick={(e) => e.preventDefault()}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                    >
                      <path
                        d="M14.6875 4.6875C15.0109 4.6875 15.2734 4.425 15.2734 4.10156V0.585938C15.2734 0.2625 15.0109 0 14.6875 0H11.1718C8.91011 0 7.07027 1.83984 7.07027 4.10156V7.03125H5.31245C4.98902 7.03125 4.72652 7.29375 4.72652 7.61719V11.1328C4.72652 11.4563 4.98902 11.7188 5.31245 11.7188H7.07027V19.4141C7.07027 19.7375 7.33277 20 7.6562 20H11.1718C11.4953 20 11.7578 19.7375 11.7578 19.4141V11.7188H14.1015C14.3878 11.7188 14.6324 11.5117 14.6796 11.2293L15.2656 7.71367C15.2937 7.54375 15.246 7.36992 15.1347 7.23828C15.0234 7.10703 14.8597 7.03125 14.6875 7.03125H11.7578V4.6875H14.6875ZM11.1718 8.20312H13.9957L13.605 10.5469H11.1718C10.8484 10.5469 10.5859 10.8094 10.5859 11.1328V18.8281H8.24214V11.1328C8.24214 10.8094 7.97964 10.5469 7.6562 10.5469H5.89839V8.20312H7.6562C7.97964 8.20312 8.24214 7.94063 8.24214 7.61719V4.10156C8.24214 2.48633 9.55659 1.17188 11.1718 1.17188H14.1015V3.51562H11.1718C10.8484 3.51562 10.5859 3.77813 10.5859 4.10156V7.61719C10.5859 7.94063 10.8484 8.20312 11.1718 8.20312Z"
                        fill="#141516"
                      />
                    </svg>
                  </a>
                </li>
                <li>
                  <a
                    href="index.html"
                    className="blog-icons"
                    onClick={(e) => e.preventDefault()}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                    >
                      <path
                        d="M10.1968 19.9999C10.1306 19.9999 10.0644 19.9999 9.99771 19.9996C8.43002 20.0035 6.9815 19.9636 5.57281 19.8779C4.28131 19.7993 3.10242 19.353 2.16339 18.5873C1.25732 17.8485 0.63858 16.8495 0.324402 15.6184C0.0509644 14.5466 0.0364685 13.4945 0.022583 12.4769C0.0125122 11.7468 0.00213623 10.8816 0 10.0018C0.00213623 9.11829 0.0125122 8.25312 0.022583 7.52298C0.0364685 6.50553 0.0509644 5.45343 0.324402 4.3815C0.63858 3.15043 1.25732 2.15143 2.16339 1.4126C3.10242 0.646916 4.28131 0.200597 5.57297 0.122014C6.98166 0.0364124 8.43048 -0.00356563 10.0015 0.000249067C11.5697 -0.00310787 13.0177 0.0364124 14.4264 0.122014C15.7179 0.200597 16.8968 0.646916 17.8358 1.4126C18.7421 2.15143 19.3607 3.15043 19.6748 4.3815C19.9483 5.45328 19.9628 6.50553 19.9767 7.52298C19.9867 8.25312 19.9972 9.11829 19.9992 9.99811V10.0018C19.9972 10.8816 19.9867 11.7468 19.9767 12.4769C19.9628 13.4944 19.9484 14.5465 19.6748 15.6184C19.3607 16.8495 18.7421 17.8485 17.8358 18.5873C16.8968 19.353 15.7179 19.7993 14.4264 19.8779C13.0774 19.96 11.6916 19.9999 10.1968 19.9999ZM9.99771 18.7609C11.5399 18.7646 12.9559 18.7255 14.3315 18.6419C15.3081 18.5825 16.46 17.942 17.1537 17.3763C17.7948 16.8534 18.2364 16.132 18.4661 15.232C18.6937 14.3398 18.7069 13.3819 18.7195 12.4555C18.7294 11.7303 18.7398 10.8712 18.7419 9.99994C18.7398 9.12851 18.7294 8.2696 18.7195 7.54435C18.7069 6.61798 18.6937 5.66004 18.4661 4.7677C18.2364 3.86774 17.7948 3.14631 17.1537 2.62339C16.46 2.0579 15.3081 1.4361 14.3315 1.37674C12.9559 1.29297 11.5399 1.25436 10.0014 1.25772C8.45947 1.25406 7.0433 1.29755 5.66772 1.38132C4.69116 1.44068 3.64605 1.8595 2.95239 2.42499C2.31121 2.94791 1.75088 3.86774 1.52123 4.7677C1.29357 5.66004 1.28045 6.61783 1.26779 7.54435C1.25787 8.27021 1.24749 9.12973 1.24535 10.0018C1.24749 10.87 1.25787 11.7297 1.26779 12.4555C1.28045 13.3819 1.29357 14.3398 1.52123 15.232C1.75088 16.132 2.19247 16.8534 2.83364 17.3763C3.52731 17.9418 4.69116 18.5825 5.66772 18.6419C7.0433 18.7257 8.45978 18.7647 9.99771 18.7609ZM9.96048 14.8828C7.26822 14.8828 5.07767 12.6924 5.07767 9.99994C5.07767 7.30753 7.26822 5.11713 9.96048 5.11713C12.6529 5.11713 14.8433 7.30753 14.8433 9.99994C14.8433 12.6924 12.6529 14.8828 9.96048 14.8828ZM10.0014 6.25407C7.80598 6.25407 6.26095 7.79911 6.26095 9.99811C6.26095 11.8289 7.6453 13.7608 9.97978 13.7608C11.8107 13.7608 13.7142 12.0263 13.7142 9.99811C13.7142 8.16736 12.3175 6.25407 10.0014 6.25407ZM15.3902 3.55463C14.743 3.55463 14.2183 4.07923 14.2183 4.72651C14.2183 5.37378 14.743 5.89838 15.3902 5.89838C16.0374 5.89838 16.562 5.37378 16.562 4.72651C16.562 4.07923 16.0374 3.55463 15.3902 3.55463Z"
                        fill="#141516"
                      />
                    </svg>
                  </a>
                </li>
                <li>
                  <a
                    href="index.html"
                    className="blog-icons"
                    onClick={(e) => e.preventDefault()}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                    >
                      <path
                        d="M11.8683 8.46864L19.1537 0H17.4273L11.1014 7.3532L6.04897 0H0.221558L7.86186 11.1193L0.221558 20H1.94805L8.62833 12.2348L13.9641 20H19.7915L11.8679 8.46864H11.8683ZM9.50367 11.2173L8.72954 10.1101L2.57013 1.29967H5.22192L10.1926 8.40994L10.9668 9.51718L17.4281 18.7594H14.7763L9.50367 11.2177V11.2173Z"
                        fill="#0D0908"
                      />
                    </svg>
                  </a>
                </li>
                <li>
                  <a
                    href="index.html"
                    className="blog-icons"
                    onClick={(e) => e.preventDefault()}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                    >
                      <path
                        d="M4.70306 6.27594H0.9375C0.613861 6.27594 0.351562 6.53839 0.351562 6.86188V19.4141C0.351562 19.7377 0.613861 20 0.9375 20H4.70306C5.0267 20 5.289 19.7377 5.289 19.4141V6.86188C5.289 6.53839 5.0267 6.27594 4.70306 6.27594ZM4.11713 18.8281H1.52344V7.44781H4.11713V18.8281Z"
                        fill="#141516"
                      />
                      <path
                        d="M2.82043 0C1.45905 0 0.351562 1.10748 0.351562 2.46857C0.351562 3.82996 1.45905 4.93729 2.82043 4.93729C4.18167 4.93729 5.289 3.8298 5.289 2.46857C5.289 1.10748 4.18167 0 2.82043 0ZM2.82043 3.76541C2.10526 3.76541 1.52344 3.18375 1.52344 2.46857C1.52344 1.75354 2.10526 1.17188 2.82043 1.17188C3.53546 1.17188 4.11713 1.75354 4.11713 2.46857C4.11713 3.18375 3.53546 3.76541 2.82043 3.76541Z"
                        fill="#141516"
                      />
                      <path
                        d="M14.1176 6.19308C13.2269 6.19308 12.3491 6.40778 11.563 6.80939C11.5363 6.51047 11.2852 6.27594 10.9793 6.27594H7.21344C6.88995 6.27594 6.6275 6.53839 6.6275 6.86188V19.4141C6.6275 19.7377 6.88995 20 7.21344 20H10.9793C11.3029 20 11.5652 19.7377 11.5652 19.4141V12.5104C11.5652 11.6223 12.2879 10.8998 13.176 10.8998C14.064 10.8998 14.7864 11.6223 14.7864 12.5104V19.4141C14.7864 19.7377 15.0488 20 15.3723 20H19.138C19.4617 20 19.724 19.7377 19.724 19.4141V11.7995C19.724 8.70804 17.209 6.19308 14.1176 6.19308ZM18.5521 18.8281H15.9584V12.5104C15.9584 10.9761 14.7102 9.72794 13.1761 9.72794C11.6417 9.72794 10.3934 10.9761 10.3934 12.5104V18.8281H7.79953V7.44781H10.3934V7.88071C10.3934 8.10608 10.5226 8.31146 10.7259 8.40897C10.929 8.50647 11.17 8.4787 11.346 8.33786C12.1394 7.70142 13.098 7.36496 14.1176 7.36496C16.5628 7.36496 18.5521 9.35425 18.5521 11.7995V18.8281Z"
                        fill="#141516"
                      />
                    </svg>
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div
            className="offset-xl-1 col-lg-2 col-md-3 col-sm-4 col-6 wow fadeInUp animated"
            data-wow-delay="500ms"
          >
            <h6 className="medium-black fw-700 mb-24">{t("footer.aboutUs")}</h6>
            <ul className="list-unstyled mb-0">
              <li className="mb-12">
                <Link to="/">{t("header.home")}</Link>
              </li>
              <li className="mb-12">
                <Link to="/shop">{t("footer.aboutUs")}</Link>
              </li>
              <li className="mb-12">
                <Link to="/shop">
                  {t("home.latestArticles")}
                </Link>
              </li>
              <li className="mb-12">
                <Link to="/shop">{t("header.shop")}</Link>
              </li>
              <li>
                <Link to="/shop">{t("footer.faq")}</Link>
              </li>
            </ul>
          </div>
          <div
            className="col-lg-2 col-md-3 col-sm-3 col-6 wow fadeInUp animated"
            data-wow-delay="600ms"
          >
            <h6 className="medium-black fw-700 mb-24">
              {t("footer.customerCare")}
            </h6>
            <ul className="list-unstyled mb-0">
              <li className="mb-12">
                <Link to="/shop">{t("header.shop")}</Link>
              </li>
              <li className="mb-12">
                <Link to="/profile">{t("footer.myAccount")}</Link>
              </li>
              <li className="mb-12">
                <Link to="/cart">{t("modals.viewCart")}</Link>
              </li>
              <li className="mb-12">
                <Link to="/shop">{t("footer.wishlist")}</Link>
              </li>
              <li className="mb-12">
                <Link to="/checkout">{t("footer.orderTracking")}</Link>
              </li>
              <li>
                <Link to="/shop">
                  {t("footer.contactUs")}
                </Link>
              </li>
            </ul>
          </div>
          <div
            className="col-lg-4 col-md-6 col-sm-7 wow fadeInUp animated"
            data-wow-delay="700ms"
          >
            <h6 className="medium-black fw-700 mb-24">
              {t("footer.newsletter")}
            </h6>
            <p className="mb-24">{t("footer.newsletterDesc")}</p>
            <form
              action="#"
              method="post"
              className="newsletter-container mb-24"
              onSubmit={(e) => e.preventDefault()}
            >
              <div className="newsletter-block">
                <input
                  type="text"
                  name="newsletter-email"
                  placeholder={t("footer.enterEmail")}
                />
              </div>
              <button type="submit" className="cus-btn">
                <span className="btn-text">{t("footer.subscribe")}</span>
                <span>{t("footer.subscribe")}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
      <div className="hr-line line-2 mb-48"></div>
      <div className="container-2">
        <div
          className="footer-bottom-bar d-flex align-items-end flex-wrap row-gap-2 justify-content-between wow fadeInUp animated"
          data-wow-delay="800ms"
        >
          <p className="dark-gray">{t("footer.copyright")}</p>

          <div className="payment-cards d-flex align-items-center gap-16">
            <div className="card-block">
              <img src="/assets/media/icons/card-1.png" alt="" />
            </div>
            <div className="card-block">
              <img src="/assets/media/icons/card-2.png" alt="" />
            </div>
            <div className="card-block">
              <img src="/assets/media/icons/card-3.png" alt="" />
            </div>
            <div className="card-block">
              <img src="/assets/media/icons/card-4.png" alt="" />
            </div>
            <div className="card-block">
              <img src="/assets/media/icons/card-5.png" alt="" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
