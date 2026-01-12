# EduQuest - Gamified Peer-to-Peer Learning Platform

A full-stack MERN application that gamifies education with a 7-tier progression system, mentorship ecosystem, and peer-to-peer learning.

## 🎮 Features

### Core Gamification
- **7-Level Progression System** - The Novice → The Legend
- **XP & Badges** - Earn experience points and unlock achievements
- **Streaks** - Daily login motivation with streak tracking
- **Artifacts** - Digital collectibles for milestone achievements

### Mentorship Ecosystem
- **Mentor System** - Level 5+ students can become mentors
- **Smart Matching** - Mentors paired with mentees based on levels
- **Endorsement System** - Mentees endorse mentors, earning them XP
- **Direct Messaging** - Mentors & mentees have unrestricted communication

### Learning Paths
1. **Level 1** - The Novice (Fundamentals)
2. **Level 2** - The Architect (DSA)
3. **Level 3** - The Builder (First Project)
4. **Level 4** - The Marketer (Resume/LinkedIn)
5. **Level 5** - The Corporate Scout (Internship)
6. **Level 6** - The Gladiator (Placement Prep)
7. **Level 7** - The Legend (Placement)

### Smart Features
- **+2 Level Messaging** - Users can message 2 levels above them
- **Message Credits** - Earn credits by completing quests (spam prevention)
- **Heatmap Activity Tracking** - Visualize study consistency
- **Quiz System** - Auto-grading with XP multipliers (60%+ = pass)
- **Leaderboards** - Global rankings based on XP and level

## 🏗️ Tech Stack

### Frontend
- React 19
- Tailwind CSS 4
- Framer Motion (animations)
- Lucide React (icons)
- React Router v7
- Axios

### Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- Bcryptjs (password hashing)
- Socket.io (real-time messaging)

### Database Schema
- **Users** - Profiles, XP, levels, streaks, mentorship
- **Quests** - Video, article, quiz, project, coding challenges
- **Courses** - Level-mapped learning paths
- **Mentorship** - Request, acceptance, progress tracking
- **Messages** - User conversations with credit system

## 📁 Project Structure

```
EduQuest/
├── backend/
│   ├── models/
│   │   ├── User.js          # Enhanced user with gamification
│   │   ├── Quest.js         # Learning quests
│   │   ├── Course.js        # Course management
│   │   ├── Mentorship.js    # Mentor-mentee system
│   │   └── Message.js       # Messaging system
│   ├── controller/
│   │   ├── userController.js
│   │   ├── questController.js
│   │   ├── mentorshipController.js
│   │   └── messageController.js
│   ├── routes/
│   │   └── userRoutes.js
│   ├── config/
│   │   └── db.js
│   ├── server.js
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   └── Signup.jsx
    │   ├── contexts/
    │   │   └── AuthContext.jsx
    │   ├── components/
    │   ├── App.jsx
    │   ├── main.jsx
    │   ├── index.css
    │   └── assets/
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── tailwind.config.js
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB
- npm or yarn

### Backend Setup

```bash
cd backend
npm install
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

## 📊 Key Implementations

### Auto Level-Up Logic
- XP thresholds: 0 → 500 → 1500 → 3000 → 5000 → 8000 → 12000
- Mongoose pre-save middleware automatically upgrades levels
- Badges awarded on level up
- Artifacts granted as digital collectibles

### Messaging System
- **+2 Level Rule**: Only message users up to 2 levels above
- **Message Credits**: 10 initial credits, earn more by completing quests
- **Mentor Bypass**: Mentor-mentee pairs have unlimited messaging

### Mentorship Flow
1. User reaches Level 5 → Eligible to become mentor
2. Lower-level student requests mentorship
3. Mentor accepts/rejects
4. Mentee progress tracked
5. Mentee endorses mentor → Mentor gets XP & endorsement count

### Quiz Scoring
- Pass threshold: 60%
- XP multipliers: 90%+ = 1.5x, 75%+ = 1.2x, else 1.0x
- Instant feedback with explanations

## 🔐 Security Features
- JWT authentication
- Bcrypt password hashing
- Role-based access (Mentor eligibility)
- Message credit system prevents spam
- Level-based content restrictions

## 📈 Resume-Ready Features
- Gamification logic with Mongoose middleware
- Real-time leaderboards with sorting
- Complex relational data management
- Message credit system (resource management)
- Multi-role system (student, mentor)
- Activity tracking & visualization

## 🎯 Upcoming Features
- GitHub API integration for project verification
- AI-powered mock interviews (Gemini/OpenAI)
- Dynamic resume PDF generation
- WebRTC video calls for mentoring
- Redis caching for leaderboards
- Email notifications
- LinkedIn OAuth integration

## 📝 License
MIT

## 👤 Author
[Your Name]

---

**EduQuest** - Where Learning Meets Gaming! 🚀
