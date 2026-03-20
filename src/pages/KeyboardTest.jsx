import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export default function KeyboardTest() {
  const [lastEvent, setLastEvent] = useState(null);
  const [latency, setLatency] = useState(0);
  const [history, setHistory] = useState([]);
  const timeRef = useRef(0);

  useEffect(() => {
    const handleKeyDown = (e) => {
      e.preventDefault();
      const now = performance.now();
      timeRef.current = now;
      setLastEvent({ type: 'keydown', key: e.key, code: e.code });
    };

    const handleKeyUp = (e) => {
      e.preventDefault();
      const now = performance.now();
      if (lastEvent && lastEvent.code === e.code) {
        const diff = Math.round(now - timeRef.current);
        setLatency(diff);
        setHistory(prev => [{ key: e.key, code: e.code, latency: diff }, ...prev].slice(0, 10));
      }
      setLastEvent({ type: 'keyup', key: e.key, code: e.code });
      
      setTimeout(() => setLastEvent(null), 800);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [lastEvent]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-cyan-500">Keyboard Diagnostics</h2>
          <p className="text-slate-600 dark:text-slate-400">Press any key to test latency and response.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-8 flex flex-col items-center justify-center min-h-[300px]"
        >
          {lastEvent ? (
            <motion.div
              key={lastEvent.code}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center"
            >
              <div className="text-9xl mb-4 text-blue-500 font-mono font-bold tracking-tighter">
                {lastEvent.key === ' ' ? 'SPACE' : lastEvent.key.toUpperCase()}
              </div>
              <div className="text-2xl text-slate-500 font-mono">{lastEvent.code}</div>
              <div className="mt-4 inline-flex items-center px-4 py-2 rounded-full bg-blue-500/10 text-blue-500 font-semibold gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                </span>
                {lastEvent.type.toUpperCase()}
              </div>
            </motion.div>
          ) : (
            <div className="text-slate-400 text-xl font-light">Waiting for input...</div>
          )}
        </motion.div>

        <div className="space-y-6">
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Metrics</h3>
            <div className="flex items-end gap-2">
              <span className="text-5xl font-bold font-mono text-cyan-500">{latency}</span>
              <span className="text-slate-500 mb-1 dark:text-slate-400">ms latency</span>
            </div>
          </div>
          
          <div className="glass-card p-6 flex-1 max-h-[220px] overflow-y-auto custom-scrollbar">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Recent History</h3>
            <ul className="space-y-2">
              {history.map((item, i) => (
                <li key={i} className="flex justify-between items-center py-2 px-3 rounded-lg bg-black/5 dark:bg-white/5 font-mono text-sm">
                  <span className="text-slate-900 dark:text-slate-200">[{item.code}]</span>
                  <span className="text-cyan-600 dark:text-cyan-400">{item.latency}ms</span>
                </li>
              ))}
              {history.length === 0 && <li className="text-slate-500 text-sm">No recent keys.</li>}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
