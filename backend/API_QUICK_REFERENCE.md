# 🔗 API Routes - Links & Test Data

## **1️⃣ USER ROUTES**

### Register User
```
POST http://localhost:5000/api/users/register

{
  "name": "Akshay Kumar",
  "email": "akshay@example.com",
  "password": "Akshay@123"
}

Response: ✅ Token + User Details
```

### Login User
```
POST http://localhost:5000/api/users/login

{
  "email": "akshay@example.com",
  "password": "Akshay@123"
}

Response: ✅ Token + User Details
```

---

## **2️⃣ QUEST ROUTES**

### Create Quest
```
POST http://localhost:5000/api/quests

{
  "title": "Learn JavaScript ES6",
  "description": "Master modern JavaScript with ES6 features",
  "requiredLevel": 1,
  "contentType": "video",
  "contentUrl": "https://youtube.com/watch?v=example",
  "difficulty": "easy",
  "xpReward": 150
}

Response: ✅ Quest Object + ID
```

### Get All Quests
```
GET http://localhost:5000/api/quests

Query Filters (Optional):
- http://localhost:5000/api/quests?level=1
- http://localhost:5000/api/quests?difficulty=easy
- http://localhost:5000/api/quests?level=2&difficulty=medium

Response: ✅ Array of Quests
```

### Get Single Quest
```
GET http://localhost:5000/api/quests/PASTE_QUEST_ID_HERE

Example:
GET http://localhost:5000/api/quests/507f1f77bcf86cd799439011

Response: ✅ Single Quest Details
```

### Update Quest
```
PUT http://localhost:5000/api/quests/PASTE_QUEST_ID_HERE

{
  "title": "Updated Title",
  "xpReward": 200,
  "difficulty": "hard"
}

Response: ✅ Updated Quest
```

### Delete Quest
```
DELETE http://localhost:5000/api/quests/PASTE_QUEST_ID_HERE

Response: ✅ Quest deleted successfully!
```

### Complete Quest (Earn XP)
```
POST http://localhost:5000/api/quests/PASTE_QUEST_ID_HERE/complete

Headers:
Authorization: Bearer PASTE_YOUR_JWT_TOKEN_HERE

Response: ✅ XP Earned + Level Up Info
```

---

## **3️⃣ MESSAGE ROUTES**

### Send Message
```
POST http://localhost:5000/api/messages/send

Headers:
Authorization: Bearer PASTE_YOUR_JWT_TOKEN_HERE

{
  "receiverId": "PASTE_RECEIVER_USER_ID_HERE",
  "content": "Hey! How are you doing?",
  "attachmentUrl": ""
}

Example:
{
  "receiverId": "507f1f77bcf86cd799439012",
  "content": "Great work on the DSA module!",
  "attachmentUrl": ""
}

Response: ✅ Message sent successfully
```

### Get All Messages
```
GET http://localhost:5000/api/messages

Headers:
Authorization: Bearer PASTE_YOUR_JWT_TOKEN_HERE

Response: ✅ Last 50 messages
```

### Get Conversation (Chat with 1 User)
```
GET http://localhost:5000/api/messages/conversation/PASTE_OTHER_USER_ID_HERE

Headers:
Authorization: Bearer PASTE_YOUR_JWT_TOKEN_HERE

Example:
GET http://localhost:5000/api/messages/conversation/507f1f77bcf86cd799439012

Response: ✅ All messages between 2 users
```

### Mark Message as Read
```
PUT http://localhost:5000/api/messages/PASTE_MESSAGE_ID_HERE/read

Headers:
Authorization: Bearer PASTE_YOUR_JWT_TOKEN_HERE

Response: ✅ Message marked as read
```

### Delete Message
```
DELETE http://localhost:5000/api/messages/PASTE_MESSAGE_ID_HERE

Headers:
Authorization: Bearer PASTE_YOUR_JWT_TOKEN_HERE

Response: ✅ Message deleted successfully!
```

---

## **4️⃣ MENTORSHIP ROUTES**

### Become a Mentor (Level 5+ Required)
```
POST http://localhost:5000/api/mentorship/become-mentor

Headers:
Authorization: Bearer PASTE_MENTOR_JWT_TOKEN_HERE

Response: ✅ You are now a mentor! (3 mentee slots)
```

### Get All My Mentorships
```
GET http://localhost:5000/api/mentorship

Headers:
Authorization: Bearer PASTE_YOUR_JWT_TOKEN_HERE

Response: ✅ List of all your mentorships (as mentor or mentee)
```

### Get Mentorship Details
```
GET http://localhost:5000/api/mentorship/PASTE_MENTORSHIP_ID_HERE

Headers:
Authorization: Bearer PASTE_YOUR_JWT_TOKEN_HERE

Response: ✅ Complete mentorship info + sessions
```

### Request Mentorship (Student asks Mentor)
```
POST http://localhost:5000/api/mentorship/request/PASTE_MENTOR_USER_ID_HERE

Headers:
Authorization: Bearer PASTE_STUDENT_JWT_TOKEN_HERE

Example:
POST http://localhost:5000/api/mentorship/request/507f1f77bcf86cd799439012

Response: ✅ Mentorship request sent!
```

