import { Navigate, Route, Routes } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";
import MainLayout from "../layouts/MainLayout";
import AdminBrandManagement from "../pages/Admin/AdminBrandManagement";
import AdminCategoryManagement from "../pages/Admin/AdminCategoryManagement";
import AdminDashboard from "../pages/Admin/AdminDashboard";
import AdminProductManagement from "../pages/Admin/AdminProductManagement";
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
      {/* Admin routes protected by AdminRoute and rendered inside AdminLayout */}
      <Route
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminUserManagement />} />
        <Route path="/admin/products" element={<AdminProductManagement />} />
        <Route path="/admin/categories" element={<AdminCategoryManagement />} />
        <Route path="/admin/brands" element={<AdminBrandManagement />} />
      </Route>

      {/* Public and Customer routes in MainLayout */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/index.html" element={<Navigate to="/" replace />} />
        <Route path="/shop" element={<ShopGridSidebar />} />
        <Route path="/shop-grid.html" element={<Navigate to="/shop" replace />} />
        <Route path="/shop-grid-sidebar.html" element={<Navigate to="/shop" replace />} />
        <Route path="/product-detail" element={<ProductDetail />} />
        <Route path="/product-detail.html" element={<Navigate to="/product-detail" replace />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/cart.html" element={<Navigate to="/cart" replace />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/checkout.html" element={<Navigate to="/checkout" replace />} />

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
