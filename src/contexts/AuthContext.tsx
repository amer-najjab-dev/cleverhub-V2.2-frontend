import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

interface User {
  id: number;
  email: string;
  fullName: string;
  role: 'ADMIN' | 'SUPER_ADMIN' | 'EMPLOYEE';
  isActive?: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
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
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setIsLoading(false);
        return;
      }
      
      const response = await api.get('/auth/me');
      if (response.data.success) {
        setUser(response.data.data);
      } else {
        localStorage.removeItem('auth_token');
      }
    } catch (error) {
      console.log('No hay sesión activa');
      localStorage.removeItem('auth_token');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data.success) {
        const userData = response.data.data;
        setUser(userData);
        localStorage.setItem('auth_token', response.data.token);
        
        // ✅ GUARDAR EL USUARIO EN localStorage
        localStorage.setItem('user', JSON.stringify({
          id: userData.id,
          email: userData.email,
          fullName: userData.fullName,
          role: userData.role,
          pharmacyId: userData.pharmacyId
        }));
        
        // Redirigir según el rol
        if (userData.role === 'SUPER_ADMIN') {
          window.location.href = '/admin/dashboard';
        } else {
          window.location.href = '/';
        }
      }
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Error en logout:', error);
    }
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');  // ✅ Limpiar también el usuario
    setUser(null);
    window.location.href = '/login';
  };

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