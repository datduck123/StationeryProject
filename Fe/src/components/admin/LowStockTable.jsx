import React from "react";
import { Link } from "react-router-dom";

const formatCurrency = (val) => {
  if (val === undefined || val === null) return "0 ₫";
  const num = typeof val === "string" ? parseFloat(val) : val;
  if (isNaN(num)) return "0 ₫";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(num);
};

export const LowStockTable = ({
  products = [],
  loading = false,
  threshold = 5,
  onRefresh,
}) => {
  return (
    <div className="card border-0 shadow-sm rounded-3 p-4 bg-white h-100 d-flex flex-column">
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <div className="d-flex align-items-center gap-2.5">
          <div
            className="d-flex align-items-center justify-content-center rounded-3 bg-danger-subtle text-danger"
            style={{ width: "40px", height: "40px" }}
          >
            <i className="fa-solid fa-triangle-exclamation fs-18"></i>
          </div>
          <div>
            <h5 className="fw-700 medium-black mb-0 d-flex align-items-center gap-2">
              Cảnh báo tồn kho thấp
              <span className="badge bg-danger-subtle text-danger px-2 py-0.5 rounded-pill fs-11 fw-600">
                Tồn ≤ {threshold}
              </span>
            </h5>
            <span className="fs-12 text-muted">
              Các mặt hàng cần bổ sung số lượng kịp thời
            </span>
          </div>
        </div>

        <div className="d-flex align-items-center gap-2">
          {onRefresh && (
            <button
              type="button"
              className="btn btn-sm btn-outline-light text-muted border rounded-pill px-2.5"
              onClick={onRefresh}
              title="Làm mới danh sách"
            >
              <i className={`fa-solid fa-rotate-right ${loading ? "fa-spin" : ""}`}></i>
            </button>
          )}
          {/* Nút chuyển nhanh tới trang xử lý catalog */}
          <Link
            to="/shop"
            className="btn btn-sm btn-outline-danger rounded-pill px-3 fs-12 fw-600 d-flex align-items-center gap-1.5 hover-scale"
          >
            <span>Xem kho hàng</span>
            <i className="fa-solid fa-arrow-right fs-11"></i>
          </Link>
        </div>
      </div>

      {/* Body Table */}
      <div className="table-responsive flex-grow-1">
        {loading ? (
          <div className="d-flex flex-column align-items-center justify-content-center py-5">
            <div className="spinner-border spinner-border-sm text-danger mb-2" role="status"></div>
            <span className="text-muted fs-13">Đang kiểm tra mức tồn kho...</span>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-5">
            <div
              className="d-inline-flex align-items-center justify-content-center rounded-circle bg-success-subtle text-success mb-2"
              style={{ width: "48px", height: "48px" }}
            >
              <i className="fa-solid fa-circle-check fs-20"></i>
            </div>
            <h6 className="fw-700 medium-black mb-1 fs-14">Tồn kho an toàn</h6>
            <p className="text-muted fs-12 mb-0">
              Hiện không có sản phẩm nào dưới ngưỡng cảnh báo (≤ {threshold} món).
            </p>
          </div>
        ) : (
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr className="fs-11 text-uppercase text-muted">
                <th>Mã SKU</th>
                <th>Sản phẩm</th>
                <th>Đơn giá</th>
                <th>Tồn kho</th>
                <th>Mức độ</th>
                <th className="text-end">Xử lý</th>
              </tr>
            </thead>
            <tbody>
              {products.map((prod) => {
                const isCritical = prod.stock <= 2;
                return (
                  <tr key={prod.productId}>
                    <td>
                      <span className="badge bg-light text-dark border fw-600 fs-11">
                        {prod.sku}
                      </span>
                    </td>
                    <td>
                      <div className="fw-600 fs-13 medium-black text-truncate" style={{ maxWidth: "220px" }}>
                        {prod.name}
                      </div>
                      <span className="fs-11 text-muted">
                        {prod.categoryName || "Chưa phân loại"} • {prod.brandName || "Thương hiệu"}
                      </span>
                    </td>
                    <td className="fw-600 fs-13">
                      {formatCurrency(prod.price)}
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          isCritical ? "bg-danger text-white" : "bg-warning-subtle text-warning border border-warning-subtle"
                        } fs-12 px-2.5 py-1 rounded-pill fw-700`}
                      >
                        {prod.stock === 0 ? "Hết hàng" : `Còn ${prod.stock}`}
                      </span>
                    </td>
                    <td>
                      {isCritical ? (
                        <span className="badge bg-danger-subtle text-danger fs-11">
                          <i className="fa-solid fa-bolt me-1"></i> Khẩn cấp
                        </span>
                      ) : (
                        <span className="badge bg-warning-subtle text-warning fs-11">
                          Sắp hết
                        </span>
                      )}
                    </td>
                    {/* Nút chuyển nhanh tới trang xử lý */}
                    <td className="text-end">
                      <Link
                        to={`/shop`}
                        className="btn btn-sm btn-light border rounded-pill px-2.5 py-1 fs-11 fw-600 text-dark hover-card"
                        title={`Xem chi tiết sản phẩm ${prod.sku}`}
                      >
                        <i className="fa-solid fa-arrow-up-right-from-square me-1 text-danger"></i>
                        Xử lý
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer Info */}
      {products.length > 0 && (
        <div className="pt-3 border-top mt-auto d-flex justify-content-between align-items-center fs-12 text-muted">
          <span>
            <i className="fa-solid fa-circle-info text-warning me-1"></i>
            Có <strong>{products.length} sản phẩm</strong> cần kiểm tra nguồn cung.
          </span>
          <Link to="/shop" className="text-decoration-none fw-600 text-danger fs-12">
            Quản lý kho hàng &rarr;
          </Link>
        </div>
      )}
    </div>
  );
};

export default LowStockTable;
