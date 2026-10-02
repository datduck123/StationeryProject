import { Link, Navigate, useLocation } from "react-router-dom";
import TitleBanner from "../../components/shared/TitleBanner";

const OrderSuccessPage = () => {
  const { state } = useLocation();
  const orderId = state?.orderId;

  if (!orderId) return <Navigate to="/account/orders" replace />;

  return (
    <>
      <TitleBanner title="Order placed" />
      <section className="py-40">
        <div className="container-2">
          <div className="checkout-box bg-semi-white p-40 text-center">
            <div className="color-primary fs-1 mb-16" aria-hidden="true">✓</div>
            <h3 className="font-sec fw-700 medium-black mb-8">Thank you for your order!</h3>
            <p className="light-gray mb-24">
              Your order number is #{orderId}.
            </p>
            <div className="d-flex flex-wrap justify-content-center gap-3">
              <Link to="/account/orders" className="cus-btn">
                <span className="text-btn">View my orders</span>
                <span>View my orders</span>
              </Link>
              <Link to="/shop" className="text-decoration-underline align-self-center">Continue shopping</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default OrderSuccessPage;
