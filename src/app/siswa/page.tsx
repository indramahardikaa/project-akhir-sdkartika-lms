'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { getEnrollmentsBySiswa, getCourses, getMaterials } from '@/lib/data';

export default function SiswaDashboard() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({ enrolled: 0, materials: 0, avgProgress: 0 });

  useEffect(() => {
    if (isLoading) return;
    if (!user || user.role !== 'siswa') { router.push('/login'); return; }

    const enrollments = getEnrollmentsBySiswa(user.id);
    const courseIds = enrollments.map(e => e.courseId);
    const materials = getMaterials().filter(m => courseIds.includes(m.courseId));
    const avgProgress = enrollments.length > 0
      ? Math.round(enrollments.reduce((sum, e) => sum + e.progress, 0) / enrollments.length)
      : 0;

    setStats({ enrolled: enrollments.length, materials: materials.length, avgProgress });
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div></div>;
  }

  return (
    <DashboardLayout>

      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Siswa</h1>
          <p className="text-gray-600 mt-1">Selamat datang, {user.name}. Ayo mulai belajar!</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Kursus Diikuti</p>
                <p className="text-2xl font-bold text-gray-900">{stats.enrolled}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Total Materi</p>
                <p className="text-2xl font-bold text-gray-900">{stats.materials}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Rata-rata Progres</p>
                <p className="text-2xl font-bold text-gray-900">{stats.avgProgress}%</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Mulai Belajar</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button onClick={() => router.push('/siswa/courses')} className="p-4 bg-green-50 hover:bg-green-100 rounded-lg text-left transition-colors">
              <h3 className="font-medium text-green-900">Jelajahi Kursus</h3>
              <p className="text-sm text-green-600 mt-1">Lihat dan daftar kursus baru</p>
            </button>
            <button onClick={() => router.push('/siswa/materials')} className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg text-left transition-colors">
              <h3 className="font-medium text-blue-900">Materi Saya</h3>
              <p className="text-sm text-blue-600 mt-1">Akses materi kursus yang diikuti</p>
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}