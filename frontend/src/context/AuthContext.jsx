import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On app load, check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    const res = await axios.post('http://localhost:8000/api/auth/login/', { username, password });
    localStorage.setItem('access_token', res.data.access);
    localStorage.setItem('refresh_token', res.data.refresh);
    // Get user profile
    const profile = await axios.get('http://localhost:8000/api/auth/profile/', {
      headers: { Authorization: `Bearer ${res.data.access}` },
    });
    localStorage.setItem('user', JSON.stringify(profile.data));
    setUser(profile.data);
    return profile.data;
  };

  const register = async (username, email, password, password2) => {
    await axios.post('http://localhost:8000/api/auth/register/', {
      username,
      email,
      password,
      password2,
    });
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook for easy access
export function useAuth() {
  return useContext(AuthContext);
}
