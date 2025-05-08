import React, { useState } from 'react';
import { Form, Button, Alert, Row, Col, Card } from 'react-bootstrap';
import { userService } from '../services/api';

const EditProfileForm = ({ user, onUpdate, onCancel }) => {
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    bio: user?.bio || '',
    location: user?.location || '',
    website: user?.website || '',
    github: user?.github || '',
    linkedin: user?.linkedin || '',
    twitter: user?.twitter || ''
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  // Password change state
  const [changePassword, setChangePassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear field-specific error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
    
    // Clear field-specific error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validate username
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }
    
    // Validate email
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    // Validate password fields if changing password
    if (changePassword) {
      if (!passwordData.currentPassword) {
        newErrors.currentPassword = 'Current password is required';
      }
      
      if (!passwordData.newPassword) {
        newErrors.newPassword = 'New password is required';
      } else if (passwordData.newPassword.length < 6) {
        newErrors.newPassword = 'Password must be at least 6 characters';
      }
      
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess(false);
    
    try {
      // Update profile information
      await userService.updateUserProfile(user.id, formData);
      
      // Change password if requested
      if (changePassword) {
        await userService.changePassword(
          user.id, 
          passwordData.currentPassword, 
          passwordData.newPassword
        );
      }
      
      setSuccess(true);
      
      // Clear password fields
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setChangePassword(false);
      
      // Notify parent component
      if (onUpdate) {
        onUpdate({ ...user, ...formData });
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.response?.data?.message || err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="edit-profile-form">
      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">Edit Profile</h5>
        </Card.Header>
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">Profile updated successfully!</Alert>}
          
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="username">
                  <Form.Label>Username</Form.Label>
                  <Form.Control
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    isInvalid={!!errors.username}
                    disabled={loading}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.username}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group className="mb-3" controlId="email">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    isInvalid={!!errors.email}
                    disabled={loading}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.email}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3" controlId="phoneNumber">
              <Form.Label>Phone Number (Optional)</Form.Label>
              <Form.Control
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                disabled={loading}
              />
            </Form.Group>
            
            <Form.Group className="mb-3" controlId="bio">
              <Form.Label>Bio (Optional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                disabled={loading}
                placeholder="Tell us about yourself"
              />
            </Form.Group>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="location">
                  <Form.Label>Location (Optional)</Form.Label>
                  <Form.Control
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    disabled={loading}
                    placeholder="City, Country"
                  />
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group className="mb-3" controlId="website">
                  <Form.Label>Website (Optional)</Form.Label>
                  <Form.Control
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    disabled={loading}
                    placeholder="https://example.com"
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <h6 className="mt-4 mb-3">Social Links (Optional)</h6>
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3" controlId="github">
                  <Form.Label>GitHub</Form.Label>
                  <Form.Control
                    type="text"
                    name="github"
                    value={formData.github}
                    onChange={handleInputChange}
                    disabled={loading}
                    placeholder="username"
                  />
                </Form.Group>
              </Col>
              
              <Col md={4}>
                <Form.Group className="mb-3" controlId="linkedin">
                  <Form.Label>LinkedIn</Form.Label>
                  <Form.Control
                    type="text"
                    name="linkedin"
                    value={formData.linkedin}
                    onChange={handleInputChange}
                    disabled={loading}
                    placeholder="username"
                  />
                </Form.Group>
              </Col>
              
              <Col md={4}>
                <Form.Group className="mb-3" controlId="twitter">
                  <Form.Label>Twitter</Form.Label>
                  <Form.Control
                    type="text"
                    name="twitter"
                    value={formData.twitter}
                    onChange={handleInputChange}
                    disabled={loading}
                    placeholder="username"
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mt-4 mb-3">
              <Form.Check
                type="checkbox"
                id="changePassword"
                label="Change password"
                checked={changePassword}
                onChange={() => setChangePassword(!changePassword)}
                disabled={loading}
              />
            </Form.Group>
            
            {changePassword && (
              <div className="password-change-section p-3 bg-light rounded mb-4">
                <h6 className="mb-3">Change Password</h6>
                <Form.Group className="mb-3" controlId="currentPassword">
                  <Form.Label>Current Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    isInvalid={!!errors.currentPassword}
                    disabled={loading}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.currentPassword}
                  </Form.Control.Feedback>
                </Form.Group>
                
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="newPassword">
                      <Form.Label>New Password</Form.Label>
                      <Form.Control
                        type="password"
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        isInvalid={!!errors.newPassword}
                        disabled={loading}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.newPassword}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="confirmPassword">
                      <Form.Label>Confirm New Password</Form.Label>
                      <Form.Control
                        type="password"
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        isInvalid={!!errors.confirmPassword}
                        disabled={loading}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.confirmPassword}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>
              </div>
            )}
            
            <div className="d-flex mt-4">
              <Button 
                variant="secondary" 
                onClick={onCancel} 
                className="me-2"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="primary"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default EditProfileForm; 