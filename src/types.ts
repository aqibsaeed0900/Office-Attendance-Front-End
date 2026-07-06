// User-related types
export interface User {
  id: number;
  email: string;
  full_name: string;
  role: 'admin' | 'employee';
  status: 'active' | 'inactive' | 'suspended';
  is_office_allowed?: boolean;
  office_location_radius?: number;
  office_location_center?: { lat: number; lng: number };
  created_at: string;
  updated_at?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  full_name: string;
  role?: 'admin' | 'employee';
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface CreateUserInput {
  email: string;
  password: string;
  full_name: string;
  role: 'admin' | 'employee';
  status?: 'active' | 'inactive' | 'suspended';
}

export interface UpdateUserInput {
  email?: string;
  full_name?: string;
  role?: 'admin' | 'employee';
  status?: 'active' | 'inactive' | 'suspended';
  is_office_allowed?: boolean;
  office_location_radius?: number;
  office_location_center?: { lat: number; lng: number };
}

// Attendance-related types
export interface Attendance {
  id: number;
  user_id: number;
  check_in: string;
  check_out?: string | null;
  location_lat?: number | null;
  location_lng?: number | null;
  is_valid?: boolean;
  location_status?: 'in_office' | 'out_of_office' | 'unknown';
  source?: 'user' | 'admin';
  leave_type?: 'sick' | 'casual' | null;
  leave_reason?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface MonthlyAttendance {
  totalDays: number;
  presentDays: number;
  absentDays: number;
  totalHours: number;
  validAttendance: number;
  invalidAttendance: number;
}

// Office location types
export interface OfficeLocation {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  radius: number; // in meters
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface OfficeLocationFormData {
  name: string;
  latitude: number;
  longitude: number;
  radius: number; // in meters
  is_active: boolean;
}

// Shift settings
export interface ShiftSetting {
  id: number;
  shift_name: string;
  start_time: string;
  end_time: string;
  working_days: string;
  grace_minutes: number;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

// Employee report
export interface EmployeeReport {
  user_id: number;
  full_name: string;
  email: string;
  total_days: number;
  present_days: number;
  absent_days: number;
  late_days: number;
  sick_leaves: number;
  casual_leaves: number;
  total_hours: number;
  avg_hours_per_day: number;
  holiday_days: number;
}

// Holiday types
export interface Holiday {
  id: number;
  name: string;
  date: string;
  description: string | null;
  is_recurring_yearly: number;
  created_at: string;
  updated_at: string;
}

// Device types
export interface UserDevice {
  id: number;
  user_id: number;
  device_id: string;
  device_name: string | null;
  device_type: string;
  user_agent: string | null;
  ip_address: string | null;
  is_active: number;
  created_at: string;
  last_login_at: string;
  full_name?: string;
  email?: string;
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}