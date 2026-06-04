import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Zap, Menu, X, Calendar, Users, BarChart3, DollarSign, Settings, LogOut, Bell,
  BookOpen, Dumbbell, ChevronRight, Package, PlayCircle
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import api from '../../utils/api';

const navigationItems = [
  { icon: Calendar,    label: 'Schedule',   to: '/pt',            exact: true },
  { icon: Users,       label: 'Clients',    to: '/pt/clients'                 },
  { icon: Dumbbell,    label: 'Workouts',   to: '/pt/workouts'                },
  { icon: Package,     label: 'Blocks',     to: '/pt/blocks'                  },
];

export default function PTLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const notifRef = useRef(null);
  const pollRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/pt/notifications');
      setUnreadCount(res.data.unreadCount || 0);
      setNotifications(res.data.notifications || []);
    } catch {}
  };

  useEffect(() => {
    fetchNotifications();
    pollRef.current = setInterval(fetchNotifications, 5000);
    return () => clearInterval(pollRef.current);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifs(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleBellClick = async () => {
    setShowNotifs(prev => !prev);
    if (!showNotifs && unreadCount > 0) {
      try {
        await api.put('/pt/notifications/read-all');
        setUnreadCount(0);
        setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
      } catch {}
    }
  };

  const getNotifIcon = (type) => {
    if (type === 'cancellation') return 'X';
    if (type === 'reinstate') return '+';
    if (type === 'override') return '!';
    if (type === 'checkin') return 'C';
    if (type === 'message') return 'M';
    return '*';
  };

  const timeAgo = (dateStr) => {
    if (!dateStr) return '*';
    const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const isActive = (to, exact = false) => {
    if (exact) return location.pathname === to;
    return location.pathname.startsWith(to);
  };

  const handleLogout = () => { logout(); navigate('/login'); };
  const currentLabel = navigationItems.find(item => isActive(item.to, item.exact))?.label || 'Schedule';
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'PT';

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
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: 'linear-gradient(135deg, #FF6B2B, #FFD600)', padding: '7px', borderRadius: '8px', display: 'flex', boxShadow: '0 4px 12px rgba(255,107,43,0.3)' }}>
              <Zap style={{ width: '16px', height: '16px', color: '#000', fill: '#000' }} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.03em', fontFamily: "'DM Sans', system-ui" }}>BrazilFit</h1>
              <p style={{ fontSize: '0.6rem', color: '#FF6B2B', margin: 0, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700 }}>PT Dashboard</p>
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
                  fontFamily: "'DM Sans', system-ui",
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
          <button onClick={() => { navigate('/pt/settings'); setSidebarOpen(false); }}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer', backgroundColor: 'transparent', color: '#707070', fontSize: '0.85rem', fontWeight: 500, textAlign: 'left', minHeight: 'auto', transition: 'all 0.15s ease', fontFamily: "'DM Sans', system-ui" }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#707070'; }}
          >
            <Settings style={{ width: '16px', height: '16px' }} />
            <span>Settings</span>
          </button>
          <button onClick={handleLogout}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer', backgroundColor: 'transparent', color: '#707070', fontSize: '0.85rem', fontWeight: 500, textAlign: 'left', minHeight: 'auto', transition: 'all 0.15s ease', fontFamily: "'DM Sans', system-ui" }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(255,67,67,0.1)'; e.currentTarget.style.color = '#ef4444'; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#707070'; }}
          >
            <LogOut style={{ width: '16px', height: '16px' }} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', transition: 'margin 0.25s ease' }} className="md:ml-60">

        {/* Header */}
        <header style={{
          backgroundColor: '#111111', borderBottom: '1px solid rgba(255,255,255,0.06)',
          padding: '0 1.25rem', height: '60px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          position: 'sticky', top: 0, zIndex: 20,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden"
              style={{ padding: '8px', borderRadius: '8px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', color: '#707070', display: 'flex', alignItems: 'center', minHeight: 'auto', minWidth: 'auto' }}>
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <h2 className="hidden md:block" style={{ fontFamily: "'DM Sans', system-ui", fontSize: '1rem', fontWeight: 700, color: '#fff', margin: 0, letterSpacing: '-0.01em' }}>
              {currentLabel}
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Notifications */}
            <div ref={notifRef} style={{ position: 'relative' }}>
              <button
                onClick={handleBellClick}
                style={{ position: 'relative', padding: '8px', borderRadius: '8px', border: 'none', backgroundColor: showNotifs ? 'rgba(255,255,255,0.08)' : 'transparent', cursor: 'pointer', color: showNotifs ? '#fff' : '#707070', display: 'flex', alignItems: 'center', minHeight: 'auto', minWidth: 'auto', transition: 'all 0.15s' }}
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span style={{ position: 'absolute', top: '4px', right: '4px', minWidth: '16px', height: '16px', padding: '0 3px', background: 'linear-gradient(135deg, #FF6B2B, #FFD600)', color: '#000', fontSize: '0.55rem', fontWeight: 800, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Dropdown */}
              {showNotifs && (
                <div style={{ position: 'fixed', top: '68px', right: '12px', width: 'min(340px, calc(100vw - 24px))', backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', boxShadow: '0 20px 60px rgba(0,0,0,0.8)', zIndex: 999, overflow: 'hidden' }}>
                  {/* Header */}
                  <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontFamily: "'DM Sans', system-ui", fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>Notifications</span>
                    <span style={{ fontFamily: "'DM Sans', system-ui", fontSize: '0.7rem', color: '#707070' }}>All caught up✓</span>
                  </div>

                  {/* List */}
                  <div style={{ maxHeight: '380px', overflowY: 'auto' }}>
                    {notifications.length === 0 ? (
                      <div style={{ padding: '2rem', textAlign: 'center' }}>
                        <p style={{ fontFamily: "'DM Sans', system-ui", fontSize: '1.5rem', marginBottom: '8px' }}>🔔</p>
                        <p style={{ fontFamily: "'DM Sans', system-ui", fontSize: '0.82rem', color: '#707070', margin: 0 }}>No notifications yet</p>
                      </div>
                    ) : notifications.map(n => (
                      <div
                        key={n.id}
                        onClick={() => { setShowNotifs(false); if (n.type === 'message' && n.client_id) { navigate(`/pt/clients/${n.client_id}?tab=messages`); } else if (n.client_id) { navigate(`/pt/clients/${n.client_id}`); } }}
                        style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '12px', alignItems: 'flex-start', cursor: n.client_id ? 'pointer' : 'default', backgroundColor: n.is_read ? 'transparent' : 'rgba(255,107,43,0.05)', transition: 'background 0.15s' }}
                        onMouseEnter={e => { if (n.client_id) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)'; }}
                        onMouseLeave={e => { e.currentTarget.style.backgroundColor = n.is_read ? 'transparent' : 'rgba(255,107,43,0.05)'; }}
                      >
                        <span style={{ fontSize: '0.9rem', flexShrink: 0, marginTop: '1px', fontWeight: 800, color: n.type==='message'?'#a78bfa':n.type==='cancellation'?'#ef4444':n.type==='checkin'?'#FFD600':'#FF6B2B' }}>{getNotifIcon(n.type)}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontFamily: "'DM Sans', system-ui", fontSize: '0.8rem', fontWeight: 600, color: '#fff', margin: '0 0 2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{n.title}</p>
                          <p style={{ fontFamily: "'DM Sans', system-ui", fontSize: '0.72rem', color: '#707070', margin: '0 0 4px', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{n.message}</p>
                          <p style={{ fontFamily: "'DM Sans', system-ui", fontSize: '0.65rem', color: '#505050', margin: 0 }}>{timeAgo(n.created_at)}</p>
                        </div>
                        {!n.is_read && (
                          <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#FF6B2B', flexShrink: 0, marginTop: '5px' }} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* PT Avatar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '5px 10px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
              <div style={{
                width: '30px', height: '30px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #FF6B2B, #FFD600)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.7rem', fontWeight: 800, color: '#000',
              }}>{initials}</div>
              <span className="hidden sm:inline" style={{ fontFamily: "'DM Sans', system-ui", fontSize: '0.82rem', fontWeight: 700, color: '#fff' }}>{user?.name || 'PT'}</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <main style={{ flex: 1, overflowY: 'auto', backgroundColor: '#141414' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="md:hidden" style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 20 }}
          onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  );
}


