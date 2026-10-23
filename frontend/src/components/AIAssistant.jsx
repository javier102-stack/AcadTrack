
import { useState } from 'react';
import axios from 'axios';

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
    background: theme.cardBg,
    color: theme.text,
    border: `1px solid ${theme.border}`,
    borderRadius: '16px',
    padding: '24px',
  };

  return (
    <section style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ marginBottom: '8px' }}>AcadTrack AI Assistant</h1>
        <p style={{ color: theme.subText, margin: 0 }}>
          Your AI study companion, powered by Ollama.
        </p>
      </div>

      <div
        style={{
          ...panelStyle,
          minHeight: '380px',
          maxHeight: '55vh',
          overflowY: 'auto',
          marginBottom: '16px',
        }}
      >
        {messages.map((message, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              justifyContent:
                message.role === 'user' ? 'flex-end' : 'flex-start',
              marginBottom: '16px',
            }}
          >
            <div
              style={{
                maxWidth: '85%',
                padding: '14px 16px',
                borderRadius: '14px',
                background:
                  message.role === 'user'
                    ? '#2563eb'
                    : darkMode
                      ? '#334155'
                      : '#f1f5f9',
                color:
                  message.role === 'user' ? '#ffffff' : theme.text,
                whiteSpace: 'pre-wrap',
                overflowWrap: 'anywhere',
                lineHeight: 1.6,
              }}
            >
              <strong style={{ display: 'block', marginBottom: '6px' }}>
                {message.role === 'user' ? 'You' : 'AcadTrack AI'}
              </strong>
              {message.content}
            </div>
          </div>
        ))}

        {loading && (
          <p style={{ color: theme.subText }}>
            AcadTrack AI is thinking...
          </p>
        )}
      </div>

      {error && (
        <p role="alert" style={{ color: '#ef4444', marginBottom: '12px' }}>
          {error}
        </p>
      )}

      <form
        onSubmit={handleSubmit}
        style={{ ...panelStyle, display: 'flex', gap: '12px' }}
      >
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ask for a study plan, exam tips, or help organizing assignments..."
          aria-label="Message AcadTrack AI"
          rows={3}
          disabled={loading}
          style={{
            flex: 1,
            minWidth: 0,
            resize: 'vertical',
            padding: '12px',
            borderRadius: '10px',
            border: `1px solid ${theme.border}`,
            background: theme.bg,
            color: theme.text,
            font: 'inherit',
          }}
        />

        <button
          type="submit"
          disabled={loading || !prompt.trim()}
          style={{
            alignSelf: 'flex-end',
            padding: '12px 18px',
            border: 'none',
            borderRadius: '10px',
            background: '#2563eb',
            color: '#ffffff',
            cursor: loading ? 'wait' : 'pointer',
            opacity: loading || !prompt.trim() ? 0.6 : 1,
          }}
        >
          {loading ? 'Thinking...' : 'Send'}
        </button>
      </form>

      <p style={{ color: theme.subText, fontSize: '12px', marginTop: '12px' }}>
        AI responses are suggestions. Review your deadlines and academic
        requirements before making decisions.
      </p>
    </section>
  );
}   

export default AIAssistant;
