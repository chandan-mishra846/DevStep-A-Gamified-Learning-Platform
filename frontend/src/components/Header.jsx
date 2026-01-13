import '../styles/Header.css';

export default function Header({ user, onLogout }) {
  return (
    <header className="header">
      <div className="header-content">
        <div className="logo-section">
          <h1 className="logo">🎮 Gamified Learning</h1>
        </div>

        <div className="user-info">
          <div className="stats">
            <div className="stat">
              <span className="stat-label">Level</span>
              <span className="stat-value level-badge">{user?.level || 1}</span>
            </div>
            <div className="stat">
              <span className="stat-label">XP</span>
              <span className="stat-value">{user?.xp || 0}</span>
            </div>
            <div className="stat">
              <span className="stat-label">User</span>
              <span className="stat-value">{user?.name}</span>
            </div>
          </div>

          <button className="logout-btn" onClick={onLogout}>
            Logout
          </button>
        </div>
      </div>

      <div className="progress-bar">
        <div className="xp-progress">
          <div className="xp-fill" style={{ width: `${(user?.xp % 500) / 5}%` }}></div>
        </div>
        <small>XP Progress to Next Level</small>
      </div>
    </header>
  );
}
