import api from "./api";

const voucherService = {
  // Admin: Get all vouchers with optional search and filters
  getAllVouchers: async (params = {}) => {
    const response = await api.get("/admin/vouchers", { params });
    return response.data;
  },

  // Admin: Get voucher by ID
  getVoucherById: async (id) => {
    const response = await api.get(`/admin/vouchers/${id}`);
    return response.data;
  },

  // Admin: Create new voucher
  createVoucher: async (voucherData) => {
    const response = await api.post("/admin/vouchers", voucherData);
    return response.data;
  },

  // Admin: Update voucher
  updateVoucher: async (id, voucherData) => {
    const response = await api.put(`/admin/vouchers/${id}`, voucherData);
    return response.data;
  },

  // Admin: Delete voucher
  deleteVoucher: async (id) => {
    const response = await api.delete(`/admin/vouchers/${id}`);
    return response.data;
  },

  // Admin: Toggle active/inactive status
  toggleVoucherStatus: async (id) => {
    const response = await api.patch(`/admin/vouchers/${id}/toggle-status`);
    return response.data;
  },

  // Admin: Update status explicitly
  updateVoucherStatus: async (id, isActive) => {
    const response = await api.put(`/admin/vouchers/${id}/status`, { isActive });
    return response.data;
  },

  // Public/Customer: Validate voucher code against an order amount
  validateVoucher: async (code, orderAmount) => {
    const params = { code };
    if (orderAmount !== undefined && orderAmount !== null) {
      params.orderAmount = orderAmount;
    }
    const response = await api.get("/vouchers/validate", { params });
    return response.data;
  },

  // Public/Customer: Get active vouchers
  getActiveVouchers: async () => {
    const response = await api.get("/vouchers/active");
    return response.data;
  },
};

export default voucherService;
