import { useState, useEffect } from 'react';
import { AlertTriangle, Calendar as CalendarIcon, Clock, PlusCircle, FileText, Timer, ChevronRight, Sun } from 'lucide-react';
import './DashboardView.css';

export default function DashboardView({ 
  overdueCount, totalTasks, pendingTasks, examTasks, completedTasks, 
  subjectsList, tasks, formattedCurrentDate, darkMode, 
  setIsAddTaskOpen, setToDoSubFilter, setActiveTab, getSubjectColor, getPriorityColor 
}) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [user, setUser] = useState(null); // 👈 Added user state to fix the ReferenceError

  const API_URL = `${import.meta.env.VITE_API_URL}`;

  // Fetch logged-in user details from the backend
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch(`${API_URL}/api/auth/me`, {
          method: 'GET',
          credentials: 'include', // 👈 Sends the HTTP-only cookie for authentication
        });
        const data = await response.json();
        
        if (response.ok) {
          setUser(data.user);
        }
      } catch (err) {
        console.error('Failed to fetch user profile:', err);
      }
    };

    fetchUserProfile();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = currentTime.toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
  });

  return (
    <div className="dashboard-container">
      {overdueCount > 0 && (
        <div className={`alert-banner ${darkMode ? 'dark' : 'light'}`}>
          <AlertTriangle color="#DC2626" size={20} />
          <span>
            <strong>Attention Needed:</strong> You have <strong>{overdueCount} overdue</strong> requirement(s). Please review and complete them!
          </span>
        </div>
      )}

      {/* Main Welcome Banner */}
      <div className="welcome-banner">
        <div className="banner-content-left">
          <h1 className="banner-heading">Welcome back, {user?.name || 'Student'}!</h1>
          <p className="banner-sub">Stay organized and reach your academic goals today!</p>
        </div>
        
        <div className="banner-content-right">
          <div className="banner-time-badge">
            <CalendarIcon size={15} color="#1E293B" /> 
            <span>{formattedCurrentDate}</span>
            <span className="banner-time-separator">•</span>
            <Clock size={15} color="#1E293B" />
            <span className="banner-clock-text">{formattedTime}</span>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="stats-grid">
        <div className={`stat-card ${darkMode ? 'dark' : 'light'}`}>
          <span className={`stat-label ${darkMode ? 'dark' : 'light'}`}>Total Tasks</span>
          <p className="stat-value stat-value-total">{totalTasks}</p>
          <small className={`stat-sub ${darkMode ? 'dark' : 'light'}`}>{subjectsList.length} Active subjects</small>
        </div>
        <div className={`stat-card ${darkMode ? 'dark' : 'light'}`}>
          <span className={`stat-label ${darkMode ? 'dark' : 'light'}`}>Pending</span>
          <p className="stat-value stat-value-pending">{pendingTasks}</p>
          <small className={`stat-sub ${darkMode ? 'dark' : 'light'}`}>Needs attention</small>
        </div>
        <div className={`stat-card ${darkMode ? 'dark' : 'light'}`}>
          <span className={`stat-label ${darkMode ? 'dark' : 'light'}`}>Exams & Quizzes</span>
          <p className="stat-value stat-value-exam">{examTasks}</p>
          <small className={`stat-sub ${darkMode ? 'dark' : 'light'}`}>Major tests scheduled</small>
        </div>
        <div className={`stat-card ${darkMode ? 'dark' : 'light'}`}>
          <span className={`stat-label ${darkMode ? 'dark' : 'light'}`}>Completed</span>
          <p className="stat-value stat-value-completed">{completedTasks}</p>
          <small className={`stat-sub ${darkMode ? 'dark' : 'light'}`}>Finished assignments</small>
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="dashboard-main-grid">
        
        {/* Left Column: Recent Tasks */}
        <div className={`recent-tasks-card ${darkMode ? 'dark' : 'light'}`}>
          <h3 className={`card-title ${darkMode ? 'dark' : 'light'}`}>Recent Tasks Preview</h3>
          {tasks.length === 0 ? (
            <p className={`empty-task-text ${darkMode ? 'dark' : 'light'}`}>No active tasks found.</p>
          ) : (
            tasks.slice(0, 4).map(task => {
              const colorStyle = getSubjectColor(task.subject);
              const priorityColor = getPriorityColor(task.priority);
              return (
                <div key={task._id} className={`recent-task-item ${darkMode ? 'dark' : 'light'}`}>
                  <div className="recent-task-info">
                    <strong className={`recent-task-title ${darkMode ? 'dark' : 'light'}`}>{task.title}</strong> 
                    <span className="recent-task-subject-pill" style={{ color: colorStyle.text, backgroundColor: colorStyle.bg, borderColor: colorStyle.border }}>
                      {task.subject || 'General'}
                    </span>
                  </div>
                  <span className="recent-task-priority-pill" style={{ color: priorityColor, backgroundColor: `${priorityColor}15`, borderColor: `${priorityColor}30` }}>
                    {task.priority} Priority
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Quick Actions */}
        <div className={`quick-actions-card ${darkMode ? 'dark' : 'light'}`}>
          <h3 className={`card-title ${darkMode ? 'dark' : 'light'}`} style={{ marginBottom: '4px' }}>Quick Actions</h3>
          
          <div className="quick-actions-list">
            <button 
              onClick={() => setIsAddTaskOpen(true)}
              className={`action-btn-item ${darkMode ? 'dark' : 'light'}`}
            >
              <div className="action-btn-content">
                <PlusCircle size={18} color="#4B7B9D" />
                <span className={`action-btn-text ${darkMode ? 'dark' : 'light'}`}>Add Task</span>
              </div>
              <ChevronRight size={16} color="#4B7B9D" />
            </button>
            <button 
              onClick={() => { setToDoSubFilter('all'); setActiveTab('academics'); }}
              className={`action-btn-item ${darkMode ? 'dark' : 'light-alt'}`}
            >
              <div className="action-btn-content">
                <FileText size={18} color="#4B7B9D" />
                <span className={`action-btn-text ${darkMode ? 'dark' : 'light'}`}>View All Requirements</span>
              </div>
              <ChevronRight size={16} color="#4B7B9D" />
            </button>
            <button 
              onClick={() => setActiveTab('notes')}
              className={`action-btn-item ${darkMode ? 'dark' : 'light'}`}
            >
              <div className="action-btn-content">
                <Timer size={18} color="#4B7B9D" />
                <span className={`action-btn-text ${darkMode ? 'dark' : 'light'}`}>Study Notes</span>
              </div>
              <ChevronRight size={16} color="#4B7B9D" />
            </button>
          </div>

          <div className="promo-card">
            <Sun size={24} color="#4B7B9D" className="promo-icon" />
            <h4 className="promo-title">Keep it going!</h4>
            <p className="promo-desc">Organize your subjects to manage tasks efficiently.</p>
          </div>
        </div>

      </div>
    </div>
  );
}