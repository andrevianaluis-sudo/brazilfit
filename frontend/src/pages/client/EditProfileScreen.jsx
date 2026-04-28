import { useState } from 'react';
import { Camera, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function EditProfileScreen({ onClose }) {
  const { user } = useAuth();
  const [firstName, setFirstName] = useState(user?.name?.split(' ')[0] || '');
  const [lastName, setLastName] = useState(user?.name?.split(' ').slice(1).join(' ') || '');
  const [hometown, setHometown] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const handleChange = () => {
    setHasChanges(true);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.put('/auth/profile', {
        name: `${firstName} ${lastName}`.trim(),
        hometown,
        bio,
      });
      toast.success('Profile updated successfully!');
      onClose();
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-white min-h-screen pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-grey-100 sticky top-0 bg-white z-10">
        <button
          onClick={onClose}
          className="text-black font-bold text-sm"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={loading || !hasChanges}
          className={`font-bold text-sm transition ${
            hasChanges ? 'text-black' : 'text-grey-200'
          } disabled:opacity-50`}
        >
          {loading ? 'SAVING...' : 'Save'}
        </button>
      </div>

      <div className="px-5 pt-8 pb-6">
        {/* Avatar upload */}
        <div className="flex flex-col items-center mb-8">
          <button className="w-20 h-20 rounded-full bg-grey-300 flex items-center justify-center hover:bg-grey-200 transition-all active:scale-95 mb-3">
            <Camera className="w-8 h-8 text-grey-200" />
          </button>
          <p className="text-grey-200 text-xs font-bold">Edit</p>
        </div>

        {/* Name section */}
        <div className="mb-6">
          <label className="text-grey-200 text-xs font-bold uppercase mb-2 block">Name</label>
          <div className="space-y-2">
            <input
              type="text"
              placeholder="First Name"
              value={firstName}
              onChange={(e) => {
                setFirstName(e.target.value);
                handleChange();
              }}
              className="w-full px-4 py-3 border border-grey-100 rounded-[8px] bg-white text-black text-sm focus:outline-none focus:border-brazil-green"
            />
            <input
              type="text"
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => {
                setLastName(e.target.value);
                handleChange();
              }}
              className="w-full px-4 py-3 border border-grey-100 rounded-[8px] bg-white text-black text-sm focus:outline-none focus:border-brazil-green"
            />
          </div>
        </div>

        {/* Hometown section */}
        <div className="mb-6">
          <label className="text-grey-200 text-xs font-bold uppercase mb-2 block">Hometown</label>
          <input
            type="text"
            placeholder="Town/City Country/Region"
            value={hometown}
            onChange={(e) => {
              setHometown(e.target.value);
              handleChange();
            }}
            className="w-full px-4 py-3 border border-grey-100 rounded-[8px] bg-white text-black text-sm focus:outline-none focus:border-brazil-green"
          />
        </div>

        {/* Bio section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <label className="text-grey-200 text-xs font-bold uppercase">Bio</label>
            <p className="text-grey-200 text-xs">{bio.length}/150</p>
          </div>
          <textarea
            placeholder="150 characters"
            value={bio}
            maxLength={150}
            onChange={(e) => {
              setBio(e.target.value);
              handleChange();
            }}
            className="w-full px-4 py-3 border border-grey-100 rounded-[8px] bg-white text-black text-sm focus:outline-none focus:border-brazil-green resize-none h-24"
          />
        </div>
      </div>
    </div>
  );
}
