import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiVolume2 } from 'react-icons/fi';
import toast from 'react-hot-toast';

const TONES = [
  { freq: 440, label: 'A4', desc: '440 Hz' },
  { freq: 1000, label: '1kHz', desc: 'Mid-range' },
  { freq: 8000, label: '8kHz', desc: 'High-pitch' },
];

export default function SpeakerTest() {
  const [playing, setPlaying] = useState(null); // 'left' | 'right' | 'both' | null
  const [activeTone, setActiveTone] = useState(TONES[0]);
  const [volume, setVolume] = useState(0.5);
  const ctxRef = useRef(null);
  const oscillatorRef = useRef(null);
  const gainRef = useRef(null);
  const pannerRef = useRef(null);

  const stopSound = () => {
    try {
      oscillatorRef.current?.stop();
    } catch (_) {}
    oscillatorRef.current = null;
    setPlaying(null);
  };

  const playChannel = (channel) => {
    if (playing === channel) { stopSound(); return; }
    stopSound();

    const ctx = new AudioContext();
    ctxRef.current = ctx;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const panner = ctx.createStereoPanner();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(activeTone.freq, ctx.currentTime);
    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    // Fade in
    gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.05);

    panner.pan.setValueAtTime(
      channel === 'left' ? -1 : channel === 'right' ? 1 : 0,
      ctx.currentTime
    );

    oscillator.connect(gainNode);
    gainNode.connect(panner);
    panner.connect(ctx.destination);
    oscillator.start();

    oscillatorRef.current = oscillator;
    gainRef.current = gainNode;
    pannerRef.current = panner;
    setPlaying(channel);

    toast(`Playing on ${channel === 'both' ? 'Both Channels' : channel.charAt(0).toUpperCase() + channel.slice(1)} Channel`, { icon: '🔊' });
  };

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (gainRef.current) gainRef.current.gain.setValueAtTime(val, ctxRef.current.currentTime);
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="mb-6">
        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-500 to-orange-500">Speaker Diagnostics</h2>
        <p className="text-slate-600 dark:text-slate-400">Test left, right, and both audio channels using pure tone oscillators.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Channel selector */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Channel Test</h3>

          {/* Stereo display */}
          <div className="flex items-center justify-center gap-6 mb-10">
            {['left', 'right'].map((ch) => (
              <button
                key={ch}
                onClick={() => playChannel(ch)}
                className={`relative w-28 h-40 rounded-2xl border-2 flex flex-col items-center justify-center gap-3 transition-all duration-300 font-semibold
                  ${playing === ch
                    ? 'border-amber-500 bg-amber-500/15 text-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.3)] scale-105'
                    : 'border-slate-300 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:border-amber-500/50 hover:bg-amber-500/5'}
                  `}
              >
                <AnimatePresence>
                  {playing === ch && (
                    <motion.div
                      className="absolute inset-0 rounded-2xl opacity-20 bg-amber-500"
                      animate={{ opacity: [0.1, 0.3, 0.1] }}
                      transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
                    />
                  )}
                </AnimatePresence>
                <FiVolume2 className="text-3xl relative z-10" />
                <span className="text-lg uppercase tracking-widest relative z-10">{ch}</span>
                {playing === ch && (
                  <div className="flex gap-1 relative z-10">
                    {[1,2,3,4].map(i => (
                      <motion.div key={i} className="w-1 bg-amber-500 rounded-full" animate={{ height: [4, 16, 4] }} transition={{ repeat: Infinity, delay: i * 0.1, duration: 0.6 }} />
                    ))}
                  </div>
                )}
              </button>
            ))}
          </div>

          <button
            onClick={() => playChannel('both')}
            className={`w-full py-3.5 rounded-xl font-semibold transition-all duration-200 active:scale-95 border-2 ${playing === 'both' ? 'border-amber-500 bg-amber-500/15 text-amber-500' : 'border-dashed border-slate-300 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:border-amber-400 hover:text-amber-500'}`}
          >
            {playing === 'both' ? '⏹ Stop Both Channels' : '▶ Play Both Channels'}
          </button>
        </motion.div>

        {/* Tone & Volume */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-8 flex flex-col gap-7">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Tone Frequency</h3>
            <div className="grid grid-cols-3 gap-3">
              {TONES.map(tone => (
                <button
                  key={tone.freq}
                  onClick={() => { setActiveTone(tone); stopSound(); }}
                  className={`p-3 rounded-xl border text-center transition-all duration-200 ${activeTone.freq === tone.freq ? 'border-amber-500 bg-amber-500/10 text-amber-500' : 'border-slate-300 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:border-amber-400'}`}
                >
                  <div className="font-bold text-lg">{tone.label}</div>
                  <div className="text-xs mt-0.5 opacity-70">{tone.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-3">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Volume</h3>
              <span className="font-mono text-amber-500 text-lg">{Math.round(volume * 100)}%</span>
            </div>
            <input
              type="range" min="0" max="1" step="0.01" value={volume}
              onChange={handleVolumeChange}
              className="w-full h-2 rounded-full appearance-none accent-amber-500 bg-black/10 dark:bg-white/10 cursor-pointer"
            />
          </div>

          <div className="mt-auto p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 text-sm text-slate-600 dark:text-slate-400">
            <span className="font-semibold text-amber-600 dark:text-amber-400">Tip:</span> Test each channel separately to identify a dead or weak speaker on your device.
          </div>
        </motion.div>
      </div>
    </div>
  );
}
