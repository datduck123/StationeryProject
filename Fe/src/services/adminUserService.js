import api from "./api";

export const adminUserService = {
  /**
   * Get user statistics (total, active, inactive, blocked)
   */
  async getUserStats() {
    const response = await api.get("/admin/users/stats");
    return response.data;
  },

  /**
   * Get users with pagination, sorting, and filtering
   * @param {{ page?: number, size?: number, sortBy?: string, sortDir?: string, keyword?: string, status?: string, role?: string }} params
   */
  async getUsers(params = {}) {
    const response = await api.get("/admin/users", { params });
    return response.data;
  },

  /**
   * Get user by ID
   * @param {number|string} userId
   */
  async getUserById(userId) {
    const response = await api.get(`/admin/users/${userId}`);
    return response.data;
  },

  /**
   * Toggle user status (ACTIVE <-> BLOCKED)
   * @param {number|string} userId
   */
  async toggleUserStatus(userId) {
    const response = await api.patch(`/admin/users/${userId}/toggle-status`);
    return response.data;
  },

  /**
   * Create user by admin (backend auto-generates secure password)
   * @param {{ fullName: string, email: string, phone?: string, address?: string, role: string }} data
   */
  async createUser(data) {
    const response = await api.post("/admin/users", data);
    return response.data;
  },

  /**
   * Update user details by admin
   * @param {number|string} userId
   * @param {{ fullName: string, phone?: string, address?: string, role: string }} data
   */
  async updateUser(userId, data) {
    const response = await api.put(`/admin/users/${userId}`, data);
    return response.data;
  },
};

export default adminUserService;
