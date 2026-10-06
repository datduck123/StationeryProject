// Migrated from: assets/js/app.js, lines 58-104, 168-174, 430-445
import { createContext, useContext, useState, useEffect } from "react";
import { useToast } from "./ToastContext";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { showToast } = useToast();

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  // Wishlist state persisted in localStorage
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem("stationery_wishlist");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save wishlist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("stationery_wishlist", JSON.stringify(wishlist));
    } catch (e) {
      console.warn("Failed to persist wishlist:", e);
    }
  }, [wishlist]);

  const openCart = (e) => {
    if (e && typeof e.preventDefault === "function") e.preventDefault();
    setIsCartOpen(true);
  };

  const closeCart = (e) => {
    if (e && typeof e.preventDefault === "function") e.preventDefault();
    setIsCartOpen(false);
  };

  const openWishlist = (e) => {
    if (e && typeof e.preventDefault === "function") e.preventDefault();
    setIsWishlistOpen(true);
  };

  const closeWishlist = (e) => {
    if (e && typeof e.preventDefault === "function") e.preventDefault();
    setIsWishlistOpen(false);
  };

  const isInWishlist = (productId) => {
    if (!productId) return false;
    return wishlist.some(
      (item) => String(item.productId || item.id) === String(productId)
    );
  };

  const toggleWishlist = (product) => {
    if (!product) return;
    const prodId = product.productId || product.id;
    if (!prodId) return;

    const exists = wishlist.some(
      (item) => String(item.productId || item.id) === String(prodId)
    );

    if (exists) {
      showToast?.(
        `Đã xóa "${product.name || "Sản phẩm"}" khỏi danh sách yêu thích.`,
        "info"
      );
      setWishlist((prev) =>
        prev.filter(
          (item) => String(item.productId || item.id) !== String(prodId)
        )
      );
    } else {
      showToast?.(
        `Đã thêm "${product.name || "Sản phẩm"}" vào danh sách yêu thích!`,
        "success"
      );
      // Auto-open wishlist sidebar so user can see and navigate to saved products
      setTimeout(() => setIsWishlistOpen(true), 300);
      setWishlist((prev) => [...prev, product]);
    }
  };

  const removeFromWishlist = (productId) => {
    if (!productId) return;
    const item = wishlist.find(
      (p) => String(p.productId || p.id) === String(productId)
    );
    if (item) {
      showToast?.(
        `Đã xóa "${item.name || "Sản phẩm"}" khỏi danh sách yêu thích.`,
        "info"
      );
    }
    setWishlist((prev) =>
      prev.filter(
        (p) => String(p.productId || p.id) !== String(productId)
      )
    );
  };

  const clearWishlist = () => {
    if (wishlist.length === 0) return;
    setWishlist([]);
    showToast?.("Đã xóa toàn bộ danh sách yêu thích.", "info");
  };

  const toggleMobileMenu = (e) => {
    if (e && typeof e.preventDefault === "function") e.preventDefault();
    setIsMobileMenuOpen((prev) => !prev);
  };

  const closeMobileMenu = (e) => {
    if (e && typeof e.preventDefault === "function") e.preventDefault();
    setIsMobileMenuOpen(false);
  };

  const openQuickView = (product, e) => {
    if (e && typeof e.preventDefault === "function") e.preventDefault();
    setQuickViewProduct(product);
  };

  const closeQuickView = (e) => {
    if (e && typeof e.preventDefault === "function") {
      if (!e.target?.closest?.("a") && !e.target?.closest?.("button")) {
        e.preventDefault();
      }
    }
    setQuickViewProduct(null);
  };

  // Lock body scroll when mobile menu, cart, or wishlist is opened
  useEffect(() => {
    if (isMobileMenuOpen || isCartOpen || isWishlistOpen) {
      document.body.classList.add("locked");
    } else {
      document.body.classList.remove("locked");
    }
  }, [isMobileMenuOpen, isCartOpen, isWishlistOpen]);

  return (
    <CartContext.Provider
      value={{
        isCartOpen,
        openCart,
        closeCart,
        isWishlistOpen,
        openWishlist,
        closeWishlist,
        wishlist,
        wishlistCount: wishlist.length,
        toggleWishlist,
        removeFromWishlist,
        clearWishlist,
        isInWishlist,
        isMobileMenuOpen,
        toggleMobileMenu,
        closeMobileMenu,
        quickViewProduct,
        openQuickView,
        closeQuickView,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCartContext = () => useContext(CartContext);
export default CartContext;
