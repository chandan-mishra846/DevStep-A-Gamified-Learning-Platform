import { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import '../styles/QuestSection.css';

export default function QuestSection({ user }) {
  const [quests, setQuests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    contentType: 'video',
    contentUrl: '',
    difficulty: 'easy',
    xpReward: 100,
    requiredLevel: 1
  });

  useEffect(() => {
    fetchQuests();
    // Debug: Check user data
    console.log('QuestSection - User Data:', {
      level: user?.level,
      role: user?.role,
      isMentor: user?.isMentor,
      canMentor: user?.canMentor,
      fullUser: user
    });
  }, [user]);

  const fetchQuests = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API_BASE_URL}/api/quests`);
      // Handle if data is array or has quests property
      const questsArray = Array.isArray(data) ? data : (data?.quests || []);
      console.log('===== FETCHED QUESTS =====');
      console.log('Total Quests:', questsArray.length);
      questsArray.forEach((q, index) => {
        console.log(`Quest ${index + 1}:`, {
          title: q.title,
          contentUrl: q.contentUrl,
          contentType: q.contentType,
          hasUrl: !!q.contentUrl,
          urlLength: q.contentUrl?.length || 0
        });
      });
      console.log('=========================');
      setQuests(questsArray);
    } catch (error) {
      console.error('Error fetching quests:', error);
      setQuests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQuest = async (e) => {
    e.preventDefault();
    try {
      const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
      const { data } = await axios.post(
        `${API_BASE_URL}/api/quests`, 
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setQuests([...quests, data]);
      setShowCreateForm(false);
      setFormData({
        title: '',
        description: '',
        contentType: 'video',
        contentUrl: '',
        difficulty: 'easy',
        xpReward: 100,
        requiredLevel: 1
      });
      alert('✅ Quest created successfully!');
    } catch (error) {
      console.error('Error creating quest:', error);
      const errorMsg = error.response?.data?.message || 'Failed to create quest';
      alert(`❌ ${errorMsg}`);
    }
  };

  const handleCompleteQuest = async (questId) => {
    try {
      const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
      
      console.log('=== Completing Quest ===');
      console.log('Quest ID:', questId);
      console.log('Token:', token ? 'Present' : 'Missing');
      
      const { data } = await axios.post(
        `${API_BASE_URL}/api/quests/${questId}/complete`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      console.log('Quest completion response:', data);
      
      // Update local user info
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      if (userInfo && data.totalXP !== undefined) {
        userInfo.xp = data.totalXP;
        userInfo.level = data.currentLevel;
        localStorage.setItem('userInfo', JSON.stringify(userInfo));
      }
      
      // Show success message
      let message = `🎉 Quest Completed!\n+${data.xpEarned} XP\nTotal XP: ${data.totalXP}`;
      if (data.leveledUp) {
        message += `\n\n🎊 LEVEL UP! You are now Level ${data.currentLevel}!`;
      }
      alert(message);
      
      // Refresh the page to see updated stats
      window.location.reload();
    } catch (error) {
      console.error('Error completing quest:', error);
      console.error('Error response:', error.response?.data);
      
      const errorMsg = error.response?.data?.message || 'Failed to complete quest';
      
      // Different alerts based on error type
      if (error.response?.status === 400 && errorMsg.includes('already completed')) {
        alert(`✅ ${errorMsg}\n\nYou've already earned XP for this quest!`);
      } else if (error.response?.status === 403) {
        alert(`🔒 ${errorMsg}\n\nLevel up to unlock this quest!`);
      } else if (error.response?.status === 401) {
        alert(`🔐 Authentication Error\n\nPlease log in again.`);
        localStorage.removeItem('userInfo');
        window.location.href = '/';
      } else {
        alert(`❌ ${errorMsg}`);
      }
    }
  };

  return (
    <div className="quest-section-modern">
      {/* Hero Header */}
      <div className="quest-hero">
        <div className="hero-content-quest">
          <div className="hero-text">
            <h1 className="hero-title">Quest Board</h1>
            <p className="hero-subtitle">Complete challenges, earn XP, and level up your skills</p>
          </div>
          {(user?.isMentor || user?.role === 'mentor' || user?.role === 'admin' || (user?.level >= 5)) ? (
            <button 
              className="btn-create-modern"
              onClick={() => setShowCreateForm(!showCreateForm)}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/>
              </svg>
              <span>{showCreateForm ? 'Cancel' : 'Create Quest'}</span>
            </button>
          ) : (
            <div className="mentor-info-card">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
              </svg>
              <span>Reach Level 5 to create quests</span>
            </div>
          )}
        </div>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="create-form-modern">
          <div className="form-header">
            <h3>Create New Quest</h3>
            <p>Design a challenge for the community</p>
          </div>
          
          <form onSubmit={handleCreateQuest}>
            <div className="form-section">
              <label className="form-label">Quest Title</label>
              <input
                type="text"
                className="form-input-modern"
                placeholder="Enter quest title..."
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="form-section">
              <label className="form-label">Description</label>
              <textarea
                className="form-textarea-modern"
                placeholder="Describe the quest objectives..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows="4"
                required
              ></textarea>
            </div>

            <div className="form-grid-modern">
              <div className="form-section">
                <label className="form-label">Content Type</label>
                <select
                  className="form-select-modern"
                  value={formData.contentType}
                  onChange={(e) => setFormData({ ...formData, contentType: e.target.value })}
                >
                  <option value="video">📹 Video</option>
                  <option value="article">📄 Article</option>
                  <option value="quiz">❓ Quiz</option>
                  <option value="project">💻 Project</option>
                </select>
              </div>

              <div className="form-section">
                <label className="form-label">Difficulty</label>
                <select
                  className="form-select-modern"
                  value={formData.difficulty}
                  onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                >
                  <option value="easy">🟢 Easy</option>
                  <option value="medium">🟡 Medium</option>
                  <option value="hard">🔴 Hard</option>
                </select>
              </div>

              <div className="form-section">
                <label className="form-label">XP Reward</label>
                <input
                  type="number"
                  className="form-input-modern"
                  placeholder="100"
                  value={formData.xpReward}
                  onChange={(e) => setFormData({ ...formData, xpReward: Number(e.target.value) })}
                  min="50"
                />
              </div>

              <div className="form-section">
                <label className="form-label">Required Level</label>
                <input
                  type="number"
                  className="form-input-modern"
                  placeholder="1"
                  value={formData.requiredLevel}
                  onChange={(e) => setFormData({ ...formData, requiredLevel: Number(e.target.value) })}
                  min="1"
                />
              </div>
            </div>

            <div className="form-section">
              <label className="form-label">Content URL</label>
              <input
                type="url"
                className="form-input-modern"
                placeholder="https://..."
                value={formData.contentUrl}
                onChange={(e) => setFormData({ ...formData, contentUrl: e.target.value })}
                required
              />
            </div>

            <button type="submit" className="btn-submit-modern">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
              </svg>
              Create Quest
            </button>
          </form>
        </div>
      )}

      {/* Quests Grid */}
      {loading ? (
        <div className="loading-modern">
          <div className="loading-spinner"></div>
          <p>Loading quests...</p>
        </div>
      ) : quests && quests.length > 0 ? (
        <div className="quests-grid-modern">
          {quests.map((quest) => {
            console.log('Quest Data:', quest); // Debug log
            const isLocked = user?.level < quest.requiredLevel;
            const difficultyIcons = {
              easy: '🟢',
              medium: '🟡',
              hard: '🔴'
            };

            return (
              <div 
                key={quest._id} 
                className={`quest-card-modern ${isLocked ? 'locked' : ''}`}
                onClick={() => {
                  if (isLocked) {
                    console.log('CARD CLICKED: Quest is locked.');
                    return;
                  }
                  if (!quest.contentUrl) {
                    console.log('CARD CLICKED: No content URL for this quest.');
                    return;
                  }
                  
                  console.log('CARD CLICKED: Preparing to open URL.');
                  console.log('Original URL:', quest.contentUrl);

                  let url = quest.contentUrl.trim();
                  if (!url.startsWith('http://') && !url.startsWith('https://')) {
                    url = `https://${url}`;
                    console.log('URL modified to:', url);
                  }
                  
                  try {
                    window.open(url, '_blank', 'noopener,noreferrer');
                    console.log('window.open called successfully for:', url);
                  } catch (e) {
                    console.error('Error calling window.open:', e);
                    alert('Could not open the link. Please check the console for errors.');
                  }
                }}
                style={{ cursor: !isLocked && quest.contentUrl ? 'pointer' : 'default' }}
              >
                {/* Card Header */}
                <div className="card-header-modern">
                  <div className="card-title-section">
                    <h3 className="card-title">{quest.title}</h3>
                    <span className={`difficulty-badge ${quest.difficulty}`}>
                      {difficultyIcons[quest.difficulty]} {quest.difficulty}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className="card-description">{quest.description}</p>

                {/* Meta Info */}
                <div className="card-meta-grid">
                  <div className="meta-card">
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/>
                    </svg>
                    <div>
                      <span className="meta-label">Level</span>
                      <span className="meta-value">{quest.requiredLevel}+</span>
                    </div>
                  </div>

                  <div className="meta-card">
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                    <div>
                      <span className="meta-label">Reward</span>
                      <span className="meta-value xp">{quest.xpReward} XP</span>
                    </div>
                  </div>

                  <div className="meta-card">
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd"/>
                    </svg>
                    <div>
                      <span className="meta-label">Type</span>
                      <span className="meta-value">{quest.contentType}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="card-actions">
                  <button
                    className={`btn-action-modern ${isLocked ? 'locked' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCompleteQuest(quest._id);
                    }}
                    disabled={isLocked}
                  >
                    {isLocked ? (
                      <>
                        <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
                        </svg>
                        Locked
                      </>
                    ) : (
                      <>
                        <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                        </svg>
                        Complete Quest
                      </>
                    )}
                  </button>
                </div>

                {isLocked && <div className="locked-overlay-quest"></div>}
              </div>
            );
          })}
        </div>
      ) : !loading ? (
        <div className="empty-state-modern">
          <svg width="64" height="64" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-.464 5.535a1 1 0 10-1.415-1.414 3 3 0 01-4.242 0 1 1 0 00-1.415 1.414 5 5 0 007.072 0z" clipRule="evenodd"/>
          </svg>
          <h3>No Quests Available</h3>
          <p>Be the first to create a quest and start the adventure!</p>
        </div>
      ) : null}
    </div>
  );
}
