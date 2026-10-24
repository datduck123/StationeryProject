import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import cartService from "../services/cartService";
import { useAuth } from "./AuthContext";
import { useToast } from "./ToastContext";

const CartContext = createContext();

const extractMessage = (error, fallback) =>
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  error?.message ||
  fallback;

const normalizeCartItem = (item) => {
  const product = item?.product || {};
  const quantity = Number(item?.quantity ?? item?.finalQuantity ?? item?.requestedQuantity ?? 0);
  const unitPrice = Number(
    item?.unitPrice ?? item?.price ?? product?.price ?? 0
  );
  return {
    ...item,
    cartItemId: item?.cartItemId ?? item?.id,
    productId: item?.productId ?? product?.productId ?? product?.id,
    productName:
      item?.productName ?? item?.name ?? item?.title ?? product?.name ?? "",
    imageUrl: item?.imageUrl ?? item?.productImage ?? product?.imageUrl,
    quantity,
    finalQuantity: quantity,
    unitPrice,
    price: unitPrice,
    subtotal: Number(item?.subtotal ?? unitPrice * quantity),
    stockQuantity: Number(
      item?.stockQuantity ??
        item?.currentStock ??
        item?.availableStock ??
        product?.stockQuantity ??
        Number.MAX_SAFE_INTEGER
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
  const subtotal = Number(raw?.subtotal ?? raw?.total ?? computedSubtotal);
  const totalCost = Number(raw?.totalCost ?? raw?.total ?? subtotal);
  const shippingFee = Number(raw?.shippingFee ?? 0);
  const discountAmount = Number(raw?.discountAmount ?? 0);
  const totalItems = Number(
    raw?.totalItems ??
      raw?.totalItemsCount ??
      items.reduce((sum, item) => sum + Number(item.quantity || 0), 0)
  );

  return {
    ...raw,
    items,
    subtotal,
    totalCost,
    shippingFee,
    discountAmount,
    totalItems,
    totalItemsCount: totalItems,
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
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [compareList, setCompareList] = useState([]);

  // Cart API State
  const [cart, setCartState] = useState(() => normalizeCart(null));
  const [isLoading, setIsLoading] = useState(false);
  const [cartError, setCartError] = useState("");
  const [pendingItemIds, setPendingItemIds] = useState(() => new Set());

  const setCart = useCallback((newCart) => {
    setCartState(normalizeCart(newCart));
  }, []);

  // Wishlist State (persisted in localStorage)
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

  const requireCustomer = useCallback(() => {
    if (user) return true;
    showToast?.("Vui lòng đăng nhập để thao tác giỏ hàng!", "info");
    openAuthModal?.("login");
    return false;
  }, [openAuthModal, showToast, user]);

  const setPending = useCallback((id, pending) => {
    setPendingItemIds((current) => {
      const next = new Set(current);
      if (pending) next.add(String(id));
      else next.delete(String(id));
      return next;
    });
  }, []);

  /**
   * Fetch current user's cart from backend
   */
  const fetchCart = useCallback(
    async ({ silent = false } = {}) => {
      if (!user) {
        const empty = normalizeCart(null);
        setCartState(empty);
        setCartError("");
        return empty;
      }
      if (!silent) setIsLoading(true);
      setCartError("");
      try {
        const rawData = await cartService.getCart();
        const nextCart = normalizeCart(rawData);
        setCartState(nextCart);
        if (nextCart?.notifications && nextCart.notifications.length > 0) {
          nextCart.notifications.forEach((msg) =>
            showToast?.(msg, "warning", 3000)
          );
        }
        return nextCart;
      } catch (error) {
        if (error?.response?.status !== 401 && error?.response?.status !== 403) {
          console.error("Failed to load cart:", error);
        }
        const msg = extractMessage(error, "Không thể tải giỏ hàng.");
        setCartError(msg);
        return normalizeCart(null);
      } finally {
        if (!silent) setIsLoading(false);
      }
    },
    [showToast, user]
  );

  const refreshCart = fetchCart;

  // Load cart on auth change
  useEffect(() => {
    fetchCart().catch(() => {});
  }, [fetchCart]);

  /**
   * Add item to cart
   */
  const addToCart = useCallback(
    async (productOrId, quantity = 1, options = {}) => {
      if (!requireCustomer()) return false;
      const productId =
        typeof productOrId === "object"
          ? productOrId?.productId ?? productOrId?.id
          : productOrId;
      const safeQuantity = Math.max(1, Number(quantity) || 1);
      if (!productId) return false;

      // Handle options as boolean (showDrawer) or object ({ open: boolean })
      const shouldOpenDrawer =
        typeof options === "boolean" ? options : options?.open !== false;

      setPending(productId, true);
      setIsLoading(true);
      try {
        const responseData = await cartService.addToCart({
          productId: Number(productId),
          quantity: safeQuantity,
        });
        if (responseData) {
          setCartState(normalizeCart(responseData));
        } else {
          await fetchCart({ silent: true });
        }
        showToast?.("Đã thêm sản phẩm vào giỏ hàng thành công!", "success");
        if (shouldOpenDrawer) setIsCartOpen(true);
        return true;
      } catch (error) {
        showToast?.(
          extractMessage(error, "Không thể thêm sản phẩm vào giỏ hàng."),
          "error"
        );
        return false;
      } finally {
        setPending(productId, false);
        setIsLoading(false);
      }
    },
    [fetchCart, requireCustomer, setPending, showToast]
  );

  /**
   * Update quantity
   */
  const updateCartItem = useCallback(
    async (cartItemId, quantity) => {
      if (!user) return false;
      const safeQuantity = Number(quantity);
      if (!cartItemId) return false;
      if (safeQuantity < 1) {
        return removeItem(cartItemId);
      }

      setPending(cartItemId, true);
      try {
        const updated = await cartService.updateQuantity(
          cartItemId,
          safeQuantity
        );
        if (updated) {
          setCartState(normalizeCart(updated));
        } else {
          await fetchCart({ silent: true });
        }
        return true;
      } catch (error) {
        showToast?.(
          extractMessage(error, "Không thể cập nhật số lượng."),
          "error"
        );
        await fetchCart({ silent: true });
        return false;
      } finally {
        setPending(cartItemId, false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fetchCart, setPending, showToast, user]
  );

  const updateQuantity = updateCartItem;

  /**
   * Remove single item
   */
  const removeCartItem = useCallback(
    async (cartItemId) => {
      if (!user || !cartItemId) return false;
      setPending(cartItemId, true);
      try {
        const updated = await cartService.removeItem(cartItemId);
        if (updated) {
          setCartState(normalizeCart(updated));
        } else {
          await fetchCart({ silent: true });
        }
        showToast?.("Đã xóa sản phẩm khỏi giỏ hàng.", "info");
        return true;
      } catch (error) {
        showToast?.(
          extractMessage(error, "Không thể xóa sản phẩm khỏi giỏ hàng."),
          "error"
        );
        return false;
      } finally {
        setPending(cartItemId, false);
      }
    },
    [fetchCart, setPending, showToast, user]
  );

  const removeItem = removeCartItem;

  /**
   * Clear entire cart
   */
  const clearCart = useCallback(
    async (showNotification = true) => {
      if (!user) {
        setCartState(normalizeCart(null));
        return true;
      }
      setIsLoading(true);
      try {
        await cartService.clearCart();
        setCartState(normalizeCart(null));
        if (showNotification) {
          showToast?.("Đã xóa sạch giỏ hàng.", "info");
        }
        return true;
      } catch (error) {
        showToast?.(
          extractMessage(error, "Không thể xóa toàn bộ giỏ hàng."),
          "error"
        );
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [showToast, user]
  );

  // Drawer open / close handlers
  const openCart = useCallback(
    (e) => {
      if (e?.preventDefault) e.preventDefault();
      if (!requireCustomer()) return;
      setIsCartOpen(true);
      fetchCart({ silent: true }).catch(() => {});
    },
    [fetchCart, requireCustomer]
  );

  const closeCart = useCallback((e) => {
    if (e?.preventDefault) e.preventDefault();
    setIsCartOpen(false);
  }, []);

  const openWishlist = useCallback((e) => {
    if (e?.preventDefault) e.preventDefault();
    setIsWishlistOpen(true);
  }, []);

  const closeWishlist = useCallback((e) => {
    if (e?.preventDefault) e.preventDefault();
    setIsWishlistOpen(false);
  }, []);

  const isInWishlist = useCallback(
    (productId) =>
      Boolean(productId) &&
      wishlist.some(
        (item) => String(item.productId || item.id) === String(productId)
      ),
    [wishlist]
  );

  const toggleWishlist = useCallback(
    (product) => {
      if (!product) return;
      const productId = product.productId || product.id;
      if (!productId) return;
      const exists = isInWishlist(productId);
      setWishlist((current) =>
        exists
          ? current.filter(
              (item) => String(item.productId || item.id) !== String(productId)
            )
          : [...current, product]
      );
      showToast?.(
        exists
          ? `Đã xóa "${product.name || "Sản phẩm"}" khỏi danh sách yêu thích.`
          : `Đã thêm "${product.name || "Sản phẩm"}" vào danh sách yêu thích!`,
        exists ? "info" : "success"
      );
      if (!exists) setTimeout(() => setIsWishlistOpen(true), 300);
    },
    [isInWishlist, showToast]
  );

  const removeFromWishlist = useCallback((productId) => {
    setWishlist((current) =>
      current.filter(
        (item) => String(item.productId || item.id) !== String(productId)
      )
    );
  }, []);

  const clearWishlist = useCallback(() => setWishlist([]), []);

  const toggleMobileMenu = useCallback((e) => {
    if (e?.preventDefault) e.preventDefault();
    setIsMobileMenuOpen((prev) => !prev);
  }, []);

  const closeMobileMenu = useCallback((e) => {
    if (e?.preventDefault) e.preventDefault();
    setIsMobileMenuOpen(false);
  }, []);

  const openQuickView = useCallback((product, e) => {
    if (e?.preventDefault) e.preventDefault();
    setQuickViewProduct(product);
  }, []);

  const closeQuickView = useCallback((e) => {
    if (e?.preventDefault) e.preventDefault();
    setQuickViewProduct(null);
  }, []);

  // Compare handlers
  const openCompare = useCallback((e) => {
    if (e?.preventDefault) e.preventDefault();
    setIsCompareOpen(true);
  }, []);

  const closeCompare = useCallback((e) => {
    if (e?.preventDefault) e.preventDefault();
    setIsCompareOpen(false);
  }, []);

  const addCompareProduct = useCallback((product) => {
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
  }, []);

  const removeCompareProduct = useCallback((productId) => {
    setCompareList((prev) =>
      prev.filter((p) => (p.id || p.productId) !== productId)
    );
  }, []);

  // Lock body scroll when mobile menu or drawers are open
  useEffect(() => {
    document.body.classList.toggle(
      "locked",
      isMobileMenuOpen || isCartOpen || isWishlistOpen
    );
    return () => document.body.classList.remove("locked");
  }, [isCartOpen, isMobileMenuOpen, isWishlistOpen]);

  const items = cart?.items || [];
  const cartCount =
    cart?.totalItemsCount ??
    items.reduce(
      (sum, item) => sum + (item.finalQuantity || item.quantity || 0),
      0
    );
  const cartSubtotal = Number(cart?.subtotal || 0);
  const cartShippingFee = Number(cart?.shippingFee || 0);
  const cartDiscount = Number(cart?.discountAmount || 0);
  const cartTotal = Number(cart?.totalCost || cart?.subtotal || 0);

  const value = useMemo(
    () => ({
      // Drawers & Modals
      isCartOpen,
      openCart,
      closeCart,
      isWishlistOpen,
      openWishlist,
      closeWishlist,
      isMobileMenuOpen,
      toggleMobileMenu,
      closeMobileMenu,
      quickViewProduct,
      openQuickView,
      closeQuickView,
      isCompareOpen,
      openCompare,
      closeCompare,
      // Cart Data
      cart,
      setCart,
      cartItems: items,
      items,
      cartCount,
      cartSubtotal,
      cartShippingFee,
      cartDiscount,
      cartTotal,
      cartLoading: isLoading,
      isLoading,
      cartError,
      pendingItemIds,
      // Cart Actions
      fetchCart,
      refreshCart,
      addToCart,
      updateCartItem,
      updateQuantity,
      removeCartItem,
      removeItem,
      clearCart,
      // Wishlist Data & Actions
      wishlist,
      wishlistCount: wishlist.length,
      toggleWishlist,
      removeFromWishlist,
      clearWishlist,
      isInWishlist,
      // Compare Data & Actions
      compareList,
      addCompareProduct,
      removeCompareProduct,
    }),
    [
      isCartOpen,
      openCart,
      closeCart,
      isWishlistOpen,
      openWishlist,
      closeWishlist,
      isMobileMenuOpen,
      toggleMobileMenu,
      closeMobileMenu,
      quickViewProduct,
      openQuickView,
      closeQuickView,
      isCompareOpen,
      openCompare,
      closeCompare,
      cart,
      setCart,
      items,
      cartCount,
      cartSubtotal,
      cartShippingFee,
      cartDiscount,
      cartTotal,
      isLoading,
      cartError,
      pendingItemIds,
      fetchCart,
      refreshCart,
      addToCart,
      updateCartItem,
      updateQuantity,
      removeCartItem,
      removeItem,
      clearCart,
      wishlist,
      toggleWishlist,
      removeFromWishlist,
      clearWishlist,
      isInWishlist,
      compareList,
      addCompareProduct,
      removeCompareProduct,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCartContext = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCartContext must be used within CartProvider");
  }
  return context;
};

export default CartContext;
