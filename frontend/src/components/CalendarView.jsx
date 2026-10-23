import { StickyNote } from 'lucide-react';

export default function CalendarView({
  setCurrentMonthDate, year, month, daysInMonth, firstDay, monthNames,
  tasks, calendarNotes, handleNotesChange, theme, darkMode
}) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '15px' }}>
        <div>
          <h2 style={{ margin: '0 0 4px 0', color: theme.text }}>Interactive Calendar 📅</h2>
          <p style={{ color: theme.subText, fontSize: '14px', margin: 0 }}>View assignments mapped across the month alongside your study notes.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button 
            onClick={() => setCurrentMonthDate(new Date(year, month - 1, 1))} 
            style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '13px', color: '#334155' }}
          >
            ← Prev
          </button>
          <h3 style={{ margin: 0, color: theme.text, minWidth: '160px', textAlign: 'center' }}>
            {monthNames[month]} {year}
          </h3>
          <button 
            onClick={() => setCurrentMonthDate(new Date(year, month + 1, 1))} 
            style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '13px', color: '#334155' }}
          >
            Next →
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '20px' }}>
        <div style={{ borderRadius: '12px', border: `1px solid ${theme.border}`, overflow: 'hidden', background: theme.cardBg }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid #e2e8f0', background: 'rgba(0,0,0,0.01)' }}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} style={{ padding: '10px', textAlign: 'center', fontWeight: 'bold', fontSize: '12px', color: theme.subText }}>{d}</div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
            {Array.from({ length: firstDay }).map((_, index) => (
              <div key={`empty-${index}`} style={{ minHeight: '85px', borderRight: `1px solid ${theme.border}`, borderBottom: `1px solid ${theme.border}`, background: 'rgba(0,0,0,0.02)' }} />
            ))}

            {Array.from({ length: daysInMonth }).map((_, index) => {
              const dayNum = index + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const dayTasks = tasks.filter(t => t.dueDate && t.dueDate.startsWith(dateStr));

              return (
                <div key={dayNum} style={{ minHeight: '85px', borderRight: `1px solid ${theme.border}`, borderBottom: `1px solid ${theme.border}`, padding: '6px', boxSizing: 'border-box', background: theme.cardBg }}>
                  <span style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px', color: theme.text }}>{dayNum}</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    {dayTasks.map(t => {
                      const isExam = t.taskType && t.taskType.toLowerCase().includes('exam');
                      return (
                        <div key={t._id} style={{ fontSize: '10px', padding: '2px 4px', borderRadius: '4px', border: '1px solid', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: '600', background: isExam ? '#fef2f2' : '#eff6ff', color: isExam ? '#dc2626' : '#2563eb', borderColor: isExam ? '#fecaca' : '#bfdbfe' }} title={t.title}>
                          {isExam ? '📝 ' : '📘 '}{t.title}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ padding: '20px', borderRadius: '12px', border: `1px solid ${theme.border}`, display: 'flex', flexDirection: 'column', background: theme.cardBg }}>
          <h3 style={{ fontSize: '15px', fontWeight: 'bold', marginTop: 0, marginBottom: '8px', color: theme.text, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <StickyNote size={18} color="#f97316" /> Calendar Notes & Reminders
          </h3>
          <p style={{ fontSize: '12px', color: theme.subText, margin: '0 0 12px 0' }}>Write down study goals for this month.</p>
          <textarea 
            placeholder="Jot down notes or schedule plans here (auto-saved)..."
            value={calendarNotes}
            onChange={handleNotesChange}
            style={{ width: '100%', flex: 1, minHeight: '280px', padding: '12px', borderRadius: '8px', border: `1px solid ${theme.border}`, fontSize: '13px', outline: 'none', resize: 'none', fontFamily: 'inherit', boxSizing: 'border-box', background: darkMode ? '#0f172a' : '#fffbe1', color: theme.text }}
          />
        </div>
      </div>
    </div>
  );
}