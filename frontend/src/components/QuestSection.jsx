import { useState, useEffect } from 'react';
import axios from 'axios';
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
  }, []);

  const fetchQuests = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('http://localhost:5000/api/quests');
      // Handle if data is array or has quests property
      const questsArray = Array.isArray(data) ? data : (data?.quests || []);
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
      const { data } = await axios.post('http://localhost:5000/api/quests', formData);
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
    } catch (error) {
      console.error('Error creating quest:', error);
      alert('Failed to create quest');
    }
  };

  const handleCompleteQuest = async (questId) => {
    try {
      const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
      const { data } = await axios.post(
        `http://localhost:5000/api/quests/${questId}/complete`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(`🎉 Quest Completed! +${data.xpEarned} XP`);
      // Refresh to see updated XP
      window.location.reload();
    } catch (error) {
      console.error('Error completing quest:', error);
      alert('Failed to complete quest');
    }
  };

  return (
    <div className="quest-section">
      <div className="section-header">
        <h2>📚 Quests</h2>
        {(user?.role === 'mentor' || user?.role === 'admin') ? (
          <button 
            className="btn-primary"
            onClick={() => setShowCreateForm(!showCreateForm)}
          >
            {showCreateForm ? '✖ Cancel' : '➕ Create Quest'}
          </button>
        ) : (
          <p className="role-message">
            💡 Reach Level 5 and become a Mentor to create quests!
          </p>
        )}
      </div>

      {showCreateForm && (
        <form onSubmit={handleCreateQuest} className="create-form">
          <input
            type="text"
            placeholder="Quest Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
          <textarea
            placeholder="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
          ></textarea>

          <div className="form-grid">
            <select
              value={formData.contentType}
              onChange={(e) => setFormData({ ...formData, contentType: e.target.value })}
            >
              <option>video</option>
              <option>article</option>
              <option>quiz</option>
              <option>project</option>
            </select>

            <select
              value={formData.difficulty}
              onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
            >
              <option>easy</option>
              <option>medium</option>
              <option>hard</option>
            </select>

            <input
              type="number"
              placeholder="XP Reward"
              value={formData.xpReward}
              onChange={(e) => setFormData({ ...formData, xpReward: Number(e.target.value) })}
              min="50"
            />

            <input
              type="number"
              placeholder="Required Level"
              value={formData.requiredLevel}
              onChange={(e) => setFormData({ ...formData, requiredLevel: Number(e.target.value) })}
              min="1"
            />
          </div>

          <input
            type="url"
            placeholder="Content URL"
            value={formData.contentUrl}
            onChange={(e) => setFormData({ ...formData, contentUrl: e.target.value })}
            required
          />

          <button type="submit" className="btn-success">Create Quest</button>
        </form>
      )}

      {loading ? (
        <p className="loading">Loading quests...</p>
      ) : quests && quests.length > 0 ? (
        <div className="quests-grid">
          {quests.map((quest) => (
            <div key={quest._id} className="quest-card">
              <div className="quest-header">
                <h3>{quest.title}</h3>
                <span className={`difficulty ${quest.difficulty}`}>
                  {quest.difficulty.toUpperCase()}
                </span>
              </div>

              <p className="quest-description">{quest.description}</p>

              <div className="quest-meta">
                <span className="meta-item">
                  📌 Level {quest.requiredLevel}+
                </span>
                <span className="meta-item">
                  ⭐ {quest.xpReward} XP
                </span>
                <span className="meta-item">
                  📱 {quest.contentType}
                </span>
              </div>

              <button
                className="btn-complete"
                onClick={() => handleCompleteQuest(quest._id)}
                disabled={user?.level < quest.requiredLevel}
              >
                {user?.level < quest.requiredLevel ? '🔒 Locked' : '✅ Complete'}
              </button>
            </div>
          ))}
        </div>
      ) : !loading ? (
        <p className="empty-state">No quests yet. Create one to get started! 🚀</p>
      ) : null}
    </div>
  );
}
