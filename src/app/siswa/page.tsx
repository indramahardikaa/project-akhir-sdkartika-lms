'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { getEnrollmentsBySiswa, getCourses, getExamResultsBySiswa, getAnnouncements } from '@/lib/data';

export default function SiswaDashboard() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({ courses: 0, exams: 0, avgScore: 0 });
  const [announcements, setAnnouncements] = useState<{ title: string; createdAt: string }[]>([]);

  useEffect(() => {
    if (isLoading) return;
    if (!user || user.role !== 'siswa') { router.push('/login'); return; }
    const enrollments = getEnrollmentsBySiswa(user.id);
    const results = getExamResultsBySiswa(user.id);
    const avg = results.length > 0 ? Math.round(results.reduce((a, r) => a + r.score, 0) / results.length) : 0;
    setStats({ courses: enrollments.length, exams: results.length, avgScore: avg });
    setAnnouncements(getAnnouncements().filter(a => a.targetRole === 'all' || a.targetRole === 'siswa').slice(-3).reverse());
  }, [user, isLoading, router]);

  if (isLoading || !user) return null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-xl p-6 text-white">
          <h2 className="text-2xl font-bold">Selamat Datang, {user.name}!</h2>
          <p className="text-primary-100 mt-1">Portal Siswa - SD Kartika X-2 LMS</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-primary-50 border border-primary-200 rounded-xl p-5">
            <p className="text-sm text-primary-600 font-medium">Kursus Diikuti</p>
            <p className="text-3xl font-bold text-primary-800">{stats.courses}</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
            <p className="text-sm text-blue-600 font-medium">Ujian Dikerjakan</p>
            <p className="text-3xl font-bold text-blue-800">{stats.exams}</p>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5">
            <p className="text-sm text-yellow-600 font-medium">Rata-rata Nilai</p>
            <p className="text-3xl font-bold text-yellow-800">{stats.avgScore}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Pengumuman Terbaru</h3>
          <div className="space-y-3">
            {announcements.map((a, i) => (
              <div key={i} className="p-3 bg-gray-50 rounded-lg border-l-4 border-primary-500">
                <p className="text-sm font-medium text-gray-800">{a.title}</p>
                <p className="text-xs text-gray-500 mt-1">{new Date(a.createdAt).toLocaleDateString('id-ID')}</p>
              </div>
            ))}
            {announcements.length === 0 && <p className="text-sm text-gray-500">Belum ada pengumuman</p>}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
