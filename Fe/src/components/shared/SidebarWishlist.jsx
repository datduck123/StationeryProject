import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCartContext } from "../../providers/CartContext";
import { getProductImage } from "../../services/productService";

const formatCurrency = (amount) => {
  if (amount == null) return "—";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

export const SidebarWishlist = () => {
  const {
    isWishlistOpen,
    closeWishlist,
    wishlist,
    removeFromWishlist,
    clearWishlist,
    openCart,
  } = useCartContext();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleProductClick = (productId) => {
    closeWishlist();
    if (productId) {
      navigate(`/product/${productId}`);
    }
  };

  return (
    <>
      <aside
        id="sidebar-wishlist"
        style={{
          right: isWishlistOpen ? "0" : "-101%",
          transition: "right 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
          boxShadow: isWishlistOpen ? "-5px 0 25px rgba(0,0,0,0.15)" : "none",
          display: "flex",
          flexDirection: "column",
          height: "100vh",
        }}
      >
        {/* Header */}
        <div className="title-cart-block mb-0 bg-lightest-gray p-24 d-flex align-items-center justify-content-between border-bottom">
          <div className="d-flex align-items-center gap-2">
            <i className="fa-solid fa-heart text-danger fs-18"></i>
            <h6 className="fw-700 medium-black mb-0">
              Sản phẩm yêu thích (
              {wishlist.length < 10 ? `0${wishlist.length}` : wishlist.length})
            </h6>
          </div>
          <button
            type="button"
            className="border-0 bg-transparent text-muted fs-18 p-1 cursor-pointer"
            onClick={closeWishlist}
            aria-label="Close wishlist"
            style={{ cursor: "pointer" }}
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Product List */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
          {wishlist.length === 0 ? (
            <div className="text-center py-5">
              <div
                style={{
                  width: "70px",
                  height: "70px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(233, 97, 63, 0.1)",
                  color: "#e9613f",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "30px",
                  margin: "0 auto 16px auto",
                }}
              >
                <i className="fa-regular fa-heart"></i>
              </div>
              <h6 className="fw-700 medium-black mb-2">
                Chưa có sản phẩm yêu thích nào
              </h6>
              <p className="text-muted fs-13 mb-4">
                Hãy nhấn vào biểu tượng trái tim ở các sản phẩm bạn quan tâm để lưu lại tại đây!
              </p>
              <Link
                to="/shop"
                className="admin-btn-primary d-inline-block text-decoration-none"
                onClick={closeWishlist}
                style={{ padding: "10px 24px", fontSize: "14px" }}
              >
                Khám phá cửa hàng ngay
              </Link>
            </div>
          ) : (
            <ul className="list-unstyled mb-0">
              {wishlist.map((item) => {
                const prodId = item.productId || item.id;
                const imgSrc = getProductImage(item);
                const stockQty = item.stockQuantity ?? item.stock_quantity ?? 0;
                const inStock = stockQty > 0;

                return (
                  <li
                    key={prodId}
                    className="p-3 mb-3 bg-white rounded-3 border d-flex gap-3 align-items-center position-relative shadow-sm"
                    style={{ transition: "all 0.2s ease" }}
                  >
                    {/* Thumbnail */}
                    <div
                      style={{
                        width: "72px",
                        height: "72px",
                        borderRadius: "10px",
                        backgroundColor: "#f8fafc",
                        border: "1px solid #eef2f6",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        overflow: "hidden",
                        cursor: "pointer",
                      }}
                      onClick={() => handleProductClick(prodId)}
                    >
                      <img
                        src={imgSrc}
                        alt={item.name}
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
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h6
                        className="fw-600 mb-1 text-truncate"
                        style={{
                          fontSize: "14px",
                          color: "#1e2229",
                          cursor: "pointer",
                        }}
                        onClick={() => handleProductClick(prodId)}
                        title={item.name}
                      >
                        {item.name}
                      </h6>

                      <div className="d-flex align-items-center gap-2 mb-1">
                        <span
                          className="fw-700"
                          style={{ color: "#e9613f", fontSize: "14px" }}
                        >
                          {formatCurrency(item.price)}
                        </span>
                        <span
                          className="badge"
                          style={{
                            fontSize: "10px",
                            backgroundColor: inStock ? "#e8f5e9" : "#ffebee",
                            color: inStock ? "#2e7d32" : "#c62828",
                          }}
                        >
                          {inStock ? "Còn hàng" : "Hết hàng"}
                        </span>
                      </div>

                      {/* Action links */}
                      <div className="d-flex align-items-center gap-3 mt-2">
                        <button
                          type="button"
                          className="btn btn-sm btn-link p-0 text-decoration-none"
                          style={{
                            fontSize: "12px",
                            color: "#e9613f",
                            fontWeight: 600,
                          }}
                          onClick={() => handleProductClick(prodId)}
                        >
                          Xem chi tiết →
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-link p-0 text-decoration-none text-muted"
                          style={{ fontSize: "12px", fontWeight: 500 }}
                          onClick={() => {
                            closeWishlist();
                            openCart();
                          }}
                        >
                          <i className="fa-solid fa-cart-plus me-1"></i>
                          Thêm giỏ
                        </button>
                      </div>
                    </div>

                    {/* Delete button */}
                    <button
                      type="button"
                      className="border-0 bg-transparent text-muted p-1"
                      style={{
                        position: "absolute",
                        top: "8px",
                        right: "8px",
                        cursor: "pointer",
                        fontSize: "14px",
                      }}
                      onClick={() => removeFromWishlist(prodId)}
                      title="Xóa khỏi danh sách yêu thích"
                    >
                      <i className="fa-regular fa-trash-can text-danger"></i>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer */}
        {wishlist.length > 0 && (
          <div className="p-3 border-top bg-light d-flex gap-2">
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm w-50 py-2 fs-13 fw-600 rounded-pill"
              onClick={clearWishlist}
            >
              <i className="fa-regular fa-trash-can me-1"></i> Xóa tất cả
            </button>
            <Link
              to="/shop"
              className="admin-btn-primary btn-sm w-50 py-2 fs-13 text-center text-decoration-none rounded-pill"
              onClick={closeWishlist}
            >
              Tiếp tục mua sắm
            </Link>
          </div>
        )}
      </aside>

      {/* Backdrop curtain */}
      <div
        id="sidebar-wishlist-curtain"
        onClick={closeWishlist}
        style={{
          display: isWishlistOpen ? "block" : "none",
          opacity: isWishlistOpen ? 1 : 0,
          transition: "opacity 0.25s ease-in-out",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          backdropFilter: "blur(2px)",
          position: "fixed",
          inset: 0,
          zIndex: 4999,
        }}
      ></div>
    </>
  );
};

export default SidebarWishlist;
