import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import QuestSection from '../components/QuestSection';
import MentorshipSection from '../components/MentorshipSection';
import MessageSection from '../components/MessageSection';
import LevelProgression from '../components/LevelProgression';
import ProfilePage from '../components/ProfilePage';
import ErrorBoundary from '../components/ErrorBoundary';
import '../styles/Dashboard.css';

export default function Dashboard() {
  const { user, logout, loading: authLoading, refreshUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(() => {
    const saved = localStorage.getItem('dashboardActiveTab');
    return saved || 'profile';
  });
  const validTabs = new Set(['profile', 'levels', 'quests', 'mentorship', 'messages']);

  useEffect(() => {
    // Only redirect if auth loading is complete and no user exists
    if (!authLoading && !user) {
      const savedUser = localStorage.getItem('userInfo');
      if (!savedUser) {
        navigate('/login');
      }
    }
  }, [user, navigate, authLoading]);

  // Ensure stored tab is valid
  useEffect(() => {
    if (!validTabs.has(activeTab)) {
      setActiveTab('profile');
      localStorage.setItem('dashboardActiveTab', 'profile');
    }
  }, [activeTab]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const changeTab = (tab) => {
    setActiveTab(tab);
    localStorage.setItem('dashboardActiveTab', tab);
  };

  if (authLoading || !user) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f3f5f8' }}>
        <p style={{ color: '#6b7280', fontSize: '20px' }}>Loading...</p>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="dashboard">
        <Header user={user} onLogout={handleLogout} />
        
        <div className="dashboard-container">
          <div className="sidebar">
            <nav className="nav-menu">
              <button
                className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => changeTab('profile')}
              >
                Profile
              </button>
              <button
                className={`nav-item ${activeTab === 'levels' ? 'active' : ''}`}
                onClick={() => changeTab('levels')}
              >
                Levels
              </button>
              <button
                className={`nav-item ${activeTab === 'quests' ? 'active' : ''}`}
                onClick={() => changeTab('quests')}
              >
                Quests
              </button>
              <button
                className={`nav-item ${activeTab === 'mentorship' ? 'active' : ''}`}
                onClick={() => changeTab('mentorship')}
              >
                Mentorship
              </button>
              <button
                className={`nav-item ${activeTab === 'messages' ? 'active' : ''}`}
                onClick={() => changeTab('messages')}
              >
                Messages
              </button>
              {user?.role === 'admin' && (
                <button className="nav-item" onClick={() => navigate('/admin')}>
                  Admin Panel
                </button>
              )}
            </nav>
          </div>

          <div className="main-content">
            {activeTab === 'levels' && <LevelProgression user={user} />}
            {activeTab === 'profile' && <ProfilePage user={user} />}
            {activeTab === 'quests' && <QuestSection user={user} />}
            {activeTab === 'mentorship' && (
              <MentorshipSection
                user={user}
                onMessageUser={(targetUser) => {
                  try {
                    localStorage.setItem('messageTargetUser', JSON.stringify(targetUser));
                  } catch {
                    // ignore
                  }
                  setActiveTab('messages');
                }}
              />
            )}
            {activeTab === 'messages' && <MessageSection user={user} />}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
