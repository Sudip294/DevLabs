import { useState, useEffect, useRef } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import FloatingFooter from './FloatingFooter';
import ScrollToTop from './ScrollToTop';
import { Toaster } from 'react-hot-toast';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const mainRef = useRef(null);

  // Initialize theme
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <div className="flex h-screen overflow-hidden font-sans transition-colors duration-300 relative">
      <div className="fixed inset-0 pointer-events-none z-0 opacity-20 bg-[radial-gradient(circle_at_50%_-20%,#4f46e5_0%,transparent_50%)]"></div>
      
      <Toaster position="top-center" toastOptions={{
        className: 'glass !bg-dark-800 !text-white',
        style: { border: '1px solid #262626' }
      }}/>
      
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden relative z-10">
        <Navbar 
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
          isDark={isDark}
          toggleTheme={() => setIsDark(!isDark)}
        />
        
        <main ref={mainRef} className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto h-full">
            <Outlet />
          </div>
        </main>
        <FloatingFooter />
        <ScrollToTop scrollRef={mainRef} />
      </div>
    </div>
  );
}
