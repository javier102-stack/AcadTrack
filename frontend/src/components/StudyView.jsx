import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Timer as TimerIcon } from 'lucide-react';
import './StudyView.css';

export default function StudyView({ theme, darkMode }) {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [customInput, setCustomInput] = useState(25);
  const [activePreset, setActivePreset] = useState('25m');
  const intervalRef = useRef(null);

  const totalSeconds = (customInput || 25) * 60;
  const currentRemainingSeconds = minutes * 60 + seconds;
  const progressPercent = totalSeconds > 0 ? (currentRemainingSeconds / totalSeconds) : 0;
  
  const radius = 110;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progressPercent);

  const playAlarmSound = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const playBeep = (freq, startTime, duration) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime + startTime);
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime + startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + startTime + duration);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(audioCtx.currentTime + startTime);
        osc.stop(audioCtx.currentTime + startTime + duration);
      };
      playBeep(587.33, 0, 0.2); 
      playBeep(880, 0.25, 0.4);   
      playBeep(587.33, 0.7, 0.2); 
      playBeep(880, 0.95, 0.5);   
    } catch (e) {
      console.log('Audio playback error:', e);
    }
  };

  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        if (seconds > 0) {
          setSeconds(prev => prev - 1);
        } else if (minutes > 0) {
          setMinutes(prev => prev - 1);
          setSeconds(59);
        } else {
          clearInterval(intervalRef.current);
          setIsActive(false);
          playAlarmSound(); 
        }
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isActive, minutes, seconds]);

  const handleStartPause = () => { setIsActive(!isActive); };
  
  const handleReset = () => {
    setIsActive(false);
    setMinutes(customInput);
    setSeconds(0);
  };

  const setPreset = (mins, presetLabel) => {
    setIsActive(false);
    setCustomInput(mins);
    setMinutes(mins);
    setSeconds(0);
    setActivePreset(presetLabel);
  };

  const handleCustomChange = (e) => {
    const val = parseInt(e.target.value) || 0;
    setCustomInput(val);
    setMinutes(val);
    setSeconds(0);
    setActivePreset('custom');
  };

  return (
    <div className="study-wrapper">
      <div className={`study-card ${darkMode ? 'dark' : 'light'}`}>
        
        <h2 className="study-title" style={{ color: theme.text }}>
          <TimerIcon size={24} color="#4B7B9D" /> Custom Focus Study Room
        </h2>

        <div className="preset-group">
          <button 
            onClick={() => setPreset(25, '25m')}
            className={`preset-btn ${activePreset === '25m' ? 'focus-active' : (darkMode ? 'focus-inactive-dark' : 'focus-inactive-light')}`}
            style={{ color: activePreset === '25m' ? '#ffffff' : (darkMode ? theme.text : '#4B7B9D') }}
          >
            25m Focus
          </button>
          
          <button 
            onClick={() => setPreset(5, '5m')}
            className={`preset-btn ${activePreset === '5m' ? 'break-active' : (darkMode ? 'break-inactive-dark' : 'break-inactive-light')}`}
            style={{ color: activePreset === '5m' ? '#ffffff' : (darkMode ? theme.text : '#047857') }}
          >
            5m Break
          </button>
        </div>

        <div className="custom-input-group">
          <span className="custom-input-label" style={{ color: theme.subText }}>Custom Minutes:</span>
          <input 
            type="number" min="1" max="180" value={customInput} onChange={handleCustomChange}
            className={`custom-input ${darkMode ? 'dark' : 'light'}`}
            style={{ color: theme.text }} 
          />
        </div>

        <div className="timer-ring-container">
          <svg width="260" height="260" className="timer-svg">
            <circle cx="130" cy="130" r={radius} stroke={darkMode ? '#334155' : '#EBF4FB'} strokeWidth={strokeWidth} fill="transparent" />
            <circle cx="130" cy="130" r={radius} stroke="#4B7B9D" strokeWidth={strokeWidth} fill="transparent" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }} />
          </svg>
          <div className="timer-text-overlay">
            <span className="timer-digits" style={{ color: theme.text }}>
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
          </div>
        </div>

        <div className="study-controls">
          <button 
            onClick={handleStartPause}
            className={`btn-start-pause ${isActive ? 'active' : 'inactive'}`}
          >
            {isActive ? <><Pause size={18} /> Pause Focus</> : <><Play size={18} /> Start Focus</>}
          </button>
          
          <button 
            onClick={handleReset}
            className={`btn-reset ${darkMode ? 'dark' : 'light'}`}
            style={{ color: darkMode ? theme.text : '#4B7B9D' }}
          >
            <RotateCcw size={18} /> Reset Timer
          </button>
        </div>

      </div>
    </div>
  );
}