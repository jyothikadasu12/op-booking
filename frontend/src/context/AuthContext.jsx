import { createContext, useCallback, useContext, useEffect, useState } from "react";
import {
  getCurrentUser,
  loginUser,
  logoutUser,
  refreshSession,
  registerUser,
} from "../features/auth/services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(() => localStorage.getItem("access_token"));
  const [loading, setLoading] = useState(true);

  const clearSession = useCallback(() => {
    localStorage.removeItem("access_token");
    setUser(null);
    setAccessToken(null);
  }, []);

  const applyUser = useCallback(async (token) => {
    if (!token) {
      setUser(null);
      return;
    }
    localStorage.setItem("access_token", token);
    setAccessToken(token);
    const currentUser = await getCurrentUser();
    setUser(currentUser);
  }, []);

  const bootstrap = useCallback(async () => {
    try {
      if (accessToken) {
        try {
          const currentUser = await getCurrentUser();
          setUser(currentUser);
        } catch {
          // Access token may be expired; try refresh cookie.
          const refreshed = await refreshSession();
          await applyUser(refreshed?.data?.access_token);
        }
      } else {
        try {
          const refreshed = await refreshSession();
          await applyUser(refreshed?.data?.access_token);
        } catch {
          clearSession();
        }
      }
    } catch {
      clearSession();
    } finally {
      setLoading(false);
    }
  }, [accessToken, applyUser, clearSession]);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  const login = useCallback(async (email, password) => {
    const response = await loginUser({ email, password });
    const token = response?.data?.access_token;
    if (!token) {
      throw new Error("Login did not return an access token");
    }
    await applyUser(token);
    return response?.data?.user;
  }, [applyUser]);

  const register = useCallback(async (payload) => {
    const response = await registerUser(payload);
    // Registration does not return a token; log in immediately afterward.
    const user = await login(payload.email, payload.password);
    return user ?? response?.data?.user;
  }, [login]);

  const logout = useCallback(async () => {
    try {
      await logoutUser();
    } catch (error) {
      // Local cleanup still matters even if server logout fails.
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const value = {
    user,
    accessToken,
    loading,
    isAuthenticated: Boolean(user && accessToken),
    isAdmin: user?.role === "admin",
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
};
