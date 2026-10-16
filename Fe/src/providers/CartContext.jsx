import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import cartService from "../services/cartService";
import { useTranslation } from "react-i18next";
import { useAuth } from "./AuthContext";
import { useToast } from "./ToastContext";

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
  const { t } = useTranslation();
  const { user, openAuthModal } = useAuth();
  const { showToast } = useToast();

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [cart, setCart] = useState(() => normalizeCart(null));
  const [cartLoading, setCartLoading] = useState(false);
  const [cartError, setCartError] = useState("");
  const [pendingItemIds, setPendingItemIds] = useState(() => new Set());

  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem("stationery_wishlist");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("stationery_wishlist", JSON.stringify(wishlist));
    } catch (error) {
      console.warn("Failed to persist wishlist:", error);
    }
  }, [wishlist]);

  const refreshCart = useCallback(async ({ silent = false } = {}) => {
    if (!user) {
      const empty = normalizeCart(null);
      setCart(empty);
      setCartError("");
      return empty;
    }
    if (!silent) setCartLoading(true);
    setCartError("");
    try {
      const nextCart = normalizeCart(await cartService.getCart());
      setCart(nextCart);
      return nextCart;
    } catch (error) {
      setCartError(extractMessage(error, t("commerce.cartLoadError")));
      throw error;
    } finally {
      if (!silent) setCartLoading(false);
    }
  }, [t, user]);

  useEffect(() => {
    refreshCart().catch(() => {});
  }, [refreshCart]);

  const requireCustomer = useCallback(() => {
    if (user) return true;
    showToast?.(t("commerce.signInCart"), "info");
    openAuthModal?.("login");
    return false;
  }, [openAuthModal, showToast, t, user]);

  const setPending = useCallback((id, pending) => {
    setPendingItemIds((current) => {
      const next = new Set(current);
      if (pending) next.add(String(id));
      else next.delete(String(id));
      return next;
    });
  }, []);

  const addToCart = useCallback(async (productOrId, quantity = 1, options = {}) => {
    if (!requireCustomer()) return false;
    const productId = typeof productOrId === "object"
      ? productOrId?.productId ?? productOrId?.id
      : productOrId;
    const safeQuantity = Math.max(1, Number(quantity) || 1);
    if (!productId) return false;
    setPending(productId, true);
    try {
      await cartService.addItem(productId, safeQuantity);
      await refreshCart({ silent: true });
      showToast?.(t("commerce.cartAdded"), "success");
      if (options.open !== false) setIsCartOpen(true);
      return true;
    } catch (error) {
      showToast?.(extractMessage(error, t("commerce.cartAddError")), "error");
      return false;
    } finally {
      setPending(productId, false);
    }
  }, [refreshCart, requireCustomer, setPending, showToast, t]);

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

  const clearCart = useCallback(async ({ server = true } = {}) => {
    if (!user) {
      setCart(normalizeCart(null));
      return true;
    }
    setCartLoading(true);
    try {
      if (server) await cartService.clear();
      setCart(normalizeCart(null));
      return true;
    } catch (error) {
      showToast?.(extractMessage(error, t("commerce.cartClearError")), "error");
      return false;
    } finally {
      setCartLoading(false);
    }
  }, [showToast, t, user]);

  const openCart = useCallback((event) => {
    event?.preventDefault?.();
    if (!requireCustomer()) return;
    setIsCartOpen(true);
    refreshCart({ silent: true }).catch(() => {});
  }, [refreshCart, requireCustomer]);
  const closeCart = useCallback((event) => { event?.preventDefault?.(); setIsCartOpen(false); }, []);
  const openWishlist = useCallback((event) => { event?.preventDefault?.(); setIsWishlistOpen(true); }, []);
  const closeWishlist = useCallback((event) => { event?.preventDefault?.(); setIsWishlistOpen(false); }, []);

  const isInWishlist = useCallback((productId) => Boolean(productId) && wishlist.some(
    (item) => String(item.productId || item.id) === String(productId),
  ), [wishlist]);

  const toggleWishlist = useCallback((product) => {
    if (!product) return;
    const productId = product.productId || product.id;
    if (!productId) return;
    const exists = isInWishlist(productId);
    setWishlist((current) => exists
      ? current.filter((item) => String(item.productId || item.id) !== String(productId))
      : [...current, product]);
    showToast?.(
      exists
        ? `Đã xóa "${product.name || "Sản phẩm"}" khỏi danh sách yêu thích.`
        : `Đã thêm "${product.name || "Sản phẩm"}" vào danh sách yêu thích!`,
      exists ? "info" : "success",
    );
    if (!exists) setTimeout(() => setIsWishlistOpen(true), 300);
  }, [isInWishlist, showToast]);

  const removeFromWishlist = useCallback((productId) => {
    setWishlist((current) => current.filter(
      (item) => String(item.productId || item.id) !== String(productId),
    ));
  }, []);
  const clearWishlist = useCallback(() => setWishlist([]), []);
  const toggleMobileMenu = useCallback((event) => { event?.preventDefault?.(); setIsMobileMenuOpen((value) => !value); }, []);
  const closeMobileMenu = useCallback((event) => { event?.preventDefault?.(); setIsMobileMenuOpen(false); }, []);
  const openQuickView = useCallback((product, event) => { event?.preventDefault?.(); setQuickViewProduct(product); }, []);
  const closeQuickView = useCallback((event) => { event?.preventDefault?.(); setQuickViewProduct(null); }, []);

  useEffect(() => {
    document.body.classList.toggle("locked", isMobileMenuOpen || isCartOpen || isWishlistOpen);
    return () => document.body.classList.remove("locked");
  }, [isCartOpen, isMobileMenuOpen, isWishlistOpen]);

  const value = useMemo(() => ({
    isCartOpen, openCart, closeCart,
    cart, cartItems: cart.items, cartCount: cart.totalItems, cartSubtotal: cart.subtotal,
    cartLoading, cartError, pendingItemIds, refreshCart, addToCart, updateCartItem,
    removeCartItem, clearCart,
    isWishlistOpen, openWishlist, closeWishlist, wishlist, wishlistCount: wishlist.length,
    toggleWishlist, removeFromWishlist, clearWishlist, isInWishlist,
    isMobileMenuOpen, toggleMobileMenu, closeMobileMenu,
    quickViewProduct, openQuickView, closeQuickView,
  }), [
    addToCart, cart, cartError, cartLoading, clearCart, clearWishlist, closeCart,
    closeMobileMenu, closeQuickView, closeWishlist, isCartOpen, isInWishlist,
    isMobileMenuOpen, isWishlistOpen, openCart, openQuickView, openWishlist,
    pendingItemIds, refreshCart, removeCartItem, removeFromWishlist, toggleMobileMenu,
    toggleWishlist, updateCartItem, wishlist,
  ]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCartContext = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCartContext must be used within CartProvider");
  return context;
};

export default CartContext;
