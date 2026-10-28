import { useState, useEffect } from 'react';
import axios from 'axios';

// Import Components
import Navbar from './components/Navbar';
import DashboardView from './components/DashboardView';
import AcademicsView from './components/AcademicsView';
import CalendarView from './components/CalendarView';
import NoteView from './components/NoteView';
import AIAssistant from './components/AIAssistant';
import { AddTaskModal, EditTaskModal, DeleteModal } from './components/TaskModals';
import Login from './Login';
import './App.css';
import { BookOpen, BookBookmark } from 'lucide-react';

const API_URL = `${import.meta.env.VITE_API_URL}/api/tasks`;
const AUTH_URL = `${import.meta.env.VITE_API_URL}/api/auth`;

axios.defaults.withCredentials = true;

const SUBJECT_COLORS = [
  { bg: '#EBF4FB', text: '#4B7B9D', border: '#A8C6E7' },
  { bg: '#FFF2C6', text: '#9E7412', border: '#FFE08A' },
  { bg: '#FEF2F2', text: '#DC2626', border: '#FECACA' },
  { bg: '#F3E8FF', text: '#7E22CE', border: '#E9D5FF' },
  { bg: '#ECFDF5', text: '#047857', border: '#A7F3D0' }
];

function App() {
  const [tasks, setTasks] = useState([]);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // New Layout Sub-filters & States
  const [toDoSubFilter, setToDoSubFilter] = useState('all'); 
  const [filterSubject, setFilterSubject] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('dueDate');
  const [darkMode, setDarkMode] = useState(false);
  
  const [calendarNotes, setCalendarNotes] = useState(localStorage.getItem('acadtrack_calendar_notes') || '');
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [taskType, setTaskType] = useState('Assignment');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [customMinutesInput, setCustomMinutesInput] = useState(25);
  const [pomodoroSeconds, setPomodoroSeconds] = useState(25 * 60);
  const [isPomodoroActive, setIsPomodoroActive] = useState(false);
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date());
  const [isEditing, setIsEditing] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);

  const formattedCurrentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => { setToastMessage(null); }, 3000);
  };

  // Check whether the student is already logged in
  useEffect(() => {
    let isMounted = true;
    axios.get(`${AUTH_URL}/me`)
      .then(response => {
        if (isMounted) setUser(response.data.user);
      })
      .catch(() => {
        if (isMounted) setUser(null);
      })
      .finally(() => {
        if (isMounted) setAuthLoading(false);
      });
    return () => { isMounted = false; };
  }, []);

  // Load tasks only after a login session is confirmed
  useEffect(() => {
    if (!user) {
      setTasks([]);
      return;
    }
    let isMounted = true;
    axios.get(API_URL)
      .then(response => { if (isMounted) setTasks(response.data); })
      .catch(error => console.error('Error fetching tasks:', error));
    return () => { isMounted = false; };
  }, [user]);

  const fetchTasksData = async () => {
    try {
      const response = await axios.get(API_URL);
      setTasks(response.data);
    } catch (error) { console.error('Error fetching tasks:', error); }
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${AUTH_URL}/logout`);
    } catch (error) {
      console.error("Logout request failed:", error);
    } finally {
      setUser(null);
      setTasks([]);
    }
  };

  const handleAccountDeleted = () => {
    setUser(null);
    setTasks([]);
  };

  useEffect(() => {
    if (!isPomodoroActive) return;
    if (pomodoroSeconds <= 0) {
      const timeout = setTimeout(() => {
        setIsPomodoroActive(false);
      }, 0);
      return () => clearTimeout(timeout);
    }
    const timer = setInterval(() => { setPomodoroSeconds((prev) => prev - 1); }, 1000);
    return () => clearInterval(timer);
  }, [isPomodoroActive, pomodoroSeconds]);

  const handleNotesChange = (e) => {
    const val = e.target.value;
    setCalendarNotes(val);
    localStorage.setItem('acadtrack_calendar_notes', val);
  };

  const formatPomodoroTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  const setCustomTimerMinutes = (mins) => {
    const m = Math.max(1, parseInt(mins) || 1);
    setCustomMinutesInput(m);
    setIsPomodoroActive(false);
    setPomodoroSeconds(m * 60);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      await axios.post(API_URL, { title, description, subject, dueDate, priority, taskType });
      setTitle(''); setDescription(''); setSubject(''); setDueDate('');
      setPriority('Medium'); setTaskType('Assignment');
      setIsAddTaskOpen(false);
      fetchTasksData();
      showToast(`✅ ${taskType} successfully added!`);
    } catch (error) { console.error('Error adding task:', error); }
  };

  const toggleComplete = async (id, currentStatus) => {
    try {
      await axios.put(`${API_URL}/${id}`, { completed: !currentStatus });
      fetchTasksData();
    } catch (error) { console.error('Error updating task:', error); }
  };

  const openDeleteModal = (task) => { setTaskToDelete(task); setIsDeleting(true); };

  const confirmDeleteTask = async () => {
    if (!taskToDelete) return;
    try {
      await axios.delete(`${API_URL}/${taskToDelete._id}`);
      setIsDeleting(false); setTaskToDelete(null);
      fetchTasksData();
    } catch (error) { console.error('Error deleting task:', error); }
  };

  const openEditModal = (task) => {
    let formattedDate = '';
    if (task.dueDate) {
      const d = new Date(task.dueDate);
      if (!isNaN(d.getTime())) formattedDate = d.toISOString().split('T')[0];
    }
    setCurrentTask({ ...task, dueDate: formattedDate, taskType: task.taskType || 'Assignment', notesLink: task.notesLink || '' });
    setIsEditing(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API_URL}/${currentTask._id}`, {
        title: currentTask.title, description: currentTask.description,
        subject: currentTask.subject, dueDate: currentTask.dueDate,
        priority: currentTask.priority, taskType: currentTask.taskType,
        notesLink: currentTask.notesLink, completed: currentTask.completed
      });
      setIsEditing(false); setCurrentTask(null);
      fetchTasksData();
    } catch (error) { console.error('Error updating task:', error); }
  };

  const getSubjectColor = (subjName) => {
    const name = subjName || 'General';
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return SUBJECT_COLORS[Math.abs(hash) % SUBJECT_COLORS.length];
  };

  const totalTasks = tasks.length;
  const pendingTasks = tasks.filter(t => !t.completed).length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const examTasks = tasks.filter(t => t.taskType && t.taskType.toLowerCase().includes('exam') && !t.completed).length;
  const rawSubjects = [...new Set(tasks.map(t => t.subject || 'General'))];
  const subjectsList = rawSubjects.map(subjName => ({ name: subjName, taskCount: tasks.filter(t => (t.subject || 'General') === subjName).length }));
  
  // Categorized lists required by the updated AcademicsView component
  const assignmentsList = tasks.filter(t => !t.taskType || t.taskType.toLowerCase() === 'assignment');
  const quizzesList = tasks.filter(t => t.taskType && t.taskType.toLowerCase() === 'quiz');
  const examsList = tasks.filter(t => t.taskType && t.taskType.toLowerCase() === 'exam');
  const projectsList = tasks.filter(t => t.taskType && t.taskType.toLowerCase() === 'project');

  const filteredToDos = tasks.filter((task) => {
    const tType = (task.taskType || 'assignment').toLowerCase();
    
    if (toDoSubFilter === 'assignment' && tType !== 'assignment') return false;
    if (toDoSubFilter === 'quiz' && tType !== 'quiz') return false;
    if (toDoSubFilter === 'exam' && tType !== 'exam') return false;
    if (toDoSubFilter === 'project' && tType !== 'project') return false;
    if (filterSubject !== 'all' && (task.subject || 'General') !== filterSubject) return false;
    if (filterPriority !== 'all' && task.priority !== filterPriority) return false;
    
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (task.subject && task.subject.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (filterStatus === 'pending') return matchesSearch && !task.completed;
    if (filterStatus === 'completed') return matchesSearch && task.completed;
    return matchesSearch;
  });

  const sortedToDos = [...filteredToDos].sort((a, b) => {
    if (sortBy === 'dueDate') {
      if (!a.dueDate) return 1; if (!b.dueDate) return -1;
      return new Date(a.dueDate) - new Date(b.dueDate);
    } else if (sortBy === 'priority') {
      const pOrder = { High: 1, Medium: 2, Low: 3 };
      return (pOrder[a.priority] || 2) - (pOrder[b.priority] || 2);
    } else if (sortBy === 'title') return a.title.localeCompare(b.title);
    return 0;
  });

  const getPriorityColor = (p) => p === 'High' ? '#DC2626' : p === 'Medium' ? '#7FA8D6' : '#FFE08A';

  const getDueDateStatus = (dueDate, completed) => {
    if (!dueDate) return null;
    if (completed) return { label: 'Completed', color: '#4B7B9D', bg: '#EBF4FB' };
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate); due.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
    const formattedString = dueDate.split('T')[0];
    if (diffDays < 0) return { label: `${formattedString} (Overdue)`, color: '#DC2626', bg: '#FEF2F2' };
    if (diffDays === 0) return { label: `${formattedString} (Due Today)`, color: '#B38108', bg: '#FFF2C6' };
    return { label: formattedString, color: '#4B7B9D', bg: '#EBF4FB' };
  };

  const overdueCount = tasks.filter(t => {
    if (t.completed || !t.dueDate) return false;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const due = new Date(t.dueDate); due.setHours(0, 0, 0, 0);
    return due < today;
  }).length;

  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const theme = {
    bg: darkMode ? '#1D2A3A' : '#FFF7D6',
    cardBg: darkMode ? '#2B3B4E' : '#FFFFFF',
    text: darkMode ? '#FFF7D6' : '#2D3748',
    subText: darkMode ? '#A8C6E7' : '#5A6B7C',
    border: darkMode ? '#3E5066' : '#FFE08A',
    primary: '#7FA8D6',
    accentYellow: '#FFE08A',
  };

  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif' }}>
        Checking login...
      </div>
    );
  }

  if (!user) {
    return <Login onAuthenticated={setUser} />;
  }

  return (
    <div 
      className={`app-container ${darkMode ? 'dark-bg' : 'light-bg'}`}
      style={{ color: theme.text }}
    >
      {toastMessage && (
        <div style={{ position: 'fixed', bottom: '25px', right: '25px', background: '#0f172a', color: '#ffffff', padding: '12px 20px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', fontSize: '14px', fontWeight: '600', zIndex: 2000 }}>
          {toastMessage}
        </div>
      )}

      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        setIsAddTaskOpen={setIsAddTaskOpen} 
        darkMode={darkMode} 
        setDarkMode={setDarkMode} 
        onProfileUpdated={(updatedUser) => setUser(updatedUser)}
        user={user}
        onLogout={handleLogout}
        onAccountDeleted={handleAccountDeleted}
        tasks={tasks}
        theme={theme}
      />

      <main className="app-main-content">
        <div className="app-scrollable-area">
          <div className={`app-view-container ${activeTab === 'dashboard' ? 'dashboard-view' : 'standard-view'}`}>
            
            {activeTab === 'dashboard' && (
              <DashboardView 
                overdueCount={overdueCount} totalTasks={totalTasks} pendingTasks={pendingTasks} examTasks={examTasks} completedTasks={completedTasks}
                subjectsList={subjectsList} tasks={tasks} formattedCurrentDate={formattedCurrentDate} theme={theme} darkMode={darkMode}
                setIsAddTaskOpen={setIsAddTaskOpen} setToDoSubFilter={setToDoSubFilter} setActiveTab={setActiveTab}
                getSubjectColor={getSubjectColor} getPriorityColor={getPriorityColor}
              />
            )}

            {activeTab === 'academics' && (
              <AcademicsView 
                toDoSubFilter={toDoSubFilter} setToDoSubFilter={setToDoSubFilter}
                assignmentsList={assignmentsList} quizzesList={quizzesList} examsList={examsList} projectsList={projectsList}
                searchTerm={searchTerm} setSearchTerm={setSearchTerm}
                filterSubject={filterSubject} setFilterSubject={setFilterSubject} filterPriority={filterPriority} setFilterPriority={setFilterPriority}
                filterStatus={filterStatus} setFilterStatus={setFilterStatus} rawSubjects={rawSubjects} sortBy={sortBy} setSortBy={setSortBy}
                sortedToDos={sortedToDos} tasks={tasks} theme={theme} darkMode={darkMode} getSubjectColor={getSubjectColor}
                getPriorityColor={getPriorityColor} getDueDateStatus={getDueDateStatus} toggleComplete={toggleComplete} openEditModal={openEditModal} openDeleteModal={openDeleteModal}
              />
            )}

            {activeTab === 'calendar' && (
              <CalendarView 
                currentMonthDate={currentMonthDate} setCurrentMonthDate={setCurrentMonthDate} year={year} month={month}
                daysInMonth={daysInMonth} firstDay={firstDay} monthNames={monthNames} tasks={tasks}
                calendarNotes={calendarNotes} handleNotesChange={handleNotesChange} theme={theme} darkMode={darkMode}
              />
            )}

            {activeTab === 'notes' && (
              <NoteView 
                tasks={tasks}
                customMinutesInput={customMinutesInput} 
                setCustomTimerMinutes={setCustomTimerMinutes}
                pomodoroSeconds={pomodoroSeconds} 
                formatPomodoroTime={formatPomodoroTime}
                isPomodoroActive={isPomodoroActive} 
                setIsPomodoroActive={setIsPomodoroActive} 
                theme={theme} 
                darkMode={darkMode}
              />
            )}

            {activeTab === 'ai' && (
              <AIAssistant
                theme={theme}
                darkMode={darkMode}
                tasks={tasks}
              />
            )}

          </div>
        </div>
      </main>

      <AddTaskModal 
        isAddTaskOpen={isAddTaskOpen} setIsAddTaskOpen={setIsAddTaskOpen} handleSubmit={handleSubmit}
        taskType={taskType} setTaskType={setTaskType} title={title} setTitle={setTitle}
        subject={subject} setSubject={setSubject} dueDate={dueDate} setDueDate={setDueDate}
        priority={priority} setPriority={setPriority} description={description} setDescription={setDescription} theme={theme}
      />

      <EditTaskModal 
        isEditing={isEditing} setIsEditing={setIsEditing} currentTask={currentTask}
        setCurrentTask={setCurrentTask} handleEditSubmit={handleEditSubmit} theme={theme}
      />

      <DeleteModal 
        isDeleting={isDeleting} setIsDeleting={setIsDeleting} taskToDelete={taskToDelete}
        confirmDeleteTask={confirmDeleteTask} theme={theme}
      />

      {/* Floating AI Chat Trigger Button */}
      <button
        type="button"
        onClick={() => setIsAIChatOpen((open) => !open)}
        aria-label={isAIChatOpen ? 'Close AI assistant' : 'Open AI assistant'}
        title="Academix AI"
        style={{
          position: 'fixed',
          right: '24px',
          bottom: '24px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          border: 'none',
          background: 'linear-gradient(135deg, #7FA8D6, #4B7B9D)',
          color: '#fff',
          fontSize: '28px',
          cursor: 'pointer',
          boxShadow: '0 8px 24px rgba(75, 123, 157, 0.35)',
          zIndex: 3000,
        }}
      >
        {isAIChatOpen ? '×' : <BookBookmark size={18} />}
      </button>

      {/* Floating AI Chat Panel */}
      {isAIChatOpen && (
        <div
          style={{
            position: 'fixed',
            right: '24px',
            bottom: '96px',
            width: 'min(420px, calc(100vw - 32px))',
            height: 'min(620px, calc(100vh - 130px))',
            background: theme.cardBg,
            color: theme.text,
            border: `1px solid ${theme.border}`,
            borderRadius: '18px',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.2)',
            overflowY: 'auto',
            padding: '16px',
            zIndex: 2999,
            boxSizing: 'border-box',
          }}
        >
          <AIAssistant
            theme={theme}
            darkMode={darkMode}
            tasks={tasks}
          />
        </div>
      )}

    </div>
  );
}

export default App;