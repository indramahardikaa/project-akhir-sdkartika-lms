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
    return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 rounded-2xl p-8 mb-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full -translate-y-1/3 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-20 w-40 h-40 bg-accent-500/15 rounded-full translate-y-1/2"></div>
          <div className="relative z-10">
            <div className="flex items-center space-x-2 mb-2">
              <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-medium backdrop-blur-sm">Guru</span>
            </div>
            <h1 className="text-3xl font-bold mb-2">Halo, {user.name}!</h1>
            <p className="text-primary-100 text-lg">Kelola kursus dan pantau perkembangan siswa Anda.</p>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-accent-400 via-white to-primary-300"></div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          <div className="bg-white rounded-xl p-6 border border-gray-100 hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Kursus Saya</p>
                <p className="text-3xl font-bold text-primary-700 mt-1">{stats.courses}</p>
              </div>
              <div className="bg-primary-100 p-3 rounded-xl">
                <svg className="w-7 h-7 text-primary-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-100 hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Materi</p>
                <p className="text-3xl font-bold text-blue-700 mt-1">{stats.materials}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-xl">
                <svg className="w-7 h-7 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-100 hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Siswa Terdaftar</p>
                <p className="text-3xl font-bold text-purple-700 mt-1">{stats.students}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-xl">
                <svg className="w-7 h-7 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-5 flex items-center space-x-2">
            <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            <span>Aksi Cepat</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button onClick={() => router.push('/guru/courses')} className="group p-5 bg-gradient-to-br from-primary-50 to-green-50 hover:from-primary-100 hover:to-green-100 rounded-xl text-left transition-all duration-300 border border-primary-100 hover:shadow-md">
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-primary-200 transition-colors">
                <svg className="w-5 h-5 text-primary-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
              </div>
              <h3 className="font-semibold text-gray-800">Kursus Saya</h3>
              <p className="text-sm text-gray-500 mt-1">Lihat dan kelola kursus</p>
            </button>
            <button onClick={() => router.push('/guru/materials')} className="group p-5 bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 rounded-xl text-left transition-all duration-300 border border-blue-100 hover:shadow-md">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-blue-200 transition-colors">
                <svg className="w-5 h-5 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </div>
              <h3 className="font-semibold text-gray-800">Kelola Materi</h3>
              <p className="text-sm text-gray-500 mt-1">Tambah dan edit materi</p>
            </button>
            <button onClick={() => router.push('/guru/students')} className="group p-5 bg-gradient-to-br from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 rounded-xl text-left transition-all duration-300 border border-purple-100 hover:shadow-md">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-purple-200 transition-colors">
                <svg className="w-5 h-5 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              </div>
              <h3 className="font-semibold text-gray-800">Lihat Siswa</h3>
              <p className="text-sm text-gray-500 mt-1">Pantau progres siswa</p>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
