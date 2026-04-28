import { useState, useRef } from 'react';
import { X, LogOut, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

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
    ? new Date(user.created_at).toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' })
    : 'Jan 15, 2026';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('profile_photo', file);

      await api.post(`/clients/${user?.clientId}/profile-photo`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Refresh user data after upload
      window.location.reload();
    } catch (error) {
      console.error('Failed to upload avatar:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'flex-end',
        animation: 'fadeIn 0.3s ease-out',
      }}
      onClick={handleBackdropClick}
    >
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slideUp {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        @keyframes slideDown {
          from {
            transform: translateY(0);
          }
          to {
            transform: translateY(100%);
          }
        }
        .profile-modal-content {
          animation: slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>

      <div
        style={{
          width: '100%',
          backgroundColor: 'white',
          borderTopLeftRadius: '24px',
          borderTopRightRadius: '24px',
          paddingBottom: '32px',
          maxHeight: '90vh',
          overflowY: 'auto',
          position: 'relative',
        }}
        className="profile-modal-content"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            zIndex: 10,
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            border: 'none',
            backgroundColor: 'rgba(0, 0, 0, 0.05)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
          }}
        >
          <X size={20} color="#000" />
        </button>

        {/* Green Gradient Banner */}
        <div
          style={{
            height: '130px',
            background: 'linear-gradient(135deg, #0f5c3a 0%, #1d9e75 35%, #3ecf94 65%, #7de8b5 100%)',
            position: 'relative',
          }}
        >
          {/* Crown Icon */}
          {user?.isPro && (
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #f9c041 0%, #f97316 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
              }}
            >
              👑
            </div>
          )}

          {/* PRO Badge - Top Right */}
          {user?.isPro && (
            <div
              style={{
                position: 'absolute',
                top: '12px',
                right: '16px',
                backgroundColor: 'rgba(255, 255, 255, 0.22)',
                color: 'white',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '11px',
                fontWeight: 'bold',
                letterSpacing: '0.12em',
                backdropFilter: 'blur(10px)',
              }}
            >
              PRO
            </div>
          )}
        </div>

        {/* Avatar Section */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            paddingTop: '32px',
            paddingBottom: '24px',
            position: 'relative',
            marginTop: '-52px',
          }}
        >
          <div
            style={{
              position: 'relative',
              cursor: 'pointer',
            }}
            onMouseEnter={() => setHoverAvatar(true)}
            onMouseLeave={() => setHoverAvatar(false)}
            onClick={handleAvatarClick}
          >
            {/* Outer Gradient Ring */}
            <div
              style={{
                width: '104px',
                height: '104px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #f9c041 0%, #f97316 25%, #1d9e75 75%, #0f5c3a 100%)',
                padding: '3px',
                boxShadow: '0 4px 20px rgba(29, 158, 117, 0.35)',
              }}
            >
              {/* Inner Avatar */}
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  backgroundColor: '#e8f5f0',
                  border: '3px solid white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '38px',
                  fontWeight: 700,
                  color: '#1d9e75',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {initials}
                {hoverAvatar && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      backgroundColor: 'rgba(0, 0, 0, 0.4)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '12px',
                      fontWeight: 600,
                    }}
                  >
                    {uploading ? 'Uploading...' : '📷 Upload'}
                  </div>
                )}
              </div>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
        </div>

        {/* Content Section */}
        <div style={{ paddingLeft: '20px', paddingRight: '20px' }}>
          {/* Client Name */}
          <h2
            style={{
              fontSize: '26px',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              color: '#000',
              textAlign: 'center',
              margin: '0 0 8px 0',
            }}
          >
            {user?.name || 'Client Name'}
          </h2>

          {/* Status with Green Dot */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              marginBottom: '24px',
            }}
          >
            <div
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: '#1d9e75',
              }}
            />
            <p
              style={{
                fontSize: '13px',
                color: '#1d9e75',
                fontWeight: 500,
                margin: 0,
              }}
            >
              {user?.isPro ? 'Active Pro Member' : 'Free Member'}
            </p>
          </div>

          {/* BrazilFit Pro Row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 0',
              borderTop: '0.5px solid #eee',
              borderBottom: '0.5px solid #eee',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {/* Gym Icon */}
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #0f5c3a 0%, #1d9e75 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Zap size={16} color="white" />
              </div>
              <div>
                <p style={{ fontSize: '14px', fontWeight: 600, color: '#000', margin: 0 }}>
                  BrazilFit Pro
                </p>
                <p style={{ fontSize: '12px', color: '#999', margin: '2px 0 0 0' }}>
                  Premium training
                </p>
              </div>
            </div>

            {/* PRO/UPGRADE Badge */}
            <div
              style={{
                background: user?.isPro
                  ? 'linear-gradient(135deg, #0f5c3a 0%, #1d9e75 100%)'
                  : '#ccc',
                color: 'white',
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 'bold',
                whiteSpace: 'nowrap',
              }}
            >
              {user?.isPro ? 'PRO' : 'UPGRADE'}
            </div>
          </div>

          {/* Sign Out Row */}
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 0',
              border: 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(231, 76, 60, 0.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <p
              style={{
                fontSize: '15px',
                fontWeight: 600,
                color: '#e74c3c',
                margin: 0,
              }}
            >
              Sign Out
            </p>
            <LogOut size={18} color="#e74c3c" />
          </button>

          {/* Member Since Footer */}
          <div
            style={{
              backgroundColor: '#f8f8f8',
              padding: '14px',
              textAlign: 'center',
              borderRadius: '12px',
              marginTop: '24px',
            }}
          >
            <p
              style={{
                fontSize: '13px',
                color: '#999',
                margin: 0,
              }}
            >
              Member Since{' '}
              <span style={{ color: '#000', fontWeight: 600 }}>
                {memberSinceDate}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
