import { useState, useEffect } from 'react';
import { ChevronRight, ArrowLeft, Check, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import BackButton from '../../components/BackButton';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const BG='#0f0f0f';const SURFACE='#1a1a1a';const S2='#222';const BORDER='rgba(255,255,255,0.08)';const TEXT='#ffffff';const MUTED='#888888';const ORANGE='#FF6B2B';const GREEN='#4CAF50';

export default function ClientSettings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [screen, setScreen] = useState('main');
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({});
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

  useEffect(() => {
    fetchSettings();
  }, [user?.clientId]);

  const fetchSettings = async () => {
    if (!user?.clientId) return;
    try {
      const res = await api.get(`/settings/${user.clientId}`);
      setSettings(res.data || {});
    } catch (err) {
      console.error('Failed to fetch settings:', err);
    }
  };

  const updateSetting = async (key, value) => {
    try {
      setSettings(prev => ({ ...prev, [key]: value }));
      await api.put(`/settings/${user.clientId}`, { [key]: value });
      toast.success('Saved');
    } catch (err) {
      console.error('Failed to update setting:', err);
      toast.error('Failed to save');
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      logout();
      navigate('/login');
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'DELETE') {
      toast.error('Type DELETE to confirm');
      return;
    }
    try {
      setLoading(true);
      await api.delete(`/auth/users/${user.id}`);
      toast.success('Account deleted');
      logout();
      navigate('/login');
    } catch (err) {
      console.error('Delete error:', err);
      toast.error('Failed to delete account');
    } finally {
      setLoading(false);
    }
  };

  const ToggleButton = ({ label, value, onChange, context }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '16px', paddingTop: '16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: '15px', fontWeight: '600', color: '#ffffff', margin: 0 }}>{label}</p>
        {context && <p style={{ fontSize: '12px', color: '#606060', marginTop: '4px', margin: '4px 0 0 0' }}>{context}</p>}
      </div>
      <button
        onClick={() => onChange(!value)}
        style={{
          width: '48px',
          height: '28px',
          borderRadius: '14px',
          backgroundColor: value ? '#4CAF50' : '#444',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          padding: value ? '0 2px 0 2px' : '0 2px 0 2px',
          justifyContent: value ? 'flex-end' : 'flex-start',
          transition: 'all 0.2s ease',
        }}
      >
        <div style={{ width: '24px', height: '24px', borderRadius: '12px', backgroundColor: '#1a1a1a' }} />
      </button>
    </div>
  );

  // About You screen
  if (screen === 'aboutyou') {
    return (
      <div style={{ padding: '24px 20px', minHeight: '100vh', backgroundColor: '#0f0f0f' }}>
        <div style={{ marginBottom: '24px' }}>
          <BackButton onClick={() => setScreen('main')} label="Back to Settings" />
          <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#ffffff', margin: 0 }}>About You</h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Profile Photo */}
          <div style={{ textAlign: 'center', paddingBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              backgroundColor: '#333',
              margin: '0 auto 12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '40px',
              position: 'relative',
              cursor: 'pointer',
            }}>
              👤
              <div style={{
                position: 'absolute',
                bottom: '0',
                right: '0',
                backgroundColor: '#27AE60',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '16px',
              }}>
                📷
              </div>
            </div>
            <p style={{ fontSize: '13px', color: '#606060', margin: 0 }}>Tap to upload photo</p>
          </div>

          {/* Form Fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <FormField label="First Name" value={settings.firstName || ''} onChange={(v) => updateSetting('firstName', v)} />
            <FormField label="Last Name" value={settings.lastName || ''} onChange={(v) => updateSetting('lastName', v)} />
            <FormField label="Date of Birth" type="date" value={settings.dateOfBirth || ''} onChange={(v) => updateSetting('dateOfBirth', v)} />

            <div>
              <label style={{ fontSize: '14px', fontWeight: '600', color: '#ffffff', display: 'block', marginBottom: '8px' }}>Gender</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                {['Male', 'Female', 'Prefer not to say'].map(opt => (
                  <button
                    key={opt}
                    onClick={() => updateSetting('gender', opt)}
                    style={{
                      padding: '12px',
                      border: settings.gender === opt ? 'none' : '1px solid #D0D0D0',
                      backgroundColor: settings.gender === opt ? '#4CAF50' : '#222',
                      color: settings.gender === opt ? '#000' : '#ffffff',
                      borderRadius: '8px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      fontSize: '13px',
                    }}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <FormField label="Hometown" value={settings.hometown || ''} onChange={(v) => updateSetting('hometown', v)} />
            <FormField
              label="Bio"
              type="textarea"
              value={settings.bio || ''}
              onChange={(v) => updateSetting('bio', v)}
              maxLength={150}
              helperText={`${(settings.bio || '').length}/150`}
            />

            {/* Fitness Goals */}
            <div>
              <label style={{ fontSize: '14px', fontWeight: '600', color: '#ffffff', display: 'block', marginBottom: '12px' }}>Fitness Goals</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {['Lose Weight', 'Build Muscle', 'Improve Fitness', 'Increase Flexibility', 'Reduce Stress', 'Train for Sport'].map(goal => (
                  <button
                    key={goal}
                    onClick={() => {
                      const goals = settings.fitnessGoals ? settings.fitnessGoals.split(',') : [];
                      if (goals.includes(goal)) {
                        goals.splice(goals.indexOf(goal), 1);
                      } else {
                        goals.push(goal);
                      }
                      updateSetting('fitnessGoals', goals.join(','));
                    }}
                    style={{
                      padding: '10px 16px',
                      backgroundColor: (settings.fitnessGoals || '').includes(goal) ? '#4CAF50' : '#222',
                      color: (settings.fitnessGoals || '').includes(goal) ? '#000' : '#ffffff',
                      border: (settings.fitnessGoals || '').includes(goal) ? 'none' : '1px solid #D0D0D0',
                      borderRadius: '20px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      fontSize: '13px',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {goal}
                  </button>
                ))}
              </div>
            </div>

            {/* Fitness Level */}
            <div>
              <label style={{ fontSize: '14px', fontWeight: '600', color: '#ffffff', display: 'block', marginBottom: '12px' }}>Fitness Level</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                {['Beginner', 'Intermediate', 'Advanced'].map(level => (
                  <button
                    key={level}
                    onClick={() => updateSetting('fitnessLevel', level)}
                    style={{
                      padding: '16px',
                      backgroundColor: settings.fitnessLevel === level ? '#4CAF50' : '#222',
                      color: settings.fitnessLevel === level ? '#000' : '#ffffff',
                      border: settings.fitnessLevel === level ? 'none' : '1px solid #D0D0D0',
                      borderRadius: '10px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      fontSize: '13px',
                    }}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            style={{
              width: '100%',
              height: '56px',
              backgroundColor: '#27AE60',
              color: 'white',
              fontWeight: '600',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              cursor: 'pointer',
              marginTop: '24px',
            }}
            onClick={() => {
              toast.success('Changes saved');
              setScreen('main');
            }}
          >
            Save Changes
          </button>
        </div>
      </div>
    );
  }

  // Units of Measure screen
  if (screen === 'units') {
    return (
      <div style={{ padding: '24px 20px', minHeight: '100vh', backgroundColor: '#0f0f0f' }}>
        <div style={{ marginBottom: '24px' }}>
          <BackButton onClick={() => setScreen('main')} label="Back to Settings" />
          <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#ffffff', margin: 0 }}>Units of Measure</h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <UnitToggle
            label="Weight"
            options={['KG', 'LBS']}
            value={settings.weightUnit || 'KG'}
            onChange={(v) => updateSetting('weightUnit', v)}
            context="Weight unit affects your progress tracking measurements."
          />
          <UnitToggle
            label="Height"
            options={['CM', 'FT/IN']}
            value={settings.heightUnit || 'CM'}
            onChange={(v) => updateSetting('heightUnit', v)}
          />
          <UnitToggle
            label="Distance"
            options={['KM', 'Miles']}
            value={settings.distanceUnit || 'KM'}
            onChange={(v) => updateSetting('distanceUnit', v)}
          />
        </div>
      </div>
    );
  }

  // Session Settings screen
  if (screen === 'sessions') {
    return (
      <div style={{ padding: '24px 20px', minHeight: '100vh', backgroundColor: '#0f0f0f' }}>
        <div style={{ marginBottom: '24px' }}>
          <BackButton onClick={() => setScreen('main')} label="Back to Settings" />
          <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#ffffff', margin: 0 }}>Session Settings</h2>
        </div>

        <div>
          <ToggleButton label="Session reminder — 1 hour before" value={settings.sessionReminder1h !== false} onChange={(v) => updateSetting('sessionReminder1h', v)} />
          <ToggleButton label="Session reminder — 24 hours before" value={settings.sessionReminder24h !== false} onChange={(v) => updateSetting('sessionReminder24h', v)} />
          <ToggleButton label="Session completed confirmation" value={settings.sessionCompleted !== false} onChange={(v) => updateSetting('sessionCompleted', v)} />
          <ToggleButton label="Missed session notification" value={settings.missedSession !== false} onChange={(v) => updateSetting('missedSession', v)} />
          <ToggleButton label="Block renewal reminder when 2 sessions left" value={settings.blockReminder2 !== false} onChange={(v) => updateSetting('blockReminder2', v)} />
          <ToggleButton label="Block renewal reminder when 1 session left" value={settings.blockReminder1 !== false} onChange={(v) => updateSetting('blockReminder1', v)} />
          <ToggleButton label="PT message received" value={settings.ptMessage !== false} onChange={(v) => updateSetting('ptMessage', v)} style={{ borderBottom: 'none' }} />
        </div>
      </div>
    );
  }

  // Privacy screen
  if (screen === 'privacy') {
    return (
      <div style={{ padding: '24px 20px', minHeight: '100vh', backgroundColor: '#0f0f0f' }}>
        <div style={{ marginBottom: '24px' }}>
          <BackButton onClick={() => setScreen('main')} label="Back to Settings" />
          <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#ffffff', margin: 0 }}>Privacy</h2>
        </div>

        <div style={{ paddingBottom: '20px', marginBottom: '20px', borderBottom: '2px solid #E8E8E8' }}>
          <p style={{ fontSize: '12px', fontWeight: '600', color: '#4CAF50', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '16px', margin: '0 0 16px 0' }}>PROFILE VISIBILITY</p>
          <ToggleButton label="Share my progress with PT" value={settings.shareProgress !== false} onChange={(v) => updateSetting('shareProgress', v)} />
          <ToggleButton label="Share habit data with PT" value={settings.shareHabits !== false} onChange={(v) => updateSetting('shareHabits', v)} />
          <ToggleButton label="Allow PT to see my check-in responses" value={settings.shareCheckins !== false} onChange={(v) => updateSetting('shareCheckins', v)} />
          <ToggleButton label="Show my name on community leaderboard" value={settings.showOnLeaderboard === true} onChange={(v) => updateSetting('showOnLeaderboard', v)} style={{ borderBottom: 'none' }} />
        </div>

        <div style={{ paddingBottom: '20px', marginBottom: '20px', borderBottom: '2px solid #E8E8E8' }}>
          <p style={{ fontSize: '12px', fontWeight: '600', color: '#4CAF50', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '16px', margin: '0 0 16px 0' }}>DATA COLLECTION</p>
          <ToggleButton label="Allow anonymous usage analytics" value={settings.analytics !== false} onChange={(v) => updateSetting('analytics', v)} context="Helps us improve the app — no personal data shared." />
          <ToggleButton label="Marketing communications" value={settings.marketing === true} onChange={(v) => updateSetting('marketing', v)} style={{ borderBottom: 'none' }} />
        </div>

        <div style={{ paddingBottom: '20px' }}>
          <p style={{ fontSize: '12px', fontWeight: '600', color: '#4CAF50', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '16px', margin: '0 0 16px 0' }}>YOUR DATA</p>
          <button style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#27AE60',
            color: 'white',
            fontWeight: '600',
            border: 'none',
            borderRadius: '8px',
            marginBottom: '8px',
            cursor: 'pointer',
          }}>Download My Data</button>
          <button style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#1a1a1a',
            color: '#EF4444',
            fontWeight: '600',
            border: '1px solid #EF4444',
            borderRadius: '8px',
            cursor: 'pointer',
          }} onClick={() => setScreen('deleteAccount')}>Delete My Account</button>
        </div>
      </div>
    );
  }

  // Delete Account screen
  if (screen === 'deleteAccount') {
    return (
      <div style={{ padding: '24px 20px', minHeight: '100vh', backgroundColor: '#0f0f0f' }}>
        <div style={{ marginBottom: '24px' }}>
          <BackButton onClick={() => setScreen('main')} label="Back to Settings" />
          <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#ffffff', margin: 0 }}>Delete Account</h2>
        </div>

        <div style={{ backgroundColor: '#FEE3E3', border: '1px solid #EF4444', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
          <p style={{ fontSize: '14px', fontWeight: '600', color: '#EF4444', margin: 0 }}>⚠️ Warning</p>
          <p style={{ fontSize: '13px', color: '#C53030', marginTop: '8px', margin: '8px 0 0 0' }}>This action cannot be undone. All your data will be permanently deleted.</p>
        </div>

        <div style={{ backgroundColor: '#F8F9FA', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
          <p style={{ fontSize: '13px', fontWeight: '600', color: '#ffffff', marginBottom: '8px', margin: '0 0 8px 0' }}>Will be permanently deleted:</p>
          <ul style={{ fontSize: '13px', color: '#888888', marginLeft: '20px', marginTop: '8px' }}>
            <li>All session history</li>
            <li>All progress data</li>
            <li>All messages</li>
            <li>Active block is non-refundable</li>
          </ul>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: '#ffffff' }}>Type DELETE to confirm</label>
          <input
            type="text"
            value={deleteConfirmation}
            onChange={(e) => setDeleteConfirmation(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #D0D0D0',
              borderRadius: '8px',
              fontSize: '14px',
              boxSizing: 'border-box',
            }}
            placeholder="DELETE"
          />
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => setScreen('privacy')}
            style={{
              flex: 1,
              padding: '12px',
              backgroundColor: '#333',
              color: '#888888',
              fontWeight: '600',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleDeleteAccount}
            disabled={deleteConfirmation !== 'DELETE' || loading}
            style={{
              flex: 1,
              padding: '12px',
              backgroundColor: deleteConfirmation === 'DELETE' ? '#EF4444' : '#F0F0F0',
              color: deleteConfirmation === 'DELETE' ? 'white' : '#CCCCCC',
              fontWeight: '600',
              border: 'none',
              borderRadius: '8px',
              cursor: deleteConfirmation === 'DELETE' ? 'pointer' : 'not-allowed',
            }}
          >
            {loading ? 'Deleting...' : 'Delete My Account'}
          </button>
        </div>
      </div>
    );
  }

  // Main settings screen
  return (
    <div style={{ padding: '24px 20px', minHeight: '100vh', backgroundColor: '#0f0f0f', paddingBottom: '100px' }}>
      <BackButton to="/client/home" />
      <h1 style={{ fontSize: '28px', fontWeight: 300, color: '#ffffff', marginBottom: '32px', margin: '0 0 32px 0' }}>Settings</h1>

      {/* Section 1: Account */}
      <div style={{ marginBottom: '24px', paddingBottom: '24px', borderBottom: '2px solid #E8E8E8' }}>
        <p style={{ fontSize: '12px', fontWeight: '600', color: '#606060', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '12px', margin: '0 0 12px 0' }}>ACCOUNT</p>
        <SettingButton label="About You" onPress={() => setScreen('aboutyou')} />
        <SettingButton label="Units of Measure" value="KG, CM, KM" onPress={() => setScreen('units')} />
      </div>

      {/* Section 2: Sessions */}
      <div style={{ marginBottom: '24px', paddingBottom: '24px', borderBottom: '2px solid #E8E8E8' }}>
        <p style={{ fontSize: '12px', fontWeight: '600', color: '#606060', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '12px', margin: '0 0 12px 0' }}>NOTIFICATIONS</p>
        <SettingButton label="Session Settings" onPress={() => setScreen('sessions')} />
        <SettingButton label="Notification Preferences" onPress={() => setScreen('notifications')} />
      </div>

      {/* Section 3: Privacy */}
      <div style={{ marginBottom: '24px', paddingBottom: '24px', borderBottom: '2px solid #E8E8E8' }}>
        <p style={{ fontSize: '12px', fontWeight: '600', color: '#606060', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '12px', margin: '0 0 12px 0' }}>PRIVACY & DATA</p>
        <SettingButton label="Privacy" onPress={() => setScreen('privacy')} />
        <SettingButton label="Data and Privacy" onPress={() => {}} />
        <SettingButton label="Workout Info" onPress={() => {}} />
      </div>

      {/* Section 4: App */}
      <div style={{ marginBottom: '24px', paddingBottom: '24px', borderBottom: '2px solid #E8E8E8' }}>
        <p style={{ fontSize: '12px', fontWeight: '600', color: '#606060', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '12px', margin: '0 0 12px 0' }}>ABOUT</p>
        <SettingButton label="Country/Region" value="🇬🇧 United Kingdom" onPress={() => {}} />
        <SettingButton label="Language" value="English" onPress={() => {}} />
        <SettingButton label="App Version" value="1.0.0" onPress={() => {}} />
      </div>

      {/* Section 5: Legal */}
      <div style={{ marginBottom: '24px', paddingBottom: '24px', borderBottom: '2px solid #E8E8E8' }}>
        <p style={{ fontSize: '12px', fontWeight: '600', color: '#606060', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '12px', margin: '0 0 12px 0' }}>LEGAL</p>
        <SettingButton label="Terms and Conditions" onPress={() => {}} />
        <SettingButton label="Privacy Policy" onPress={() => {}} />
        <SettingButton label="App FAQs" onPress={() => {}} />
        <SettingButton label="Contact Your PT" onPress={() => navigate('/client/messages')} />
      </div>

      {/* Section 6: Actions */}
      <div style={{ marginBottom: '24px', paddingBottom: '24px', borderBottom: '2px solid #E8E8E8' }}>
        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            padding: '14px',
            backgroundColor: '#1a1a1a',
            color: '#ffffff',
            fontWeight: '600',
            border: '1px solid #D0D0D0',
            borderRadius: '8px',
            fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}

function SettingButton({ label, value, onPress }) {
  return (
    <button
      onClick={onPress}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 0',
        backgroundColor: 'transparent',
        border: 'none',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        cursor: 'pointer',
        fontSize: '15px',
      }}
    >
      <span style={{ fontWeight: '600', color: '#ffffff' }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {value && <span style={{ fontSize: '13px', color: '#606060' }}>{value}</span>}
        <ChevronRight size={20} color="#CCCCCC" />
      </div>
    </button>
  );
}

function FormField({ label, value, onChange, type = 'text', maxLength, helperText }) {
  return (
    <div>
      <label style={{ fontSize: '14px', fontWeight: '600', color: '#ffffff', display: 'block', marginBottom: '8px' }}>{label}</label>
      {type === 'textarea' ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          maxLength={maxLength}
          placeholder={label}
          style={{
            width: '100%',
            padding: '12px',
            border: '1px solid #D0D0D0',
            borderRadius: '8px',
            fontSize: '14px',
            fontFamily: 'inherit',
            boxSizing: 'border-box',
            minHeight: '80px',
            resize: 'none',
          }}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={label}
          style={{
            width: '100%',
            padding: '12px',
            border: '1px solid #D0D0D0',
            borderRadius: '8px',
            fontSize: '14px',
            boxSizing: 'border-box',
          }}
        />
      )}
      {helperText && <p style={{ fontSize: '12px', color: '#606060', textAlign: 'right', marginTop: '4px', margin: '4px 0 0 0' }}>{helperText}</p>}
    </div>
  );
}

function UnitToggle({ label, options, value, onChange, context }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
        <label style={{ fontSize: '15px', fontWeight: '600', color: '#ffffff' }}>{label}</label>
        <span style={{ fontSize: '13px', color: '#606060' }}>{value}</span>
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        {options.map(opt => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            style={{
              flex: 1,
              padding: '12px',
              backgroundColor: value === opt ? '#27AE60' : 'white',
              color: value === opt ? 'white' : '#333333',
              fontWeight: '600',
              border: value === opt ? 'none' : '1px solid #D0D0D0',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '13px',
              transition: 'all 0.2s ease',
            }}
          >
            {opt}
          </button>
        ))}
      </div>
      {context && <p style={{ fontSize: '12px', color: '#606060', marginTop: '8px', margin: '8px 0 0 0' }}>{context}</p>}
    </div>
  );
}
