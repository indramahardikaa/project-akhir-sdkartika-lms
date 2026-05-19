'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import { getUsers, getCourses, getMaterials, getEnrollments } from '@/lib/data';

export default function AdminDashboard() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({ users: 0, gurus: 0, siswa: 0, courses: 0, materials: 0, enrollments: 0 });

  useEffect(() => {
    if (isLoading) return;
    if (!user || user.role !== 'admin') { router.push('/login'); return; }

    const users = getUsers();
    setStats({
      users: users.length,
      gurus: users.filter((u) => u.role === 'guru').length,
      siswa: users.filter((u) => u.role === 'siswa').length,
      courses: getCourses().length,
      materials: getMaterials().length,
      enrollments: getEnrollments().length,
    });
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div></div>;
  }

  const statCards = [
    { label: 'Total Pengguna', value: stats.users, icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z', color: 'primary', bg: 'bg-primary-50', text: 'text-primary-700', iconBg: 'bg-primary-100' },
    { label: 'Guru Aktif', value: stats.gurus, icon: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z', color: 'blue', bg: 'bg-blue-50', text: 'text-blue-700', iconBg: 'bg-blue-100' },
    { label: 'Siswa Terdaftar', value: stats.siswa, icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253', color: 'emerald', bg: 'bg-emerald-50', text: 'text-emerald-700', iconBg: 'bg-emerald-100' },
    { label: 'Total Kursus', value: stats.courses, icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10', color: 'purple', bg: 'bg-purple-50', text: 'text-purple-700', iconBg: 'bg-purple-100' },
    { label: 'Materi Tersedia', value: stats.materials, icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', color: 'amber', bg: 'bg-amber-50', text: 'text-amber-700', iconBg: 'bg-amber-100' },
    { label: 'Pendaftaran Kursus', value: stats.enrollments, icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01', color: 'rose', bg: 'bg-rose-50', text: 'text-rose-700', iconBg: 'bg-rose-100' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 rounded-2xl p-8 mb-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-1/2 w-48 h-48 bg-accent-500/20 rounded-full translate-y-1/2"></div>
          <div className="relative z-10">
            <h1 className="text-3xl font-bold mb-2">Selamat Datang, {user.name}!</h1>
            <p className="text-primary-100 text-lg">Panel Administrator - Kelola seluruh sistem LMS dari sini.</p>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-accent-400 via-white to-primary-300"></div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
          {statCards.map((card, index) => (
            <div key={index} className={`${card.bg} rounded-xl p-6 border border-gray-100 hover:shadow-md transition-all duration-300 animate-fade-in`} style={{ animationDelay: `${index * 100}ms` }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{card.label}</p>
                  <p className={`text-3xl font-bold ${card.text} mt-1`}>{card.value}</p>
                </div>
                <div className={`${card.iconBg} p-3 rounded-xl`}>
                  <svg className={`w-7 h-7 ${card.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={card.icon} />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-5 flex items-center space-x-2">
            <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            <span>Aksi Cepat</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button onClick={() => router.push('/admin/users')} className="group p-5 bg-gradient-to-br from-primary-50 to-green-50 hover:from-primary-100 hover:to-green-100 rounded-xl text-left transition-all duration-300 border border-primary-100 hover:shadow-md">
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-primary-200 transition-colors">
                <svg className="w-5 h-5 text-primary-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              </div>
              <h3 className="font-semibold text-gray-800">Kelola Pengguna</h3>
              <p className="text-sm text-gray-500 mt-1">Tambah, edit, hapus pengguna</p>
            </button>
            <button onClick={() => router.push('/admin/courses')} className="group p-5 bg-gradient-to-br from-purple-50 to-indigo-50 hover:from-purple-100 hover:to-indigo-100 rounded-xl text-left transition-all duration-300 border border-purple-100 hover:shadow-md">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-purple-200 transition-colors">
                <svg className="w-5 h-5 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
              </div>
              <h3 className="font-semibold text-gray-800">Kelola Kursus</h3>
              <p className="text-sm text-gray-500 mt-1">Atur kursus dan kategori</p>
            </button>
            <button onClick={() => router.push('/admin/materials')} className="group p-5 bg-gradient-to-br from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 rounded-xl text-left transition-all duration-300 border border-amber-100 hover:shadow-md">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-amber-200 transition-colors">
                <svg className="w-5 h-5 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </div>
              <h3 className="font-semibold text-gray-800">Kelola Materi</h3>
              <p className="text-sm text-gray-500 mt-1">Atur materi pembelajaran</p>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
