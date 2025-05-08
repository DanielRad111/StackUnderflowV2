import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthContext } from '../../services/AuthContext';
import Navbar from '../Navbar';

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

// Helper to render Navbar with router context and auth context
const renderWithContext = (authContextValue) => {
  return render(
    <BrowserRouter>
      <AuthContext.Provider value={authContextValue}>
        <Navbar />
      </AuthContext.Provider>
    </BrowserRouter>
  );
};

describe('Navbar Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders in unauthenticated state', () => {
    const authContextValue = {
      isAuthenticated: false,
      currentUser: null,
      logout: jest.fn()
    };
    
    renderWithContext(authContextValue);
    
    // Brand should be present
    expect(screen.getByText('StackUnderflow')).toBeInTheDocument();
    
    // Navigation links
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Tags')).toBeInTheDocument();
    
    // Auth buttons for unauthenticated users
    expect(screen.getByText('Log in')).toBeInTheDocument();
    expect(screen.getByText('Sign up')).toBeInTheDocument();
    
    // Should not show authenticated user elements
    expect(screen.queryByText('Ask Question')).not.toBeInTheDocument();
    expect(screen.queryByText('Logout')).not.toBeInTheDocument();
  });

  test('renders in authenticated state', () => {
    const authContextValue = {
      isAuthenticated: true,
      currentUser: {
        id: 123,
        username: 'testuser',
        score: 100
      },
      logout: jest.fn()
    };
    
    renderWithContext(authContextValue);
    
    // User info should be displayed
    expect(screen.getByText('testuser')).toBeInTheDocument();
    expect(screen.getByText('100 pts')).toBeInTheDocument();
    
    // Auth buttons for authenticated users
    expect(screen.getByText('Ask Question')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
    
    // Should not show unauthenticated user elements
    expect(screen.queryByText('Log in')).not.toBeInTheDocument();
    expect(screen.queryByText('Sign up')).not.toBeInTheDocument();
  });

  test('search form redirects to search page', () => {
    const authContextValue = {
      isAuthenticated: false,
      currentUser: null,
      logout: jest.fn()
    };
    
    renderWithContext(authContextValue);
    
    // Find search form and input
    const searchInput = screen.getByPlaceholderText('Search questions, users...');
    const searchForm = searchInput.closest('form');
    
    // Enter search query and submit form
    fireEvent.change(searchInput, { target: { value: 'react hooks' } });
    fireEvent.submit(searchForm);
    
    // Should navigate to search page with query parameter
    expect(mockNavigate).toHaveBeenCalledWith('/search?q=react%20hooks');
    
    // Search input should be cleared
    expect(searchInput.value).toBe('');
  });

  test('logout button calls logout function and redirects to home', () => {
    const mockLogout = jest.fn();
    const authContextValue = {
      isAuthenticated: true,
      currentUser: {
        id: 123,
        username: 'testuser',
        score: 100
      },
      logout: mockLogout
    };
    
    renderWithContext(authContextValue);
    
    // Find and click logout button
    const logoutButton = screen.getByText('Logout');
    fireEvent.click(logoutButton);
    
    // Should call logout and navigate to home page
    expect(mockLogout).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  test('handles user with no score', () => {
    const authContextValue = {
      isAuthenticated: true,
      currentUser: {
        id: 123,
        username: 'newuser'
        // no score
      },
      logout: jest.fn()
    };
    
    renderWithContext(authContextValue);
    
    // User info should be displayed without score badge
    expect(screen.getByText('newuser')).toBeInTheDocument();
    expect(screen.queryByText('pts')).not.toBeInTheDocument();
  });
}); 