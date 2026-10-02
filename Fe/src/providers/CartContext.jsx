// Migrated from: assets/js/app.js, lines 58-104, 168-174, 430-445
import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [compareList, setCompareList] = useState([]);

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
    setQuickViewProduct(product);
  };

  const closeQuickView = (e) => {
    if (e) e.preventDefault();
    setQuickViewProduct(null);
  };

  const openCompare = (product, e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (product) {
      setCompareList((prev) => {
        const prodId = product.id || product.productId;
        if (prev.some((p) => (p.id || p.productId) === prodId)) {
          return prev;
        }
        if (prev.length >= 2) {
          return [prev[0], product];
        }
        return [...prev, product];
      });
    }
    setIsCompareOpen(true);
  };

  const addCompareProduct = (product) => {
    if (!product) return;
    setCompareList((prev) => {
      const prodId = product.id || product.productId;
      if (prev.some((p) => (p.id || p.productId) === prodId)) {
        return prev;
      }
      if (prev.length >= 2) {
        return [prev[0], product];
      }
      return [...prev, product];
    });
  };

  const removeCompareProduct = (productId) => {
    setCompareList((prev) => prev.filter((p) => (p.id || p.productId) !== productId));
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
        compareList,
        addCompareProduct,
        removeCompareProduct,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCartContext = () => useContext(CartContext);
export default CartContext;
