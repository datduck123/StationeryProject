import api from "./api";

export const checkoutService = {
  /**
   * Khởi tạo quá trình thanh toán và validate giỏ hàng (kiểm tra tồn kho thời gian thực)
   * @param {object} checkoutRequest
   */
  async validateCheckout(checkoutRequest) {
    const response = await api.post("/checkout/validate", checkoutRequest);
    return response.data;
  },
};

export default checkoutService;
