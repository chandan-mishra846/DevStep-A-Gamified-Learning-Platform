import { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/MentorshipSection.css';

export default function MentorshipSection({ user }) {
  const [mentorships, setMentorships] = useState([]);
  const [isMentor, setIsMentor] = useState(false);
  const [loading, setLoading] = useState(false);

  const token = JSON.parse(localStorage.getItem('userInfo'))?.token;

  useEffect(() => {
    fetchMentorships();
  }, []);

  const fetchMentorships = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        'http://localhost:5000/api/mentorship',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const mentorshipsArray = Array.isArray(data) ? data : (data?.mentorships || []);
      setMentorships(mentorshipsArray);
      setIsMentor(mentorshipsArray.some(m => m.mentorId === user._id));
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
      await axios.post(
        'http://localhost:5000/api/mentorship/become-mentor',
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('🎓 You are now a Mentor! You can accept up to 3 mentees.');
      setIsMentor(true);
      fetchMentorships();
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to become mentor');
    }
  };

  return (
    <div className="mentorship-section">
      <div className="section-header">
        <h2>🎓 Mentorship</h2>
        {!isMentor && user?.level >= 5 && (
          <button className="btn-primary" onClick={handleBecomeMentor}>
            👨‍🏫 Become Mentor
          </button>
        )}
        {isMentor && <span className="badge-mentor">✓ Mentor</span>}
      </div>

      {loading ? (
        <p className="loading">Loading mentorships...</p>
      ) : mentorships.length > 0 ? (
        <div className="mentorships-list">
          {mentorships.map((m) => (
            <div key={m._id} className="mentorship-card">
              <h3>
                {m.mentorId === user._id
                  ? `📚 Mentee: ${m.menteeId?.name}`
                  : `👨‍🏫 Mentor: ${m.mentorId?.name}`}
              </h3>
              <p>Status: <strong>{m.status}</strong></p>
              <p>Sessions: {m.sessions?.length || 0}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="empty-state">
          No mentorships yet. {isMentor ? 'Wait for mentee requests!' : 'Find a mentor to level up! 🚀'}
        </p>
      )}
    </div>
  );
}
