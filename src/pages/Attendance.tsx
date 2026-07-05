import { useEffect, useState } from 'react';
import { Calendar, Filter, ArrowLeft } from 'lucide-react';
import { userService } from '../services/userService';
import { attendanceService } from '../services/attendanceService';
import type { User, Attendance, MonthlyAttendance } from '../types';

export default function Attendance() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyAttendance | null>(null);
  const [loading, setLoading] = useState(false);
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
    setSelectedUser(users.find((u) => u.id === userId) || null);
    setLoading(true);

    try {
      // Load daily attendance
      const dailyRes = await attendanceService.getUserAttendance(userId, { pageSize: 100 });
      setAttendance(dailyRes.records);

      // Load monthly data
      const monthlyRes = await attendanceService.getMonthlyAttendance(userId, selectedYear, selectedMonth);
      setMonthlyData(monthlyRes);
    } catch (error) {
      console.error('Error loading attendance:', error);
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
                <p className="text-3xl font-bold text-gray-900">{monthlyData.total_days}</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <p className="text-sm font-medium text-gray-500">Valid Days</p>
                <p className="text-3xl font-bold text-green-600">{monthlyData.valid_days}</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <p className="text-sm font-medium text-gray-500">Invalid Days</p>
                <p className="text-3xl font-bold text-red-600">{monthlyData.invalid_days}</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <p className="text-sm font-medium text-gray-500">Total Hours</p>
                <p className="text-3xl font-bold text-blue-600">{(monthlyData.summary?.total_hours || 0).toFixed(1)}</p>
              </div>
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
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Source
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {attendance.map((record) => (
                      <tr key={record.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                          {new Date(record.check_in).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                          {new Date(record.check_in).toLocaleTimeString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                          {record.check_out
                            ? new Date(record.check_out).toLocaleTimeString()
                            : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {record.location_lat ? (
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              record.is_valid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {record.location_status}
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            record.is_valid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {record.is_valid ? 'Valid' : 'Invalid'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {record.source === 'admin' ? (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-amber-100 text-amber-800">
                              Manual punch by admin
                            </span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
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
