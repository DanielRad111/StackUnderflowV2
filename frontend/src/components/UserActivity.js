import React from 'react';
import { Card, ListGroup, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const UserActivity = ({ activities, loading }) => {
  if (loading) {
    return (
      <div className="p-3 text-center text-muted">
        Loading activity...
      </div>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <div className="p-3 text-center text-muted">
        No activity to display.
      </div>
    );
  }

  // Helper to format dates in a readable way
  const formatDate = (dateString) => {
    if (!dateString) return "";
    
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      // Today - show hours/minutes ago
      const hours = Math.floor((diffTime / (1000 * 60 * 60)));
      const minutes = Math.floor((diffTime / (1000 * 60)) % 60);
      
      if (hours === 0) {
        return minutes === 0 ? 'just now' : `${minutes} minutes ago`;
      }
      return `${hours} hours ago`;
    } else if (diffDays === 1) {
      return 'yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else if (diffDays < 30) {
      return `${Math.floor(diffDays / 7)} weeks ago`;
    } else {
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  // Group activities by day for better display
  const groupActivitiesByDay = (activities) => {
    const groups = {};
    
    activities.forEach(activity => {
      const date = new Date(activity.date);
      const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
      
      if (!groups[dateStr]) {
        groups[dateStr] = [];
      }
      
      groups[dateStr].push(activity);
    });
    
    // Convert to array and sort by date
    return Object.entries(groups)
      .map(([date, items]) => ({ date, items }))
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  const groupedActivities = groupActivitiesByDay(activities);

  return (
    <Card className="mb-4">
      <Card.Header>
        <h5 className="mb-0">Recent Activity</h5>
      </Card.Header>
      <ListGroup variant="flush">
        {groupedActivities.map((group, groupIndex) => (
          <React.Fragment key={groupIndex}>
            <ListGroup.Item className="bg-light">
              <strong>
                {new Date(group.date).toLocaleDateString('en-US', { 
                  weekday: 'long',
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </strong>
            </ListGroup.Item>
            
            {group.items.map((activity, itemIndex) => (
              <ListGroup.Item key={`${groupIndex}-${itemIndex}`} className="py-3">
                <div className="d-flex">
                  <div className="activity-icon me-3">
                    {activity.type === 'question' ? (
                      <i className="bi bi-question-circle-fill text-primary fs-4"></i>
                    ) : activity.type === 'answer' ? (
                      <i className="bi bi-chat-left-text-fill text-success fs-4"></i>
                    ) : (
                      <i className="bi bi-person-fill text-secondary fs-4"></i>
                    )}
                  </div>
                  
                  <div className="flex-grow-1">
                    <div className="d-flex justify-content-between">
                      <div>
                        <Badge bg={activity.type === 'question' ? 'primary' : 'success'} className="me-2">
                          {activity.type === 'question' ? 'Asked' : 'Answered'}
                        </Badge>
                        {activity.accepted && (
                          <Badge bg="warning" text="dark" className="me-2">
                            Accepted
                          </Badge>
                        )}
                      </div>
                      <small className="text-muted">{formatDate(activity.date)}</small>
                    </div>
                    
                    <h6 className="mt-2 mb-1">
                      <Link to={activity.link}>
                        {activity.type === 'question' 
                          ? activity.title 
                          : `Re: ${activity.questionTitle}`}
                      </Link>
                    </h6>
                    
                    <div className="d-flex mt-2 text-muted small">
                      <div className="me-3">
                        <i className="bi bi-arrow-up-circle me-1"></i>
                        {activity.votes} votes
                      </div>
                    </div>
                  </div>
                </div>
              </ListGroup.Item>
            ))}
          </React.Fragment>
        ))}
      </ListGroup>
    </Card>
  );
};

export default UserActivity; 