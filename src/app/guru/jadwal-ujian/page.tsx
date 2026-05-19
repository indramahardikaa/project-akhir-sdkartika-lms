'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { getExamsByGuru, getCoursesByGuru, getBankSoal, createExam, deleteExam } from '@/lib/data';
import { Exam } from '@/types';

export default function GuruJadwalUjianPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [exams, setExams] = useState<(Exam & { courseName: string })[]>([]);
  const [courses, setCourses] = useState<{ id: string; title: string }[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', courseId: '', type: 'UH' as 'UH' | 'UTS' | 'UAS', duration: 60, startTime: '', endTime: '', token: '' });

  useEffect(() => {
    if (isLoading) return;
    if (!user || user.role !== 'guru') { router.push('/login'); return; }
    loadData();
  }, [user, isLoading, router]);

  const loadData = () => {
    if (!user) return;
    const c = getCoursesByGuru(user.id);
    setCourses(c.map(x => ({ id: x.id, title: x.title })));
    setExams(getExamsByGuru(user.id).map(e => ({ ...e, courseName: c.find(x => x.id === e.courseId)?.title || '-' })));
  };

  const handleCreate = () => {
    if (!form.title || !form.courseId || !user) return;
    const questions = getBankSoal().filter(b => b.courseId === form.courseId).map(b => b.id);
    createExam({ title: form.title, courseId: form.courseId, guruId: user.id, type: form.type, duration: form.duration, questions, startTime: form.startTime || new Date().toISOString(), endTime: form.endTime || new Date().toISOString(), token: form.token || Math.random().toString(36).substring(2, 8).toUpperCase() });
    loadData();
    setForm({ title: '', courseId: '', type: 'UH', duration: 60, startTime: '', endTime: '', token: '' });
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Hapus ujian?')) { deleteExam(id); loadData(); }
  };

  if (isLoading || !user) return null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Jadwal Ujian</h2>
          <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium">+ Buat Ujian</button>
        </div>
        {showForm && (
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input placeholder="Judul Ujian" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="border rounded-lg px-3 py-2 text-sm" />
              <select value={form.courseId} onChange={e => setForm({...form, courseId: e.target.value})} className="border rounded-lg px-3 py-2 text-sm">
                <option value="">Pilih Kursus</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
              <select value={form.type} onChange={e => setForm({...form, type: e.target.value as 'UH' | 'UTS' | 'UAS'})} className="border rounded-lg px-3 py-2 text-sm">
                <option value="UH">UH</option>
                <option value="UTS">UTS</option>
                <option value="UAS">UAS</option>
              </select>
              <input type="number" placeholder="Durasi (menit)" value={form.duration} onChange={e => setForm({...form, duration: parseInt(e.target.value) || 60})} className="border rounded-lg px-3 py-2 text-sm" />
              <input type="datetime-local" placeholder="Mulai" value={form.startTime} onChange={e => setForm({...form, startTime: e.target.value})} className="border rounded-lg px-3 py-2 text-sm" />
              <input placeholder="Token (opsional)" value={form.token} onChange={e => setForm({...form, token: e.target.value})} className="border rounded-lg px-3 py-2 text-sm" />
            </div>
            <button onClick={handleCreate} className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm">Simpan</button>
          </div>
        )}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-primary-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-primary-800">Ujian</th>
                <th className="px-4 py-3 text-left font-medium text-primary-800">Kursus</th>
                <th className="px-4 py-3 text-left font-medium text-primary-800">Tipe</th>
                <th className="px-4 py-3 text-left font-medium text-primary-800">Durasi</th>
                <th className="px-4 py-3 text-left font-medium text-primary-800">Token</th>
                <th className="px-4 py-3 text-left font-medium text-primary-800">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {exams.map(e => (
                <tr key={e.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{e.title}</td>
                  <td className="px-4 py-3 text-gray-600">{e.courseName}</td>
                  <td className="px-4 py-3"><span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">{e.type}</span></td>
                  <td className="px-4 py-3 text-gray-600">{e.duration} menit</td>
                  <td className="px-4 py-3"><code className="bg-gray-100 px-2 py-1 rounded text-xs">{e.token}</code></td>
                  <td className="px-4 py-3"><button onClick={() => handleDelete(e.id)} className="text-accent-600 text-xs font-medium">Hapus</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
