'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { getAttendance, getUsers, getCourses } from '@/lib/data';
import { Attendance } from '@/types';

export default function AdminAbsensiPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [attendance, setAttendance] = useState<(Attendance & { siswaName: string; courseName: string })[]>([]);

  useEffect(() => {
    if (isLoading) return;
    if (!user || user.role !== 'admin') { router.push('/login'); return; }
    const users = getUsers();
    const courses = getCourses();
    const data = getAttendance().map(a => ({
      ...a,
      siswaName: users.find(u => u.id === a.siswaId)?.name || '-',
      courseName: courses.find(c => c.id === a.courseId)?.title || '-',
    }));
    setAttendance(data);
  }, [user, isLoading, router]);

  if (isLoading || !user) return null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">Data Absensi</h2>
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-primary-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-primary-800">Tanggal</th>
                <th className="px-4 py-3 text-left font-medium text-primary-800">Siswa</th>
                <th className="px-4 py-3 text-left font-medium text-primary-800">Kursus</th>
                <th className="px-4 py-3 text-left font-medium text-primary-800">Status</th>
                <th className="px-4 py-3 text-left font-medium text-primary-800">Keterangan</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {attendance.map(a => (
                <tr key={a.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{a.date}</td>
                  <td className="px-4 py-3">{a.siswaName}</td>
                  <td className="px-4 py-3">{a.courseName}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${a.status === 'hadir' ? 'bg-primary-100 text-primary-700' : a.status === 'izin' ? 'bg-blue-100 text-blue-700' : a.status === 'sakit' ? 'bg-yellow-100 text-yellow-700' : 'bg-accent-100 text-accent-700'}`}>{a.status}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{a.note || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
