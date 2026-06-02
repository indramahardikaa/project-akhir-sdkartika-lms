'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { getClassRooms, getUsersByClass, getAttendanceByDate, saveAttendanceBatch } from '@/lib/data';
import { ClassRoom, User } from '@/types';

interface AttendanceEntry {
  siswaId: string;
  status: 'hadir' | 'sakit' | 'izin' | 'alpa';
  note: string;
}

export default function GuruAttendancePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [classRooms, setClassRooms] = useState<ClassRoom[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState<User[]>([]);
  const [entries, setEntries] = useState<AttendanceEntry[]>([]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (isLoading) return;
    if (!user || user.role !== 'guru') { router.push('/login'); return; }
    setClassRooms(getClassRooms());
  }, [user, isLoading, router]);

  useEffect(() => {
    if (!selectedClass) { setStudents([]); setEntries([]); return; }
    const studentList = getUsersByClass(selectedClass);
    setStudents(studentList);

    // Load existing attendance for this date
    const existing = getAttendanceByDate(selectedClass, selectedDate);
    const newEntries: AttendanceEntry[] = studentList.map((s) => {
      const found = existing.find((a) => a.siswaId === s.id);
      return { siswaId: s.id, status: found?.status || 'hadir', note: found?.note || '' };
    });
    setEntries(newEntries);
    setSaved(false);
  }, [selectedClass, selectedDate]);

  const updateEntry = (siswaId: string, field: 'status' | 'note', value: string) => {
    setEntries((prev) => prev.map((e) => e.siswaId === siswaId ? { ...e, [field]: value } : e));
    setSaved(false);
  };

  const handleSave = () => {
    if (!user || !selectedClass) return;
    saveAttendanceBatch(selectedClass, user.id, selectedDate, entries);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'hadir': return 'bg-green-100 text-green-700 border-green-300';
      case 'sakit': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'izin': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'alpa': return 'bg-red-100 text-red-700 border-red-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getSummary = () => {
    const hadir = entries.filter((e) => e.status === 'hadir').length;
    const sakit = entries.filter((e) => e.status === 'sakit').length;
    const izin = entries.filter((e) => e.status === 'izin').length;
    const alpa = entries.filter((e) => e.status === 'alpa').length;
    return { hadir, sakit, izin, alpa };
  };

  if (isLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div></div>;
  }

  const summary = getSummary();

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Absensi Siswa</h1>
          <p className="text-gray-500 text-sm mt-1">Rekap kehadiran siswa per kelas dan tanggal</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Kelas</label>
              <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-green-500">
                <option value="">-- Pilih Kelas --</option>
                {classRooms.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
              <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-green-500" />
            </div>
          </div>
        </div>

        {/* Summary */}
        {selectedClass && students.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
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
          </div>
        )}

        {/* Attendance Table */}
        {selectedClass && students.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">No</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Siswa</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {students.map((s, idx) => {
                  const entry = entries.find((e) => e.siswaId === s.id);
                  return (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-500">{idx + 1}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{s.name}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center gap-1">
                          {(['hadir', 'sakit', 'izin', 'alpa'] as const).map((status) => (
                            <button
                              key={status}
                              onClick={() => updateEntry(s.id, 'status', status)}
                              className={`px-2 py-1 rounded text-xs font-medium border transition-colors ${
                                entry?.status === status ? getStatusColor(status) : 'bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-100'
                              }`}
                            >
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </button>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={entry?.note || ''}
                          onChange={(e) => updateEntry(s.id, 'note', e.target.value)}
                          placeholder="Keterangan..."
                          className="w-full px-2 py-1 text-sm border border-gray-200 rounded focus:ring-1 focus:ring-green-500 text-gray-700"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Save button */}
            <div className="p-4 border-t border-gray-100 flex items-center justify-between">
              <p className="text-sm text-gray-500">Total: {students.length} siswa</p>
              <div className="flex items-center gap-3">
                {saved && (
                  <span className="text-sm text-green-600 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    Tersimpan!
                  </span>
                )}
                <button onClick={handleSave} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors">
                  Simpan Absensi
                </button>
              </div>
            </div>
          </div>
        )}

        {selectedClass && students.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
            <p className="text-gray-500">Belum ada siswa di kelas ini.</p>
          </div>
        )}

        {!selectedClass && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            <p className="text-gray-500">Pilih kelas terlebih dahulu untuk mengisi absensi.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
