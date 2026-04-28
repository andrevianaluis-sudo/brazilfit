import React, { useState, useEffect, useRef } from 'react';
import { Send, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';

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
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    try {
      const res = await api.get('/messages');
      setMessages(res.data.messages || []);
      setPt(res.data.pt);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load messages:', err);
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    setSending(true);
    try {
      await api.post('/messages', { message_text: newMessage });
      setNewMessage('');
      await fetchMessages();
      toast.success('Message sent');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div style={{ width: '2rem', height: '2rem', border: '3px solid #1a4a3a', borderTop: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    );
  }

  if (!pt) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <button onClick={() => navigate('/client')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', background: 'none', border: 'none', color: '#1a4a3a', cursor: 'pointer', fontSize: '0.875rem', fontWeight: '500' }}>
          <ArrowLeft style={{ width: '1rem', height: '1rem' }} />
          Back
        </button>
        <div style={{ maxWidth: '400px', margin: '0 auto' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👤</div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1a1a1a', marginBottom: '0.5rem' }}>No PT Assigned</h2>
          <p style={{ color: '#6b7280', marginBottom: '2rem' }}>You don't have a PT assigned yet. Contact your gym to get started.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#f8faf9' }}>
      <div style={{ padding: '1rem', backgroundColor: '#ffffff', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button onClick={() => navigate('/client')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem', display: 'flex', alignItems: 'center', color: '#1a4a3a' }}>
          <ArrowLeft style={{ width: '1.25rem', height: '1.25rem' }} />
        </button>
        <div>
          <h1 style={{ fontSize: '1rem', fontWeight: '600', color: '#1a1a1a', margin: 0 }}>{pt.name}</h1>
          <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: '0.25rem 0 0 0' }}>{pt.email}</p>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
            <p>No messages yet. Send one to get started!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} style={{ display: 'flex', justifyContent: msg.sender_type === 'client' ? 'flex-end' : 'flex-start' }}>
              <div style={{ maxWidth: '70%', padding: '0.75rem 1rem', borderRadius: '0.75rem', backgroundColor: msg.sender_type === 'client' ? '#1a4a3a' : '#e5e7eb', color: msg.sender_type === 'client' ? '#ffffff' : '#1a1a1a', wordBreak: 'break-word' }}>
                <p style={{ margin: 0, fontSize: '0.875rem' }}>{msg.message_text}</p>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.7rem', opacity: 0.7 }}>{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div style={{ padding: '1rem', backgroundColor: '#ffffff', borderTop: '1px solid #e5e7eb' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <textarea value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type your message..." onKeyPress={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }} style={{ flex: 1, padding: '0.75rem 1rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', fontFamily: 'Satoshi, system-ui, sans-serif', fontSize: '0.875rem', resize: 'none', height: '3rem', color: '#1a1a1a' }} />
          <button onClick={handleSend} disabled={!newMessage.trim() || sending} style={{ padding: '0.75rem 1rem', backgroundColor: newMessage.trim() && !sending ? '#1a4a3a' : '#d1d5db', color: '#ffffff', border: 'none', borderRadius: '0.5rem', cursor: newMessage.trim() && !sending ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'Satoshi, system-ui, sans-serif', fontSize: '0.875rem', fontWeight: '500', transition: 'background-color 0.2s' }}>
            <Send style={{ width: '1rem', height: '1rem' }} />
          </button>
        </div>
      </div>
    </div>
  );
}
