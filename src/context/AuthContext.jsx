import React, { createContext, useContext, useState, useEffect } from 'react';
import { account } from '../config/appwrite';
import { useNavigate } from 'react-router-dom';
import { databases } from '../config/database';
import { Query } from 'appwrite';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check if user profile exists in the database
  const checkUserProfile = async (userId) => {
    try {
      const response = await databases.listDocuments(
        import.meta.env.VITE_APPWRITE_DATABASE_ID,
        import.meta.env.VITE_USERS_COLLECTION_ID,
        [Query.equal("userID", userId)]
      );
      
      return response.documents.length > 0;
    } catch (error) {
      console.error("Error checking user profile:", error);
      return false;
    }
  };

  const checkUser = async () => {
    try {
      const session = await account.getSession('current');
      if (session) {
        const userData = await account.get();
        setUser(userData);
        return userData;
      }
      setUser(null);
      return null;
    } catch (error) {
      console.error('Session error:', error);
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkUser();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      // First, check if there's an active session
      try {
        await account.get();
        // If we get here, there's an active session, so delete it first
        await account.deleteSession('current');
      } catch (error) {
        // No active session, continue with login
        console.log('No active session found');
      }

      // Now proceed with login
      const session = await account.createEmailPasswordSession(email, password);
      const userData = await account.get();
      setUser(userData);
      
      // Check if user has completed profile setup
      const hasProfile = await checkUserProfile(userData.$id);
      
      setLoading(false);
      
      // Redirect to profile setup if new user, otherwise to dashboard
      if (!hasProfile) {
        navigate('/profile', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
      
      return userData;
    } catch (error) {
      setLoading(false);
      console.error('Login error:', error);
      throw error;
    }
  };

  const signup = async (email, password, name) => {
    try {
      await account.create('unique()', email, password, name);
      await login(email, password);
      // The login function will now handle redirection to profile setup
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await account.deleteSession('current');
      setUser(null);
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Add updateUser function
  const updateUser = (newUserData) => {
    setUser(newUserData);
  };

  // Add periodic session check
  useEffect(() => {
    const intervalId = setInterval(async () => {
      if (user) {
        const userData = await checkUser();
        if (!userData) {
          // Session expired
          navigate('/login', { replace: true });
        }
      }
    }, 300000); // Check every 5 minutes

    return () => clearInterval(intervalId);
  }, [user]);

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      signup, 
      logout,
      updateUser, // Add updateUser to the context value
      isAuthenticated: !!user 
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
