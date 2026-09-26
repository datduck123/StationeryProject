import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import TitleBanner from "../../components/shared/TitleBanner";
import OrderCardItem from "../../components/orders/OrderCardItem";
import orderService from "../../services/orderService";

const OrderHistoryPage = () => {
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);

  useEffect(() => {
    let active = true;
    orderService
      .getMyOrders({ page, size: 10 })
      .then((data) => {
        if (active) {
          setPageData(data);
          setError("");
          setLoading(false);
        }
      })
      .catch((requestError) => {
        if (active) {
          setError(
            requestError?.response?.data?.message ||
              "Could not load your orders. Please try again.",
          );
        }
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [page]);

  return (
    <>
      <TitleBanner title="My Orders" />
      <section className="py-40">
        <div className="container-2">
          <div className="d-flex flex-wrap align-items-center justify-content-between mb-24">
            <h4 className="font-sec fw-700 medium-black mb-0">Order history</h4>
            <Link to="/shop" className="cus-btn">
              <span className="text-btn">Continue shopping</span>
              <span>Continue shopping</span>
            </Link>
          </div>
          {loading && <p className="light-gray">Loading orders…</p>}
          {error && <div className="alert alert-danger" role="alert">{error}</div>}
          {!loading && !error && (pageData?.content?.length ? (
            pageData.content.map((order) => (
              <OrderCardItem key={order.orderId} order={order} />
            ))
          ) : (
            <div className="checkout-box bg-semi-white p-24 text-center">
              <h6 className="fw-600 medium-black mb-2">No orders yet</h6>
              <p className="light-gray mb-0">Your completed checkouts will appear here.</p>
            </div>
          ))}
          {!loading && !error && (pageData?.totalPages || 0) > 1 && (
            <div className="d-flex justify-content-center align-items-center gap-3 mt-4">
              <button type="button" className="btn btn-outline-secondary" disabled={page === 0} onClick={() => { setLoading(true); setPage(page - 1); }}>Previous</button>
              <span>Page {page + 1} of {pageData.totalPages}</span>
              <button type="button" className="btn btn-outline-secondary" disabled={pageData.last} onClick={() => { setLoading(true); setPage(page + 1); }}>Next</button>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default OrderHistoryPage;
