import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in (Local Storage)
  useEffect(() => {
    const savedUser = localStorage.getItem('userInfo');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  // Login Function
  const login = async (email, password) => {
    const { data } = await axios.post('http://localhost:5000/api/users/login', { email, password });
    setUser(data);
    localStorage.setItem('userInfo', JSON.stringify(data));
  };
  
  // Register Function
  const register = async (name, email, password) => {
    const { data } = await axios.post('http://localhost:5000/api/users/register', { name, email, password });
    setUser(data);
    localStorage.setItem('userInfo', JSON.stringify(data));
  };

  // Logout Function
  const logout = () => {
    localStorage.removeItem('userInfo');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};