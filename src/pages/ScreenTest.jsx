import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const colors = ['#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF'];

export default function ScreenTest() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showHud, setShowHud] = useState(true);
  const [colorIndex, setColorIndex] = useState(0);
  const [fps, setFps] = useState(0);
  const [maxFps, setMaxFps] = useState(0);
  const requestRef = useRef();
  const fpsTimeRef = useRef(performance.now());
  const framesRef = useRef(0);
  const containerRef = useRef(null);
  const hudTimerRef = useRef(null);

  useEffect(() => {
    const calcFPS = () => {
      const now = performance.now();
      framesRef.current++;
      if (now - fpsTimeRef.current >= 1000) {
        setFps(framesRef.current);
        setMaxFps(prev => Math.max(prev, framesRef.current));
        framesRef.current = 0;
        fpsTimeRef.current = now;
      }
      requestRef.current = requestAnimationFrame(calcFPS);
    };
    requestRef.current = requestAnimationFrame(calcFPS);
    return () => cancelAnimationFrame(requestRef.current);
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const fs = !!document.fullscreenElement;
      setIsFullscreen(fs);

      // When entering fullscreen show HUD and auto-hide after 5s
      if (fs) {
        setShowHud(true);
        if (hudTimerRef.current) clearTimeout(hudTimerRef.current);
        hudTimerRef.current = setTimeout(() => {
          setShowHud(false);
          hudTimerRef.current = null;
        }, 5000);
      } else {
        // Leaving fullscreen: clear timer and ensure HUD visible when returning
        if (hudTimerRef.current) {
          clearTimeout(hudTimerRef.current);
          hudTimerRef.current = null;
        }
        setShowHud(true);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      if (hudTimerRef.current) {
        clearTimeout(hudTimerRef.current);
        hudTimerRef.current = null;
      }
    };
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(err => console.error(err));
    } else {
      document.exitFullscreen();
    }
  };

  const cycleColor = () => {
    setColorIndex((prev) => (prev + 1) % colors.length);
  };

  if (isFullscreen) {
    return (
      <div 
        className="fixed inset-0 z-[100] flex flex-col items-center justify-center cursor-pointer select-none"
        style={{ backgroundColor: colors[colorIndex] }}
        onClick={cycleColor}
      >
        <div className={`absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-md font-mono text-xl backdrop-blur-md border border-white/10 shadow-lg transition-opacity duration-700 ${showHud ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
           FPS: {fps}
        </div>
        <div className={`absolute bottom-6 sm:bottom-10 inset-x-0 px-4 sm:px-0 text-center transition-opacity duration-700 ${showHud ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
           <span className={`inline-block px-3 py-2 rounded-full font-medium shadow-xl max-w-[90%] sm:max-w-md mx-auto text-sm sm:text-base md:text-lg ${colors[colorIndex] === '#FFFFFF' ? 'bg-black/20 text-black border border-black/10' : 'bg-white/20 text-white border border-white/10'} backdrop-blur-md transition-colors break-words`}> 
             <span className="sm:hidden">Tap to change color.</span>
             <span className="hidden sm:inline">Click anywhere to change color. Press ESC to exit.</span>
           </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" ref={containerRef}>
      <div className="mb-6">
        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-fuchsia-500">Screen Diagnostics</h2>
        <p className="text-slate-600 dark:text-slate-400">Test for dead pixels, backlight bleed, and monitor refresh rate (FPS).</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-10 flex flex-col items-center justify-center min-h-[300px] text-center">
          <div className="w-16 h-16 bg-purple-500/20 text-purple-500 rounded-full flex items-center justify-center mb-6 border border-purple-500/30 shadow-[0_0_30px_rgba(168,85,247,0.2)]">
             <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
             </svg>
          </div>
          <button 
            onClick={toggleFullscreen}
            className="px-8 py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-semibold shadow-lg shadow-purple-600/30 transition-all hover:-translate-y-1 active:scale-95 duration-200"
          >
            Start Fullscreen Test
          </button>
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
            This will launch a full-display overlay to help you visually locate dead pixels by cycling RGB colors.
          </p>
        </motion.div>

        <div className="space-y-6">
          <div className="glass-card p-10 flex flex-col items-center justify-center min-h-[300px] relative overflow-hidden">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2 z-10">Live Refresh Rate</h3>
            
            <motion.div 
               key={fps}
               initial={{ opacity: 0.8, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               className="text-[5rem] font-black font-mono text-fuchsia-500 tracking-tighter my-4 drop-shadow-[0_0_20px_rgba(217,70,239,0.3)] z-10"
            >
              {fps}
            </motion.div>
            
            <p className="text-sm text-slate-600 dark:text-slate-400 text-center font-medium z-10 bg-black/5 dark:bg-white/5 py-2 px-4 rounded-full">
              Maximum observed: <span className="text-slate-900 dark:text-white">{maxFps} Hz</span>
            </p>
            
            <div className="absolute inset-0 z-0 flex items-center justify-center opacity-5 pointer-events-none">
              <span className="text-[20rem] font-black tracking-tighter mix-blend-overlay">FPS</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
