import { useState, useRef } from 'react';
import { X, LogOut, Zap, Camera, Crown, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const BG = '#141414';
const SURFACE = '#1e1e1e';
const SURFACE2 = '#2a2a2a';
const BORDER = 'rgba(255,255,255,0.08)';
const ORANGE = '#FF6B2B';
const GREEN = '#4CAF50';
const YELLOW = '#FFD600';
const TEXT = '#ffffff';
const MUTED = '#888888';

export default function ProfileModal({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [hoverAvatar, setHoverAvatar] = useState(false);

  if (!isOpen) return null;

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  const memberSinceDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-GB', { year: 'numeric', month: 'long' })
    : 'January 2026';

  const handleLogout = () => { logout(); navigate('/login'); };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('profile_photo', file);
      await api.post(`/clients/${user?.clientId}/profile-photo`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      window.location.reload();
    } catch (error) {
      console.error('Failed to upload avatar:', error);
    } finally {
      setUploading(false);
    }
  };

  const isPro = user?.isPro;

  return (
    <>
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .profile-modal-content {
          animation: slideUp 0.35s cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>

      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 50,
          backgroundColor: 'rgba(0,0,0,0.75)',
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        }}
      >
        {/* Modal */}
        <div
          onClick={e => e.stopPropagation()}
          className="profile-modal-content"
          style={{
            width: '100%', maxWidth: '480px',
            backgroundColor: BG,
            borderTopLeftRadius: '24px',
            borderTopRightRadius: '24px',
            paddingBottom: '40px',
            maxHeight: '92vh',
            overflowY: 'auto',
            position: 'relative',
            border: `1px solid ${BORDER}`,
            borderBottom: 'none',
          }}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute', top: '16px', right: '16px', zIndex: 10,
              width: '36px', height: '36px', borderRadius: '50%', border: 'none',
              backgroundColor: SURFACE2, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <X size={16} color={MUTED} />
          </button>

          {/* Header gradient bar */}
          <div style={{
            height: '4px',
            background: `linear-gradient(90deg, ${ORANGE}, ${YELLOW})`,
            borderRadius: '24px 24px 0 0',
          }} />

          {/* Avatar section */}
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            padding: '32px 24px 24px',
            borderBottom: `1px solid ${BORDER}`,
          }}>
            {/* Avatar */}
            <div
              onClick={() => fileInputRef.current?.click()}
              onMouseEnter={() => setHoverAvatar(true)}
              onMouseLeave={() => setHoverAvatar(false)}
              style={{
                width: '88px', height: '88px', borderRadius: '50%',
                background: `linear-gradient(135deg, ${ORANGE}33, ${YELLOW}33)`,
                border: `2px solid ${ORANGE}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', position: 'relative', marginBottom: '16px',
                transition: 'all 0.2s',
                boxShadow: `0 0 0 4px ${ORANGE}22`,
              }}
            >
              {user?.profile_photo_url ? (
                <img
                  src={user.profile_photo_url}
                  alt={user.name}
                  style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                />
              ) : (
                <span style={{
                  fontFamily: "'Clash Display', system-ui",
                  fontSize: '2rem', fontWeight: 800, color: ORANGE,
                }}>
                  {initials}
                </span>
              )}

              {/* Camera overlay */}
              {(hoverAvatar || uploading) && (
                <div style={{
                  position: 'absolute', inset: 0, borderRadius: '50%',
                  background: 'rgba(0,0,0,0.6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Camera size={20} color={TEXT} />
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />

            {/* Name */}
            <h2 style={{
              fontFamily: "'Clash Display', system-ui",
              fontSize: '1.6rem', fontWeight: 700, color: TEXT,
              margin: '0 0 6px', letterSpacing: '-0.02em',
            }}>
              {user?.name || 'User'}
            </h2>

            {/* Pro badge or Free */}
            {isPro ? (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                background: `linear-gradient(135deg, ${ORANGE}22, ${YELLOW}22)`,
                border: `1px solid ${ORANGE}44`,
                borderRadius: '20px', padding: '4px 14px',
              }}>
                <Zap size={13} color={YELLOW} fill={YELLOW} />
                <span style={{ fontSize: '12px', fontWeight: 700, color: YELLOW, letterSpacing: '0.08em' }}>
                  PRO MEMBER
                </span>
              </div>
            ) : (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                background: SURFACE2, border: `1px solid ${BORDER}`,
                borderRadius: '20px', padding: '4px 14px',
              }}>
                <div style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: GREEN }} />
                <span style={{ fontSize: '12px', fontWeight: 600, color: MUTED }}>
                  Free Member
                </span>
              </div>
            )}

            {/* Member since */}
            <p style={{ fontSize: '12px', color: MUTED, marginTop: '8px', fontFamily: "'Satoshi', system-ui" }}>
              Member since {memberSinceDate}
            </p>
          </div>

          {/* Pro upgrade card — only for free */}
          {!isPro && (
            <div style={{ padding: '16px 20px 0' }}>
              <button
                onClick={() => { navigate('/client/upgrade'); onClose(); }}
                style={{
                  width: '100%', border: 'none', cursor: 'pointer',
                  background: `linear-gradient(135deg, ${ORANGE}, ${YELLOW})`,
                  borderRadius: '14px', padding: '16px 20px',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '12px',
                    background: 'rgba(0,0,0,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Zap size={20} color={TEXT} fill={TEXT} />
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <p style={{ fontWeight: 800, fontSize: '15px', color: '#000', margin: 0 }}>
                      Upgrade to BrazilFit Pro
                    </p>
                    <p style={{ fontSize: '12px', color: 'rgba(0,0,0,0.6)', margin: '2px 0 0' }}>
                      Unlock all meals, tips & features
                    </p>
                  </div>
                </div>
                <ChevronRight size={20} color="#000" />
              </button>
            </div>
          )}

          {/* Stats row */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1px', background: BORDER,
            margin: '20px 20px 0',
            borderRadius: '14px', overflow: 'hidden',
            border: `1px solid ${BORDER}`,
          }}>
            {[
              { label: 'Sessions', value: user?.sessionsUsed || 0 },
              { label: 'Block', value: `${user?.sessionsUsed || 0}/10` },
              { label: 'Days Active', value: Math.floor((Date.now() - new Date(user?.created_at || Date.now())) / 86400000) || 1 },
            ].map((stat, i) => (
              <div key={i} style={{
                background: SURFACE, padding: '14px 8px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
              }}>
                <span style={{ fontFamily: "'Clash Display', system-ui", fontSize: '1.4rem', fontWeight: 800, color: ORANGE }}>
                  {stat.value}
                </span>
                <span style={{ fontSize: '11px', color: MUTED, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {stat.label}
                </span>
              </div>
            ))}
          </div>

          {/* Sign out */}
          <div style={{ padding: '20px 20px 0' }}>
            <button
              onClick={handleLogout}
              style={{
                width: '100%', border: `1px solid rgba(239,68,68,0.2)`,
                borderRadius: '12px', padding: '14px 20px',
                background: 'rgba(239,68,68,0.06)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.12)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.06)'}
            >
              <LogOut size={16} color="#ef4444" />
              <span style={{ color: '#ef4444', fontWeight: 700, fontSize: '14px' }}>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
