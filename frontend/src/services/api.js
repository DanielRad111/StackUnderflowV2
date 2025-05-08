import axios from 'axios';

// Use direct backend URL instead of proxy
const API_URL = 'http://localhost:8080';

// Add basic request/response interceptors
axios.interceptors.request.use(request => {
  return request;
}, error => {
  return Promise.reject(error);
});

axios.interceptors.response.use(response => {
  // Ensure both id and questionId are present in question objects
  if (Array.isArray(response.data) && response.config.url.includes('/questions/')) {
    response.data = response.data.map(item => {
      // Handle case where questionId exists but id doesn't
      if (item.questionId && !item.id) {
        return { ...item, id: item.questionId };
      } 
      // Handle case where id exists but questionId doesn't
      else if (item.id && !item.questionId) {
        return { ...item, questionId: item.id };
      }
      return item;
    });
  }
  // Handle single question object
  else if (response.data && !Array.isArray(response.data) && response.config.url.includes('/questions/')) {
    const item = response.data;
    if (item.questionId && !item.id) {
      response.data = { ...item, id: item.questionId };
    } else if (item.id && !item.questionId) {
      response.data = { ...item, questionId: item.id };
    }
  }
  
  return response;
}, error => {
  return Promise.reject(error);
});

// Create axios instance with CORS config
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// User related API calls - Matches UserController endpoints
export const userService = {
  login: (username, password) => apiClient.post(`/users/login`, { username, password }),
  register: (username, email, password, phoneNumber) => apiClient.post(`/users/create`, { username, email, password, phoneNumber }),
  getUserById: (id) => {
    // Validate id before sending to backend
    if (id === undefined || id === null || id === 'undefined' || id === 'null') {
      return Promise.reject(new Error('Invalid user ID'));
    }
    return apiClient.get(`/users/id/${id}`);
  },
  getUserByUsername: (username) => apiClient.get(`/users/username/${username}`),
  updateUser: (id, data) => {
    // Validate id before sending to backend
    if (id === undefined || id === null || id === 'undefined' || id === 'null') {
      return Promise.reject(new Error('Invalid user ID'));
    }
    return apiClient.put(`/users/${id}`, data);
  },
  getAllUsers: () => apiClient.get(`/users/all`),
  
  // Search for users by keyword
  searchUsers: (keyword) => {
    if (!keyword || keyword.trim() === '') {
      return Promise.reject(new Error('Search keyword is required'));
    }
    return apiClient.get(`/users/search?keyword=${encodeURIComponent(keyword)}`);
  },
  
  // New methods for enhanced user profile functionality
  getUserStatistics: (id) => {
    // This would ideally be a backend endpoint, but we'll simulate it with data we already have
    // In a real implementation, you would create this endpoint in the backend
    return apiClient.get(`/users/id/${id}`)
      .then(async (response) => {
        const user = response.data;
        
        // Get user's questions and answers
        const [questionsRes, answersRes] = await Promise.all([
          apiClient.get(`/questions/author/${id}`),
          apiClient.get(`/answers/author/${id}`)
        ]);
        
        const questions = questionsRes.data || [];
        const answers = answersRes.data || [];
        
        // Calculate statistics
        const stats = {
          questionsCount: questions.length,
          answersCount: answers.length,
          acceptedAnswersCount: answers.filter(a => a.accepted).length,
          totalVotes: (questions.reduce((sum, q) => sum + (q.votes || 0), 0) + 
                      answers.reduce((sum, a) => sum + ((a.upvotes || 0) - (a.downvotes || 0)), 0)),
          joinDate: user.createdAt,
          reputation: user.reputation || 0,
          badges: user.badges || []
        };
        
        return { data: stats };
      });
  },
  
  updateUserProfile: (id, profileData) => {
    // Validate data
    if (!profileData) {
      return Promise.reject(new Error('Profile data is required'));
    }
    if (id === undefined || id === null || id === 'undefined' || id === 'null') {
      return Promise.reject(new Error('Invalid user ID'));
    }
    
    // This would be a PUT request to update the profile
    return apiClient.put(`/users/${id}`, profileData);
  },
  
  changePassword: (id, currentPassword, newPassword) => {
    // Validate data
    if (!currentPassword || !newPassword) {
      return Promise.reject(new Error('Both current and new passwords are required'));
    }
    if (id === undefined || id === null || id === 'undefined' || id === 'null') {
      return Promise.reject(new Error('Invalid user ID'));
    }
    
    // This would be a dedicated endpoint for changing password
    return apiClient.post(`/users/${id}/changePassword`, {
      currentPassword,
      newPassword
    });
  },
  
  getUserActivity: (id) => {
    // In a real implementation, this would be a dedicated endpoint
    // For now, we're combining data from different endpoints
    return Promise.all([
      apiClient.get(`/questions/author/${id}`),
      apiClient.get(`/answers/author/${id}`),
      // We could also get votes, comments, etc.
    ]).then(([questionsRes, answersRes]) => {
      const questions = questionsRes.data || [];
      const answers = answersRes.data || [];
      
      // Create timeline of activity
      const activities = [
        ...questions.map(q => ({
          type: 'question',
          id: q.id,
          title: q.title,
          date: q.createdAt,
          votes: q.votes || 0,
          link: `/questions/${q.id}`
        })),
        ...answers.map(a => ({
          type: 'answer',
          id: a.id,
          questionId: a.questionId,
          questionTitle: a.questionTitle || "Question",
          date: a.createdAt,
          votes: (a.upvotes || 0) - (a.downvotes || 0),
          accepted: a.accepted,
          link: `/questions/${a.questionId}`
        }))
      ];
      
      // Sort by date, most recent first
      activities.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      return { data: activities };
    });
  }
};

