'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { getExams, getCourses } from '@/lib/data';
import { Exam } from '@/types';

export default function AdminJadwalUjianPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [exams, setExams] = useState<(Exam & { courseName: string })[]>([]);

  useEffect(() => {
    if (isLoading) return;
    if (!user || user.role !== 'admin') { router.push('/login'); return; }
    const courses = getCourses();
    setExams(getExams().map(e => ({ ...e, courseName: courses.find(c => c.id === e.courseId)?.title || '-' })));
  }, [user, isLoading, router]);

  if (isLoading || !user) return null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">Jadwal Ujian</h2>
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-primary-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-primary-800">Ujian</th>
                <th className="px-4 py-3 text-left font-medium text-primary-800">Kursus</th>
                <th className="px-4 py-3 text-left font-medium text-primary-800">Tipe</th>
                <th className="px-4 py-3 text-left font-medium text-primary-800">Durasi</th>
                <th className="px-4 py-3 text-left font-medium text-primary-800">Mulai</th>
                <th className="px-4 py-3 text-left font-medium text-primary-800">Token</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {exams.map(e => (
                <tr key={e.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{e.title}</td>
                  <td className="px-4 py-3 text-gray-600">{e.courseName}</td>
                  <td className="px-4 py-3"><span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium">{e.type}</span></td>
                  <td className="px-4 py-3 text-gray-600">{e.duration} menit</td>
                  <td className="px-4 py-3 text-gray-600">{new Date(e.startTime).toLocaleString('id-ID')}</td>
                  <td className="px-4 py-3"><code className="bg-gray-100 px-2 py-1 rounded text-xs">{e.token}</code></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
