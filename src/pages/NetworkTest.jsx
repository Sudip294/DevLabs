import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { FiWifi, FiRefreshCw } from 'react-icons/fi';
import toast from 'react-hot-toast';

// A ~10MB test file hosted on Cloudflare's CDN (no-cors issues)
const TEST_FILES = [
  { label: '1 MB', url: 'https://speed.cloudflare.com/__down?bytes=1000000', size: 1_000_000 },
  { label: '5 MB', url: 'https://speed.cloudflare.com/__down?bytes=5000000', size: 5_000_000 },
  { label: '10 MB', url: 'https://speed.cloudflare.com/__down?bytes=10000000', size: 10_000_000 },
];

function SpeedGauge({ value, max = 500 }) {
  const pct = Math.min(value / max, 1);
  const angle = pct * 180 - 90;
  const color = value > 100 ? '#22c55e' : value > 25 ? '#f59e0b' : '#ef4444';

  return (
    <div className="relative w-52 h-28 mx-auto select-none">
      <svg viewBox="0 0 200 110" className="w-full h-full">
        {/* Track */}
        <path d="M10 100 A90 90 0 0 1 190 100" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="14" strokeLinecap="round" />
        {/* Arc */}
        <path d="M10 100 A90 90 0 0 1 190 100" fill="none" stroke={color} strokeWidth="14" strokeLinecap="round"
          strokeDasharray={`${pct * 283} 283`} style={{ transition: 'stroke-dasharray 0.5s ease, stroke 0.5s' }} />
        {/* Needle */}
        <g transform={`rotate(${angle}, 100, 100)`}>
          <line x1="100" y1="100" x2="100" y2="25" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="100" cy="100" r="5" fill="white" />
        </g>
      </svg>
      <div className="absolute bottom-0 inset-x-0 text-center">
        <span className="text-3xl font-black font-mono" style={{ color }}>{value.toFixed(1)}</span>
        <span className="text-slate-500 text-sm ml-1">Mbps</span>
      </div>
    </div>
  );
}

export default function NetworkTest() {
  const [status, setStatus] = useState('idle'); // idle | testing | done | error
  const [speed, setSpeed] = useState(0);
  const [latency, setLatency] = useState(null);
  const [selectedFile, setSelectedFile] = useState(TEST_FILES[1]);
  const [progress, setProgress] = useState(0);
  const abortRef = useRef(null);

  const measureLatency = async () => {
    const start = performance.now();
    await fetch('https://speed.cloudflare.com/__down?bytes=1', { cache: 'no-store' });
    return Math.round(performance.now() - start);
  };

  const runTest = async () => {
    setStatus('testing');
    setSpeed(0);
    setProgress(0);
    setLatency(null);

    try {
      // Measure latency first
      const ping = await measureLatency();
      setLatency(ping);

      const controller = new AbortController();
      abortRef.current = controller;

      const start = performance.now();
      const res = await fetch(selectedFile.url, { cache: 'no-store', signal: controller.signal });
      const reader = res.body.getReader();

      let received = 0;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        received += value.length;
        const pct = (received / selectedFile.size) * 100;
        setProgress(Math.min(pct, 100));
        const elapsed = (performance.now() - start) / 1000;
        if (elapsed > 0.1) {
          const mbps = (received * 8) / (elapsed * 1_000_000);
          setSpeed(mbps);
        }
      }
      const totalTime = (performance.now() - start) / 1000;
      const finalSpeed = (received * 8) / (totalTime * 1_000_000);
      setSpeed(parseFloat(finalSpeed.toFixed(2)));
      setStatus('done');
      toast.success(`Download speed: ${finalSpeed.toFixed(2)} Mbps`);
    } catch (e) {
      if (e.name !== 'AbortError') {
        setStatus('error');
        toast.error('Speed test failed. Check network connectivity.');
      } else {
        setStatus('idle');
      }
    }
  };

  const abort = () => { abortRef.current?.abort(); setStatus('idle'); setProgress(0); };

  const getSpeedLabel = () => {
    if (speed > 100) return { label: 'Excellent', color: 'text-green-500' };
    if (speed > 25) return { label: 'Good', color: 'text-amber-500' };
    if (speed > 5) return { label: 'Fair', color: 'text-orange-500' };
    return { label: 'Slow', color: 'text-red-500' };
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="mb-6">
        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-500 to-blue-500">Network Speed Test</h2>
        <p className="text-slate-600 dark:text-slate-400">Measure your download speed and network latency via Cloudflare's CDN.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gauge + action */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8 flex flex-col items-center">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6 self-start">Download Speed</h3>
          <SpeedGauge value={speed} />

          {status === 'done' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
              <span className={`text-lg font-bold ${getSpeedLabel().color}`}>{getSpeedLabel().label}</span>
            </motion.div>
          )}

          {(status === 'testing') && (
            <div className="w-full mt-6">
              <div className="flex justify-between text-sm text-slate-500 mb-2">
                <span>Downloading {selectedFile.label} sample…</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="relative h-2 w-full bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                <motion.div className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-500 to-blue-500" style={{ width: `${progress}%` }} transition={{ duration: 0.1 }} />
              </div>
            </div>
          )}

          <div className="flex gap-3 mt-8 w-full">
            {status !== 'testing' ? (
              <button onClick={runTest} className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-semibold shadow-lg shadow-cyan-600/25 transition-all active:scale-95">
                <FiWifi /> Run Speed Test
              </button>
            ) : (
              <button onClick={abort} className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 rounded-xl font-semibold transition-all">
                Cancel
              </button>
            )}
            {status === 'done' && (
              <button onClick={runTest} className="p-3.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all" title="Re-run">
                <FiRefreshCw className="text-slate-900 dark:text-white" />
              </button>
            )}
          </div>
        </motion.div>

        {/* Metrics + file size */}
        <div className="space-y-5">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-5">Metrics</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Download Speed', value: speed > 0 ? `${speed.toFixed(2)} Mbps` : '—', color: 'text-cyan-500' },
                { label: 'Ping / Latency', value: latency !== null ? `${latency} ms` : '—', color: latency < 50 ? 'text-green-500' : 'text-amber-500' },
              ].map(m => (
                <div key={m.label} className="rounded-xl p-4 bg-black/5 dark:bg-white/5 border border-white/5">
                  <div className={`text-2xl font-black font-mono ${m.color}`}>{m.value}</div>
                  <div className="text-xs text-slate-500 mt-1">{m.label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Test File Size</h3>
            <div className="grid grid-cols-3 gap-3">
              {TEST_FILES.map(f => (
                <button
                  key={f.label}
                  onClick={() => { setSelectedFile(f); if (status === 'done') setStatus('idle'); }}
                  disabled={status === 'testing'}
                  className={`p-3 rounded-xl border text-center transition-all font-semibold disabled:opacity-50 ${selectedFile.label === f.label ? 'border-cyan-500 bg-cyan-500/10 text-cyan-500' : 'border-slate-300 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:border-cyan-400'}`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-3">Larger file sizes give more accurate results for fast connections.</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
