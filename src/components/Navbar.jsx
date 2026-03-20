import { FiMenu, FiMoon, FiSun } from 'react-icons/fi';

export default function Navbar({ toggleSidebar, isDark, toggleTheme }) {
  return (
    <header className="h-16 glass sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 shrink-0 border-b-0">
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors md:hidden"
        >
          <FiMenu className="text-2xl" />
        </button>
        <span className="text-lg font-medium md:hidden text-slate-200">
          DevLabs
        </span>
      </div>

      <div className="flex items-center gap-4">
        <button 
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-white/10 transition-colors"
          aria-label="Toggle Theme"
        >
          {isDark ? <FiSun className="text-xl text-yellow-500" /> : <FiMoon className="text-xl text-slate-300" />}
        </button>
      </div>
    </header>
  );
}
