import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowUp } from 'react-icons/fi';

// scrollRef: ref to the scrollable container (the <main> element in Layout)
export default function ScrollToTop({ scrollRef }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const container = scrollRef?.current;
    if (!container) return;

    const toggleVisibility = () => {
      setIsVisible(container.scrollTop > 200);
    };

    container.addEventListener('scroll', toggleVisibility);
    return () => container.removeEventListener('scroll', toggleVisibility);
  }, [scrollRef]);

  const scrollToTop = () => {
    scrollRef?.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          whileHover={{ scale: 1.12, y: -4 }}
          whileTap={{ scale: 0.9 }}
          onClick={scrollToTop}
          className="fixed bottom-[5.5rem] sm:bottom-24 right-4 sm:right-8 z-50 p-3 sm:p-4 rounded-2xl glass-card border border-white/10 shadow-2xl shadow-primary-500/25 group overflow-hidden cursor-pointer"
          aria-label="Scroll to top"
        >
          {/* Background glow on hover */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />

          <FiArrowUp className="text-xl text-slate-700 dark:text-slate-200 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors relative z-10" />

          {/* Pulsating ring */}
          <motion.div
            animate={{ scale: [1, 1.25, 1], opacity: [0.4, 0.1, 0.4] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute inset-0 rounded-2xl border-2 border-primary-500/30 pointer-events-none"
          />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
