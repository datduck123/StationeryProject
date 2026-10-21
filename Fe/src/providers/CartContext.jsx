import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "./AuthContext";
import { useToast } from "./ToastContext";
import cartService from "../services/cartService";

const CartContext = createContext();

const extractMessage = (error, fallback) =>
  error?.response?.data?.message || error?.response?.data?.error || error?.message || fallback;

const normalizeCartItem = (item) => {
  const product = item?.product || {};
  const quantity = Number(item?.quantity || 0);
  const unitPrice = Number(item?.unitPrice ?? item?.price ?? product?.price ?? 0);
  return {
    ...item,
    cartItemId: item?.cartItemId ?? item?.id,
    productId: item?.productId ?? product?.productId ?? product?.id,
    productName: item?.productName ?? item?.name ?? item?.title ?? product?.name ?? "",
    imageUrl: item?.imageUrl ?? item?.productImage ?? product?.imageUrl,
    quantity,
    unitPrice,
    subtotal: Number(item?.subtotal ?? unitPrice * quantity),
    stockQuantity: Number(
      item?.stockQuantity ?? item?.currentStock ?? item?.availableStock ?? product?.stockQuantity ?? Number.MAX_SAFE_INTEGER,
    ),
  };
};

const normalizeCart = (payload) => {
  const raw = payload?.data ?? payload ?? {};
  const rawItems = Array.isArray(raw)
    ? raw
    : raw?.items ?? raw?.cartItems ?? raw?.content ?? [];
  const items = Array.isArray(rawItems) ? rawItems.map(normalizeCartItem) : [];
  const computedSubtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  return {
    ...raw,
    items,
    subtotal: Number(raw?.subtotal ?? raw?.total ?? computedSubtotal),
    totalItems: Number(
      raw?.totalItems ?? raw?.totalItemsCount ?? items.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
    ),
  };
};

