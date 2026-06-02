'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
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
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div></div>;
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Admin</h1>
        <p className="text-gray-500 text-sm mt-1">Selamat datang, {user.name}. Kelola seluruh sistem LMS dari sini.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Pengguna', value: stats.users, color: 'bg-green-100 text-green-700' },
          { label: 'Guru', value: stats.gurus, color: 'bg-blue-100 text-blue-700' },
          { label: 'Siswa', value: stats.siswa, color: 'bg-yellow-100 text-yellow-700' },
          { label: 'Mata Pelajaran', value: stats.courses, color: 'bg-purple-100 text-purple-700' },
          { label: 'Materi', value: stats.materials, color: 'bg-orange-100 text-orange-700' },
          { label: 'Enrollment', value: stats.enrollments, color: 'bg-pink-100 text-pink-700' },
        ].map((item) => (
          <div key={item.label} className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <p className="text-sm text-gray-500">{item.label}</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{item.value}</p>
            <div className={`inline-block mt-2 px-2 py-0.5 rounded text-xs font-medium ${item.color}`}>{item.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Aksi Cepat</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button onClick={() => router.push('/admin/students')} className="p-4 bg-green-50 hover:bg-green-100 rounded-lg text-left transition-colors border border-green-100">
            <h3 className="font-medium text-green-800">Manajemen Kelas</h3>
            <p className="text-sm text-green-600 mt-1">Kelola kelas dan data siswa</p>
          </button>
          <button onClick={() => router.push('/admin/courses')} className="p-4 bg-green-50 hover:bg-green-100 rounded-lg text-left transition-colors border border-green-100">
            <h3 className="font-medium text-green-800">Mata Pelajaran</h3>
            <p className="text-sm text-green-600 mt-1">Atur mata pelajaran</p>
          </button>
          <button onClick={() => router.push('/admin/announcements')} className="p-4 bg-green-50 hover:bg-green-100 rounded-lg text-left transition-colors border border-green-100">
            <h3 className="font-medium text-green-800">Pengumuman</h3>
            <p className="text-sm text-green-600 mt-1">Buat pengumuman baru</p>
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
