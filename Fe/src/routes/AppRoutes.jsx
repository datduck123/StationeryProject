import { Navigate, Route, Routes } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import AdminDashboard from "../pages/Admin/AdminDashboard";
import AdminUserManagement from "../pages/Admin/AdminUserManagement";
import ForgotPasswordPage from "../pages/Auth/ForgotPasswordPage";
import LoginPage from "../pages/Auth/LoginPage";
import RegisterPage from "../pages/Auth/RegisterPage";
import Cart from "../pages/Cart/Cart";
import Checkout from "../pages/Checkout/Checkout";
import Home from "../pages/Home/Home";
import ProductDetail from "../pages/ProductDetail/ProductDetail";
import ProfilePage from "../pages/Profile/ProfilePage";
import ShopGridSidebar from "../pages/Shop/ShopGridSidebar";
import AdminRoute from "./AdminRoute";
import ProtectedRoute from "./ProtectedRoute";

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Admin routes protected by AdminRoute */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <AdminRoute>
            <AdminUserManagement />
          </AdminRoute>
        }
      />

      {/* Public and Customer routes in MainLayout */}
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

        {/* Authentication Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* Customer Profile Route (Protected) */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
