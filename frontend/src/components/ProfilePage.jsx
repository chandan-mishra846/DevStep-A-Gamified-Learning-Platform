import '../styles/ProfilePage.css';

export default function ProfilePage({ user }) {
  const level = user?.level || 1;
  const xp = user?.xp || 0;
  const role = user?.role || 'student';

  const streak = user?.streak || { current: 3, best: 7, nextReward: 'Badge boost' };

  const menteeSlots = (() => {
    if (level >= 7) return 'Unlimited mentees';
    if (level >= 6) return 'Up to 5 mentees';
    if (level >= 5) return 'Up to 3 mentees';
    return 'Mentoring unlocks at Level 5';
  })();

  const levelBadges = [
    { level: 1, title: 'Novice', detail: 'Access basic quests', earned: level >= 1 },
    { level: 3, title: 'Streak Ready', detail: 'Streaks unlocked', earned: level >= 3 },
    { level: 5, title: 'Mentor', detail: 'Mentor up to 3 mentees', earned: level >= 5 },
    { level: 6, title: 'Senior Mentor', detail: 'Mentor up to 5 mentees', earned: level >= 6 },
    { level: 7, title: 'Community Lead', detail: 'Unlimited mentees', earned: level >= 7 },
  ];

  return (
    <div className="profile-page">
      <div className="profile-hero">
        <div className="avatar">{user?.name?.[0]?.toUpperCase() || 'U'}</div>
        <div className="info">
          <h2>{user?.name || 'Student'}</h2>
          <p className="meta">{user?.email || 'user@example.com'} • {role.toUpperCase()}</p>
          <div className="tags">
            <span className="tag">Level {level}</span>
            <span className="tag">{xp} XP</span>
            <span className="tag highlight">{menteeSlots}</span>
          </div>
        </div>
      </div>

      <div className="grid">
        <section className="card streak">
          <header>
            <h3>Streak</h3>
            <span className="pill">Best {streak.best} days</span>
          </header>
          <div className="streak-stats">
            <div>
              <div className="number">{streak.current}</div>
              <div className="label">Current Streak</div>
            </div>
            <div>
              <div className="number">{streak.best}</div>
              <div className="label">Best Streak</div>
            </div>
            <div>
              <div className="number">{streak?.nextReward || '—'}</div>
              <div className="label">Next Reward</div>
            </div>
          </div>
        </section>

        <section className="card badges">
          <header>
            <h3>Level Badges</h3>
            <span className="pill subtle">Updates as you level up</span>
          </header>
          <div className="badge-grid">
            {levelBadges.map(badge => (
              <div key={badge.level} className={`badge ${badge.earned ? 'earned' : 'locked'}`}>
                <div className="icon">{badge.earned ? '🏅' : '🔒'}</div>
                <div>
                  <div className="title">Level {badge.level}: {badge.title}</div>
                  <div className="subtitle">{badge.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
