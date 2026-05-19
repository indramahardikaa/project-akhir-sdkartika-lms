'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { getExamResults, getExams } from '@/lib/data';

export default function AdminNilaiPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [results, setResults] = useState<{ id: string; siswaName: string; examTitle: string; score: number; submittedAt: string }[]>([]);

  useEffect(() => {
    if (isLoading) return;
    if (!user || user.role !== 'admin') { router.push('/login'); return; }
    const exams = getExams();
    const data = getExamResults().map(r => ({
      id: r.id,
      siswaName: r.siswaName,
      examTitle: exams.find(e => e.id === r.examId)?.title || '-',
      score: r.score,
      submittedAt: r.submittedAt,
    }));
    setResults(data);
  }, [user, isLoading, router]);

  if (isLoading || !user) return null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">Nilai Siswa</h2>
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-primary-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-primary-800">Siswa</th>
                <th className="px-4 py-3 text-left font-medium text-primary-800">Ujian</th>
                <th className="px-4 py-3 text-left font-medium text-primary-800">Nilai</th>
                <th className="px-4 py-3 text-left font-medium text-primary-800">Tanggal</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {results.map(r => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{r.siswaName}</td>
                  <td className="px-4 py-3 text-gray-600">{r.examTitle}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-1 rounded text-xs font-bold ${r.score >= 75 ? 'bg-primary-100 text-primary-700' : 'bg-accent-100 text-accent-700'}`}>{r.score}</span></td>
                  <td className="px-4 py-3 text-gray-600">{new Date(r.submittedAt).toLocaleDateString('id-ID')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
