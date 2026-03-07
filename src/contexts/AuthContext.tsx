import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

interface User {
  id: number;
  email: string;
  fullName: string;
  role: 'admin' | 'employee';
  isActive?: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  // Funciones de gestión de usuarios (solo admin)
  getUsers: () => Promise<User[]>;
  createUser: (userData: any) => Promise<User>;
  updateUser: (id: number, userData: any) => Promise<User>;
  deleteUser: (id: number) => Promise<void>;
  updateProfile: (profileData: any) => Promise<User>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await api.get('/auth/me');
      if (response.data.success) {
        setUser(response.data.data);
      }
    } catch (error) {
      console.log('No hay sesión activa');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.success) {
      setUser(response.data.data);
    }
  };

  const logout = async () => {
    await api.post('/auth/logout');
    setUser(null);
  };

  // Funciones de gestión de usuarios
  const getUsers = async (): Promise<User[]> => {
    const response = await api.get('/users');
    return response.data.data;
  };

  const createUser = async (userData: any): Promise<User> => {
    const response = await api.post('/users', userData);
    return response.data.data;
  };

  const updateUser = async (id: number, userData: any): Promise<User> => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data.data;
  };

  const deleteUser = async (id: number): Promise<void> => {
    await api.delete(`/users/${id}`);
  };

  const updateProfile = async (profileData: any): Promise<User> => {
    const response = await api.put('/users/profile/me', profileData);
    return response.data.data;
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      login,
      logout,
      isAuthenticated: !!user,
      getUsers,
      createUser,
      updateUser,
      deleteUser,
      updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};