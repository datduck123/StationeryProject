import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../providers/AuthContext";
import "../../styles/admin.css";

export const AdminDashboard = () => {
  const { user } = useAuth();
  const [dateFilter, setDateFilter] = useState("week");

  // Weekly bar data for chart
  const weeklyChartData = [
    { day: "Mon", height: "45%", value: "$3,800", orders: 28 },
    { day: "Tue", height: "60%", value: "$5,200", orders: 36 },
    { day: "Wed", height: "85%", value: "$7,100", orders: 48, active: true },
    { day: "Thu", height: "70%", value: "$5,900", orders: 41 },
    { day: "Fri", height: "90%", value: "$8,400", orders: 55 },
    { day: "Sat", height: "95%", value: "$9,200", orders: 62 },
    { day: "Sun", height: "40%", value: "$3,400", orders: 22 },
  ];

  // Recent Stationery Orders
  const recentOrders = [
    {
      id: "ORD-9481",
      customer: "Tran Van Minh",
      email: "minh.tran@gmail.com",
      items: "Pilot Custom 74 Fountain Pen + MD Notebook A5",
      amount: "$201.50",
      payment: "Credit Card (Paid)",
      status: "DELIVERED",
      date: "Today, 14:20",
    },
    {
      id: "ORD-9480",
      customer: "Nguyen Thi Lan",
      email: "lan.nguyen@outlook.com",
      items: "Tombow Dual Brush Pens Pastel 10-Set",
      amount: "$28.00",
      payment: "COD",
      status: "PROCESSING",
      date: "Today, 11:05",
    },
    {
      id: "ORD-9479",
      customer: "Le Hoang Nam",
      email: "nam.le@gmail.com",
      items: "Kokuyo Campus Smart Ring Binder + Refills",
      amount: "$45.20",
      payment: "VNPAY (Paid)",
      status: "SHIPPED",
      date: "Yesterday",
    },
    {
      id: "ORD-9478",
      customer: "Pham Thu Ha",
      email: "ha.pham@yahoo.com",
      items: "Faber-Castell Polychromos 24 Tin + Sketchpad",
      amount: "$72.90",
      payment: "Credit Card (Paid)",
      status: "DELIVERED",
      date: "21 Sep 2026",
    },
    {
      id: "ORD-9477",
      customer: "Sarah Jenkins",
      email: "sarah.j@example.com",
      items: "Zebra Sarasa Clip Vintage Gel Pens Full Set",
      amount: "$34.00",
      payment: "PayPal (Paid)",
      status: "DELIVERED",
      date: "20 Sep 2026",
    },
  ];

  // Best Sellers
  const bestSellers = [
    {
      name: "Pilot Custom 74 Fountain Pen",
      brand: "Pilot",
      category: "Pens & Writing",
      price: "$185.00",
      sales: "92 units",
      revenue: "$17,020",
    },
    {
      name: "Midori MD Notebook A5 Dot Grid",
      brand: "Midori",
      category: "Notebooks & Paper",
      price: "$16.50",
      sales: "240 units",
      revenue: "$3,960",
    },
    {
      name: "Tombow Dual Brush Pens (Pastel Set)",
      brand: "Tombow",
      category: "Art Supplies",
      price: "$28.00",
      sales: "180 units",
      revenue: "$5,040",
    },
    {
      name: "Kokuyo Campus Smart Binder B5",
      brand: "Kokuyo",
      category: "Filing & Binders",
      price: "$12.00",
      sales: "310 units",
      revenue: "$3,720",
    },
    {
      name: "Faber-Castell Polychromos 24",
      brand: "Faber-Castell",
      category: "Art & Colors",
      price: "$54.00",
      sales: "85 units",
      revenue: "$4,590",
    },
  ];

  return (
    <div className="p-4">
      {/* Welcome Banner */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h3 className="admin-page-title mb-1 fw-700 medium-black">
            Stationery Tales CMS Overview
          </h3>
          <p className="admin-page-desc text-muted fs-14 mb-0">
            Welcome back, <strong>{user?.fullName || "Administrator"}</strong>.
            Here is your store's live commercial metrics, orders, and catalog
            status.
          </p>
        </div>

        <div className="btn-group btn-group-sm bg-white border rounded-pill p-1 shadow-sm">
          <button
            type="button"
            className={`btn btn-sm rounded-pill px-3 fw-600 ${
              dateFilter === "today"
                ? "btn-dark bg-color-primary border-0"
                : "btn-light border-0"
            }`}
            onClick={() => setDateFilter("today")}
          >
            Today
          </button>
          <button
            type="button"
            className={`btn btn-sm rounded-pill px-3 fw-600 ${
              dateFilter === "week"
                ? "btn-dark bg-color-primary border-0"
                : "btn-light border-0"
            }`}
            onClick={() => setDateFilter("week")}
          >
            This Week
          </button>
          <button
            type="button"
            className={`btn btn-sm rounded-pill px-3 fw-600 ${
              dateFilter === "month"
                ? "btn-dark bg-color-primary border-0"
                : "btn-light border-0"
            }`}
            onClick={() => setDateFilter("month")}
          >
            This Month
          </button>
        </div>
      </div>

      {/* 4 Metric Stats Cards */}
      <div className="row g-3 mb-4">
        {/* Metric 1: Revenue */}
        <div className="col-xl-3 col-sm-6">
          <div className="admin-stat-card p-3 bg-white rounded-3 border shadow-sm">
            <div className="d-flex justify-content-between align-items-start mb-2">
              <span className="text-muted fs-12 fw-600 text-uppercase">
                Gross Revenue
              </span>
              <span className="badge bg-success-subtle text-success fs-11 fw-600">
                +14.2%
              </span>
            </div>
            <h3 className="mb-1 fw-700 medium-black">$48,250.00</h3>
            <p className="text-muted fs-12 mb-0">
              <i className="fa-solid fa-arrow-trend-up text-success me-1"></i>
              +$5,980 vs previous period
            </p>
          </div>
        </div>

        {/* Metric 2: Total Orders */}
        <div className="col-xl-3 col-sm-6">
          <div className="admin-stat-card p-3 bg-white rounded-3 border shadow-sm">
            <div className="d-flex justify-content-between align-items-start mb-2">
              <span className="text-muted fs-12 fw-600 text-uppercase">
                Total Orders
              </span>
              <span className="badge bg-primary-subtle text-primary fs-11 fw-600">
                +8.5%
              </span>
            </div>
            <h3 className="mb-1 fw-700 medium-black">1,280</h3>
            <p className="text-muted fs-12 mb-0">
              <i className="fa-solid fa-box text-primary me-1"></i>
              98 orders waiting shipment
            </p>
          </div>
        </div>

        {/* Metric 3: Active Categories & Brands */}
        <div className="col-xl-3 col-sm-6">
          <div className="admin-stat-card p-3 bg-white rounded-3 border shadow-sm">
            <div className="d-flex justify-content-between align-items-start mb-2">
              <span className="text-muted fs-12 fw-600 text-uppercase">
                Stationery Catalog
              </span>
              <span className="badge bg-info-subtle text-info fs-11 fw-600">
                Active
              </span>
            </div>
            <h3 className="mb-1 fw-700 medium-black">485 items</h3>
            <p className="text-muted fs-12 mb-0">
              Across 7 categories & 7 brands
            </p>
          </div>
        </div>

        {/* Metric 4: Registered Users */}
        <div className="col-xl-3 col-sm-6">
          <div className="admin-stat-card p-3 bg-white rounded-3 border shadow-sm">
            <div className="d-flex justify-content-between align-items-start mb-2">
              <span className="text-muted fs-12 fw-600 text-uppercase">
                Registered Users
              </span>
              <span className="badge bg-warning-subtle text-warning fs-11 fw-600">
                +18 this week
              </span>
            </div>
            <h3 className="mb-1 fw-700 medium-black">342</h3>
            <p className="text-muted fs-12 mb-0">
              <i className="fa-solid fa-users text-warning me-1"></i>
              99.2% account active rate
            </p>
          </div>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-3 col-sm-6">
          <Link
            to="/admin/users"
            className="text-decoration-none card border-0 shadow-sm rounded-3 p-3 bg-white h-100 hover-card"
            style={{ transition: "transform 0.2s, box-shadow 0.2s" }}
          >
            <div className="d-flex align-items-center gap-3">
              <div
                className="d-flex align-items-center justify-content-center rounded-3 bg-primary-subtle text-primary"
                style={{ width: "46px", height: "46px" }}
              >
                <i className="fa-solid fa-users-gear fs-20"></i>
              </div>
              <div>
                <h6 className="fw-700 medium-black mb-1">User Management</h6>
                <span className="fs-12 text-muted">
                  Accounts, roles, statuses
                </span>
              </div>
            </div>
          </Link>
        </div>

        <div className="col-md-3 col-sm-6">
          <Link
            to="/admin/categories"
            className="text-decoration-none card border-0 shadow-sm rounded-3 p-3 bg-white h-100 hover-card"
          >
            <div className="d-flex align-items-center gap-3">
              <div
                className="d-flex align-items-center justify-content-center rounded-3"
                style={{
                  width: "46px",
                  height: "46px",
                  backgroundColor: "rgba(233, 97, 63, 0.12)",
                  color: "#e9613f",
                }}
              >
                <i className="fa-solid fa-layer-group fs-20"></i>
              </div>
              <div>
                <h6 className="fw-700 medium-black mb-1">Categories</h6>
                <span className="fs-12 text-muted">
                  7 store classifications
                </span>
              </div>
            </div>
          </Link>
        </div>

        <div className="col-md-3 col-sm-6">
          <Link
            to="/admin/brands"
            className="text-decoration-none card border-0 shadow-sm rounded-3 p-3 bg-white h-100 hover-card"
          >
            <div className="d-flex align-items-center gap-3">
              <div
                className="d-flex align-items-center justify-content-center rounded-3 bg-success-subtle text-success"
                style={{ width: "46px", height: "46px" }}
              >
                <i className="fa-solid fa-certificate fs-20"></i>
              </div>
              <div>
                <h6 className="fw-700 medium-black mb-1">Brand Partners</h6>
                <span className="fs-12 text-muted">
                  Pilot, Midori, Tombow...
                </span>
              </div>
            </div>
          </Link>
        </div>

        <div className="col-md-3 col-sm-6">
          <Link
            to="/admin/products"
            className="text-decoration-none card border-0 shadow-sm rounded-3 p-3 bg-white h-100 hover-card"
          >
            <div className="d-flex align-items-center gap-3">
              <div
                className="d-flex align-items-center justify-content-center rounded-3 bg-info-subtle text-info"
                style={{ width: "46px", height: "46px" }}
              >
                <i className="fa-solid fa-boxes-stacked fs-20"></i>
              </div>
              <div>
                <h6 className="fw-700 medium-black mb-1">Product Inventory</h6>
                <span className="fs-12 text-muted">Manage catalog & stock</span>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Chart & Order Status Grid */}
      <div className="row g-4 mb-4">
        {/* Weekly Revenue Bar Chart */}
        <div className="col-lg-8">
          <div className="bg-white rounded-3 border shadow-sm p-4 h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h5 className="fw-700 medium-black mb-1">
                  Sales & Revenue Trends
                </h5>
                <p className="text-muted fs-13 mb-0">
                  Daily stationery order volume for this week.
                </p>
              </div>
              <span className="badge bg-light text-muted border px-2 py-1 fs-12">
                Peak: Sat ($9,200)
              </span>
            </div>

            {/* Custom Bar Visualization */}
            <div
              className="d-flex align-items-end justify-content-between pt-4 px-2"
              style={{ height: "230px" }}
            >
              {weeklyChartData.map((item, index) => (
                <div
                  key={index}
                  className="d-flex flex-column align-items-center flex-grow-1"
                >
                  <div
                    className="w-100 d-flex flex-column justify-content-end align-items-center"
                    style={{ height: "180px" }}
                  >
                    <span
                      className="fs-11 fw-600 mb-1 text-muted"
                      style={{ fontSize: "11px" }}
                    >
                      {item.value}
                    </span>
                    <div
                      className="rounded-top-3 w-50"
                      style={{
                        height: item.height,
                        backgroundColor: item.active
                          ? "#e9613f"
                          : "rgba(233, 97, 63, 0.35)",
                        transition: "all 0.3s ease",
                      }}
                      title={`${item.day}: ${item.value} (${item.orders} orders)`}
                    ></div>
                  </div>
                  <span className="fs-12 fw-600 text-muted mt-2">
                    {item.day}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Status Distribution */}
        <div className="col-lg-4">
          <div className="bg-white rounded-3 border shadow-sm p-4 h-100">
            <h5 className="fw-700 medium-black mb-1">Fulfillment Status</h5>
            <p className="text-muted fs-13 mb-4">
              Real-time dispatch distribution.
            </p>

            <div className="mb-4">
              <div className="d-flex justify-content-between fs-13 fw-600 mb-1">
                <span>
                  <i className="fa-solid fa-circle-check text-success me-2"></i>
                  Delivered Orders
                </span>
                <span>78%</span>
              </div>
              <div className="progress" style={{ height: "8px" }}>
                <div
                  className="progress-bar bg-success"
                  style={{ width: "78%" }}
                ></div>
              </div>
            </div>

            <div className="mb-4">
              <div className="d-flex justify-content-between fs-13 fw-600 mb-1">
                <span>
                  <i className="fa-solid fa-truck-fast text-primary me-2"></i>
                  In Transit
                </span>
                <span>14%</span>
              </div>
              <div className="progress" style={{ height: "8px" }}>
                <div
                  className="progress-bar bg-primary"
                  style={{ width: "14%" }}
                ></div>
              </div>
            </div>

            <div className="mb-4">
              <div className="d-flex justify-content-between fs-13 fw-600 mb-1">
                <span>
                  <i className="fa-solid fa-clock text-warning me-2"></i>
                  Processing & Packing
                </span>
                <span>8%</span>
              </div>
              <div className="progress" style={{ height: "8px" }}>
                <div
                  className="progress-bar bg-warning"
                  style={{ width: "8%" }}
                ></div>
              </div>
            </div>

            <div className="p-3 bg-light rounded-3 fs-12 text-muted mt-3">
              <i className="fa-solid fa-bell text-warning me-1"></i>
              <strong>98 packages</strong> queued for afternoon courier pickup.
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders & Best Sellers */}
      <div className="row g-4">
        {/* Recent Orders Table */}
        <div className="col-xl-7">
          <div className="bg-white rounded-3 border shadow-sm p-4 h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h5 className="fw-700 medium-black mb-1">
                  Recent Customer Orders
                </h5>
                <p className="text-muted fs-13 mb-0">
                  Latest purchases on storefront.
                </p>
              </div>
              <Link
                to="/admin/users"
                className="btn btn-sm btn-outline-secondary fs-12 rounded-pill"
              >
                View Customers
              </Link>
            </div>

            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr className="fs-11 text-uppercase text-muted">
                    <th>Order</th>
                    <th>Customer</th>
                    <th>Products</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((ord) => (
                    <tr key={ord.id}>
                      <td>
                        <span className="fw-600 fs-12 text-primary">
                          {ord.id}
                        </span>
                        <div className="fs-10 text-muted">{ord.date}</div>
                      </td>
                      <td>
                        <div className="fw-600 fs-13 medium-black">
                          {ord.customer}
                        </div>
                        <div className="fs-11 text-muted">{ord.email}</div>
                      </td>
                      <td style={{ maxWidth: "200px" }}>
                        <span className="text-truncate d-inline-block w-100 fs-12 text-muted">
                          {ord.items}
                        </span>
                      </td>
                      <td>
                        <div className="fw-700 fs-13">{ord.amount}</div>
                        <div className="fs-10 text-muted">{ord.payment}</div>
                      </td>
                      <td>
                        {ord.status === "DELIVERED" ? (
                          <span className="badge bg-success-subtle text-success fs-11">
                            Delivered
                          </span>
                        ) : ord.status === "SHIPPED" ? (
                          <span className="badge bg-primary-subtle text-primary fs-11">
                            Shipped
                          </span>
                        ) : (
                          <span className="badge bg-warning-subtle text-warning fs-11">
                            Processing
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Best Sellers */}
        <div className="col-xl-5">
          <div className="bg-white rounded-3 border shadow-sm p-4 h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h5 className="fw-700 medium-black mb-1">Top Selling Items</h5>
                <p className="text-muted fs-13 mb-0">
                  Highest grossing products this month.
                </p>
              </div>
              <Link
                to="/admin/categories"
                className="btn btn-sm btn-outline-secondary fs-12 rounded-pill"
              >
                Categories
              </Link>
            </div>

            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr className="fs-11 text-uppercase text-muted">
                    <th>Product</th>
                    <th>Price</th>
                    <th>Sold</th>
                    <th className="text-end">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {bestSellers.map((item, idx) => (
                    <tr key={idx}>
                      <td>
                        <div className="fw-600 fs-13 medium-black">
                          {item.name}
                        </div>
                        <span className="fs-11 text-muted">
                          {item.brand} • {item.category}
                        </span>
                      </td>
                      <td className="fs-12 fw-600">{item.price}</td>
                      <td>
                        <span className="badge bg-light text-dark border fs-11">
                          {item.sales}
                        </span>
                      </td>
                      <td className="text-end fw-700 text-success fs-13">
                        {item.revenue}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
