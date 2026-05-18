import { useAuth } from '../../context/AuthContext';
import { Zap, Crown } from 'lucide-react';

export default function DigitalMembershipCard() {
  const { user } = useAuth();

  const generateQRCode = () => {
    // In real implementation, this would generate a QR code encoding the client ID
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${user?.clientId || 'brazilfit'}`;
  };

  return (
    <div className="flex flex-col items-center gap-8 py-12">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <div className="bg-white p-2 rounded-lg">
          <Zap className="w-6 h-6 text-brazil-green fill-brazil-green" />
        </div>
        <h1 className="text-2xl font-bold text-white">BrazilFit</h1>
      </div>

      {/* QR Code */}
      <div className={`p-6 rounded-2xl ${user?.isPro ? 'border-2 border-brazil-green' : 'bg-white/10'}`}>
        <img
          src={generateQRCode()}
          alt="Membership QR Code"
          className="w-48 h-48 rounded-lg"
        />
      </div>

      {/* Member info */}
      <div className="text-center">
        <p className="text-2xl font-black text-white mb-3">{user?.name}</p>
        <p className="text-grey-200 text-sm mb-4">Member Since Jan 15, 2026</p>

        {/* Pro/Free badge */}
        {user?.isPro ? (
          <div className="inline-flex items-center gap-2 bg-brazil-green text-black px-4 py-2 rounded-full font-bold text-sm">
            <Crown className="w-4 h-4" />
            BrazilFit Pro Member
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 bg-grey-300/30 text-grey-200 px-4 py-2 rounded-full font-bold text-sm">
            Free Member
          </div>
        )}
      </div>

      {/* Info text */}
      <p className="text-grey-200 text-xs text-center max-w-xs">
        Show this card to your PT to check in to sessions
      </p>
    </div>
  );
}

