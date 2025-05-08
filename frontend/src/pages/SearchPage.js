import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Nav, Card, Button, Form } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { searchService } from '../services/api';
import QuestionCard from '../components/QuestionCard';

const SearchPage = () => {
  const [searchResults, setSearchResults] = useState({ questions: [], users: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [filter, setFilter] = useState('newest');
  
  const location = useLocation();
  const searchQuery = new URLSearchParams(location.search).get('q');

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!searchQuery) {
        setSearchResults({ questions: [], users: [] });
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        console.log("Searching for:", searchQuery);
        const response = await searchService.globalSearch(searchQuery);
        console.log("Search response:", response);
        
        // Ensure we have valid data structure
        if (response && response.data) {
          setSearchResults({
            questions: response.data.questions || [],
            users: response.data.users || []
          });
        } else {
          console.warn("Unexpected search response format:", response);
          setSearchResults({ questions: [], users: [] });
        }
        setError(null);
      } catch (err) {
        console.error('Error details:', err.response || err);
        setError(`Failed to load search results: ${err.message || 'Unknown error'}`);
        console.error('Error searching:', err);
        setSearchResults({ questions: [], users: [] });
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [searchQuery]);

  // Apply filters to questions
  const getFilteredQuestions = () => {
    const questions = [...searchResults.questions];
    
    if (filter === 'newest') {
      return questions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    if (filter === 'votes') {
      return questions.sort((a, b) => (b.votes || 0) - (a.votes || 0));
    }
    if (filter === 'answers') {
      return questions.sort((a, b) => (b.answersCount || 0) - (a.answersCount || 0));
    }
    
    return questions;
  };

  // Get number of results for each tab
  const getTabCounts = () => {
    const totalCount = searchResults.questions.length + searchResults.users.length;
    return {
      all: totalCount,
      questions: searchResults.questions.length,
      users: searchResults.users.length
    };
  };

  const tabCounts = getTabCounts();
  const filteredQuestions = getFilteredQuestions();

  // Function to render user cards
  const renderUserCards = () => {
    return searchResults.users.map(user => (
      <Card key={user.id} className="mb-3 user-card">
        <Card.Body>
          <div className="d-flex">
            <div className="me-3">
              <Link to={`/users/${user.id}`}>
                <div className="user-avatar-lg">
                  {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
                </div>
              </Link>
            </div>
            <div>
              <h5 className="mb-1">
                <Link to={`/users/${user.id}`} className="text-decoration-none">
                  {user.username}
                </Link>
              </h5>
              <div className="text-muted mb-2">{user.email}</div>
              {user.reputation > 0 && (
                <div className="mb-1">
                  <span className="badge bg-secondary me-2">{user.reputation} reputation</span>
                </div>
              )}
              {user.bio && (
                <p className="text-truncate mb-0" style={{ maxWidth: '500px' }}>
                  {user.bio}
                </p>
              )}
            </div>
          </div>
        </Card.Body>
      </Card>
    ));
  };

  return (
    <Container className="py-4">
      <h1 className="mb-4">Search Results for "{searchQuery}"</h1>
      
      {loading ? (
        <div className="text-center py-5">Loading...</div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : (
        <Row>
          <Col md={3}>
            <div className="mb-4">
              <h5>Filter By</h5>
              <Nav className="flex-column nav-pills">
                <Nav.Link 
                  className={activeTab === 'all' ? 'active' : ''} 
                  onClick={() => setActiveTab('all')}
                >
                  All Results ({tabCounts.all})
                </Nav.Link>
                <Nav.Link 
                  className={activeTab === 'questions' ? 'active' : ''} 
                  onClick={() => setActiveTab('questions')}
                >
                  Questions ({tabCounts.questions})
                </Nav.Link>
                <Nav.Link 
                  className={activeTab === 'users' ? 'active' : ''} 
                  onClick={() => setActiveTab('users')}
                >
                  Users ({tabCounts.users})
                </Nav.Link>
              </Nav>
            </div>
            
            {(activeTab === 'all' || activeTab === 'questions') && tabCounts.questions > 0 && (
              <div className="mb-4">
                <h5>Sort Questions</h5>
                <Form.Select 
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="mt-2"
                >
                  <option value="newest">Newest</option>
                  <option value="votes">Most Votes</option>
                  <option value="answers">Most Answers</option>
                </Form.Select>
              </div>
            )}
          </Col>
          
          <Col md={9}>
            {tabCounts.all === 0 ? (
              <div className="text-center py-5">
                <p>No results found for "{searchQuery}".</p>
                <p>Try different keywords or <Link to="/ask">ask a question</Link>.</p>
              </div>
            ) : (
              <div>
                {/* Show questions if on questions tab or all tab */}
                {(activeTab === 'all' || activeTab === 'questions') && (
                  <>
                    {tabCounts.questions > 0 ? (
                      <div className="mb-4">
                        {activeTab === 'all' && (
                          <h3 className="mb-3">Questions ({tabCounts.questions})</h3>
                        )}
                        
                        <div>
                          {filteredQuestions.map(question => (
                            <QuestionCard key={question.id} question={question} />
                          ))}
                        </div>
                        
                        {activeTab === 'all' && tabCounts.questions > 3 && (
                          <div className="text-center mt-3">
                            <Button 
                              variant="outline-primary" 
                              onClick={() => setActiveTab('questions')}
                            >
                              View All Questions
                            </Button>
                          </div>
                        )}
                      </div>
                    ) : (
                      activeTab === 'questions' && (
                        <div className="text-center py-4">
                          <p>No questions found for "{searchQuery}".</p>
                          <Button as={Link} to="/ask" variant="primary">
                            Ask a Question
                          </Button>
                        </div>
                      )
                    )}
                  </>
                )}
                
                {/* Show users if on users tab or all tab */}
                {(activeTab === 'all' || activeTab === 'users') && (
                  <>
                    {tabCounts.users > 0 ? (
                      <div>
                        {activeTab === 'all' && (
                          <h3 className="mb-3">Users ({tabCounts.users})</h3>
                        )}
                        
                        <div>{renderUserCards()}</div>
                        
                        {activeTab === 'all' && tabCounts.users > 3 && (
                          <div className="text-center mt-3">
                            <Button 
                              variant="outline-primary" 
                              onClick={() => setActiveTab('users')}
                            >
                              View All Users
                            </Button>
                          </div>
                        )}
                      </div>
                    ) : (
                      activeTab === 'users' && (
                        <div className="text-center py-4">
                          <p>No users found for "{searchQuery}".</p>
                        </div>
                      )
                    )}
                  </>
                )}
              </div>
            )}
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default SearchPage; 