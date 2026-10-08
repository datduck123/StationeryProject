import { Navigate, Route, Routes } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";
import MainLayout from "../layouts/MainLayout";
import AdminBrandManagement from "../pages/Admin/AdminBrandManagement";
import AdminCategoryManagement from "../pages/Admin/AdminCategoryManagement";
import AdminDashboard from "../pages/Admin/AdminDashboard";
import AdminOrderManagement from "../pages/Admin/AdminOrderManagement";
import AdminUserManagement from "../pages/Admin/AdminUserManagement";
import ForgotPasswordPage from "../pages/Auth/ForgotPasswordPage";
import LoginPage from "../pages/Auth/LoginPage";
import Cart from "../pages/Cart/Cart";
import Checkout from "../pages/Checkout/Checkout";
import Home from "../pages/Home/Home";
import ProductDetail from "../pages/ProductDetail/ProductDetail";
import ProfilePage from "../pages/Profile/ProfilePage";
import OrderDetailPage from "../pages/Orders/OrderDetailPage";
import OrderHistoryPage from "../pages/Orders/OrderHistoryPage";
import OrderSuccessPage from "../pages/Orders/OrderSuccessPage";
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
        <Route path="/admin/categories" element={<AdminCategoryManagement />} />
        <Route path="/admin/brands" element={<AdminBrandManagement />} />
        <Route path="/admin/orders" element={<AdminOrderManagement />} />
        <Route path="/admin/orders/:id" element={<AdminOrderManagement />} />
      </Route>

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

        <Route
          path="/account/orders"
          element={<ProtectedRoute><OrderHistoryPage /></ProtectedRoute>}
        />
        <Route
          path="/account/orders/:id"
          element={<ProtectedRoute><OrderDetailPage /></ProtectedRoute>}
        />
        <Route
          path="/order-success"
          element={<ProtectedRoute><OrderSuccessPage /></ProtectedRoute>}
        />

        {/* Authentication Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<Navigate to="/" replace />} />
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
