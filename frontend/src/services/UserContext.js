import React, { createContext, useState, useContext, useEffect } from 'react';
import { userService } from './api';
import { AuthContext } from './AuthContext';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const { currentUser, isAuthenticated } = useContext(AuthContext);
  const [userStats, setUserStats] = useState(null);
  const [userActivities, setUserActivities] = useState([]);
  const [loadingStats, setLoadingStats] = useState(false);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [error, setError] = useState(null);

  // Load user statistics when the user is authenticated
  useEffect(() => {
    const loadUserStats = async () => {
      if (!isAuthenticated || !currentUser || !currentUser.id) {
        return;
      }
      
      setLoadingStats(true);
      try {
        const statsResponse = await userService.getUserStatistics(currentUser.id);
        setUserStats(statsResponse.data);
        setError(null);
      } catch (err) {
        console.error('Error loading user stats:', err);
        setError('Failed to load user statistics');
      } finally {
        setLoadingStats(false);
      }
    };

    loadUserStats();
  }, [isAuthenticated, currentUser]);

  // Fetch user activities
  const fetchUserActivities = async (userId) => {
    if (!userId) return;
    
    setLoadingActivities(true);
    try {
      const activitiesResponse = await userService.getUserActivity(userId);
      setUserActivities(activitiesResponse.data);
      setError(null);
      return activitiesResponse.data;
    } catch (err) {
      console.error('Error loading user activities:', err);
      setError('Failed to load user activities');
      return [];
    } finally {
      setLoadingActivities(false);
    }
  };

  // Refresh user statistics
  const refreshUserStats = async (userId = null) => {
    const targetUserId = userId || (currentUser ? currentUser.id : null);
    if (!targetUserId) return;
    
    setLoadingStats(true);
    try {
      const statsResponse = await userService.getUserStatistics(targetUserId);
      setUserStats(statsResponse.data);
      setError(null);
      return statsResponse.data;
    } catch (err) {
      console.error('Error refreshing user stats:', err);
      setError('Failed to refresh user statistics');
      return null;
    } finally {
      setLoadingStats(false);
    }
  };

  // Update user profile
  const updateUserProfile = async (userId, profileData) => {
    if (!userId) return { success: false, error: 'User ID is required' };
    
    try {
      await userService.updateUserProfile(userId, profileData);
      
      // If updating the current user, refresh stats
      if (currentUser && userId === currentUser.id) {
        await refreshUserStats();
      }
      
      return { success: true };
    } catch (err) {
      console.error('Error updating user profile:', err);
      return { 
        success: false, 
        error: err.response?.data?.message || err.message || 'Failed to update profile'
      };
    }
  };

  return (
    <UserContext.Provider
      value={{
        userStats,
        userActivities,
        loadingStats,
        loadingActivities,
        error,
        fetchUserActivities,
        refreshUserStats,
        updateUserProfile
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext); 