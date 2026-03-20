import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiMonitor, FiMousePointer, FiMic, FiSpeaker, FiWifi, FiSmartphone } from 'react-icons/fi';
import { MdKeyboard, MdTouchApp } from 'react-icons/md';

const categories = [
  { title: 'Keyboard Test', desc: 'Check key latency and response', icon: MdKeyboard, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'group-hover:border-blue-500/50', path: '/keyboard' },
  { title: 'Mouse Test', desc: 'Measure double click & scroll', icon: FiMousePointer, color: 'text-green-500', bg: 'bg-green-500/10', border: 'group-hover:border-green-500/50', path: '/mouse' },
  { title: 'Screen Test', desc: 'Find dead pixels & measure FPS', icon: FiMonitor, color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'group-hover:border-purple-500/50', path: '/screen' },
  { title: 'Camera & Mic', desc: 'WebRTC video and audio levels', icon: FiMic, color: 'text-pink-500', bg: 'bg-pink-500/10', border: 'group-hover:border-pink-500/50', path: '/media' },
  { title: 'Speaker Test', desc: 'Stereo panning and audio check', icon: FiSpeaker, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'group-hover:border-amber-500/50', path: '/speaker' },
  { title: 'Network Speed', desc: 'Download latency and bandwidth', icon: FiWifi, color: 'text-cyan-500', bg: 'bg-cyan-500/10', border: 'group-hover:border-cyan-500/50', path: '/network' },
  { title: 'Touch Test', desc: 'Find dead touch zones on screen', icon: MdTouchApp, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'group-hover:border-emerald-500/50', path: '/touch' },
  { title: 'Sensors', desc: 'Gyroscope and accelerometer data', icon: FiSmartphone, color: 'text-violet-500', bg: 'bg-violet-500/10', border: 'group-hover:border-violet-500/50', path: '/sensors' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.07 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

export default function Dashboard() {
  return (
    <div className="space-y-8 pb-10">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-3"
      >
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-500 dark:from-white dark:to-slate-400">
          System Diagnostics
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl font-light">
          Perform comprehensive hardware and network tests directly from your browser. Select a test below to begin.
        </p>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
      >
        {categories.map((cat, idx) => (
          <motion.div key={idx} variants={itemVariants} className="h-full">
            <Link to={cat.path} className="block group h-full">
              <div className={`glass-card p-6 h-full flex flex-col glass-hover relative overflow-hidden transition-all duration-300 border border-white/5 ${cat.border}`}>
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 ${cat.bg} group-hover:scale-110 transition-transform duration-300`}>
                  <cat.icon className={`text-3xl ${cat.color}`} />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1.5">{cat.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm flex-1">{cat.desc}</p>

                <div className={`absolute -bottom-8 -right-8 opacity-[0.03] group-hover:opacity-10 transition-opacity duration-500 pointer-events-none ${cat.color}`}>
                  <cat.icon className="w-40 h-40" />
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
