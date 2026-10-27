
import { useState } from 'react';
import axios from 'axios';
import { BookOpen } from 'lucide-react';
import "./AIAssistant.css";

const AI_URL = 'http://localhost:5000/api/ai/study-plan';

function AIAssistant({ theme, darkMode, tasks = [] }) {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        'Hi! I’m AcadTrack AI. I can help you create study plans, organize assignments, and prepare for exams. What would you like help with?',
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const colors = {
    panel: theme?.cardBg ?? (darkMode ? '#1e293b' : '#ffffff'),
    background: theme?.bg ?? (darkMode ? '#0f172a' : '#fafafa'),
    text: theme?.text ?? (darkMode ? '#f8fafc' : '#1e293b'),
    muted: theme?.subText ?? (darkMode ? '#94a3b8' : '#64748b'),
    border: theme?.border ?? (darkMode ? '#334155' : '#e2e8f0'),
    assistantBubble: darkMode ? '#334155' : '#f1f5f9',
    accent: '#2563eb',
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const question = prompt.trim();
    if (!question || loading) return;

    setError('');
    setPrompt('');

    setMessages((previous) => [
      ...previous,
      { role: 'user', content: question },
    ]);

    setLoading(true);

    try {
      const response = await axios.post(AI_URL, {
        prompt: `${question}\n\nMy current academic tasks are:\n${
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
        }\n\nUse these tasks as context when relevant. Do not claim to change or save tasks.`,
      });

      setMessages((previous) => [
        ...previous,
        {
          role: 'assistant',
          content: response.data.answer || 'I received an empty response.',
        },
      ]);
    } catch (err) {
      console.error('AcadTrack AI request failed:', err);

      setError(
        err.response?.data?.message ||
          'Unable to contact AcadTrack AI. Check that your backend and Ollama are running.'
      );
    } finally {
      setLoading(false);
    }
  };

  const panelStyle = {
    background: colors.panel,
    color: colors.text,
    border: `1px solid ${colors.border}`,
    borderRadius: '16px',
    boxSizing: 'border-box',
  };

  return (
    <section
      style={{
        width: '100%',
        maxWidth: '900px',
        margin: '0 auto',
        color: colors.text,
        fontFamily: 'Inter, sans-serif',
      }}
    >
     <div style={{ textAlign: 'center', width: '100%' }}>
  <h2 style={{ 
    margin: '0 0 6px', 
    fontSize: '20px', 
    color: colors.text, 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: '8px' 
  }}>
    <span style={{ color: colors.accent, display: 'inline-flex', alignItems: 'center' }}>
      <BookOpen size={18} />
    </span> 
    AcadTrack AI
  </h2>
  <p style={{ color: colors.muted, margin: 0, fontSize: '13px' }}>
    Start with your AI study companion
  </p>
</div>

      <div
        className="acadtrackai-scroll"
        role="log"
        aria-live="polite"
        style={{
          ...panelStyle,
          height: 'min(420px, 48vh)',
          minHeight: '180px',
          overflowY: 'auto',
          padding: '16px',
          marginBottom: '12px',
        }}
      >
        {messages.map((message, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              justifyContent:
                message.role === 'user' ? 'flex-end' : 'flex-start',
              marginBottom: '14px',
            }}
          >
            <div
              style={{
                maxWidth: '90%',
                padding: '11px 13px',
                borderRadius: '14px',
                background:
                  message.role === 'user'
                    ? colors.accent
                    : colors.assistantBubble,
                color:
                  message.role === 'user' ? '#ffffff' : colors.text,
                whiteSpace: 'pre-wrap',
                overflowWrap: 'anywhere',
                lineHeight: 1.55,
                fontSize: '13px',
              }}
            >
              <strong
                style={{
                  display: 'block',
                  marginBottom: '5px',
                  fontSize: '12px',
                }}
              >
                {message.role === 'user' ? 'You' : 'AcadTrack AI'}
              </strong>
              {message.content}
            </div>
          </div>
        ))}

        {loading && (
          <p style={{ color: colors.muted, fontSize: '13px' }}>
            AcadTrack AI is thinking...
          </p>
        )}
      </div>

      {error && (
        <p
          role="alert"
          style={{
            color: darkMode ? '#fca5a5' : '#dc2626',
            fontSize: '12px',
            margin: '0 0 10px',
          }}
        >
          {error}
        </p>
      )}

      <form
        onSubmit={handleSubmit}
        style={{
          ...panelStyle,
          display: 'flex',
          alignItems: 'flex-end',
          gap: '10px',
          padding: '12px',
        }}
      >
        <textarea
          className= "textarea-edit"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ask about study plans or assignments..."
          aria-label="Message AcadTrack AI"
          rows={2}
          disabled={loading}
          style={{
            flex: 1,
            width: 0,
            minWidth: 0,
            resize: 'vertical',
            padding: '10px',
            borderRadius: '10px',
            border: `1px solid ${colors.border}`,
            background: colors.background,
            color: colors.text,
            font: 'inherit',
            fontSize: '13px',
            outlineColor: colors.accent,
            lineHeight: 1.5,
          }}
        />

        <button
          type="submit"
          disabled={loading || !prompt.trim()}
          style={{
            flexShrink: 0,
            padding: '11px 14px',
            border: 'none',
            borderRadius: '10px',
            background: colors.accent,
            color: '#ffffff',
            fontWeight: 600,
            fontSize: '13px',
            cursor: loading || !prompt.trim() ? 'not-allowed' : 'pointer',
            opacity: loading || !prompt.trim() ? 0.6 : 1,
          }}
        >
          {loading ? '...' : 'Send'}
        </button>
      </form>

      <p
        style={{
          color: colors.muted,
          fontSize: '11px',
          lineHeight: 1.5,
          marginTop: '10px',
        }}
      >
        AI responses are suggestions. Always review your academic
        requirements and deadlines.
      </p>
    </section>
  );
}

export default AIAssistant;
