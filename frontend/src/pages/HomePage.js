import React, { useState, useEffect } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { Container, Row, Col, Button, Form } from 'react-bootstrap';
import QuestionCard from '../components/QuestionCard';
import { questionService, tagService } from '../services/api';

const HomePage = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('newest');
  
  const location = useLocation();
  const { tagName } = useParams();
  const searchQuery = new URLSearchParams(location.search).get('search');

  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      try {
        console.log("Fetching questions with params:", { searchQuery, tagName });
        let response;
        
        if (searchQuery) {
          response = await questionService.searchQuestions(searchQuery);
        } else if (tagName) {
          // Tag URL changed from /tags/:tagName to /tag/name/:tagName
          response = await questionService.getQuestionsByTag(tagName);
        } else {
          response = await questionService.getAllQuestions();
        }
        
        console.log("Questions response:", response);
        
        // Ensure we have an array of questions
        const questionsData = response.data || [];
        console.log("Questions data:", questionsData);
        
        // Sort questions based on filter
        let sortedData = [...questionsData];
        if (filter === 'newest') {
          sortedData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        } else if (filter === 'votes') {
          sortedData.sort((a, b) => b.votes - a.votes);
        } else if (filter === 'answers') {
          sortedData.sort((a, b) => (b.answersCount || 0) - (a.answersCount || 0));
        }
        
        setQuestions(sortedData);
        setError(null);
      } catch (err) {
        console.error('Error details:', err.response || err);
        setError('Failed to load questions. Please try again later.');
        console.error('Error fetching questions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [searchQuery, tagName, filter]);

  return (
    <Container>
      <Row className="mb-4">
        <Col md={8}>
          <h1>
            {searchQuery 
              ? `Search Results for "${searchQuery}"` 
              : tagName 
                ? `Questions tagged [${tagName}]` 
                : 'All Questions'}
          </h1>
        </Col>
        <Col md={4} className="text-end">
          <Button as={Link} to="/ask" variant="primary">Ask Question</Button>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <strong>{questions.length}</strong> questions
            </div>
            <Form.Select 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              style={{ width: 'auto' }}
            >
              <option value="newest">Newest</option>
              <option value="votes">Most Votes</option>
              <option value="answers">Most Answers</option>
            </Form.Select>
          </div>
        </Col>
      </Row>

      {loading ? (
        <div className="text-center py-5">Loading...</div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : questions.length === 0 ? (
        <div className="text-center py-5">
          <p>No questions found.</p>
          <Button as={Link} to="/ask" variant="primary">Ask a Question</Button>
        </div>
      ) : (
        <div>
          {questions.map(question => (
            <QuestionCard key={question.id} question={question} />
          ))}
        </div>
      )}
    </Container>
  );
};

export default HomePage; 