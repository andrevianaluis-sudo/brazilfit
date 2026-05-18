import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Crown, QrCode, Settings, MessageSquare } from 'lucide-react';
import EditProfileScreen from './EditProfileScreen';


export default function ClientProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [screen, setScreen] = useState('profile');

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  if (screen === 'editProfile') {
    return (
      <div className="w-full bg-white min-h-screen pb-24 animate-fade-in">
        <EditProfileScreen onClose={() => setScreen('profile')} />
      </div>
    );
  }

  if (screen === 'membershipCard') {
    return (
      <div className="w-full bg-black min-h-screen pb-24 animate-fade-in flex items-center justify-center">

      </div>
    );
  }

  return (
    <div className="w-full bg-white min-h-screen pb-24 animate-fade-in">
      {/* Avatar */}
      <div className="pt-8 pb-6 flex justify-center">
        <div className={`w-20 h-20 rounded-full bg-grey-300 flex items-center justify-center text-2xl font-black text-grey-200 ${
          user?.isPro ? 'ring-2 ring-brazil-green' : ''
        }`}>
          {initials}
        </div>
      </div>

      {/* Name */}
      <h1 className="text-2xl font-black text-black text-center uppercase mb-4">
        {user?.name}
      </h1>

      {/* Edit Profile button */}
      <button
        onClick={() => setScreen('editProfile')}
        className="mx-5 px-6 py-2.5 border border-black rounded-full bg-white hover:bg-grey-300 text-black font-bold transition-all active:scale-95 mb-8 block mx-auto"
      >
        Edit Profile
      </button>

      {/* Two icon buttons */}
      <div className="flex items-center gap-4 px-5 mb-8">
        <button
          onClick={() => setScreen('membershipCard')}
          className="flex-1 flex flex-col items-center gap-2 p-4 hover:bg-grey-300 rounded-[12px] transition-all active:scale-95"
        >
          <QrCode className="w-6 h-6 text-black" />
          <p className="text-xs font-bold text-black">Pass</p>
        </button>

        <div className="w-px h-12 bg-grey-300" />

        <button
          onClick={() => navigate('/client/settings')}
          className="flex-1 flex flex-col items-center gap-2 p-4 hover:bg-grey-300 rounded-[12px] transition-all active:scale-95"
        >
          <Settings className="w-6 h-6 text-black" />
          <p className="text-xs font-bold text-black">Settings</p>
        </button>
      </div>

      {/* Inbox row */}
      <button className="w-full px-5 py-3 flex items-center justify-between border-b border-grey-100 hover:bg-grey-300 transition-all active:scale-95">
        <div className="flex-1 text-left">
          <p className="text-black font-bold text-sm">Inbox</p>
          <p className="text-grey-200 text-xs">View messages</p>
        </div>
        <MessageSquare className="w-5 h-5 text-grey-200" />
      </button>

      {/* BrazilFit Pro row */}
      <button className="w-full px-5 py-3 flex items-center justify-between border-b border-grey-100 hover:bg-grey-300 transition-all active:scale-95">
        <div className="flex-1 text-left">
          <p className="text-black font-bold text-sm">BrazilFit Pro</p>
          <p className="text-grey-200 text-xs">
            {user?.isPro ? 'Active Pro Member' : 'Free'}
          </p>
        </div>
        {user?.isPro && (
          <div className="bg-brazil-green text-black text-[10px] font-bold px-2 py-1 rounded-full mr-3 flex items-center gap-1">
            <Crown className="w-3 h-3" /> PRO
          </div>
        )}
        <ChevronRight className="w-5 h-5 text-grey-200" />
      </button>
    </div>
  );
}




