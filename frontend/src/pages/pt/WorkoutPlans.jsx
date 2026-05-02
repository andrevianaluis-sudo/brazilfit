// frontend/src/pages/pt/WorkoutPlans.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API = import.meta.env.VITE_API_URL || '';

export default function WorkoutPlans() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/api/workouts/plans`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }).then(r => r.json()).then(data => {
      setPlans(Array.isArray(data) ? data : []);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this workout plan?')) return;
    await fetch(`${API}/api/workouts/plans/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    setPlans(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div style={{ minHeight: '100vh', background: '#141414', color: '#fff', fontFamily: 'system-ui, sans-serif' }}>
      {/* Header */}
      <div style={{ background: '#1a1a1a', borderBottom: '1px solid #2a2a2a', padding: '18px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 20 }}>Workout Plans</div>
          <div style={{ color: '#888', fontSize: 13, marginTop: 3 }}>{plans.length} plan{plans.length !== 1 ? 's' : ''}</div>
        </div>
        <button onClick={() => navigate('/pt/workouts/create')}
          style={{ background: '#FF6B2B', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 20px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
          + New Plan
        </button>
      </div>

      <div style={{ maxWidth: 700, margin: '0 auto', padding: '20px 16px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#888' }}>Loading...</div>
        ) : plans.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <div style={{ fontSize: 48, marginBottom: 14 }}>📋</div>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>No workout plans yet</div>
            <div style={{ color: '#888', marginBottom: 24 }}>Build plans to assign to your clients</div>
            <button onClick={() => navigate('/pt/workouts/create')}
              style={{ background: '#FF6B2B', color: '#fff', border: 'none', borderRadius: 12, padding: '12px 28px', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
              Create First Plan
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {plans.map(plan => (
              <div key={plan.id} style={{ background: '#1e1e1e', borderRadius: 14, padding: '16px 18px', border: '1px solid #2a2a2a', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', transition: 'border-color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#FF6B2B'}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#2a2a2a'}
                onClick={() => navigate(`/pt/workouts/${plan.id}/edit`)}>

                <div style={{ width: 46, height: 46, borderRadius: 12, background: '#2a2a2a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>📋</div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{plan.name}</div>
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    {plan.client_name && (
                      <span style={{ color: '#4CAF50', fontSize: 12, fontWeight: 600 }}>👤 {plan.client_name}</span>
                    )}
                    {!plan.client_name && (
                      <span style={{ color: '#666', fontSize: 12 }}>Not assigned</span>
                    )}
                    {plan.description && (
                      <span style={{ color: '#666', fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{plan.description}</span>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                  <button onClick={() => navigate(`/pt/workouts/${plan.id}/edit`)}
                    style={{ background: '#2a2a2a', border: 'none', color: '#fff', borderRadius: 8, padding: '7px 14px', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Edit</button>
                  <button onClick={() => handleDelete(plan.id)}
                    style={{ background: '#2a1515', border: 'none', color: '#ff6b6b', borderRadius: 8, padding: '7px 12px', cursor: 'pointer', fontSize: 13 }}>🗑</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
