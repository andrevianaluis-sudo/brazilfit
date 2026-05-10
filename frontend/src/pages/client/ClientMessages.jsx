import React, { useState, useEffect, useRef } from 'react';
import { Send, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const BG='#0f0f0f';const SURFACE='#1a1a1a';const SURFACE2='#222';const BORDER='rgba(255,255,255,0.08)';const TEXT='#ffffff';const MUTED='#606060';const ORANGE='#FF6B2B';const GREEN='#4CAF50';

export default function ClientMessages() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [pt, setPt] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const res = await api.get('/messages');
      setMessages(res.data.messages || []);
      setPt(res.data.pt);
      setLoading(false);
    } catch { setLoading(false); }
  };

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    setSending(true);
    try {
      await api.post('/messages', { message_text: newMessage });
      setNewMessage('');
      await fetchMessages();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send message');
    } finally { setSending(false); }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: BG }}>
      <div style={{ width: '20px', height: '20px', border: `2px solid ${ORANGE}`, borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
    </div>
  );

  if (!pt) return (
    <div style={{ backgroundColor: BG, minHeight: '100vh', padding: '2rem 1.5rem' }}>
      <button onClick={() => navigate('/client')} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: MUTED, cursor: 'pointer', fontFamily: "'DM Sans', system-ui", fontSize: '0.875rem', fontWeight: 500, marginBottom: '3rem', padding: 0, minHeight: 'auto' }}>
        <ArrowLeft size={16} /> Back
      </button>
      <div style={{ textAlign: 'center', maxWidth: '360px', margin: '0 auto' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👤</div>
        <h2 style={{ fontFamily: "'DM Sans', system-ui", fontSize: '1.3rem', fontWeight: 700, color: TEXT, letterSpacing: '-0.02em', margin: '0 0 0.5rem' }}>No PT Assigned</h2>
        <p style={{ fontFamily: "'DM Sans', system-ui", fontSize: '0.85rem', color: MUTED, margin: 0, lineHeight: 1.6 }}>You don't have a PT assigned yet. Contact your gym to get started.</p>
      </div>
    </div>
  );

  const ptInitials = pt.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'PT';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: BG }}>

      {/* Header */}
      <div style={{ padding:'0 1.5rem', height:'64px', backgroundColor:'#111', borderBottom:`1px solid ${BORDER}`, display:'flex', alignItems:'center', gap:'1rem', flexShrink:0, boxShadow:'0 2px 20px rgba(0,0,0,0.4)' }}>
        <button onClick={() => navigate('/client')} style={{ background:'rgba(255,255,255,0.06)', border:`1px solid ${BORDER}`, cursor:'pointer', padding:'7px', display:'flex', alignItems:'center', color:TEXT, minHeight:'auto', minWidth:'auto', borderRadius:'10px', transition:'all 0.15s' }}
          onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.1)'}
          onMouseLeave={e=>e.currentTarget.style.background='rgba(255,255,255,0.06)'}>
          <ArrowLeft size={16} />
        </button>
        <div style={{ width:'40px', height:'40px', borderRadius:'50%', background:`linear-gradient(135deg,${ORANGE},#FFD600)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.78rem', fontWeight:800, color:'#000', flexShrink:0, boxShadow:`0 4px 12px rgba(255,107,43,0.4)` }}>
          {ptInitials}
        </div>
        <div>
          <p style={{ fontFamily:"'DM Sans',system-ui", fontSize:'0.95rem', fontWeight:800, color:TEXT, margin:0, letterSpacing:'-0.02em' }}>{pt.name}</p>
          <p style={{ fontFamily:"'DM Sans',system-ui", fontSize:'0.68rem', color:GREEN, margin:0, fontWeight:700 }}>Your Personal Trainer</p>
        </div>
        <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:'6px', background:'rgba(76,175,80,0.1)', border:'1px solid rgba(76,175,80,0.2)', borderRadius:'20px', padding:'4px 10px' }}>
          <div style={{ width:'6px', height:'6px', borderRadius:'50%', backgroundColor:GREEN, boxShadow:`0 0 6px ${GREEN}` }} />
          <p style={{ fontFamily:"'DM Sans',system-ui", fontSize:'0.62rem', color:GREEN, fontWeight:700, margin:0 }}>Online</p>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {messages.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: SURFACE, border: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', fontSize: '1.5rem' }}>💬</div>
            <p style={{ fontFamily: "'DM Sans', system-ui", fontSize: '1.1rem', fontWeight: 700, color: MUTED, letterSpacing: '-0.02em', margin: '0 0 0.4rem' }}>No messages yet</p>
            <p style={{ fontFamily: "'DM Sans', system-ui", fontSize: '0.8rem', color: MUTED, margin: 0, opacity: 0.7 }}>Send a message to get started!</p>
          </div>
        ) : (
          <>
            {/* Date separator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '0.5rem 0' }}>
              <div style={{ flex: 1, height: '1px', backgroundColor: BORDER }} />
              <p style={{ fontFamily: "'DM Sans', system-ui", fontSize: '0.65rem', fontWeight: 600, color: MUTED, margin: 0, letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>Today</p>
              <div style={{ flex: 1, height: '1px', backgroundColor: BORDER }} />
            </div>

            {messages.map((msg) => {
              const isClient = msg.sender_type === 'client';
              return (
                <div key={msg.id} style={{ display:'flex', justifyContent:isClient?'flex-end':'flex-start', alignItems:'flex-end', gap:'8px' }}>
                  {!isClient && (
                    <div style={{ width:'30px', height:'30px', borderRadius:'50%', background:`linear-gradient(135deg,${ORANGE},#FFD600)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.62rem', fontWeight:800, color:'#000', flexShrink:0 }}>
                      {ptInitials}
                    </div>
                  )}
                  <div style={{ maxWidth:'70%' }}>
                    <div style={{
                      padding:'0.75rem 1rem',
                      borderRadius: isClient ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                      background: isClient ? `linear-gradient(135deg,${ORANGE},#FF8C55)` : SURFACE,
                      border: isClient ? 'none' : `1px solid rgba(255,255,255,0.1)`,
                      boxShadow: isClient ? `0 4px 16px rgba(255,107,43,0.3)` : 'none',
                      wordBreak:'break-word',
                    }}>
                      <p style={{ fontFamily:"'DM Sans',system-ui", fontSize:'0.875rem', color:isClient?'#000':TEXT, margin:0, lineHeight:1.5, fontWeight:isClient?600:400 }}>{msg.message_text}</p>
                    </div>
                    <p style={{ fontFamily:"'DM Sans',system-ui", fontSize:'0.62rem', color:MUTED, margin:'4px 0 0', textAlign:isClient?'right':'left' }}>
                      {new Date(msg.created_at).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div style={{ padding:'1rem 1.5rem', backgroundColor:'#111', borderTop:`1px solid ${BORDER}`, flexShrink:0, boxShadow:'0 -4px 20px rgba(0,0,0,0.3)' }}>
        <div style={{ display:'flex', gap:'8px', alignItems:'flex-end', background:SURFACE, borderRadius:'16px', border:`1px solid ${BORDER}`, padding:'6px 6px 6px 14px', transition:'border-color 0.15s' }}
          onFocus={()=>{}} >
          <textarea
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            placeholder="Message your PT..."
            onKeyPress={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            rows={1}
            style={{ flex:1, padding:'8px 0', border:'none', backgroundColor:'transparent', color:TEXT, fontFamily:"'DM Sans',system-ui", fontSize:'0.875rem', resize:'none', outline:'none', lineHeight:1.5 }}
          />
          <button
            onClick={handleSend}
            disabled={!newMessage.trim() || sending}
            style={{ width:'40px', height:'40px', borderRadius:'12px', border:'none', background:newMessage.trim()&&!sending?`linear-gradient(135deg,${ORANGE},#FFD600)`:'rgba(255,255,255,0.06)', color:newMessage.trim()&&!sending?'#000':MUTED, cursor:newMessage.trim()&&!sending?'pointer':'not-allowed', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'all 0.15s', minHeight:'auto', minWidth:'auto', boxShadow:newMessage.trim()&&!sending?`0 4px 12px rgba(255,107,43,0.4)`:'none' }}>
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
