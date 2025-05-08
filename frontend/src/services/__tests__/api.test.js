import axios from 'axios';
import { questionService, userService, searchService } from '../api';

// Mock axios
jest.mock('axios');

describe('API Services', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Set up a default successful response
    axios.create.mockReturnValue({
      get: jest.fn().mockResolvedValue({ data: {} }),
      post: jest.fn().mockResolvedValue({ data: {} }),
      put: jest.fn().mockResolvedValue({ data: {} }),
      delete: jest.fn().mockResolvedValue({ data: {} })
    });
  });

  describe('searchService', () => {
    test('globalSearch calls both question and user search APIs', async () => {
      // Mock the axios instance methods
      const mockAxios = {
        get: jest.fn()
      };
      axios.create.mockReturnValue(mockAxios);
      
      // Mock successful responses for both question and user searches
      mockAxios.get
        // First call (question search)
        .mockResolvedValueOnce({ 
          data: [{ id: 1, title: 'Test Question' }] 
        })
        // Second call (user search)
        .mockResolvedValueOnce({ 
          data: [{ id: 101, username: 'TestUser' }] 
        });
      
      // Call the service method
      const result = await searchService.globalSearch('test');
      
      // Verify the API calls
      expect(mockAxios.get).toHaveBeenCalledTimes(2);
      expect(mockAxios.get).toHaveBeenNthCalledWith(1, '/questions/search?keyword=test');
      expect(mockAxios.get).toHaveBeenNthCalledWith(2, '/users/search?keyword=test');
      
      // Verify the combined result
      expect(result.data).toEqual({
        questions: [{ id: 1, title: 'Test Question' }],
        users: [{ id: 101, username: 'TestUser' }]
      });
    });

    test('globalSearch handles empty search term', async () => {
      // Call the service with empty search term
      await expect(searchService.globalSearch('')).rejects.toThrow('Search keyword is required');
      
      // Verify no API calls were made
      const mockAxios = axios.create();
      expect(mockAxios.get).not.toHaveBeenCalled();
    });

    test('globalSearch handles API errors gracefully', async () => {
      // Mock axios to throw an error for questions but succeed for users
      const mockAxios = {
        get: jest.fn()
      };
      axios.create.mockReturnValue(mockAxios);
      
      mockAxios.get
        // First call (question search) - fails
        .mockRejectedValueOnce(new Error('Network error'))
        // Second call (user search) - succeeds
        .mockResolvedValueOnce({ 
          data: [{ id: 101, username: 'TestUser' }] 
        });
      
      // Call the service method
      const result = await searchService.globalSearch('test');
      
      // Should still return partial results
      expect(result.data).toEqual({
        questions: [],
        users: [{ id: 101, username: 'TestUser' }]
      });
    });
  });

  describe('questionService', () => {
    test('searchQuestions encodes search term correctly', async () => {
      const mockAxios = {
        get: jest.fn().mockResolvedValue({ data: [] })
      };
      axios.create.mockReturnValue(mockAxios);
      
      // Test with a term that needs encoding
      await questionService.searchQuestions('react hooks');
      
      expect(mockAxios.get).toHaveBeenCalledWith('/questions/search?keyword=react%20hooks');
    });

    test('searchQuestions rejects with empty search term', async () => {
      await expect(questionService.searchQuestions('')).rejects.toThrow('Search keyword is required');
    });
  });

  describe('userService', () => {
    test('searchUsers encodes search term correctly', async () => {
      const mockAxios = {
        get: jest.fn().mockResolvedValue({ data: [] })
      };
      axios.create.mockReturnValue(mockAxios);
      
      // Test with a term that needs encoding
      await userService.searchUsers('john doe');
      
      expect(mockAxios.get).toHaveBeenCalledWith('/users/search?keyword=john%20doe');
    });

    test('searchUsers rejects with empty search term', async () => {
      await expect(userService.searchUsers('')).rejects.toThrow('Search keyword is required');
    });
  });
}); 