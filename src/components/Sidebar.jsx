import { NavLink } from 'react-router-dom';
import { FiHome, FiMonitor, FiMousePointer, FiMic, FiSpeaker, FiWifi, FiSmartphone } from 'react-icons/fi';
import { MdKeyboard, MdTouchApp } from 'react-icons/md';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const navItems = [
  { name: 'Dashboard', path: '/', icon: FiHome },
  { name: 'Keyboard', path: '/keyboard', icon: MdKeyboard },
  { name: 'Mouse', path: '/mouse', icon: FiMousePointer },
  { name: 'Screen', path: '/screen', icon: FiMonitor },
  { name: 'Camera & Mic', path: '/media', icon: FiMic },
  { name: 'Speaker', path: '/speaker', icon: FiSpeaker },
  { name: 'Network', path: '/network', icon: FiWifi },
  { name: 'Touch', path: '/touch', icon: MdTouchApp },
  { name: 'Sensors', path: '/sensors', icon: FiSmartphone },
];

export default function Sidebar({ isOpen, setIsOpen }) {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={twMerge(
        clsx(
          "fixed top-0 left-0 z-50 h-screen w-64 glass transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:flex-shrink-0 flex flex-col",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )
      )}>
        <div className="flex items-center gap-3 h-16 border-b border-white/10 shrink-0 px-6">
          <img src="/logo.png" alt="DevLabs Logo" className="w-8 h-8 rounded-lg shadow-lg shadow-primary-500/20" />
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-500 to-purple-500">
            DevLabs
          </h1>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === '/'}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) => clsx(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group",
                isActive
                  ? "bg-primary-500/20 text-primary-600 dark:text-primary-500 font-medium scale-[1.02]"
                  : "text-slate-600 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-slate-100"
              )}
            >
              <item.icon className={clsx("text-xl transition-transform duration-300", "group-hover:scale-110")} />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
