import { createContext, useContext, useEffect, useState } from 'react';
import { account } from '../lib/appwrite';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // logic checks for existing session when app starts
  useEffect(() => {
    const bootstrap = async () => {
      try {
        const currentUser = await account.get();
        setUser(currentUser);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    bootstrap();
  }, []);

  // auth actions
  const signUp = async (email, password) => {
    setError(null);
    try {
      // creates acc with unique requirement, takes in email / password, immediatly signs user in
      await account.create('unique()', email, password);
      await signIn(email, password);
      console.log("New Account created: ", email, password);
    } catch (error) {
      setError(error?.message ?? 'Sign up failed');
      throw error;
    }
  };

  const signIn = async (email, password) => {
    setError(null);
    try {
      // signs in acc, takes in email / password, setting current user variable with account.get and setUser sets the currentUser
      await account.createEmailPasswordSession(email, password);
      const currentUser = await account.get();
      setUser(currentUser);
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
    }
  }

  const refreshUser = async () => {
    try {
      // tries to get the current user with account get, if it fails sets user as null
      const currentUser = await account.get();
      setUser(currentUser);
    } catch {
      setUser(null);
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, error, signUp, signIn, signOut, refreshUser }}>
      { children }
    </AuthContext.Provider>
  )
}