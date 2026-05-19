'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import { getCoursesByGuru, getMaterials, getEnrollments } from '@/lib/data';

export default function GuruDashboard() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({ courses: 0, materials: 0, students: 0 });

  useEffect(() => {
    if (isLoading) return;
    if (!user || user.role !== 'guru') { router.push('/login'); return; }

    const courses = getCoursesByGuru(user.id);
    const courseIds = courses.map(c => c.id);
    const materials = getMaterials().filter(m => courseIds.includes(m.courseId));
    const enrollments = getEnrollments().filter(e => courseIds.includes(e.courseId));
    const uniqueStudents = new Set(enrollments.map(e => e.siswaId));

    setStats({ courses: courses.length, materials: materials.length, students: uniqueStudents.size });
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Guru</h1>
          <p className="text-gray-600 mt-1">Selamat datang, {user.name}. Kelola kursus dan materi Anda.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z" /></svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Kursus Saya</p>
                <p className="text-2xl font-bold text-gray-900">{stats.courses}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Total Materi</p>
                <p className="text-2xl font-bold text-gray-900">{stats.materials}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197" /></svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Siswa Terdaftar</p>
                <p className="text-2xl font-bold text-gray-900">{stats.students}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Aksi Cepat</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button onClick={() => router.push('/guru/courses')} className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg text-left transition-colors">
              <h3 className="font-medium text-blue-900">Kursus Saya</h3>
              <p className="text-sm text-blue-600 mt-1">Lihat dan kelola kursus</p>
            </button>
            <button onClick={() => router.push('/guru/materials')} className="p-4 bg-green-50 hover:bg-green-100 rounded-lg text-left transition-colors">
              <h3 className="font-medium text-green-900">Kelola Materi</h3>
              <p className="text-sm text-green-600 mt-1">Tambah dan edit materi</p>
            </button>
            <button onClick={() => router.push('/guru/students')} className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg text-left transition-colors">
              <h3 className="font-medium text-purple-900">Lihat Siswa</h3>
              <p className="text-sm text-purple-600 mt-1">Pantau progres siswa</p>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
