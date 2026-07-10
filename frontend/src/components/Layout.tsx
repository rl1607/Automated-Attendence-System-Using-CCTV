import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { 
  LayoutDashboard, Camera, Users, GraduationCap, CalendarDays, 
  FileSpreadsheet, BarChart3, MessageSquare, Settings2, ShieldAlert,
  Menu, X, Bell, LogOut, Sun, Moon, Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout, hasRole } = useAuth();
  const { notifications, clearNotification } = useSocket();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(true);
  const [showBell, setShowBell] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [globalSearch, setGlobalSearch] = useState('');

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/', roles: ['super_admin', 'admin', 'faculty', 'student'] },
    { name: 'CCTV Control Room', icon: Camera, path: '/cctv', roles: ['super_admin', 'admin', 'faculty'] },
    { name: 'Student Directory', icon: GraduationCap, path: '/students', roles: ['super_admin', 'admin', 'faculty'] },
    { name: 'Faculty Directory', icon: Users, path: '/faculty', roles: ['super_admin', 'admin'] },
    { name: 'Timetable Slots', icon: CalendarDays, path: '/timetable', roles: ['super_admin', 'admin', 'faculty'] },
    { name: 'Reports & Export', icon: FileSpreadsheet, path: '/reports', roles: ['super_admin', 'admin', 'faculty', 'student'] },
    { name: 'Analytics Telemetry', icon: BarChart3, path: '/analytics', roles: ['super_admin', 'admin'] },
    { name: 'Message Dispatcher', icon: MessageSquare, path: '/messages', roles: ['super_admin', 'admin', 'faculty'] },
    { name: 'Audit History', icon: ShieldAlert, path: '/audit-logs', roles: ['super_admin'] },
    { name: 'System Settings', icon: Settings2, path: '/settings', roles: ['super_admin', 'admin'] },
  ];

  const handleToggleTheme = () => {
    setDarkMode(!darkMode);
    if (darkMode) {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  };

  return (
    <div className={`flex min-h-screen ${darkMode ? 'bg-darkbg text-slate-100' : 'bg-slate-50 text-slate-800'}`}>
      
      {/* SIDEBAR */}
      <motion.aside 
        animate={{ width: isOpen ? 260 : 70 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="hidden md:flex flex-col border-r border-slate-200 dark:border-darkbg-border bg-white dark:bg-darkbg-card select-none"
      >
        <div className="p-4 flex items-center justify-between border-b border-slate-200 dark:border-darkbg-border">
          {isOpen ? (
            <span className="font-bold text-lg tracking-wider bg-gradient-to-r from-brand-400 to-brand-600 bg-clip-text text-transparent">
              Attendence Tracker
            </span>
          ) : (
            <span className="font-bold text-lg text-brand-500">👁️</span>
          )}
          <button onClick={() => setIsOpen(!isOpen)} className="p-1 hover:bg-slate-100 dark:hover:bg-brand-950 rounded">
            <Menu size={18} />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {menuItems.map((item) => {
            if (!hasRole(item.roles as any)) return null;
            const active = location.pathname === item.path;
            return (
              <button
                key={item.name}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group relative ${
                  active 
                    ? 'bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-lg shadow-brand-500/20' 
                    : 'hover:bg-slate-100 dark:hover:bg-brand-950/40 text-slate-500 dark:text-slate-400'
                }`}
              >
                <item.icon size={20} className={active ? 'text-white' : 'group-hover:text-brand-500'} />
                {isOpen && <span className="font-medium text-sm">{item.name}</span>}
                {!isOpen && (
                  <div className="absolute left-16 bg-slate-900 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-50">
                    {item.name}
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-slate-200 dark:border-darkbg-border">
          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl"
          >
            <LogOut size={20} />
            {isOpen && <span className="font-medium text-sm">Sign Out</span>}
          </button>
        </div>
      </motion.aside>

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* NAVBAR */}
        <header className="h-16 border-b border-slate-200 dark:border-darkbg-border bg-white/70 dark:bg-darkbg-card/70 backdrop-blur-md flex items-center justify-between px-6 z-40 sticky top-0">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative max-w-xs w-full hidden sm:block">
              <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
                <Search size={18} />
              </span>
              <input
                type="text"
                placeholder="Global USN search..."
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && navigate(`/students?search=${globalSearch}`)}
                className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-darkbg-border bg-slate-50 dark:bg-darkbg focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={handleToggleTheme}
              className="p-2 text-slate-400 hover:text-brand-500 rounded-xl bg-slate-50 dark:bg-darkbg border border-slate-200 dark:border-darkbg-border"
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button 
                onClick={() => setShowBell(!showBell)}
                className="p-2 text-slate-400 hover:text-brand-500 rounded-xl bg-slate-50 dark:bg-darkbg border border-slate-200 dark:border-darkbg-border relative"
              >
                <Bell size={18} />
                {notifications.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
                )}
              </button>

              <AnimatePresence>
                {showBell && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-3 w-80 rounded-2xl bg-white dark:bg-darkbg-card border border-slate-200 dark:border-darkbg-border shadow-2xl p-4 z-50 text-slate-800 dark:text-slate-100"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-bold text-sm">System Alerts</h4>
                      <span className="text-xs bg-brand-100 dark:bg-brand-950 text-brand-600 dark:text-brand-400 px-2 py-0.5 rounded-full font-semibold">
                        {notifications.length} New
                      </span>
                    </div>

                    <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                      {notifications.length === 0 ? (
                        <p className="text-xs text-slate-400 text-center py-4">No recent notifications</p>
                      ) : (
                        notifications.map((n) => (
                          <div 
                            key={n.id} 
                            className={`p-2.5 rounded-xl border flex flex-col gap-1 relative ${
                              n.type === 'alert' 
                                ? 'bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-400' 
                                : n.type === 'success' 
                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400'
                                : 'bg-slate-100 dark:bg-brand-950/20 border-slate-200 dark:border-brand-950/40'
                            }`}
                          >
                            <button 
                              onClick={() => clearNotification(n.id)}
                              className="absolute top-2 right-2 text-xs opacity-60 hover:opacity-100"
                            >
                              <X size={14} />
                            </button>
                            <span className="font-bold text-xs">{n.title}</span>
                            <span className="text-[11px] leading-relaxed pr-3">{n.message}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex items-center gap-3 border-l border-slate-200 dark:border-darkbg-border pl-4">
              <img 
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop" 
                alt="Profile" 
                className="w-9 h-9 rounded-full object-cover ring-2 ring-brand-500"
              />
              <div className="hidden lg:flex flex-col select-none">
                <span className="text-xs font-bold">{user?.name || 'Academic User'}</span>
                <span className="text-[10px] uppercase tracking-wider text-brand-500 font-bold">{user?.role}</span>
              </div>
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
