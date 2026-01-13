import { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/LevelProgression.css';

// Hardcoded level system as fallback
const LEVEL_SYSTEM = [
  {
    level: 1,
    name: "🔰 The Novice",
    minXP: 0,
    maxXP: 500,
    features: ["✅ Access basic quests", "📚 Start learning journey", "🏆 Earn first badges", "⭐ XP Range: 0-500"],
    description: "You are beginning your coding adventure!"
  },
  {
    level: 2,
    name: "⭐ The Learner",
    minXP: 500,
    maxXP: 1500,
    features: ["✅ Unlock intermediate quests", "💬 Start messaging users", "🎖️ Earn learning achievements", "⭐ XP Range: 500-1500"],
    description: "You're making solid progress!"
  },
  {
    level: 3,
    name: "🌟 The Scholar",
    minXP: 1500,
    maxXP: 3000,
    features: ["✅ Access advanced quests", "📈 Unlock streak tracking", "🎖️ Earn specialty badges", "⭐ XP Range: 1500-3000"],
    description: "You've become a true scholar!"
  },
  {
    level: 4,
    name: "💪 The Expert",
    minXP: 3000,
    maxXP: 5000,
    features: ["✅ Master-level quests available", "🔥 Unlock advanced features", "📊 Advanced analytics dashboard", "⭐ XP Range: 3000-5000"],
    description: "You are becoming an expert!"
  },
  {
    level: 5,
    name: "🎓 The Mentor",
    minXP: 5000,
    maxXP: 8000,
    features: ["✅ Create your own quests", "👨‍🏫 Become a mentor (3 mentees)", "📝 Design learning paths", "🏆 Earn mentor badges", "⭐ XP Range: 5000-8000"],
    description: "You can now guide others!"
  },
  {
    level: 6,
    name: "🚀 The Master",
    minXP: 8000,
    maxXP: 12000,
    features: ["✅ Create premium quests", "👥 Mentor up to 5 users", "🌟 Create learning communities", "🎯 Exclusive achievements", "⭐ XP Range: 8000-12000"],
    description: "You are a master of your craft!"
  },
  {
    level: 7,
    name: "👑 The Grandmaster",
    minXP: 12000,
    maxXP: Infinity,
    features: ["✅ Unlimited quest creation", "👥 Lead community programs", "💎 Exclusive recognition", "🏅 Hall of fame entry", "⭐ XP Range: 12000+"],
    description: "You are a legend in the community!"
  }
];

export default function LevelProgression({ user }) {
  const [levels, setLevels] = useState(LEVEL_SYSTEM);
  const [userProgress, setUserProgress] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLevels();
  }, []);

  useEffect(() => {
    if (user && levels.length > 0) {
      calculateProgress();
    }
  }, [user, levels]);

  const fetchLevels = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('http://localhost:5000/api/levels');
      const levelData = Array.isArray(data.levels) ? data.levels : data?.levels || [];
      if (levelData.length > 0) {
        setLevels(levelData);
      } else {
        setLevels(LEVEL_SYSTEM); // Use hardcoded fallback
      }
    } catch (error) {
      console.error('Error fetching levels:', error);
      setLevels(LEVEL_SYSTEM); // Use hardcoded fallback on error
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = () => {
    try {
      const currentLevel = user?.level || 1;
      const currentXP = user?.xp || 0;

      // Find current and next level
      const levelInfo = levels?.find(l => l?.level === currentLevel);
      const nextLevel = levels?.find(l => l?.level === currentLevel + 1);

      if (levelInfo) {
        const xpInCurrentLevel = currentXP - (levelInfo?.minXP || 0);
        const xpNeededForLevel = (levelInfo?.maxXP || 500) - (levelInfo?.minXP || 0);
        const progressPercentage = Math.min((xpInCurrentLevel / xpNeededForLevel) * 100, 100);

        setUserProgress({
          currentLevel,
          currentXP,
          levelInfo,
          nextLevel,
          progressPercentage,
          xpToNext: Math.max(0, (levelInfo?.maxXP || 500) - currentXP)
        });
      }
    } catch (error) {
      console.error('Error calculating progress:', error);
    }
  };

  if (loading && levels.length === 0) return <p className="loading">Loading level system...</p>;

  return (
    <div className="level-progression">
      <h2>🎮 Level Progression System</h2>

      {userProgress ? (
        <div className="current-progress">
          <div className="progress-header">
            <h3>{userProgress.levelInfo?.name}</h3>
            <p className="description">{userProgress.levelInfo?.description}</p>
          </div>

          <div className="progress-bar-container">
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${userProgress.progressPercentage}%` }}
              ></div>
            </div>
            <p className="progress-text">
              {userProgress.currentXP} XP / {userProgress.levelInfo?.maxXP} XP
            </p>
          </div>

          {userProgress.nextLevel && (
            <p className="xp-needed">
              🎯 {userProgress.xpToNext} XP to reach {userProgress.nextLevel.name}
            </p>
          )}

          <div className="current-features">
            <h4>✨ Your Current Features:</h4>
            <ul>
              {userProgress.levelInfo?.features?.map((feature, idx) => (
                <li key={idx}>{feature}</li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <p className="loading">Loading your progress...</p>
      )}

      <div className="all-levels">
        <h3>📊 All Levels Roadmap</h3>
        <div className="levels-timeline">
          {levels.map((level, idx) => {
            const isUnlocked = user?.level >= level.level;
            const isCurrent = user?.level === level.level;

            return (
              <div
                key={level.level}
                className={`level-card ${isUnlocked ? 'unlocked' : 'locked'} ${isCurrent ? 'current' : ''}`}
              >
                <div className="level-header">
                  <span className="level-number">Level {level.level}</span>
                  <span className={`lock-icon ${isUnlocked ? 'unlocked' : ''}`}>
                    {isUnlocked ? '🔓' : '🔒'}
                  </span>
                </div>

                <h4>{level.name}</h4>

                <p className="xp-range">
                  {level?.minXP ? level.minXP.toLocaleString() : 0} - {
                    level?.maxXP === Infinity 
                      ? '∞' 
                      : (level?.maxXP ? level.maxXP.toLocaleString() : 0)
                  } XP
                </p>

                <ul className="features">
                  {level.features?.map((feature, idx) => (
                    <li key={idx} className={isCurrent ? 'active' : ''}>
                      {feature}
                    </li>
                  ))}
                </ul>

                {isCurrent && <span className="current-badge">✓ Current</span>}
              </div>
            );
          })}
        </div>
      </div>

      <div className="quick-stats">
        <h3>📈 Your Stats</h3>
        <div className="stats-grid">
          <div className="stat-box">
            <span className="stat-label">Current Level</span>
            <span className="stat-value">{user?.level || 1}</span>
          </div>
          <div className="stat-box">
            <span className="stat-label">Total XP</span>
            <span className="stat-value">{user?.xp || 0}</span>
          </div>
          <div className="stat-box">
            <span className="stat-label">Completed Quests</span>
            <span className="stat-value">{user?.completedQuests?.length || 0}</span>
          </div>
          <div className="stat-box">
            <span className="stat-label">Role</span>
            <span className="stat-value">{user?.role?.toUpperCase() || 'STUDENT'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
