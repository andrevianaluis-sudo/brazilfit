import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Zap, Eye, EyeOff, ArrowRight } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error('Please enter your username and password');
      return;
    }
    setLoading(true);
    try {
      const user = await login(username, password);
      if (user.role === 'pt') navigate('/pt');
      else navigate('/client');
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '0.875rem 1rem',
    backgroundColor: '#111111',
    border: '1px solid #1e1e1e',
    borderRadius: '6px',
    fontFamily: "'DM Sans', system-ui, sans-serif",
    fontSize: '0.9rem',
    color: '#ffffff',
    outline: 'none',
    transition: 'border-color 0.15s ease',
    boxSizing: 'border-box',
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#141414',
      display: 'flex',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background subtle glow */}
      <div style={{
        position: 'absolute', top: '-200px', left: '-200px',
        width: '600px', height: '600px',
        background: 'radial-gradient(circle, rgba(76,175,80,0.04) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '-200px', right: '-200px',
        width: '500px', height: '500px',
        background: 'radial-gradient(circle, rgba(255,107,43,0.03) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Left panel — branding */}
      <div style={{
        display: 'none',
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '3rem',
        borderRight: '1px solid #141414',
      }} className="md-flex">

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ background: 'linear-gradient(135deg, #4CAF50, #66BB6A)', padding: '8px', borderRadius: '8px', display: 'flex' }}>
            <Zap style={{ width: '18px', height: '18px', color: '#000', fill: '#000' }} />
          </div>
          <span style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: '1.3rem', fontWeight: 800, color: '#4CAF50', letterSpacing: '-0.03em' }}>BrazilFit</span>
        </div>

        <div>
          <p style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.18em', color: '#4CAF50', textTransform: 'uppercase', margin: '0 0 1rem' }}>Premium Training</p>
          <h2 style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: 'clamp(2.5rem, 4vw, 3.5rem)', fontWeight: 800, color: '#fff', letterSpacing: '-0.04em', lineHeight: 1, margin: '0 0 1.5rem' }}>Train smarter.<br />Live better.</h2>
          <p style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: '0.85rem', color: '#3a3a3a', margin: 0, lineHeight: 1.7, maxWidth: '320px' }}>Your personal training hub. Track sessions, monitor progress and stay connected with your PT.</p>
        </div>

        <p style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: '0.72rem', color: '#2a2a2a', margin: 0, letterSpacing: '0.05em' }}>© 2026 BrazilFit · All rights reserved</p>
      </div>

      {/* Right panel — form */}
      <div style={{
        width: '100%',
        maxWidth: '480px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '2rem 2rem',
      }}>

        {/* Mobile logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '3rem' }}>
          <div style={{ background: 'linear-gradient(135deg, #4CAF50, #66BB6A)', padding: '7px', borderRadius: '7px', display: 'flex' }}>
            <Zap style={{ width: '16px', height: '16px', color: '#000', fill: '#000' }} />
          </div>
          <span style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: '1.2rem', fontWeight: 800, color: '#4CAF50', letterSpacing: '-0.03em' }}>BrazilFit</span>
        </div>

        {/* Heading */}
        <div style={{ marginBottom: '2.5rem' }}>
          <h1 style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: '1.9rem', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.03em', margin: '0 0 0.4rem', lineHeight: 1.1 }}>Welcome back</h1>
          <p style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: '0.82rem', color: '#3a3a3a', margin: 0, fontWeight: 500 }}>Sign in to your account to continue</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {/* Username */}
          <div>
            <p style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.16em', color: '#3a3a3a', textTransform: 'uppercase', margin: '0 0 0.5rem' }}>Username</p>
            <input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              autoCapitalize="none"
              autoComplete="username"
              style={inputStyle}
              onFocus={e => { e.target.style.borderColor = '#4CAF50'; e.target.style.boxShadow = '0 0 0 3px rgba(76,175,80,0.08)'; }}
              onBlur={e => { e.target.style.borderColor = '#1e1e1e'; e.target.style.boxShadow = 'none'; }}
            />
          </div>

          {/* Password */}
          <div>
            <p style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.16em', color: '#3a3a3a', textTransform: 'uppercase', margin: '0 0 0.5rem' }}>Password</p>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
                style={{ ...inputStyle, paddingRight: '3rem' }}
                onFocus={e => { e.target.style.borderColor = '#4CAF50'; e.target.style.boxShadow = '0 0 0 3px rgba(76,175,80,0.08)'; }}
                onBlur={e => { e.target.style.borderColor = '#1e1e1e'; e.target.style.boxShadow = 'none'; }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#3a3a3a', padding: '4px', display: 'flex', alignItems: 'center', minHeight: 'auto', minWidth: 'auto' }}
                onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                onMouseLeave={e => e.currentTarget.style.color = '#3a3a3a'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '0.5rem',
              width: '100%',
              padding: '0.9rem 1.5rem',
              backgroundColor: loading ? '#2a2a2a' : '#4CAF50',
              color: loading ? '#606060' : '#000',
              border: 'none',
              borderRadius: '6px',
              fontFamily: "'DM Sans', system-ui, sans-serif",
              fontSize: '0.875rem',
              fontWeight: 700,
              letterSpacing: '0.02em',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.15s ease',
              minHeight: 'auto',
            }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.backgroundColor = '#66BB6A'; }}
            onMouseLeave={e => { if (!loading) e.currentTarget.style.backgroundColor = '#4CAF50'; }}
          >
            {loading ? (
              <>
                <div style={{ width: '16px', height: '16px', border: '2px solid #444', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                Signing in...
              </>
            ) : (
              <>Sign In <ArrowRight size={15} /></>
            )}
          </button>
        </form>

        
            <ArrowRight size={13} color="#2a2a2a" />
          </button>
        </div>

        <p style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: '0.65rem', color: '#2a2a2a', margin: '2rem 0 0', textAlign: 'center', letterSpacing: '0.05em' }}>© 2026 BrazilFit · All rights reserved</p>
      </div>
    </div>
  );
}
