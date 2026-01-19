import { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import '../styles/MentorshipSection.css';

export default function MentorshipSection({ user }) {
  const [mentorships, setMentorships] = useState([]);
  const [isMentor, setIsMentor] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mentors, setMentors] = useState([]);
  const [showMentorList, setShowMentorList] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const token = JSON.parse(localStorage.getItem('userInfo'))?.token;

  useEffect(() => {
    fetchMentorships();
    fetchAvailableMentors();
  }, []);

  const fetchAvailableMentors = async () => {
    try {
      const { data } = await axios.get(
        `${API_BASE_URL}/api/mentorship/available`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const mentorsArray = Array.isArray(data) ? data : (data?.mentors || []);
      setMentors(mentorsArray);
    } catch (error) {
      console.error('Error fetching mentors:', error);
      setMentors([]);
    }
  };

  const fetchMentorships = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${API_BASE_URL}/api/mentorship`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const mentorshipsArray = Array.isArray(data) ? data : (data?.mentorships || []);
      setMentorships(mentorshipsArray);
      setIsMentor(user?.isMentor || mentorshipsArray.some(m => m.mentor?._id === user._id));
    } catch (error) {
      console.error('Error fetching mentorships:', error);
      setMentorships([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBecomeMentor = async () => {
    if (user?.level < 5) {
      alert('⚠️ You need to reach Level 5 to become a mentor!');
      return;
    }

    try {
      const { data } = await axios.post(
        `${API_BASE_URL}/api/mentorship/become-mentor`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      if (userInfo) {
        userInfo.isMentor = true;
        userInfo.canMentor = true;
        userInfo.mentorSlots = data.mentorSlots || 3;
        localStorage.setItem('userInfo', JSON.stringify(userInfo));
      }
      
      alert('🎓 You are now a Mentor! You can accept up to 3 mentees.');
      setIsMentor(true);
      window.location.reload();
    } catch (error) {
      console.error('Error:', error);
      const errorMsg = error.response?.data?.message || 'Failed to become mentor';
      alert(`❌ ${errorMsg}`);
    }
  };

  const handleRequestMentorship = async (mentorId) => {
    try {
      await axios.post(
        `${API_BASE_URL}/api/mentorship/request/${mentorId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('✅ Mentorship request sent!');
      fetchMentorships();
      setShowMentorList(false);
    } catch (error) {
      console.error('Error:', error);
      const errorMsg = error.response?.data?.message || 'Failed to request mentorship';
      alert(`❌ ${errorMsg}`);
    }
  };

  const handleRespondToRequest = async (requestId, action) => {
    try {
      await axios.put(
        `${API_BASE_URL}/api/mentorship/${requestId}/respond`,
        { action },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(action === 'accept' ? '✅ Request accepted!' : '❌ Request rejected');
      fetchMentorships();
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to respond to request');
    }
  };

  const myMentees = mentorships.filter(m => m.mentor?._id === user._id);
  const myMentors = mentorships.filter(m => m.mentee?._id === user._id);
  const pendingRequests = myMentees.filter(m => m.status === 'pending');

  return (
    <div className="mentorship-section-modern">
      {/* Hero Section */}
      <div className="mentorship-hero">
        <div className="hero-content-mentorship">
          <div className="hero-icon">🎓</div>
          <div>
            <h1 className="mentorship-title">Mentorship Program</h1>
            <p className="mentorship-subtitle">
              {isMentor || user?.isMentor 
                ? 'Guide others on their learning journey' 
                : 'Connect with experienced mentors to accelerate your growth'}
            </p>
          </div>
        </div>
        <div className="hero-actions">
          {!isMentor && !user?.isMentor && user?.level >= 5 && (
            <button className="btn-become-mentor" onClick={handleBecomeMentor}>
              <span className="btn-icon">👨‍🏫</span>
              Become a Mentor
            </button>
          )}
          {(isMentor || user?.isMentor) && (
            <div className="mentor-badge-large">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
              </svg>
              Verified Mentor
            </div>
          )}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="mentorship-stats">
        <div className="stat-card-mentorship">
          <div className="stat-icon-mentorship">👥</div>
          <div>
            <div className="stat-value-mentorship">{myMentees.length}</div>
            <div className="stat-label-mentorship">Active Mentees</div>
          </div>
        </div>
        <div className="stat-card-mentorship">
          <div className="stat-icon-mentorship">📚</div>
          <div>
            <div className="stat-value-mentorship">{myMentors.length}</div>
            <div className="stat-label-mentorship">My Mentors</div>
          </div>
        </div>
        <div className="stat-card-mentorship">
          <div className="stat-icon-mentorship">⏳</div>
          <div>
            <div className="stat-value-mentorship">{pendingRequests.length}</div>
            <div className="stat-label-mentorship">Pending Requests</div>
          </div>
        </div>
        <div className="stat-card-mentorship">
          <div className="stat-icon-mentorship">✅</div>
          <div>
            <div className="stat-value-mentorship">
              {mentorships.filter(m => m.status === 'accepted').length}
            </div>
            <div className="stat-label-mentorship">Active Connections</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mentorship-tabs">
        <button 
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`tab-btn ${activeTab === 'find' ? 'active' : ''}`}
          onClick={() => setActiveTab('find')}
        >
          Find Mentors
        </button>
        {(isMentor || user?.isMentor) && (
          <button 
            className={`tab-btn ${activeTab === 'requests' ? 'active' : ''}`}
            onClick={() => setActiveTab('requests')}
          >
            Requests {pendingRequests.length > 0 && <span className="badge-count">{pendingRequests.length}</span>}
          </button>
        )}
      </div>

      {/* Content */}
      <div className="mentorship-content">
        {activeTab === 'overview' && (
          <div className="overview-section">
            {loading ? (
              <div className="loading-state">Loading...</div>
            ) : (
              <>
                {myMentors.length > 0 && (
                  <div className="connections-section">
                    <h3 className="section-title">
                      <span className="title-icon">👨‍🏫</span>
                      My Mentors
                    </h3>
                    <div className="connections-grid">
                      {myMentors.map((m) => (
                        <div key={m._id} className="connection-card">
                          <div className="connection-header">
                            <div className="connection-avatar">
                              {m.mentor?.name?.[0]?.toUpperCase() || 'M'}
                            </div>
                            <div className="connection-info">
                              <h4>{m.mentor?.name || 'Unknown'}</h4>
                              <p className="connection-level">Level {m.mentor?.level} • {m.mentor?.currentLevelName}</p>
                            </div>
                            <span className={`status-pill status-${m.status}`}>
                              {m.status}
                            </span>
                          </div>
                          {m.status === 'accepted' && (
                            <div className="connection-stats">
                              <div className="connection-stat">
                                <span className="stat-icon-small">📖</span>
                                <span>{m.sessions?.length || 0} Sessions</span>
                              </div>
                              <button className="btn-message-mentor">Message</button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {myMentees.length > 0 && (
                  <div className="connections-section">
                    <h3 className="section-title">
                      <span className="title-icon">👥</span>
                      My Mentees
                    </h3>
                    <div className="connections-grid">
                      {myMentees.map((m) => (
                        <div key={m._id} className="connection-card">
                          <div className="connection-header">
                            <div className="connection-avatar mentee">
                              {m.mentee?.name?.[0]?.toUpperCase() || 'M'}
                            </div>
                            <div className="connection-info">
                              <h4>{m.mentee?.name || 'Unknown'}</h4>
                              <p className="connection-level">Level {m.mentee?.level} • {m.mentee?.currentLevelName}</p>
                            </div>
                            <span className={`status-pill status-${m.status}`}>
                              {m.status}
                            </span>
                          </div>
                          {m.status === 'pending' && (
                            <div className="request-actions">
                              <button
                                className="btn-accept-request"
                                onClick={() => handleRespondToRequest(m._id, 'accept')}
                              >
                                ✓ Accept
                              </button>
                              <button
                                className="btn-reject-request"
                                onClick={() => handleRespondToRequest(m._id, 'reject')}
                              >
                                ✕ Decline
                              </button>
                            </div>
                          )}
                          {m.status === 'accepted' && (
                            <div className="connection-stats">
                              <div className="connection-stat">
                                <span className="stat-icon-small">📖</span>
                                <span>{m.sessions?.length || 0} Sessions</span>
                              </div>
                              <button className="btn-message-mentor">Message</button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {mentorships.length === 0 && (
                  <div className="empty-state-modern">
                    <div className="empty-icon">📚</div>
                    <h3>No Mentorship Connections Yet</h3>
                    <p>
                      {isMentor || user?.isMentor 
                        ? 'Students will find you and send mentorship requests soon!' 
                        : 'Start by finding a mentor to guide you on your learning journey'}
                    </p>
                    {!isMentor && !user?.isMentor && (
                      <button 
                        className="btn-primary-modern"
                        onClick={() => setActiveTab('find')}
                      >
                        Find a Mentor
                      </button>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {activeTab === 'find' && (
          <div className="find-mentors-section">
            <div className="section-header-find">
              <h3 className="section-title">
                <span className="title-icon">🔍</span>
                Available Mentors
              </h3>
              <p className="section-description">Connect with experienced mentors to accelerate your learning</p>
            </div>
            
            {mentors.length > 0 ? (
              <div className="mentors-grid-modern">
                {mentors.map((mentor) => (
                  <div key={mentor._id} className="mentor-card-modern">
                    <div className="mentor-card-header">
                      <div className="mentor-avatar-large">
                        {mentor.name?.[0]?.toUpperCase() || 'M'}
                      </div>
                      <div className="mentor-badge-small">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                        </svg>
                      </div>
                    </div>
                    <div className="mentor-card-body">
                      <h4 className="mentor-name">{mentor.name}</h4>
                      <p className="mentor-level-badge">
                        Level {mentor.level} • {mentor.currentLevelName}
                      </p>
                      <div className="mentor-slots-info">
                        <span className="slots-icon">👥</span>
                        <span className="slots-text">
                          {mentor.mentorSlots - (mentor.activeMentees?.length || 0)} / {mentor.mentorSlots} slots available
                        </span>
                      </div>
                    </div>
                    <button
                      className="btn-request-modern"
                      onClick={() => handleRequestMentorship(mentor._id)}
                    >
                      Send Request
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state-modern">
                <div className="empty-icon">😔</div>
                <h3>No Mentors Available</h3>
                <p>Check back later or become a mentor yourself!</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'requests' && (isMentor || user?.isMentor) && (
          <div className="requests-section">
            <div className="section-header-find">
              <h3 className="section-title">
                <span className="title-icon">📬</span>
                Mentorship Requests
              </h3>
              <p className="section-description">Review and respond to mentorship requests</p>
            </div>

            {pendingRequests.length > 0 ? (
              <div className="requests-grid">
                {pendingRequests.map((m) => (
                  <div key={m._id} className="request-card">
                    <div className="request-header">
                      <div className="request-avatar">
                        {m.mentee?.name?.[0]?.toUpperCase() || 'S'}
                      </div>
                      <div className="request-info">
                        <h4>{m.mentee?.name || 'Unknown'}</h4>
                        <p className="request-level">Level {m.mentee?.level} • {m.mentee?.currentLevelName}</p>
                        <p className="request-date">
                          Requested {new Date(m.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="request-actions-bottom">
                      <button
                        className="btn-accept-full"
                        onClick={() => handleRespondToRequest(m._id, 'accept')}
                      >
                        ✓ Accept Request
                      </button>
                      <button
                        className="btn-decline-full"
                        onClick={() => handleRespondToRequest(m._id, 'reject')}
                      >
                        ✕ Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state-modern">
                <div className="empty-icon">✉️</div>
                <h3>No Pending Requests</h3>
                <p>You'll see new mentorship requests here</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

