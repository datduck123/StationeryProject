import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

const STORAGE_KEY = "stationery_clinic_auth_user";
const REGISTERED_USERS_KEY = "stationery_clinic_registered_users";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState("login"); // 'login' | 'register'

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  const openAuthModal = (tab = "login") => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

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

  /**
   * Login handler
   * Supports:
   * 1. admin01@gmail.com / Karamba7075##. -> Role: ADMIN
   * 2. Backend API call to /api/auth/login if backend is running
   * 3. Fallback to registered users stored in localStorage
   */
  const login = async (email, password) => {
    const trimmedEmail = email.trim().toLowerCase();

    // Check specific admin credentials first
    if (trimmedEmail === "admin01@gmail.com" && password === "Karamba7075##.") {
      const adminUser = {
        email: "admin01@gmail.com",
        fullName: "Clinic Administrator",
        role: "ADMIN",
        token: "admin-jwt-token-" + Date.now(),
      };
      setUser(adminUser);
      return { success: true, user: adminUser, isAdmin: true };
    }

    // Try backend API if available
    try {
      const response = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: trimmedEmail, password }),
      });

      if (response.ok) {
        const data = await response.json();
        const loggedUser = {
          email: data.email || trimmedEmail,
          fullName: data.fullName || trimmedEmail.split("@")[0],
          role: data.role?.replace("ROLE_", "") || "USER",
          token: data.token,
        };
        setUser(loggedUser);
        return {
          success: true,
          user: loggedUser,
          isAdmin: loggedUser.role === "ADMIN",
        };
      }
    } catch {
      // Backend not running or network issue, fallback to localStorage
    }

    // Check local registered users
    try {
      const registered = JSON.parse(
        localStorage.getItem(REGISTERED_USERS_KEY) || "[]",
      );
      const matched = registered.find(
        (u) =>
          u.email.toLowerCase() === trimmedEmail && u.password === password,
      );

      if (matched) {
        const patientUser = {
          email: matched.email,
          fullName: matched.fullName,
          role: matched.role || "PATIENT",
          token: "patient-jwt-" + Date.now(),
        };
        setUser(patientUser);
        return { success: true, user: patientUser, isAdmin: false };
      }
    } catch {
      // ignore
    }

    // General patient demo account fallback
    if (trimmedEmail === "patient@clinic.com" && password === "Patient123@") {
      const demoUser = {
        email: "patient@clinic.com",
        fullName: "Sarah Jenkins",
        role: "PATIENT",
        token: "demo-jwt-" + Date.now(),
      };
      setUser(demoUser);
      return { success: true, user: demoUser, isAdmin: false };
    }

    throw new Error("Invalid email or password. Please try again.");
  };

  /**
   * Register handler
   * Public registration is strictly for PATIENT / USER role
   */
  const register = async ({ fullName, email, password }) => {
    const trimmedEmail = email.trim().toLowerCase();

    // Check if email already exists locally
    const registered = JSON.parse(
      localStorage.getItem(REGISTERED_USERS_KEY) || "[]",
    );
    if (
      trimmedEmail === "admin01@gmail.com" ||
      registered.some((u) => u.email.toLowerCase() === trimmedEmail)
    ) {
      throw new Error("This email is already registered.");
    }

    // Try backend API registration if available
    try {
      const response = await fetch("http://localhost:8080/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: trimmedEmail,
          password,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const newUser = {
          email: data.email || trimmedEmail,
          fullName: fullName.trim(),
          role: "PATIENT",
          token: data.token || "patient-jwt-" + Date.now(),
        };
        return { success: true, user: newUser };
      }
    } catch {
      // Backend not running, proceed with client persistence
    }

    // Store in localStorage
    const newRegisteredUser = {
      fullName: fullName.trim(),
      email: trimmedEmail,
      password,
      role: "PATIENT",
      createdAt: new Date().toISOString(),
    };

    registered.push(newRegisteredUser);
    localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(registered));

    const patientUser = {
      email: trimmedEmail,
      fullName: fullName.trim(),
      role: "PATIENT",
      token: "patient-jwt-" + Date.now(),
    };

    return { success: true, user: patientUser };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const isAdmin = user?.role === "ADMIN";

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        isAuthModalOpen,
        authModalTab,
        openAuthModal,
        closeAuthModal,
        setAuthModalTab,
        login,
        register,
        logout,
      }}
    >
      {children}
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
