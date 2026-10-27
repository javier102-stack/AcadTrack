import { useState } from 'react';
import { 
  CheckSquare, HelpCircle, FileText, FolderGit2, Search, Clock, 
  CheckCircle, Edit3, Trash2, LayoutGrid, List
} from 'lucide-react';
import './AcademicsView.css';

export default function AcademicsView({ 
  toDoSubFilter, setToDoSubFilter,
  assignmentsList, quizzesList, examsList, projectsList, searchTerm, setSearchTerm, filterSubject, setFilterSubject,
  filterPriority, setFilterPriority, filterStatus, setFilterStatus, rawSubjects,
  sortBy, setSortBy, sortedToDos, tasks, theme, darkMode,
  getSubjectColor, getPriorityColor, getDueDateStatus, toggleComplete, openEditModal, openDeleteModal
}) {
  const [viewMode, setViewMode] = useState('table');

  const handleResetFilters = () => {
    setToDoSubFilter('all');
    setSearchTerm('');
    setFilterSubject('all');
    setFilterPriority('all');
    setFilterStatus('all');
  };

  const getTypeBadgeClass = (taskType) => {
    const t = (taskType || 'Assignment').toLowerCase();
    if (t.includes('quiz')) return 'type-quiz';
    if (t.includes('exam')) return 'type-exam';
    if (t.includes('project')) return 'type-project';
    return 'type-assignment';
  };

  const getTypeBadgeLabel = (taskType) => {
    const t = (taskType || 'Assignment').toLowerCase();
    if (t.includes('quiz')) return 'Quiz';
    if (t.includes('exam')) return 'Exam';
    if (t.includes('project')) return 'Project';
    return 'Assignment';
  };

  return (
    <div className="academics-wrapper">
      <div className="academics-grid">
        
        {/* LEFT SIDEBAR: 4 Vertical Cards */}
        <div className="academics-sidebar">
          
          {/* Assignments Card */}
          <div 
            onClick={() => setToDoSubFilter(toDoSubFilter === 'assignment' ? 'all' : 'assignment')}
            className={`sidebar-card ${toDoSubFilter === 'assignment' ? 'assignment-active' : (darkMode ? 'assignment-dark' : 'assignment-light')}`}
          >
            <div className="sidebar-card-header">
              <CheckSquare size={20} color="#0284c7" />
              <span className="sidebar-card-badge badge-assignment">
                {assignmentsList.filter(a => !a.completed).length} Active
              </span>
            </div>
            <h4 className="sidebar-card-title title-assignment">Assignments</h4>
            <p className="sidebar-card-desc desc-assignment">Homeworks & tasks.</p>
          </div>

          {/* Quizzes Card */}
          <div 
            onClick={() => setToDoSubFilter(toDoSubFilter === 'quiz' ? 'all' : 'quiz')}
            className={`sidebar-card ${toDoSubFilter === 'quiz' ? 'quiz-active' : (darkMode ? 'quiz-dark' : 'quiz-light')}`}
          >
            <div className="sidebar-card-header">
              <HelpCircle size={20} color="#9333ea" />
              <span className="sidebar-card-badge badge-quiz">
                {quizzesList.filter(q => !q.completed).length} Active
              </span>
            </div>
            <h4 className="sidebar-card-title title-quiz">Quizzes</h4>
            <p className="sidebar-card-desc desc-quiz">Short tests & checkups.</p>
          </div>

          {/* Exams Card */}
          <div 
            onClick={() => setToDoSubFilter(toDoSubFilter === 'exam' ? 'all' : 'exam')}
            className={`sidebar-card ${toDoSubFilter === 'exam' ? 'exam-active' : (darkMode ? 'exam-dark' : 'exam-light')}`}
          >
            <div className="sidebar-card-header">
              <FileText size={20} color="#d97706" />
              <span className="sidebar-card-badge badge-exam">
                {examsList.filter(e => !e.completed).length} Scheduled
              </span>
            </div>
            <h4 className="sidebar-card-title title-exam">Exams</h4>
            <p className="sidebar-card-desc desc-exam">Major assessments.</p>
          </div>

          {/* Projects Card */}
          <div 
            onClick={() => setToDoSubFilter(toDoSubFilter === 'project' ? 'all' : 'project')}
            className={`sidebar-card ${toDoSubFilter === 'project' ? 'project-active' : (darkMode ? 'project-dark' : 'project-light')}`}
          >
            <div className="sidebar-card-header">
              <FolderGit2 size={20} color="#16a34a" />
              <span className="sidebar-card-badge badge-project">
                {projectsList.filter(p => !p.completed).length} Active
              </span>
            </div>
            <h4 className="sidebar-card-title title-project">Projects</h4>
            <p className="sidebar-card-desc desc-project">Term projects & labs.</p>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="academics-main">
          
          <div className="academics-top-bar">
            <div className="search-container">
              <button onClick={handleResetFilters} className="btn-all-reqs">
                <CheckSquare size={16} /> All Requirements ({tasks.length})
              </button>
              
              <div className={`search-box ${darkMode ? 'dark' : 'light'}`}>
                <Search size={16} color={theme.subText} />
                <input
                  type="text"
                  placeholder="Search tasks, subjects, or keywords..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`search-input ${darkMode ? 'dark' : 'light'}`}
                />
              </div>
            </div>

            <div className="filters-group">
              <select 
                value={filterSubject} 
                onChange={(e) => setFilterSubject(e.target.value)}
                className={`filter-select ${darkMode ? 'dark' : 'light'}`}
              >
                <option value="all">All Subjects</option>
                {rawSubjects.map((subj, idx) => (
                  <option key={idx} value={subj}>{subj}</option>
                ))}
              </select>

              <select 
                value={filterPriority} 
                onChange={(e) => setFilterPriority(e.target.value)}
                className={`filter-select ${darkMode ? 'dark' : 'light'}`}
              >
                <option value="all">All Priorities</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>

              <select 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)}
                className={`filter-select ${darkMode ? 'dark' : 'light'}`}
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>

              <div className={`view-switcher ${darkMode ? 'dark' : 'light'}`}>
                <button 
                  onClick={() => setViewMode('table')} 
                  className={`view-btn ${viewMode === 'table' ? (darkMode ? 'active-dark' : 'active-light') : (darkMode ? 'inactive-dark' : 'inactive-light')}`}
                >
                  <List size={14} /> Table
                </button>
                <button 
                  onClick={() => setViewMode('grid')} 
                  className={`view-btn ${viewMode === 'grid' ? (darkMode ? 'active-dark' : 'active-light') : (darkMode ? 'inactive-dark' : 'inactive-light')}`}
                >
                  <LayoutGrid size={14} /> Grid
                </button>
              </div>
            </div>
          </div>

          <div className="academics-sort-bar">
            <small style={{ color: theme.subText, fontWeight: 'bold' }}>Showing {sortedToDos.length} of {tasks.length} tasks</small>
            <div className="sort-select-wrapper">
              <span className="sort-label-text" style={{ color: theme.subText }}>Sort by:</span>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className={`filter-select sort-select-custom ${darkMode ? 'dark' : 'light'}`}
              >
                <option value="dueDate">Due Date</option>
                <option value="priority">Priority</option>
                <option value="title">Title</option>
              </select>
            </div>
          </div>

          {sortedToDos.length === 0 ? (
            <div className={`empty-state ${darkMode ? 'dark' : 'light'}`}>
              <p className="empty-state-text" style={{ color: theme.subText }}>No requirements found under this view.</p>
            </div>
          ) : viewMode === 'table' ? (
            <div className={`table-wrapper ${darkMode ? 'dark' : 'light'}`}>
              <table className="academics-table">
                <thead>
                  <tr className={`table-header-row ${darkMode ? 'dark' : 'light'}`}>
                    <th className="th-cell th-status">Status</th>
                    <th className="th-cell">Task Name & Details</th>
                    <th className="th-cell">Type</th>
                    <th className="th-cell">Subject</th>
                    <th className="th-cell">Priority</th>
                    <th className="th-cell">Due Date</th>
                    <th className="th-cell th-progress">Progress</th>
                    <th className="th-cell th-actions">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedToDos.map((task) => {
                    const statusBadge = getDueDateStatus(task.dueDate, task.completed);
                    const colorStyle = getSubjectColor(task.subject);
                    const typeClass = getTypeBadgeClass(task.taskType);
                    const typeLabel = getTypeBadgeLabel(task.taskType);
                    const progressVal = task.completed ? 100 : (typeLabel !== 'Assignment' ? 0 : 50);
                    return (
                      <tr key={task._id} className={`td-cell-row ${darkMode ? 'dark' : 'light'}`} style={{ opacity: task.completed ? 0.6 : 1 }}>
                        <td className="td-cell">
                          <input 
                            type="checkbox" 
                            checked={task.completed} 
                            onChange={() => toggleComplete(task._id, task.completed)}
                            className="task-checkbox"
                          />
                        </td>
                        <td className="td-cell">
                          <div className={`task-title-text ${task.completed ? 'task-title-completed' : ''}`} style={{ color: theme.text }}>{task.title}</div>
                          <div className="task-desc-text" style={{ color: theme.subText }}>
                            {task.description || 'No description'}
                          </div>
                        </td>
                        <td className="td-cell">
                          <span className={`badge-pill ${typeClass}`}>
                            {typeLabel}
                          </span>
                        </td>
                        <td className="td-cell">
                          <span className="subject-pill" style={{ background: colorStyle.bg, color: colorStyle.text, border: `1px solid ${colorStyle.border}` }}>
                            {task.subject || 'General'}
                          </span>
                        </td>
                        <td className="td-cell">
                          <span className="priority-pill" style={{ color: getPriorityColor(task.priority), background: `${getPriorityColor(task.priority)}15` }}>
                          {task.priority}
                          </span>
                        </td>
                        <td className="td-cell due-date-cell" style={{ color: statusBadge?.color || theme.subText }}>
                          {statusBadge ? statusBadge.label : 'No due date'}
                        </td>
                        <td className="td-cell">
                          <div className="progress-container">
                            <div className={`progress-bar-bg ${darkMode ? 'dark' : 'light'}`}>
                              <div className="progress-bar-fill" style={{ width: `${progressVal}%`, background: task.completed ? '#10b981' : '#2563eb' }} />
                            </div>
                            <span className="progress-text" style={{ color: theme.subText }}>{progressVal}%</span>
                          </div>
                        </td>
                        <td className="td-cell th-actions">
                          <div className="actions-cell">
                            <button onClick={() => openEditModal(task)} className="action-btn" title="Edit Task">
                              <Edit3 size={16} color="#2563eb" />
                            </button>
                            <button onClick={() => openDeleteModal(task)} className="action-btn" title="Delete Task">
                              <Trash2 size={16} color="#ef4444" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid-view-container">
              {sortedToDos.map((task) => {
                const statusBadge = getDueDateStatus(task.dueDate, task.completed);
                const colorStyle = getSubjectColor(task.subject);
                const typeClass = getTypeBadgeClass(task.taskType);
                const typeLabel = getTypeBadgeLabel(task.taskType);
                const progressVal = task.completed ? 100 : (typeLabel !== 'Assignment' ? 0 : 50);
                return (
                  <div 
                    key={task._id} 
                    className="grid-card"
                    style={{ 
                      border: `1px solid ${statusBadge?.label.includes('Overdue') ? '#fecaca' : theme.border}`, 
                      opacity: task.completed ? 0.7 : 1, 
                      background: theme.cardBg
                    }}
                  >
                    <div>
                      <div className="grid-card-top">
                        <div className="grid-card-badges">
                          <span className="subject-pill" style={{ background: colorStyle.bg, color: colorStyle.text, border: `1px solid ${colorStyle.border}` }}>
                            {task.subject || 'General'}
                          </span>
                          <span className={`badge-pill ${typeClass}`}>
                            {typeLabel}
                          </span>
                        </div>
                        <span className="priority-pill" style={{ color: getPriorityColor(task.priority), background: `${getPriorityColor(task.priority)}15` }}>
                          {task.priority}
                        </span>
                      </div>
                      <h3 className={`grid-card-title ${task.completed ? 'task-title-completed' : ''}`} style={{ color: theme.text }}>
                        {task.title}
                      </h3>
                      <p className="grid-card-desc" style={{ color: theme.subText }}>
                        {task.description || 'No additional details provided.'}
                      </p>
                    </div>
                    <div>
                      <div className="grid-card-progress-section">
                        <div className="grid-card-progress-header" style={{ color: theme.subText }}>
                          <span>Progress</span>
                          <span>{progressVal}%</span>
                        </div>
                        <div className={`progress-bar-bg ${darkMode ? 'dark' : 'light'}`}>
                          <div className="progress-bar-fill" style={{ width: `${progressVal}%`, background: task.completed ? '#10b981' : '#2563eb', transition: 'width 0.3s ease' }} />
                        </div>
                      </div>
                      <div className="grid-card-footer" style={{ borderTop: `1px solid ${theme.border}` }}>
                        <div className="grid-card-date-box">
                          <Clock size={13} color={statusBadge?.color || theme.subText} />
                          <span className="grid-card-date-text" style={{ color: statusBadge?.color || theme.subText }}>
                            {statusBadge ? statusBadge.label : 'No due date'}
                          </span>
                        </div>
                        <div className="grid-card-actions">
                          <button onClick={() => toggleComplete(task._id, task.completed)} className="action-btn" title={task.completed ? "Mark " : "Mark Complete"}>
                            <CheckCircle size={16} color={task.completed ? '#10b981' : '#94a3b8'} />
                          </button>
                          <button onClick={() => openEditModal(task)} className="action-btn" title="Edit Task">
                            <Edit3 size={16} color="#2563eb" />
                          </button>
                          <button onClick={() => openDeleteModal(task)} className="action-btn" title="Delete Task">
                            <Trash2 size={16} color="#ef4444" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}