# 📋 Social Media Campaign Task Management Dashboard

A modern full-stack Task Management Dashboard designed for social media marketing agencies and digital marketing teams to efficiently plan, organize, assign, monitor, and analyze campaign tasks.

The application enables teams to manage multiple social media campaigns, monitor progress in real time, evaluate team performance, and improve collaboration through an intuitive dashboard.

---

# 🚀 Features

## 🔐 Authentication & Authorization

- Secure Login System
- JWT Authentication
- Role-Based Authorization
- BCrypt Password Encryption
- Protected Routes
- Session Persistence

---

# 📊 Dashboard

- Executive Overview
- Campaign Progress Tracking
- KPI Overview
- Overall Completion Rate
- Task Statistics
- Monthly Campaign Filtering

---

# ✅ Task Management

- Create Tasks
- Edit Tasks
- Delete Tasks
- Assign Tasks to Team Members
- Task Priorities
- Task Status Updates
- Due Date Management
- Ongoing Tasks
- Campaign Phase Assignment
- Search & Filtering

---

# 📅 Calendar

- Interactive Monthly Calendar
- Daily Task View
- Ongoing Task List
- Overdue Task Indicators
- Quick Status Updates
- Task Editing

---

# 📆 Monthly Reviews

- Monthly Task Review
- Recurring Task Templates
- Auto Generate Monthly Tasks
- Monthly Progress Summary
- Template Management

---

# 📈 KPI Analytics

- Team Performance Dashboard
- Productivity Scores
- Completion Percentage
- Platform-wise Analytics
- Priority Analysis
- Team Leaderboard
- Overdue Task Analysis

---

# 👥 Team Management

- Team Member Profiles
- User Roles
- Profile Pictures
- Productivity Scores
- Availability Tracking

---

# 📢 Campaign Management

Supports campaign management across multiple social media platforms including:

- Facebook
- Instagram
- TikTok
- YouTube
- Influencer Marketing
- Paid Advertising
- Other Digital Marketing Platforms

---

# 🎯 Campaign Phases

Example campaign workflow:

- Planning
- Content Creation
- Content Review
- Scheduling
- Campaign Launch
- Monitoring
- Reporting

---

# 👤 User Roles

The system supports different organizational roles such as:

- Project Manager
- Marketing Manager
- Content Strategist
- Social Media Manager
- Graphic Designer
- Video Editor
- AI Content Specialist
- Operations Manager

Roles can be customized according to organizational requirements.

---

# 🛠 Technology Stack

## Frontend

- React.js
- React Router
- Tailwind CSS
- Axios
- Context API
- Lucide React Icons

---

## Backend

- Node.js
- Express.js
- REST API
- JWT
- BCrypt

---

## Database

- MongoDB Atlas
- Mongoose ODM

---

# 📂 Project Structure

```
task-management-dashboard
│
├── frontend
│   ├── components
│   ├── context
│   ├── pages
│   ├── services
│   ├── utils
│   └── App.jsx
│
├── backend
│   ├── config
│   ├── controllers
│   ├── middleware
│   ├── models
│   ├── routes
│   ├── scripts
│   └── server.js
│
└── README.md
```

---

# ⚙ Installation

## Clone Repository

```bash
git clone https://github.com/yourusername/task-management-dashboard.git
```

---

## Install Frontend

```bash
cd frontend
npm install
```

---

## Install Backend

```bash
cd ../backend
npm install
```

---

## Environment Variables

Create a `.env` file inside the backend directory.

```env
PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_secret_key
```

---

## Run Backend

```bash
npm run dev
```

---

## Run Frontend

```bash
npm run dev
```

---

# 📡 REST API

## Authentication

```
POST /api/auth/login
POST /api/auth/register
GET  /api/auth/profile
```

## Users

```
GET    /api/users
PUT    /api/users/:id
DELETE /api/users/:id
```

## Tasks

```
GET    /api/tasks
POST   /api/tasks
PUT    /api/tasks/:id
DELETE /api/tasks/:id
```

## Monthly Templates

```
GET    /api/templates
POST   /api/templates
PUT    /api/templates/:id
DELETE /api/templates/:id
POST   /api/templates/generate
```

---

# 📊 Dashboard Modules

- Executive Dashboard
- Task Management
- Calendar
- Monthly Reviews
- KPI Analytics
- Team Performance
- User Management
- Authentication

---

# 🔒 Security

- JWT Authentication
- Password Hashing with BCrypt
- Protected API Routes
- Role-Based Access Control
- Secure User Sessions

---

# 📈 Analytics

The system automatically calculates:

- Task Completion Rate
- Team Productivity
- Monthly Progress
- Completion Percentage
- Overdue Tasks
- Team Leaderboard
- Platform Performance
- Task Distribution
- Workload Analysis

---

# 🎨 User Interface

- Modern Dashboard
- Fully Responsive
- Mobile Friendly
- Light/Dark Mode Support
- Interactive Calendar
- Progress Indicators
- Status Badges
- Clean UI Design

---

# 📱 Responsive Design

Optimized for:

- Desktop
- Laptop
- Tablet
- Mobile

---

# 🚀 Future Improvements

- Email Notifications
- Push Notifications
- Real-Time Collaboration
- File Uploads
- Task Comments
- AI Task Suggestions
- Activity Logs
- Password Reset
- Google Calendar Integration
- Team Chat
- Advanced Reports
- Export to Excel/PDF
- Multi-language Support

---

# 💼 Use Cases

This dashboard is suitable for:

- Social Media Marketing Agencies
- Digital Marketing Companies
- Creative Agencies
- Advertising Agencies
- Startup Marketing Teams
- Corporate Marketing Departments
- Freelance Marketing Teams
- Content Creation Teams

---

# 👩‍💻 Developed By

**Hasangi Balasuriya**

---

# 📄 License

This project was developed for educational and portfolio purposes.
