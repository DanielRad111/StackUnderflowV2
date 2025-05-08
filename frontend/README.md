# StackUnderflow Frontend

A React-based frontend for the StackUnderflow application, which is a Stack Overflow clone.

## Features

- User authentication (login/register)
- Ask and answer questions
- Vote on questions and answers
- Tag system for categorizing questions
- Enhanced user profiles with:
  - Personal information and social media links
  - Statistics and reputation system
  - Activity tracking
  - User answers history
  - Profile editing capabilities
- Moderation capabilities

## Technologies Used

- React 18
- React Router v6 for routing
- Axios for API requests
- React Bootstrap for UI components
- Bootstrap CSS for styling
- Bootstrap Icons for UI elements

## Getting Started

### Prerequisites

- Node.js (v14 or newer)
- npm or yarn

### Installation

1. Clone the repository
2. Navigate to the frontend directory
3. Install dependencies:

```bash
npm install
# or
yarn install
```

### Running the application

```bash
npm start
# or
yarn start
```

This will start the development server on [http://localhost:3000](http://localhost:3000).

## Backend API

The frontend is designed to work with the Spring Boot backend. Ensure the backend server is running on port 8080 (default setting in the proxy).

## User Profile Features

The application includes a comprehensive user profile system with the following features:

### Profile Information
- Basic information (username, email, phone number)
- Extended profile (bio, location, website)
- Social media links (GitHub, LinkedIn, Twitter)

### User Statistics
- Reputation and level system
- Questions and answers count
- Accepted answers tracking
- Total votes received
- Membership duration

### Activity Feed
- Chronological list of user activities
- Question and answer history
- Grouped by date for better organization

### Profile Management
- Edit personal information
- Update social media links
- Change password with secure validation

### Moderator Tools
- User banning/unbanning
- Assigning moderator privileges
- Managing user status

## Folder Structure

```
frontend/
├── public/                 # Static files
├── src/                    # Source files
│   ├── components/         # Reusable UI components
│   │   ├── EditProfileForm.js  # Profile editing component
│   │   ├── UserActivity.js     # User activity timeline
│   │   ├── UserAnswers.js      # User answers list
│   │   ├── UserStats.js        # User statistics display
│   ├── pages/              # Page components
│   │   ├── UserProfilePage.js  # Enhanced user profile page
│   ├── services/           # API and authentication services
│   │   ├── UserContext.js      # User data management context
│   ├── App.js              # Main App component with routing
│   └── index.js            # Entry point
├── package.json            # Project dependencies
└── README.md               # Project documentation
```

## License

MIT 