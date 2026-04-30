import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Zap, Menu, X, BarChart3, Calendar, TrendingUp, Apple, Heart, MessageSquare,
  CheckSquare, Settings, LogOut, Bell, Home, ChevronRight, Trophy, Dumbbell, Image
} from 'lucide-react';
import ProfileModal from '../../components/ProfileModal';

const navigationItems = [
  { icon: Home,         label: 'Dashboard',       to: '/client',                exact: true },
  { icon: Calendar,     label: 'My Sessions',      to: '/client/sessions'                   },
  { icon: Dumbbell,     label: 'My Workouts',      to: '/client/workouts'                   },
  { icon: TrendingUp,   label: 'Progress',         to: '/client/progress'                   },
  { icon: Image,        label: 'Progress Photos',  to: '/client/progress-photos'            },
  { icon: Heart,        label: 'Wellness',         to: '/client/wellness'                   },
  { icon: Apple,        label: 'Nutrition',        to: '/client/nutrition'                  },
  { icon: MessageSquare,label: 'Messages',         to: '/client/messages'                   },
  { icon: CheckSquare,  label: 'Check-in',         to: '/client/checkin'                    },
  { icon: BarChart3,    label: 'Habits',           to: '/client/habits'                     },
  { icon: Trophy,       label: 'Leaderboard',      to: '/client/leaderboard'                },
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

  const handleLogout = () => { logout(); navigate('/login'); };
  const currentLabel = navigationItems.find(item => isActive(item.to, item.exact))?.label || 'Dashboard';

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#141414', display: 'flex' }}>

      {/* Sidebar */}
      <aside
        className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
        style={{
          position: 'fixed', left: 0, top: 0, height: '100vh', width: '240px',
          backgroundColor: '#111111', borderRight: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', flexDirection: 'column', zIndex: 30,
          transition: 'transform 0.25s ease',
        }}
      >
        {/* Logo */}
        <div style={{ padding: '1.5rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: 'linear-gradient(135deg, #FF6B2B, #FFD600)', padding: '8px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(255,107,43,0.3)' }}>
              <Zap style={{ width: '18px', height: '18px', color: '#000', fill: '#000' }} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.03em', fontFamily: "'Clash Display', system-ui" }}>BrazilFit</h1>
              <p style={{ fontSize: '0.65rem', color: '#FF6B2B', margin: 0, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700 }}>Client Portal</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '1rem 0.75rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.to, item.exact);
            return (
              <button key={item.to} onClick={() => { navigate(item.to); setSidebarOpen(false); }}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '10px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                  backgroundColor: active ? '#FF6B2B' : 'transparent',
                  color: active ? '#000' : '#707070',
                  fontWeight: active ? 700 : 500, fontSize: '0.85rem', textAlign: 'left',
                  minHeight: 'auto', transition: 'all 0.15s ease',
                  fontFamily: "'Satoshi', system-ui",
                }}
                onMouseEnter={e => { if (!active) { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#fff'; } }}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#707070'; } }}
              >
                <Icon style={{ width: '16px', height: '16px', flexShrink: 0 }} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <button onClick={() => { navigate('/client/settings'); setSidebarOpen(false); }}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer', backgroundColor: 'transparent', color: '#707070', fontSize: '0.85rem', fontWeight: 500, textAlign: 'left', minHeight: 'auto', transition: 'all 0.15s ease', fontFamily: "'Satoshi', system-ui" }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#707070'; }}>
            <Settings style={{ width: '16px', height: '16px' }} />
            <span>Settings</span>
          </button>
          <button onClick={handleLogout}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer', backgroundColor: 'transparent', color: '#707070', fontSize: '0.85rem', fontWeight: 500, textAlign: 'left', minHeight: 'auto', transition: 'all 0.15s ease', fontFamily: "'Satoshi', system-ui" }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(255,67,67,0.1)'; e.currentTarget.style.color = '#ef4444'; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#707070'; }}>
            <LogOut style={{ width: '16px', height: '16px' }} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="md:ml-60" style={{ flex: 1, display: 'flex', flexDirection: 'column', transition: 'margin 0.25s ease' }}>

        {/* Header */}
        <header style={{
          backgroundColor: '#111111', borderBottom: '1px solid rgba(255,255,255,0.06)',
          padding: '0 1.25rem', height: '60px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          position: 'sticky', top: 0, zIndex: 20,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden"
              style={{ padding: '8px', borderRadius: '8px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', color: '#707070', display: 'flex', alignItems: 'center', minHeight: 'auto', minWidth: 'auto' }}>
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <h2 className="hidden md:block" style={{ fontFamily: "'Clash Display', system-ui", fontSize: '1rem', fontWeight: 700, color: '#fff', margin: 0, letterSpacing: '-0.01em' }}>
              {currentLabel}
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button style={{ position: 'relative', padding: '8px', borderRadius: '8px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', color: '#707070', display: 'flex', alignItems: 'center', minHeight: 'auto', minWidth: 'auto' }}>
              <Bell size={18} />
              <span style={{ position: 'absolute', top: '6px', right: '6px', width: '7px', height: '7px', backgroundColor: '#FF6B2B', borderRadius: '50%' }} />
            </button>

            <button onClick={() => setShowProfileModal(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 10px', borderRadius: '8px', border: 'none', backgroundColor: 'rgba(255,255,255,0.05)', cursor: 'pointer', minHeight: 'auto', minWidth: 'auto', transition: 'background 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}>
              <div style={{
                width: '30px', height: '30px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #FF6B2B, #FFD600)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.7rem', fontWeight: 800, color: '#000',
                ...(user?.isPro ? { boxShadow: '0 0 0 2px #FFD600' } : {})
              }}>{initials}</div>
              <ChevronRight size={14} color="#505050" />
            </button>
          </div>
        </header>

        {/* Content — KEY FIX: background is #141414 not #141414 */}
        <main style={{ flex: 1, overflowY: 'auto', backgroundColor: '#0f0f0f' }}>
          <Outlet />
        </main>
      </div>

      {sidebarOpen && (
        <div className="md:hidden" style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 20 }}
          onClick={() => setSidebarOpen(false)} />
      )}

      <ProfileModal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} />
    </div>
  );
}
