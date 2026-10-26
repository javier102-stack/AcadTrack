import { useState, useEffect, useRef } from 'react';
import { 
  Bold, Italic, Highlighter, List, Plus, Trash2, Edit2, Link, CheckSquare, 
  Play, Pause, RotateCcw, Timer as TimerIcon, Sparkles, Maximize2, Minimize2, Save 
} from 'lucide-react';
import './NoteView.css';

export default function NotesView({ 
  tasks = [], 
  theme = { cardBg: '#ffffff', text: '#000000', border: '#e2e8f0' }, 
  darkMode = false,
  customMinutesInput = 25,
  setCustomTimerMinutes = () => {},
  pomodoroSeconds = 1500,
  formatPomodoroTime = (secs) => {
    const mins = Math.floor(secs / 60).toString().padStart(2, '0');
    const remSecs = (secs % 60).toString().padStart(2, '0');
    return `${mins}:${remSecs}`;
  },
  isPomodoroActive = false,
  setIsPomodoroActive = () => {}
}) {
  // Notes States
  const [notes, setNotes] = useState([]);
  const [activeNoteId, setActiveNoteId] = useState(null);
  const activeNote = notes.find((n) => n._id === activeNoteId);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [tempTitle, setTempTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false); // 👈 Added save state for UI feedback

  const editorRef = useRef(null);
  const saveTimeoutRef = useRef(null);

  // 1. Fetch notes from MongoDB on component mount
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const response = await fetch('/api/notes', {
          method: 'GET',
          credentials: 'include',
        });
        const data = await response.json();
        if (response.ok) {
          setNotes(data);
          if (data.length > 0) {
            setActiveNoteId(data[0]._id);
          }
        } else {
          console.error(data.message);
        }
      } catch (err) {
        console.error('Failed to fetch notes:', err);
      }
    };

    fetchNotes();
  }, []);

  // Sync DOM content ONLY when switching active notes
  useEffect(() => {
    if (editorRef.current && activeNote) {
      editorRef.current.innerHTML = activeNote.content || '';
    }
  }, [activeNoteId]);

  // 2. Create note in MongoDB
  const handleCreateNote = async () => {
    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: 'Untitled Note',
          content: '',
          linkedTaskId: null
        })
      });

      const newNote = await response.json();
      if (!response.ok) throw new Error(newNote.message);

      setNotes([newNote, ...notes]);
      setActiveNoteId(newNote._id);
    } catch (err) {
      console.error('Failed to create note:', err);
    }
  };

  // 3. Delete note from MongoDB
  const handleDeleteNote = async (id, e) => {
    e.stopPropagation();
    try {
      const response = await fetch(`/api/notes/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Failed to delete note');

      const filtered = notes.filter((n) => n._id !== id);
      setNotes(filtered);
      if (activeNoteId === id) {
        setActiveNoteId(filtered[0]?._id || null);
      }
    } catch (err) {
      console.error('Failed to delete note:', err);
    }
  };

  // 4. Explicit Manual Save Function
  const handleManualSave = async () => {
    if (!activeNote) return;
    setIsSaving(true);

    try {
      const currentContent = editorRef.current ? editorRef.current.innerHTML : activeNote.content;
      
      const response = await fetch(`/api/notes/${activeNote._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: activeNote.title,
          content: currentContent,
          linkedTaskId: activeNote.linkedTaskId
        })
      });

      const updatedNote = await response.json();
      if (!response.ok) throw new Error('Failed to save note');

      setNotes(notes.map(n => n._id === updatedNote._id ? updatedNote : n));
      setTimeout(() => setIsSaving(false), 600); // Brief feedback delay
    } catch (err) {
      console.error('Failed to save note:', err);
      setIsSaving(false);
      alert('Error saving note to database.');
    }
  };

  // Local state update helper (with automatic background debounce)
  const handleUpdateActiveNote = (field, value) => {
    setNotes((prevNotes) =>
      prevNotes.map((n) =>
        n._id === activeNoteId
          ? { ...n, [field]: value, updatedAt: new Date().toISOString() }
          : n
      )
    );

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Debounced automatic background sync
    saveTimeoutRef.current = setTimeout(async () => {
      const currentNote = notes.find(n => n._id === activeNoteId);
      if (!currentNote) return;

      try {
        const payload = {
          title: field === 'title' ? value : currentNote.title,
          content: field === 'content' ? value : currentNote.content,
          linkedTaskId: field === 'linkedTaskId' ? value : currentNote.linkedTaskId
        };

        await fetch(`/api/notes/${activeNoteId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload)
        });
      } catch (err) {
        console.error('Background sync failed:', err);
      }
    }, 1000);
  };

  const handleEditorInput = () => {
    if (!editorRef.current) return;
    handleUpdateActiveNote('content', editorRef.current.innerHTML);
  };

  const applyFormatting = (command, value = null) => {
    document.execCommand(command, false, value);
  };

  // AI Write Feature
  const handleAISolve = async () => {
    const selection = window.getSelection();
    const selectedText = selection ? selection.toString().trim() : '';

    if (!selectedText) {
      alert('Please highlight a question or problem in your note first!');
      return;
    }

    setIsAiLoading(true);
    const originalContent = editorRef.current ? editorRef.current.innerHTML : activeNote.content;
    const loadingHtml = `${originalContent}<br><br><b>AcadTrack AI Solving:</b> <i>Thinking...</i>`;
    
    if (editorRef.current) editorRef.current.innerHTML = loadingHtml;

    try {
      const promptPayload = `${selectedText}\n\nMy current academic tasks are:\n${
        tasks.length
          ? tasks
              .map(
                (task, index) =>
                  `${index + 1}. ${task.title} | Subject: ${
                    task.subject || 'General'
                  } | Due date: ${
                    task.dueDate
                      ? new Date(task.dueDate).toLocaleDateString()
                      : 'Not set'
                  } | Priority: ${task.priority || 'Medium'} | Status: ${
                    task.completed ? 'Completed' : 'Pending'
                  }`
              )
              .join('\n')
          : 'No tasks have been added yet.'
      }\n\nUse these tasks as context when relevant. Do not claim to change or save tasks.`;

      const response = await fetch('/api/ai/study-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ prompt: promptPayload }),
      });

      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        throw new Error(`Server returned non-JSON response (${response.status}): ${responseText || 'Empty response'}`);
      }

      if (!response.ok) {
        throw new Error(data.message || data.error || 'AI generation failed');
      }

      const formattedAnswer = data.answer.replace(/\n/g, '<br>');
      const aiSolution = `<br><br>${formattedAnswer}`;
      
      const finalContent = originalContent + aiSolution;
      if (editorRef.current) editorRef.current.innerHTML = finalContent;
      handleUpdateActiveNote('content', finalContent);
      setIsAiLoading(false);
    } catch (err) {
      alert(`AcadTrack AI Error: ${err.message}`);
      setIsAiLoading(false);
      if (editorRef.current) editorRef.current.innerHTML = originalContent;
      handleUpdateActiveNote('content', originalContent);
    }
  };

  const modeClass = darkMode ? 'dark' : 'light';

  return (
    <div className={`notes-container ${isFullScreen ? 'fullscreen' : ''}`} style={{ background: theme.cardBg, color: theme.text, border: `1px solid ${theme.border}` }}>
      
      {/* Sidebar */}
      {!isFullScreen && (
        <aside className={`notes-sidebar ${modeClass}`}>
          <div className="notes-sidebar-header">
            <h3>My Notes</h3>
            <button onClick={handleCreateNote} className="notes-add-btn" title="Create New Note">
              <Plus size={18} /> New
            </button>
          </div>

          <div className="notes-list">
            {notes.length === 0 ? (
              <p className="notes-empty-msg">No notes yet. Click New to create one!</p>
            ) : (
              notes.map((note) => {
                const linkedTask = tasks.find((t) => t._id === note.linkedTaskId);
                const isEditing = editingNoteId === note._id;

                return (
                  <div
                    key={note._id}
                    onClick={() => {
                      if (!isEditing) setActiveNoteId(note._id);
                    }}
                    className={`notes-card ${note._id === activeNoteId ? 'active' : ''} ${modeClass}`}
                  >
                    <div className="notes-card-title-row">
                      {isEditing ? (
                        <input
                          type="text"
                          value={tempTitle}
                          autoFocus
                          onChange={(e) => setTempTitle(e.target.value)}
                          onBlur={() => {
                            if (tempTitle.trim()) {
                              handleUpdateActiveNote('title', tempTitle);
                            }
                            setEditingNoteId(null);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') e.target.blur();
                          }}
                          style={{ flex: 1, padding: '2px 4px', fontSize: '0.9rem', borderRadius: '4px', border: '1px solid #3b82f6', outline: 'none' }}
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <span className="notes-card-title">{note.title || 'Untitled Note'}</span>
                      )}

                      <div style={{ display: 'flex', gap: '2px' }} onClick={(e) => e.stopPropagation()}>
                        <button 
                          onClick={() => {
                            setEditingNoteId(note._id);
                            setTempTitle(note.title);
                            setActiveNoteId(note._id);
                          }} 
                          className="notes-edit-btn"
                          title="Edit Title"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button onClick={(e) => handleDeleteNote(note._id, e)} className="notes-delete-btn" title="Delete Note">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <small className="notes-card-date">
                      {new Date(note.updatedAt || note.createdAt).toLocaleDateString()}
                    </small>

                    {linkedTask && (
                      <div className="notes-card-task-tag">
                        <CheckSquare size={12} /> {linkedTask.title}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </aside>
      )}

      {/* Main Workspace */}
      <main className="notes-editor-area">
        
        <div className="notes-top-action-bar" style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginBottom: '8px' }}>
          {/* 👇 New Save Button */}
          {activeNote && (
            <button 
              onClick={handleManualSave}
              disabled={isSaving}
              style={{
                background: isSaving ? '#10b981' : (darkMode ? '#1e293b' : '#f8fafc'),
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                padding: '6px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: isSaving ? '#ffffff' : (darkMode ? '#f8fafc' : '#334155'),
                transition: 'all 0.2s ease'
              }}
            >
              <Save size={15} />
              {isSaving ? 'Saved!' : 'Save Note'}
            </button>
          )}

          <button 
            onClick={() => setIsFullScreen(!isFullScreen)}
            style={{
              background: darkMode ? '#1e293b' : '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              padding: '6px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: darkMode ? '#f8fafc' : '#334155'
            }}
          >
            {isFullScreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            {isFullScreen ? 'Exit Full Screen' : 'Full Screen'}
          </button>
        </div>

        {/* Timer Bar */}
        <div className={`notes-timer-bar ${modeClass}`}>
          <div className="notes-timer-left">
            <TimerIcon size={20} color="#7FA8D6" />
            <span className="notes-timer-label">Focus Timer:</span>
            <span className="notes-timer-display">{formatPomodoroTime(pomodoroSeconds)}</span>
          </div>

          <div className="notes-timer-controls">
            <button 
              onClick={() => setIsPomodoroActive(!isPomodoroActive)} 
              className={`timer-btn ${isPomodoroActive ? 'pause' : 'play'}`}
            >
              {isPomodoroActive ? <Pause size={16} /> : <Play size={16} />}
              {isPomodoroActive ? 'Pause' : 'Start'}
            </button>
            <button 
              onClick={() => {
                setIsPomodoroActive(false);
                setCustomTimerMinutes(customMinutesInput);
              }} 
              className="timer-btn restart"
            >
              <RotateCcw size={16} /> Restart
            </button>
            <div className="timer-custom-wrapper">
              <span>Mins:</span>
              <input
                type="number"
                min="1"
                max="180"
                value={customMinutesInput}
                onChange={(e) => setCustomTimerMinutes(e.target.value)}
                className={`timer-input ${modeClass}`}
              />
            </div>
          </div>
        </div>

        {activeNote ? (
          <>
            <div className="notes-editor-header">
              <input
                type="text"
                className={`notes-title-input ${modeClass}`}
                placeholder="Note Title..."
                value={activeNote.title}
                onChange={(e) => handleUpdateActiveNote('title', e.target.value)}
              />

              <div className="notes-task-linker">Connect task
                <Link size={16} className="notes-link-icon" />
                <select
                  value={activeNote.linkedTaskId || ''}
                  onChange={(e) => handleUpdateActiveNote('linkedTaskId', e.target.value || null)}
                  className={`notes-task-select ${modeClass}`}
                >
                  <option value="">Link to Task (Optional)</option>
                  {tasks.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.title} {t.subject ? `(${t.subject})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className={`notes-toolbar ${modeClass}`}>
              <button onClick={() => applyFormatting('bold')} title="Bold">
                <Bold size={16} />
              </button>
              <button onClick={() => applyFormatting('italic')} title="Italic">
                <Italic size={16} />
              </button>
              <button onClick={() => applyFormatting('hiliteColor', '#FFE08A')} title="Highlight Yellow">
                <Highlighter size={16} />
              </button>
              <button onClick={() => applyFormatting('insertUnorderedList')} title="Bullet List">
                <List size={16} />
              </button>

              <button 
                onClick={handleAISolve} 
                disabled={isAiLoading}
                className="notes-ai-write-btn" 
                title="Highlight a problem in your note and click to get AI solution"
              >
                <Sparkles size={16} color="#F59E0B" /> 
                <span>{isAiLoading ? 'Thinking...' : 'AI Write'}</span>
              </button>
            </div>

            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              dir="ltr"
              className={`notes-content-editable ${modeClass}`}
              onInput={handleEditorInput}
              onBlur={() => {
                if (editorRef.current) {
                  handleUpdateActiveNote('content', editorRef.current.innerHTML);
                }
              }}
            />
          </>
        ) : (
          <div className="notes-no-selection">
            Select or create a note to start writing.
          </div>
        )}
      </main>
    </div>
  );
}