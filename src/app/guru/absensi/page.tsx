'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { getCoursesByGuru, getEnrollmentsByCourse, getUsers, createAttendance, getAttendanceByCourse } from '@/lib/data';

export default function GuruAbsensiPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [courses, setCourses] = useState<{ id: string; title: string }[]>([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [students, setStudents] = useState<{ id: string; name: string }[]>([]);
  const [attendance, setAttendance] = useState<Record<string, 'hadir' | 'izin' | 'sakit' | 'alpha'>>({});
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (isLoading) return;
    if (!user || user.role !== 'guru') { router.push('/login'); return; }
    setCourses(getCoursesByGuru(user.id).map(c => ({ id: c.id, title: c.title })));
  }, [user, isLoading, router]);

  useEffect(() => {
    if (!selectedCourse) return;
    const users = getUsers();
    const enrollments = getEnrollmentsByCourse(selectedCourse);
    const studs = enrollments.map(e => {
      const u = users.find(x => x.id === e.siswaId);
      return { id: e.siswaId, name: u?.name || '-' };
    });
    setStudents(studs);
    const defaults: Record<string, 'hadir'> = {};
    studs.forEach(s => { defaults[s.id] = 'hadir'; });
    setAttendance(defaults);
  }, [selectedCourse]);

  const handleSave = () => {
    Object.entries(attendance).forEach(([siswaId, status]) => {
      createAttendance({ courseId: selectedCourse, siswaId, date, status });
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (isLoading || !user) return null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">Absensi Siswa</h2>
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)} className="border rounded-lg px-3 py-2 text-sm">
              <option value="">Pilih Kursus</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="border rounded-lg px-3 py-2 text-sm" />
          </div>
          {students.length > 0 && (
            <>
              <table className="w-full text-sm">
                <thead className="bg-primary-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-primary-800">Siswa</th>
                    <th className="px-4 py-3 text-left font-medium text-primary-800">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {students.map(s => (
                    <tr key={s.id}>
                      <td className="px-4 py-3">{s.name}</td>
                      <td className="px-4 py-3">
                        <select value={attendance[s.id] || 'hadir'} onChange={e => setAttendance({...attendance, [s.id]: e.target.value as 'hadir' | 'izin' | 'sakit' | 'alpha'})} className="border rounded px-2 py-1 text-sm">
                          <option value="hadir">Hadir</option>
                          <option value="izin">Izin</option>
                          <option value="sakit">Sakit</option>
                          <option value="alpha">Alpha</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button onClick={handleSave} className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700">Simpan Absensi</button>
              {saved && <span className="ml-3 text-sm text-primary-600 font-medium">Tersimpan!</span>}
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
