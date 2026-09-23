// Migrated from: cart.html, lines 200-221; shop-grid-sidebar.html lines 203-225; checkout.html lines 200-222
// HTML->JSX conversion: class -> className, img self-closing
export const TitleBanner = ({ title = "Shop" }) => {
  return (
    <section className="title-banner bg-sec">
      <div className="container-2">
        <div className="title-wrapper">
          <div className="row align-items-center justify-content-between">
            <div className="col-lg-6 col-md-6 col-sm-6">
              <h1 className="fw-700 medium-black text-sm-start text-center">
                {title}
              </h1>
            </div>
            <div className="col-lg-6 col-md-6 col-sm-6 d-sm-block d-none">
              <div className="text-end">
                <img src="/assets/media/banner/title-banner-image.png" alt="" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TitleBanner;
