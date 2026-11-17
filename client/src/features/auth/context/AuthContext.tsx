import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { authApi } from '../api/authApi';
import { AuthUser, LoginCredentials, RegisterCredentials } from '../types';

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (data: RegisterCredentials) => Promise<boolean>;
  demoLogin: (role?: 'admin' | 'creator') => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const stored = localStorage.getItem('survey_auth_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('survey_auth_token');
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Validate session on bootstrap
    const checkSession = async () => {
      const savedToken = localStorage.getItem('survey_auth_token');
      if (savedToken) {
        try {
          const profile = await authApi.getMe();
          setUser(profile);
          localStorage.setItem('survey_auth_user', JSON.stringify(profile));
        } catch {
          // Token expired or invalid
          localStorage.removeItem('survey_auth_token');
          localStorage.removeItem('survey_auth_user');
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    checkSession();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      const res = await authApi.login(credentials);
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('survey_auth_token', res.token);
      localStorage.setItem('survey_auth_user', JSON.stringify(res.user));
      toast.success(`Welcome back, ${res.user.name}!`);
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const register = async (data: RegisterCredentials): Promise<boolean> => {
    try {
      const res = await authApi.register(data);
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('survey_auth_token', res.token);
      localStorage.setItem('survey_auth_user', JSON.stringify(res.user));
      toast.success(`Welcome, ${res.user.name}!`);
      return true;
    } catch (error) {
      console.error('Registration failed:', error);
      return false;
    }
  };

  const demoLogin = async (role: 'admin' | 'creator' = 'admin'): Promise<boolean> => {
    const creds: LoginCredentials =
      role === 'admin'
        ? { email: 'admin@surveyflow.com', password: 'admin123' }
        : { email: 'elena.rostova@university.edu', password: 'creator123' };

    return login(creds);
  };

  const logout = () => {
    localStorage.removeItem('survey_auth_token');
    localStorage.removeItem('survey_auth_user');
    setToken(null);
    setUser(null);
    toast.success('Logged out successfully');
  };

  const isAuthenticated = !!token && !!user;
  const isAdmin = isAuthenticated && (user?.role === 'admin' || user?.role === 'creator');

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isAdmin,
        isLoading,
        login,
        register,
        demoLogin,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
