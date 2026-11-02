# StudyBuddy – Backend API

## Project Overview

StudyBuddy is a student study management system designed to help students organize their subjects, assignments, and study schedules.

The backend provides RESTful APIs for user authentication, subject management, assignment tracking, dashboard statistics, and an AI-powered Coursework Planner using Google Gemini.

## Technologies Used

- Node.js
- Express.js
- TypeScript
- MongoDB Atlas
- Mongoose
- JWT Authentication
- bcryptjs
- Google Gemini API
- Multer
- dotenv
- CORS

## Features

### 1. User Authentication
- User registration and login.
- Password hashing using bcryptjs.
- JWT access and refresh tokens.
- Protected API routes.

### 2. User Profile
- View user profile.
- Update name, bio, and profile image.

### 3. Subject Management
- Create subjects.
- View all subjects.
- Update subjects.
- Delete subjects.

### 4. Assignment Management
- Create assignments.
- View assignments.
- Update assignments.
- Delete assignments.
- Track pending and completed assignments.
- Filter assignments by calendar date range.

### 5. Dashboard
- Total subjects.
- Total assignments.
- Pending assignments.
- Completed assignments.
- Upcoming assignments.

### 6. AI Coursework Planner
- Upload coursework PDF files.
- Analyze coursework using Google Gemini AI.
- Extract coursework tasks and requirements.
- Generate personalized study plans.
- Save and manage coursework records.
- Set individual study preferences.

### 7. Study Plan Management
- Generate AI study plans.
- View saved study plans.
- Update task status.
- Reschedule incomplete tasks.
- View today's study tasks.
- Track study progress and completion percentage.
- Edit study tasks.
- Delete study plans.

## Project Structure

```text
studybuddy-backend/
├── src/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── service/
│   ├── util/
│   └── index.ts
├── .example.env
├── .gitignore
├── package.json
└── tsconfig.json
```

## Installation and Setup

### 1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
```

### 2. Navigate to Backend Folder

```bash
cd studybuddy-backend
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Create a `.env` file in the backend root directory.

Add the following variables:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
```

Replace the placeholder values with your own credentials.

### 5. Run the Development Server

```bash
npm run dev
```

The backend server will run at:

```text
http://localhost:5000
```

### 6. Build the Project

```bash
npm run build
```

### 7. Start the Production Server

```bash
npm start
```

## API Base URL

```text
http://localhost:5000/api
```

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | /auth/register | Register user |
| POST | /auth/login | Login user |
| POST | /auth/refresh | Refresh access token |
| GET | /auth/profile | Get user profile |
| PUT | /auth/profile | Update profile |
| POST | /subjects | Create subject |
| GET | /subjects | Get subjects |
| PUT | /subjects/:id | Update subject |
| DELETE | /subjects/:id | Delete subject |
| POST | /assignments | Create assignment |
| GET | /assignments | Get assignments |
| PUT | /assignments/:id | Update assignment |
| DELETE | /assignments/:id | Delete assignment |
| GET | /assignments/calendar | Calendar assignments |
| GET | /dashboard | Get dashboard statistics |
| POST | /coursework/upload | Upload and analyze PDF |
| GET | /coursework | Get courseworks |
| GET | /coursework/:id | Get single coursework |
| DELETE | /coursework/:id | Delete coursework |
| POST | /study-preferences | Save study preferences |
| GET | /study-preferences | Get study preferences |
| POST | /study-plans/generate | Generate study plan |
| GET | /study-plans | Get study plans |
| GET | /study-plans/today | Get today's tasks |
| GET | /study-plans/progress | Get study progress |
| PATCH | /study-plans/:planId/tasks/:taskId | Update task status |
| PATCH | /study-plans/:planId/tasks/:taskId/reschedule | Reschedule task |
| PUT | /study-plans/:planId/tasks/:taskId | Edit study task |
| DELETE | /study-plans/:planId | Delete study plan |

## Authentication

Protected endpoints require a JWT access token.

Include the following header:

```text
Authorization: Bearer YOUR_ACCESS_TOKEN
```

## Testing

API endpoints were tested using Postman.

Testing includes:
- Authentication.
- CRUD operations.
- Protected routes.
- Dashboard statistics.
- Coursework PDF upload and AI analysis.
- Study plan generation and management.

## Security

- Passwords are hashed using bcryptjs.
- JWT authentication protects private routes.
- User-specific data is restricted to the authenticated user.
- Environment variables are used for sensitive credentials.
- Uploaded files are restricted to PDF files.

## Developer

StudyBuddy – ITS2020 RAD Coursework Project

**Project Type:** MERN Stack Full Stack Web Application

**Backend:** Node.js, Express.js, TypeScript and MongoDB

Rivith Panthila batch 75