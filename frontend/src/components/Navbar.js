import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar as BsNavbar, Nav, Container, Button, Form, InputGroup, Badge } from 'react-bootstrap';
import { AuthContext } from '../services/AuthContext';

const Navbar = () => {
  const { isAuthenticated, currentUser, logout } = useContext(AuthContext);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Get first letter of username for avatar
  const getInitial = (username) => {
    return username && username.length > 0 ? username.charAt(0).toUpperCase() : 'U';
  };

  return (
    <BsNavbar bg="primary" variant="dark" expand="lg" sticky="top" className="py-2">
      <Container>
        <BsNavbar.Brand as={Link} to="/" className="d-flex align-items-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-stack me-2" viewBox="0 0 16 16">
            <path d="m14.12 10.163 1.715.858c.22.11.22.424 0 .534L8.267 15.34a.598.598 0 0 1-.534 0L.165 11.555a.299.299 0 0 1 0-.534l1.716-.858 5.317 2.659c.505.252 1.1.252 1.604 0l5.317-2.66zM7.733.063a.598.598 0 0 1 .534 0l7.568 3.784a.3.3 0 0 1 0 .535L8.267 8.165a.598.598 0 0 1-.534 0L.165 4.382a.299.299 0 0 1 0-.535L7.733.063z"/>
            <path d="m14.12 6.576 1.715.858c.22.11.22.424 0 .534l-7.568 3.784a.598.598 0 0 1-.534 0L.165 7.968a.299.299 0 0 1 0-.534l1.716-.858 5.317 2.659c.505.252 1.1.252 1.604 0l5.317-2.659z"/>
          </svg>
          <span className="fw-bold">StackUnderflow</span>
        </BsNavbar.Brand>
        
        <BsNavbar.Toggle aria-controls="navbar-nav" />
        <BsNavbar.Collapse id="navbar-nav">
          <Form className="d-flex mx-auto" style={{ width: '40%' }} onSubmit={handleSearch}>
            <InputGroup>
              <Form.Control
                type="search"
                placeholder="Search questions, users..."
                className="border-0 shadow-none"
                aria-label="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button variant="light" type="submit" className="d-flex align-items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-search" viewBox="0 0 16 16">
                  <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
                </svg>
              </Button>
            </InputGroup>
          </Form>
          
          <Nav className="ms-auto">
            <Nav.Link as={Link} to="/" className="me-1">Home</Nav.Link>
            <Nav.Link as={Link} to="/tags" className="me-1">Tags</Nav.Link>
            
            {isAuthenticated ? (
              <>
                <Nav.Link as={Link} to="/ask" className="me-1">
                  <Button variant="light" size="sm" className="py-1 px-2">
                    Ask Question
                  </Button>
                </Nav.Link>
                
                <div className="d-flex align-items-center ms-1">
                  <Link to={`/users/${currentUser.id}`} className="d-flex align-items-center text-decoration-none">
                    <div className="user-avatar me-2">
                      {getInitial(currentUser.username)}
                    </div>
                    <span className="d-none d-sm-inline text-white me-2">
                      {currentUser.username}
                    </span>
                    {currentUser.score > 0 && (
                      <Badge bg="light" text="dark" className="me-2">
                        {currentUser.score} pts
                      </Badge>
                    )}
                  </Link>
                  <Button 
                    variant="outline-light" 
                    size="sm"
                    onClick={handleLogout}
                    className="ms-2"
                  >
                    Logout
                  </Button>
                </div>
              </>
            ) : (
              <div className="d-flex gap-2 ms-2">
                <Button as={Link} to="/login" variant="outline-light" size="sm">
                  Log in
                </Button>
                <Button as={Link} to="/register" variant="light" size="sm">
                  Sign up
                </Button>
              </div>
            )}
          </Nav>
        </BsNavbar.Collapse>
      </Container>
    </BsNavbar>
  );
};

export default Navbar; 