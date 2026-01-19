import '../styles/Header.css';

export default function Header({ user, onLogout, onRefresh }) {
  // Level names mapping
  const getLevelName = (level) => {
    const levelNames = {
      1: "The Novice",
      2: "The Learner",
      3: "The Scholar",
      4: "The Expert",
      5: "The Mentor",
      6: "The Master",
      7: "The Grandmaster"
    };
    return levelNames[level] || "The Novice";
  };

  // Calculate XP progress based on level thresholds
  const getLevelThresholds = (level) => {
    const thresholds = [
      { level: 1, min: 0, max: 499 },
      { level: 2, min: 500, max: 1499 },
      { level: 3, min: 1500, max: 2999 },
      { level: 4, min: 3000, max: 4999 },
      { level: 5, min: 5000, max: 7999 },
      { level: 6, min: 8000, max: 11999 },
      { level: 7, min: 12000, max: 999999 }
    ];
    return thresholds.find(t => t.level === level) || thresholds[0];
  };

  const currentLevel = user?.level || 1;
  const currentXP = user?.xp || 0;
  const threshold = getLevelThresholds(currentLevel);
  const xpInCurrentLevel = currentXP - threshold.min;
  const xpNeededForNextLevel = threshold.max - threshold.min + 1;
  const xpProgress = (xpInCurrentLevel / xpNeededForNextLevel) * 100;
  const xpRemaining = threshold.max - currentXP + 1;

  return (
    <header className="header-modern">
      <div className="header-container">
        <div className="header-left">
          <div className="logo-modern">
            <span className="logo-icon">🎓</span>
            <div className="logo-text">
              <h1>Gamified Learning</h1>
              <p className="tagline">Level Up Your Skills</p>
            </div>
          </div>
        </div>

        <div className="header-center">
          <div className="level-card">
            <div className="level-badge-modern">
              <span className="level-number">{currentLevel}</span>
            </div>
            <div className="level-info">
              <span className="level-name">{getLevelName(currentLevel)}</span>
              <div className="xp-bar-container">
                <div className="xp-bar">
                  <div 
                    className="xp-bar-fill" 
                    style={{ width: `${Math.min(xpProgress, 100)}%` }}
                  >
                    <div className="xp-bar-shine"></div>
                  </div>
                </div>
                <div className="xp-text">
                  <span className="xp-current">{currentXP} XP</span>
                  {currentLevel < 7 && (
                    <span className="xp-next">{xpRemaining} to Level {currentLevel + 1}</span>
                  )}
                  {currentLevel === 7 && (
                    <span className="xp-next">Max Level! 🏆</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="header-right">
          <div className="user-card">
            <div className="user-avatar">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="user-details">
              <span className="user-name">{user?.name}</span>
              <span className="user-email">{user?.email}</span>
            </div>
          </div>
          
          <div className="header-actions">
            {onRefresh && (
              <button className="action-btn refresh" onClick={onRefresh} title="Refresh Data">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 2v6h-6M3 12a9 9 0 0 1 15-6.7L21 8M3 22v-6h6M21 12a9 9 0 0 1-15 6.7L3 16"/>
                </svg>
              </button>
            )}
            <button className="action-btn logout" onClick={onLogout}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
              </svg>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
