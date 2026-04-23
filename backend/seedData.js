const dotenv = require('dotenv');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');
const Quest = require('./models/Quest');

dotenv.config();

const userSeeds = [
  { name: 'Level1 Student', email: 'level1@devstep.test', password: 'Test@1234', xp: 120, role: 'student' },
  { name: 'Level2 Student', email: 'level2@devstep.test', password: 'Test@1234', xp: 700, role: 'student' },
  { name: 'Level3 Student', email: 'level3@devstep.test', password: 'Test@1234', xp: 1800, role: 'student' },
  { name: 'Level4 Student', email: 'level4@devstep.test', password: 'Test@1234', xp: 3600, role: 'student' },
  { name: 'Level5 Mentor', email: 'level5@devstep.test', password: 'Test@1234', xp: 5600, role: 'mentor', isMentor: true, canMentor: true, mentorSlots: 3 },
  { name: 'Level6 Mentor', email: 'level6@devstep.test', password: 'Test@1234', xp: 9200, role: 'mentor', isMentor: true, canMentor: true, mentorSlots: 5 },
  { name: 'Admin User', email: 'admin@devstep.test', password: 'Admin@1234', xp: 13000, role: 'admin', isMentor: true, canMentor: true, mentorSlots: 5 }
];

const questSeeds = [
  {
    title: 'HTML Basics Review',
    description: 'Create a semantic HTML page and structure a simple profile layout.',
    requiredLevel: 1,
    contentType: 'article',
    contentUrl: 'https://developer.mozilla.org/en-US/docs/Learn/HTML/Introduction_to_HTML',
    difficulty: 'easy',
    xpReward: 120,
    orderIndex: 1
  },
  {
    title: 'Web Basics Quiz',
    description: 'Check your understanding of basic web technologies.',
    requiredLevel: 1,
    contentType: 'quiz',
    difficulty: 'easy',
    xpReward: 140,
    orderIndex: 2,
    quizSettings: { passingScore: 60, allowMultipleCorrect: false, shuffleOptions: false },
    quizQuestions: [
      {
        question: 'Which tag creates a hyperlink?',
        options: ['<div>', '<a>', '<h1>', '<ul>'],
        correctAnswer: 1
      },
      {
        question: 'CSS stands for?',
        options: ['Cascading Style Sheets', 'Creative Style Syntax', 'Computer Styled Sections', 'Color Style Sheets'],
        correctAnswer: 0
      }
    ]
  },
  {
    title: 'Git and GitHub Starter',
    description: 'Create a repository, commit changes, and push to GitHub.',
    requiredLevel: 1,
    contentType: 'article',
    contentUrl: 'https://docs.github.com/en/get-started/start-your-journey/hello-world',
    difficulty: 'easy',
    xpReward: 130,
    orderIndex: 2
  },
  {
    title: 'CSS Layout Practice',
    description: 'Build a responsive two-column layout using Flexbox and media queries.',
    requiredLevel: 2,
    contentType: 'project',
    contentUrl: 'https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Flexbox',
    difficulty: 'easy',
    xpReward: 180,
    orderIndex: 3
  },
  {
    title: 'Responsive Design Checklist',
    description: 'Apply breakpoints and test responsiveness on mobile-first layouts.',
    requiredLevel: 2,
    contentType: 'article',
    contentUrl: 'https://web.dev/responsive-web-design-basics/',
    difficulty: 'easy',
    xpReward: 200,
    orderIndex: 4
  },
  {
    title: 'DOM Interaction Practice',
    description: 'Build a small counter app using DOM events and updates.',
    requiredLevel: 2,
    contentType: 'project',
    contentUrl: 'https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Client-side_web_APIs/Manipulating_documents',
    difficulty: 'easy',
    xpReward: 220,
    orderIndex: 4
  },
  {
    title: 'JavaScript Fundamentals Quiz',
    description: 'Answer core JavaScript questions on scope, closures, and arrays.',
    requiredLevel: 3,
    contentType: 'quiz',
    difficulty: 'medium',
    xpReward: 260,
    orderIndex: 5,
    quizSettings: { passingScore: 65, allowMultipleCorrect: false, shuffleOptions: false },
    quizQuestions: [
      {
        question: 'Which method converts JSON string to object?',
        options: ['JSON.stringify', 'JSON.parse', 'parse.JSON', 'String.parse'],
        correctAnswer: 1
      },
      {
        question: 'Which value is falsy?',
        options: ['[]', '{}', '0', 'function(){}'],
        correctAnswer: 2
      }
    ]
  },
  {
    title: 'Async JavaScript Quest',
    description: 'Practice promises and async/await with API requests.',
    requiredLevel: 3,
    contentType: 'coding-challenge',
    contentUrl: 'https://javascript.info/async-await',
    difficulty: 'medium',
    xpReward: 280,
    orderIndex: 6
  },
  {
    title: 'React Components Task',
    description: 'Split a page into reusable React components with clean props.',
    requiredLevel: 4,
    contentType: 'project',
    contentUrl: 'https://react.dev/learn/your-first-component',
    difficulty: 'medium',
    xpReward: 340,
    orderIndex: 6
  },
  {
    title: 'Frontend Stack Quiz (Multi-Answer)',
    description: 'Select all valid frontend libraries and tooling choices.',
    requiredLevel: 4,
    contentType: 'quiz',
    difficulty: 'medium',
    xpReward: 360,
    orderIndex: 7,
    quizSettings: { passingScore: 70, allowMultipleCorrect: true, shuffleOptions: false },
    quizQuestions: [
      {
        question: 'Select frontend libraries/frameworks.',
        options: ['React', 'Vue', 'Express', 'Angular'],
        correctAnswers: [0, 1, 3],
        allowMultiple: true
      },
      {
        question: 'Select CSS solutions.',
        options: ['Tailwind CSS', 'MongoDB', 'Sass', 'Postman'],
        correctAnswers: [0, 2],
        allowMultiple: true
      }
    ]
  },
  {
    title: 'Node API Building',
    description: 'Implement a CRUD API with validation and proper status responses.',
    requiredLevel: 5,
    contentType: 'coding-challenge',
    contentUrl: 'https://expressjs.com/en/starter/installing.html',
    difficulty: 'hard',
    xpReward: 500,
    orderIndex: 8
  },
  {
    title: 'Backend Patterns Quiz',
    description: 'Validate your understanding of REST API and auth patterns.',
    requiredLevel: 5,
    contentType: 'quiz',
    difficulty: 'hard',
    xpReward: 520,
    orderIndex: 9,
    quizSettings: { passingScore: 70, allowMultipleCorrect: true, shuffleOptions: false },
    quizQuestions: [
      {
        question: 'Choose valid HTTP methods for REST updates.',
        options: ['PATCH', 'PUT', 'READ', 'UPDATE'],
        correctAnswers: [0, 1],
        allowMultiple: true
      },
      {
        question: 'Pick common auth mechanisms.',
        options: ['JWT', 'OAuth', 'PNG', 'Cookie Session'],
        correctAnswers: [0, 1, 3],
        allowMultiple: true
      }
    ]
  },
  {
    title: 'System Design Intro',
    description: 'Design a scalable feature and document architecture choices.',
    requiredLevel: 6,
    contentType: 'article',
    contentUrl: 'https://www.geeksforgeeks.org/system-design-tutorial/',
    difficulty: 'hard',
    xpReward: 650,
    orderIndex: 10
  },
  {
    title: 'Scalability Scenario Quiz',
    description: 'Answer architecture scenarios around scaling and availability.',
    requiredLevel: 6,
    contentType: 'quiz',
    difficulty: 'hard',
    xpReward: 680,
    orderIndex: 11,
    quizSettings: { passingScore: 75, allowMultipleCorrect: false, shuffleOptions: false },
    quizQuestions: [
      {
        question: 'Which database strategy often improves read scale?',
        options: ['Read replicas', 'Single point writes only', 'No indexes', 'No caching'],
        correctAnswer: 0
      },
      {
        question: 'What helps reduce API latency?',
        options: ['Caching', 'Removing CDN', 'Synchronous heavy jobs on request path', 'No compression'],
        correctAnswer: 0
      }
    ]
  },
  {
    title: 'Leadership and Mentoring',
    description: 'Review mentorship case studies and define a growth plan.',
    requiredLevel: 7,
    contentType: 'article',
    contentUrl: 'https://www.atlassian.com/blog/leadership/how-to-be-a-good-mentor',
    difficulty: 'medium',
    xpReward: 700,
    orderIndex: 12
  },
  {
    title: 'Mentor Readiness Quiz',
    description: 'Evaluate readiness for mentoring and leadership responsibilities.',
    requiredLevel: 7,
    contentType: 'quiz',
    difficulty: 'medium',
    xpReward: 720,
    orderIndex: 13,
    quizSettings: { passingScore: 80, allowMultipleCorrect: true, shuffleOptions: false },
    quizQuestions: [
      {
        question: 'Select traits of a strong mentor.',
        options: ['Empathy', 'Clear communication', 'Gatekeeping', 'Constructive feedback'],
        correctAnswers: [0, 1, 3],
        allowMultiple: true
      }
    ]
  }
];

const seed = async () => {
  try {
    await connectDB();

    for (const u of userSeeds) {
      const existing = await User.findOne({ email: u.email });
      if (!existing) {
        await User.create(u);
      } else {
        existing.name = u.name;
        existing.role = u.role;
        existing.xp = u.xp;
        existing.isMentor = !!u.isMentor;
        existing.canMentor = !!u.canMentor;
        existing.mentorSlots = u.mentorSlots || existing.mentorSlots;
        // Keep test credentials deterministic across reruns.
        existing.password = u.password;
        await existing.save();
      }
    }

    for (const q of questSeeds) {
      const existing = await Quest.findOne({ title: q.title });
      if (!existing) {
        await Quest.create(q);
      }
    }

    console.log('Seed completed. Test users and quests are ready.');
  } catch (error) {
    console.error('Seed failed:', error.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

seed();
