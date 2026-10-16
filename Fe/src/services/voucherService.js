import api from "./api";

const voucherService = {
  async getActiveVouchers() {
    const response = await api.get("/vouchers/active");
    const payload = response?.data?.data ?? response?.data ?? [];
    if (Array.isArray(payload)) return payload;
    return payload?.content ?? payload?.items ?? [];
  },
};

export default voucherService;
