import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { Container, Row, Col, Card, Badge, Button, Form, Alert } from 'react-bootstrap';
import { questionService, answerService, voteService } from '../services/api';
import { AuthContext } from '../services/AuthContext';
import AnswerItem from '../components/AnswerItem';

const QuestionDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, isAuthenticated } = useContext(AuthContext);
  
  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [answerText, setAnswerText] = useState('');
  const [answerCode, setAnswerCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [answerError, setAnswerError] = useState('');

  const loadQuestionData = async () => {
    try {
      if (!id) {
        setError("Question ID is missing. Please check the URL.");
        setLoading(false);
        return;
      }

      // Validate id to prevent issues with 'undefined' or other invalid values
      if (id === 'undefined' || id === 'null') {
        setError("Invalid question ID format. Please check the URL.");
        setLoading(false);
        return;
      }
      
      const response = await questionService.getQuestionById(id);
      
      if (response && response.data) {
        // Make sure both id and questionId exist on the question object
        const questionData = response.data;
        if (questionData.questionId && !questionData.id) {
          questionData.id = questionData.questionId;
        } else if (questionData.id && !questionData.questionId) {
          questionData.questionId = questionData.id;
        }
        
        setQuestion(questionData);
        setError(null);
      } else {
        setError("Failed to load question details: Missing data");
      }
    } catch (err) {
      console.error("Error loading question:", err);
      setError(err.message || 'Failed to load question details. Please try again later.');
      setLoading(false);
    }
  };

  const loadAnswersData = async () => {
    try {
      // First try to use the question ID from the loaded question
      let questionId = question ? (question.questionId || question.id) : null;
      
      // Fall back to URL param if necessary
      if (!questionId && id) {
        questionId = id;
      }
      
      if (!questionId) {
        return;
      }
      
      // Validate questionId before making API call
      if (questionId === 'undefined' || questionId === 'null') {
        console.error("Invalid question ID for loading answers");
        setError("Invalid question ID. Please return to the questions page.");
        return;
      }
      
      const response = await answerService.getAnswersByQuestion(questionId);
      
      if (response && response.data) {
        setAnswers(response.data);
      }
    } catch (err) {
      console.error("Error loading answers:", err);
      // Not setting an error here so at least the question displays
    }
  };

  useEffect(() => {
    if (!id) {
      setError("Question ID is missing. Please check the URL.");
      setLoading(false);
      return;
    }
    
    const loadData = async () => {
      setLoading(true);
      await loadQuestionData();
      await loadAnswersData();
      setLoading(false);
    };

    loadData();
  }, [id]);

  const handleVote = async (voteType) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!question) {
      return;
    }
    
    // Get the question ID from the loaded question data
    const questionId = question.questionId || question.id;
    
    if (!questionId) {
      return;
    }
    
    // Get user ID, handling both property names
    const userId = currentUser?.id || currentUser?.userId;
    
    if (!userId) {
      return;
    }

    try {
      await voteService.voteQuestion(userId, questionId, voteType);
      loadQuestionData(); // Reload question to update vote count
    } catch (error) {
      // Silently handle error
    }
  };

  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    if (!answerText.trim()) {
      setAnswerError('Answer text is required');
      return;
    }
    
    if (!question) {
      setAnswerError('Cannot submit answer: Question data is missing');
      return;
    }
    
    // Get the question ID from the loaded question data, not from URL params
    const questionId = question.questionId || question.id;
    
    if (!questionId) {
      setAnswerError('Cannot submit answer due to missing question ID');
      return;
    }
    
    // Get user ID, handling both property names
    const userId = currentUser?.id || currentUser?.userId;
    
    if (!currentUser || !userId) {
      setAnswerError('Cannot submit answer: User information is missing');
      return;
    }
    
    setSubmitting(true);
    setAnswerError('');
    
    try {
      // Submit the answer
      await answerService.createAnswer(
        userId,
        questionId,
        answerText.trim(), 
        answerCode || ""
      );
      
      setAnswerText('');
      setAnswerCode('');
      await loadAnswersData(); // Reload answers to show the new one
    } catch (err) {
      let errorMessage = 'Failed to submit your answer. Please try again.';
      
      // Extract specific error message if available
      if (err.response && err.response.data) {
        if (typeof err.response.data === 'string') {
          errorMessage = `Server error: ${err.response.data}`;
        } else if (err.response.data.message) {
          errorMessage = `Server error: ${err.response.data.message}`;
        } else if (err.response.data.error) {
          errorMessage = `Server error: ${err.response.data.error}`;
        }
      }
      
      setAnswerError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAcceptAnswer = async (answerId) => {
    if (!question) {
      console.error("Cannot accept answer: Question data is missing");
      return;
    }
    
    // Get the question ID from the loaded question data
    const questionId = question.questionId || question.id;
    
    if (!questionId) {
      console.error("Cannot accept answer: Question ID is missing from question data");
      return;
    }

    // Validate IDs before making API call
    if (questionId === 'undefined' || answerId === 'undefined') {
      console.error("Invalid IDs for accepting answer");
      return;
    }
    
    try {
      await questionService.acceptAnswer(questionId, answerId);
      await loadQuestionData();
      await loadAnswersData();
    } catch (error) {
      console.error("Error accepting answer:", error);
      setError(`Failed to accept answer: ${error.message || 'Unknown error'}`);
      setTimeout(() => setError(null), 5000); // Clear error after 5 seconds
    }
  };

  if (loading) {
    return <Container className="py-5 text-center">Loading...</Container>;
  }

  if (error || !question) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error || 'Question not found'}</Alert>
        <div className="text-center mt-3">
          <Button 
            onClick={() => navigate('/', { replace: true })} 
            variant="primary"
          >
            Return to Questions
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Row>
        <Col>
          <Link to="/" className="text-decoration-none mb-3 d-inline-block">
            &larr; Back to All Questions
          </Link>
          
          <Card className="mb-4">
            <Card.Body>
              <div className="d-flex">
                <div className="vote-buttons">
                  <Button 
                    variant="outline-secondary" 
                    size="sm"
                    onClick={() => handleVote('UP')}
                    disabled={!isAuthenticated}
                  >
                    <i className="bi bi-caret-up-fill"></i>
                  </Button>
                  <div className="vote-count">{question.votes || 0}</div>
                  <Button 
                    variant="outline-secondary" 
                    size="sm"
                    onClick={() => handleVote('DOWN')}
                    disabled={!isAuthenticated}
                  >
                    <i className="bi bi-caret-down-fill"></i>
                  </Button>
                </div>
                
                <div className="flex-grow-1">
                  <Card.Title className="mb-3">{question.title || "Untitled Question"}</Card.Title>
                  <Card.Text>{question.text || "No description provided"}</Card.Text>
                  
                  {question.image && (
                    <div className="mb-3">
                      <img 
                        src={question.image} 
                        alt="Question attachment" 
                        className="img-fluid"
                        style={{ maxHeight: '300px' }}
                      />
                    </div>
                  )}
                  
                  <div className="mt-3">
                    {question.tags && typeof question.tags === 'string' ? (
                      question.tags.split(',').map((tag, index) => (
                        <Badge
                          as={Link}
                          to={`/tags/${tag.trim()}`}
                          bg="secondary"
                          className="tag-badge text-decoration-none"
                          key={index}
                        >
                          {tag.trim()}
                        </Badge>
                      ))
                    ) : question.tagList && Array.isArray(question.tagList) ? (
                      question.tagList.map((tag, index) => (
                        <Badge
                          as={Link}
                          to={`/tags/${typeof tag === 'string' ? tag : tag.name}`}
                          bg="secondary"
                          className="tag-badge text-decoration-none"
                          key={index}
                        >
                          {typeof tag === 'string' ? tag : tag.name}
                        </Badge>
                      ))
                    ) : question.tags && Array.isArray(question.tags) ? (
                      question.tags.map((tag, index) => (
                        <Badge
                          as={Link}
                          to={`/tags/${typeof tag === 'string' ? tag : tag.name}`}
                          bg="secondary"
                          className="tag-badge text-decoration-none"
                          key={index}
                        >
                          {typeof tag === 'string' ? tag : tag.name}
                        </Badge>
                      ))
                    ) : null}
                  </div>
                  
                  <div className="d-flex justify-content-between align-items-center mt-4">
                    <div>
                      {isAuthenticated && currentUser.id === (question.authorId || question.author?.id) && (
                        <Button 
                          as={Link} 
                          to={`/questions/edit/${question.questionId || question.id}`}
                          variant="outline-secondary"
                          size="sm"
                          className="me-2"
                        >
                          Edit Question
                        </Button>
                      )}
                    </div>
                    
                    <div className="user-info">
                      <span className="text-muted me-2">
                        asked {question.createdAt ? new Date(question.createdAt).toLocaleDateString() : "unknown date"}
                      </span>
                      <Link to={`/users/${question.authorId}`} className="text-decoration-none">
                        {question.authorName || question.authorUsername || 'User'}
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
          
          <h4 className="mb-3">
            {answers.length} {answers.length === 1 ? 'Answer' : 'Answers'}
          </h4>
          
          {answers.map(answer => (
            <AnswerItem 
              key={answer.id} 
              answer={answer} 
              isAccepted={question.acceptedAnswerId === answer.id}
              onAccept={handleAcceptAnswer}
              questionAuthorId={question.authorId}
              questionHasAcceptedAnswer={!!question.acceptedAnswerId}
            />
          ))}
          
          <div className="mt-5">
            <h4>Your Answer</h4>
            
            {!isAuthenticated ? (
              <Card className="mb-4">
                <Card.Body className="text-center">
                  <p>You must be logged in to answer questions.</p>
                  <Button as={Link} to="/login" variant="primary">Log in</Button>
                  <span className="mx-2">or</span>
                  <Button as={Link} to="/register" variant="outline-primary">Sign up</Button>
                </Card.Body>
              </Card>
            ) : (
              <Form onSubmit={handleSubmitAnswer}>
                {answerError && <Alert variant="danger">{answerError}</Alert>}
                
                <Form.Group className="mb-3" controlId="answerText">
                  <Form.Label>Answer Text</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={6}
                    value={answerText}
                    onChange={(e) => setAnswerText(e.target.value)}
                    placeholder="Write your answer here..."
                    disabled={submitting}
                  />
                </Form.Group>
                
                <Form.Group className="mb-3" controlId="answerCode">
                  <Form.Label>Code (Optional)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    value={answerCode}
                    onChange={(e) => setAnswerCode(e.target.value)}
                    placeholder="Add code if relevant to your answer..."
                    disabled={submitting}
                    className="font-monospace"
                  />
                </Form.Group>
                
                <Button variant="primary" type="submit" disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Post Your Answer'}
                </Button>
              </Form>
            )}
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default QuestionDetailPage; 