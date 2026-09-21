// Migrated from: assets/js/app.js, lines 58-104, 168-174, 430-445
import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [isCompareOpen, setIsCompareOpen] = useState(false);

  const openCart = (e) => {
    if (e) e.preventDefault();
    setIsCartOpen(true);
  };

  const closeCart = (e) => {
    if (e) e.preventDefault();
    setIsCartOpen(false);
  };

  const toggleMobileMenu = (e) => {
    if (e) e.preventDefault();
    setIsMobileMenuOpen((prev) => !prev);
  };

  const closeMobileMenu = (e) => {
    if (e) e.preventDefault();
    setIsMobileMenuOpen(false);
  };

  const openQuickView = (product, e) => {
    if (e) e.preventDefault();
    setQuickViewProduct(
      product || {
        title: "Hardcover Notebook",
        price: "$180.00",
        oldPrice: "$200.00",
        image: "assets/media/products/large-image-1.png",
        rating: "★★★★★",
        reviews: "(02 Customer Reviews)",
        stock: "40 in stock, ready to ship",
        sku: "AF-001-KT",
        category: "Notebook",
      },
    );
  };

  const closeQuickView = (e) => {
    if (e) e.preventDefault();
    setQuickViewProduct(null);
  };

  const openCompare = (e) => {
    if (e) e.preventDefault();
    setIsCompareOpen(true);
  };

  const closeCompare = (e) => {
    if (e) e.preventDefault();
    setIsCompareOpen(false);
  };

  // Lock body scroll when mobile menu is opened
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.classList.add("locked");
    } else {
      document.body.classList.remove("locked");
    }
  }, [isMobileMenuOpen]);

  return (
    <CartContext.Provider
      value={{
        isCartOpen,
        openCart,
        closeCart,
        isMobileMenuOpen,
        toggleMobileMenu,
        closeMobileMenu,
        quickViewProduct,
        openQuickView,
        closeQuickView,
        isCompareOpen,
        openCompare,
        closeCompare,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCartContext = () => useContext(CartContext);
export default CartContext;
