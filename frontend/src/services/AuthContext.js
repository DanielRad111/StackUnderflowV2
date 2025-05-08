import React, { createContext, useState, useEffect } from 'react';
import { userService } from './api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper function to normalize user data
  const normalizeUserData = (user) => {
    if (!user) return null;
    
    // Create a new object to avoid reference issues
    const normalizedUser = { ...user };
    
    // Ensure both id and userId are present
    if (normalizedUser.userId && !normalizedUser.id) {
      normalizedUser.id = normalizedUser.userId;
    } else if (normalizedUser.id && !normalizedUser.userId) {
      normalizedUser.userId = normalizedUser.id;
    }
    
    return normalizedUser;
  };

  useEffect(() => {
    // Check if user is stored in localStorage
    const storedUser = localStorage.getItem('user');
    console.log("Checking for stored user:", storedUser ? "Found" : "Not found");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        console.log("Parsed stored user:", parsedUser);
        
        // Normalize the user data
        const normalizedUser = normalizeUserData(parsedUser);
        console.log("Normalized user data:", normalizedUser);
        
        setCurrentUser(normalizedUser);
      } catch (error) {
        console.error("Error parsing stored user:", error);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      console.log("Attempting login for user:", username);
      const response = await userService.login(username, password);
      console.log("Login response:", response);
      if (response.data === true) {
        // Login successful, fetch user details
        console.log("Login successful, fetching user details");
        const userResponse = await userService.getUserByUsername(username);
        console.log("User details response:", userResponse);
        
        // Normalize user data
        const normalizedUser = normalizeUserData(userResponse.data);
        console.log("Normalized user data:", normalizedUser);
        
        setCurrentUser(normalizedUser);
        localStorage.setItem('user', JSON.stringify(normalizedUser));
        console.log("User stored in context and localStorage:", normalizedUser);
        return { success: true, user: normalizedUser };
      }
      return { success: false, message: 'Invalid credentials' };
    } catch (error) {
      console.error("Login error:", error.response || error);
      if (error.response && error.response.status === 403) {
        return { success: false, message: error.response.data.message, reason: error.response.data.reason };
      }
      return { success: false, message: 'Login failed. Please try again.' };
    }
  };

  const register = async (username, email, password, phoneNumber) => {
    try {
      console.log("Attempting to register user:", username);
      const response = await userService.register(username, email, password, phoneNumber);
      console.log("Register response:", response);
      
      // Normalize user data
      const normalizedUser = normalizeUserData(response.data);
      console.log("Normalized user data:", normalizedUser);
      
      setCurrentUser(normalizedUser);
      localStorage.setItem('user', JSON.stringify(normalizedUser));
      console.log("User stored in context and localStorage:", normalizedUser);
      return { success: true, user: normalizedUser };
    } catch (error) {
      console.error("Registration error:", error.response || error);
      return { success: false, message: 'Registration failed. Please try again.' };
    }
  };

  const logout = () => {
    console.log("Logging out user");
    setCurrentUser(null);
    localStorage.removeItem('user');
  };

  const value = {
    currentUser,
    login,
    register,
    logout,
    isAuthenticated: !!currentUser,
    isModerator: currentUser ? currentUser.isModerator : false
  };

  console.log("Auth context current state:", {
    isAuthenticated: !!currentUser,
    isModerator: currentUser ? currentUser.isModerator : false,
    userId: currentUser?.id || currentUser?.userId
  });

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}; 