import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { authService } from './services/authService';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Attendance from './pages/Attendance';
import OfficeLocations from './pages/OfficeLocations';
import MyAttendance from './pages/MyAttendance';
import Settings from './pages/Settings';
import Reports from './pages/Reports';
import Devices from './pages/Devices';
import Holidays from './pages/Holidays';
import type { User } from './types';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = authService.isAuthenticated();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = authService.isAuthenticated();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  try {
    const user = authService.getUser() as User;
    if (user.role !== 'admin') {
      authService.logout();
      return <Navigate to="/login" replace />;
    }
  } catch {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function NotAdminRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = authService.isAuthenticated();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  try {
    const user = authService.getUser() as User;
    if (user.role === 'admin') return <Navigate to="/" replace />;
  } catch {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<PrivateRoute><Layout><Dashboard /></Layout></PrivateRoute>} />
        <Route path="/my-attendance" element={<NotAdminRoute><Layout><MyAttendance /></Layout></NotAdminRoute>} />
        <Route path="/users" element={<AdminRoute><Layout><Users /></Layout></AdminRoute>} />
        <Route path="/attendance" element={<AdminRoute><Layout><Attendance /></Layout></AdminRoute>} />
        <Route path="/office-locations" element={<AdminRoute><Layout><OfficeLocations /></Layout></AdminRoute>} />
        <Route path="/shift-settings" element={<AdminRoute><Layout><Settings /></Layout></AdminRoute>} />
        <Route path="/reports" element={<AdminRoute><Layout><Reports /></Layout></AdminRoute>} />
        <Route path="/devices" element={<AdminRoute><Layout><Devices /></Layout></AdminRoute>} />
        <Route path="/holidays" element={<AdminRoute><Layout><Holidays /></Layout></AdminRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
