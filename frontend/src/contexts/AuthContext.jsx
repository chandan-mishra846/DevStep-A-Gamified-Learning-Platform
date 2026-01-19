import { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in (Local Storage)
  useEffect(() => {
    const savedUser = localStorage.getItem('userInfo');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing user info:', error);
        localStorage.removeItem('userInfo');
      }
    }
    setLoading(false);
  }, []);

  // Login Function
  const login = async (email, password) => {
    const { data } = await axios.post(`${API_BASE_URL}/api/users/login`, { email, password });
    setUser(data);
    localStorage.setItem('userInfo', JSON.stringify(data));
    return data;
  };
  
  // Register Function
  const register = async (name, email, password) => {
    const { data } = await axios.post(`${API_BASE_URL}/api/users/register`, { name, email, password });
    setUser(data);
    localStorage.setItem('userInfo', JSON.stringify(data));
    return data;
  };

  // Logout Function
  const logout = () => {
    localStorage.removeItem('userInfo');
    setUser(null);
  };

  // Refresh User Data Function
  const refreshUser = async () => {
    try {
      const savedUser = localStorage.getItem('userInfo');
      if (savedUser) {
        const { token } = JSON.parse(savedUser);
        const { data } = await axios.get(`${API_BASE_URL}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const updatedUser = { ...data, token };
        setUser(updatedUser);
        localStorage.setItem('userInfo', JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};