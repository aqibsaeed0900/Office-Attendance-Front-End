import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Calendar, MapPin, UserCircle } from 'lucide-react';
import { userService } from '../services/userService';
import { officeLocationService } from '../services/officeLocationService';
import { authService } from '../services/authService';
import type { User } from '../types';

export default function Dashboard() {
  const [user] = useState<User>(() => {
    try { return authService.getUser() as User; } catch { return { id: 0, email: '', full_name: 'User', role: 'employee' as const, status: 'active' as const, created_at: '' }; }
  });

  const isAdmin = user.role === 'admin';

  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalAttendance: 0,
    activeOfficeLocations: 0,
  });

  useEffect(() => {
    if (isAdmin) {
      loadAdminStats();
    }
  }, [isAdmin]);

  const loadAdminStats = async () => {
    try {
      const [usersRes, activeUsersRes, locationsRes] = await Promise.all([
        userService.getUsers({ pageSize: 1 }),
        userService.getUsers({ status: 'active' }),
        officeLocationService.getOfficeLocations({ isActive: true }),
      ]);

      setStats({
        totalUsers: usersRes.total,
        activeUsers: activeUsersRes.total,
        totalAttendance: 0,
        activeOfficeLocations: locationsRes.total,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      {/* Welcome */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
            {user.full_name?.split(' ').map((n) => n[0]).join('')}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Welcome, {user.full_name}!</h2>
            <p className="text-gray-500">
              {isAdmin ? 'You are logged in as an administrator.' : 'You are logged in as an employee.'}
            </p>
          </div>
        </div>
      </div>

      {/* Admin Stats Grid */}
      {isAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Users</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalUsers}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Active Users</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.activeUsers}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Attendance</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalAttendance.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Active Offices</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.activeOfficeLocations}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <MapPin className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Employee Quick Links */}
      {!isAdmin && (
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">My Attendance</h3>
                <p className="text-sm text-gray-500">View your attendance records</p>
              </div>
            </div>
            <Link
              to="/my-attendance"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              Go to My Attendance →
            </Link>
          </div>
        </div>
      )}

      {/* Admin Quick Actions */}
      {isAdmin && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Manage Users</h3>
                <p className="text-sm text-gray-500">Add, edit, or deactivate users</p>
              </div>
            </div>
            <Link
              to="/users"
              className="mt-4 inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              Go to Users →
            </Link>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">View Attendance</h3>
                <p className="text-sm text-gray-500">Check attendance records</p>
              </div>
            </div>
            <Link
              to="/attendance"
              className="mt-4 inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              Go to Attendance →
            </Link>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <MapPin className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Office Locations</h3>
                <p className="text-sm text-gray-500">Manage office boundaries</p>
              </div>
            </div>
            <Link
              to="/office-locations"
              className="mt-4 inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              Go to Office Locations →
            </Link>
          </div>
        </div>
      )}

      {/* Recent Activity (admin only) */}
      {isAdmin && (
        <div className="mt-8 bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {[
              { action: 'New user registered', time: '2 minutes ago', user: 'John Doe' },
              { action: 'Check-in completed', time: '5 minutes ago', user: 'Jane Smith' },
              { action: 'Office location updated', time: '1 hour ago', user: 'Admin' },
              { action: 'User deactivated', time: '2 hours ago', user: 'Bob Johnson' },
            ].map((activity) => (
              <div key={activity.action} className="flex items-center gap-4">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <UserCircle className="w-4 h-4 text-gray-500" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{activity.action}</p>
                  <p className="text-sm text-gray-500">By {activity.user} • {activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
