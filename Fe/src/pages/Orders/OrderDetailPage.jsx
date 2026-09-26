import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import TitleBanner from "../../components/shared/TitleBanner";
import OrderTrackingTimeline from "../../components/orders/OrderTrackingTimeline";
import orderService from "../../services/orderService";

const currency = (amount) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    Number(amount || 0),
  );

const OrderDetailPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [canceling, setCanceling] = useState(false);

  useEffect(() => {
    let active = true;
    orderService
      .getMyOrder(id)
      .then((data) => active && setOrder(data))
      .catch((requestError) => {
        if (active) {
          setError(
            requestError?.response?.data?.message ||
              "Could not load this order.",
          );
        }
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [id]);

  const cancelOrder = async () => {
    if (!window.confirm("Cancel this order?")) return;
    setCanceling(true);
    setError("");
    try {
      setOrder(await orderService.cancelMyOrder(id));
    } catch (requestError) {
      setError(requestError?.response?.data?.message || "Could not cancel this order.");
    } finally {
      setCanceling(false);
    }
  };

  return (
    <>
      <TitleBanner title="Order details" />
      <section className="py-40">
        <div className="container-2">
          <div className="d-flex justify-content-between align-items-center mb-24">
            <h4 className="font-sec fw-700 medium-black mb-0">Order #{id}</h4>
            <Link to="/account/orders" className="text-decoration-underline">Back to orders</Link>
          </div>
          {loading && <p className="light-gray">Loading order…</p>}
          {error && <div className="alert alert-danger" role="alert">{error}</div>}
          {order && (
            <>
              <div className="checkout-box bg-semi-white p-24 mb-16">
                <div className="d-flex flex-wrap justify-content-between gap-3 mb-16">
                  <div>
                    <span className="light-gray d-block mb-1">Status</span>
                    <strong className="medium-black">{order.orderStatus}</strong>
                  </div>
                  <div>
                    <span className="light-gray d-block mb-1">Placed</span>
                    <strong className="medium-black">
                      {order.createdAt ? new Date(order.createdAt).toLocaleString() : "—"}
                    </strong>
                  </div>
                </div>
                <OrderTrackingTimeline status={order.orderStatus} />
                {order.orderStatus === "PENDING" && (
                  <button
                    type="button"
                    className="btn btn-outline-danger mt-3"
                    onClick={cancelOrder}
                    disabled={canceling}
                  >
                    {canceling ? "Cancelling…" : "Cancel order"}
                  </button>
                )}
              </div>

              <div className="checkout-box bg-semi-white p-24 mb-16">
                <h6 className="fw-600 medium-black mb-16">Items</h6>
                {(order.orderItems || []).map((item) => (
                  <div className="d-flex flex-wrap justify-content-between gap-2 py-2 border-bottom" key={item.orderItemId}>
                    <div>
                      <strong className="medium-black">{item.productName}</strong>
                      <div className="light-gray">Qty: {item.quantity} · {currency(item.unitPrice)} each</div>
                    </div>
                    <strong className="medium-black">{currency(item.subtotal)}</strong>
                  </div>
                ))}
                <div className="d-flex justify-content-between pt-16">
                  <span className="fw-600">Total</span>
                  <strong className="color-primary">{currency(order.totalCost)}</strong>
                </div>
              </div>

              <div className="checkout-box bg-semi-white p-24">
                <h6 className="fw-600 medium-black mb-16">Delivery</h6>
                <p className="mb-1">{order.shippingAddress}</p>
                <p className="light-gray mb-1">{order.phone}</p>
                <p className="light-gray mb-0">{order.shippingMethod}</p>
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
};

export default OrderDetailPage;
