'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { getBankSoal, getCourses, deleteBankSoal } from '@/lib/data';
import { BankSoal } from '@/types';

export default function AdminBankSoalPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [soal, setSoal] = useState<(BankSoal & { courseName: string })[]>([]);

  useEffect(() => {
    if (isLoading) return;
    if (!user || user.role !== 'admin') { router.push('/login'); return; }
    loadData();
  }, [user, isLoading, router]);

  const loadData = () => {
    const courses = getCourses();
    const data = getBankSoal().map(b => ({
      ...b,
      courseName: courses.find(c => c.id === b.courseId)?.title || '-',
    }));
    setSoal(data);
  };

  const handleDelete = (id: string) => {
    if (confirm('Hapus soal ini?')) { deleteBankSoal(id); loadData(); }
  };

  if (isLoading || !user) return null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">Bank Soal</h2>
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-primary-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-primary-800">Pertanyaan</th>
                <th className="px-4 py-3 text-left font-medium text-primary-800">Kursus</th>
                <th className="px-4 py-3 text-left font-medium text-primary-800">Kategori</th>
                <th className="px-4 py-3 text-left font-medium text-primary-800">Kesulitan</th>
                <th className="px-4 py-3 text-left font-medium text-primary-800">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {soal.map(s => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 max-w-xs truncate">{s.question}</td>
                  <td className="px-4 py-3 text-gray-600">{s.courseName}</td>
                  <td className="px-4 py-3 text-gray-600">{s.category}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-1 rounded text-xs font-medium ${s.difficulty === 'mudah' ? 'bg-primary-100 text-primary-700' : s.difficulty === 'sedang' ? 'bg-yellow-100 text-yellow-700' : 'bg-accent-100 text-accent-700'}`}>{s.difficulty}</span></td>
                  <td className="px-4 py-3"><button onClick={() => handleDelete(s.id)} className="text-accent-600 hover:text-accent-800 text-xs font-medium">Hapus</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
