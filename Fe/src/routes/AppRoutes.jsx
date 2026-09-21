// Migrated from: index.html, shop-grid-sidebar.html, product-detail.html, cart.html, checkout.html
// React Router v6 route configuration
import { Navigate, Route, Routes } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import AdminDashboard from "../pages/Admin/AdminDashboard";
import LoginPage from "../pages/Auth/LoginPage";
import RegisterPage from "../pages/Auth/RegisterPage";
import Cart from "../pages/Cart/Cart";
import Checkout from "../pages/Checkout/Checkout";
import Home from "../pages/Home/Home";
import ProductDetail from "../pages/ProductDetail/ProductDetail";
import ShopGridSidebar from "../pages/Shop/ShopGridSidebar";

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/admin" element={<AdminDashboard />} />
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/index.html" element={<Home />} />
        <Route path="/shop" element={<ShopGridSidebar />} />
        <Route path="/shop-grid.html" element={<ShopGridSidebar />} />
        <Route path="/shop-grid-sidebar.html" element={<ShopGridSidebar />} />
        <Route path="/product-detail" element={<ProductDetail />} />
        <Route path="/product-detail.html" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/cart.html" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/checkout.html" element={<Checkout />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
