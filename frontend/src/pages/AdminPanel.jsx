import { useContext, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../config/api';
import { AuthContext } from '../contexts/AuthContext';
import '../styles/AdminPanel.css';

const defaultUserForm = {
  name: '',
  email: '',
  role: 'student',
  xp: 0,
  isMentor: false,
  canMentor: false,
  mentorSlots: 0
};
const defaultQuestForm = {
  title: '',
  description: '',
  contentType: 'article',
  contentUrl: '',
  difficulty: 'easy',
  requiredLevel: 1,
  xpReward: 100,
  quizQuestions: []
};

export default function AdminPanel() {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [quests, setQuests] = useState([]);
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [questSearch, setQuestSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [userForm, setUserForm] = useState(defaultUserForm);
  const [selectedQuest, setSelectedQuest] = useState(null);
  const [questForm, setQuestForm] = useState(defaultQuestForm);

  const createEmptyQuizQuestion = () => ({
    question: '',
    options: ['', ''],
    allowMultiple: false,
    correctAnswer: 0,
    correctAnswers: [],
    explanation: ''
  });

  const formatQuizQuestionsForApi = (questions) => {
    const formatted = (questions || [])
      .map((q) => {
        const options = (q.options || []).map((opt) => opt.trim()).filter(Boolean);
        if (!q.question?.trim() || options.length < 2) return null;
        if (q.allowMultiple) {
          const uniqueAnswers = Array.from(new Set((q.correctAnswers || []).map(Number).filter((idx) => idx >= 0 && idx < options.length)));
          if (uniqueAnswers.length === 0) return null;
          return {
            question: q.question.trim(),
            options,
            correctAnswers: uniqueAnswers,
            allowMultiple: true,
            explanation: q.explanation?.trim() || ''
          };
        }
        const correctAnswer = Number.isInteger(Number(q.correctAnswer)) ? Number(q.correctAnswer) : 0;
        if (correctAnswer < 0 || correctAnswer >= options.length) return null;
        return {
          question: q.question.trim(),
          options,
          correctAnswer,
          allowMultiple: false,
          explanation: q.explanation?.trim() || ''
        };
      })
      .filter(Boolean);
    return formatted;
  };

  const token = useMemo(() => JSON.parse(localStorage.getItem('userInfo'))?.token, []);
  const authHeaders = useMemo(() => ({ headers: { Authorization: `Bearer ${token}` } }), [token]);

  const clearStatus = () => setError('');

  const fetchStats = async () => {
    const { data } = await axios.get(`${API_BASE_URL}/api/users/admin/stats`, authHeaders);
    setStats(data);
  };

  const fetchUsers = async () => {
    const { data } = await axios.get(`${API_BASE_URL}/api/users/admin/users`, authHeaders);
    setUsers(data?.users || []);
  };

  const fetchQuests = async () => {
    const { data } = await axios.get(`${API_BASE_URL}/api/quests`);
    setQuests(data?.quests || []);
  };

  useEffect(() => {
    const loadAdminData = async () => {
      try {
        setLoading(true);
        clearStatus();
        await Promise.all([fetchStats(), fetchUsers(), fetchQuests()]);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load admin data.');
      } finally {
        setLoading(false);
      }
    };
    loadAdminData();
  }, []);

  const startEditUser = (user) => {
    clearStatus();
    setSelectedUser(user);
    setUserForm({
      name: user.name || '',
      email: user.email || '',
      role: user.role || 'student',
      xp: user.xp || 0,
      isMentor: !!user.isMentor,
      canMentor: !!user.canMentor,
      mentorSlots: user.mentorSlots || 0
    });
  };

  const saveUser = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    try {
      setSaving(true);
      clearStatus();
      await axios.put(`${API_BASE_URL}/api/users/admin/users/${selectedUser._id}`, userForm, authHeaders);
      setSelectedUser(null);
      setUserForm(defaultUserForm);
      await Promise.all([fetchUsers(), fetchStats()]);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update user.');
    } finally {
      setSaving(false);
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Delete this user account?')) return;
    try {
      clearStatus();
      await axios.delete(`${API_BASE_URL}/api/users/admin/users/${userId}`, authHeaders);
      await Promise.all([fetchUsers(), fetchStats()]);
      if (selectedUser?._id === userId) {
        setSelectedUser(null);
        setUserForm(defaultUserForm);
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to delete user.');
    }
  };

  const startEditQuest = (quest) => {
    clearStatus();
    setSelectedQuest(quest);
    setQuestForm({
      title: quest.title || '',
      description: quest.description || '',
      contentType: quest.contentType || 'article',
      contentUrl: quest.contentUrl || '',
      difficulty: quest.difficulty || 'easy',
      requiredLevel: quest.requiredLevel || 1,
      xpReward: quest.xpReward || 100,
      quizQuestions: Array.isArray(quest.quizQuestions)
        ? quest.quizQuestions.map((q) => ({
            question: q.question || '',
            options: Array.isArray(q.options) && q.options.length > 0 ? q.options : ['', ''],
            allowMultiple: !!q.allowMultiple || (Array.isArray(q.correctAnswers) && q.correctAnswers.length > 1),
            correctAnswer: Number.isInteger(q.correctAnswer) ? q.correctAnswer : 0,
            correctAnswers: Array.isArray(q.correctAnswers) ? q.correctAnswers : [],
            explanation: q.explanation || ''
          }))
        : []
    });
  };

  const resetQuestForm = () => {
    setSelectedQuest(null);
    setQuestForm(defaultQuestForm);
  };

  const createQuest = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      clearStatus();
      const payload = { ...questForm };
      if (payload.contentType === 'quiz') {
        payload.quizQuestions = formatQuizQuestionsForApi(payload.quizQuestions);
        if (payload.quizQuestions.length === 0) {
          setError('Add at least one valid quiz question with 2+ options and correct answer(s).');
          setSaving(false);
          return;
        }
        payload.quizSettings = { passingScore: 60, allowMultipleCorrect: true, shuffleOptions: false };
      }
      if (payload.contentType !== 'quiz') payload.quizQuestions = [];
      await axios.post(`${API_BASE_URL}/api/quests`, payload, authHeaders);
      resetQuestForm();
      await Promise.all([fetchQuests(), fetchStats()]);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to create quest.');
    } finally {
      setSaving(false);
    }
  };

  const saveQuest = async (e) => {
    e.preventDefault();
    if (!selectedQuest) return;
    try {
      setSaving(true);
      clearStatus();
      const payload = { ...questForm };
      if (payload.contentType === 'quiz') {
        payload.quizQuestions = formatQuizQuestionsForApi(payload.quizQuestions);
        if (payload.quizQuestions.length === 0) {
          setError('Add at least one valid quiz question with 2+ options and correct answer(s).');
          setSaving(false);
          return;
        }
        payload.quizSettings = { passingScore: 60, allowMultipleCorrect: true, shuffleOptions: false };
      }
      if (payload.contentType !== 'quiz') payload.quizQuestions = [];
      await axios.put(`${API_BASE_URL}/api/quests/${selectedQuest._id}`, payload, authHeaders);
      resetQuestForm();
      await fetchQuests();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update quest.');
    } finally {
      setSaving(false);
    }
  };

  const deleteQuest = async (questId) => {
    if (!window.confirm('Delete this quest?')) return;
    try {
      clearStatus();
      await axios.delete(`${API_BASE_URL}/api/quests/${questId}`, authHeaders);
      await Promise.all([fetchQuests(), fetchStats()]);
      if (selectedQuest?._id === questId) {
        resetQuestForm();
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to delete quest.');
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = userSearch.trim().toLowerCase();
    return !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || (u.role || '').toLowerCase().includes(q);
  });

  const filteredQuests = quests.filter((q) => {
    const term = questSearch.trim().toLowerCase();
    return !term || q.title.toLowerCase().includes(term) || (q.difficulty || '').toLowerCase().includes(term);
  });

  const handleAdminLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p>Manage users, quests, and platform operations.</p>
        </div>
        <div className="admin-header-actions">
          <button onClick={() => navigate('/dashboard')}>Back to App</button>
          <button className="danger" onClick={handleAdminLogout}>Logout</button>
        </div>
      </div>

      {error && <div className="admin-error">{error}</div>}

      <div className="admin-tabs">
        <button className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}>Overview</button>
        <button className={activeTab === 'users' ? 'active' : ''} onClick={() => setActiveTab('users')}>User Management</button>
        <button className={activeTab === 'content' ? 'active' : ''} onClick={() => setActiveTab('content')}>Quest Management</button>
      </div>

      {loading && <div className="admin-card">Loading admin data...</div>}

      {!loading && activeTab === 'overview' && (
        <div className="admin-overview-grid">
          <section className="admin-card stat">
            <h3>Total Users</h3>
            <p>{stats?.totalUsers || 0}</p>
          </section>
          <section className="admin-card stat">
            <h3>Total Quests</h3>
            <p>{stats?.totalQuests || 0}</p>
          </section>
          <section className="admin-card stat">
            <h3>Mentors</h3>
            <p>{stats?.mentors || 0}</p>
          </section>
          <section className="admin-card stat">
            <h3>Admins</h3>
            <p>{stats?.admins || 0}</p>
          </section>
          <section className="admin-card stat">
            <h3>Total XP Issued</h3>
            <p>{(stats?.totalXp || 0).toLocaleString()}</p>
          </section>
          <section className="admin-card">
            <h2>Recent Users</h2>
            <div className="admin-list">
              {users.slice(0, 6).map((u) => (
                <div key={u._id} className="admin-list-item">
                  <span>{u.name}</span>
                  <span>{u.role}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="admin-grid">
          <section className="admin-card">
            <h2>Users</h2>
            <input
              className="admin-search"
              placeholder="Search users by name, email, role"
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
            />
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Level</th>
                  <th>XP</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user._id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.role}</td>
                    <td>{user.level}</td>
                    <td>{user.xp}</td>
                    <td className="table-actions">
                      <button onClick={() => startEditUser(user)}>Edit</button>
                      <button className="danger" onClick={() => deleteUser(user._id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="admin-card">
            <h2>{selectedUser ? 'Edit User' : 'Select a user'}</h2>
            <form onSubmit={saveUser} className="admin-form">
              <label>Name</label>
              <input value={userForm.name} onChange={(e) => setUserForm({ ...userForm, name: e.target.value })} disabled={!selectedUser} required />
              <label>Email</label>
              <input type="email" value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} disabled={!selectedUser} required />
              <label>Role</label>
              <select value={userForm.role} onChange={(e) => setUserForm({ ...userForm, role: e.target.value })} disabled={!selectedUser}>
                <option value="student">student</option>
                <option value="mentor">mentor</option>
                <option value="admin">admin</option>
              </select>
              <label>XP</label>
              <input type="number" min="0" value={userForm.xp} onChange={(e) => setUserForm({ ...userForm, xp: Number(e.target.value) })} disabled={!selectedUser} />
              <label className="admin-check">
                <input type="checkbox" checked={userForm.isMentor} onChange={(e) => setUserForm({ ...userForm, isMentor: e.target.checked })} disabled={!selectedUser} />
                Is Mentor
              </label>
              <label className="admin-check">
                <input type="checkbox" checked={userForm.canMentor} onChange={(e) => setUserForm({ ...userForm, canMentor: e.target.checked })} disabled={!selectedUser} />
                Can Mentor
              </label>
              <label>Mentor Slots</label>
              <input type="number" min="0" max="5" value={userForm.mentorSlots} onChange={(e) => setUserForm({ ...userForm, mentorSlots: Number(e.target.value) })} disabled={!selectedUser} />
              <button type="submit" disabled={!selectedUser || saving}>{saving ? 'Saving...' : 'Save User'}</button>
            </form>
          </section>
        </div>
      )}

      {activeTab === 'content' && (
        <div className="admin-grid">
          <section className="admin-card">
            <h2>Quests</h2>
            <input
              className="admin-search"
              placeholder="Search quests by title or difficulty"
              value={questSearch}
              onChange={(e) => setQuestSearch(e.target.value)}
            />
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Difficulty</th>
                  <th>Level</th>
                  <th>XP</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredQuests.map((quest) => (
                  <tr key={quest._id}>
                    <td>{quest.title}</td>
                    <td>{quest.difficulty}</td>
                    <td>{quest.requiredLevel}</td>
                    <td>{quest.xpReward}</td>
                    <td className="table-actions">
                      <button onClick={() => startEditQuest(quest)}>Edit</button>
                      <button className="danger" onClick={() => deleteQuest(quest._id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="admin-card">
            <h2>{selectedQuest ? 'Edit Quest' : 'Create Quest'}</h2>
            <form onSubmit={selectedQuest ? saveQuest : createQuest} className="admin-form">
              <label>Title</label>
              <input value={questForm.title} onChange={(e) => setQuestForm({ ...questForm, title: e.target.value })} required />
              <label>Description</label>
              <textarea value={questForm.description} onChange={(e) => setQuestForm({ ...questForm, description: e.target.value })} required />
              <label>Content Type</label>
              <select
                value={questForm.contentType}
                onChange={(e) => {
                  const nextType = e.target.value;
                  setQuestForm({
                    ...questForm,
                    contentType: nextType,
                    quizQuestions: nextType === 'quiz'
                      ? (questForm.quizQuestions.length ? questForm.quizQuestions : [createEmptyQuizQuestion()])
                      : []
                  });
                }}
              >
                <option value="article">article</option>
                <option value="video">video</option>
                <option value="quiz">quiz</option>
                <option value="project">project</option>
                <option value="coding-challenge">coding-challenge</option>
              </select>
              <label>Content URL</label>
              <input value={questForm.contentUrl} onChange={(e) => setQuestForm({ ...questForm, contentUrl: e.target.value })} />
              <label>Difficulty</label>
              <select value={questForm.difficulty} onChange={(e) => setQuestForm({ ...questForm, difficulty: e.target.value })}>
                <option value="easy">easy</option>
                <option value="medium">medium</option>
                <option value="hard">hard</option>
              </select>
              <label>Required Level</label>
              <input type="number" min="1" max="7" value={questForm.requiredLevel} onChange={(e) => setQuestForm({ ...questForm, requiredLevel: Number(e.target.value) })} />
              <label>XP Reward</label>
              <input type="number" min="1" value={questForm.xpReward} onChange={(e) => setQuestForm({ ...questForm, xpReward: Number(e.target.value) })} />
              {questForm.contentType === 'quiz' && (
                <>
                  <label>Quiz Builder</label>
                  <div className="quiz-builder">
                    {(questForm.quizQuestions || []).map((question, qIndex) => (
                      <div key={qIndex} className="quiz-question-card">
                        <div className="quiz-question-head">
                          <strong>Question {qIndex + 1}</strong>
                          <button
                            type="button"
                            className="danger"
                            onClick={() =>
                              setQuestForm({
                                ...questForm,
                                quizQuestions: questForm.quizQuestions.filter((_, idx) => idx !== qIndex)
                              })
                            }
                          >
                            Remove
                          </button>
                        </div>
                        <input
                          placeholder="Question text"
                          value={question.question}
                          onChange={(e) => {
                            const updated = [...questForm.quizQuestions];
                            updated[qIndex] = { ...updated[qIndex], question: e.target.value };
                            setQuestForm({ ...questForm, quizQuestions: updated });
                          }}
                        />
                        <label className="admin-check">
                          <input
                            type="checkbox"
                            checked={question.allowMultiple}
                            onChange={(e) => {
                              const updated = [...questForm.quizQuestions];
                              updated[qIndex] = {
                                ...updated[qIndex],
                                allowMultiple: e.target.checked,
                                correctAnswers: e.target.checked ? (updated[qIndex].correctAnswers || []) : [],
                                correctAnswer: e.target.checked ? 0 : updated[qIndex].correctAnswer || 0
                              };
                              setQuestForm({ ...questForm, quizQuestions: updated });
                            }}
                          />
                          Multiple correct answers
                        </label>
                        {(question.options || []).map((opt, optIndex) => (
                          <div key={optIndex} className="quiz-option-row">
                            <input
                              placeholder={`Option ${optIndex + 1}`}
                              value={opt}
                              onChange={(e) => {
                                const updated = [...questForm.quizQuestions];
                                const options = [...updated[qIndex].options];
                                options[optIndex] = e.target.value;
                                updated[qIndex] = { ...updated[qIndex], options };
                                setQuestForm({ ...questForm, quizQuestions: updated });
                              }}
                            />
                            {question.allowMultiple ? (
                              <label className="admin-check">
                                <input
                                  type="checkbox"
                                  checked={(question.correctAnswers || []).includes(optIndex)}
                                  onChange={(e) => {
                                    const updated = [...questForm.quizQuestions];
                                    const current = new Set(updated[qIndex].correctAnswers || []);
                                    if (e.target.checked) current.add(optIndex);
                                    else current.delete(optIndex);
                                    updated[qIndex] = { ...updated[qIndex], correctAnswers: [...current] };
                                    setQuestForm({ ...questForm, quizQuestions: updated });
                                  }}
                                />
                                Correct
                              </label>
                            ) : (
                              <label className="admin-check">
                                <input
                                  type="radio"
                                  name={`correct-${qIndex}`}
                                  checked={Number(question.correctAnswer) === optIndex}
                                  onChange={() => {
                                    const updated = [...questForm.quizQuestions];
                                    updated[qIndex] = { ...updated[qIndex], correctAnswer: optIndex };
                                    setQuestForm({ ...questForm, quizQuestions: updated });
                                  }}
                                />
                                Correct
                              </label>
                            )}
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => {
                            const updated = [...questForm.quizQuestions];
                            updated[qIndex] = { ...updated[qIndex], options: [...updated[qIndex].options, ''] };
                            setQuestForm({ ...questForm, quizQuestions: updated });
                          }}
                        >
                          Add Option
                        </button>
                        <textarea
                          placeholder="Explanation (optional)"
                          value={question.explanation || ''}
                          onChange={(e) => {
                            const updated = [...questForm.quizQuestions];
                            updated[qIndex] = { ...updated[qIndex], explanation: e.target.value };
                            setQuestForm({ ...questForm, quizQuestions: updated });
                          }}
                        />
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() =>
                        setQuestForm({
                          ...questForm,
                          quizQuestions: [...(questForm.quizQuestions || []), createEmptyQuizQuestion()]
                        })
                      }
                    >
                      Add Question
                    </button>
                  </div>
                </>
              )}
              <button type="submit" disabled={saving}>{saving ? 'Saving...' : selectedQuest ? 'Save Quest' : 'Create Quest'}</button>
              {selectedQuest && (
                <button type="button" onClick={resetQuestForm}>Cancel Edit</button>
              )}
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
