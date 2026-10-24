import { StickyNote, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import './CalendarView.css';

export default function CalendarView({
  setCurrentMonthDate, year, month, daysInMonth, firstDay, monthNames,
  tasks, calendarNotes, handleNotesChange, theme, darkMode
}) {
  return (
    <div className="calendar-layout">
      <div className="calendar-top-row">
        <div>
          <h2 className="calendar-title" style={{ color: theme.text }}>
            <CalendarIcon size={22} color="#4B7B9D" /> Interactive Calendar
          </h2>
        </div>
      </div>
      <div className="calendar-grid-container">
        
        {/* Calendar Box with Wave */}
        <div className={`calendar-card ${darkMode ? 'dark' : 'light'}`}>
          
          <svg className={`calendar-wave-svg ${darkMode ? 'dark' : 'light'}`} viewBox="0 0 1440 320" preserveAspectRatio="none">
            <path fill="#7FA8D6" d="M0,192L48,176C96,160,192,128,288,138.7C384,149,480,203,576,208C672,213,768,171,864,144C960,117,1056,107,1152,122.7C1248,139,1344,181,1392,202.7L1440,224L1440,320L0,320Z"></path>
            <path fill="#4B7B9D" fillOpacity="0.6" d="M0,256L48,229.3C96,203,192,149,288,154.7C384,160,480,224,576,234.7C672,245,768,203,864,181.3C960,160,1056,160,1152,176C1248,192,1344,224,1392,240L1440,256L1440,320L0,320Z"></path>
          </svg>

          {/* Days Header */}
          <div className={`calendar-days-header ${darkMode ? 'dark' : 'light'}`}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className={`calendar-day-label ${darkMode ? 'dark' : 'light'}`}>{d}</div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="calendar-days-grid">
            {Array.from({ length: firstDay }).map((_, index) => (
              <div key={`empty-${index}`} className={`calendar-empty-cell ${darkMode ? 'dark' : 'light'}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, index) => {
              const dayNum = index + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const dayTasks = tasks.filter(t => t.dueDate && t.dueDate.startsWith(dateStr));
              const isToday = new Date().getDate() === dayNum && new Date().getMonth() === month && new Date().getFullYear() === year;
              
              return (
                <div 
                  key={dayNum} 
                  className={`calendar-day-cell ${darkMode ? 'dark' : 'light'} ${isToday ? (darkMode ? 'today-dark' : 'today-light') : ''}`}
                >
                  <span className={`calendar-day-number ${isToday ? 'today' : ''}`} style={{ color: isToday ? '#4B7B9D' : theme.text }}>
                    {dayNum}
                  </span>
                  <div className="calendar-task-list">
                    {dayTasks.map(t => {
                      const isExam = t.taskType && t.taskType.toLowerCase().includes('exam');
                      return (
                        <div 
                          key={t._id} 
                          className={`calendar-task-item ${isExam ? 'exam' : 'standard'}`}
                          title={t.title}
                        >
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

        {/* Right Sidebar */}
        <div className="calendar-sidebar">
          <div className={`calendar-nav-card ${darkMode ? 'dark' : 'light'}`}>
            <button 
              onClick={() => setCurrentMonthDate(new Date(year, month - 1, 1))} 
              className="calendar-nav-btn"
            >
              <ChevronLeft size={14} /> Prev
            </button>
            <span className="calendar-nav-title" style={{ color: theme.text }}>
              {monthNames[month]} {year}
            </span>
            <button 
              onClick={() => setCurrentMonthDate(new Date(year, month + 1, 1))} 
              className="calendar-nav-btn"
            >
              Next <ChevronRight size={14} />
            </button>
          </div>

          <div className={`calendar-notes-card ${darkMode ? 'dark' : 'light'}`}>
            <h3 className="calendar-notes-header" style={{ color: theme.text }}>
              <StickyNote size={18} color="#4B7B9D" /> Calendar Notes & Reminders
            </h3>
            <p className="calendar-notes-desc" style={{ color: theme.subText }}>Write down study goals for this month.</p>
            <textarea 
              placeholder="Write down your important notes or schedule plans here (auto-saved)..."
              value={calendarNotes}
              onChange={handleNotesChange}
              className={`calendar-notes-area ${darkMode ? 'dark' : 'light'}`}
              style={{ color: theme.text }}
            />
          </div>
        </div>

      </div>
    </div>
  );
}