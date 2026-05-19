'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { getUsers, getCourses, getBankSoal, getExamResults, getAnnouncements, getActivityLogs, getKelas } from '@/lib/data';

export default function AdminDashboard() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({ siswa: 0, kelas: 0, soal: 0, nilai: 0 });
  const [announcements, setAnnouncements] = useState<{ title: string; createdAt: string }[]>([]);
  const [logs, setLogs] = useState<{ userName: string; action: string; createdAt: string }[]>([]);

  useEffect(() => {
    if (isLoading) return;
    if (!user || user.role !== 'admin') { router.push('/login'); return; }
    const users = getUsers();
    setStats({
      siswa: users.filter(u => u.role === 'siswa').length,
      kelas: getKelas().length,
      soal: getBankSoal().length,
      nilai: getExamResults().length,
    });
    setAnnouncements(getAnnouncements().slice(-3).reverse());
    setLogs(getActivityLogs().slice(-5).reverse());
  }, [user, isLoading, router]);

  if (isLoading || !user) return null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-xl p-6 text-white">
          <h2 className="text-2xl font-bold">Selamat Datang, {user.name}!</h2>
          <p className="text-primary-100 mt-1">Panel Administrator - SD Kartika X-2 LMS</p>
        </div>


        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-primary-50 border border-primary-200 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-primary-600 font-medium">Jumlah Siswa</p>
                <p className="text-3xl font-bold text-primary-800">{stats.siswa}</p>
              </div>
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </div>
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Jumlah Kelas</p>
                <p className="text-3xl font-bold text-blue-800">{stats.kelas}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
              </div>
            </div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600 font-medium">Bank Soal</p>
                <p className="text-3xl font-bold text-yellow-800">{stats.soal}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </div>
            </div>
          </div>
          <div className="bg-accent-50 border border-accent-200 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-accent-600 font-medium">Hasil Ujian</p>
                <p className="text-3xl font-bold text-accent-800">{stats.nilai}</p>
              </div>
              <div className="w-12 h-12 bg-accent-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Pengumuman</h3>
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
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Log Aktifitas</h3>
            <div className="space-y-3">
              {logs.map((l, i) => (
                <div key={i} className="flex items-start space-x-3 p-2">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm text-gray-800"><span className="font-medium">{l.userName}</span> - {l.action}</p>
                    <p className="text-xs text-gray-500">{new Date(l.createdAt).toLocaleDateString('id-ID')}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
