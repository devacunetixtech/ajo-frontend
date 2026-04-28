import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem("ajo_token");
    if (!token) { setLoading(false); return; }
    try {
      const { data } = await api.get("/users/me");
      setUser(data.user);
    } catch {
      localStorage.removeItem("ajo_token");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadUser(); }, [loadUser]);

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("ajo_token", data.token);
    setUser(data.user);
    return data;
  };

  const register = async (name, email, password, phone) => {
    const { data } = await api.post("/auth/register", { name, email, password, phone });
    return data;
  };

  const logout = () => {
    localStorage.removeItem("ajo_token");
    setUser(null);
  };

  const updateUser = (updates) => setUser((prev) => ({ ...prev, ...updates }));

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser, loadUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
