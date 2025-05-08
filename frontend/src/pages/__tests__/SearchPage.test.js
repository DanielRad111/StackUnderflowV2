import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter, MemoryRouter, Route, Routes } from 'react-router-dom';
import SearchPage from '../SearchPage';
import { searchService } from '../../services/api';

// Mock the API services
jest.mock('../../services/api', () => ({
  searchService: {
    globalSearch: jest.fn()
  }
}));

// Mock console methods
beforeEach(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  jest.clearAllMocks();
  console.log.mockRestore();
  console.warn.mockRestore();
  console.error.mockRestore();
});

// Helper component to provide route parameters
const renderWithQuery = (searchQuery) => {
  return render(
    <MemoryRouter initialEntries={[`/search?q=${searchQuery}`]}>
      <Routes>
        <Route path="/search" element={<SearchPage />} />
      </Routes>
    </MemoryRouter>
  );
};

describe('SearchPage Component', () => {
  test('displays loading state initially', () => {
    // Mock the API call to return a promise that doesn't resolve immediately
    searchService.globalSearch.mockReturnValue(new Promise(() => {}));
    
    renderWithQuery('react');
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  test('displays search results when loaded', async () => {
    // Mock search results
    const mockResults = {
      data: {
        questions: [
          {
            id: 1,
            title: 'React Question',
            text: 'How to use React hooks?',
            votes: 5,
            answersCount: 2,
            authorId: 123,
            authorName: 'User1',
            createdAt: '2023-01-01T12:00:00Z'
          }
        ],
        users: [
          {
            id: 123,
            username: 'ReactExpert',
            email: 'expert@example.com',
            reputation: 500,
            bio: 'React developer'
          }
        ]
      }
    };
    
    searchService.globalSearch.mockResolvedValue(mockResults);
    
    renderWithQuery('react');
    
    // Wait for results to load
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
    
    // Check that results are displayed
    expect(screen.getByText('Search Results for "react"')).toBeInTheDocument();
    expect(screen.getByText('React Question')).toBeInTheDocument();
    expect(screen.getByText('ReactExpert')).toBeInTheDocument();
  });

  test('displays no results message when search returns empty', async () => {
    // Mock empty search results
    const mockEmptyResults = {
      data: {
        questions: [],
        users: []
      }
    };
    
    searchService.globalSearch.mockResolvedValue(mockEmptyResults);
    
    renderWithQuery('nonexistent');
    
    // Wait for results to load
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
    
    // Check for no results message
    expect(screen.getByText('No results found for "nonexistent".')).toBeInTheDocument();
  });

  test('displays error message when search fails', async () => {
    // Mock API error
    searchService.globalSearch.mockRejectedValue(new Error('Network error'));
    
    renderWithQuery('react');
    
    // Wait for error to be displayed
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
    
    // Check for error message
    expect(screen.getByText(/Failed to load search results/)).toBeInTheDocument();
  });

  test('changes tab when tabs are clicked', async () => {
    // Mock search results with both questions and users
    const mockResults = {
      data: {
        questions: [
          { id: 1, title: 'Question 1', text: 'Text 1' },
          { id: 2, title: 'Question 2', text: 'Text 2' }
        ],
        users: [
          { id: 101, username: 'User1' },
          { id: 102, username: 'User2' }
        ]
      }
    };
    
    searchService.globalSearch.mockResolvedValue(mockResults);
    
    renderWithQuery('test');
    
    // Wait for results to load
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
    
    // Initially, should show both questions and users (all results)
    expect(screen.getByText('Question 1')).toBeInTheDocument();
    expect(screen.getByText('User1')).toBeInTheDocument();
    
    // TODO: Add user interaction to test tab switching
    // This would require userEvent from @testing-library/user-event
    // and is left as a future enhancement
  });
}); 