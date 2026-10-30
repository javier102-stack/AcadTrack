import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Bold,
  Italic,
  Highlighter,
  List,
  Plus,
  Trash2,
  Edit2,
  Link,
  CheckSquare,
  Play,
  Pause,
  RotateCcw,
  Timer as TimerIcon,
  Sparkles,
  Maximize2,
  Minimize2,
  Save,
  Menu,
} from 'lucide-react';
import './NoteView.css';

const NOTES_API = 'https://acadtrack-pkrg.onrender.com/api/notes';
const AI_API = 'https://acadtrack-pkrg.onrender.com/api/ai/study-plan';

export default function NotesView({
  tasks = [],
  theme = {
    cardBg: '#ffffff',
    text: '#000000',
    border: '#e2e8f0',
  },
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
  setIsPomodoroActive = () => {},
}) {
  const [notes, setNotes] = useState([]);
  const [activeNoteId, setActiveNoteId] = useState(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [tempTitle, setTempTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  const activeNote = notes.find((note) => note._id === activeNoteId);

  const editorRef = useRef(null);
  const saveTimeoutsRef = useRef(new Map());
  const savePromisesRef = useRef(new Map());
  const latestNotesRef = useRef([]);
  const alarmIntervalRef = useRef(null);
  const audioContextRef = useRef(null);
  const isMountedRef = useRef(true);

  // Keep the latest notes available to asynchronous save operations.
  useEffect(() => {
    latestNotesRef.current = notes;
  }, [notes]);

  // Play a short alarm when the focus timer finishes.
  const playAlarmSound = useCallback(() => {
    try {
      const AudioContextClass =
        window.AudioContext || window.webkitAudioContext;

      if (!AudioContextClass) return;

      const audioContext = new AudioContextClass();
      audioContextRef.current = audioContext;

      let beepCount = 0;

      alarmIntervalRef.current = setInterval(() => {
        if (beepCount >= 10) {
          clearInterval(alarmIntervalRef.current);
          alarmIntervalRef.current = null;
          audioContext.close().catch(() => {});
          audioContextRef.current = null;
          return;
        }

        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(
          587.33,
          audioContext.currentTime
        );

        gain.gain.setValueAtTime(0.2, audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(
          0.001,
          audioContext.currentTime + 0.5
        );

        oscillator.connect(gain);
        gain.connect(audioContext.destination);

        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.5);

        beepCount += 1;
      }, 1000);
    } catch (error) {
      console.error('Audio Context Error:', error);
    }
  }, []);

  const stopAlarmSound = useCallback(() => {
    if (alarmIntervalRef.current) {
      clearInterval(alarmIntervalRef.current);
      alarmIntervalRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (pomodoroSeconds === 0 && isPomodoroActive) {
      setIsPomodoroActive(false);
      playAlarmSound();
    }
  }, [
    pomodoroSeconds,
    isPomodoroActive,
    setIsPomodoroActive,
    playAlarmSound,
  ]);

  // Fetch notes belonging to the currently authenticated user.
  useEffect(() => {
    let cancelled = false;

    const fetchNotes = async () => {
      try {
        const response = await fetch(NOTES_API, {
          method: 'GET',
          credentials: 'include',
        });

        const responseText = await response.text();
        let data;

        try {
          data = JSON.parse(responseText);
        } catch {
          throw new Error(
            `Invalid server response (${response.status}).`
          );
        }

        if (!response.ok) {
          throw new Error(data.message || 'Failed to load notes.');
        }

        if (!Array.isArray(data)) {
          throw new Error('The notes API did not return a list.');
        }

        if (!cancelled) {
          setNotes(data);
          setActiveNoteId((currentId) => {
            if (currentId && data.some((note) => note._id === currentId)) {
              return currentId;
            }

            return data[0]?._id || null;
          });
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Failed to fetch notes:', error);
        }
      }
    };

    fetchNotes();

    return () => {
      cancelled = true;
    };
  }, []);

  // Clear timers and finish any alarm when leaving this component.
  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;

      for (const timeout of saveTimeoutsRef.current.values()) {
        clearTimeout(timeout);
      }

      saveTimeoutsRef.current.clear();
      stopAlarmSound();
    };
  }, [stopAlarmSound]);

  // Keep the editor synchronized with the selected note.
  useEffect(() => {
    if (editorRef.current && activeNote) {
      const currentContent = editorRef.current.innerHTML;
      const nextContent = activeNote.content || '';

      if (currentContent !== nextContent) {
        editorRef.current.innerHTML = nextContent;
      }
    } else if (editorRef.current && !activeNote) {
      editorRef.current.innerHTML = '';
    }
  }, [activeNoteId, activeNote?.content]);

  // Save one specific note to the backend.
  const saveNoteToServer = useCallback(async (noteId, noteToSave) => {
    const payload = {
      title: noteToSave.title || 'Untitled Note',
      content: noteToSave.content || '',
      linkedTaskId: noteToSave.linkedTaskId || null,
    };

    const request = fetch(`${NOTES_API}/${noteId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(payload),
    }).then(async (response) => {
      const responseText = await response.text();
      let data;

      try {
        data = JSON.parse(responseText);
      } catch {
        throw new Error(
          `Invalid save response (${response.status}).`
        );
      }

      if (!response.ok) {
        throw new Error(data.message || 'Failed to save note.');
      }

      if (data && data._id) {
        setNotes((previousNotes) =>
          previousNotes.map((note) =>
            note._id === data._id ? { ...note, ...data } : note
          )
        );
      }

      return data;
    });

    savePromisesRef.current.set(noteId, request);

    try {
      return await request;
    } finally {
      if (savePromisesRef.current.get(noteId) === request) {
        savePromisesRef.current.delete(noteId);
      }
    }
  }, []);

  // Update the UI immediately and debounce the save for that note.
  const handleUpdateActiveNote = useCallback(
    (field, value, noteId = activeNoteId) => {
      const currentNote = latestNotesRef.current.find(
        (note) => note._id === noteId
      );

      if (!currentNote) return;

      const updatedNote = {
        ...currentNote,
        [field]: value,
        updatedAt: new Date().toISOString(),
      };

      latestNotesRef.current = latestNotesRef.current.map((note) =>
        note._id === noteId ? updatedNote : note
      );

      setNotes((previousNotes) =>
        previousNotes.map((note) =>
          note._id === noteId ? updatedNote : note
        )
      );

      const existingTimeout = saveTimeoutsRef.current.get(noteId);

      if (existingTimeout) {
        clearTimeout(existingTimeout);
      }

      const timeout = setTimeout(async () => {
        saveTimeoutsRef.current.delete(noteId);

        try {
          await saveNoteToServer(noteId, updatedNote);
        } catch (error) {
          console.error(
            `Auto-save failed for note ${noteId}:`,
            error
          );
        }
      }, 1000);

      saveTimeoutsRef.current.set(noteId, timeout);
    },
    [activeNoteId, saveNoteToServer]
  );

  const handleCreateNote = async () => {
    try {
      const response = await fetch(NOTES_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          title: 'Untitled Note',
          content: '',
          linkedTaskId: null,
        }),
      });

      const responseText = await response.text();
      let newNote;

      try {
        newNote = JSON.parse(responseText);
      } catch {
        throw new Error(
          `Invalid create response (${response.status}).`
        );
      }

      if (!response.ok) {
        throw new Error(newNote.message || 'Failed to create note.');
      }

      latestNotesRef.current = [
        newNote,
        ...latestNotesRef.current,
      ];

      setNotes((previousNotes) => [newNote, ...previousNotes]);
      setActiveNoteId(newNote._id);
    } catch (error) {
      console.error('Failed to create note:', error);
      alert(`Could not create note: ${error.message}`);
    }
  };

  const handleDeleteNote = async (id, event) => {
    event.stopPropagation();

    try {
      const response = await fetch(`${NOTES_API}/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const responseText = await response.text();
      let data = {};

      if (responseText) {
        try {
          data = JSON.parse(responseText);
        } catch {
          if (!response.ok) {
            throw new Error(
              `Invalid delete response (${response.status}).`
            );
          }
        }
      }

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete note.');
      }

      const pendingTimeout = saveTimeoutsRef.current.get(id);

      if (pendingTimeout) {
        clearTimeout(pendingTimeout);
        saveTimeoutsRef.current.delete(id);
      }

      latestNotesRef.current = latestNotesRef.current.filter(
        (note) => note._id !== id
      );

      setNotes((previousNotes) =>
        previousNotes.filter((note) => note._id !== id)
      );

      setActiveNoteId((currentId) => {
        if (currentId !== id) return currentId;

        const remaining = latestNotesRef.current;
        return remaining[0]?._id || null;
      });
    } catch (error) {
      console.error('Failed to delete note:', error);
      alert(`Could not delete note: ${error.message}`);
    }
  };

  const handleManualSave = async () => {
    if (!activeNote) return;

    const noteId = activeNote._id;

    const currentNote =
      latestNotesRef.current.find((note) => note._id === noteId) ||
      activeNote;

    const noteToSave = {
      ...currentNote,
      content: editorRef.current
        ? editorRef.current.innerHTML
        : currentNote.content,
    };

    const pendingTimeout = saveTimeoutsRef.current.get(noteId);

    if (pendingTimeout) {
      clearTimeout(pendingTimeout);
      saveTimeoutsRef.current.delete(noteId);
    }

    setIsSaving(true);

    try {
      const previousSave = savePromisesRef.current.get(noteId);

      if (previousSave) {
        try {
          await previousSave;
        } catch {
          // Proceed with newest content
        }
      }

      await saveNoteToServer(noteId, noteToSave);

      if (isMountedRef.current) {
        setIsSaving(false);
      }
    } catch (error) {
      console.error('Failed to save note:', error);

      if (isMountedRef.current) {
        setIsSaving(false);
        alert(`Error saving note: ${error.message}`);
      }
    }
  };

  const handleEditorInput = () => {
    if (!editorRef.current) return;

    handleUpdateActiveNote(
      'content',
      editorRef.current.innerHTML
    );
  };

  const applyFormatting = (command, value = null) => {
    if (!editorRef.current) return;

    editorRef.current.focus();
    document.execCommand(command, false, value);

    handleUpdateActiveNote(
      'content',
      editorRef.current.innerHTML
    );
  };

  const handleAISolve = async () => {
    const selectedText = window.getSelection()?.toString().trim() || '';

    if (!selectedText) {
      alert('Please highlight a question or problem in your note first!');
      return;
    }

    if (!activeNote) return;

    const noteId = activeNote._id;
    const originalContent = editorRef.current
      ? editorRef.current.innerHTML
      : activeNote.content || '';

    setIsAiLoading(true);

    if (editorRef.current) {
      editorRef.current.innerHTML =
        `${originalContent}<br><br><b>Academix AI Solving:</b> <i>Thinking...</i>`;
    }

    try {
      const promptPayload = `${selectedText}

My current academic tasks are:
${
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
}

Use these tasks as context when relevant. Do not claim to change or save tasks.`;

      const response = await fetch(AI_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          prompt: promptPayload,
        }),
      });

      const responseText = await response.text();
      let data;

      try {
        data = JSON.parse(responseText);
      } catch {
        throw new Error(
          `AI server returned an invalid response (${response.status}).`
        );
      }

      if (!response.ok) {
        throw new Error(
          data.message || data.error || 'AI generation failed.'
        );
      }

      if (typeof data.answer !== 'string' || !data.answer.trim()) {
        throw new Error('The AI server did not return an answer.');
      }

      const escapeHtml = (text) =>
        text.replace(/[&<>"']/g, (character) => {
          const entities = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;',
          };

          return entities[character];
        });

      const formattedAnswer = escapeHtml(data.answer).replace(
        /\n/g,
        '<br>'
      );

      const finalContent =
        `${originalContent}<br><br><b>Academix AI Solution:</b><br>${formattedAnswer}`;

      if (editorRef.current && activeNoteId === noteId) {
        editorRef.current.innerHTML = finalContent;
      }

      handleUpdateActiveNote('content', finalContent, noteId);
    } catch (error) {
      console.error('Academix AI Error:', error);
      alert(`Academix AI Error: ${error.message}`);

      if (editorRef.current && activeNoteId === noteId) {
        editorRef.current.innerHTML = originalContent;
      }

      handleUpdateActiveNote('content', originalContent, noteId);
    } finally {
      setIsAiLoading(false);
    }
  };

  const modeClass = darkMode ? 'dark' : 'light';

  return (
    <div
      className={`notes-container ${isFullScreen ? 'fullscreen' : ''}`}
      style={{
        background: theme.cardBg,
        color: theme.text,
        border: `1px solid ${theme.border}`,
      }}
    >
      {!isFullScreen && (
        <aside className={`notes-sidebar ${modeClass} ${!showMobileSidebar ? 'hidden-mobile' : ''}`}>
          <div className="notes-sidebar-header">
            <h3>My Notes</h3>
            <button
              onClick={handleCreateNote}
              className="notes-add-btn"
              title="Create New Note"
            >
              <Plus size={18} /> New
            </button>
          </div>

          <div className="notes-list">
            {notes.length === 0 ? (
              <p className="notes-empty-msg">
                No notes yet. Click New to create one!
              </p>
            ) : (
              notes.map((note) => {
                const linkedTask = tasks.find(
                  (task) => task._id === note.linkedTaskId
                );
                const isEditing = editingNoteId === note._id;

                return (
                  <div
                    key={note._id}
                    onClick={() => {
                      if (!isEditing) {
                        setActiveNoteId(note._id);
                        setShowMobileSidebar(false);
                      }
                    }}
                    className={`notes-card ${
                      note._id === activeNoteId ? 'active' : ''
                    } ${modeClass}`}
                  >
                    <div className="notes-card-title-row">
                      {isEditing ? (
                        <input
                          type="text"
                          value={tempTitle}
                          autoFocus
                          onChange={(event) =>
                            setTempTitle(event.target.value)
                          }
                          onBlur={() => {
                            const title = tempTitle.trim();

                            if (title) {
                              handleUpdateActiveNote(
                                'title',
                                title,
                                note._id
                              );
                            }

                            setEditingNoteId(null);
                          }}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter') {
                              event.preventDefault();
                              event.currentTarget.blur();
                            }

                            if (event.key === 'Escape') {
                              setTempTitle(note.title || '');
                              event.currentTarget.blur();
                            }
                          }}
                          style={{
                            flex: 1,
                            padding: '2px 4px',
                            fontSize: '0.9rem',
                            borderRadius: '4px',
                            border: '1px solid #3b82f6',
                            outline: 'none',
                          }}
                          onClick={(event) => event.stopPropagation()}
                        />
                      ) : (
                        <span className="notes-card-title">
                          {note.title || 'Untitled Note'}
                        </span>
                      )}

                      <div
                        style={{
                          display: 'flex',
                          gap: '2px',
                        }}
                        onClick={(event) => event.stopPropagation()}
                      >
                        <button
                          onClick={() => {
                            setEditingNoteId(note._id);
                            setTempTitle(note.title || '');
                            setActiveNoteId(note._id);
                          }}
                          className="notes-edit-btn"
                          title="Edit Title"
                        >
                          <Edit2 size={13} />
                        </button>

                        <button
                          onClick={(event) =>
                            handleDeleteNote(note._id, event)
                          }
                          className="notes-delete-btn"
                          title="Delete Note"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <small className="notes-card-date">
                      {note.updatedAt || note.createdAt
                        ? new Date(
                            note.updatedAt || note.createdAt
                          ).toLocaleDateString()
                        : ''}
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

      <main className="notes-editor-area">
        <div
          className="notes-top-action-bar"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '8px',
          }}
        >
          <button
            className="notes-mobile-toggle"
            onClick={() => setShowMobileSidebar((prev) => !prev)}
          >
            <Menu size={16} /> Notes List
          </button>

          <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
            {activeNote && (
              <button
                onClick={handleManualSave}
                disabled={isSaving}
                style={{
                  background: isSaving
                    ? '#10b981'
                    : darkMode
                      ? '#1e293b'
                      : '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  padding: '6px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: isSaving ? 'wait' : 'pointer',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: isSaving
                    ? '#ffffff'
                    : darkMode
                      ? '#f8fafc'
                      : '#334155',
                  transition: 'all 0.2s ease',
                }}
              >
                <Save size={15} />
                {isSaving ? 'Saving...' : 'Save Note'}
              </button>
            )}

            <button
              onClick={() => setIsFullScreen((current) => !current)}
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
                color: darkMode ? '#f8fafc' : '#334155',
              }}
            >
              {isFullScreen ? (
                <Minimize2 size={16} />
              ) : (
                <Maximize2 size={16} />
              )}
              {isFullScreen ? 'Exit Full Screen' : 'Full Screen'}
            </button>
          </div>
        </div>

        <div className={`notes-timer-bar ${modeClass}`}>
          <div className="notes-timer-left">
            <TimerIcon size={20} color="#7FA8D6" />
            <span className="notes-timer-label">Focus Timer:</span>
            <span className="notes-timer-display">
              {formatPomodoroTime(pomodoroSeconds)}
            </span>
          </div>

          <div className="notes-timer-controls">
            <button
              onClick={() => {
                stopAlarmSound();
                setIsPomodoroActive(!isPomodoroActive);
              }}
              className={`timer-btn ${
                isPomodoroActive ? 'pause' : 'play'
              }`}
            >
              {isPomodoroActive ? (
                <Pause size={16} />
              ) : (
                <Play size={16} />
              )}
              {isPomodoroActive ? 'Pause' : 'Start'}
            </button>

            <button
              onClick={() => {
                stopAlarmSound();
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
                onChange={(event) =>
                  setCustomTimerMinutes(event.target.value)
                }
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
                value={activeNote.title || ''}
                onChange={(event) =>
                  handleUpdateActiveNote('title', event.target.value)
                }
              />

              <div className="notes-task-linker">
                Connect task
                <Link size={16} className="notes-link-icon" />

                <select
                  value={activeNote.linkedTaskId || ''}
                  onChange={(event) =>
                    handleUpdateActiveNote(
                      'linkedTaskId',
                      event.target.value || null
                    )
                  }
                  className={`notes-task-select ${modeClass}`}
                >
                  <option value="">Link to Task (Optional)</option>

                  {tasks.map((task) => (
                    <option key={task._id} value={task._id}>
                      {task.title}{' '}
                      {task.subject ? `(${task.subject})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className={`notes-toolbar ${modeClass}`}>
              <button
                onClick={() => applyFormatting('bold')}
                title="Bold"
              >
                <Bold size={16} />
              </button>

              <button
                onClick={() => applyFormatting('italic')}
                title="Italic"
              >
                <Italic size={16} />
              </button>

              <button
                onClick={() =>
                  applyFormatting('hiliteColor', '#FFE08A')
                }
                title="Highlight Yellow"
              >
                <Highlighter size={16} />
              </button>

              <button
                onClick={() => applyFormatting('insertUnorderedList')}
                title="Bullet List"
              >
                <List size={16} />
              </button>

              <button
                onClick={handleAISolve}
                disabled={isAiLoading}
                className="notes-ai-write-btn"
                title="Highlight a problem in your note and click to get AI solution"
              >
                <Sparkles size={16} color="#F59E0B" />
                <span>
                  {isAiLoading ? 'Thinking...' : 'AI Write'}
                </span>
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
                if (editorRef.current && activeNoteId) {
                  handleUpdateActiveNote(
                    'content',
                    editorRef.current.innerHTML,
                    activeNoteId
                  );
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