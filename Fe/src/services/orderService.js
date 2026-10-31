import api from "./api";

const orderService = {
  async createOrder(orderData) {
    const response = await api.post("/orders", orderData);
    return response.data;
  },

  async getMyOrders(params = {}) {
    const response = await api.get("/orders", { params });
    return response.data;
  },

  async getMyOrder(orderId) {
    const response = await api.get(`/orders/${orderId}`);
    return response.data;
  },

  async cancelMyOrder(orderId) {
    const response = await api.put(`/orders/${orderId}/cancel`);
    return response.data;
  },

  async getOrders(params = {}) {
    const response = await api.get("/admin/orders", { params });
    return response.data;
  },

  async getOrder(orderId) {
    const response = await api.get(`/admin/orders/${orderId}`);
    return response.data;
  },

  async getOrderStats() {
    const response = await api.get("/admin/orders/stats");
    return response.data;
  },

  async updateOrderStatus(orderId, status) {
    const response = await api.put(`/admin/orders/${orderId}`, { status });
    return response.data;
  },
};

export default orderService;
