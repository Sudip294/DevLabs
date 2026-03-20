import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FiVideo, FiVideoOff, FiMic, FiMicOff, FiCamera } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function MediaTest() {
  const [cameraOn, setCameraOn] = useState(false);
  const [micOn, setMicOn] = useState(false);
  const [volume, setVolume] = useState(0);
  const [peakVolume, setPeakVolume] = useState(0);
  const [devices, setDevices] = useState({ cameras: [], mics: [] });

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const micStreamRef = useRef(null);
  const analyserRef = useRef(null);
  const animFrameRef = useRef(null);
  const canvasRef = useRef(null);

  // Query available devices
  useEffect(() => {
    navigator.mediaDevices?.enumerateDevices().then(devs => {
      setDevices({
        cameras: devs.filter(d => d.kind === 'videoinput'),
        mics: devs.filter(d => d.kind === 'audioinput'),
      });
    });
    return () => stopAll();
  }, []);

  const stopAll = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    micStreamRef.current?.getTracks().forEach(t => t.stop());
    cancelAnimationFrame(animFrameRef.current);
  };

  const toggleCamera = async () => {
    if (cameraOn) {
      streamRef.current?.getTracks().forEach(t => t.stop());
      if (videoRef.current) videoRef.current.srcObject = null;
      setCameraOn(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
        setCameraOn(true);
        toast.success('Camera connected');
      } catch (e) {
        toast.error('Camera access denied');
      }
    }
  };

  const toggleMic = async () => {
    if (micOn) {
      micStreamRef.current?.getTracks().forEach(t => t.stop());
      cancelAnimationFrame(animFrameRef.current);
      setVolume(0);
      setPeakVolume(0);
      setMicOn(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        micStreamRef.current = stream;
        const ctx = new AudioContext();
        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        analyserRef.current = analyser;
        setMicOn(true);
        toast.success('Microphone connected');

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const tick = () => {
          analyser.getByteFrequencyData(dataArray);
          const avg = dataArray.reduce((s, v) => s + v, 0) / dataArray.length;
          const normalized = Math.min(Math.round((avg / 128) * 100), 100);
          setVolume(normalized);
          setPeakVolume(prev => Math.max(prev, normalized));

          // Draw waveform
          if (canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx2d = canvas.getContext('2d');
            const W = canvas.width, H = canvas.height;
            ctx2d.clearRect(0, 0, W, H);
            const barW = (W / dataArray.length) * 1.5;
            let x = 0;
            dataArray.forEach((v) => {
              const h = (v / 255) * H;
              const alpha = 0.4 + (v / 255) * 0.6;
              ctx2d.fillStyle = `rgba(168, 85, 247, ${alpha})`;
              ctx2d.fillRect(x, H - h, barW - 1, h);
              x += barW + 1;
            });
          }
          animFrameRef.current = requestAnimationFrame(tick);
        };
        tick();
      } catch (e) {
        toast.error('Microphone access denied');
      }
    }
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="mb-6">
        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-rose-500">Camera & Mic Diagnostics</h2>
        <p className="text-slate-600 dark:text-slate-400">Test your webcam feed and microphone audio levels using WebRTC.</p>
      </div>

      {/* Device count badges */}
      <div className="flex gap-3 flex-wrap">
        <span className="px-3 py-1 rounded-full bg-pink-500/10 text-pink-500 text-sm font-medium border border-pink-500/20">
          {devices.cameras.length} camera(s) detected
        </span>
        <span className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-500 text-sm font-medium border border-purple-500/20">
          {devices.mics.length} microphone(s) detected
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Camera */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card overflow-hidden">
          <div className="relative bg-black aspect-video flex items-center justify-center">
            {!cameraOn && (
              <div className="flex flex-col items-center gap-3 text-slate-500">
                <FiCamera className="text-5xl" />
                <span className="text-sm">Camera is off</span>
              </div>
            )}
            <video ref={videoRef} autoPlay playsInline muted className={`w-full h-full object-cover transition-opacity duration-300 ${cameraOn ? 'opacity-100' : 'opacity-0 absolute'}`} />
            {cameraOn && (
              <div className="absolute top-3 left-3 flex items-center gap-2 bg-black/50 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-medium border border-white/10">
                <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" /><span className="relative rounded-full h-2 w-2 bg-red-500" /></span>
                LIVE
              </div>
            )}
          </div>
          <div className="p-4 flex justify-between items-center">
            <span className="font-semibold text-slate-900 dark:text-white">Webcam Feed</span>
            <button
              onClick={toggleCamera}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all duration-200 active:scale-95 ${cameraOn ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20' : 'bg-pink-600 hover:bg-pink-500 text-white shadow-lg shadow-pink-600/20'}`}
            >
              {cameraOn ? <><FiVideoOff /> Stop</> : <><FiVideo /> Start Camera</>}
            </button>
          </div>
        </motion.div>

        {/* Mic */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6 flex flex-col gap-5">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-slate-900 dark:text-white">Microphone Levels</span>
            <button
              onClick={toggleMic}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all duration-200 active:scale-95 ${micOn ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20' : 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/20'}`}
            >
              {micOn ? <><FiMicOff /> Stop</> : <><FiMic /> Start Mic</>}
            </button>
          </div>

          {/* Waveform canvas */}
          <div className="rounded-xl bg-black/20 dark:bg-black/40 overflow-hidden border border-white/5" style={{ height: 120 }}>
            <canvas ref={canvasRef} width={600} height={120} className="w-full h-full" />
          </div>

          {/* Volume bar */}
          <div>
            <div className="flex justify-between text-sm text-slate-500 mb-2">
              <span>Volume Level</span>
              <span className="font-mono text-purple-500">{volume}%</span>
            </div>
            <div className="relative h-3 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className={`absolute top-0 left-0 h-full rounded-full ${volume > 80 ? 'bg-red-500' : volume > 50 ? 'bg-amber-500' : 'bg-purple-500'}`}
                animate={{ width: `${volume}%` }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              />
            </div>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Peak Volume</span>
            <span className="font-mono font-semibold text-slate-900 dark:text-white">{peakVolume}%</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
