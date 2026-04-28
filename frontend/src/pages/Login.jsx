import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Zap, Eye, EyeOff } from 'lucide-react';

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
      if (user.role === 'pt') {
        navigate('/pt');
      } else {
        navigate('/client');
      }
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container" style={{
      backgroundImage: 'url(/images/newcastle-113.jpg)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed'
    }}>
      {/* Dark overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)'
      }} />

      <div style={{
        position: 'relative',
        zIndex: 10,
        width: '100%',
        maxWidth: '28rem',
        padding: '0 1.5rem'
      }} className="animate-fade-in">
        {/* Logo Section */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginBottom: '2.5rem'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '0.75rem'
          }}>
            <div style={{
              backgroundColor: '#1a4a3a',
              padding: '0.625rem',
              borderRadius: '0.5rem'
            }}>
              <Zap className="w-7 h-7" style={{ color: 'white', fill: 'white' }} />
            </div>
            <h1 className="login-logo">
              <span style={{ color: '#1a4a3a' }}>Brazil</span>
              <span style={{ color: '#f9a661' }}>Fit</span>
            </h1>
          </div>
          <p style={{
            color: 'rgba(255, 255, 255, 0.9)',
            fontSize: '0.875rem',
            fontWeight: 500,
            letterSpacing: '0.05em'
          }}>Train smarter. Live better.</p>
        </div>

        {/* Login Card */}
        <div className="login-card">
          <h2 style={{
            fontFamily: "'Clash Display', system-ui, sans-serif",
            fontWeight: 700,
            fontSize: '1.25rem',
            color: '#1a4a3a',
            marginBottom: '1.5rem',
            textAlign: 'center'
          }}>Sign in to your account</h2>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label className="login-form-label">Username or Email</label>
              <input
                type="text"
                placeholder="pt or vivien"
                value={username}
                onChange={e => setUsername(e.target.value)}
                autoCapitalize="none"
                autoComplete="username"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  marginTop: '0.5rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  fontFamily: "'Satoshi', system-ui, sans-serif",
                  fontSize: '0.875rem',
                  color: '#1a1a1a',
                  transition: 'var(--transition-fast)'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#7dd4a8';
                  e.target.style.boxShadow = '0 0 0 3px rgba(125, 212, 168, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            <div>
              <label className="login-form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="current-password"
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    paddingRight: '3rem',
                    marginTop: '0.5rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    fontFamily: "'Satoshi', system-ui, sans-serif",
                    fontSize: '0.875rem',
                    color: '#1a1a1a',
                    transition: 'var(--transition-fast)'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#7dd4a8';
                    e.target.style.boxShadow = '0 0 0 3px rgba(125, 212, 168, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    padding: '0.5rem',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#6b7280',
                    transition: 'color var(--transition-fast)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#1a1a1a'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#6b7280'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{
                marginTop: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                opacity: loading ? '0.5' : '1',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? (
                <>
                  <div style={{
                    width: '1.25rem',
                    height: '1.25rem',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    borderTop: '2px solid white',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite'
                  }} />
                  Signing in...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  Sign In
                </>
              )}
            </button>
          </form>

          <div style={{
            marginTop: '1.5rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid #e5e7eb'
          }}>
            <p style={{
              textAlign: 'center',
              color: '#6b7280',
              fontSize: '0.75rem',
              marginBottom: '0.75rem',
              fontFamily: "'Satoshi', system-ui, sans-serif",
              fontWeight: 500
            }}>Demo credentials</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button
                onClick={() => { setUsername('pt'); setPassword('PTadmin2026!'); }}
                style={{
                  fontSize: '0.75rem',
                  backgroundColor: '#f8faf9',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  padding: '0.75rem',
                  color: '#1a1a1a',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontFamily: "'Satoshi', system-ui, sans-serif",
                  transition: 'var(--transition-fast)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f3f4f6';
                  e.currentTarget.style.borderColor = '#7dd4a8';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#f8faf9';
                  e.currentTarget.style.borderColor = '#e5e7eb';
                }}
              >
                <span style={{
                  display: 'inline-block',
                  backgroundColor: '#1a4a3a',
                  color: 'white',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '0.25rem',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  marginRight: '0.5rem'
                }}>PT</span>
                username: <strong>pt</strong> — password: <strong>PTadmin2026!</strong>
              </button>
              <button
                onClick={() => { setUsername('vivien'); setPassword('BrazilFit2026!'); }}
                style={{
                  fontSize: '0.75rem',
                  backgroundColor: '#f8faf9',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  padding: '0.75rem',
                  color: '#1a1a1a',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontFamily: "'Satoshi', system-ui, sans-serif",
                  transition: 'var(--transition-fast)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f3f4f6';
                  e.currentTarget.style.borderColor = '#7dd4a8';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#f8faf9';
                  e.currentTarget.style.borderColor = '#e5e7eb';
                }}
              >
                <span style={{
                  display: 'inline-block',
                  backgroundColor: '#f9a661',
                  color: 'white',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '0.25rem',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  marginRight: '0.5rem'
                }}>Client</span>
                username: <strong>vivien</strong> — password: <strong>BrazilFit2026!</strong>
              </button>
            </div>
          </div>
        </div>

        <p style={{
          textAlign: 'center',
          color: 'rgba(255, 255, 255, 0.7)',
          fontSize: '0.75rem',
          marginTop: '2rem',
          fontFamily: "'Satoshi', system-ui, sans-serif"
        }}>
          © 2026 BrazilFit · London · All rights reserved
        </p>
      </div>
    </div>
  );
}
