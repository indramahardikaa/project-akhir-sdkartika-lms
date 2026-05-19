'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { getKelas, getUsers, getCourses, getExams, getExamResults } from '@/lib/data';
import { Kelas, Course } from '@/types';

export default function AdminNilaiPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [kelasList, setKelasList] = useState<Kelas[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedKelas, setSelectedKelas] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [grades, setGrades] = useState<{name: string; score: number}[]>([]);

  useEffect(() => {
    if (isLoading) return;
    if (!user || user.role !== 'admin') { router.push('/login'); return; }
    setKelasList(getKelas());
    setCourses(getCourses());
  }, [user, isLoading, router]);

  useEffect(() => {
    if (!selectedKelas || !selectedCourse) { setGrades([]); return; }
    const kelas = kelasList.find(k => k.id === selectedKelas);
    if (!kelas) return;
    const students = getUsers().filter(u => u.role === 'siswa' && u.kelas === kelas.name);
    const exams = getExams().filter(e => e.courseId === selectedCourse);
    const results = getExamResults();
    const data = students.map(s => {
      const studentResults = results.filter(r => r.siswaId === s.id && exams.some(e => e.id === r.examId));
      const avg = studentResults.length > 0 ? Math.round(studentResults.reduce((a, r) => a + r.score, 0) / studentResults.length) : 0;
      return { name: s.name, score: avg };
    });
    setGrades(data);
  }, [selectedKelas, selectedCourse, kelasList]);

  if (isLoading || !user) return null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">Data Nilai</h2>
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <select value={selectedKelas} onChange={e => setSelectedKelas(e.target.value)} className="border rounded-lg px-3 py-2 text-sm">
              <option value="">Pilih Kelas</option>
              {kelasList.map(k => <option key={k.id} value={k.id}>{k.name}</option>)}
            </select>
            <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)} className="border rounded-lg px-3 py-2 text-sm">
              <option value="">Pilih Mata Pelajaran</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </div>
          {grades.length > 0 && (
            <table className="w-full text-sm">
              <thead className="bg-primary-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-primary-800">No</th>
                  <th className="px-4 py-3 text-left font-medium text-primary-800">Nama Siswa</th>
                  <th className="px-4 py-3 text-center font-medium text-primary-800">Nilai</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {grades.map((g, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-4 py-3">{i+1}</td>
                    <td className="px-4 py-3">{g.name}</td>
                    <td className="px-4 py-3 text-center font-bold">{g.score || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
