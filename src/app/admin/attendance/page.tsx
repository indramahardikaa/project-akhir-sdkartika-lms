'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { getClassRooms, getUsersByClass, getAttendanceByDate } from '@/lib/data';
import { ClassRoom, User, Attendance } from '@/types';

export default function AdminAttendancePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [classRooms, setClassRooms] = useState<ClassRoom[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState<User[]>([]);
  const [attendanceData, setAttendanceData] = useState<Map<string, Map<string, Attendance>>>(new Map());
  const [dateRange, setDateRange] = useState<string[]>([]);

  useEffect(() => {
    if (isLoading) return;
    if (!user || user.role !== 'admin') { router.push('/login'); return; }
    setClassRooms(getClassRooms());
  }, [user, isLoading, router]);

  const generateDateRange = (start: string, end: string): string[] => {
    const dates: string[] = [];
    const current = new Date(start);
    const endD = new Date(end);
    while (current <= endD) {
      dates.push(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
    }
    return dates;
  };

  const handleSearch = () => {
    if (!selectedClass) return;
    const studentList = getUsersByClass(selectedClass);
    setStudents(studentList);

    const dates = generateDateRange(startDate, endDate);
    setDateRange(dates);

    const dataMap = new Map<string, Map<string, Attendance>>();
    dates.forEach((date) => {
      const records = getAttendanceByDate(selectedClass, date);
      const dateMap = new Map<string, Attendance>();
      records.forEach((r) => {
        dateMap.set(r.siswaId, r);
      });
      dataMap.set(date, dateMap);
    });
    setAttendanceData(dataMap);
  };

  const handlePrint = () => {
    window.print();
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'hadir': return 'H';
      case 'sakit': return 'S';
      case 'izin': return 'I';
      case 'alpa': return 'A';
      default: return '-';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'hadir': return 'text-green-700 bg-green-50';
      case 'sakit': return 'text-yellow-700 bg-yellow-50';
      case 'izin': return 'text-blue-700 bg-blue-50';
      case 'alpa': return 'text-red-700 bg-red-50';
      default: return 'text-gray-400';
    }
  };

  const getSummary = () => {
    let hadir = 0, sakit = 0, izin = 0, alpa = 0;
    attendanceData.forEach((dateMap) => {
      dateMap.forEach((record) => {
        switch (record.status) {
          case 'hadir': hadir++; break;
          case 'sakit': sakit++; break;
          case 'izin': izin++; break;
          case 'alpa': alpa++; break;
        }
      });
    });
    return { hadir, sakit, izin, alpa, total: hadir + sakit + izin + alpa };
  };

  if (isLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div></div>;
  }

  const summary = getSummary();

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Rekap Absensi</h1>
            <p className="text-gray-500 text-sm mt-1">Lihat dan cetak rekap kehadiran siswa</p>
          </div>
          {students.length > 0 && dateRange.length > 0 && (
            <button onClick={handlePrint} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 print:hidden">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
              Cetak / Print
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6 print:hidden">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Kelas</label>
              <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-green-500">
                <option value="">-- Pilih Kelas --</option>
                {classRooms.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dari Tanggal</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sampai Tanggal</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-green-500" />
            </div>
            <div className="flex items-end">
              <button onClick={handleSearch} className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                Tampilkan
              </button>
            </div>
          </div>
        </div>

        {/* Print Header */}
        <div className="hidden print:block mb-6 text-center">
          <h2 className="text-lg font-bold">SD Kartika Jaya X-2</h2>
          <p className="text-sm">Rekap Kehadiran Siswa</p>
          <p className="text-sm">Kelas: {classRooms.find(c => c.id === selectedClass)?.name} | Periode: {startDate} s/d {endDate}</p>
        </div>

        {/* Summary */}
        {students.length > 0 && dateRange.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-green-700">{summary.hadir}</p>
              <p className="text-xs text-green-600">Hadir</p>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-yellow-700">{summary.sakit}</p>
              <p className="text-xs text-yellow-600">Sakit</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-blue-700">{summary.izin}</p>
              <p className="text-xs text-blue-600">Izin</p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-red-700">{summary.alpa}</p>
              <p className="text-xs text-red-600">Alpa</p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-gray-700">{summary.total}</p>
              <p className="text-xs text-gray-600">Total</p>
            </div>
          </div>
        )}

        {/* Attendance Table */}
        {students.length > 0 && dateRange.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden print:shadow-none">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">No</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Siswa</th>
                    {dateRange.map((date) => (
                      <th key={date} className="px-2 py-3 text-center text-xs font-medium text-gray-500">
                        {new Date(date).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit' })}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {students.map((student, idx) => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 text-sm text-gray-500">{idx + 1}</td>
                      <td className="px-3 py-2 text-sm font-medium text-gray-900 whitespace-nowrap">{student.name}</td>
                      {dateRange.map((date) => {
                        const record = attendanceData.get(date)?.get(student.id);
                        return (
                          <td key={date} className="px-2 py-2 text-center">
                            {record ? (
                              <span className={`inline-block w-6 h-6 leading-6 rounded text-xs font-bold ${getStatusColor(record.status)}`}>
                                {getStatusLabel(record.status)}
                              </span>
                            ) : (
                              <span className="text-gray-300 text-xs">-</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Legend */}
        {students.length > 0 && dateRange.length > 0 && (
          <div className="mt-4 flex items-center gap-4 text-xs text-gray-600">
            <span className="font-medium">Keterangan:</span>
            <span className="flex items-center gap-1"><span className="inline-block w-5 h-5 leading-5 text-center rounded bg-green-50 text-green-700 font-bold">H</span> Hadir</span>
            <span className="flex items-center gap-1"><span className="inline-block w-5 h-5 leading-5 text-center rounded bg-yellow-50 text-yellow-700 font-bold">S</span> Sakit</span>
            <span className="flex items-center gap-1"><span className="inline-block w-5 h-5 leading-5 text-center rounded bg-blue-50 text-blue-700 font-bold">I</span> Izin</span>
            <span className="flex items-center gap-1"><span className="inline-block w-5 h-5 leading-5 text-center rounded bg-red-50 text-red-700 font-bold">A</span> Alpa</span>
          </div>
        )}

        {!selectedClass && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            <p className="text-gray-500">Pilih kelas dan rentang tanggal untuk melihat rekap absensi.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
