import { useEffect, useState } from 'react';
import { Download, Filter } from 'lucide-react';
import { reportsService } from '../services/reportsService';
import type { EmployeeReport } from '../types';

export default function Reports() {
  const [reports, setReports] = useState<EmployeeReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);

  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  useEffect(() => {
    loadReports();
  }, [year, month]);

  const loadReports = async () => {
    setLoading(true);
    try {
      const data = await reportsService.getReports(year, month);
      setReports(data);
    } catch (err) {
      console.error('Error loading reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    reportsService.exportCSV(year, month);
  };

  const totals = reports.reduce((acc, r) => ({
    present: acc.present + r.present_days,
    late: acc.late + r.late_days,
    absent: acc.absent + r.absent_days,
    sick: acc.sick + r.sick_leaves,
    casual: acc.casual + r.casual_leaves,
    annual: acc.annual + (r.annual_leaves || 0),
    holidays: acc.holidays + (r.holiday_days || 0),
  }), { present: 0, late: 0, absent: 0, sick: 0, casual: 0, annual: 0, holidays: 0 });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <button
          onClick={handleExport}
          disabled={reports.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400"
        >
          <Download className="w-5 h-5" />
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200 mb-6">
        <div className="flex items-center gap-4">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {Array.from({ length: 3 }, (_, i) => new Date().getFullYear() - i).map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <select
            value={month}
            onChange={(e) => setMonth(parseInt(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {months.map((m, i) => (
              <option key={i} value={i + 1}>{m}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      {!loading && reports.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-7 gap-3 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200 text-center">
            <p className="text-2xl font-bold text-green-600">{totals.present}</p>
            <p className="text-xs text-gray-500">Present</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200 text-center">
            <p className="text-2xl font-bold text-orange-600">{totals.late}</p>
            <p className="text-xs text-gray-500">Late</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200 text-center">
            <p className="text-2xl font-bold text-red-600">{totals.absent}</p>
            <p className="text-xs text-gray-500">Absent</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200 text-center">
            <p className="text-2xl font-bold text-blue-600">{totals.sick}</p>
            <p className="text-xs text-gray-500">Sick Leave</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200 text-center">
            <p className="text-2xl font-bold text-purple-600">{totals.casual}</p>
            <p className="text-xs text-gray-500">Casual</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200 text-center">
            <p className="text-2xl font-bold text-amber-600">{totals.annual}</p>
            <p className="text-xs text-gray-500">Annual</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200 text-center">
            <p className="text-2xl font-bold text-teal-600">{totals.holidays}</p>
            <p className="text-xs text-gray-500">Holidays</p>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Present</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Late</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Absent</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Sick</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Casual</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Annual</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Hours</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Holidays</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Avg/Day</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan={10} className="px-4 py-8 text-center text-gray-500">Loading...</td></tr>
              ) : reports.length === 0 ? (
                <tr><td colSpan={10} className="px-4 py-8 text-center text-gray-500">No data for this period.</td></tr>
              ) : (
                reports.map((r) => (
                  <tr key={r.user_id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{r.full_name}</div>
                      <div className="text-xs text-gray-500">{r.email}</div>
                    </td>
                    <td className="px-4 py-3 text-center text-green-600 font-medium">{r.present_days}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`font-medium ${r.late_days > 0 ? 'text-orange-600' : 'text-gray-500'}`}>{r.late_days}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`font-medium ${r.absent_days > 0 ? 'text-red-600' : 'text-gray-500'}`}>{r.absent_days}</span>
                    </td>
                    <td className="px-4 py-3 text-center text-blue-600 font-medium">{r.sick_leaves}</td>
                    <td className="px-4 py-3 text-center text-purple-600 font-medium">{r.casual_leaves}</td>
                    <td className="px-4 py-3 text-center text-amber-600 font-medium">{r.annual_leaves ?? 0}</td>
                    <td className="px-4 py-3 text-center text-gray-900">{r.total_hours.toFixed(1)}</td>
                    <td className="px-4 py-3 text-center text-teal-600 font-medium">{r.holiday_days ?? 0}</td>
                    <td className="px-4 py-3 text-center text-gray-500">{r.avg_hours_per_day.toFixed(1)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
