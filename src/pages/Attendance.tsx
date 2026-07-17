import { useEffect, useState } from 'react';
import { Calendar, Filter, ArrowLeft, AlertTriangle } from 'lucide-react';
import { userService } from '../services/userService';
import { attendanceService } from '../services/attendanceService';
import type { User, Attendance } from '../types';

export default function Attendance() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [monthlyData, setMonthlyData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await userService.getUsers();
      setUsers(response.data);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadAttendance = async (userId: number) => {
    const user = users.find((u) => u.id === userId);
    setSelectedUser(user || null);
    setLoading(true);
    setError('');
    setAttendance([]);
    setMonthlyData(null);

    try {
      // Load daily attendance
      const dailyRes = await attendanceService.getUserAttendance(userId);
      setAttendance(Array.isArray(dailyRes.records) ? dailyRes.records : []);

      // Load monthly data
      const monthlyRes = await attendanceService.getMonthlyAttendance(userId, selectedYear, selectedMonth);
      if (monthlyRes) {
        setMonthlyData(monthlyRes);
      }
    } catch (err: any) {
      console.error('Error loading attendance:', err);
      setError(err?.response?.data?.message || 'Failed to load attendance records');
    } finally {
      setLoading(false);
    }
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Attendance</h1>

      {!selectedUser ? (
        // User Selection
        <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <Filter className="w-5 h-5 text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900">Select a User</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.map((user) => (
              <button
                key={user.id}
                onClick={() => loadAttendance(user.id)}
                className="flex items-center gap-4 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-blue-500 transition-colors"
              >
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                  {user.full_name?.split(' ').map((n) => n[0]).join('')}
                </div>
                <div className="text-left">
                  <div className="font-medium text-gray-900">{user.full_name}</div>
                  <div className="text-sm text-gray-500">{user.email}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        // Attendance View
        <div className="space-y-6">
          {/* User Header */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                {selectedUser.full_name?.split(' ').map((n) => n[0]).join('')}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{selectedUser.full_name}</h2>
                <p className="text-gray-500">{selectedUser.email}</p>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="ml-auto text-blue-600 hover:text-blue-800 flex items-center gap-2"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Change User</span>
              </button>
            </div>
          </div>

          {/* Month Selection */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center gap-4">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div className="flex items-center gap-2">
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {Array.from({ length: 3 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {months.map((month, index) => (
                    <option key={index} value={index + 1}>{month}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Monthly Summary */}
          {monthlyData && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <p className="text-sm font-medium text-gray-500">Total Days</p>
                <p className="text-3xl font-bold text-gray-900">{monthlyData.total_days ?? 0}</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <p className="text-sm font-medium text-gray-500">Valid Days</p>
                <p className="text-3xl font-bold text-green-600">{monthlyData.valid_days ?? 0}</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <p className="text-sm font-medium text-gray-500">Invalid Days</p>
                <p className="text-3xl font-bold text-red-600">{monthlyData.invalid_days ?? 0}</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <p className="text-sm font-medium text-gray-500">Total Hours</p>
                <p className="text-3xl font-bold text-blue-600">
                  {(monthlyData.summary?.total_hours || 0).toFixed(1)}
                </p>
              </div>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
              <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
              <p className="text-red-800 font-medium">Error loading data</p>
              <p className="text-red-600 text-sm mt-1">{error}</p>
            </div>
          )}

          {/* Attendance List */}
          {loading ? (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500">
              Loading attendance...
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Check-in
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Check-out
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Office/Duty
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Punctuality
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Source
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {attendance.map((record) => {
                      // Determine punctuality: late if check-in is after 9:15 AM (9h*60+15min = 555 min)
                      const checkInDate = new Date(record.check_in);
                      const checkInMinutes = checkInDate.getHours() * 60 + checkInDate.getMinutes();
                      const isLate = !record.leave_type && checkInMinutes > 555; // 9:15 AM threshold
                      const isLeave = !!record.leave_type;

                      return (
                      <tr key={record.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                          {new Date(record.check_in).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                          {isLeave ? '—' : new Date(record.check_in).toLocaleTimeString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                          {record.check_out && !isLeave
                            ? new Date(record.check_out).toLocaleTimeString()
                            : isLeave ? '—' : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {record.office_location_name ? (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                              📍 {record.office_location_name}
                            </span>
                          ) : record.location_lat ? (
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              record.is_valid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {record.location_status === 'in_office' ? '📍 In Office' : record.location_status || '—'}
                            </span>
                          ) : isLeave ? (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                              🏠 On Leave
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {isLeave ? (
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              record.leave_type === 'sick' ? 'bg-blue-100 text-blue-800' :
                              record.leave_type === 'casual' ? 'bg-purple-100 text-purple-800' :
                              'bg-amber-100 text-amber-800'
                            }`}>
                              {record.leave_type === 'sick' ? '🩺 Sick' :
                               record.leave_type === 'casual' ? '🏖️ Casual' :
                               record.leave_type === 'annual' ? '🏝️ Annual' : record.leave_type}
                            </span>
                          ) : (
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              record.is_valid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {record.is_valid ? 'Valid' : 'Invalid'}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {isLate ? (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-orange-100 text-orange-800">
                              ⚠️ Late
                            </span>
                          ) : isLeave ? (
                            <span className="text-gray-400">—</span>
                          ) : (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              ✅ On Time
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {record.source === 'admin' && !isLeave ? (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-amber-100 text-amber-800">
                              🖊️ Admin
                            </span>
                          ) : record.source === 'admin' && isLeave ? (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                              🖊️ Admin Leave
                            </span>
                          ) : (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                              📱 User App
                            </span>
                          )}
                        </td>
                      </tr>
                    )})}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
