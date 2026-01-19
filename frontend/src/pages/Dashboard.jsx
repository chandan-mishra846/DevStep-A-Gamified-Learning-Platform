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
  const [activeTab, setActiveTab] = useState('quests');

  useEffect(() => {
    // Only redirect if auth loading is complete and no user exists
    if (!authLoading && !user) {
      const savedUser = localStorage.getItem('userInfo');
      if (!savedUser) {
        navigate('/login');
      }
    }
  }, [user, navigate, authLoading]);

  // Refresh user data when dashboard loads
  useEffect(() => {
    if (user && refreshUser) {
      refreshUser();
    }
  }, []);

  const handleRefresh = async () => {
    if (refreshUser) {
      await refreshUser();
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (authLoading || !user) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <p style={{ color: 'white', fontSize: '20px' }}>Loading...</p>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="dashboard">
        <Header user={user} onLogout={handleLogout} onRefresh={handleRefresh} />
        
        <div className="dashboard-container">
          <div className="sidebar">
            <nav className="nav-menu">
              <button
                className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => setActiveTab('profile')}
              >
                🙍 Profile
              </button>
              <button
                className={`nav-item ${activeTab === 'levels' ? 'active' : ''}`}
                onClick={() => setActiveTab('levels')}
              >
                📈 Levels
              </button>
              <button
                className={`nav-item ${activeTab === 'quests' ? 'active' : ''}`}
                onClick={() => setActiveTab('quests')}
              >
                📚 Quests
              </button>
              <button
                className={`nav-item ${activeTab === 'mentorship' ? 'active' : ''}`}
                onClick={() => setActiveTab('mentorship')}
              >
                🎓 Mentorship
              </button>
              <button
                className={`nav-item ${activeTab === 'messages' ? 'active' : ''}`}
                onClick={() => setActiveTab('messages')}
              >
                💬 Messages
              </button>
            </nav>
          </div>

          <div className="main-content">
            {activeTab === 'levels' && <LevelProgression user={user} />}
            {activeTab === 'profile' && <ProfilePage user={user} />}
            {activeTab === 'quests' && <QuestSection user={user} />}
            {activeTab === 'mentorship' && <MentorshipSection user={user} />}
            {activeTab === 'messages' && <MessageSection user={user} />}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
