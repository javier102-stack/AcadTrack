import { AlertTriangle, Calendar as CalendarIcon, PlusCircle, FileText, Timer, ChevronRight, Award } from 'lucide-react';

export default function DashboardView({ 
  overdueCount, totalTasks, pendingTasks, examTasks, completedTasks, 
  subjectsList, tasks, formattedCurrentDate, theme, darkMode, 
  setIsAddTaskOpen, setWorkspaceSubView, setToDoSubFilter, setActiveTab, getSubjectColor, getPriorityColor 
}) {
  return (
    <div>
      {overdueCount > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '12px 18px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px' }}>
          <AlertTriangle color="#dc2626" size={20} />
          <span>
            <strong>Attention Needed:</strong> You have <strong>{overdueCount} overdue</strong> requirement(s). Please review and complete them!
          </span>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', padding: '24px 30px', borderRadius: '12px', border: `1px solid ${theme.border}`, background: theme.cardBg }}>
        <div>
          <h1 style={{ margin: '0 0 5px 0', fontSize: '24px', fontWeight: 'bold', color: theme.text }}>Welcome back, Javier! 👋</h1>
          <p style={{ margin: 0, fontSize: '14px', color: theme.subText }}>Here's what's happening with your studies today.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#fff7ed', color: '#f97316', padding: '8px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '600', border: '1px solid #ffedd5' }}>
            <CalendarIcon size={14} color="#f97316" /> {formattedCurrentDate}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '20px' }}>
        <div style={{ padding: '20px 24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', border: `1px solid ${theme.border}`, background: theme.cardBg }}>
          <span style={{ fontSize: '13px', fontWeight: '600', color: theme.subText }}>Total Tasks</span>
          <p style={{ fontSize: '28px', fontWeight: 'bold', margin: '8px 0 4px 0', color: '#2563eb' }}>{totalTasks}</p>
          <small style={{ fontSize: '12px', color: theme.subText }}>{subjectsList.length} Active subjects</small>
        </div>
        <div style={{ padding: '20px 24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', border: `1px solid ${theme.border}`, background: theme.cardBg }}>
          <span style={{ fontSize: '13px', fontWeight: '600', color: theme.subText }}>Pending</span>
          <p style={{ fontSize: '28px', fontWeight: 'bold', margin: '8px 0 4px 0', color: '#f59e0b' }}>{pendingTasks}</p>
          <small style={{ fontSize: '12px', color: theme.subText }}>Needs attention</small>
        </div>
        <div style={{ padding: '20px 24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', border: `1px solid ${theme.border}`, background: theme.cardBg }}>
          <span style={{ fontSize: '13px', fontWeight: '600', color: theme.subText }}>Exams & Quizzes</span>
          <p style={{ fontSize: '28px', fontWeight: 'bold', margin: '8px 0 4px 0', color: '#ef4444' }}>{examTasks}</p>
          <small style={{ fontSize: '12px', color: theme.subText }}>Major tests scheduled</small>
        </div>
        <div style={{ padding: '20px 24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', border: `1px solid ${theme.border}`, background: theme.cardBg }}>
          <span style={{ fontSize: '13px', fontWeight: '600', color: theme.subText }}>Completed</span>
          <p style={{ fontSize: '28px', fontWeight: 'bold', margin: '8px 0 4px 0', color: '#10b981' }}>{completedTasks}</p>
          <small style={{ fontSize: '12px', color: theme.subText }}>Finished assignments</small>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '20px' }}>
        <div style={{ padding: '24px', borderRadius: '12px', border: `1px solid ${theme.border}`, background: theme.cardBg }}>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginTop: 0, marginBottom: '16px', color: theme.text }}>Recent Tasks Preview</h3>
          {tasks.length === 0 ? (
            <p style={{ margin: 0, fontSize: '14px', color: theme.subText }}>No active tasks found.</p>
          ) : (
            tasks.slice(0, 4).map(task => {
              const colorStyle = getSubjectColor(task.subject);
              const priorityColor = getPriorityColor(task.priority);
              return (
                <div key={task._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: `1px solid ${theme.border}` }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <strong style={{ fontSize: '14px', color: theme.text, fontWeight: '600' }}>{task.title}</strong> 
                    <span style={{ fontSize: '11px', fontWeight: '600', color: colorStyle.text, backgroundColor: colorStyle.bg, padding: '2px 8px', borderRadius: '6px', alignSelf: 'flex-start', border: `1px solid ${colorStyle.border}` }}>
                      {task.subject || 'General'}
                    </span>
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: '600', color: priorityColor, backgroundColor: `${priorityColor}15`, padding: '4px 10px', borderRadius: '20px', border: `1px solid ${priorityColor}30` }}>
                    {task.priority} Priority
                  </span>
                </div>
              );
            })
          )}
        </div>

        <div style={{ padding: '24px', borderRadius: '12px', border: `1px solid ${theme.border}`, background: theme.cardBg }}>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginTop: 0, marginBottom: '20px', color: theme.text, textAlign: 'center' }}>Quick Actions</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
            <button 
              onClick={() => setIsAddTaskOpen(true)}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', borderRadius: '10px', border: `1px solid ${theme.border}`, cursor: 'pointer', background: darkMode ? '#0f172a' : '#f8fafc' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <PlusCircle size={18} color="#f97316" />
                <span style={{ fontWeight: '600', fontSize: '13px', color: theme.text }}>Add New Assignment/Exam</span>
              </div>
              <ChevronRight size={16} color={theme.subText} />
            </button>

            <button 
              onClick={() => { setWorkspaceSubView('todos'); setToDoSubFilter('exam'); setActiveTab('academics'); }}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', borderRadius: '10px', border: `1px solid ${theme.border}`, cursor: 'pointer', background: darkMode ? '#0f172a' : '#f8fafc' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FileText size={18} color="#ef4444" />
                <span style={{ fontWeight: '600', fontSize: '13px', color: theme.text }}>View Exam Schedule</span>
              </div>
              <ChevronRight size={16} color={theme.subText} />
            </button>

            <button 
              onClick={() => setActiveTab('study')}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', borderRadius: '10px', border: `1px solid ${theme.border}`, cursor: 'pointer', background: darkMode ? '#0f172a' : '#f8fafc' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Timer size={18} color="#10b981" />
                <span style={{ fontWeight: '600', fontSize: '13px', color: theme.text }}>Start Focus Session</span>
              </div>
              <ChevronRight size={16} color={theme.subText} />
            </button>
          </div>

          <div style={{ background: '#fff7ed', border: '1px solid #ffedd5', padding: '16px', borderRadius: '10px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Award size={24} color="#ea580c" style={{ marginBottom: '6px' }} />
            <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', color: '#9a3412', fontWeight: 'bold' }}>Keep it going!</h4>
            <p style={{ margin: 0, fontSize: '12px', color: '#c2410c', lineHeight: '1.4' }}>Organize your subjects to manage tasks efficiently.</p>
          </div>
        </div>
      </div>
    </div>
  );
}