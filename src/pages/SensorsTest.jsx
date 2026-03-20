import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

// Clamp helper
const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

// 3-axis bar
function AxisBar({ label, value, max = 180, color }) {
  const pct = ((value + max) / (max * 2)) * 100;
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-sm">
        <span className="text-slate-500 font-medium">{label}</span>
        <span className="font-mono font-bold" style={{ color }}>{value.toFixed(1)}°</span>
      </div>
      <div className="relative h-2.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
        {/* center marker */}
        <div className="absolute top-0 left-1/2 w-px h-full bg-white/20" />
        <motion.div
          className="absolute top-0 h-full rounded-full"
          style={{ backgroundColor: color, left: '50%', transformOrigin: 'left center' }}
          animate={{ width: `${Math.abs(pct - 50)}%`, translateX: value < 0 ? `-100%` : '0%' }}
          transition={{ type: 'spring', stiffness: 200, damping: 25 }}
        />
      </div>
    </div>
  );
}

// Bubble level component
function BubbleLevel({ beta, gamma }) {
  const bx = clamp((gamma / 45) * 50 + 50, 5, 95);
  const by = clamp((beta / 45) * 50 + 50, 5, 95);
  const isLevel = Math.abs(beta) < 3 && Math.abs(gamma) < 3;
  return (
    <div className="relative w-full aspect-square max-w-[220px] mx-auto rounded-full border-2 border-white/10 bg-black/20 overflow-hidden">
      {/* crosshairs */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-full h-px bg-white/10" />
      </div>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="h-full w-px bg-white/10" />
      </div>
      {/* center target */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-8 h-8 rounded-full border-2 border-white/20" />
      </div>
      {/* bubble */}
      <motion.div
        className={`absolute w-10 h-10 rounded-full border-2 shadow-lg transition-colors duration-300 ${isLevel ? 'border-emerald-400 bg-emerald-500/40 shadow-emerald-500/30' : 'border-sky-400 bg-sky-500/30 shadow-sky-500/20'}`}
        animate={{ left: `calc(${bx}% - 20px)`, top: `calc(${by}% - 20px)` }}
        transition={{ type: 'spring', stiffness: 150, damping: 20 }}
      />
    </div>
  );
}

export default function SensorsPage() {
  const [orientation, setOrientation] = useState({ alpha: 0, beta: 0, gamma: 0 });
  const [motion_, setMotion] = useState({ x: 0, y: 0, z: 0 });
  const [supported, setSupported] = useState({ orientation: false, motion: false });
  const [permissionGranted, setPermissionGranted] = useState(false);
  const smoothed = useRef({ alpha: 0, beta: 0, gamma: 0, x: 0, y: 0, z: 0 });

  const lerp = (a, b, t) => a + (b - a) * t;

  const startListeners = () => {
    const hasOrientation = 'DeviceOrientationEvent' in window;
    const hasMotion = 'DeviceMotionEvent' in window;
    setSupported({ orientation: hasOrientation, motion: hasMotion });

    if (hasOrientation) {
      window.addEventListener('deviceorientation', (e) => {
        smoothed.current.alpha = lerp(smoothed.current.alpha, e.alpha ?? 0, 0.3);
        smoothed.current.beta  = lerp(smoothed.current.beta,  e.beta  ?? 0, 0.3);
        smoothed.current.gamma = lerp(smoothed.current.gamma, e.gamma ?? 0, 0.3);
        setOrientation({ alpha: smoothed.current.alpha, beta: smoothed.current.beta, gamma: smoothed.current.gamma });
      });
    }

    if (hasMotion) {
      window.addEventListener('devicemotion', (e) => {
        const acc = e.accelerationIncludingGravity;
        if (!acc) return;
        smoothed.current.x = lerp(smoothed.current.x, acc.x ?? 0, 0.3);
        smoothed.current.y = lerp(smoothed.current.y, acc.y ?? 0, 0.3);
        smoothed.current.z = lerp(smoothed.current.z, acc.z ?? 0, 0.3);
        setMotion({ x: smoothed.current.x, y: smoothed.current.y, z: smoothed.current.z });
      });
    }

    setPermissionGranted(true);
    toast.success('Sensors connected!');
  };

  const requestPermission = async () => {
    // iOS 13+ requires explicit permission
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      try {
        const res = await DeviceOrientationEvent.requestPermission();
        if (res === 'granted') startListeners();
        else toast.error('Sensor permission denied.');
      } catch {
        toast.error('Could not request sensor permission.');
      }
    } else {
      startListeners();
    }
  };

  useEffect(() => {
    return () => {
      // cleanup - no-op since window listeners persist but effect is minor
    };
  }, []);

  const isLevel = Math.abs(orientation.beta) < 3 && Math.abs(orientation.gamma) < 3;

  return (
    <div className="space-y-6 pb-10">
      <div className="mb-6">
        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-500 to-indigo-500">Motion & Orientation</h2>
        <p className="text-slate-600 dark:text-slate-400">Read gyroscope, accelerometer, and compass data from your device sensors.</p>
      </div>

      {!permissionGranted ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-12 flex flex-col items-center text-center max-w-md mx-auto gap-6">
          <div className="w-20 h-20 rounded-2xl bg-violet-500/10 flex items-center justify-center border border-violet-500/20 text-5xl">📱</div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Enable Device Sensors</h3>
            <p className="text-slate-500 text-sm">Access to gyroscope and motion sensors may require permission on some devices. Works best on a physical mobile device.</p>
          </div>
          <button
            onClick={requestPermission}
            className="px-8 py-4 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-semibold shadow-lg shadow-violet-600/30 transition-all hover:-translate-y-0.5 active:scale-95"
          >
            Enable Sensors
          </button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bubble level + compass */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-slate-900 dark:text-white">Bubble Level</h3>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${isLevel ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-sky-500/10 text-sky-500 border border-sky-500/20'}`}>
                {isLevel ? '✓ Level' : 'Tilted'}
              </span>
            </div>

            <BubbleLevel beta={orientation.beta} gamma={orientation.gamma} />

            {/* Compass */}
            <div className="flex flex-col items-center gap-2">
              <span className="text-sm text-slate-500">Compass Heading</span>
              <div className="relative w-16 h-16">
                <motion.div
                  className="w-full h-full"
                  animate={{ rotate: -orientation.alpha }}
                  transition={{ type: 'spring', stiffness: 80, damping: 15 }}
                >
                  <svg viewBox="0 0 64 64" className="w-full h-full">
                    <circle cx="32" cy="32" r="30" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
                    <text x="32" y="12" textAnchor="middle" fontSize="10" fill="rgba(239,68,68,0.9)" fontWeight="bold">N</text>
                    <text x="32" y="58" textAnchor="middle" fontSize="10" fill="rgba(148,163,184,0.6)" fontWeight="bold">S</text>
                    <text x="8" y="36" textAnchor="middle" fontSize="10" fill="rgba(148,163,184,0.6)" fontWeight="bold">W</text>
                    <text x="56" y="36" textAnchor="middle" fontSize="10" fill="rgba(148,163,184,0.6)" fontWeight="bold">E</text>
                    <line x1="32" y1="10" x2="32" y2="32" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
                    <line x1="32" y1="32" x2="32" y2="52" stroke="rgba(148,163,184,0.5)" strokeWidth="3" strokeLinecap="round" />
                    <circle cx="32" cy="32" r="4" fill="white" />
                  </svg>
                </motion.div>
              </div>
              <span className="font-mono text-xl font-bold text-violet-500">{Math.round(orientation.alpha)}°</span>
            </div>
          </motion.div>

          {/* Orientation + Accelerometer */}
          <div className="space-y-5">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6 space-y-5">
              <h3 className="font-semibold text-slate-900 dark:text-white">Orientation (Gyroscope)</h3>
              <AxisBar label="Alpha (Z-axis rotation)" value={orientation.alpha} max={180} color="#a78bfa" />
              <AxisBar label="Beta (X-axis tilt)" value={orientation.beta} max={90} color="#22d3ee" />
              <AxisBar label="Gamma (Y-axis tilt)" value={orientation.gamma} max={90} color="#34d399" />
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6 space-y-5">
              <h3 className="font-semibold text-slate-900 dark:text-white">Accelerometer (m/s²)</h3>
              {[
                { label: 'X axis', value: motion_.x, color: '#f87171' },
                { label: 'Y axis', value: motion_.y, color: '#fbbf24' },
                { label: 'Z axis', value: motion_.z, color: '#60a5fa' },
              ].map(ax => (
                <div key={ax.label} className="flex justify-between items-center">
                  <span className="text-slate-500 text-sm">{ax.label}</span>
                  <span className="font-mono font-bold text-lg" style={{ color: ax.color }}>{ax.value.toFixed(2)}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
}
