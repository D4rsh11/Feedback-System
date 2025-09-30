# College Feedback System

A comprehensive full-stack web application that serves as a feedback system for colleges, featuring role-based access for students and administrators with advanced analytics and sentiment analysis.

## 🚀 Features

### For Students
- **User Registration & Authentication**: Secure JWT-based authentication system
- **Attendance-Based Access Control**: Students need 75%+ attendance to submit feedback
- **Categorized Feedback Submission**: Submit feedback across 5 categories (College, Faculty, Campus, Syllabus, Other)
- **Feedback History**: View all previously submitted feedback with sentiment analysis
- **Real-time Eligibility Check**: Instant feedback on attendance requirements

### For Administrators
- **Advanced Analytics Dashboard**: Comprehensive KPIs and data visualizations
- **Sentiment Analysis**: AI-powered sentiment analysis of all feedback
- **Interactive Charts**: 
  - Sentiment distribution (Donut Chart)
  - Sentiment by category (Stacked Bar Chart)
  - Submission trends over time (Line Chart)
  - Attendance vs Sentiment correlation (Scatter Plot)
- **Word Cloud**: Visual representation of common issues from negative feedback
- **Filterable Data Table**: Advanced filtering and pagination for feedback exploration
- **Real-time Data**: Refresh dashboard data on demand

### General Features
- **Dark/Light Mode Toggle**: Persistent theme switching
- **Responsive Design**: Fully responsive across all devices
- **Minimalistic UI**: Clean, modern design with excellent UX
- **Role-based Routing**: Automatic redirection based on user roles
- **Protected Routes**: Secure access control for all pages

## 🛠️ Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **sentiment** library for AI sentiment analysis
- **express-validator** for input validation

### Frontend
- **React.js** with functional components and hooks
- **React Router** for client-side routing
- **Recharts** for data visualizations
- **Lucide React** for modern icons
- **Axios** for API communication
- **Context API** for state management

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v14 or higher)
- **MongoDB** (v4.4 or higher)
- **npm** or **yarn**

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd college-feedback-system
```

### 2. Install Dependencies
```bash
# Install root dependencies
npm install

# Install all dependencies (backend + frontend)
npm run install-all
```

### 3. Environment Setup

#### Backend Environment
Create a `.env` file in the `backend` directory:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/feedbackDB
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_secure
NODE_ENV=development
```

#### Frontend Environment (Optional)
Create a `.env` file in the `frontend` directory:
```env
REACT_APP_API_URL=http://localhost:5000
```

### 4. Start MongoDB
Make sure MongoDB is running on your system:
```bash
# On Windows
net start MongoDB

# On macOS with Homebrew
brew services start mongodb-community

# On Linux
sudo systemctl start mongod
```

### 5. Seed Sample Data
```bash
cd backend
npm run seed
```

This will create sample users and feedback data for testing.

### 6. Start the Application

#### Option 1: Start Both Backend and Frontend
```bash
# From the root directory
npm run dev
```

#### Option 2: Start Separately
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm start
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

## 👥 Sample Users

After running the seed script, you can use these accounts:

### Admin Account
- **Username**: `admin`
- **Password**: `admin123`
- **Role**: Admin

### Student Accounts
- **Username**: `student_eligible`
- **Password**: `student123`
- **Attendance**: 92% (Eligible for feedback)

- **Username**: `student_ineligible`
- **Password**: `student456`
- **Attendance**: 68% (Not eligible for feedback)

- **Username**: `another_student`
- **Password**: `student789`
- **Attendance**: 85% (Eligible for feedback)

## 📚 API Documentation

### Authentication Endpoints

#### POST `/api/auth/register`
Register a new student account.

**Request Body:**
```json
{
  "username": "string (3-30 chars, alphanumeric + underscore)",
  "password": "string (min 6 chars)",
  "attendancePercentage": "number (0-100)"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "token": "jwt_token",
  "user": {
    "id": "user_id",
    "username": "username",
    "role": "student",
    "attendancePercentage": 85
  }
}
```

#### POST `/api/auth/login`
Login with username and password.

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "jwt_token",
  "user": {
    "id": "user_id",
    "username": "username",
    "role": "admin|student",
    "attendancePercentage": 85
  }
}
```

#### GET `/api/auth/me`
Get current user information.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "user": {
    "id": "user_id",
    "username": "username",
    "role": "admin|student",
    "attendancePercentage": 85
  }
}
```

### Feedback Endpoints (Student)

