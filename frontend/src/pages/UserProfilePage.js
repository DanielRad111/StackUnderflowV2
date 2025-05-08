import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Row, Col, Card, Nav, Button, Alert, Badge } from 'react-bootstrap';
import { userService, questionService, answerService } from '../services/api';
import { AuthContext } from '../services/AuthContext';
import QuestionCard from '../components/QuestionCard';
import UserStats from '../components/UserStats';
import UserActivity from '../components/UserActivity';
import UserAnswers from '../components/UserAnswers';
import EditProfileForm from '../components/EditProfileForm';

const UserProfilePage = () => {
  const { id } = useParams();
  const { currentUser, isModerator } = useContext(AuthContext);
  
  const [user, setUser] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [activities, setActivities] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);

  // Function to load user data and related information
  const loadUserData = async () => {
    setLoading(true);
    try {
      console.log("Fetching user data for ID:", id);
      const userResponse = await userService.getUserById(id);
      console.log("User data response:", userResponse);
      setUser(userResponse.data);
      
      // Load additional data based on the active tab
      if (activeTab === 'questions' || activeTab === 'stats') {
        console.log("Fetching questions for user ID:", id);
        const questionsResponse = await questionService.getQuestionsByAuthor(id);
        console.log("User questions response:", questionsResponse);
        setQuestions(questionsResponse.data || []);
      }
      
      if (activeTab === 'answers' || activeTab === 'stats') {
        console.log("Fetching answers for user ID:", id);
        const answersResponse = await answerService.getAnswersByAuthor(id);
        console.log("User answers response:", answersResponse);
        setAnswers(answersResponse.data || []);
      }
      
      if (activeTab === 'activity') {
        console.log("Fetching activity for user ID:", id);
        const activityResponse = await userService.getUserActivity(id);
        console.log("User activity response:", activityResponse);
        setActivities(activityResponse.data || []);
      }
      
      if (activeTab === 'stats') {
        console.log("Fetching statistics for user ID:", id);
        const statsResponse = await userService.getUserStatistics(id);
        console.log("User statistics response:", statsResponse);
        setStats(statsResponse.data || null);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error details:', err.response || err);
      setError('Failed to load user profile. Please try again later.');
      console.error('Error fetching user data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserData();
  }, [id, activeTab]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    // Reset editing state when changing tabs
    if (tab !== 'profile') {
      setIsEditing(false);
    }
  };

  const handleEditProfile = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleProfileUpdate = (updatedUser) => {
    setUser(updatedUser);
    setIsEditing(false);
    // Refresh user data to ensure we have the latest
    loadUserData();
  };

  const handleToggleBanUser = async () => {
    if (!user || !isModerator) return;
    
    try {
      await userService.updateUser(user.id, {
        ...user,
        banned: !user.banned
      });
      
      // Refresh user data
      loadUserData();
    } catch (err) {
      console.error('Error toggling user ban status:', err);
      setError('Failed to update user status');
    }
  };

  const handleToggleModeratorStatus = async () => {
    if (!user || !isModerator) return;
    
    try {
      await userService.updateUser(user.id, {
        ...user,
        isModerator: !user.isModerator
      });
      
      // Refresh user data
      loadUserData();
    } catch (err) {
      console.error('Error toggling moderator status:', err);
      setError('Failed to update user status');
    }
  };

  const isOwnProfile = currentUser && currentUser.id === parseInt(id);

  if (loading && !user) {
    return <Container className="py-5 text-center">Loading...</Container>;
  }

  if (error || !user) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error || 'User not found'}</Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Row>
        <Col md={3}>
          <Card className="mb-4">
            <Card.Body className="text-center">
              <div className="mb-3">
                <img
                  src={`https://ui-avatars.com/api/?name=${user.username}&background=random&size=128`}
                  alt={user.username}
                  className="rounded-circle img-thumbnail"
                />
              </div>
              <h4>{user.username}</h4>
              <p className="text-muted">
                Member since {new Date(user.createdAt).toLocaleDateString()}
              </p>
              
              {user.location && (
                <p className="text-muted mb-2">
                  <i className="bi bi-geo-alt me-1"></i> {user.location}
                </p>
              )}
              
              {user.website && (
                <p className="mb-2">
                  <a href={user.website} target="_blank" rel="noopener noreferrer" className="text-decoration-none">
                    <i className="bi bi-link-45deg me-1"></i> Website
                  </a>
                </p>
              )}
              
              <div className="social-links mb-3">
                {user.github && (
                  <a 
                    href={`https://github.com/${user.github}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="me-2 text-dark"
                  >
                    <i className="bi bi-github fs-4"></i>
                  </a>
                )}
                
                {user.linkedin && (
                  <a 
                    href={`https://linkedin.com/in/${user.linkedin}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="me-2 text-primary"
                  >
                    <i className="bi bi-linkedin fs-4"></i>
                  </a>
                )}
                
                {user.twitter && (
                  <a 
                    href={`https://twitter.com/${user.twitter}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-info"
                  >
                    <i className="bi bi-twitter fs-4"></i>
                  </a>
                )}
              </div>
              
              <div className="mt-3">
                <div className="d-flex justify-content-center">
                  <div className="text-center mx-2">
                    <h5>{questions.length}</h5>
                    <div className="text-muted small">Questions</div>
                  </div>
                  <div className="text-center mx-2">
                    <h5>{answers.length}</h5>
                    <div className="text-muted small">Answers</div>
                  </div>
                  <div className="text-center mx-2">
                    <h5>{user.reputation || 0}</h5>
                    <div className="text-muted small">Reputation</div>
                  </div>
                </div>
              </div>
              
              {user.isModerator && (
                <div className="mt-3">
                  <Badge bg="primary" className="px-2 py-1">Moderator</Badge>
                </div>
              )}
              
              {user.banned && (
                <div className="mt-2">
                  <Badge bg="danger" className="px-2 py-1">Banned</Badge>
                </div>
              )}
            </Card.Body>
          </Card>
          
          {isOwnProfile && !isEditing && activeTab === 'profile' && (
            <Button 
              variant="outline-primary" 
              className="w-100 mb-4"
              onClick={handleEditProfile}
            >
              <i className="bi bi-pencil me-2"></i>
              Edit Profile
            </Button>
          )}
          
          {isModerator && !isOwnProfile && (
            <Card className="mb-4">
              <Card.Header>Moderator Actions</Card.Header>
              <Card.Body>
                <Button 
                  variant={user.banned ? "outline-success" : "outline-danger"} 
                  className="w-100 mb-2"
                  onClick={handleToggleBanUser}
                >
                  {user.banned ? (
                    <>
                      <i className="bi bi-unlock me-2"></i>
                      Unban User
                    </>
                  ) : (
                    <>
                      <i className="bi bi-lock me-2"></i>
                      Ban User
                    </>
                  )}
                </Button>
                
                <Button 
                  variant="outline-primary" 
                  className="w-100"
                  onClick={handleToggleModeratorStatus}
                >
                  {user.isModerator ? (
                    <>
                      <i className="bi bi-shield-minus me-2"></i>
                      Remove Moderator
                    </>
                  ) : (
                    <>
                      <i className="bi bi-shield-plus me-2"></i>
                      Make Moderator
                    </>
                  )}
                </Button>
              </Card.Body>
            </Card>
          )}
        </Col>
        
        <Col md={9}>
          {!isEditing ? (
            <Card className="mb-4">
              <Card.Header>
                <Nav variant="tabs" className="nav-tabs-lightly">
                  <Nav.Item>
                    <Nav.Link 
                      active={activeTab === 'profile'}
                      onClick={() => handleTabChange('profile')}
                      className="cursor-pointer"
                    >
                      Profile
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link 
                      active={activeTab === 'stats'}
                      onClick={() => handleTabChange('stats')}
                      className="cursor-pointer"
                    >
                      Stats
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link 
                      active={activeTab === 'activity'}
                      onClick={() => handleTabChange('activity')}
                      className="cursor-pointer"
                    >
                      Activity
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link 
                      active={activeTab === 'questions'}
                      onClick={() => handleTabChange('questions')}
                      className="cursor-pointer"
                    >
                      Questions
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link 
                      active={activeTab === 'answers'}
                      onClick={() => handleTabChange('answers')}
                      className="cursor-pointer"
                    >
                      Answers
                    </Nav.Link>
                  </Nav.Item>
                </Nav>
              </Card.Header>
              
              <Card.Body>
                {activeTab === 'profile' && (
                  <div>
                    <h5>Profile Information</h5>
                    
                    {user.bio && (
                      <div className="mb-4">
                        <h6 className="text-muted mb-2">About</h6>
                        <p>{user.bio}</p>
                      </div>
                    )}
                    
                    <Row className="mb-3">
                      <Col md={3} className="fw-bold">Username:</Col>
                      <Col md={9}>{user.username}</Col>
                    </Row>
                    <Row className="mb-3">
                      <Col md={3} className="fw-bold">Email:</Col>
                      <Col md={9}>{user.email}</Col>
                    </Row>
                    {user.phoneNumber && (
                      <Row className="mb-3">
                        <Col md={3} className="fw-bold">Phone:</Col>
                        <Col md={9}>{user.phoneNumber}</Col>
                      </Row>
                    )}
                    <Row className="mb-3">
                      <Col md={3} className="fw-bold">Reputation:</Col>
                      <Col md={9}>{user.reputation || 0}</Col>
                    </Row>
                    <Row className="mb-3">
                      <Col md={3} className="fw-bold">Member Since:</Col>
                      <Col md={9}>
                        {new Date(user.createdAt).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </Col>
                    </Row>
                  </div>
                )}
                
                {activeTab === 'stats' && (
                  <UserStats stats={stats} loading={loading} />
                )}
                
                {activeTab === 'activity' && (
                  <UserActivity activities={activities} loading={loading} />
                )}
                
                {activeTab === 'questions' && (
                  <div>
                    <h5>{questions.length} Questions</h5>
                    {questions.length === 0 ? (
                      <p className="text-center py-3">This user hasn't asked any questions yet.</p>
                    ) : (
                      <div>
                        {questions.map(question => (
                          <QuestionCard key={question.id} question={question} />
                        ))}
                      </div>
                    )}
                  </div>
                )}
                
                {activeTab === 'answers' && (
                  <UserAnswers answers={answers} loading={loading} />
                )}
              </Card.Body>
            </Card>
          ) : (
            <EditProfileForm 
              user={user} 
              onUpdate={handleProfileUpdate} 
              onCancel={handleCancelEdit} 
            />
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default UserProfilePage; 