// Question related API calls - Matches QuestionController endpoints
export const questionService = {
  getAllQuestions: () => apiClient.get(`/questions/all`),
  getQuestionById: (id) => {
    // Validate id before sending to backend
    if (id === undefined || id === null || id === 'undefined' || id === 'null') {
      return Promise.reject(new Error('Invalid question ID'));
    }
    return apiClient.get(`/questions/find/${id}`);
  },
  getQuestionsByAuthor: (authorId) => {
    // Validate authorId before sending to backend
    if (authorId === undefined || authorId === null || authorId === 'undefined' || authorId === 'null') {
      return Promise.reject(new Error('Invalid author ID'));
    }
    return apiClient.get(`/questions/author/${authorId}`);
  },
  getQuestionsByTag: (tagName) => apiClient.get(`/questions/tag/${tagName}`),
  getQuestionsByStatus: (status) => apiClient.get(`/questions/status/${status}`),
  searchQuestions: (keyword) => {
    if (!keyword || keyword.trim() === '') {
      return Promise.reject(new Error('Search keyword is required'));
    }
    console.log("Searching questions with keyword:", keyword);
    return apiClient.get(`/questions/search?keyword=${encodeURIComponent(keyword)}`)
      .then(response => {
        console.log("Question search response:", response);
        return response;
      })
      .catch(error => {
        console.error("Error searching questions:", error);
        throw error;
      });
  },
  createQuestion: (authorId, title, text, image, tags) => {
    // Validate inputs before sending to backend
    if (!authorId || authorId === 'undefined') {
      return Promise.reject(new Error('Author ID is required'));
    }
    if (!title || title.trim() === '') {
      return Promise.reject(new Error('Title is required'));
    }
    if (!text || text.trim() === '') {
      return Promise.reject(new Error('Question text is required'));
    }
    
    return apiClient.post(`/questions/create`, { authorId, title, text, image, tags });
  },
  updateQuestion: (id, data, userId) => {
    // Validate inputs before sending to backend
    if (!id || id === 'undefined') {
      return Promise.reject(new Error('Question ID is required'));
    }
    if (!userId || userId === 'undefined') {
      return Promise.reject(new Error('User ID is required'));
    }
    
    return apiClient.put(`/questions/update/${id}?userId=${userId}`, data);
  },
  acceptAnswer: (questionId, answerId) => {
    // Validate inputs before sending to backend
    if (!questionId || questionId === 'undefined') {
      return Promise.reject(new Error('Question ID is required'));
    }
    if (!answerId || answerId === 'undefined') {
      return Promise.reject(new Error('Answer ID is required'));
    }
    
    return apiClient.put(`/questions/${questionId}/accept/${answerId}`);
  },
  deleteQuestion: (id, userId) => {
    // Validate inputs before sending to backend
    if (!id || id === 'undefined') {
      return Promise.reject(new Error('Question ID is required'));
    }
    if (!userId || userId === 'undefined') {
      return Promise.reject(new Error('User ID is required'));
    }
    
    return apiClient.delete(`/questions/delete/${id}?userId=${userId}`);
  }
};

