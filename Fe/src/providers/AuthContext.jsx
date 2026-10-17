import { createContext, useContext, useEffect, useState } from "react";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import authService from "../services/authService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => authService.getCurrentUser());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState("login"); // 'login' | 'register'
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Lock body scroll when auth modal is open
  useEffect(() => {
    if (isAuthModalOpen) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }
    return () => {
      document.body.classList.remove("modal-open");
    };
  }, [isAuthModalOpen]);

  const openAuthModal = (tab = "login") => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  /**
   * Login handler using backend API
   */
  const login = async (email, password) => {
    try {
      const loggedUser = await authService.login({
        email: email.trim().toLowerCase(),
        password,
      });
      setUser(loggedUser);
      const isUserAdmin =
        loggedUser.role === "ROLE_ADMIN" || loggedUser.role === "ADMIN";
      return {
        success: true,
        user: loggedUser,
        isAdmin: isUserAdmin,
      };
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Invalid email or password. Please try again.";
      throw new Error(message);
    }
  };

  /**
   * Direct verify and register
   */
  const register = async (registerPayload) => {
    try {
      const result = await authService.verifyAndRegister(registerPayload);
      return { success: true, result };
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Registration failed. Please try again.";
      throw new Error(message);
    }
  };

  /**
   * Direct logout action
   */
  const directLogout = async () => {
    setIsLoggingOut(true);
    try {
      await authService.logout();
    } finally {
      setUser(null);
      setIsLoggingOut(false);
      setShowLogoutConfirm(false);
      window.location.href = "/";
    }
  };

  /**
   * Request logout (opens confirmation dialog)
   */
  const requestLogout = () => {
    setShowLogoutConfirm(true);
  };

  const isAdmin = user?.role === "ROLE_ADMIN" || user?.role === "ADMIN";

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        isAdmin,
        isAuthModalOpen,
        authModalTab,
        openAuthModal,
        closeAuthModal,
        setAuthModalTab,
        login,
        register,
        logout: requestLogout,
        directLogout,
      }}
    >
      {children}

      {/* Global Logout Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showLogoutConfirm}
        title="Sign out"
        message="Are you sure you want to sign out of the system?"
        confirmText="Sign out"
        cancelText="Cancel"
        confirmVariant="danger"
        isLoading={isLoggingOut}
        onConfirm={directLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
