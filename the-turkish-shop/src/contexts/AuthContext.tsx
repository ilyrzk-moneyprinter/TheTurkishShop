import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../firebase/types';
import { onAuthStateChange, getCurrentUser } from '../firebase/authService';

type AuthContextType = {
  currentUser: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Set up authentication state listener
    const unsubscribe = onAuthStateChange((user) => {
      setCurrentUser(user);
      setIsLoading(false);
    });

    // Initialize by checking current user
    const initAuth = async () => {
      try {
        const user = await getCurrentUser();
        setCurrentUser(user);
      } catch (error) {
        console.error('Error initializing auth context:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    // Clean up subscription
    return () => unsubscribe();
  }, []);

  const value = {
    currentUser,
    isLoading,
    isAuthenticated: !!currentUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 