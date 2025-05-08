import React, { useContext } from 'react';
import { Card, Button, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { AuthContext } from '../services/AuthContext';
import { voteService } from '../services/api';

const AnswerItem = ({ answer, isAccepted, onAccept, questionAuthorId, questionHasAcceptedAnswer }) => {
  const { currentUser, isAuthenticated } = useContext(AuthContext);

  const handleVote = async (voteType) => {
    if (!isAuthenticated) return;
    
    try {
      await voteService.voteAnswer(currentUser.id, answer.id, voteType);
      // Force a refresh to show updated vote count
      window.location.reload();
    } catch (error) {
      // Handle error silently
    }
  };

  // User can accept an answer if:
  // 1. They are authenticated
  // 2. They are the question author
  // 3. The question does not already have an accepted answer
  const canAccept = isAuthenticated && currentUser?.id === questionAuthorId && !questionHasAcceptedAnswer;

  // Defensive check - if answer is undefined, return nothing
  if (!answer) {
    return null;
  }
  
  // Calculate vote total
  const voteTotal = (answer.upvotes || 0) - (answer.downvotes || 0);
  
  // Format date for better display
  const formatDate = (dateString) => {
    if (!dateString) return "unknown date";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  // Get first letter of username for avatar
  const getInitial = (username) => {
    return username && username.length > 0 ? username.charAt(0).toUpperCase() : 'U';
  };

  return (
    <Card className={`mb-4 ${isAccepted ? 'accepted-answer' : ''}`}>
      <Card.Body className="position-relative">
        {isAccepted && (
          <Badge 
            bg="success" 
            className="position-absolute top-0 end-0 mt-3 me-3 px-2 py-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-check-circle-fill me-1" viewBox="0 0 16 16">
              <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
            </svg>
            Accepted Answer
          </Badge>
        )}
        
        <div className="d-flex">
          <div className="vote-buttons">
            <Button 
              variant="outline-secondary" 
              size="sm"
              onClick={() => handleVote('UP')}
              disabled={!isAuthenticated}
              aria-label="Upvote"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-caret-up-fill" viewBox="0 0 16 16">
                <path d="m7.247 4.86-4.796 5.481c-.566.647-.106 1.659.753 1.659h9.592a1 1 0 0 0 .753-1.659l-4.796-5.48a1 1 0 0 0-1.506 0z"/>
              </svg>
            </Button>
            <div className="vote-count">{voteTotal}</div>
            <Button 
              variant="outline-secondary" 
              size="sm"
              onClick={() => handleVote('DOWN')}
              disabled={!isAuthenticated}
              aria-label="Downvote"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-caret-down-fill" viewBox="0 0 16 16">
                <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"/>
              </svg>
            </Button>
          </div>
          
          <div className="flex-grow-1">
            <div className="answer-text mb-3">
              {answer.text}
            </div>
            
            {/* If image field is actually used for code */}
            {answer.image && (
              <div className="code-block mb-4">
                <pre className="rounded p-3">
                  <code>{answer.image}</code>
                </pre>
              </div>
            )}
            
            <div className="d-flex justify-content-between align-items-center flex-wrap mt-4">
              {canAccept && !isAccepted && (
                <Button 
                  variant="outline-success" 
                  size="sm"
                  onClick={() => onAccept(answer.id)}
                  className="me-2 mb-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-check-circle me-1" viewBox="0 0 16 16">
                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                    <path d="M10.97 4.97a.235.235 0 0 0-.02.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.01-1.05z"/>
                  </svg>
                  Accept Answer
                </Button>
              )}
              
              <div className="user-info ms-auto">
                <div className="d-flex align-items-center">
                  <span className="text-muted">
                    answered {formatDate(answer.createdAt)}
                  </span>
                  <div className="ms-2 d-flex align-items-center">
                    <div className="user-avatar me-2">
                      {getInitial(answer.authorUsername)}
                    </div>
                    <Link to={`/users/${answer.authorId}`} className="text-decoration-none fw-medium">
                      {answer.authorUsername || 'User'}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default AnswerItem; 