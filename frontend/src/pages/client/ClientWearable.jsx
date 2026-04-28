import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Plus, Trash2, RefreshCw, Zap, Heart, Moon, Activity } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import EmptyState from '../../components/EmptyState';

const DEVICE_TYPES = [
  { id: 'apple_health', name: 'Apple Health', icon: '🍎' },
  { id: 'garmin', name: 'Garmin', icon: '⌚' },
  { id: 'oura', name: 'Oura Ring', icon: '💍' },
];

export default function ClientWearable() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [devices, setDevices] = useState([]);
  const [dailyData, setDailyData] = useState(null);
  const [weeklyData, setWeeklyData] = useState([]);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    fetchDevicesAndData();
  }, []);

  const fetchDevicesAndData = async () => {
    try {
      setLoading(true);
      const devRes = await api.get('/api/wearables/devices');
      setDevices(devRes.data?.devices || []);

      const dailyRes = await api.get(`/api/wearables/daily/${new Date().toISOString().split('T')[0]}`);
      setDailyData(dailyRes.data?.data || null);

      const weeklyRes = await api.get('/api/wearables/weekly');
      setWeeklyData(weeklyRes.data?.data || []);
    } catch (err) {
      console.error('Error fetching wearable data:', err);
      // Don't show error toast on initial load since wearables may not be connected
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (deviceType) => {
    try {
      const res = await api.post('/api/wearables/connect', { device_type: deviceType });
      if (res.data?.auth_url) {
        window.location.href = res.data.auth_url;
      }
    } catch (err) {
      console.error('Error connecting device:', err);
      toast.error('Failed to connect device. Please try again.');
    }
  };

  const handleDisconnect = async (deviceId) => {
    if (!window.confirm('Are you sure you want to disconnect this device?')) return;
    try {
      await api.delete(`/api/wearables/devices/${deviceId}`);
      toast.success('Device disconnected');
      await fetchDevicesAndData();
    } catch (err) {
      console.error('Error disconnecting device:', err);
      toast.error('Failed to disconnect device');
    }
  };

  const handleSync = async () => {
    try {
      setSyncing(true);
      await api.post('/api/wearables/sync');
      toast.success('Syncing devices...');
      setTimeout(fetchDevicesAndData, 2000);
    } catch (err) {
      console.error('Error syncing:', err);
      toast.error('Failed to sync devices');
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-12"><div className="animate-spin text-4xl">⏳</div></div>;
  }

  if (!user?.isPro) {
    return <EmptyState section="wearables" />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Wearable Devices</h1>
            <p className="text-gray-600 mt-1">Monitor your health metrics 24/7</p>
          </div>
          <button
            onClick={handleSync}
            disabled={syncing}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-black font-semibold px-4 py-2 rounded-lg transition flex items-center gap-2"
          >
            <RefreshCw size={18} className={syncing ? 'animate-spin' : ''} />
            Sync
          </button>
        </div>

        {/* Connected Devices */}
        {devices.length > 0 && (
          <div className="bg-white rounded-[8px] shadow mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Connected Devices</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {devices.map(device => (
                <div key={device.id} className="p-6 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex items-center gap-4">
                    <div className="text-3xl">
                      {DEVICE_TYPES.find(t => t.id === device.device_type)?.icon || '⌚'}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {DEVICE_TYPES.find(t => t.id === device.device_type)?.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {device.is_active ? '✓ Connected' : '✗ Disconnected'}
                      </p>
                      {device.last_sync && (
                        <p className="text-xs text-gray-500">
                          Last sync: {new Date(device.last_sync).toLocaleString()}
                        </p>
                      )}
                      {device.sync_error && (
                        <p className="text-xs text-red-600">Error: {device.sync_error}</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDisconnect(device.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Readiness Score */}
        {dailyData?.readiness_score && (
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-[8px] shadow mb-8 p-6 border border-emerald-200">
            <h2 className="text-lg font-semibold text-emerald-900 mb-4">Today's Readiness</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4 text-center">
                <div className="text-4xl font-bold text-emerald-600">
                  {dailyData.readiness_score}%
                </div>
                <p className="text-sm text-gray-600 mt-2">Readiness Score</p>
                <p className="text-xs text-gray-500 mt-1 capitalize">
                  {dailyData.readiness_recommendation || 'Good to train'}
                </p>
              </div>
              {dailyData.sleep_duration && (
                <div className="bg-white rounded-lg p-4 text-center">
                  <div className="flex justify-center mb-2">
                    <Moon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {dailyData.sleep_duration.toFixed(1)}h
                  </div>
                  <p className="text-sm text-gray-600">Sleep</p>
                </div>
              )}
              {dailyData.hrv && (
                <div className="bg-white rounded-lg p-4 text-center">
                  <div className="flex justify-center mb-2">
                    <Heart className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {Math.round(dailyData.hrv)}
                  </div>
                  <p className="text-sm text-gray-600">HRV</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Weekly Metrics */}
        {weeklyData.length > 0 && (
          <div className="bg-white rounded-[8px] shadow overflow-hidden mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">This Week's Metrics</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6">
              {/* Steps */}
              {weeklyData.some(d => d.steps) && (
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-center mb-2">
                    <Activity className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {(weeklyData.reduce((sum, d) => sum + (d.steps || 0), 0) / 1000).toFixed(0)}k
                  </div>
                  <p className="text-xs text-gray-600 mt-1">Steps</p>
                </div>
              )}

              {/* Avg Heart Rate */}
              {weeklyData.some(d => d.heart_rate_avg) && (
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-center mb-2">
                    <Heart className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {Math.round(weeklyData.reduce((sum, d) => sum + (d.heart_rate_avg || 0), 0) / weeklyData.length)}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">Avg HR</p>
                </div>
              )}

              {/* Sleep */}
              {weeklyData.some(d => d.sleep_duration) && (
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-center mb-2">
                    <Moon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {(weeklyData.reduce((sum, d) => sum + (d.sleep_duration || 0), 0) / 7).toFixed(1)}h
                  </div>
                  <p className="text-xs text-gray-600 mt-1">Avg Sleep</p>
                </div>
              )}

              {/* Calories */}
              {weeklyData.some(d => d.active_calories) && (
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-center mb-2">
                    <Zap className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {(weeklyData.reduce((sum, d) => sum + (d.active_calories || 0), 0) / 1000).toFixed(0)}k
                  </div>
                  <p className="text-xs text-gray-600 mt-1">Avg Cal</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Connect New Device */}
        {devices.length < 3 && (
          <div className="bg-white rounded-[8px] shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Connect Device</h2>
            <p className="text-gray-600 mb-4">
              Connect your wearable device to track metrics like heart rate, sleep, steps, and more
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {DEVICE_TYPES.filter(dt => !devices.find(d => d.device_type === dt.id)).map(deviceType => (
                <button
                  key={deviceType.id}
                  onClick={() => handleConnect(deviceType.id)}
                  className="flex flex-col items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-emerald-600 hover:bg-emerald-50 transition"
                >
                  <div className="text-4xl">{deviceType.icon}</div>
                  <div className="text-center">
                    <h3 className="font-semibold text-gray-900">{deviceType.name}</h3>
                    <p className="text-xs text-gray-600 mt-1">Connect</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* No Devices */}
        {devices.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">⌚</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Devices Connected</h2>
            <p className="text-gray-600 mb-6">
              Connect a wearable device to start tracking your health metrics
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {DEVICE_TYPES.map(deviceType => (
                <button
                  key={deviceType.id}
                  onClick={() => handleConnect(deviceType.id)}
                  className="flex flex-col items-center gap-2 p-4 border border-gray-200 rounded-lg hover:border-emerald-600 hover:bg-emerald-50 transition"
                >
                  <div className="text-3xl">{deviceType.icon}</div>
                  <span className="font-semibold text-gray-900">{deviceType.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
