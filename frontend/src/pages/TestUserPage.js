import React, { useContext, useState, useEffect } from 'react';
import { Container, Card, Button, Alert } from 'react-bootstrap';
import { AuthContext } from '../services/AuthContext';
import { userService } from '../services/api';

const TestUserPage = () => {
  const { currentUser, isAuthenticated } = useContext(AuthContext);
  const [storedUser, setStoredUser] = useState(null);
  const [refreshedUser, setRefreshedUser] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Get user from localStorage
    const userFromStorage = localStorage.getItem('user');
    if (userFromStorage) {
      try {
        setStoredUser(JSON.parse(userFromStorage));
      } catch (e) {
        console.error("Error parsing stored user:", e);
      }
    }
  }, []);

  const refreshUser = async () => {
    if (!currentUser || !currentUser.id) {
      setError("No user is currently logged in or user ID is missing");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await userService.getUserById(currentUser.id);
      setRefreshedUser(response.data);
      
      // Update localStorage with fresh data
      localStorage.setItem('user', JSON.stringify(response.data));
      
      // Reload page to update AuthContext
      window.location.reload();
    } catch (err) {
      setError(`Error refreshing user: ${err.message}`);
      console.error("Error fetching user:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatUser = (user) => {
    if (!user) return "No user data";
    
    return (
      <div>
        <p><strong>ID:</strong> {user.id}</p>
        <p><strong>Username:</strong> {user.username}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Is Moderator:</strong> {user.isModerator ? "Yes" : "No"}</p>
        <p><strong>Is Banned:</strong> {user.banned ? "Yes" : "No"}</p>
        <pre className="border p-2 bg-light">
          {JSON.stringify(user, null, 2)}
        </pre>
      </div>
    );
  };

  return (
    <Container className="py-5">
      <h1>User Authentication Debug</h1>
      
      <Alert variant="info">
        This page helps diagnose authentication issues by showing the state of the current user.
      </Alert>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      <div className="mb-4">
        <h3>Authentication Status</h3>
        <p>
          <strong>Is Authenticated:</strong> {isAuthenticated ? "Yes" : "No"}
        </p>
        <Button 
          variant="primary" 
          onClick={refreshUser} 
          disabled={loading || !isAuthenticated}
        >
          {loading ? "Loading..." : "Refresh User Data"}
        </Button>
      </div>
      
      <div className="row">
        <div className="col-md-6 mb-4">
          <Card>
            <Card.Header>Current User from Context</Card.Header>
            <Card.Body>
              {formatUser(currentUser)}
            </Card.Body>
          </Card>
        </div>
        
        <div className="col-md-6 mb-4">
          <Card>
            <Card.Header>User from localStorage</Card.Header>
            <Card.Body>
              {formatUser(storedUser)}
            </Card.Body>
          </Card>
        </div>
        
        {refreshedUser && (
          <div className="col-md-12">
            <Card>
              <Card.Header>Refreshed User Data</Card.Header>
              <Card.Body>
                {formatUser(refreshedUser)}
              </Card.Body>
            </Card>
          </div>
        )}
      </div>
    </Container>
  );
};

export default TestUserPage; 