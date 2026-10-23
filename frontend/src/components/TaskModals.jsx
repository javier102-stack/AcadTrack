import { X, Trash2 } from 'lucide-react';

export function AddTaskModal({
  isAddTaskOpen, setIsAddTaskOpen, handleSubmit, taskType, setTaskType,
  title, setTitle, subject, setSubject, dueDate, setDueDate, priority, setPriority,
  description, setDescription, theme
}) {
  if (!isAddTaskOpen) return null;
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ padding: '30px', borderRadius: '12px', width: '500px', maxWidth: '90%', boxShadow: '0 4px 12px rgba(0,0,0,0.2)', background: theme.cardBg }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, color: theme.text }}>Create New Requirement</h3>
          <button onClick={() => setIsAddTaskOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} color={theme.text} /></button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '12px', fontWeight: '600', color: theme.subText }}>Task Type</label>
            <select value={taskType} onChange={(e) => setTaskType(e.target.value)} style={{ padding: '8px 12px', borderRadius: '6px', border: `1px solid ${theme.border}`, fontSize: '13px', outline: 'none', background: theme.cardBg, color: theme.text }}>
              <option value="Assignment">Assignment</option>
              <option value="Exam">Exam / Quiz</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '12px', fontWeight: '600', color: theme.subText }}>Title *</label>
            <input type="text" placeholder="Title..." value={title} onChange={(e) => setTitle(e.target.value)} style={{ padding: '8px 12px', borderRadius: '6px', border: `1px solid ${theme.border}`, fontSize: '13px', outline: 'none', background: theme.cardBg, color: theme.text }} required />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '12px', fontWeight: '600', color: theme.subText }}>Subject</label>
            <input type="text" placeholder="e.g. Math" value={subject} onChange={(e) => setSubject(e.target.value)} style={{ padding: '8px 12px', borderRadius: '6px', border: `1px solid ${theme.border}`, fontSize: '13px', outline: 'none', background: theme.cardBg, color: theme.text }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: '600', color: theme.subText }}>Due Date</label>
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} style={{ padding: '8px 12px', borderRadius: '6px', border: `1px solid ${theme.border}`, fontSize: '13px', outline: 'none', background: theme.cardBg, color: theme.text }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: '600', color: theme.subText }}>Priority</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value)} style={{ padding: '8px 12px', borderRadius: '6px', border: `1px solid ${theme.border}`, fontSize: '13px', outline: 'none', background: theme.cardBg, color: theme.text }}>
                <option value="High">High 🔴</option>
                <option value="Medium">Medium 🟡</option>
                <option value="Low">Low 🟢</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '12px', fontWeight: '600', color: theme.subText }}>Description</label>
            <textarea placeholder="Notes..." value={description} onChange={(e) => setDescription(e.target.value)} style={{ padding: '8px 12px', borderRadius: '6px', border: `1px solid ${theme.border}`, fontSize: '13px', minHeight: '60px', outline: 'none', background: theme.cardBg, color: theme.text }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button type="button" onClick={() => setIsAddTaskOpen(false)} style={{ padding: '8px 16px', background: '#f1f5f9', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', color: '#475569' }}>Cancel</button>
            <button type="submit" style={{ padding: '8px 16px', background: '#f97316', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>Save Task</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function EditTaskModal({ isEditing, setIsEditing, currentTask, setCurrentTask, handleEditSubmit, theme }) {
  if (!isEditing || !currentTask) return null;
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ padding: '30px', borderRadius: '12px', width: '450px', maxWidth: '90%', boxShadow: '0 4px 12px rgba(0,0,0,0.2)', background: theme.cardBg }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, color: theme.text }}>Edit Entry</h3>
          <button onClick={() => setIsEditing(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} color={theme.text} /></button>
        </div>
        <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '12px', fontWeight: '600', color: theme.subText }}>Type</label>
            <select value={currentTask.taskType || 'Assignment'} onChange={(e) => setCurrentTask({ ...currentTask, taskType: e.target.value })} style={{ padding: '8px 12px', borderRadius: '6px', border: `1px solid ${theme.border}`, fontSize: '13px', outline: 'none', background: theme.cardBg, color: theme.text }}>
              <option value="Assignment">Assignment</option>
              <option value="Exam">Exam / Quiz</option>
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '12px', fontWeight: '600', color: theme.subText }}>Title *</label>
            <input type="text" value={currentTask.title} onChange={(e) => setCurrentTask({ ...currentTask, title: e.target.value })} style={{ padding: '8px 12px', borderRadius: '6px', border: `1px solid ${theme.border}`, fontSize: '13px', outline: 'none', background: theme.cardBg, color: theme.text }} required />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '12px', fontWeight: '600', color: theme.subText }}>Subject</label>
            <input type="text" value={currentTask.subject || ''} onChange={(e) => setCurrentTask({ ...currentTask, subject: e.target.value })} style={{ padding: '8px 12px', borderRadius: '6px', border: `1px solid ${theme.border}`, fontSize: '13px', outline: 'none', background: theme.cardBg, color: theme.text }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '12px', fontWeight: '600', color: theme.subText }}>Due Date</label>
            <input type="date" value={currentTask.dueDate || ''} onChange={(e) => setCurrentTask({ ...currentTask, dueDate: e.target.value })} style={{ padding: '8px 12px', borderRadius: '6px', border: `1px solid ${theme.border}`, fontSize: '13px', outline: 'none', background: theme.cardBg, color: theme.text }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '12px', fontWeight: '600', color: theme.subText }}>Study Notes Link 📎</label>
            <input type="url" value={currentTask.notesLink || ''} onChange={(e) => setCurrentTask({ ...currentTask, notesLink: e.target.value })} style={{ padding: '8px 12px', borderRadius: '6px', border: `1px solid ${theme.border}`, fontSize: '13px', outline: 'none', background: theme.cardBg, color: theme.text }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '12px', fontWeight: '600', color: theme.subText }}>Priority</label>
            <select value={currentTask.priority} onChange={(e) => setCurrentTask({ ...currentTask, priority: e.target.value })} style={{ padding: '8px 12px', borderRadius: '6px', border: `1px solid ${theme.border}`, fontSize: '13px', outline: 'none', background: theme.cardBg, color: theme.text }}>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button type="button" onClick={() => setIsEditing(false)} style={{ padding: '8px 16px', background: '#f1f5f9', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', color: '#475569' }}>Cancel</button>
            <button type="submit" style={{ padding: '8px 16px', background: '#f97316', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>Update Entry</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function DeleteModal({ isDeleting, setIsDeleting, taskToDelete, confirmDeleteTask, theme }) {
  if (!isDeleting || !taskToDelete) return null;
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ padding: '30px', borderRadius: '12px', width: '400px', maxWidth: '90%', boxShadow: '0 4px 12px rgba(0,0,0,0.2)', textAlign: 'center', background: theme.cardBg }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
          <div style={{ background: '#fef2f2', padding: '12px', borderRadius: '50%' }}><Trash2 color="#ef4444" size={28} /></div>
        </div>
        <h3 style={{ margin: '0 0 8px 0', color: theme.text }}>Delete Entry?</h3>
        <p style={{ color: theme.subText, fontSize: '14px', margin: '0 0 20px 0' }}>Are you sure you want to delete "<strong>{taskToDelete.title}</strong>"?</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
          <button type="button" onClick={() => setIsDeleting(false)} style={{ padding: '8px 16px', background: '#f1f5f9', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', color: '#475569' }}>Cancel</button>
          <button type="button" onClick={confirmDeleteTask} style={{ padding: '8px 16px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>Delete</button>
        </div>
      </div>
    </div>
  );
}