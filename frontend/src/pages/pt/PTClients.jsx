import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, ChevronRight, Crown, Wifi, Users, ClipboardList, Plus, X } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getStatusStyle(status) {
  switch (status) {
    case 'renew': return 'border-red-500/40 bg-red-500/10';
    case 'critical': return 'border-orange-500/40 bg-orange-500/10';
    case 'warning': return 'border-yellow-500/40 bg-yellow-500/10';
    default: return 'border-white/10 bg-grey-100';
  }
}

function StatusBadge({ status, sessionsRemaining }) {
  if (status === 'renew') return <span className="badge-red">Renew Now</span>;
  if (status === 'critical') return <span className="badge-orange">{sessionsRemaining} Left</span>;
  if (status === 'warning') return <span className="badge-yellow">{sessionsRemaining} Left</span>;
  return <span className="badge-green">{sessionsRemaining} Left</span>;
}

function BlockProgress({ used, total = 10 }) {
  const pct = Math.min(100, (used / total) * 100);
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-grey-100 rounded-full h-1.5">
        <div
          className={`h-full rounded-full transition-all ${pct >= 90 ? 'bg-red-400' : pct >= 80 ? 'bg-orange-400' : 'bg-brazil-green'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-grey-200 w-8 text-right">{used}/10</span>
    </div>
  );
}

export default function PTClients() {
  const [clients, setClients] = useState([]);
  const [onboardingMap, setOnboardingMap] = useState({});
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newClientForm, setNewClientForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    username: '',
    password: '',
    clientType: 'F2F',
    package: '400',
    sessionsInBlock: '10',
    startDate: new Date().toISOString().split('T')[0],
    notes: ''
  });
  const [creatingClient, setCreatingClient] = useState(false);

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$';
    let pwd = '';
    for (let i = 0; i < 12; i++) pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    setNewClientForm(f => ({ ...f, password: pwd }));
  };

  const handleAddClient = async () => {
    if (!newClientForm.fullName || !newClientForm.email || !newClientForm.username || !newClientForm.password) {
      toast.error('Please fill all required fields');
      return;
    }

    setCreatingClient(true);
    try {
      const res = await api.post('/pt/clients/create', {
        name: newClientForm.fullName,
        email: newClientForm.email,
        phone: newClientForm.phone,
        username: newClientForm.username,
        password: newClientForm.password,
        client_type: newClientForm.clientType,
        block_price: parseInt(newClientForm.package),
        block_start_date: newClientForm.startDate,
        sessions_in_block: parseInt(newClientForm.sessionsInBlock),
        notes: newClientForm.notes
      });

      toast.success(`Client created!\nUsername: ${newClientForm.username}\nPassword: ${newClientForm.password}`);
      setShowAddModal(false);
      setNewClientForm({ fullName: '', email: '', phone: '', username: '', password: '', clientType: 'F2F', package: '400', sessionsInBlock: '10', startDate: new Date().toISOString().split('T')[0], notes: '' });

      // Reload clients
      const clientsRes = await api.get('/pt/clients');
      setClients(clientsRes.data);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create client');
    } finally {
      setCreatingClient(false);
    }
  };

  useEffect(() => {
    Promise.all([
      api.get('/pt/clients'),
      api.get('/onboarding/all-clients').catch(() => ({ data: [] })),
    ]).then(([clientsRes, onbRes]) => {
      setClients(clientsRes.data);
      const map = {};
      for (const row of (onbRes.data || [])) map[row.id] = row;
      setOnboardingMap(map);
      setLoading(false);
    }).catch(() => {
      toast.error('Failed to load clients');
      setLoading(false);
    });
  }, []);

  const filtered = clients.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase());
    if (!matchSearch) return false;
    if (filter === 'all') return true;
    if (filter === 'alert') return c.status === 'renew' || c.status === 'critical';
    if (filter === 'f2f') return c.client_type === 'F2F';
    if (filter === 'online') return c.client_type === 'Online';
    return true;
  });

  const alerts = clients.filter(c => c.status === 'renew' || c.status === 'critical');

  if (loading) return (
    <div className="flex justify-center py-12">
      <div className="w-8 h-8 border-4 border-brazil-green border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div style={{ paddingBottom: '4rem' }}>
      {/* Premium PT Dashboard Hero */}
      <div className="pt-dashboard-hero">
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h1 className="pt-dashboard-title">Your Clients</h1>
              <p className="pt-dashboard-subtitle">{clients.length} active · {alerts.length} need attention</p>
            </div>
            <button onClick={() => setShowAddModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#1a4a3a', color: '#ffffff', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '600', fontSize: '0.875rem' }}>
              <Plus style={{ width: '1rem', height: '1rem' }} />
              Add Client
            </button>
            <div className="analytics-card" style={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              padding: '1rem',
              textAlign: 'center'
            }}>
              <p style={{
                fontFamily: "'Clash Display', system-ui, sans-serif",
                fontSize: '1.5rem',
                fontWeight: 700,
                color: 'white',
                margin: 0
              }}>{clients.length}</p>
              <p style={{
                fontFamily: "'Satoshi', system-ui, sans-serif",
                fontSize: '0.75rem',
                color: 'rgba(255, 255, 255, 0.8)',
                margin: '0.25rem 0 0 0'
              }}>Total Clients</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ padding: '1rem 1rem', maxWidth: '1200px', margin: '0 auto' }}>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: '1rem' }}>
          <Search style={{
            position: 'absolute',
            left: '0.75rem',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '1rem',
            height: '1rem',
            color: '#6b7280'
          }} />
          <input
            type="text"
            placeholder="Search clients..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%',
              paddingLeft: '2.5rem',
              padding: '0.75rem 1rem 0.75rem 2.5rem',
              border: '1px solid var(--color-grey-light)',
              borderRadius: 'var(--radius-md)',
              fontFamily: "'Satoshi', system-ui, sans-serif",
              fontSize: '0.875rem',
              color: 'var(--color-charcoal)',
              transition: 'var(--transition-fast)'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--color-mint)';
              e.target.style.boxShadow = '0 0 0 3px rgba(125, 212, 168, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'var(--color-grey-light)';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
          {[
            { key: 'all', label: 'All' },
            { key: 'alert', label: `⚠️ Alerts (${alerts.length})` },
            { key: 'f2f', label: 'F2F' },
            { key: 'online', label: 'Online' },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={filter === f.key ? 'btn btn-primary' : 'btn btn-secondary'}
              style={{
                padding: '0.5rem 1rem',
                fontSize: '0.875rem',
                whiteSpace: 'nowrap',
                flexShrink: 0
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Client List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: '900px' }}>
          {filtered.map(c => (
            <Link
              key={c.id}
              to={`/pt/clients/${c.id}`}
              className="premium-list-item"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                borderRadius: 'var(--radius-md)',
                padding: '1rem',
                border: `1px solid ${getStatusStyle(c.status).includes('red') ? '#fee2e2' : getStatusStyle(c.status).includes('orange') ? '#fed7aa' : getStatusStyle(c.status).includes('yellow') ? '#fef3c7' : 'var(--color-grey-light)'}`,
                backgroundColor: `${getStatusStyle(c.status).includes('red') ? '#fef2f2' : getStatusStyle(c.status).includes('orange') ? '#fffbf0' : getStatusStyle(c.status).includes('yellow') ? '#fffbeb' : 'var(--color-card)'}`,
                textDecoration: 'none',
                color: 'inherit',
                transition: 'var(--transition-normal)',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
            {/* Avatar */}
            <div className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0
              ${c.client_type === 'Online' ? 'bg-blue-500/20 text-blue-400' : 'bg-brazil-green/20 text-brazil-green'}`}>
              {c.name.charAt(0)}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="font-semibold text-sm" style={{ fontSize: '1rem', fontWeight: '600' }}>{c.name}</p>
                {c.is_pro === 1 && <Crown className="w-3.5 h-3.5 text-brazil-yellow" />}
              </div>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>{c.email}</p>
              <div className="flex items-center gap-2 mb-1">
                {c.client_type === 'Online' ? (
                  <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full">Online · £{c.block_price}</span>
                ) : (
                  <span className="text-[10px] bg-grey-100 text-grey-200 px-2 py-1 rounded-full">F2F · £{c.block_price}</span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <BlockProgress used={c.sessions_used} />
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <StatusBadge status={c.status} sessionsRemaining={c.sessions_remaining} />
              <ChevronRight className="w-4 h-4 text-grey-100" />
            </div>
            </Link>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="empty-state-container">
            <Users className="empty-state-icon" />
            <p className="empty-state-title">No clients found</p>
            <p className="empty-state-message">Try adjusting your filters or search term</p>
          </div>
        )}
      </div>

      {/* Add Client Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 50, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '1rem', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflow: 'auto', boxShadow: '0 20px 48px rgba(0,0,0,0.15)' }}>
            <div style={{ padding: '2rem', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1a1a1a', margin: 0 }}>Add New Client</h2>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: '1.5rem' }}>
                <X style={{ width: '1.5rem', height: '1.5rem' }} />
              </button>
            </div>

            <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#1a1a1a', marginBottom: '0.5rem' }}>Full Name *</label>
                <input type="text" value={newClientForm.fullName} onChange={(e) => { setNewClientForm(f => ({ ...f, fullName: e.target.value, username: e.target.value.toLowerCase().split(' ')[0] || '' })); }} placeholder="e.g. John Smith" style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '0.875rem', color: '#1a1a1a' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#1a1a1a', marginBottom: '0.5rem' }}>Email *</label>
                <input type="email" value={newClientForm.email} onChange={(e) => setNewClientForm(f => ({ ...f, email: e.target.value }))} placeholder="e.g. john@example.com" style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '0.875rem', color: '#1a1a1a' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#1a1a1a', marginBottom: '0.5rem' }}>Phone</label>
                <input type="tel" value={newClientForm.phone} onChange={(e) => setNewClientForm(f => ({ ...f, phone: e.target.value }))} placeholder="e.g. 07700 123456" style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '0.875rem', color: '#1a1a1a' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#1a1a1a', marginBottom: '0.5rem' }}>Username *</label>
                <input type="text" value={newClientForm.username} onChange={(e) => setNewClientForm(f => ({ ...f, username: e.target.value }))} placeholder="e.g. john.smith" style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '0.875rem', color: '#1a1a1a' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#1a1a1a', marginBottom: '0.5rem' }}>Password *</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input type="text" value={newClientForm.password} onChange={(e) => setNewClientForm(f => ({ ...f, password: e.target.value }))} placeholder="Auto-generated password" style={{ flex: 1, padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '0.875rem', color: '#1a1a1a' }} />
                  <button onClick={generatePassword} style={{ padding: '0.75rem 1rem', backgroundColor: '#e5e7eb', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', fontWeight: '600', color: '#1a1a1a' }}>Generate</button>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#1a1a1a', marginBottom: '0.5rem' }}>Package Type</label>
                <select value={newClientForm.clientType} onChange={(e) => setNewClientForm(f => ({ ...f, clientType: e.target.value }))} style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '0.875rem', color: '#1a1a1a' }}>
                  <option value="F2F">F2F £400</option>
                  <option value="Online">Online £350</option>
                  <option value="Elite">Elite £600</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#1a1a1a', marginBottom: '0.5rem' }}>Sessions in Block</label>
                <input type="number" value={newClientForm.sessionsInBlock} onChange={(e) => setNewClientForm(f => ({ ...f, sessionsInBlock: e.target.value }))} min="1" style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '0.875rem', color: '#1a1a1a' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#1a1a1a', marginBottom: '0.5rem' }}>Start Date</label>
                <input type="date" value={newClientForm.startDate} onChange={(e) => setNewClientForm(f => ({ ...f, startDate: e.target.value }))} style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '0.875rem', color: '#1a1a1a' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#1a1a1a', marginBottom: '0.5rem' }}>Notes</label>
                <textarea value={newClientForm.notes} onChange={(e) => setNewClientForm(f => ({ ...f, notes: e.target.value }))} placeholder="Optional notes..." style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '0.875rem', color: '#1a1a1a', minHeight: '4rem', fontFamily: 'inherit' }} />
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button onClick={() => setShowAddModal(false)} style={{ flex: 1, padding: '0.75rem', backgroundColor: '#e5e7eb', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', fontWeight: '600', color: '#1a1a1a' }}>Cancel</button>
                <button onClick={handleAddClient} disabled={creatingClient} style={{ flex: 1, padding: '0.75rem', backgroundColor: '#1a4a3a', color: '#ffffff', border: 'none', borderRadius: '0.5rem', cursor: creatingClient ? 'not-allowed' : 'pointer', fontSize: '0.875rem', fontWeight: '600', opacity: creatingClient ? 0.6 : 1 }}>
                  {creatingClient ? 'Creating...' : 'Create Client Account'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
