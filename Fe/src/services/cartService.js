import api from "./api";

export const cartService = {
  /**
   * Lấy giỏ hàng người dùng hiện tại
   * @param {string} shippingMethod (STANDARD | EXPRESS)
   * @param {number|null} voucherId
   */
  async getCart(shippingMethod = "STANDARD", voucherId = null) {
    const params = {};
    if (shippingMethod) params.shippingMethod = shippingMethod;
    if (voucherId) params.voucherId = voucherId;
    const response = await api.get("/cart", { params });
    return response.data;
  },

  /**
   * Thêm sản phẩm vào giỏ hàng
   * @param {{ productId: number, quantity: number }} data
   */
  async addToCart({ productId, quantity = 1 }) {
    const response = await api.post("/cart", {
      productId: Number(productId),
      quantity: Number(quantity),
    });
    return response.data;
  },

  /**
   * Cập nhật số lượng sản phẩm (+/-)
   * @param {number} cartItemId
   * @param {number} quantity
   */
  async updateQuantity(cartItemId, quantity) {
    const response = await api.put(`/cart/${cartItemId}`, {
      quantity: Number(quantity),
    });
    return response.data;
  },

  /**
   * Xóa một sản phẩm khỏi giỏ hàng
   * @param {number} cartItemId
   */
  async removeItem(cartItemId) {
    const response = await api.delete(`/cart/${cartItemId}`);
    return response.data;
  },

  /**
   * Xóa sạch toàn bộ giỏ hàng
   */
  async clearCart() {
    const response = await api.delete("/cart");
    return response.data;
  },

  /**
   * Tính toán trước giỏ hàng (ước tính giá, ship, kiểm tra tồn kho)
   * @param {object} calculationRequest
   */
  async calculateCart(calculationRequest) {
    const response = await api.post("/cart/calculate", calculationRequest);
    return response.data;
  },
};

export default cartService;
