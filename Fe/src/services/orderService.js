import api from "./api";

const orderService = {
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
};

export default orderService;
