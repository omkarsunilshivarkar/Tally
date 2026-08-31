import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(undefined);

export const API_URL =
  import.meta.env.VITE_API_URL ||
  `${window.location.protocol}//${window.location.hostname}:5000/api`;

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(() => {
    try {
      const cached = localStorage.getItem('tally_user');
      return cached ? JSON.parse(cached) : null;
    } catch (e) {
      return null;
    }
  });
  const [loading, setLoading] = useState(() => {
    const t = localStorage.getItem('token');
    const u = localStorage.getItem('tally_user');
    // If we have both token and cached user, don't block UI with loading spinner
    return Boolean(t && !u);
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
          localStorage.setItem('tally_user', JSON.stringify(userData));
        } else if (res.status === 401 || res.status === 403) {
          // Token expired or invalid
          logout();
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token]);

  const login = async (email, password) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Login failed');
    }

    localStorage.setItem('token', data.token);
    localStorage.setItem('tally_user', JSON.stringify(data.user));
    if (localStorage.getItem(`tally_onboarded_mobile_v1_${data.user.id}`) === null) {
      localStorage.setItem(`tally_onboarded_mobile_v1_${data.user.id}`, 'true');
    }
    setToken(data.token);
    setUser(data.user);
  };

  const register = async (email, password, name) => {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, name }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Registration failed');
    }

    localStorage.setItem('token', data.token);
    localStorage.setItem('tally_user', JSON.stringify(data.user));
    localStorage.setItem(`tally_onboarded_mobile_v1_${data.user.id}`, 'false');
    setToken(data.token);
    setUser(data.user);
  };

  const loginWithGoogle = async (credential) => {
    const res = await fetch(`${API_URL}/auth/google`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ credential }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Google login failed');
    }

    localStorage.setItem('token', data.token);
    localStorage.setItem('tally_user', JSON.stringify(data.user));
    if (localStorage.getItem(`tally_onboarded_mobile_v1_${data.user.id}`) === null) {
      localStorage.setItem(`tally_onboarded_mobile_v1_${data.user.id}`, 'true');
    }
    setToken(data.token);
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('tally_user');
    // Clear user dashboard caches
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('tally_cache_')) {
        localStorage.removeItem(key);
      }
    });
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, loginWithGoogle, logout }}>
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
