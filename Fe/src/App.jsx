// Migrated from: Template root
// React root component wrapping Router and CartProvider
import { BrowserRouter } from "react-router-dom";
import { CartProvider } from "./providers/CartContext";
import AppRoutes from "./routes/AppRoutes";

export const App = () => {
  return (
    <BrowserRouter>
      <CartProvider>
        <AppRoutes />
      </CartProvider>
    </BrowserRouter>
  );
};

export default App;
