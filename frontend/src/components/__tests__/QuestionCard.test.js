import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import QuestionCard from '../QuestionCard';

// Mock console methods to avoid cluttering test output
beforeEach(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  console.log.mockRestore();
  console.warn.mockRestore();
  console.error.mockRestore();
});

// Helper to render QuestionCard with Router context
const renderWithRouter = (ui) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('QuestionCard Component', () => {
  test('renders a question card with complete data', () => {
    const question = {
      id: 123,
      title: 'Test Question Title',
      text: 'This is a test question description',
      votes: 5,
      answersCount: 2,
      tags: 'react,javascript,testing',
      createdAt: '2023-05-15T12:00:00Z',
      authorId: 456,
      authorName: 'TestUser'
    };

    renderWithRouter(<QuestionCard question={question} />);
    
    // Check that key elements are rendered
    expect(screen.getByText('Test Question Title')).toBeInTheDocument();
    expect(screen.getByText('This is a test question description')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument(); // votes
    expect(screen.getByText('2')).toBeInTheDocument(); // answers
    expect(screen.getByText('react')).toBeInTheDocument(); // tag
    expect(screen.getByText('javascript')).toBeInTheDocument(); // tag
    expect(screen.getByText('testing')).toBeInTheDocument(); // tag
    expect(screen.getByText('TestUser')).toBeInTheDocument();
  });

  test('handles missing optional fields gracefully', () => {
    const question = {
      id: 123,
      title: 'Minimal Question',
      text: ''
      // Missing votes, answersCount, tags, etc.
    };

    renderWithRouter(<QuestionCard question={question} />);
    
    expect(screen.getByText('Minimal Question')).toBeInTheDocument();
    expect(screen.getByText('No description provided.')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument(); // default votes
    expect(screen.getByText('User')).toBeInTheDocument(); // default author name
  });

  test('handles alternative tag structure (tagList array)', () => {
    const question = {
      id: 123,
      title: 'Question with Tag List',
      text: 'Testing different tag formats',
      tagList: [
        { name: 'react' },
        { name: 'testing' }
      ]
    };

    renderWithRouter(<QuestionCard question={question} />);
    
    expect(screen.getByText('Question with Tag List')).toBeInTheDocument();
    expect(screen.getByText('react')).toBeInTheDocument();
    expect(screen.getByText('testing')).toBeInTheDocument();
  });

  test('truncates long question text', () => {
    const longText = 'A'.repeat(200); // Text longer than 150 chars
    const question = {
      id: 123,
      title: 'Long Question',
      text: longText
    };

    renderWithRouter(<QuestionCard question={question} />);
    
    // Should truncate and add ellipsis
    expect(screen.getByText(`${'A'.repeat(150)}...`)).toBeInTheDocument();
  });

  test('handles question with missing ID gracefully', () => {
    const question = {
      // Missing id/questionId
      title: 'Question Without ID',
      text: 'This should handle missing ID'
    };

    renderWithRouter(<QuestionCard question={question} />);
    
    expect(screen.getByText('Question Without ID')).toBeInTheDocument();
    // Link should still render but clicking it would prevent navigation
  });
}); 