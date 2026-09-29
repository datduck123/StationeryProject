import api from "./api";

export const userService = {
  /**
   * Retrieve Current User Profile
   */
  async getProfile() {
    const response = await api.get("/users/me");
    return response.data;
  },

  /**
   * Update Current User Profile
   * @param {{ fullName: string, phone?: string, address?: string }} data
   */
  async updateProfile(data) {
    const response = await api.put("/users/me", data);
    return response.data;
  },

  /**
   * Change current authenticated user password
   * @param {{ currentPassword: string, newPassword: string }} data
   */
  async changePassword(data) {
    const response = await api.patch("/users/me/change-password", data);
    return response.data;
  },
};

export default userService;