export const CartProvider = ({ children }) => {
  const { user, openAuthModal } = useAuth();
  const { showToast } = useToast();

  // Drawer / UI State
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [cart, setCart] = useState(() => normalizeCart(null));
  const [cartLoading, setCartLoading] = useState(false);
  const [cartError, setCartError] = useState("");
  const [pendingItemIds, setPendingItemIds] = useState(() => new Set());

  // Cart API State
  const [cart, setCart] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const openCart = (e) => {
    if (e && typeof e.preventDefault === "function") e.preventDefault();
    setIsCartOpen(true);
  };

  const closeCart = (e) => {
    if (e && typeof e.preventDefault === "function") e.preventDefault();
    setIsCartOpen(false);
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
    if (e && typeof e.preventDefault === "function") e.preventDefault();
    setQuickViewProduct(null);
  };

  const openCompare = (e) => {
    if (e && typeof e.preventDefault === "function") e.preventDefault();
    setIsCompareOpen(true);
  };

  const updateCartItem = useCallback(async (cartItemId, quantity) => {
    const safeQuantity = Number(quantity);
    if (!cartItemId || !Number.isInteger(safeQuantity) || safeQuantity < 1) return false;
    setPending(cartItemId, true);
    try {
      await cartService.updateItem(cartItemId, safeQuantity);
      await refreshCart({ silent: true });
      return true;
    } catch (error) {
      showToast?.(extractMessage(error, t("commerce.cartQuantityError")), "error");
      return false;
    } finally {
      setPending(cartItemId, false);
    }
  }, [refreshCart, setPending, showToast, t]);

  const removeCartItem = useCallback(async (cartItemId) => {
    if (!cartItemId) return false;
    setPending(cartItemId, true);
    try {
      await cartService.removeItem(cartItemId);
      await refreshCart({ silent: true });
      showToast?.(t("commerce.cartRemoveSuccess"), "info");
      return true;
    } catch (error) {
      showToast?.(extractMessage(error, t("commerce.cartRemoveError")), "error");
      return false;
    } finally {
      setPending(cartItemId, false);
    }
  }, [refreshCart, setPending, showToast, t]);

  const closeCompare = (e) => {
    if (e && typeof e.preventDefault === "function") e.preventDefault();
    setIsCompareOpen(false);
  };

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.classList.add("locked");
    } else {
      document.body.classList.remove("locked");
    }
  }, [isMobileMenuOpen]);

  /**
   * Fetch current user's cart from backend
   */
  const fetchCart = useCallback(async () => {
    if (!user) {
      setCart(null);
      return;
    }
    setIsLoading(true);
    try {
      const data = await cartService.getCart();
      setCart(data);
      if (data?.notifications && data.notifications.length > 0) {
        data.notifications.forEach((msg) => showToast(msg, "warning", 3000));
      }
    } catch (err) {
      // 401 handled by interceptor, ignore empty or new cart failures
      if (err?.response?.status !== 401 && err?.response?.status !== 403) {
        console.error("Failed to load cart:", err);
      }
      setCart(null);
    } finally {
      setIsLoading(false);
    }
  }, [user, showToast]);

  // Load cart when user logs in / changes
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  /**
   * Add item to cart
   */
  const addToCart = async (productId, quantity = 1, showDrawer = true) => {
    if (!user) {
      showToast("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!", "warning");
      if (openAuthModal) openAuthModal("login");
      return false;
    }

    setIsLoading(true);
    try {
      const updatedCart = await cartService.addToCart({
        productId,
        quantity: Math.max(1, Number(quantity) || 1),
      });
      setCart(updatedCart);
      showToast("Đã thêm sản phẩm vào giỏ hàng thành công!", "success");
      if (showDrawer) {
        setIsCartOpen(true);
      }
      return true;
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Không thể thêm sản phẩm vào giỏ hàng.";
      showToast(message, "error", 3000);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Update item quantity (+/-)
   */
  const updateQuantity = async (cartItemId, quantity) => {
    if (!user) return false;
    if (quantity < 1) {
      return removeItem(cartItemId);
    }

    try {
      const updatedCart = await cartService.updateQuantity(cartItemId, quantity);
      setCart(updatedCart);
      return true;
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Không thể cập nhật số lượng.";
      showToast(message, "error", 2500);
      // Re-fetch to sync real state
      fetchCart();
      return false;
    }
  };

  /**
   * Remove single item from cart
   */
  const removeItem = async (cartItemId) => {
    if (!user) return false;
    try {
      const updatedCart = await cartService.removeItem(cartItemId);
      setCart(updatedCart);
      showToast("Đã xóa sản phẩm khỏi giỏ hàng.", "info");
      return true;
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Không thể xóa sản phẩm.";
      showToast(message, "error");
      return false;
    }
  };

  /**
   * Clear entire cart
   */
  const clearCart = async (showNotification = true) => {
    if (!user) return false;
    try {
      const updatedCart = await cartService.clearCart();
      setCart(updatedCart);
      if (showNotification) showToast("Đã xóa sạch giỏ hàng.", "info");
      return true;
    } catch (err) {
      showToast("Không thể xóa toàn bộ giỏ hàng.", "error");
      return false;
    }
  };

  const items = cart?.items || [];
  const cartCount =
    cart?.totalItemsCount ??
    items.reduce(
      (sum, item) => sum + (item.finalQuantity || item.requestedQuantity || 0),
      0,
    );
  const cartSubtotal = cart?.subtotal ? Number(cart.subtotal) : 0;
  const cartShippingFee = cart?.shippingFee ? Number(cart.shippingFee) : 0;
  const cartDiscount = cart?.discountAmount ? Number(cart.discountAmount) : 0;
  const cartTotal = cart?.totalCost ? Number(cart.totalCost) : 0;

  return (
    <CartContext.Provider
      value={{
        // UI Drawers & Modals
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
        // Cart Data & Actions
        cart,
        setCart,
        items,
        cartCount,
        cartSubtotal,
        cartShippingFee,
        cartDiscount,
        cartTotal,
        isLoading,
        fetchCart,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        compareList,
        addCompareProduct,
        removeCompareProduct,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;
