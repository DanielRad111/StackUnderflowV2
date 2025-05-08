import React from 'react';
import { Container } from 'react-bootstrap';

const Footer = () => {
  return (
    <footer className="bg-dark text-light py-3 mt-auto">
      <Container className="text-center">
        <p className="mb-0">
          StackUnderflow &copy; {new Date().getFullYear()} - A Stack Overflow Clone
        </p>
      </Container>
    </footer>
  );
};

export default Footer; 