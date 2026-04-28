import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Zap, Menu, X, Calendar, Users, BarChart3, DollarSign, Settings, LogOut, Bell,
  BookOpen, Dumbbell, ChevronRight
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import api from '../../utils/api';

const navigationItems = [
  { icon: Calendar, label: 'Schedule', to: '/pt', exact: true },
  { icon: Users, label: 'Clients', to: '/pt/clients' },
  { icon: Dumbbell, label: 'Workouts', to: '/pt/workouts' },
  { icon: DollarSign, label: 'Income', to: '/pt/income' },
  { icon: BarChart3, label: 'Analytics', to: '/pt/analytics' },
  { icon: BookOpen, label: 'Exercise Library', to: '/pt/exercises' },
];

export default function PTLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const pollRef = useRef(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.get('/pt/notifications');
        setUnreadCount(res.data.unreadCount || 0);
      } catch {
        // silent
      }
    };
    fetchNotifications();
    pollRef.current = setInterval(fetchNotifications, 30000);
    return () => clearInterval(pollRef.current);
  }, []);

  const isActive = (to, exact = false) => {
    if (exact) return location.pathname === to;
    return location.pathname.startsWith(to);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Sidebar */}
      <aside className={`fixed md:relative z-30 left-0 top-0 h-screen w-64 text-white flex flex-col transition-transform ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}
      style={{ backgroundColor: '#1A1A2E' }}>
        {/* Header */}
        <div className="px-6 py-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="bg-brazil-green p-2 rounded-lg">
              <Zap className="w-6 h-6 text-white fill-white" />
            </div>
            <div>
              <h1 className="text-xl font-black leading-none">BrazilFit</h1>
              <p className="text-grey-200 text-[10px] mt-0.5">PT Dashboard</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.to, item.exact);
            return (
              <button
                key={item.to}
                onClick={() => {
                  navigate(item.to);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  active
                    ? 'bg-brazil-green text-black font-bold'
                    : 'text-grey-200 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-white/10 px-4 py-6 space-y-2">
          <button
            onClick={() => {
              navigate('/pt/settings');
              setSidebarOpen(false);
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-grey-200 hover:text-white hover:bg-white/5 transition-all"
          >
            <Settings className="w-5 h-5" />
            <span className="text-sm font-medium">Settings</span>
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-grey-200 hover:text-white hover:bg-white/5 transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="bg-white border-b border-grey-100 px-4 md:px-6 py-4 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 hover:bg-grey-300 rounded-lg transition"
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <h2 className="text-xl font-black text-black hidden md:block">
              {navigationItems.find(item => isActive(item.to, item.exact))?.label || 'Schedule'}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            {/* Notifications */}
            <button className="relative p-2 hover:bg-grey-300 rounded-lg transition">
              <Bell className="w-5 h-5 text-grey-200" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-5 h-5 bg-brazil-green text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* PT Avatar */}
            <div className="flex items-center gap-2 px-3 py-2 bg-grey-300 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-brazil-green flex items-center justify-center text-white text-sm font-bold">
                PT
              </div>
              <span className="text-sm font-bold text-black hidden sm:inline">{user?.name || 'PT'}</span>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 md:hidden z-20"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
