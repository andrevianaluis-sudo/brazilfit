import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Zap, Menu, X, BarChart3, Calendar, TrendingUp, Apple, Heart, MessageSquare,
  CheckSquare, Settings, LogOut, Bell, Home, ChevronRight, Trophy, Dumbbell, Image
} from 'lucide-react';
import ProfileModal from '../../components/ProfileModal';

const navigationItems = [
  { icon: Home, label: 'Dashboard', to: '/client', exact: true },
  { icon: Calendar, label: 'My Sessions', to: '/client/sessions' },
  { icon: Dumbbell, label: 'My Workouts', to: '/client/workouts' },
  { icon: TrendingUp, label: 'Progress', to: '/client/progress' },
  { icon: Image, label: 'Progress Photos', to: '/client/progress-photos' },
  { icon: Heart, label: 'Wellness', to: '/client/wellness' },
  { icon: Apple, label: 'Nutrition', to: '/client/nutrition' },
  { icon: MessageSquare, label: 'Messages', to: '/client/messages' },
  { icon: CheckSquare, label: 'Check-in', to: '/client/checkin' },
  { icon: BarChart3, label: 'Habits', to: '/client/habits' },
  { icon: Trophy, label: 'Leaderboard', to: '/client/leaderboard' },
];

export default function ClientLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

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
              navigate('/client/settings');
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
              {navigationItems.find(item => isActive(item.to, item.exact))?.label || 'Dashboard'}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            {/* Notifications */}
            <button className="relative p-2 hover:bg-grey-300 rounded-lg transition">
              <Bell className="w-5 h-5 text-grey-200" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-brazil-green rounded-full" />
            </button>

            {/* Profile */}
            <button
              onClick={() => setShowProfileModal(true)}
              className="flex items-center gap-2 p-2 hover:bg-grey-300 rounded-lg transition"
            >
              <div className={`w-9 h-9 rounded-full bg-grey-300 flex items-center justify-center font-bold text-sm ${
                user?.isPro ? 'ring-2 ring-brazil-green' : ''
              }`}>
                {initials}
              </div>
              <ChevronRight className="w-4 h-4 text-grey-200" />
            </button>
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

      {/* Profile Modal */}
      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />
    </div>
  );
}
