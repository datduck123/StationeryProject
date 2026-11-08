import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getProductImage } from "../../services/productService";
import {
  formatOrderDateTime,
  formatOrderMoney,
  orderStatusLabel,
} from "../../utils/orderFormatters";
import OrderItemReviewAction from "./OrderItemReviewAction";

export const OrderCardItem = ({
  order,
  orderNumber,
  onOpenDetails,
  onCancelOrder,
  onOpenReviewModal,
  reviewedOrderItemIds,
  onItemReviewed,
  isCanceling = false,
}) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  if (!order) return null;

  const isDelivered = order.orderStatus === "DELIVERED";
  const isCancelled =
    order.orderStatus === "CANCELLED" || order.orderStatus === "CANCELED";
  const isPending = order.orderStatus === "PENDING";

  return (
    <article
      className="shopee-order-card mb-4 bg-white rounded-3 border"
      style={{
        boxShadow: "0 2px 12px rgba(20, 28, 43, 0.05)",
        overflow: "hidden",
        transition: "box-shadow 0.2s ease",
      }}
    >
      {/* 1. Header: Shop Name & Order Status */}
      <div
        className="p-3 px-4 d-flex align-items-center justify-content-between border-bottom flex-wrap gap-2"
        style={{ backgroundColor: "#fafbfc" }}
      >
        <div className="d-flex align-items-center gap-2">
          <span
            className="badge bg-danger text-white px-2 py-1"
            style={{ fontSize: "11px", fontWeight: "700", letterSpacing: "0.5px" }}
          >
            Mall
          </span>
          <Link
            to="/shop"
            className="text-dark text-decoration-none fw-700 fs-14 d-flex align-items-center gap-1"
            title="Đến cửa hàng Stationery Project"
          >
            <span>Stationery Project</span>
            <i className="fa-solid fa-chevron-right text-muted" style={{ fontSize: "10px" }}></i>
          </Link>
          <span className="text-muted fs-12 ms-2">
            #{order.orderId}
          </span>
        </div>

        <div className="d-flex align-items-center gap-2">
          {isDelivered && (
            <span className="fw-700 fs-13 text-success d-flex align-items-center gap-1">
              <i className="fa-solid fa-circle-check fs-13"></i>
              Đã giao đơn hàng
            </span>
          )}
          {isCancelled && (
            <span className="fw-700 fs-13 text-danger d-flex align-items-center gap-1">
              <i className="fa-solid fa-circle-xmark fs-13"></i>
              Đơn hàng đã bị hủy
            </span>
          )}
          {!isDelivered && !isCancelled && (
            <span
              className={`customer-order-status customer-order-status-${String(
                order.orderStatus || "unknown"
              ).toLowerCase()}`}
            >
              {orderStatusLabel(order.orderStatus, t)}
            </span>
          )}
        </div>
      </div>

      {/* 2. Delivery Status Banner (matching Shopee/TikTok style) */}
      {isDelivered && (
        <div
          className="mx-4 mt-3 p-2 px-3 rounded-2 d-flex align-items-center justify-content-between flex-wrap gap-2"
          style={{
            backgroundColor: "#f4fbf7",
            border: "1px solid #d1fae5",
            fontSize: "12.5px",
            color: "#065f46",
          }}
        >
          <div className="d-flex align-items-center gap-2">
            <i className="fa-solid fa-truck-fast text-success fs-14"></i>
            <div>
              <strong>Đã giao hàng thành công</strong>
              <span className="text-muted ms-2">
                {order.createdAt ? formatOrderDateTime(order.createdAt, i18n.language) : ""}
              </span>
            </div>
          </div>
          {order.trackingCode && (
            <span className="badge bg-light text-dark border fs-11">
              Mã vận đơn: {order.trackingCode}
            </span>
          )}
        </div>
      )}

      {/* 3. Order Items List */}
      <div className="p-4 py-3">
        {(order.orderItems || []).map((item) => {
          const imgSrc = getProductImage(item);
          return (
            <div
              key={item.orderItemId}
              className="order-product-row py-3 border-bottom d-flex align-items-start gap-3 flex-wrap flex-md-nowrap"
            >
              {/* Product Thumbnail */}
              <Link
                to={`/product/${item.productId}`}
                style={{
                  width: "72px",
                  height: "72px",
                  borderRadius: "10px",
                  border: "1px solid #eef0f3",
                  backgroundColor: "#f9fafb",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  flexShrink: 0,
                }}
              >
                <img
                  src={imgSrc}
                  alt={item.productName}
                  style={{
                    maxWidth: "100%",
                    maxHeight: "100%",
                    objectFit: "contain",
                  }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/assets/media/products/product-7.png";
                  }}
                />
              </Link>

              {/* Product Info */}
              <div style={{ flex: 1, minWidth: "180px" }}>
                <Link
                  to={`/product/${item.productId}`}
                  className="text-dark fw-600 fs-14 text-decoration-none d-block mb-1 text-truncate-2"
                  style={{ lineHeight: 1.4 }}
                >
                  {item.productName}
                </Link>
                <div className="d-flex align-items-center gap-3 text-muted fs-12 mb-2">
                  <span>Số lượng: x{item.quantity}</span>
                  <span>Đơn giá: {formatOrderMoney(item.unitPrice, i18n.language)}</span>
                </div>
              </div>

              {/* Price & Review Actions */}
              <div
                className="d-flex flex-column align-items-md-end justify-content-between"
                style={{ minWidth: "260px" }}
              >
                <span className="fw-700 fs-15 text-dark mb-2">
                  {formatOrderMoney(item.subtotal, i18n.language)}
                </span>

                {/* Review Action (Viết Đánh Giá + Đánh Giá Nhanh + Xem Lại Đánh Giá) */}
                <OrderItemReviewAction
                  item={item}
                  orderStatus={order.orderStatus}
                  reviewedItemIds={reviewedOrderItemIds}
                  onOpenReviewModal={onOpenReviewModal}
                  onItemReviewed={onItemReviewed}
                  variant="card"
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. Footer: Subtotal & Main Actions */}
      <div
        className="p-3 px-4 d-flex align-items-center justify-content-between border-top flex-wrap gap-3"
        style={{ backgroundColor: "#fafbfc" }}
      >
        <div className="d-flex align-items-center gap-2">
          <span className="text-muted fs-13">Thành tiền:</span>
          <strong className="fs-16 fw-700" style={{ color: "#e9613f" }}>
            {formatOrderMoney(order.totalCost, i18n.language)}
          </strong>
          {order.voucherCode && (
            <span className="badge bg-light text-success border ms-2 fs-11">
              <i className="fa-solid fa-ticket me-1"></i> {order.voucherCode}
            </span>
          )}
        </div>

        <div className="d-flex align-items-center gap-2 flex-wrap">
          {/* Nút Xem Chi Tiết */}
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm px-3 py-1 fw-600 rounded-2"
            onClick={() => onOpenDetails?.(order, orderNumber)}
          >
            {t("orders.details", "Chi tiết đơn hàng")}
          </button>

          {/* Nút Hủy Đơn Hàng nếu PENDING */}
          {isPending && (
            <button
              type="button"
              className="btn btn-outline-danger btn-sm px-3 py-1 fw-600 rounded-2"
              disabled={isCanceling}
              onClick={() => onCancelOrder?.(order.orderId, orderNumber)}
            >
              {isCanceling ? t("orders.cancelling", "Đang hủy...") : t("orders.cancelOrder", "Hủy đơn hàng")}
            </button>
          )}

          {/* CHÚ Ý: Bỏ hoàn toàn phần "Yêu Cầu Hoàn Tiền" theo yêu cầu người dùng */}
        </div>
      </div>
    </article>
  );
};

export default OrderCardItem;
