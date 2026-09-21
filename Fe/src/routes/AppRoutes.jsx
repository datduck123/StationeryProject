// Migrated from: index.html, shop-grid-sidebar.html, product-detail.html, cart.html, checkout.html
// React Router v6 route configuration
import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import Home from "../pages/Home/Home";
import ShopGridSidebar from "../pages/Shop/ShopGridSidebar";
import ProductDetail from "../pages/ProductDetail/ProductDetail";
import Cart from "../pages/Cart/Cart";
import Checkout from "../pages/Checkout/Checkout";

export const AppRoutes = () => {
  return (
    <Routes>
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
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
