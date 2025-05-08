import React from 'react';
import { Card, ListGroup, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const UserAnswers = ({ answers, loading }) => {
  if (loading) {
    return (
      <div className="p-3 text-center text-muted">
        Loading answers...
      </div>
    );
  }

  if (!answers || answers.length === 0) {
    return (
      <div className="p-3 text-center text-muted">
        No answers to display.
      </div>
    );
  }
  
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

  // Sort answers by date, most recent first
  const sortedAnswers = [...answers].sort((a, b) => 
    new Date(b.createdAt) - new Date(a.createdAt)
  );

  return (
    <Card className="mb-4">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Answers ({answers.length})</h5>
      </Card.Header>
      <ListGroup variant="flush">
        {sortedAnswers.map((answer) => (
          <ListGroup.Item key={answer.id} className="py-3">
            <div className="d-flex">
              <div className="vote-count text-center me-3">
                <div className="fs-4 fw-bold">{(answer.upvotes || 0) - (answer.downvotes || 0)}</div>
                <div className="text-muted small">votes</div>
              </div>
              
              <div className="flex-grow-1">
                <div className="d-flex justify-content-between mb-2">
                  <h6 className="mb-0">
                    <Link to={`/questions/${answer.questionId}`}>
                      {answer.questionTitle || "Question"}
                    </Link>
                  </h6>
                  <div>
                    {answer.accepted && (
                      <Badge bg="success" className="ms-2">
                        <i className="bi bi-check-circle me-1"></i>
                        Accepted
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="answer-preview">
                  {answer.text && answer.text.length > 200 
                    ? `${answer.text.substring(0, 200)}...` 
                    : answer.text}
                </div>
                
                <div className="d-flex justify-content-between align-items-center mt-2">
                  <div>
                    <Link 
                      to={`/questions/${answer.questionId}`}
                      className="btn btn-sm btn-outline-primary"
                    >
                      View Answer
                    </Link>
                  </div>
                  <div className="text-muted small">
                    answered {formatDate(answer.createdAt)}
                  </div>
                </div>
              </div>
            </div>
          </ListGroup.Item>
        ))}
      </ListGroup>
    </Card>
  );
};

export default UserAnswers; 