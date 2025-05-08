import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Badge } from 'react-bootstrap';

const QuestionCard = ({ question }) => {
  console.log("Rendering QuestionCard with data:", question);
  
  // Debug question ID and properties
  const questionId = question.questionId || question.id;
  
  if (!questionId) {
    console.warn("QuestionCard - Missing question ID:", question);
  } else {
    console.log("QuestionCard - Question has valid ID:", questionId, "type:", typeof questionId);
  }
  
  const handleQuestionClick = (e) => {
    const questionId = question.questionId || question.id;
    
    if (!questionId) {
      console.error("Question link clicked but ID is missing!");
      e.preventDefault(); // Prevent navigation if ID is missing
      return;
    }
    console.log("Question link clicked:", questionId, "type:", typeof questionId);
  };
  
  return (
    <Card className="question-card">
      <Card.Body>
        <div className="d-flex">
          <div className="text-center me-3">
            <div>
              <strong>{question.votes || 0}</strong>
              <div className="text-muted small">votes</div>
            </div>
            <div className="mt-2">
              <strong>{question.answersCount || 0}</strong>
              <div className="text-muted small">answers</div>
            </div>
          </div>
          
          <div className="flex-grow-1">
            <Card.Title>
              <Link 
                to={`/questions/${question.questionId || question.id}`} 
                className="text-decoration-none"
                onClick={handleQuestionClick}
              >
                {question.title || "Untitled Question"}
              </Link>
            </Card.Title>
            
            <Card.Text>
              {question.text && question.text.length > 150 
                ? `${question.text.substring(0, 150)}...` 
                : (question.text || "No description provided.")}
            </Card.Text>
            
            <div className="d-flex justify-content-between">
              <div>
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
                ) : null}
              </div>
              
              <div className="user-info">
                <span className="text-muted me-2">
                  asked {question.createdAt ? new Date(question.createdAt).toLocaleDateString() : "unknown date"}
                </span>
                <Link 
                  to={`/users/${question.authorId}`} 
                  className="text-decoration-none"
                  onClick={(e) => console.log("Author link clicked:", question.authorId)}
                >
                  {question.authorName || question.authorUsername || 'User'}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default QuestionCard; 