### Accept Mentorship (Mentor approves)
```
POST http://localhost:5000/api/mentorship/PASTE_MENTORSHIP_ID_HERE/accept

Headers:
Authorization: Bearer PASTE_MENTOR_JWT_TOKEN_HERE

Response: ✅ Mentorship accepted!
```

### Reject Mentorship (Mentor declines)
```
POST http://localhost:5000/api/mentorship/PASTE_MENTORSHIP_ID_HERE/reject

Headers:
Authorization: Bearer PASTE_MENTOR_JWT_TOKEN_HERE

Response: ✅ Mentorship request rejected
```

### Add Mentoring Session
```
POST http://localhost:5000/api/mentorship/PASTE_MENTORSHIP_ID_HERE/session

Headers:
Authorization: Bearer PASTE_MENTOR_JWT_TOKEN_HERE

{
  "duration": 60,
  "topic": "JavaScript Closures",
  "notes": "Student understood closures well. Will cover async next time."
}

Response: ✅ Session recorded
```

### Endorse Mentee (Mentor gives feedback)
```
POST http://localhost:5000/api/mentorship/PASTE_MENTORSHIP_ID_HERE/endorse

Headers:
Authorization: Bearer PASTE_MENTOR_JWT_TOKEN_HERE

{
  "rating": 5,
  "message": "Akshay is a dedicated learner with great potential!"
}

Response: ✅ Mentee endorsed successfully!
```

### Complete Mentorship
```
POST http://localhost:5000/api/mentorship/PASTE_MENTORSHIP_ID_HERE/complete

Headers:
Authorization: Bearer PASTE_MENTOR_JWT_TOKEN_HERE

Response: ✅ Mentorship completed!
```

### Remove Mentee (Mentor removes student)
```
DELETE http://localhost:5000/api/mentorship/PASTE_MENTORSHIP_ID_HERE/remove-mentee

Headers:
Authorization: Bearer PASTE_MENTOR_JWT_TOKEN_HERE

Response: ✅ Mentee removed successfully
```

---

## 📋 **COPY-PASTE READY EXAMPLES**

### Example 1: Complete Flow
```
1. Register:
   POST http://localhost:5000/api/users/register
   {"name":"Yash","email":"yash@test.com","password":"Yash@123"}
   ⬇️ Copy token from response

2. Create Quest:
   POST http://localhost:5000/api/quests
   {"title":"NodeJS","description":"Learn Node","requiredLevel":1,"contentType":"video","contentUrl":"http://url.com","difficulty":"easy","xpReward":100}
   ⬇️ Copy questId from response

3. Complete Quest:
   POST http://localhost:5000/api/quests/{questId}/complete
   Header: Authorization: Bearer {token}
   ⬇️ See XP earned!
```

### Example 2: Mentorship
```
1. Mentor Register & Become Mentor:
   POST http://localhost:5000/api/users/register
   {"name":"Priya","email":"priya@test.com","password":"Priya@123"}
   ⬇️ Complete 5 quests to reach Level 5
   
   POST http://localhost:5000/api/mentorship/become-mentor
   Header: Authorization: Bearer {token}

2. Student Request Mentorship:
   POST http://localhost:5000/api/mentorship/request/{mentorId}
   Header: Authorization: Bearer {studentToken}
   ⬇️ Copy mentorshipId

3. Mentor Accepts:
   POST http://localhost:5000/api/mentorship/{mentorshipId}/accept
   Header: Authorization: Bearer {mentorToken}

4. Add Session:
   POST http://localhost:5000/api/mentorship/{mentorshipId}/session
   Header: Authorization: Bearer {mentorToken}
   {"duration":45,"topic":"DSA","notes":"Covered arrays"}
```

---

## 🎯 **Header Template (Copy for all Protected Routes)**

```
Key: Authorization
Value: Bearer {YOUR_JWT_TOKEN_FROM_LOGIN}

Example:
Key: Authorization
Value: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## ⚠️ **Replace These Placeholders:**

| Placeholder | Source |
|-------------|--------|
| `PASTE_QUEST_ID_HERE` | From "Create Quest" response `_id` |
| `PASTE_YOUR_JWT_TOKEN_HERE` | From "Register" or "Login" response `token` |
| `PASTE_RECEIVER_USER_ID_HERE` | From another user's "Register" response `_id` |
| `PASTE_MESSAGE_ID_HERE` | From "Send Message" or "Get Messages" response `_id` |
| `PASTE_MENTOR_USER_ID_HERE` | From mentor's "Register" response `_id` |
| `PASTE_MENTORSHIP_ID_HERE` | From "Request Mentorship" response `_id` |

---

## ✅ **Success Responses**

```
Register:
{
  "_id": "507f...",
  "name": "Akshay",
  "email": "akshay@example.com",
  "level": 1,
  "xp": 100,
  "token": "eyJhbGc..."
}

Create Quest:
{
  "_id": "507f...",
  "title": "Learn JavaScript",
  "xpReward": 150,
  "requiredLevel": 1
}

Complete Quest:
{
  "message": "Quest completed successfully!",
  "xpEarned": 150,
  "totalXP": 250,
  "currentLevel": 1,
  "leveledUp": false
}
```

---

## 🚀 **Quick Test in 5 minutes:**

```
1. Register 2 users
2. Create 1 quest
3. Complete quest (earn XP)
4. Send message between users
5. Become mentor & request mentorship
```

Done! 🎉
