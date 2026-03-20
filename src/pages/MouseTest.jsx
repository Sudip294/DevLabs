import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FiMousePointer } from 'react-icons/fi';

export default function MouseTest() {
  const [clickSpeed, setClickSpeed] = useState(0);
  const [scrollSpeed, setScrollSpeed] = useState(0);
  const [buttonsPressed, setButtonsPressed] = useState([]);
  const lastClickTime = useRef(0);
  const scrollTimeout = useRef(null);
  
  const handleMouseDown = (e) => {
    const now = performance.now();
    if (lastClickTime.current) {
      const diff = now - lastClickTime.current;
      setClickSpeed(Math.round(diff));
    }
    lastClickTime.current = now;
    
    setButtonsPressed(prev => {
      const newBtns = [...prev];
      if (!newBtns.includes(e.button)) newBtns.push(e.button);
      return newBtns;
    });
  };

  const handleMouseUp = (e) => {
    setButtonsPressed(prev => prev.filter(b => b !== e.button));
  };

  const handleScroll = (e) => {
    setScrollSpeed(Math.abs(e.deltaY));
    if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    scrollTimeout.current = setTimeout(() => {
      setScrollSpeed(0);
    }, 150);
  };

  useEffect(() => {
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('wheel', handleScroll, { passive: true });
    
    const preventContext = (e) => e.preventDefault();
    window.addEventListener('contextmenu', preventContext);

    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('wheel', handleScroll);
      window.removeEventListener('contextmenu', preventContext);
    };
  }, []);

  const getButtonName = (btn) => {
    if (btn === 0) return 'Left Click';
    if (btn === 1) return 'Middle Click';
    if (btn === 2) return 'Right Click';
    return `Button ${btn}`;
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="mb-6">
        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-500 to-emerald-500">Mouse Diagnostics</h2>
        <p className="text-slate-600 dark:text-slate-400">Test double-click speed, scroll wheel, and button functions. Avoid clicking links to test properly.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8 flex flex-col items-center justify-center min-h-[350px] relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none flex items-center justify-center">
             <FiMousePointer className="text-[250px] text-green-500"/>
          </div>
          
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-8 z-10">Active Buttons</h3>
          <div className="flex gap-4 z-10">
            {[0,1,2].map(btn => (
              <div key={btn} className={`w-24 h-32 rounded-xl border-2 flex flex-col items-center justify-center text-center p-2 transition-all duration-100 ${buttonsPressed.includes(btn) ? 'bg-green-500/20 border-green-500 text-green-600 dark:text-green-400 scale-95 shadow-[0_0_20px_rgba(34,197,94,0.3)]' : 'bg-black/5 dark:bg-white/5 border-slate-300 dark:border-white/10 text-slate-500'}`}>
                <span className="font-medium text-sm">{getButtonName(btn)}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <div className="space-y-6">
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Double Click Speed</h3>
            <div className="flex items-end gap-2 mb-2">
              <span className={`text-5xl font-bold font-mono transition-colors ${clickSpeed > 0 && clickSpeed < 120 ? 'text-green-500' : 'text-slate-700 dark:text-slate-300'}`}>{clickSpeed}</span>
              <span className="text-slate-500 dark:text-slate-400 mb-1">ms delay</span>
            </div>
            {clickSpeed > 0 && clickSpeed < 120 ? (
              <span className="text-sm text-green-500 font-medium">Excellent double-click!</span>
            ) : (
              <span className="text-sm text-slate-500">Fast double clicks should be &lt; 120ms</span>
            )}
          </div>
          
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Scroll Precision</h3>
            <div className="relative h-4 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
              <motion.div 
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-500 to-emerald-400"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((scrollSpeed / 100) * 100, 100)}%` }}
                transition={{ type: "spring", bounce: 0 }}
              />
            </div>
            <div className="mt-3 flex justify-between text-sm text-slate-500 font-mono">
              <span>Idle</span>
              <span>Fast</span>
            </div>
            <div className="mt-2 text-center text-2xl font-mono text-emerald-500">
               {scrollSpeed > 0 ? scrollSpeed : '0'} px
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