// Answer related API calls - Matches AnswerController endpoints
export const answerService = {
  getAllAnswers: () => apiClient.get(`/answers/all`),
  getAnswerById: (id) => {
    // Validate id before sending to backend
    if (id === undefined || id === null || id === 'undefined' || id === 'null') {
      return Promise.reject(new Error('Invalid answer ID'));
    }
    return apiClient.get(`/answers/id/${id}`);
  },
  getAnswersByQuestion: (questionId) => {
    // Validate questionId before sending to backend
    if (questionId === undefined || questionId === null || questionId === 'undefined' || questionId === 'null') {
      return Promise.reject(new Error('Invalid question ID'));
    }
    return apiClient.get(`/answers/question/${questionId}`);
  },
  getAnswersByAuthor: (authorId) => {
    // Validate authorId before sending to backend
    if (authorId === undefined || authorId === null || authorId === 'undefined' || authorId === 'null') {
      return Promise.reject(new Error('Invalid author ID'));
    }
    return apiClient.get(`/answers/author/${authorId}`);
  },
  debugAnswer: (authorId, questionId, text, code) => {
    // Validate inputs
    if (!questionId || questionId === 'undefined') {
      return Promise.reject(new Error("Invalid question ID"));
    }
    
    if (!authorId || authorId === 'undefined') {
      return Promise.reject(new Error("Invalid author ID"));
    }
    
    const payload = { 
      id: String(questionId), 
      authorId: String(authorId), 
      text: text || "Test answer", 
      image: code || "" 
    };
    
    console.log("Debug answer with payload:", payload);
    return apiClient.post(`/answers/debug`, payload);
  },
  createAnswer: (authorId, questionId, text, code) => {
    // Validate inputs with stronger checks
    if (questionId === undefined || questionId === null || questionId === 'undefined' || questionId === 'null') {
      return Promise.reject(new Error("Invalid question ID"));
    }
    
    if (authorId === undefined || authorId === null || authorId === 'undefined' || authorId === 'null') {
      return Promise.reject(new Error("Invalid author ID"));
    }
    
    if (!text || text.trim() === '') {
      return Promise.reject(new Error("Answer text cannot be empty"));
    }
    
    try {
      const numQuestionId = Number(questionId);
      const numAuthorId = Number(authorId);
      
      if (isNaN(numQuestionId) || isNaN(numAuthorId)) {
        return Promise.reject(new Error("Invalid ID format"));
      }
      
      // Use the direct-create endpoint with query parameters
      return apiClient.post(`/answers/direct-create`, null, { 
        params: {
          questionId: numQuestionId,
          authorId: numAuthorId,
          text: text.trim(),
          image: code || ""
        }
      });
    } catch (err) {
      return Promise.reject(err);
    }
  },
  updateAnswer: (id, data, userId) => {
    // Validate inputs before sending to backend
    if (!id || id === 'undefined') {
      return Promise.reject(new Error('Answer ID is required'));
    }
    if (!userId || userId === 'undefined') {
      return Promise.reject(new Error('User ID is required'));
    }
    
    return apiClient.put(`/answers/update/${id}?userId=${userId}`, data);
  },
  deleteAnswer: (id, userId) => {
    // Validate inputs before sending to backend
    if (!id || id === 'undefined') {
      return Promise.reject(new Error('Answer ID is required'));
    }
    if (!userId || userId === 'undefined') {
      return Promise.reject(new Error('User ID is required'));
    }
    
    return apiClient.delete(`/answers/delete/${id}?userId=${userId}`);
  }
};

