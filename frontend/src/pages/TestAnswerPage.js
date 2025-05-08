import React, { useState, useEffect, useContext } from 'react';
import { Container, Form, Button, Alert, Card, Badge } from 'react-bootstrap';
import { answerService, questionService, userService } from '../services/api';
import { AuthContext } from '../services/AuthContext';

const TestAnswerPage = () => {
  const { currentUser, isAuthenticated } = useContext(AuthContext);
  const [questionId, setQuestionId] = useState('');
  const [userId, setUserId] = useState('');
  const [text, setText] = useState('Test answer');
  const [image, setImage] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [questionDetails, setQuestionDetails] = useState(null);
  const [apiErrors, setApiErrors] = useState({});
  const [debugResult, setDebugResult] = useState(null);

  // Auto-fill user ID if logged in
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      const id = currentUser.id || currentUser.userId;
      if (id) {
        setUserId(String(id));
        console.log("Set user ID from current user:", id);
      }
    }
  }, [currentUser, isAuthenticated]);

  const validateQuestionId = async () => {
    if (!questionId) return false;
    
    try {
      setApiErrors(prev => ({ ...prev, questionId: null }));
      const response = await questionService.getQuestionById(questionId);
      setQuestionDetails(response.data);
      console.log("Question details:", response.data);
      return true;
    } catch (err) {
      setApiErrors(prev => ({ 
        ...prev, 
        questionId: `Error: ${err.message}. Question ID ${questionId} not found.` 
      }));
      setQuestionDetails(null);
      return false;
    }
  };

  const validateUserId = async () => {
    if (!userId) return false;
    
    try {
      setApiErrors(prev => ({ ...prev, userId: null }));
      const response = await userService.getUserById(userId);
      setUserDetails(response.data);
      console.log("User details:", response.data);
      return true;
    } catch (err) {
      setApiErrors(prev => ({ 
        ...prev, 
        userId: `Error: ${err.message}. User ID ${userId} not found.` 
      }));
      setUserDetails(null);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    setApiErrors({});

    // Validate both IDs first
    const isQuestionValid = await validateQuestionId();
    const isUserValid = await validateUserId();

    if (!isQuestionValid || !isUserValid) {
      setLoading(false);
      return;
    }

    try {
      // Try direct API call to isolate the issue
      const payload = {
        id: questionId,
        authorId: userId,
        text: text,
        image: image || ""
      };

      console.log("API Request payload:", payload);
      console.log("Testing IDs:", {
        questionId: { 
          value: questionId, 
          type: typeof questionId, 
          asNumber: Number(questionId),
          isNaN: isNaN(Number(questionId))
        },
        userId: { 
          value: userId, 
          type: typeof userId, 
          asNumber: Number(userId),
          isNaN: isNaN(Number(userId))
        }
      });

      const response = await fetch('http://localhost:8080/answers/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        let errorText = await response.text();
        try {
          // Try to parse JSON error response
          const errorJson = JSON.parse(errorText);
          errorText = JSON.stringify(errorJson, null, 2);
        } catch (e) {
          // If not JSON, keep as text
        }
        throw new Error(`Server responded with ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      setResult(data);
      console.log('Success:', data);
    } catch (err) {
      setError(err.message);
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleServiceCall = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    setApiErrors({});

    // Validate both IDs first
    const isQuestionValid = await validateQuestionId();
    const isUserValid = await validateUserId();

    if (!isQuestionValid || !isUserValid) {
      setLoading(false);
      return;
    }

    try {
      console.log("Test answer with service params:", {
        userId,
        questionId,
        text,
        image
      });
      
      // Test using the service
      const response = await answerService.createAnswer(userId, questionId, text, image);
      setResult(response.data);
      console.log('Success:', response.data);
    } catch (err) {
      setError(err.message);
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDebug = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    setDebugResult(null);
    
    try {
      const payload = {
        id: questionId,
        authorId: userId,
        text: text,
        image: image || ""
      };
      
      console.log("Debug request payload:", payload);
      
      const response = await fetch('http://localhost:8080/answers/debug', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      setDebugResult(data);
      console.log('Debug response:', data);
      
      // Set errors based on debug results
      const newApiErrors = {};
      if (data.idError) {
        newApiErrors.questionId = data.idError;
      }
      if (data.authorIdError) {
        newApiErrors.userId = data.authorIdError;
      }
      if (data.textError) {
        newApiErrors.text = data.textError;
      }
      
      setApiErrors(newApiErrors);
    } catch (err) {
      setError(`Debug failed: ${err.message}`);
      console.error('Error debugging:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <h1>Test Answer Creation</h1>
      
      <Alert variant="info">
        This page helps diagnose issues with creating answers.
      </Alert>
      
      {error && <Alert variant="danger">{error}</Alert>}
      {result && <Alert variant="success">Answer created successfully!</Alert>}
      
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Question ID</Form.Label>
          <Form.Control 
            type="text" 
            value={questionId} 
            onChange={(e) => setQuestionId(e.target.value)}
            placeholder="Enter question ID" 
            isInvalid={!!apiErrors.questionId}
            required
          />
          {apiErrors.questionId && (
            <Form.Control.Feedback type="invalid">
              {apiErrors.questionId}
            </Form.Control.Feedback>
          )}
          {questionDetails && (
            <Alert variant="success" className="mt-2">
              Question found: {questionDetails.title}
            </Alert>
          )}
          <Button 
            variant="outline-secondary" 
            size="sm" 
            className="mt-2"
            onClick={validateQuestionId}
          >
            Validate Question
          </Button>
        </Form.Group>
        
        <Form.Group className="mb-3">
          <Form.Label>User ID</Form.Label>
          <Form.Control 
            type="text" 
            value={userId} 
            onChange={(e) => setUserId(e.target.value)}
            placeholder="Enter user ID" 
            isInvalid={!!apiErrors.userId}
            required
          />
          {apiErrors.userId && (
            <Form.Control.Feedback type="invalid">
              {apiErrors.userId}
            </Form.Control.Feedback>
          )}
          {userDetails && (
            <Alert variant="success" className="mt-2">
              User found: {userDetails.username}
            </Alert>
          )}
          <Button 
            variant="outline-secondary" 
            size="sm" 
            className="mt-2"
            onClick={validateUserId}
          >
            Validate User
          </Button>
        </Form.Group>
        
        <Form.Group className="mb-3">
          <Form.Label>Answer Text</Form.Label>
          <Form.Control 
            as="textarea" 
            rows={3} 
            value={text} 
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter answer text" 
            isInvalid={!!apiErrors.text}
            required
          />
          {apiErrors.text && (
            <Form.Control.Feedback type="invalid">
              {apiErrors.text}
            </Form.Control.Feedback>
          )}
        </Form.Group>
        
        <Form.Group className="mb-3">
          <Form.Label>Image (Optional)</Form.Label>
          <Form.Control 
            type="text" 
            value={image} 
            onChange={(e) => setImage(e.target.value)}
            placeholder="Enter image URL" 
          />
        </Form.Group>
        
        <div className="d-flex">
          <Button 
            variant="primary" 
            type="submit" 
            disabled={loading}
            className="me-2"
          >
            {loading ? 'Submitting...' : 'Test with Fetch'}
          </Button>
          
          <Button 
            variant="secondary" 
            onClick={handleServiceCall} 
            disabled={loading}
            className="me-2"
          >
            {loading ? 'Submitting...' : 'Test with Service'}
          </Button>
          
          <Button 
            variant="info" 
            onClick={handleDebug} 
            disabled={loading}
          >
            {loading ? 'Debugging...' : 'Debug Parameters'}
          </Button>
        </div>
      </Form>
      
      {result && (
        <div className="mt-4">
          <h3>Response:</h3>
          <pre className="border p-3 bg-light">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}

      <div className="mt-5">
        <h3>Current User</h3>
        <Card className="mb-4">
          <Card.Body>
            {isAuthenticated ? (
              <div>
                <p><strong>User ID:</strong> {currentUser?.id || currentUser?.userId}</p>
                <p><strong>Username:</strong> {currentUser?.username}</p>
                <pre className="border p-2 bg-light">{JSON.stringify(currentUser, null, 2)}</pre>
              </div>
            ) : (
              <p>Not authenticated</p>
            )}
          </Card.Body>
        </Card>
      </div>

      {debugResult && (
        <div className="mt-4">
          <h3>Debug Results:</h3>
          <Alert variant={debugResult.wouldSucceed ? "success" : "danger"}>
            {debugResult.wouldSucceed 
              ? "Parameters are valid, answer creation should succeed" 
              : "Parameters are invalid, answer creation would fail"}
          </Alert>
          <pre className="border p-3 bg-light">{JSON.stringify(debugResult, null, 2)}</pre>
        </div>
      )}
    </Container>
  );
};

export default TestAnswerPage; 