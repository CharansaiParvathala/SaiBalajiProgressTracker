// src/context/auth-context.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  cluster,
  usersCollection,
  hashPassword,
  verifyPassword
} from '@/config/couchbase';
import { User, UserRole } from '@/lib/types';
import { toast } from '@/components/ui/sonner';

interface AuthContextType {
  user: User | null;
  login: (email: string, password?: string) => Promise<void>;
  logout: () => void;
  register: (name: string, email: string, password: string, phone: string) => Promise<boolean>;
  isAuthenticated: boolean;
  role: UserRole | null;
}

const AuthContext = createContext<AuthContextType>(null!);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  // Initialize predefined users
  useEffect(() => {
    const createPredefinedUsers = async () => {
      const predefinedUsers = [
        {
          id: 'admin1',
          name: 'Admin User',
          email: 'admin1@saibalaji.com',
          password: await hashPassword('Admin@1234'),
          phone: '+911234567890',
          role: 'admin' as UserRole,
          createdAt: new Date().toISOString()
        },
        {
          id: 'owner1',
          name: 'Property Owner',
          email: 'owner1@saibalaji.com',
          password: await hashPassword('Owner@1234'),
          phone: '+911234567891',
          role: 'owner' as UserRole,
          createdAt: new Date().toISOString()
        },
        {
          id: 'checker2',
          name: 'Quality Checker',
          email: 'checker2@saibalaji.com',
          password: await hashPassword('Checker@1234'),
          phone: '+911234567892',
          role: 'checker' as UserRole,
          createdAt: new Date().toISOString()
        }
      ];

      try {
        for (const user of predefinedUsers) {
          await usersCollection.upsert(`user::${user.email}`, user);
        }
      } catch (error) {
        console.error('Error initializing predefined users:', error);
      }
    };

    createPredefinedUsers();
  }, []);

  const login = async (email: string, password?: string) => {
    try {
      let authenticatedUser: User | null = null;

      if (password) {
        // Regular user login
        const query = `
          SELECT META().id, * 
          FROM \`users\` 
          WHERE email = $1 AND role = 'leader'
        `;
        const result = await cluster.query(query, [email]);
        
        if (result.rows.length === 0) throw new Error('Invalid credentials');
        
        const user = result.rows[0];
        const isValid = await verifyPassword(password, user.password);
        if (!isValid) throw new Error('Invalid password');
        
        authenticatedUser = user;
      } else {
        // Predefined role login
        const query = `
          SELECT META().id, * 
          FROM \`users\` 
          WHERE email = $1 AND role IN ['admin', 'owner', 'checker']
        `;
        const result = await cluster.query(query, [email]);
        
        if (result.rows.length === 0) throw new Error('Role-based login failed');
        authenticatedUser = result.rows[0];
      }

      setUser(authenticatedUser);
      localStorage.setItem('currentUser', JSON.stringify(authenticatedUser));
      navigateBasedOnRole(authenticatedUser.role);
      
      toast.success(`Welcome, ${authenticatedUser.name}`, {
        description: `Logged in as ${authenticatedUser.role}`
      });
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error instanceof Error ? error.message : 'Login failed');
    }
  };

  const register = async (name: string, email: string, password: string, phone: string) => {
    try {
      // Check if user exists
      const checkQuery = `SELECT META().id FROM \`users\` WHERE email = $1`;
      const checkResult = await cluster.query(checkQuery, [email]);
      
      if (checkResult.rows.length > 0) {
        throw new Error('Email already registered');
      }

      // Create new leader user
      const newUser: User = {
        id: crypto.randomUUID(),
        name,
        email,
        password: await hashPassword(password),
        phone,
        role: 'leader',
        createdAt: new Date().toISOString()
      };

      await usersCollection.insert(`user::${email}`, newUser);
      
      setUser(newUser);
      localStorage.setItem('currentUser', JSON.stringify(newUser));
      navigate('/leader');
      
      toast.success('Registration successful!');
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error instanceof Error ? error.message : 'Registration failed');
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const navigateBasedOnRole = (role: UserRole) => {
    const routes = {
      admin: '/admin',
      owner: '/owner',
      checker: '/checker',
      leader: '/leader'
    };
    navigate(routes[role] || '/');
  };

  const value = {
    user,
    login,
    logout,
    register,
    isAuthenticated: !!user,
    role: user?.role || null
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
