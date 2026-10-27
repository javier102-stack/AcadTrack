import { X, Trash2, Calendar } from 'lucide-react';
import './TaskModals.css';

export function AddTaskModal({
  isAddTaskOpen, setIsAddTaskOpen, handleSubmit, taskType, setTaskType,
  title, setTitle, subject, setSubject, dueDate, setDueDate, priority, setPriority,
  description, setDescription, theme
}) {
  if (!isAddTaskOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-box add-modal" style={{ background: theme.cardBg }}>
        <div className="modal-header">
          <h3 className="modal-title" style={{ color: theme.text }}>Create New Requirement</h3>
          <button onClick={() => setIsAddTaskOpen(false)} className="modal-close-btn">
            <X size={20} color={theme.text} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-field">
            <label className="form-label" style={{ color: theme.subText }}>Task Type</label>
            <select 
              value={taskType} 
              onChange={(e) => setTaskType(e.target.value)} 
              className="form-input" 
              style={{ border: `1px solid ${theme.border}`, background: theme.cardBg, color: theme.text }}
            >
              <option value="Assignment">Assignment</option>
              <option value="Quiz">Quiz</option>
              <option value="Exam">Exam</option>
              <option value="Project">Project</option>
            </select>
          </div>

          <div className="form-field">
            <label className="form-label" style={{ color: theme.subText }}>Title *</label>
            <input 
              type="text" 
              placeholder="Title..." 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              className="form-input" 
              style={{ border: `1px solid ${theme.border}`, background: theme.cardBg, color: theme.text }}
              required 
            />
          </div>

          <div className="form-field">
            <label className="form-label" style={{ color: theme.subText }}>Subject</label>
            <input 
              type="text" 
              placeholder="e.g. Math" 
              value={subject} 
              onChange={(e) => setSubject(e.target.value)} 
              className="form-input" 
              style={{ border: `1px solid ${theme.border}`, background: theme.cardBg, color: theme.text }}
            />
          </div>

          <div className="form-grid-2">
            <div className="form-field">
              <label className="form-label" style={{ color: theme.subText }}>Due Date</label>
              <div className="date-input-wrapper">
                <input 
                  type="date" 
                  value={dueDate} 
                  onChange={(e) => setDueDate(e.target.value)} 
                  className="form-input date-input" 
                  style={{ border: `1px solid ${theme.border}`, background: theme.cardBg, color: theme.text }}
                />
                <Calendar size={16} className="custom-calendar-icon" color={theme.subText || '#888'} />
              </div>
            </div>
            <div className="form-field">
              <label className="form-label" style={{ color: theme.subText }}>Priority</label>
              <select 
                value={priority} 
                onChange={(e) => setPriority(e.target.value)} 
                className="form-input" 
                style={{ border: `1px solid ${theme.border}`, background: theme.cardBg, color: theme.text }}
              >
                <option value="High">High 🔴</option>
                <option value="Medium">Medium 🟡</option>
                <option value="Low">Low 🟢</option>
              </select>
            </div>
          </div>

          <div className="form-field">
            <label className="form-label" style={{ color: theme.subText }}>Description</label>
            <textarea 
              placeholder="Notes..." 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              className="form-input form-textarea" 
              style={{ border: `1px solid ${theme.border}`, background: theme.cardBg, color: theme.text }}
            />
          </div>

          <div className="form-actions">
            <button type="button" onClick={() => setIsAddTaskOpen(false)} className="btn-cancel">Cancel</button>
            <button type="submit" className="btn-submit">Save Task</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function EditTaskModal({ isEditing, setIsEditing, currentTask, setCurrentTask, handleEditSubmit, theme }) {
  if (!isEditing || !currentTask) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-box edit-modal" style={{ background: theme.cardBg }}>
        <div className="modal-header">
          <h3 className="modal-title" style={{ color: theme.text }}>Edit Entry</h3>
          <button onClick={() => setIsEditing(false)} className="modal-close-btn">
            <X size={20} color={theme.text} />
          </button>
        </div>

        <form onSubmit={handleEditSubmit} className="modal-form">
          <div className="form-field">
            <label className="form-label" style={{ color: theme.subText }}>Type</label>
            <select 
              value={currentTask.taskType || 'Assignment'} 
              onChange={(e) => setCurrentTask({ ...currentTask, taskType: e.target.value })} 
              className="form-input" 
              style={{ border: `1px solid ${theme.border}`, background: theme.cardBg, color: theme.text }}
            >
              <option value="Assignment">Assignment</option>
              <option value="Quiz">Quiz</option>
              <option value="Exam">Exam</option>
              <option value="Project">Project</option>
            </select>
          </div>

          <div className="form-field">
            <label className="form-label" style={{ color: theme.subText }}>Title *</label>
            <input 
              type="text" 
              value={currentTask.title || ''} 
              onChange={(e) => setCurrentTask({ ...currentTask, title: e.target.value })} 
              className="form-input" 
              style={{ border: `1px solid ${theme.border}`, background: theme.cardBg, color: theme.text }}
              required 
            />
          </div>

          <div className="form-field">
            <label className="form-label" style={{ color: theme.subText }}>Subject</label>
            <input 
              type="text" 
              value={currentTask.subject || ''} 
              onChange={(e) => setCurrentTask({ ...currentTask, subject: e.target.value })} 
              className="form-input" 
              style={{ border: `1px solid ${theme.border}`, background: theme.cardBg, color: theme.text }}
            />
          </div>

          <div className="form-grid-2">
            <div className="form-field">
              <label className="form-label" style={{ color: theme.subText }}>Due Date</label>
              <div className="date-input-wrapper">
                <input 
                  type="date" 
                  value={currentTask.dueDate || ''} 
                  onChange={(e) => setCurrentTask({ ...currentTask, dueDate: e.target.value })} 
                  className="form-input date-input" 
                  style={{ border: `1px solid ${theme.border}`, background: theme.cardBg, color: theme.text }}
                />
                <Calendar size={16} className="custom-calendar-icon" color={theme.subText || '#888'} />
              </div>
            </div>
            <div className="form-field">
              <label className="form-label" style={{ color: theme.subText }}>Priority</label>
              <select 
                value={currentTask.priority || 'Medium'} 
                onChange={(e) => setCurrentTask({ ...currentTask, priority: e.target.value })} 
                className="form-input" 
                style={{ border: `1px solid ${theme.border}`, background: theme.cardBg, color: theme.text }}
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={() => setIsEditing(false)} className="btn-cancel">Cancel</button>
            <button type="submit" className="btn-submit">Update Entry</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function DeleteModal({ isDeleting, setIsDeleting, taskToDelete, confirmDeleteTask, theme }) {
  if (!isDeleting || !taskToDelete) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-box delete-modal" style={{ background: theme.cardBg }}>
        <div className="delete-icon-wrapper">
          <div className="delete-icon-circle">
            <Trash2 color="#DC2626" size={28} />
          </div>
        </div>

        <h3 className="delete-title" style={{ color: theme.text }}>Delete Entry?</h3>
        <p className="delete-desc" style={{ color: theme.subText }}>
          Are you sure you want to delete <strong>"{taskToDelete.title}"</strong>?
        </p>

        <div className="delete-actions">
          <button type="button" onClick={() => setIsDeleting(false)} className="btn-cancel">Cancel</button>
          <button type="button" onClick={confirmDeleteTask} className="btn-delete">Delete</button>
        </div>
      </div>
    </div>
  );
}