import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { shiftSettingsService } from '../services/shiftSettingsService';
import type { ShiftSetting } from '../types';

const DAYS = [
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
  { value: 7, label: 'Sun' },
];

export default function Settings() {
  const [setting, setSetting] = useState<ShiftSetting | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadSetting();
  }, []);

  const loadSetting = async () => {
    try {
      const data = await shiftSettingsService.get();
      setSetting(data);
    } catch (err) {
      console.error('Error loading shift settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleDay = (day: number) => {
    if (!setting) return;
    const days = setting.working_days.split(',').map(Number);
    const idx = days.indexOf(day);
    if (idx >= 0) days.splice(idx, 1);
    else days.push(day);
    days.sort();
    setSetting({ ...setting, working_days: days.join(',') });
  };

  const handleSave = async () => {
    if (!setting) return;
    setSaving(true);
    setMessage('');
    try {
      await shiftSettingsService.update(setting.id, {
        start_time: setting.start_time,
        end_time: setting.end_time,
        working_days: setting.working_days,
        grace_minutes: setting.grace_minutes,
      });
      setMessage('Settings saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      setMessage('Error: ' + (err.response?.data?.message || 'Failed to save'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center text-gray-500 py-8">Loading...</div>;
  if (!setting) return <div className="text-center text-gray-500 py-8">No settings found.</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Shift Settings</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 max-w-2xl">
        {message && (
          <div className={`mb-4 p-3 rounded-lg text-sm ${
            message.includes('Error') ? 'bg-red-50 text-red-800 border border-red-200' : 'bg-green-50 text-green-800 border border-green-200'
          }`}>
            {message}
          </div>
        )}

        <div className="space-y-6">
          {/* Shift Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Shift Name</label>
            <input
              type="text"
              value={setting.shift_name}
              onChange={(e) => setSetting({ ...setting, shift_name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Start / End Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
              <input
                type="time"
                value={setting.start_time}
                onChange={(e) => setSetting({ ...setting, start_time: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
              <input
                type="time"
                value={setting.end_time}
                onChange={(e) => setSetting({ ...setting, end_time: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Grace Minutes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Grace Period (minutes) <span className="text-gray-400 font-normal">— late after this many minutes past start</span>
            </label>
            <input
              type="number"
              min={0}
              max={120}
              value={setting.grace_minutes}
              onChange={(e) => setSetting({ ...setting, grace_minutes: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Working Days */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Working Days</label>
            <div className="flex gap-2">
              {DAYS.map((day) => {
                const selected = setting.working_days.split(',').map(Number).includes(day.value);
                return (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => toggleDay(day.value)}
                    className={`w-12 h-12 rounded-lg text-sm font-medium transition-colors ${
                      selected
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    {day.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Save */}
          <div className="pt-4 border-t border-gray-200">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
