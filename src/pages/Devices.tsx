import { useEffect, useState } from 'react';
import { Smartphone, Monitor, Trash2, RotateCcw, AlertTriangle } from 'lucide-react';
import { deviceService } from '../services/deviceService';
import type { UserDevice } from '../types';

export default function Devices() {
  const [devices, setDevices] = useState<UserDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMsg, setActionMsg] = useState('');

  useEffect(() => {
    loadDevices();
  }, []);

  const loadDevices = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await deviceService.getAllDevices();
      setDevices(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load devices');
    } finally {
      setLoading(false);
    }
  };

  const handleUnbind = async (deviceId: number, userName: string) => {
    if (!window.confirm(`Unbind this device from "${userName}"? The user will be able to log in from a new device.`)) return;
    setActionMsg('');
    try {
      await deviceService.unbindDevice(deviceId);
      setActionMsg('Device unbound successfully.');
      loadDevices();
    } catch (err: any) {
      setActionMsg(err?.response?.data?.message || 'Failed to unbind device');
    }
  };

  const handleResetUser = async (userId: number, userName: string) => {
    if (!window.confirm(`Reset ALL devices for "${userName}"? They will need to log in again from a new device.`)) return;
    setActionMsg('');
    try {
      await deviceService.resetUserDevices(userId);
      setActionMsg(`All devices reset for ${userName}.`);
      loadDevices();
    } catch (err: any) {
      setActionMsg(err?.response?.data?.message || 'Failed to reset devices');
    }
  };

  const getDeviceIcon = (deviceType: string) => {
    return deviceType === 'mobile' || deviceType === 'pwa'
      ? <Smartphone className="w-5 h-5 text-green-500" />
      : <Monitor className="w-5 h-5 text-blue-500" />;
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Device Management</h1>

      {actionMsg && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${
          actionMsg.includes('failed') ? 'bg-red-50 text-red-800 border border-red-200' : 'bg-green-50 text-green-800 border border-green-200'
        }`}>
          {actionMsg}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center mb-6">
          <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading devices...</div>
        ) : devices.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No devices registered yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Device</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP Address</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Login</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">First Bound</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {devices.map((device) => (
                  <tr key={device.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{device.full_name || `User #${device.user_id}`}</div>
                      <div className="text-xs text-gray-500">{device.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {getDeviceIcon(device.device_type)}
                        <span className="text-sm text-gray-700">{device.device_name || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        device.device_type === 'mobile' || device.device_type === 'pwa'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {device.device_type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{device.ip_address || '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(device.last_login_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(device.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleUnbind(device.id, device.full_name || `User #${device.user_id}`)}
                        className="text-red-600 hover:text-red-800 mr-3"
                        title="Unbind this device"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleResetUser(device.user_id, device.full_name || `User #${device.user_id}`)}
                        className="text-amber-600 hover:text-amber-800"
                        title="Reset all devices for this user"
                      >
                        <RotateCcw className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