// Vote related API calls - Matches VoteController endpoints
export const voteService = {
  getAllVotes: () => apiClient.get(`/votes/all`),
  getVoteById: (id) => {
    // Validate id before sending to backend
    if (id === undefined || id === null || id === 'undefined' || id === 'null') {
      return Promise.reject(new Error('Invalid vote ID'));
    }
    return apiClient.get(`/votes/id/${id}`);
  },
  getVotesByUser: (userId) => {
    // Validate userId before sending to backend
    if (userId === undefined || userId === null || userId === 'undefined' || userId === 'null') {
      return Promise.reject(new Error('Invalid user ID'));
    }
    return apiClient.get(`/votes/user/${userId}`);
  },
  voteQuestion: (userId, questionId, voteType) => {
    // Validate inputs before sending to backend
    if (!userId || userId === 'undefined') {
      return Promise.reject(new Error('User ID is required'));
    }
    if (!questionId || questionId === 'undefined') {
      return Promise.reject(new Error('Question ID is required'));
    }
    if (!voteType) {
      return Promise.reject(new Error('Vote type is required'));
    }
    
    return apiClient.post(`/votes/question`, { userId, questionId, voteType });
  },
  voteAnswer: (userId, answerId, voteType) => {
    // Validate inputs before sending to backend
    if (!userId || userId === 'undefined') {
      return Promise.reject(new Error('User ID is required'));
    }
    if (!answerId || answerId === 'undefined') {
      return Promise.reject(new Error('Answer ID is required'));
    }
    if (!voteType) {
      return Promise.reject(new Error('Vote type is required'));
    }
    
    return apiClient.post(`/votes/answer`, { userId, answerId, voteType });
  },
  deleteVote: (id) => {
    // Validate id before sending to backend
    if (!id || id === 'undefined') {
      return Promise.reject(new Error('Vote ID is required'));
    }
    return apiClient.delete(`/votes/delete/${id}`);
  }
};

// Tag related API calls - Matches TagController endpoints (note the URL is /tag not /tags)
export const tagService = {
  getAllTags: () => apiClient.get(`/tag/all`),
  getTagById: (id) => apiClient.get(`/tag/id/${id}`),
  getTagByName: (name) => apiClient.get(`/tag/name/${name}`),
  createTag: (name) => apiClient.post(`/tag/create`, { name }),
  updateTag: (id, name) => apiClient.put(`/tag/update/${id}`, { name }),
  deleteTag: (id) => apiClient.delete(`/tag/delete/${id}`)
};

// Combined search service for searching across different entities
export const searchService = {
  // Global search across questions and users
  globalSearch: async (keyword) => {
    if (!keyword || keyword.trim() === '') {
      return Promise.reject(new Error('Search keyword is required'));
    }
    
    try {
      console.log("Starting global search for:", keyword);
      
      // Try to get questions first
      let questions = [];
      let users = [];
      
      try {
        console.log("Searching questions for:", keyword);
        const questionsResponse = await questionService.searchQuestions(keyword);
        console.log("Questions search response:", questionsResponse);
        questions = questionsResponse.data || [];
      } catch (error) {
        console.error("Error searching questions:", error);
      }
      
      try {
        console.log("Searching users for:", keyword);
        const usersResponse = await userService.searchUsers(keyword);
        console.log("Users search response:", usersResponse);
        users = usersResponse.data || [];
      } catch (error) {
        console.error("Error searching users:", error);
      }
      
      const results = { questions, users };
      console.log("Combined search results:", results);
      
      return { data: results };
    } catch (error) {
      console.error("Global search error:", error);
      throw error;
    }
  }
}; 