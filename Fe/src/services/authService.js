import api, { TOKEN_STORAGE_KEY, USER_STORAGE_KEY } from "./api";

export const authService = {
  /**
   * Send OTP for registration
   * @param {{ email: string }} data
   */
  async sendRegisterOtp(data) {
    const response = await api.post("/auth/register/send-otp", data);
    return response.data;
  },

  /**
   * Verify OTP and complete registration
   * @param {{ fullName: string, email: string, password: string, phone?: string, address?: string, otpCode: string }} data
   */
  async verifyAndRegister(data) {
    const response = await api.post("/auth/register/verify-and-register", data);
    return response.data;
  },

  /**
   * Login with email and password
   * @param {{ email: string, password: string }} data
   */
  async login(data) {
    const response = await api.post("/auth/login", data);
    const { token, email, fullName, role, userId } = response.data;
    if (token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
      const user = { userId, email, fullName, role };
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      return user;
    }
    return response.data;
  },

  /**
   * Logout session
   */
  async logout() {
    try {
      await api.post("/auth/logout");
    } catch {
      console.warn("Logout failed, but clearing local storage anyway.");
    } finally {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(USER_STORAGE_KEY);
    }
  },

  /**
   * Send OTP for forgot password
   * @param {{ email: string }} data
   */
  async sendForgotPasswordOtp(data) {
    const response = await api.post("/auth/forgot-password/send-otp", data);
    return response.data;
  },

  /**
   * Verify OTP for forgot password
   * @param {{ email: string, otpCode: string }} data
   */
  async verifyForgotPasswordOtp(data) {
    const response = await api.post("/auth/forgot-password/verify-otp", data);
    return response.data;
  },

  /**
   * Reset password with OTP
   * @param {{ email: string, otpCode: string, newPassword: string }} data
   */
  async resetPassword(data) {
    const response = await api.post("/auth/forgot-password/reset", data);
    return response.data;
  },

  /**
   * Get stored current user
   */
  getCurrentUser() {
    try {
      const stored = localStorage.getItem(USER_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  /**
   * Get stored JWT token
   */
  getToken() {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  },
};

export default authService;
