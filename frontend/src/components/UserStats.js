import React from 'react';
import { Card, Row, Col, ProgressBar, Badge } from 'react-bootstrap';

const UserStats = ({ stats, loading }) => {
  // If we're still loading data or stats not available
  if (loading || !stats) {
    return (
      <div className="p-3 text-center text-muted">
        {loading ? 'Loading statistics...' : 'No statistics available.'}
      </div>
    );
  }

  // Calculate the user's level based on reputation
  const calculateLevel = (reputation) => {
    if (reputation < 10) return { level: 1, title: 'Newcomer' };
    if (reputation < 50) return { level: 2, title: 'Beginner' };
    if (reputation < 200) return { level: 3, title: 'Regular' };
    if (reputation < 500) return { level: 4, title: 'Established' };
    if (reputation < 1000) return { level: 5, title: 'Trusted' };
    return { level: 6, title: 'Expert' };
  };

  // Calculate progress to next level
  const calculateProgress = (reputation) => {
    if (reputation < 10) return { current: reputation, max: 10, progress: (reputation / 10) * 100 };
    if (reputation < 50) return { current: reputation - 10, max: 40, progress: ((reputation - 10) / 40) * 100 };
    if (reputation < 200) return { current: reputation - 50, max: 150, progress: ((reputation - 50) / 150) * 100 };
    if (reputation < 500) return { current: reputation - 200, max: 300, progress: ((reputation - 200) / 300) * 100 };
    if (reputation < 1000) return { current: reputation - 500, max: 500, progress: ((reputation - 500) / 500) * 100 };
    return { current: reputation, max: reputation, progress: 100 };
  };

  const level = calculateLevel(stats.reputation);
  const progress = calculateProgress(stats.reputation);

  // Format date to be more readable
  const formatDate = (dateString) => {
    if (!dateString) return "Unknown";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  // Calculate member for duration
  const getMemberDuration = (dateString) => {
    if (!dateString) return "Unknown";
    const joinDate = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - joinDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) return `${diffDays} days`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months`;
    return `${Math.floor(diffDays / 365)} years`;
  };

  return (
    <div className="user-stats">
      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">Reputation & Stats</h5>
        </Card.Header>
        <Card.Body>
          <Row className="mb-3">
            <Col md={6}>
              <div className="p-3 bg-light rounded">
                <h6>Level {level.level}: {level.title}</h6>
                <ProgressBar 
                  now={progress.progress} 
                  label={`${stats.reputation} rep`}
                  variant="primary" 
                  className="mb-2"
                />
                <small className="text-muted">
                  {progress.current} / {progress.max} to next level
                </small>
              </div>
            </Col>
            <Col md={6}>
              <div className="d-flex h-100 align-items-center justify-content-around">
                <div className="text-center">
                  <h3>{stats.questionsCount}</h3>
                  <div>Questions</div>
                </div>
                <div className="text-center">
                  <h3>{stats.answersCount}</h3>
                  <div>Answers</div>
                </div>
                <div className="text-center">
                  <h3>{stats.acceptedAnswersCount}</h3>
                  <div>Accepted</div>
                </div>
              </div>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <div className="mb-3">
                <strong>Total Votes:</strong> {stats.totalVotes}
              </div>
              <div className="mb-3">
                <strong>Member Since:</strong> {formatDate(stats.joinDate)}
              </div>
              <div>
                <strong>Member For:</strong> {getMemberDuration(stats.joinDate)}
              </div>
            </Col>
            <Col md={6}>
              <div className="mb-2">
                <strong>Badges:</strong>
              </div>
              {stats.badges && stats.badges.length > 0 ? (
                <div>
                  {stats.badges.map((badge, index) => (
                    <Badge 
                      key={index} 
                      bg={badge.type === 'gold' ? 'warning' : badge.type === 'silver' ? 'secondary' : 'info'}
                      className="me-1 mb-1"
                    >
                      {badge.name}
                    </Badge>
                  ))}
                </div>
              ) : (
                <div className="text-muted">No badges yet</div>
              )}
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </div>
  );
};

export default UserStats; 