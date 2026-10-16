import api from "./api";

const unwrap = (response) => response?.data?.data ?? response?.data ?? response;

const cartService = {
  async getCart(params = {}) {
    return unwrap(await api.get("/cart", { params }));
  },

  async addItem(productId, quantity = 1) {
    return unwrap(await api.post("/cart/items", { productId, quantity }));
  },

  async updateItem(cartItemId, quantity) {
    return unwrap(await api.put(`/cart/items/${cartItemId}`, { quantity }));
  },

  async removeItem(cartItemId) {
    return unwrap(await api.delete(`/cart/items/${cartItemId}`));
  },

  async clear() {
    return unwrap(await api.delete("/cart"));
  },
};

export default cartService;