#### POST `/api/feedback/submit`
Submit new feedback (requires 75%+ attendance).

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "feedback": "string (max 1000 chars)",
  "type": "College|Faculty|Campus|Syllabus|Other"
}
```

**Response:**
```json
{
  "message": "Feedback submitted successfully",
  "feedback": {
    "id": "feedback_id",
    "feedback": "feedback text",
    "type": "College",
    "sentiment": {
      "score": 2,
      "label": "positive"
    },
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### GET `/api/feedback/my-feedback`
Get user's feedback history.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "feedbacks": [
    {
      "id": "feedback_id",
      "feedback": "feedback text",
      "type": "College",
      "sentiment": {
        "score": 2,
        "label": "positive"
      },
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### GET `/api/feedback/eligibility`
Check if user is eligible to submit feedback.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "isEligible": true,
  "attendancePercentage": 85,
  "message": "You are eligible to submit feedback"
}
```

### Admin Endpoints

#### GET `/api/admin/dashboard/kpis`
Get key performance indicators.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "totalFeedbacks": 150,
  "recentFeedbacks": 25,
  "overallSentiment": 65,
  "mostCommonCategory": "Faculty",
  "categoryNeedingAttention": "Campus"
}
```

#### GET `/api/admin/dashboard/sentiment-breakdown`
Get sentiment distribution data.

**Response:**
```json
{
  "breakdown": [
    {
      "label": "positive",
      "count": 90,
      "percentage": 60
    },
    {
      "label": "negative",
      "count": 45,
      "percentage": 30
    },
    {
      "label": "neutral",
      "count": 15,
      "percentage": 10
    }
  ],
  "total": 150
}
```

#### GET `/api/admin/dashboard/sentiment-by-category`
Get sentiment breakdown by feedback category.

**Response:**
```json
{
  "sentimentByCategory": [
    {
      "_id": "Faculty",
      "sentiments": [
        {
          "sentiment": "positive",
          "count": 25
        },
        {
          "sentiment": "negative",
          "count": 10
        }
      ]
    }
  ]
}
```

#### GET `/api/admin/dashboard/submission-trends`
Get submission trends over the last 30 days.

**Response:**
```json
{
  "trends": [
    {
      "_id": {
        "year": 2024,
        "month": 1,
        "day": 15
      },
      "count": 5
    }
  ]
}
```

#### GET `/api/admin/dashboard/word-cloud`
Get word frequency data from negative feedback.

**Response:**
```json
{
  "wordCloud": [
    {
      "word": "parking",
      "frequency": 15
    },
    {
      "word": "food",
      "frequency": 12
    }
  ]
}
```

#### GET `/api/admin/dashboard/attendance-correlation`
Get attendance vs sentiment correlation data.

**Response:**
```json
{
  "correlationData": [
    {
      "attendancePercentage": 85,
      "sentimentScore": 2,
      "username": "student1"
    }
  ]
}
```

#### GET `/api/admin/feedback`
Get all feedback with filtering and pagination.

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `type`: Filter by feedback type
- `sentiment`: Filter by sentiment (positive, negative, neutral)
- `username`: Search by username

**Response:**
```json
{
  "feedbacks": [
    {
      "id": "feedback_id",
      "feedback": "feedback text",
      "type": "College",
      "sentiment": {
        "score": 2,
        "label": "positive"
      },
      "username": "student1",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50,
    "itemsPerPage": 10
  }
}
```

#### GET `/api/admin/users`
Get all users (admin only).

**Response:**
```json
{
  "users": [
    {
      "id": "user_id",
      "username": "student1",
      "role": "student",
      "attendancePercentage": 85,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

## 🗄️ Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  username: String (unique, 3-30 chars),
  password: String (hashed),
  role: String (enum: ['student', 'admin']),
  attendancePercentage: Number (0-100),
  createdAt: Date,
  updatedAt: Date
}
```

### Feedbacks Collection
```javascript
{
  _id: ObjectId,
  feedback: String (max 1000 chars),
  type: String (enum: ['College', 'Faculty', 'Campus', 'Syllabus', 'Other']),
  sentiment: {
    score: Number,
    label: String (enum: ['positive', 'negative', 'neutral'])
  },
  userId: ObjectId (ref: 'User'),
  username: String,
  createdAt: Date,
  updatedAt: Date
}
```

## 🔧 Development

### Project Structure
```
college-feedback-system/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   └── Feedback.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── feedback.js
│   │   └── admin.js
│   ├── middleware/
│   │   └── auth.js
│   ├── scripts/
│   │   └── seedData.js
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── pages/
│   │   ├── utils/
│   │   ├── App.js
│   │   └── App.css
│   └── package.json
├── package.json
└── README.md
```

### Available Scripts

#### Root Level
- `npm run dev` - Start both backend and frontend
- `npm run server` - Start only backend
- `npm run client` - Start only frontend
- `npm run install-all` - Install all dependencies

#### Backend
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run seed` - Run data seeding script

#### Frontend
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests

## 🚀 Deployment

### Backend Deployment
1. Set production environment variables
2. Build and start the server:
```bash
cd backend
npm start
```

### Frontend Deployment
1. Build the React app:
```bash
cd frontend
npm run build
```
2. Serve the `build` folder with a web server

### Environment Variables for Production
```env
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb://your-production-mongo-uri
JWT_SECRET=your-super-secure-jwt-secret
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/your-repo/issues) page
2. Create a new issue with detailed information
3. Contact the development team

## 🎯 Future Enhancements

- [ ] Email notifications for feedback submissions
- [ ] Advanced filtering options in admin dashboard
- [ ] Export functionality for reports
- [ ] Mobile app development
- [ ] Integration with college management systems
- [ ] Advanced sentiment analysis with machine learning
- [ ] Real-time notifications
- [ ] Feedback response system for admins

---

**Built with ❤️ for better college feedback management**


