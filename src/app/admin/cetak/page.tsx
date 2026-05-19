'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';

export default function AdminCetakPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!user || user.role !== 'admin') { router.push('/login'); return; }
  }, [user, isLoading, router]);

  if (isLoading || !user) return null;

  const reports = [
    { title: 'Daftar Hadir', desc: 'Cetak rekap absensi siswa per kelas', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
    { title: 'Berita Acara', desc: 'Cetak berita acara ujian', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { title: 'Nilai', desc: 'Cetak rapor nilai siswa', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">Cetak Laporan</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {reports.map((r, i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow cursor-pointer">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={r.icon} />
                </svg>
              </div>
              <h3 className="font-bold text-gray-800">{r.title}</h3>
              <p className="text-sm text-gray-500 mt-1">{r.desc}</p>
              <button onClick={() => window.print()} className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg text-xs font-medium hover:bg-primary-700">
                Cetak
              </button>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
