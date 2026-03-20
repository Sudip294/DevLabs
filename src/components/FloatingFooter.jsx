import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useRef, useState } from 'react';

export default function FloatingFooter() {
  const footerRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 300 };
  const glowX = useSpring(mouseX, springConfig);
  const glowY = useSpring(mouseY, springConfig);

  const handleMouseMove = (e) => {
    if (!footerRef.current) return;
    const rect = footerRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  // Touch support for mobile glow
  const handleTouchMove = (e) => {
    if (!footerRef.current) return;
    const rect = footerRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    mouseX.set(touch.clientX - rect.left);
    mouseY.set(touch.clientY - rect.top);
  };

  return (
    <motion.footer
      ref={footerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchMove={handleTouchMove}
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.5, duration: 0.8, ease: 'circOut' }}
      // Responsive: wraps on mobile, single line on larger screens
      className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-40
                 px-4 sm:px-6 py-2 sm:py-3
                 glass-card flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 sm:gap-6
                 cursor-default group overflow-hidden
                 max-w-[95vw] sm:w-max"
    >
      {/* Dynamic Glow — desktop only (pointer events) */}
      <motion.div
        className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: useTransform(
            [glowX, glowY],
            ([x, y]) =>
              `radial-gradient(circle 80px at ${x}px ${y}px, rgba(99, 102, 241, 0.3), transparent)`
          ),
        }}
      />

      {/* Status dot + label */}
      <div className="flex items-center gap-2 text-[10px] sm:text-sm font-medium text-slate-500 dark:text-slate-400 transition-colors group-hover:text-slate-900 dark:group-hover:text-slate-200 whitespace-nowrap">
        <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)] shrink-0" />
        System Live
      </div>

      <div className="h-3 sm:h-4 w-px bg-white/10 shrink-0" />

      {/* Attribution text — now visible on mobile too */}
      <div className="text-[9px] sm:text-xs font-mono text-slate-500 dark:text-slate-400 whitespace-nowrap">
        © 2026 DEVLABS CORE | DESIGNED BY SUDIP BAG.
      </div>

      <div className="hidden xs:block h-3 sm:h-4 w-px bg-white/10 shrink-0" />

      {/* Version tags */}
      <div className="flex gap-2 sm:gap-4 shrink-0">
        {['v1.0.4', 'Stable'].map((tag) => (
          <span
            key={tag}
            className="text-[8px] sm:text-[10px] uppercase tracking-widest px-1.5 sm:px-2 py-0.5 rounded bg-white/5 border border-white/5 text-slate-400"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Border Glow */}
      <motion.div className="absolute inset-0 border border-primary-500/0 rounded-2xl transition-colors duration-500 group-hover:border-primary-500/30 pointer-events-none" />
    </motion.footer>
  );
}
