import { useState, useEffect } from 'react';
import axios from 'axios';

// Import Components
import Navbar from './components/Navbar';
import DashboardView from './components/DashboardView';
import AcademicsView from './components/AcademicsView';
import CalendarView from './components/CalendarView';
import StudyView from './components/StudyView';
import { AddTaskModal, EditTaskModal, DeleteModal } from './components/TaskModals';
import Login from './Login';

const API_URL = 'http://localhost:5000/api/tasks';
const AUTH_URL = 'http://localhost:5000/api/auth';

axios.defaults.withCredentials = true;

// Color Palette for Subjects 
const SUBJECT_COLORS = [
  { bg: '#eff6ff', text: '#2563eb', border: '#bfdbfe' }, // Blue
  { bg: '#fef2f2', text: '#dc2626', border: '#fecaca' }, // Red
  { bg: '#f0fdf4', text: '#16a34a', border: '#bbf7d0' }, // Green
  { bg: '#faf5ff', text: '#9333ea', border: '#e9d5ff' }, // Purple
  { bg: '#fff7ed', text: '#ea580c', border: '#ffedd5' }, // Orange
  { bg: '#fefce8', text: '#ca8a04', border: '#fef08a' }  // Yellow
];

function App() {
  const [tasks, setTasks] = useState([]);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [workspaceSubView, setWorkspaceSubView] = useState('todos'); 
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
      if (isMounted) {
        setUser(response.data.user);
      }
    })
    .catch(() => {
      if (isMounted) {
        setUser(null);
      }
    })
    .finally(() => {
      if (isMounted) {
        setAuthLoading(false);
      }
    });

  return () => {
    isMounted = false;
  };
}, []);

// Load tasks only after a login session is confirmed
useEffect(() => {
  if (!user) {
    setTasks([]);
    return;
  }

  let isMounted = true;

  axios.get(API_URL)
    .then(response => {
      if (isMounted) {
        setTasks(response.data);
      }
    })
    .catch(error => {
      console.error('Error fetching tasks:', error);
    });

  return () => {
    isMounted = false;
  };
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
        showToast('🔔 Pomodoro session completed! Take a break.');
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
      showToast(`✅ ${taskType === 'Exam' ? 'Exam' : 'Assignment'} successfully added!`);
    } catch (error) { console.error('Error adding task:', error); }
  };

  const toggleComplete = async (id, currentStatus) => {
    try {
      await axios.put(`${API_URL}/${id}`, { completed: !currentStatus });
      fetchTasksData();
      showToast(currentStatus ? '🔄 Marked as pending' : '🎉 Marked as completed!');
    } catch (error) { console.error('Error updating task:', error); }
  };

  const openDeleteModal = (task) => { setTaskToDelete(task); setIsDeleting(true); };

  const confirmDeleteTask = async () => {
    if (!taskToDelete) return;
    try {
      await axios.delete(`${API_URL}/${taskToDelete._id}`);
      setIsDeleting(false); setTaskToDelete(null);
      fetchTasksData();
      showToast('🗑️ Entry removed successfully.');
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
      showToast('✏️ Task details updated!');
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

  const assignmentsList = tasks.filter(t => !t.taskType || !t.taskType.toLowerCase().includes('exam'));
  const examsList = tasks.filter(t => t.taskType && t.taskType.toLowerCase().includes('exam'));

  const filteredToDos = tasks.filter((task) => {
    const isExam = task.taskType && task.taskType.toLowerCase().includes('exam');
    if (toDoSubFilter === 'assignment' && isExam) return false;
    if (toDoSubFilter === 'exam' && !isExam) return false;
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

  const getPriorityColor = (p) => p === 'High' ? '#ef4444' : p === 'Medium' ? '#f59e0b' : '#10b981';

  const getDueDateStatus = (dueDate, completed) => {
    if (!dueDate) return null;
    if (completed) return { label: 'Completed', color: '#10b981', bg: '#f0fdf4' };
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate); due.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
    const formattedString = dueDate.split('T')[0];
    if (diffDays < 0) return { label: `${formattedString} (Overdue)`, color: '#dc2626', bg: '#fef2f2' };
    if (diffDays === 0) return { label: `${formattedString} (Due Today)`, color: '#ea580c', bg: '#fff7ed' };
    return { label: formattedString, color: '#64748b', bg: '#f1f5f9' };
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
    bg: darkMode ? '#0f172a' : '#fafafa',
    cardBg: darkMode ? '#1e293b' : '#ffffff',
    text: darkMode ? '#f8fafc' : '#1e293b',
    subText: darkMode ? '#94a3b8' : '#64748b',
    border: darkMode ? '#334155' : '#e2e8f0',
  };

  // Show a loading screen while checking the login session
if (authLoading) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      Checking login...
    </div>
  );
}

// Show the login/register page if the student is logged out
if (!user) {
  return <Login onAuthenticated={setUser} />;
}

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100vw', height: '100vh', margin: 0, padding: 0, overflow: 'hidden', fontFamily: 'Inter, sans-serif', boxSizing: 'border-box', position: 'fixed', top: 0, left: 0, background: theme.bg, color: theme.text }}>
      {toastMessage && <div style={{ position: 'fixed', bottom: '25px', right: '25px', background: '#0f172a', color: '#ffffff', padding: '12px 20px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', fontSize: '14px', fontWeight: '600', zIndex: 2000 }}>{toastMessage}</div>}

      
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
      />


      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', height: 'calc(100vh - 70px)', overflow: 'hidden', boxSizing: 'border-box' }}>
        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: 0, boxSizing: 'border-box', width: '100%' }}>
          <div style={{ padding: '30px 40px', maxWidth: '1200px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
            
            {activeTab === 'dashboard' && (
              <DashboardView 
                overdueCount={overdueCount} totalTasks={totalTasks} pendingTasks={pendingTasks} examTasks={examTasks} completedTasks={completedTasks}
                subjectsList={subjectsList} tasks={tasks} formattedCurrentDate={formattedCurrentDate} theme={theme} darkMode={darkMode}
                setIsAddTaskOpen={setIsAddTaskOpen} setWorkspaceSubView={setWorkspaceSubView} setToDoSubFilter={setToDoSubFilter} setActiveTab={setActiveTab}
                getSubjectColor={getSubjectColor} getPriorityColor={getPriorityColor}
              />
            )}

            {activeTab === 'academics' && (
              <AcademicsView 
                workspaceSubView={workspaceSubView} setWorkspaceSubView={setWorkspaceSubView} toDoSubFilter={toDoSubFilter} setToDoSubFilter={setToDoSubFilter}
                assignmentsList={assignmentsList} examsList={examsList} searchTerm={searchTerm} setSearchTerm={setSearchTerm}
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

            {activeTab === 'study' && (
              <StudyView 
                customMinutesInput={customMinutesInput} setCustomTimerMinutes={setCustomTimerMinutes}
                pomodoroSeconds={pomodoroSeconds} formatPomodoroTime={formatPomodoroTime}
                isPomodoroActive={isPomodoroActive} setIsPomodoroActive={setIsPomodoroActive} theme={theme} darkMode={darkMode}
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
    </div>
  );
}

export default App;