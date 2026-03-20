import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FiRotateCcw } from 'react-icons/fi';

const GRID_COLS = 10;
const GRID_ROWS = 14;
const TOTAL = GRID_COLS * GRID_ROWS;

export default function SensorsTest() {
  const [touched, setTouched] = useState(new Set());
  const [activePoints, setActivePoints] = useState([]);
  const gridRef = useRef(null);

  // Mark cell touched from a client coordinate
  const markFromPoint = useCallback((clientX, clientY) => {
    if (!gridRef.current) return;
    const rect = gridRef.current.getBoundingClientRect();
    const col = Math.floor(((clientX - rect.left) / rect.width) * GRID_COLS);
    const row = Math.floor(((clientY - rect.top) / rect.height) * GRID_ROWS);
    if (col < 0 || col >= GRID_COLS || row < 0 || row >= GRID_ROWS) return;
    const idx = row * GRID_COLS + col;
    setTouched(prev => new Set([...prev, idx]));
  }, []);

  const handleTouchMove = (e) => {
    e.preventDefault();
    const points = [];
    for (let t of e.touches) {
      markFromPoint(t.clientX, t.clientY);
      points.push({ id: t.identifier, x: t.clientX, y: t.clientY });
    }
    setActivePoints(points);
  };

  const handleTouchEnd = (e) => {
    if (e.touches.length === 0) setActivePoints([]);
  };

  const handleMouseMove = (e) => {
    if (e.buttons !== 1) return;
    markFromPoint(e.clientX, e.clientY);
  };

  const reset = () => { setTouched(new Set()); setActivePoints([]); };
  const coverage = Math.round((touched.size / TOTAL) * 100);

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-teal-500">Touch & Sensor Test</h2>
          <p className="text-slate-600 dark:text-slate-400">Swipe across the grid to detect dead touch zones. Every cell should light up.</p>
        </div>
        <button onClick={reset} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-700 dark:text-slate-300 transition-all">
          <FiRotateCcw /> Reset
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stats */}
        <div className="space-y-4">
          <div className="glass-card p-6">
            <div className="text-sm text-slate-500 mb-2">Coverage</div>
            <div className="text-5xl font-black font-mono text-emerald-500">{coverage}%</div>
            <div className="mt-4 h-2 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
              <motion.div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full" animate={{ width: `${coverage}%` }} transition={{ type: 'spring', bounce: 0 }} />
            </div>
          </div>

          <div className="glass-card p-6 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Cells touched</span>
              <span className="font-mono font-semibold text-slate-900 dark:text-white">{touched.size} / {TOTAL}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Cells remaining</span>
              <span className="font-mono font-semibold text-slate-900 dark:text-white">{TOTAL - touched.size}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Active fingers</span>
              <span className="font-mono font-semibold text-emerald-500">{activePoints.length}</span>
            </div>
          </div>

          {coverage === 100 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5 border border-emerald-500/30 bg-emerald-500/5 text-center">
              <div className="text-3xl mb-2">✅</div>
              <div className="font-semibold text-emerald-500">No dead zones found!</div>
              <div className="text-sm text-slate-500 mt-1">Touch surface is fully functional.</div>
            </motion.div>
          )}

          <div className="glass-card p-4 text-xs text-slate-500 leading-relaxed">
            <span className="text-emerald-500 font-semibold">Tip:</span> On mobile, use multiple fingers and swipe in all directions. Cells that stay dark indicate a dead touch zone.
          </div>
        </div>

        {/* Grid */}
        <div className="lg:col-span-2">
          <div
            ref={gridRef}
            className="rounded-2xl border border-white/10 overflow-hidden select-none touch-none cursor-crosshair"
            style={{ display: 'grid', gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)` }}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchEnd}
            onMouseMove={handleMouseMove}
          >
            {Array.from({ length: TOTAL }).map((_, i) => (
              <div
                key={i}
                className={`aspect-square border border-white/[0.04] transition-colors duration-150 ${touched.has(i) ? 'bg-emerald-500/60' : 'bg-white/[0.03] hover:bg-white/10'}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
