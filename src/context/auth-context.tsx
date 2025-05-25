import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '@/lib/types';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/sonner';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string, phone: string) => Promise<boolean>;
  isAuthenticated: boolean;
  role: UserRole | null;
}

useEffect(() => {
  const loadUser = async () => {
    try {
      const response = await fetch('/api/me', {
        method: 'GET',
        credentials: 'include',
      });
      if (!response.ok) {
        console.log('No valid session found');
        setUser(null);
        return;
      }
      const userData: User = await response.json();
      setUser(userData);
    } catch (error) {
      console.error('Failed to load user:', error);
      setUser(null);
    }
  };
  loadUser();
}, []);

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => {},
  logout: async () => {},
  register: async () => false,
  isAuthenticated: false,
  role: null,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  // Load user from backend on mount to check for an existing session
  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await fetch('/api/me', {
          method: 'GET',
          credentials: 'include', // Ensure cookies are sent with the request
        });
        if (response.ok) {
          const userData: User = await response.json();
          setUser(userData);
        } else {
          setUser(null); // Explicitly clear user state if no valid session
        }
      } catch (error) {
        console.error('Failed to load user:', error);
        setUser(null);
      }
    };
    loadUser();
  }, []);

  // Handle user login with backend authentication
  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Include cookies for JWT token
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const userData: User = await response.json();
      setUser(userData);
      toast.success(`Welcome, ${userData.name}`, {
        description: `You are logged in as ${userData.role}`,
      });

      // Role-based redirection
      switch (userData.role) {
        case 'leader':
          navigate('/leader');
          break;
        case 'checker':
          navigate('/checker');
          break;
        case 'owner':
          navigate('/owner');
          break;
        case 'admin':
          navigate('/admin');
          break;
        default:
          navigate('/');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error instanceof Error ? error.message : 'Login failed. Please try again.');
    }
  };

  // Handle user logout by clearing the session
  const logout = async () => {
    try {
      const response = await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include', // Include cookies for session clearance
      });

      if (!response.ok) {
        throw new Error('Logout failed');
      }

      setUser(null);
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Logout failed. Please try again.');
    }
  };

  // Register a new user with the backend
  const register = async (name: string, email: string, password: string, phone: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Include cookies if needed by backend
        body: JSON.stringify({ name, email, password, phone, role: 'leader' }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.error('Registration failed', {
          description: errorData.message || 'Please try again.',
        });
        return false;
      }

      toast.success('Registration successful!', {
        description: 'You can now log in with your credentials.',
      });
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Registration failed. Please try again.');
      return false;
    }
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    register,
    isAuthenticated: !!user,
    role: user?.role || null,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
