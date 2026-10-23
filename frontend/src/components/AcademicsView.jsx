import { CheckSquare, FileText, Search, Layers, Clock, Paperclip, CheckCircle, Edit3, Trash2 } from 'lucide-react';

export default function AcademicsView({
  workspaceSubView, setWorkspaceSubView, toDoSubFilter, setToDoSubFilter,
  assignmentsList, examsList, searchTerm, setSearchTerm, filterSubject, setFilterSubject,
  filterPriority, setFilterPriority, filterStatus, setFilterStatus, rawSubjects,
  sortBy, setSortBy, sortedToDos, tasks, theme, darkMode,
  getSubjectColor, getPriorityColor, getDueDateStatus, toggleComplete, openEditModal, openDeleteModal
}) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => setWorkspaceSubView('todos')} 
            style={{ border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', background: workspaceSubView === 'todos' ? '#f97316' : (darkMode ? '#334155' : '#e2e8f0'), color: workspaceSubView === 'todos' ? '#fff' : theme.text }}
          >
            <CheckSquare size={16} /> All Requirements ({tasks.length})
          </button>
          <button 
            onClick={() => setWorkspaceSubView('courses')} 
            style={{ border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', background: workspaceSubView === 'courses' ? '#f97316' : (darkMode ? '#334155' : '#e2e8f0'), color: workspaceSubView === 'courses' ? '#fff' : theme.text }}
          >
            <Layers size={16} /> Courses ({rawSubjects.length})
          </button>
        </div>
      </div>

      {workspaceSubView === 'todos' ? (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px', }}>
            <div 
              onClick={() => setToDoSubFilte('assignment')}
              style={{ padding: '20px 24px', borderRadius: '12px', border: '2px solid', cursor: 'pointer', transition: 'all 0.2s ease', background: toDoSubFilter === 'assignment' ? '#e0f2fe' : (darkMode ? '#1e293b' : '#f0f9ff'), borderColor: toDoSubFilter === 'assignment' ? '#0284c7' : theme.border }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <CheckSquare size={22} color="#0284c7" />
                <span style={{ fontSize: '12px', fontWeight: 'bold', background: '#0284c7', color: '#fff', padding: '2px 8px', borderRadius: '10px' }}>
                  {assignmentsList.filter(a => !a.completed).length} Active
                </span>
              </div>
              <h3 style={{ margin: '1px 0 4px 0', color: '#0369a1' }}>Assignments</h3>
              <p style={{ margin: 0, fontSize: '13px', color: '#0284c7' }}>Homeworks, research papers, and class projects.</p>
            </div>

            <div 
              onClick={() => setToDoSubFilte('exam')}
              style={{ padding: '20px 24px', borderRadius: '12px', border: '2px solid', cursor: 'pointer', transition: 'all 0.2s ease', background: toDoSubFilter === 'exam' ? '#fef3c7' : (darkMode ? '#1e293b' : '#fffbeb'), borderColor: toDoSubFilter === 'exam' ? '#d97706' : theme.border }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <FileText size={22} color="#d97706" />
                <span style={{ fontSize: '12px', fontWeight: 'bold', background: '#d97706', color: '#fff', padding: '2px 8px', borderRadius: '10px' }}>
                  {examsList.filter(e => !e.completed).length} Scheduled
                </span>
              </div>
              <h3 style={{ margin: '8px 0 4px 0', color: '#b45309' }}>Exams & Quizzes</h3>
              <p style={{ margin: 0, fontSize: '13px', color: '#d97706' }}>Major exams, quizzes, and long assessments.</p>
            </div>
          </div>

          <div style={{ padding: '16px 20px', borderRadius: '12px', border: `1px solid ${theme.border}`, display: 'flex', gap: '15px', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', background: theme.cardBg }}>
            <div style={{ display: 'flex', alignItems: 'center', border: `1px solid ${theme.border}`, borderRadius: '8px', padding: '8px 14px', flex: 1, minWidth: '280px', gap: '10px', background: darkMode ? '#0f172a' : '#f8fafc' }}>
              <Search size={16} color={theme.subText} />
              <input
                type="text"
                placeholder="Search by assignment title, subject, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '13px', color: theme.text }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <select 
                value={filterSubject} 
                onChange={(e) => setFilterSubject(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: '8px', border: `1px solid ${theme.border}`, fontSize: '13px', fontWeight: '600', outline: 'none', cursor: 'pointer', background: darkMode ? '#0f172a' : '#f8fafc', color: theme.text }}
              >
                <option value="all">All Subjects</option>
                {rawSubjects.map((subj, idx) => (
                  <option key={idx} value={subj}>{subj}</option>
                ))}
              </select>

              <select 
                value={filterPriority} 
                onChange={(e) => setFilterPriority(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: '8px', border: `1px solid ${theme.border}`, fontSize: '13px', fontWeight: '600', outline: 'none', cursor: 'pointer', background: darkMode ? '#0f172a' : '#f8fafc', color: theme.text }}
              >
                <option value="all">All Priorities</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>

              <select 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: '8px', border: `1px solid ${theme.border}`, fontSize: '13px', fontWeight: '600', outline: 'none', cursor: 'pointer', background: darkMode ? '#0f172a' : '#f8fafc', color: theme.text }}
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '15px 0', flexWrap: 'wrap', gap: '10px' }}>
            <small style={{ color: theme.subText, fontWeight: 'bold' }}>Showing {sortedToDos.length} of {tasks.length} tasks</small>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', color: theme.subText, fontWeight: '600' }}>Sort by:</span>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                style={{ padding: '4px 10px', fontSize: '12px', borderRadius: '8px', border: `1px solid ${theme.border}`, fontWeight: '600', outline: 'none', cursor: 'pointer', background: theme.cardBg, color: theme.text }}
              >
                <option value="dueDate">Due Date</option>
                <option value="priority">Priority</option>
                <option value="title">Title</option>
              </select>
            </div>
          </div>

          {sortedToDos.length === 0 ? (
            <div style={{ padding: '30px', borderRadius: '12px', border: `1px solid ${theme.border}`, textAlign: 'center', background: theme.cardBg }}>
              <p style={{ margin: 0, fontSize: '14px', color: theme.subText }}>No requirements found under this view.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginTop: '10px' }}>
              {sortedToDos.map((task) => {
                const isExam = task.taskType && task.taskType.toLowerCase().includes('exam');
                const statusBadge = getDueDateStatus(task.dueDate, task.completed);
                const colorStyle = getSubjectColor(task.subject);
                const progressVal = task.completed ? 100 : (isExam ? 0 : 50);

                return (
                  <div 
                    key={task._id} 
                    style={{ 
                      padding: '20px', borderRadius: '12px', border: `1px solid ${statusBadge?.label.includes('Overdue') ? '#fecaca' : theme.border}`, 
                      borderLeft: isExam ? '4px solid #ef4444' : '4px solid #2563eb',
                      opacity: task.completed ? 0.7 : 1, background: theme.cardBg, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' 
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '6px', fontWeight: 'bold', background: colorStyle.bg, color: colorStyle.text, border: `1px solid ${colorStyle.border}` }}>
                        {task.subject || 'General'}
                      </span>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <span style={{ fontSize: '11px', fontWeight: 'bold', color: getPriorityColor(task.priority), background: `${getPriorityColor(task.priority)}15`, padding: '2px 8px', borderRadius: '12px' }}>
                          🔥 {task.priority}
                        </span>
                        <span style={{ fontSize: '11px', fontWeight: 'bold', color: task.completed ? '#10b981' : '#2563eb', background: task.completed ? '#f0fdf4' : '#eff6ff', padding: '2px 8px', borderRadius: '12px' }}>
                          {task.completed ? 'Completed' : (isExam ? 'Scheduled' : 'In Progress')}
                        </span>
                      </div>
                    </div>

                    <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: '12px 0 6px 0', color: theme.text, textDecoration: task.completed ? 'line-through' : 'none' }}>
                      {task.title}
                    </h3>

                    <p style={{ fontSize: '13px', color: theme.subText, margin: '0 0 16px 0', lineHeight: '1.4', minHeight: '36px' }}>
                      {task.description || 'No additional details provided.'}
                    </p>

                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 'bold', color: theme.subText, marginBottom: '4px' }}>
                        <span>Progress</span>
                        <span>{progressVal}%</span>
                      </div>
                      <div style={{ width: '100%', height: '6px', background: darkMode ? '#334155' : '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${progressVal}%`, background: task.completed ? '#10b981' : '#2563eb', transition: 'width 0.3s ease' }} />
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Clock size={14} color={statusBadge?.color || theme.subText} />
                        <span style={{ fontSize: '12px', fontWeight: 'bold', color: statusBadge?.color || theme.subText }}>
                          {statusBadge ? statusBadge.label : 'No due date'}
                        </span>
                      </div>

                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        {task.notesLink && (
                          <a href={task.notesLink} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', padding: '4px' }} title="View Reviewer Link">
                            <Paperclip size={16} />
                          </a>
                        )}
                        <button onClick={() => toggleComplete(task._id, task.completed)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }} title={task.completed ? "Mark Pending" : "Mark Complete"}>
                          <CheckCircle size={18} color={task.completed ? '#10b981' : '#94a3b8'} />
                        </button>
                        <button onClick={() => openEditModal(task)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }} title="Edit Requirement">
                          <Edit3 size={18} color="#2563eb" />
                        </button>
                        <button onClick={() => openDeleteModal(task)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }} title="Delete Requirement">
                          <Trash2 size={18} color="#ef4444" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginTop: '10px' }}>
          {rawSubjects.map((subjName, index) => {
            const count = tasks.filter(t => (t.subject || 'General') === subjName).length;
            const colorStyle = getSubjectColor(subjName);
            return (
              <div key={index} style={{ padding: '24px', borderRadius: '12px', border: `1px solid ${colorStyle.border}`, background: theme.cardBg, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Layers size={20} color={colorStyle.text} />
                  <span style={{ fontSize: '12px', padding: '4px 10px', borderRadius: '12px', fontWeight: 'bold', background: colorStyle.bg, color: colorStyle.text, border: `1px solid ${colorStyle.border}` }}>
                    {count} Tasks
                  </span>
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: '6px 0 0 0', color: theme.text }}>{subjName}</h3>
                <p style={{ fontSize: '13px', margin: 0, lineHeight: '1.4', color: theme.subText }}>Academic course managed under your student system.</p>
                <button 
                  onClick={() => { setFilterSubject(subjName); setWorkspaceSubView('todos'); }} 
                  style={{ background: 'none', border: 'none', fontWeight: '600', fontSize: '13px', cursor: 'pointer', textAlign: 'left', padding: 0, marginTop: '10px', color: colorStyle.text }}
                >
                  View Tasks →
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}