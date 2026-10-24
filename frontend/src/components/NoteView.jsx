import { useState, useEffect, useRef } from 'react';
import { 
  Bold, Italic, Highlighter, List, Plus, Trash2, Link, CheckSquare, 
  Play, Pause, RotateCcw, Timer as TimerIcon, Sparkles 
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
  const [notes, setNotes] = useState([
    {
      id: 1,
      title: 'Exam Preparation Strategy',
      content: 'Make sure to review <b>Chapter 4</b> and practice previous quizzes.',
      linkedTaskId: tasks[0]?._id || null,
      updatedAt: new Date().toLocaleDateString(),
    },
  ]);

  const [activeNoteId, setActiveNoteId] = useState(notes[0]?.id || null);
  const activeNote = notes.find((n) => n.id === activeNoteId);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Ref for the content editable div
  const editorRef = useRef(null);
  // Ref for auto-save debouncing
  const saveTimeoutRef = useRef(null);

  // Sync DOM content ONLY when switching active notes
  useEffect(() => {
    if (editorRef.current && activeNote) {
      editorRef.current.innerHTML = activeNote.content || '';
    }
  }, [activeNoteId]);

  const handleCreateNote = () => {
    const newNote = {
      id: Date.now(),
      title: 'Untitled Note',
      content: '',
      linkedTaskId: '',
      updatedAt: new Date().toLocaleDateString(),
    };
    setNotes([newNote, ...notes]);
    setActiveNoteId(newNote.id);
  };

  const handleDeleteNote = (id, e) => {
    e.stopPropagation();
    const filtered = notes.filter((n) => n.id !== id);
    setNotes(filtered);
    if (activeNoteId === id) {
      setActiveNoteId(filtered[0]?.id || null);
    }
  };

  const handleUpdateActiveNote = (field, value) => {
    setNotes((prevNotes) =>
      prevNotes.map((n) =>
        n.id === activeNoteId
          ? { ...n, [field]: value, updatedAt: new Date().toLocaleDateString() }
          : n
      )
    );
  };

  // Debounced note content saver: preserves browser caret position while typing
  const handleEditorInput = () => {
    if (!editorRef.current) return;
    const updatedHtml = editorRef.current.innerHTML;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Delay React state update so typing isn't interrupted
    saveTimeoutRef.current = setTimeout(() => {
      handleUpdateActiveNote('content', updatedHtml);
    }, 500);
  };

  const applyFormatting = (command, value = null) => {
    document.execCommand(command, false, value);
  };

  // AI Write / Solve Highlighted Problem feature
  const handleAISolve = async () => {
    const selection = window.getSelection();
    const selectedText = selection ? selection.toString().trim() : '';

    if (!selectedText) {
      alert('Please highlight a question or problem in your note first!');
      return;
    }

    setIsAiLoading(true);
    const originalContent = editorRef.current ? editorRef.current.innerHTML : activeNote.content;
    const loadingHtml = `${originalContent}<br><br><b>🤖 AcadTrack AI Solving "${selectedText}":</b> <i>Thinking...</i>`;
    
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
        body: JSON.stringify({ prompt: promptPayload }),
      });

      // Read response text first to avoid JSON parsing crashes if backend fails
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
      const aiSolution = `<br><br><b>💡 AI Solution for "${selectedText}":</b><br>${formattedAnswer}`;
      
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
    <div className="notes-container" style={{ background: theme.cardBg, color: theme.text, border: `1px solid ${theme.border}` }}>
      
      {/* Sidebar */}
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
              return (
                <div
                  key={note.id}
                  onClick={() => setActiveNoteId(note.id)}
                  className={`notes-card ${note.id === activeNoteId ? 'active' : ''} ${modeClass}`}
                >
                  <div className="notes-card-title-row">
                    <span className="notes-card-title">{note.title || 'Untitled Note'}</span>
                    <button onClick={(e) => handleDeleteNote(note.id, e)} className="notes-delete-btn">
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <small className="notes-card-date">{note.updatedAt}</small>

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

      {/* Main Workspace */}
      <main className="notes-editor-area">
        
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
            {/* Header & Task Linker */}
            <div className="notes-editor-header">
              <input
                type="text"
                className={`notes-title-input ${modeClass}`}
                placeholder="Note Title..."
                value={activeNote.title}
                onChange={(e) => handleUpdateActiveNote('title', e.target.value)}
              />

              <div className="notes-task-linker">
                <Link size={16} className="notes-link-icon" />
                <select
                  value={activeNote.linkedTaskId || ''}
                  onChange={(e) => handleUpdateActiveNote('linkedTaskId', e.target.value)}
                  className={`notes-task-select ${modeClass}`}
                >
                  <option value="">Link to Task (Optional)...</option>
                  {tasks.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.title} {t.subject ? `(${t.subject})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Formatting Toolbar */}
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

              {/* AI Write Button */}
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

            {/* Content Editable Area (Uncontrolled to fix caret jumping) */}
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