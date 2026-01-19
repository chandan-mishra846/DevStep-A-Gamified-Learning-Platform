import { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config/api';
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
      const { data } = await axios.get(`${API_BASE_URL}/api/levels`);
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

  if (loading && levels.length === 0) return <p className="loading-modern">Loading level system...</p>;

  return (
    <div className="level-progression-modern">
      {/* Hero Section with Current Progress */}
      {userProgress ? (
        <div className="hero-progress-card">
          <div className="hero-content">
            <div className="hero-left">
              <div className="level-badge-hero">
                <div className="badge-glow"></div>
                <span className="badge-number">{userProgress.currentLevel}</span>
              </div>
              
              <div className="level-info-hero">
                <span className="level-label">CURRENT LEVEL</span>
                <h2 className="level-name-hero">{userProgress.levelInfo?.name}</h2>
                <p className="level-desc-hero">{userProgress.levelInfo?.description}</p>
              </div>
            </div>

            <div className="hero-right">
              <div className="xp-stats">
                <div className="xp-stat-item">
                  <span className="xp-label">Current XP</span>
                  <span className="xp-value">{(userProgress?.currentXP || 0).toLocaleString()}</span>
                </div>
                <div className="xp-divider"></div>
                <div className="xp-stat-item">
                  <span className="xp-label">Next Milestone</span>
                  <span className="xp-value">
                    {userProgress?.levelInfo?.maxXP === Infinity 
                      ? 'MAX' 
                      : (userProgress?.levelInfo?.maxXP || 0).toLocaleString()}
                  </span>
                </div>
              </div>

              {userProgress?.nextLevel && (
                <div className="next-level-info">
                  <span className="next-level-text">
                    🎯 {(userProgress?.xpToNext || 0).toLocaleString()} XP to reach
                  </span>
                  <span className="next-level-name">{userProgress?.nextLevel?.name}</span>
                </div>
              )}
            </div>
          </div>

          <div className="progress-section">
            <div className="progress-bar-modern">
              <div 
                className="progress-fill-modern"
                style={{ width: `${userProgress.progressPercentage}%` }}
              >
                <div className="progress-shine"></div>
              </div>
            </div>
            <div className="progress-labels">
              <span>{(userProgress?.progressPercentage || 0).toFixed(1)}% Complete</span>
              <span>{(userProgress?.xpToNext || 0).toLocaleString()} XP remaining</span>
            </div>
          </div>

          {/* Current Features Grid */}
          <div className="features-unlocked">
            <h3 className="features-title">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
              Unlocked Features
            </h3>
            <div className="features-grid">
              {userProgress.levelInfo?.features?.map((feature, idx) => (
                <div key={idx} className="feature-card">
                  <div className="feature-icon">✓</div>
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <p className="loading-modern">Loading your progress...</p>
      )}

      {/* Levels Roadmap */}
      <div className="roadmap-section">
        <div className="section-header">
          <h2 className="section-title">Level Roadmap</h2>
          <p className="section-subtitle">Your journey through mastery</p>
        </div>

        <div className="levels-grid-modern">
          {levels.map((level, idx) => {
            const isUnlocked = user?.level >= level.level;
            const isCurrent = user?.level === level.level;
            const isNext = user?.level + 1 === level.level;

            return (
              <div
                key={level.level}
                className={`level-card-modern ${isUnlocked ? 'unlocked' : 'locked'} ${isCurrent ? 'current' : ''} ${isNext ? 'next' : ''}`}
              >
                {isCurrent && (
                  <div className="current-indicator">
                    <span>CURRENT</span>
                  </div>
                )}
                
                <div className="level-card-header">
                  <div className="level-badge-card">
                    <span className="badge-level">LVL {level.level}</span>
                  </div>
                  <div className="lock-status">
                    {isUnlocked ? (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="icon-unlocked">
                        <path d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"/>
                      </svg>
                    ) : (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="icon-locked">
                        <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                      </svg>
                    )}
                  </div>
                </div>

                <h3 className="level-name-card">{level.name}</h3>

                <div className="xp-range-card">
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
                  </svg>
                  <span>
                    {(level?.minXP || 0).toLocaleString()} - {
                      level?.maxXP === Infinity 
                        ? '∞' 
                        : (level?.maxXP || 0).toLocaleString()
                    } XP
                  </span>
                </div>

                <ul className="features-list-modern">
                  {level.features?.slice(0, 4).map((feature, idx) => (
                    <li key={idx}>
                      <div className="feature-bullet"></div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {!isUnlocked && (
                  <div className="locked-overlay">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                    </svg>
                    <span>Locked</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="stats-dashboard">
        <h2 className="section-title">Your Statistics</h2>
        <div className="stats-grid-modern">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}>
              <svg width="24" height="24" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1zm0 3a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1zm0 3a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1z" clipRule="evenodd"/>
              </svg>
            </div>
            <div className="stat-content">
              <span className="stat-label">Current Level</span>
              <span className="stat-value">{user?.level || 1}</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
              <svg width="24" height="24" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
            </div>
            <div className="stat-content">
              <span className="stat-label">Total XP</span>
              <span className="stat-value">{(user?.xp || 0).toLocaleString()}</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
              <svg width="24" height="24" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
              </svg>
            </div>
            <div className="stat-content">
              <span className="stat-label">Completed Quests</span>
              <span className="stat-value">{user?.completedQuests?.length || 0}</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' }}>
              <svg width="24" height="24" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
              </svg>
            </div>
            <div className="stat-content">
              <span className="stat-label">Role</span>
              <span className="stat-value stat-value-small">{user?.role?.toUpperCase() || 'STUDENT'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
