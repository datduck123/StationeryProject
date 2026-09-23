// Migrated from: Template root
// React root component wrapping Router and CartProvider
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./providers/AuthContext";
import { CartProvider } from "./providers/CartContext";
import { ToastProvider } from "./providers/ToastContext";
import AppRoutes from "./routes/AppRoutes";

export const App = () => {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <AppRoutes />
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
};

export default App;
