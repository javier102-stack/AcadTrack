import { Timer, Play, Pause, RotateCcw } from 'lucide-react';

export default function StudyView({
  customMinutesInput, setCustomTimerMinutes, pomodoroSeconds, formatPomodoroTime,
  isPomodoroActive, setIsPomodoroActive, theme, darkMode
}) {
  return (
    <div>
      <div style={{ padding: '50px 40px', borderRadius: '16px', border: `1px solid ${theme.border}`, maxWidth: '650px', margin: '20px auto', textAlign: 'center', background: theme.cardBg }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '10px' }}>
          <Timer size={28} color="#f97316" />
          <h2 style={{ margin: 0, color: theme.text, fontSize: '24px' }}>Custom Focus Study Room</h2>
        </div>
        <p style={{ color: theme.subText, fontSize: '14px', marginBottom: '35px' }}>Set your desired study session duration and maintain deep focus.</p>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
            <button onClick={() => setCustomTimerMinutes(25)} style={{ padding: '8px 16px', border: 'none', borderRadius: '20px', cursor: 'pointer', fontWeight: '600', fontSize: '13px', background: customMinutesInput === 25 ? '#f97316' : (darkMode ? '#334155' : '#f1f5f9'), color: customMinutesInput === 25 ? '#fff' : theme.text }}>25m Focus</button>
            <button onClick={() => setCustomTimerMinutes(5)} style={{ padding: '8px 16px', border: 'none', borderRadius: '20px', cursor: 'pointer', fontWeight: '600', fontSize: '13px', background: customMinutesInput === 5 ? '#10b981' : (darkMode ? '#334155' : '#f1f5f9'), color: customMinutesInput === 5 ? '#fff' : theme.text }}>5m Break</button>
            <button onClick={() => setCustomTimerMinutes(15)} style={{ padding: '8px 16px', border: 'none', borderRadius: '20px', cursor: 'pointer', fontWeight: '600', fontSize: '13px', background: customMinutesInput === 15 ? '#2563eb' : (darkMode ? '#334155' : '#f1f5f9'), color: customMinutesInput === 15 ? '#fff' : theme.text }}>15m Break</button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '5px' }}>
            <label style={{ fontSize: '13px', fontWeight: 'bold', color: theme.subText }}>Custom Minutes:</label>
            <input 
              type="number" min="1" max="180" value={customMinutesInput}
              onChange={(e) => setCustomTimerMinutes(e.target.value)}
              style={{ width: '70px', padding: '6px 10px', borderRadius: '6px', border: `1px solid ${theme.border}`, fontSize: '14px', textAlign: 'center', fontWeight: 'bold', outline: 'none', background: theme.cardBg, color: theme.text }}
            />
          </div>
        </div>

        <div style={{ margin: '15px 0' }}>
          <h1 style={{ fontSize: '80px', fontWeight: 'bold', margin: '30px 0', color: theme.text, letterSpacing: '2px' }}>
            {formatPomodoroTime(pomodoroSeconds)}
          </h1>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '25px' }}>
          <button 
            onClick={() => setIsPomodoroActive(!isPomodoroActive)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', border: 'none', padding: '12px 28px', borderRadius: '8px', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer', background: isPomodoroActive ? '#ef4444' : '#10b981' }}
          >
            {isPomodoroActive ? <><Pause size={20} /> Pause Focus</> : <><Play size={20} /> Start Focus</>}
          </button>
          <button onClick={() => setCustomTimerMinutes(customMinutesInput)} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#e2e8f0', color: '#334155', border: 'none', padding: '12px 20px', borderRadius: '8px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer' }}>
            <RotateCcw size={18} /> Reset Timer
          </button>
        </div>
      </div>
    </div>
  );
}