import React, { useState, useContext } from 'react';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { questionService } from '../services/api';
import { AuthContext } from '../services/AuthContext';

const AskQuestionPage = () => {
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [tags, setTags] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const validateForm = () => {
    if (!title.trim()) {
      setError('Please provide a title for your question');
      return false;
    }
    
    if (!text.trim()) {
      setError('Please provide details for your question');
      return false;
    }
    
    if (title.length < 15) {
      setError('Title should be at least 15 characters long');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Make sure currentUser exists and has an ID
      if (!currentUser || !currentUser.id) {
        setError('User session is invalid. Please log in again.');
        setLoading(false);
        return;
      }
      
      const response = await questionService.createQuestion(
        currentUser.id,
        title,
        text,
        imageUrl || "",  // Provide empty string as default
        tags || ""       // Provide empty string as default
      );
      
      if (response && response.data && response.data.id) {
        // Use replace: true to prevent navigation issues if the user presses back
        navigate(`/questions/${response.data.id}`, { replace: true });
      } else {
        // Handle case where response exists but doesn't have expected data
        setError('Question was created but failed to get question details. Please check your questions list.');
        setLoading(false);
        setTimeout(() => navigate('/'), 2000); // Redirect to home after 2 seconds
      }
    } catch (err) {
      console.error('Error posting question:', err);
      
      // Extract more specific error message if available
      let errorMessage = 'Failed to post your question. Please try again.';
      
      if (err.response && err.response.data) {
        if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        } else if (err.response.data.error) {
          errorMessage = err.response.data.error;
        } else if (err.response.data.message) {
          errorMessage = err.response.data.message;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <Container className="py-4">
      <h1 className="mb-4">Ask a Question</h1>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3" controlId="questionTitle">
          <Form.Label>Title</Form.Label>
          <Form.Control
            type="text"
            placeholder="e.g. How to implement authentication in a React application?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={loading}
          />
          <Form.Text className="text-muted">
            Be specific and imagine you're asking a question to another person.
          </Form.Text>
        </Form.Group>

        <Form.Group className="mb-3" controlId="questionText">
          <Form.Label>Body</Form.Label>
          <Form.Control
            as="textarea"
            rows={10}
            placeholder="Include all the information someone would need to answer your question"
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={loading}
          />
          <Form.Text className="text-muted">
            Include all the details someone would need to answer your question.
          </Form.Text>
        </Form.Group>

        <Form.Group className="mb-3" controlId="questionTags">
          <Form.Label>Tags</Form.Label>
          <Form.Control
            type="text"
            placeholder="e.g. java,spring,hibernate"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            disabled={loading}
          />
          <Form.Text className="text-muted">
            Add up to 5 tags to describe what your question is about. Separate tags with commas.
          </Form.Text>
        </Form.Group>

        <Form.Group className="mb-3" controlId="questionImage">
          <Form.Label>Image URL (Optional)</Form.Label>
          <Form.Control
            type="url"
            placeholder="e.g. https://example.com/image.png"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            disabled={loading}
          />
          <Form.Text className="text-muted">
            Add an image URL if it helps illustrate your question.
          </Form.Text>
        </Form.Group>

        <Button variant="primary" type="submit" disabled={loading}>
          {loading ? 'Posting...' : 'Post Your Question'}
        </Button>
      </Form>
    </Container>
  );
};

export default AskQuestionPage; 