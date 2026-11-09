
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  getCurrentUser,
  loginUser,
  logoutUser,
  refreshSession,
  registerUser,
} from "../features/auth/services/authService";

const AuthContext = createContext(null);

// Supports both direct API responses and { success, data: ... } responses.
const unwrapData = (response) => response?.data ?? response;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(
    () => localStorage.getItem("access_token")
  );
  const [loading, setLoading] = useState(true);

  const clearSession = useCallback(() => {
    localStorage.removeItem("access_token");
    setUser(null);
    setAccessToken(null);
  }, []);

  const applyUser = useCallback(async (token) => {
    if (!token) {
      throw new Error("Access token is missing.");
    }

    localStorage.setItem("access_token", token);
    setAccessToken(token);

    const response = await getCurrentUser();
    const currentUser = unwrapData(response);

    setUser(currentUser);
    return currentUser;
  }, []);

  const bootstrap = useCallback(async () => {
    try {
      const storedToken = localStorage.getItem("access_token");

      if (storedToken) {
        try {
          const response = await getCurrentUser();
          setUser(unwrapData(response));
          return;
        } catch {
          // Access token may have expired. Try refreshing it.
        }
      }

      const refreshResponse = await refreshSession();
      const refreshedData = unwrapData(refreshResponse);

      await applyUser(refreshedData?.access_token);
    } catch (error) {
      clearSession();
    } finally {
      setLoading(false);
    }
  }, [applyUser, clearSession]);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  const login = useCallback(
    async (email, password) => {
      const response = await loginUser({ email, password });
      const loginData = unwrapData(response);

      const token = loginData?.access_token;

      if (!token) {
        throw new Error("Login did not return an access token.");
      }

      await applyUser(token);

      return loginData?.user;
    },
    [applyUser]
  );

  const register = useCallback(
    async (payload) => {
      const response = await registerUser(payload);
      const registrationData = unwrapData(response);

      const loggedInUser = await login(
        payload.email,
        payload.password
      );

      return loggedInUser ?? registrationData?.user;
    },
    [login]
  );

  const logout = useCallback(async () => {
    try {
      await logoutUser();
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

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};
