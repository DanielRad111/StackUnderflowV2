import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import { AuthProvider, AuthContext } from '../AuthContext';
import { userService } from '../api';

// Mock the API service
jest.mock('../api', () => ({
  userService: {
    login: jest.fn(),
    getUserByUsername: jest.fn(),
    register: jest.fn()
  }
}));

// Mock localStorage
const mockLocalStorage = (function() {
  let store = {};
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn(key => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    })
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
});

// Helper to create a test component that consumes the context
const TestComponent = () => {
  const authContext = React.useContext(AuthContext);
  return (
    <div>
      <div data-testid="auth-status">
        {authContext.isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
      </div>
      {authContext.isAuthenticated && (
        <div data-testid="user-info">
          {authContext.currentUser.username}
        </div>
      )}
    </div>
  );
};

// Mock console methods to reduce test output noise
beforeEach(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  jest.clearAllMocks();
  console.log.mockRestore();
  console.error.mockRestore();
  mockLocalStorage.clear();
});

describe('AuthContext', () => {
  test('initializes as not authenticated', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated');
  });

  test('loads user from localStorage on init', async () => {
    // Setup mock localStorage with a stored user
    const mockUser = { id: 123, username: 'storeduser' };
    mockLocalStorage.getItem.mockReturnValueOnce(JSON.stringify(mockUser));
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Should be authenticated with the stored user
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
      expect(screen.getByTestId('user-info')).toHaveTextContent('storeduser');
    });
  });

  test('handles login success', async () => {
    // Setup mock API responses
    userService.login.mockResolvedValueOnce({ data: true });
    userService.getUserByUsername.mockResolvedValueOnce({
      data: { id: 123, username: 'testuser' }
    });
    
    // Create component with access to context functions
    const LoginTest = () => {
      const { login, isAuthenticated, currentUser } = React.useContext(AuthContext);
      
      return (
        <div>
          <button 
            onClick={() => login('testuser', 'password')}
            data-testid="login-button"
          >
            Login
          </button>
          <div data-testid="auth-status">
            {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
          </div>
          {isAuthenticated && (
            <div data-testid="user-info">{currentUser.username}</div>
          )}
        </div>
      );
    };
    
    render(
      <AuthProvider>
        <LoginTest />
      </AuthProvider>
    );
    
    // Initially not authenticated
    expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated');
    
    // Trigger login
    await act(async () => {
      screen.getByTestId('login-button').click();
    });
    
    // Should be authenticated with the user from API
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
      expect(screen.getByTestId('user-info')).toHaveTextContent('testuser');
    });
    
    // Check localStorage was updated
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('user', expect.any(String));
    const storedUserArg = mockLocalStorage.setItem.mock.calls[0][1];
    expect(JSON.parse(storedUserArg)).toEqual(expect.objectContaining({
      id: 123,
      username: 'testuser'
    }));
  });

  test('handles login failure', async () => {
    // Setup mock API response for failed login
    userService.login.mockResolvedValueOnce({ data: false });
    
    // Create component with access to context functions
    const LoginTest = () => {
      const { login } = React.useContext(AuthContext);
      const [loginResult, setLoginResult] = React.useState(null);
      
      const handleLogin = async () => {
        const result = await login('baduser', 'wrongpass');
        setLoginResult(result);
      };
      
      return (
        <div>
          <button 
            onClick={handleLogin}
            data-testid="login-button"
          >
            Login
          </button>
          {loginResult && (
            <div data-testid="login-result">
              {loginResult.success ? 'Success' : 'Failed'}
            </div>
          )}
        </div>
      );
    };
    
    render(
      <AuthProvider>
        <LoginTest />
      </AuthProvider>
    );
    
    // Trigger login
    await act(async () => {
      screen.getByTestId('login-button').click();
    });
    
    // Should show failed login
    await waitFor(() => {
      expect(screen.getByTestId('login-result')).toHaveTextContent('Failed');
    });
    
    // Should not update localStorage
    expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
  });

  test('handles logout', async () => {
    // Setup initial authenticated state
    const mockUser = { id: 123, username: 'testuser' };
    mockLocalStorage.getItem.mockReturnValueOnce(JSON.stringify(mockUser));
    
    // Create component with access to logout function
    const LogoutTest = () => {
      const { logout, isAuthenticated } = React.useContext(AuthContext);
      
      return (
        <div>
          <button 
            onClick={logout}
            data-testid="logout-button"
          >
            Logout
          </button>
          <div data-testid="auth-status">
            {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
          </div>
        </div>
      );
    };
    
    render(
      <AuthProvider>
        <LogoutTest />
      </AuthProvider>
    );
    
    // Initially authenticated
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
    });
    
    // Trigger logout
    act(() => {
      screen.getByTestId('logout-button').click();
    });
    
    // Should be logged out
    expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated');
    
    // Should remove user from localStorage
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('user');
  });
}); 