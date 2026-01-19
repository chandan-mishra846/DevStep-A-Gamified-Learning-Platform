import '../styles/ProfilePage.css';

export default function ProfilePage({ user }) {
  const level = user?.level || 1;
  const xp = user?.xp || 0;
  const role = user?.role || 'student';
  const currentLevelName = user?.currentLevelName || 'The Novice';

  const streak = {
    current: user?.streakCount || 0,
    best: user?.longestStreak || 0,
    nextReward: user?.streakCount >= 7 ? '+100 XP Bonus' : 'Keep going!'
  };

  const messageCredits = user?.messageCredits || 10;
  const completedQuests = user?.completedQuests?.length || 0;
  const activeMentees = user?.activeMentees?.length || 0;

  const levelThresholds = [
    { level: 1, minXP: 0, maxXP: 499 },
    { level: 2, minXP: 500, maxXP: 1499 },
    { level: 3, minXP: 1500, maxXP: 2999 },
    { level: 4, minXP: 3000, maxXP: 4999 },
    { level: 5, minXP: 5000, maxXP: 7999 },
    { level: 6, minXP: 8000, maxXP: 11999 },
    { level: 7, minXP: 12000, maxXP: 999999 }
  ];

  const currentLevelData = levelThresholds.find(l => l.level === level);
  const xpProgress = currentLevelData 
    ? ((xp - currentLevelData.minXP) / (currentLevelData.maxXP - currentLevelData.minXP)) * 100 
    : 0;
  const xpNeeded = currentLevelData ? currentLevelData.maxXP - xp + 1 : 0;

  const levelBadges = [
    { level: 1, title: 'The Novice', icon: '🌱', detail: 'Begin your journey', earned: level >= 1 },
    { level: 2, title: 'The Architect', icon: '🏗️', detail: 'Master the logic', earned: level >= 2 },
    { level: 3, title: 'The Builder', icon: '🚀', detail: 'Ship real projects', earned: level >= 3 },
    { level: 4, title: 'The Marketer', icon: '📱', detail: 'Build your brand', earned: level >= 4 },
    { level: 5, title: 'The Scout', icon: '🎯', detail: 'Mentor others', earned: level >= 5 },
    { level: 6, title: 'The Gladiator', icon: '⚔️', detail: 'Battle ready', earned: level >= 6 },
    { level: 7, title: 'The Legend', icon: '👑', detail: 'You made it!', earned: level >= 7 },
  ];

  return (
    <div className="profile-page">
      {/* Hero Section */}
      <div className="profile-hero-card">
        <div className="hero-bg-gradient"></div>
        <div className="hero-content">
          <div className="profile-avatar-wrapper">
            <div className="avatar-large">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="level-badge-overlay">
              <span className="level-number">Lvl {level}</span>
            </div>
          </div>
          <div className="profile-info">
            <h1 className="profile-name">{user?.name || 'Student'}</h1>
            <p className="profile-title">{currentLevelName}</p>
            <p className="profile-meta">
              <span>{user?.email || 'user@example.com'}</span>
              <span className="separator">•</span>
              <span className="role-badge">{role.toUpperCase()}</span>
            </p>
            <div className="profile-badges">
              {user?.isMentor && (
                <span className="mentor-badge">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                  </svg>
                  Mentor
                </span>
              )}
              <span className="xp-badge">{xp.toLocaleString()} XP</span>
            </div>
          </div>
        </div>

        {/* XP Progress Bar */}
        {level < 7 && (
          <div className="xp-progress-section">
            <div className="xp-progress-header">
              <span className="xp-label">Level Progress</span>
              <span className="xp-remaining">{xpNeeded} XP to Level {level + 1}</span>
            </div>
            <div className="xp-progress-bar">
              <div className="xp-progress-fill" style={{width: `${Math.min(xpProgress, 100)}%`}}></div>
            </div>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="stats-grid-modern">
        <div className="stat-card">
          <div className="stat-icon">📚</div>
          <div className="stat-content">
            <div className="stat-value">{completedQuests}</div>
            <div className="stat-label">Quests Completed</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💬</div>
          <div className="stat-content">
            <div className="stat-value">{messageCredits}</div>
            <div className="stat-label">Message Credits</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <div className="stat-value">{activeMentees}</div>
            <div className="stat-label">Active Mentees</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🔥</div>
          <div className="stat-content">
            <div className="stat-value">{streak.current}</div>
            <div className="stat-label">Day Streak</div>
          </div>
        </div>
      </div>

      {/* Level Badges */}
      <div className="badges-section">
        <div className="section-header">
          <h3>🏆 Level Milestones</h3>
          <span className="badge-count">{levelBadges.filter(b => b.earned).length}/{levelBadges.length}</span>
        </div>
        <div className="badges-grid-modern">
          {levelBadges.map(badge => (
            <div key={badge.level} className={`milestone-card ${badge.earned ? 'earned' : 'locked'}`}>
              <div className="milestone-icon">{badge.icon}</div>
              <div className="milestone-content">
                <div className="milestone-title">{badge.title}</div>
                <div className="milestone-level">Level {badge.level}</div>
                <div className="milestone-detail">{badge.detail}</div>
              </div>
              {badge.earned && <div className="earned-checkmark">✓</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
