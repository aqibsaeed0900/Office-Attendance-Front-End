import { type ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Calendar, MapPin, LogOut, Menu, X, UserCircle, Settings as SettingsIcon, BarChart3 } from 'lucide-react';
import { authService } from '../services/authService';
import type { User } from '../types';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [user] = useState<User>(() => {
    try {
      return authService.getUser() as User;
    } catch {
      return { id: 0, email: '', full_name: 'User', role: 'employee' as const, status: 'active' as const, created_at: '' };
    }
  });

  const isAdmin = user.role === 'admin';

  const menuItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard', adminOnly: false },
    { path: '/my-attendance', icon: Calendar, label: 'My Attendance', adminOnly: false },
    { path: '/users', icon: Users, label: 'Users', adminOnly: true },
    { path: '/attendance', icon: Calendar, label: 'All Attendance', adminOnly: true },
    { path: '/office-locations', icon: MapPin, label: 'Office Locations', adminOnly: true },
    { path: '/shift-settings', icon: SettingsIcon, label: 'Shift Settings', adminOnly: true },
    { path: '/reports', icon: BarChart3, label: 'Reports', adminOnly: true },
  ].filter(item => !item.adminOnly || isAdmin);

  const handleLogout = () => {
    authService.logout();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transform transition-transform duration-300 ${
          isMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="flex items-center justify-between h-16 px-6 bg-slate-800">
          <h1 className="text-xl font-bold">Attendance Admin</h1>
          <button
            onClick={() => setIsMenuOpen(false)}
            className="lg:hidden"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="p-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700">
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center font-bold">
              {user.full_name?.split(' ').map((n) => n[0]).join('')}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{user.full_name}</p>
              <p className="text-sm text-slate-400 truncate">
                {user.role === 'admin' ? 'Admin' : 'Employee'}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-left text-slate-300 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between px-6 py-4">
            <button
              onClick={() => setIsMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {menuItems.find((item) => item.path === location.pathname)?.label || 'Dashboard'}
              </h2>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <UserCircle className="w-5 h-5" />
              {user.full_name}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-6">{children}</main>
      </div>

      {/* Overlay for mobile */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </div>
  );
}
