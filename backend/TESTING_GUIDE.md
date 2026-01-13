# 🚀 DevStep API - Testing Guide with Postman

## Quick Start

### 1. **Import Postman Collection**
- Download the `Postman_Collection.json` file
- Open Postman
- Click "Import" → Select the file
- All endpoints are ready to test!

---

## 📋 Complete Endpoint List

### **USER ROUTES** (`/api/users`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Register new user |
| POST | `/login` | Login with email & password |

---

### **QUEST ROUTES** (`/api/quests`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get all quests (with filters) |
| GET | `/:questId` | Get specific quest |
| POST | `/` | Create new quest |
| PUT | `/:questId` | Update quest |
| DELETE | `/:questId` | Delete quest |
| POST | `/:questId/complete` | Complete quest & earn XP |

---

### **MESSAGE ROUTES** (`/api/messages`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/send` | Send message to user |
| GET | `/` | Get all messages |
| GET | `/conversation/:userId` | Get conversation with user |
| PUT | `/:messageId/read` | Mark message as read |
| DELETE | `/:messageId` | Delete message |

---

### **MENTORSHIP ROUTES** (`/api/mentorship`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/become-mentor` | Become a mentor (Level 5+) |
| GET | `/` | Get all mentorships |
| GET | `/:mentorshipId` | Get mentorship details |
| POST | `/request/:mentorId` | Request mentorship |
| POST | `/:mentorshipId/accept` | Accept mentorship request |
| POST | `/:mentorshipId/reject` | Reject mentorship request |
| POST | `/:mentorshipId/session` | Add mentoring session |
| POST | `/:mentorshipId/endorse` | Endorse mentee |
| POST | `/:mentorshipId/complete` | Complete mentorship |
| DELETE | `/:mentorshipId/remove-mentee` | Remove mentee |

---

## 🔑 Authentication

### JWT Token Setup in Postman

Most endpoints require `Authorization` header with JWT token:

```
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

### How to Get Token:
1. **Register User** (POST `/api/users/register`)
2. **Login** (POST `/api/users/login`)
3. Response will include `token` field
4. Copy the token and add to Authorization header

---

## 📝 Testing Order (Step-by-Step)

### Step 1: Register Users
```json
POST http://localhost:5000/api/users/register

{
  "name": "Akshay",
  "email": "akshay@example.com",
  "password": "password123"
}

{
  "name": "Priya",
  "email": "priya@example.com",
  "password": "password456"
}
```
**Save the tokens from response!**

---

### Step 2: Create Quests
```json
POST http://localhost:5000/api/quests

{
  "title": "Learn JavaScript Basics",
  "description": "Master JavaScript fundamentals",
  "requiredLevel": 1,
  "contentType": "video",
  "contentUrl": "https://youtube.com/example",
  "difficulty": "easy",
  "xpReward": 100
}

{
  "title": "React Advanced",
  "description": "Learn React hooks and patterns",
  "requiredLevel": 2,
  "contentType": "article",
  "contentUrl": "https://react.dev",
  "difficulty": "medium",
  "xpReward": 200
}
```

---

### Step 3: Complete Quest (Earn XP)
```json
POST http://localhost:5000/api/quests/QUEST_ID_HERE/complete

Headers:
Authorization: Bearer AKSHAY_TOKEN
```

---

### Step 4: Send Message
```json
POST http://localhost:5000/api/messages/send

Headers:
Authorization: Bearer AKSHAY_TOKEN

{
  "receiverId": "PRIYA_USER_ID",
  "content": "Hey Priya! How are you?",
  "attachmentUrl": ""
}
```

---

### Step 5: Mentorship Flow

**5a. Become Mentor (Priya - Level 5+)**
```json
POST http://localhost:5000/api/mentorship/become-mentor

Headers:
Authorization: Bearer PRIYA_TOKEN
```

**5b. Request Mentorship (Akshay requests Priya)**
```json
POST http://localhost:5000/api/mentorship/request/PRIYA_USER_ID

Headers:
Authorization: Bearer AKSHAY_TOKEN
```

**5c. Accept Request (Priya accepts)**
```json
POST http://localhost:5000/api/mentorship/MENTORSHIP_ID_HERE/accept

Headers:
Authorization: Bearer PRIYA_TOKEN
```

**5d. Add Session**
```json
POST http://localhost:5000/api/mentorship/MENTORSHIP_ID_HERE/session

Headers:
Authorization: Bearer PRIYA_TOKEN

{
  "duration": 60,
  "topic": "JavaScript Fundamentals",
  "notes": "Covered functions and scope"
}
```

**5e. Endorse Mentee**
```json
POST http://localhost:5000/api/mentorship/MENTORSHIP_ID_HERE/endorse

Headers:
Authorization: Bearer PRIYA_TOKEN

{
  "rating": 5,
  "message": "Excellent learner!"
}
```

---

## 🧪 Testing Filters

### Get Quests by Level
```
GET http://localhost:5000/api/quests?level=1
```

### Get Quests by Difficulty
```
GET http://localhost:5000/api/quests?difficulty=easy
```

### Combined Filters
```
GET http://localhost:5000/api/quests?level=2&difficulty=medium
```

---

## ⚠️ Common Errors & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| `User already exists` | Email taken | Use different email |
| `Invalid email or password` | Wrong credentials | Check email/password |
| `Level 5 required to become mentor` | Not high enough level | Complete quests to level up |
| `Mentor has max capacity` | Mentor has 5 mentees | Find different mentor |
| `Insufficient message credits` | Out of credits | Complete more quests |
| `401 Unauthorized` | Missing/invalid token | Check Authorization header |

---

## 📊 Database IDs Needed

When testing, you'll need to replace these placeholders:

| Placeholder | Where to Get |
|-------------|-------------|
| `QUEST_ID_HERE` | From "Create Quest" response |
| `USER_ID` | From "Register/Login" response `_id` |
| `MENTORSHIP_ID_HERE` | From "Request Mentorship" response |
| `YOUR_JWT_TOKEN` | From "Register/Login" response `token` |

---

## 🎯 Quick Copy-Paste Commands

### Register Akshay
```
POST /api/users/register
Content: {"name":"Akshay","email":"akshay@test.com","password":"pass123"}
```

### Register Priya
```
POST /api/users/register
Content: {"name":"Priya","email":"priya@test.com","password":"pass456"}
```

### Create Basic Quest
```
POST /api/quests
Content: {"title":"Test Quest","description":"Desc","requiredLevel":1,"contentType":"video","contentUrl":"http://test.com","difficulty":"easy","xpReward":100}
```

---

## ✅ Server Running?

Make sure your backend is running:
```bash
cd backend
npm install
node server.js
```

Should see: **"🔥 Server is running on http://localhost:5000"**

---

## 💡 Tips

1. **Save responses** - Keep track of IDs from responses
2. **Use Environment Variables** in Postman for tokens
3. **Test in order** - Register → Create Quests → Complete → Message → Mentorship
4. **Check MongoDB** - Verify data is being saved to database
5. **Read error messages** - They tell you exactly what's wrong

---

Happy Testing! 🎉
