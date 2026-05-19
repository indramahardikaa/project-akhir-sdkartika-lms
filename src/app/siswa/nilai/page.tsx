'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { getExamResultsBySiswa, getExams } from '@/lib/data';

export default function SiswaNilaiPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [results, setResults] = useState<{ id: string; examTitle: string; type: string; score: number; submittedAt: string }[]>([]);

  useEffect(() => {
    if (isLoading) return;
    if (!user || user.role !== 'siswa') { router.push('/login'); return; }
    const exams = getExams();
    setResults(getExamResultsBySiswa(user.id).map(r => {
      const exam = exams.find(e => e.id === r.examId);
      return { id: r.id, examTitle: exam?.title || '-', type: exam?.type || '-', score: r.score, submittedAt: r.submittedAt };
    }));
  }, [user, isLoading, router]);

  if (isLoading || !user) return null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">Nilai Saya</h2>
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-primary-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-primary-800">Ujian</th>
                <th className="px-4 py-3 text-left font-medium text-primary-800">Tipe</th>
                <th className="px-4 py-3 text-left font-medium text-primary-800">Nilai</th>
                <th className="px-4 py-3 text-left font-medium text-primary-800">Tanggal</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {results.map(r => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{r.examTitle}</td>
                  <td className="px-4 py-3"><span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">{r.type}</span></td>
                  <td className="px-4 py-3"><span className={`px-2 py-1 rounded text-xs font-bold ${r.score >= 75 ? 'bg-primary-100 text-primary-700' : 'bg-accent-100 text-accent-700'}`}>{r.score}</span></td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{new Date(r.submittedAt).toLocaleDateString('id-ID')}</td>
                </tr>
              ))}
              {results.length === 0 && <tr><td colSpan={4} className="px-4 py-3 text-gray-500">Belum ada hasil ujian</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
