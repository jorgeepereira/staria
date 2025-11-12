import { createContext, useContext, useEffect, useState } from 'react';
import { account } from '../lib/appwrite';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isNewUser, setIsNewUser] = useState(false);

  // logic checks for existing session when app starts
  useEffect(() => {
    const bootstrap = async () => {
      try {
        const currentUser = await account.get();
        setUser(currentUser);
        setIsNewUser(false);
      } catch {
        setUser(null);
        setIsNewUser(false);
      } finally {
        setLoading(false);
      }
    };
    bootstrap();
  }, []);

  // auth actions
  const signUp = async (email, password) => {
    
    try {
      setError(null);
      
      // creates acc with unique requirement, takes in email / password, immediatly signs user in
      await account.create('unique()', email, password);
      await account.createEmailPasswordSession(email, password);

      // mark as new user to trigger onboarding
      const currentUser = await account.get();
      setUser(currentUser);
      setIsNewUser(true);

    } catch (error) {
      setError(error?.message ?? 'Sign up failed');
      throw error;
    } 
  };

  const signIn = async (email, password) => {
    try {
      setError(null);
      // signs in acc, takes in email / password, setting current user variable with account.get and setUser sets the currentUser
      await account.createEmailPasswordSession(email, password);
      const currentUser = await account.get();
      setUser(currentUser);
      setIsNewUser(false);
    } catch (error) {
      setError(error?.message ?? 'Sign in failed');
      throw error;
    }
  }

  const signOut = async () => {
    setError(null);
    try {
      // signs out user by calling deleteSession and passing in the value current (deletes current session)
      await account.deleteSession('current');
    } finally {
      setUser(null);
      setIsNewUser(false);
    }
  }

  const refreshUser = async () => {
    try {
      // tries to get the current user with account get, if it fails sets user as null
      const currentUser = await account.get();
      setUser(currentUser);
    } catch {
      setIsNewUser(false);
      setUser(null);
    }
  }

  const completeOnboarding = async () => {
    setIsNewUser(false);
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      error, 
      isNewUser, 
      signUp, 
      signIn, 
      signOut, 
      refreshUser, 
      completeOnboarding 
      }}>
      { children }
    </AuthContext.Provider>
  )
}