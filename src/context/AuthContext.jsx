import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChange, initAuthPersistence } from '../firebase/auth';
import { getUserProfile } from '../firebase/firestore';

const AuthContext = createContext(null);

/**
 * AuthProvider manages all authentication and user profile state.
 * Replaces prop-drilling of user/userProfile throughout the app.
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize session-only persistence
    initAuthPersistence();

    // Track authentication state
    const unsubscribeAuth = onAuthStateChange(async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const profile = await getUserProfile(currentUser.uid);
          setUserProfile(profile);
        } catch (error) {
          console.error("Error loading user profile:", error);
          setUserProfile(null);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
    };
  }, []);

  const value = {
    user,
    userProfile,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook to access auth state from any component.
 * @returns {{ user: object|null, userProfile: object|null, loading: boolean }}
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;

