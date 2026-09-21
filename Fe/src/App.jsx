// Migrated from: Template root
// React root component wrapping Router and CartProvider
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./providers/AuthContext";
import { CartProvider } from "./providers/CartContext";
import AppRoutes from "./routes/AppRoutes";

export const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <AppRoutes />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
