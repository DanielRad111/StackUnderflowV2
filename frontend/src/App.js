import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './services/AuthContext';
import { UserProvider } from './services/UserContext';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import QuestionDetailPage from './pages/QuestionDetailPage';
import AskQuestionPage from './pages/AskQuestionPage';
import UserProfilePage from './pages/UserProfilePage';
import TagsPage from './pages/TagsPage';
import NotFoundPage from './pages/NotFoundPage';
import TestAnswerPage from './pages/TestAnswerPage';
import TestUserPage from './pages/TestUserPage';
import SearchPage from './pages/SearchPage';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useContext(AuthContext);
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const ModeratorRoute = ({ children }) => {
  const { isAuthenticated, isModerator } = useContext(AuthContext);
  return isAuthenticated && isModerator ? children : <Navigate to="/" />;
};

function App() {
  console.log("App rendering, setting up routes");
  
  return (
    <UserProvider>
      <div className="d-flex flex-column min-vh-100">
        <Navbar />
        <main className="flex-grow-1 container py-4">
          <Routes>
            {/* Home route */}
            <Route path="/" element={<HomePage />} />
            
            {/* Auth routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* Question routes */}
            <Route path="/questions/:id" element={<QuestionDetailPage />} />
            <Route 
              path="/ask" 
              element={
                <PrivateRoute>
                  <AskQuestionPage />
                </PrivateRoute>
              } 
            />
            
            {/* User routes */}
            <Route path="/users/:id" element={<UserProfilePage />} />
            
            {/* Tag routes */}
            <Route path="/tags" element={<TagsPage />} />
            <Route path="/tags/:tagName" element={<HomePage />} />
            
            {/* Test routes */}
            <Route path="/test-answer" element={<TestAnswerPage />} />
            <Route path="/test-user" element={<TestUserPage />} />
            
            {/* Search route */}
            <Route path="/search" element={<SearchPage />} />
            
            {/* 404 route */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </UserProvider>
  );
}

export default App; 