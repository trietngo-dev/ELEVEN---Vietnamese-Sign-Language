import React, { createContext, useContext, useState, useEffect } from "react";
import type { LoginRequest, RegisterRequest } from "../lib/auth";
import { authApi, tokenStorage } from "../lib/auth";
import LogoutConfirmModal from "../components/LogoutConfirmModal";

interface AuthContextType {
  user: any | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<any>;
  loginWithGoogle: (idToken: string, fullName?: string) => Promise<any>;
  register: (data: RegisterRequest) => Promise<void>;
  deleteAccount: (userId: number) => Promise<void>;
  logout: () => void;
  requestLogout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState<boolean>(false);

  useEffect(() => {
    const storedUser = tokenStorage.getUser();
    const token = tokenStorage.getToken();
    
    if (storedUser && token) {
      setUser(storedUser);
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const login = async (data: LoginRequest) => {
    try {
      const response = await authApi.login(data);
      const userData = {
        id: response.userId,
        email: response.email,
        fullName: response.fullName,
        role: response.roleCode
      };
      
      tokenStorage.setToken(response.accessToken);
      tokenStorage.setUser(userData);
      
      setUser(userData);
      setIsAuthenticated(true);
      return userData;
    } catch (error) {
      throw error;
    }
  };

  const loginWithGoogle = async (idToken: string, fullName?: string) => {
    try {
      const response = await authApi.loginWithGoogle(idToken, fullName);
      const userData = {
        id: response.userId,
        email: response.email,
        fullName: response.fullName,
        role: response.roleCode
      };
      
      tokenStorage.setToken(response.accessToken);
      tokenStorage.setUser(userData);
      
      setUser(userData);
      setIsAuthenticated(true);
      return userData;
    } catch (error) {
      throw error;
    }
  };

  const register = async (data: RegisterRequest) => {
    try {
      await authApi.register(data);
    } catch (error) {
      throw error;
    }
  };

  const deleteAccount = async (userId: number) => {
    try {
      await authApi.deleteAccount(userId);
      logout();
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    tokenStorage.clearToken();
    tokenStorage.clearUser();
    setUser(null);
    setIsAuthenticated(false);
  };

  const requestLogout = () => {
    setShowLogoutConfirm(true);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, loginWithGoogle, register, deleteAccount, logout, requestLogout }}>
      {children}
      <LogoutConfirmModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={logout}
      />
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
