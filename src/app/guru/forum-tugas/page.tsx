'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { getForumTasksByGuru, getCoursesByGuru, createForumTask, getSubmissionsByTask, gradeSubmission } from '@/lib/data';
import { ForumTask, TaskSubmission } from '@/types';

export default function GuruForumTugasPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [tasks, setTasks] = useState<(ForumTask & { courseName: string })[]>([]);
  const [courses, setCourses] = useState<{ id: string; title: string }[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', courseId: '', deadline: '' });
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [submissions, setSubmissions] = useState<TaskSubmission[]>([]);

  useEffect(() => {
    if (isLoading) return;
    if (!user || user.role !== 'guru') { router.push('/login'); return; }
    loadData();
  }, [user, isLoading, router]);

  const loadData = () => {
    if (!user) return;
    const c = getCoursesByGuru(user.id);
    setCourses(c.map(x => ({ id: x.id, title: x.title })));
    setTasks(getForumTasksByGuru(user.id).map(t => ({ ...t, courseName: c.find(x => x.id === t.courseId)?.title || '-' })));
  };

  const handleCreate = () => {
    if (!form.title || !form.courseId || !user) return;
    createForumTask({ title: form.title, description: form.description, courseId: form.courseId, guruId: user.id, deadline: form.deadline || new Date().toISOString() });
    loadData();
    setForm({ title: '', description: '', courseId: '', deadline: '' });
    setShowForm(false);
  };

  const handleViewSubmissions = (taskId: string) => {
    setSelectedTask(taskId);
    setSubmissions(getSubmissionsByTask(taskId));
  };

  const handleGrade = (subId: string, grade: number) => {
    gradeSubmission(subId, grade);
    if (selectedTask) setSubmissions(getSubmissionsByTask(selectedTask));
  };

  if (isLoading || !user) return null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Forum Tugas</h2>
          <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium">+ Buat Tugas</button>
        </div>
        {showForm && (
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input placeholder="Judul Tugas" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="border rounded-lg px-3 py-2 text-sm" />
              <select value={form.courseId} onChange={e => setForm({...form, courseId: e.target.value})} className="border rounded-lg px-3 py-2 text-sm">
                <option value="">Pilih Kursus</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
              <input type="datetime-local" value={form.deadline} onChange={e => setForm({...form, deadline: e.target.value})} className="border rounded-lg px-3 py-2 text-sm" />
              <textarea placeholder="Deskripsi" value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="border rounded-lg px-3 py-2 text-sm" />
            </div>
            <button onClick={handleCreate} className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm">Simpan</button>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tasks.map(t => (
            <div key={t.id} className="bg-white rounded-xl p-5 shadow-sm border">
              <h3 className="font-bold text-gray-800">{t.title}</h3>
              <p className="text-sm text-gray-500 mt-1">{t.courseName}</p>
              <p className="text-xs text-gray-400 mt-1">Deadline: {new Date(t.deadline).toLocaleDateString('id-ID')}</p>
              <button onClick={() => handleViewSubmissions(t.id)} className="mt-3 text-sm text-primary-600 font-medium hover:underline">Lihat Pengumpulan</button>
            </div>
          ))}
        </div>
        {selectedTask && (
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <h3 className="font-bold text-gray-800 mb-4">Pengumpulan Tugas</h3>
            <table className="w-full text-sm">
              <thead className="bg-primary-50">
                <tr>
                  <th className="px-4 py-2 text-left">Siswa</th>
                  <th className="px-4 py-2 text-left">Jawaban</th>
                  <th className="px-4 py-2 text-left">Nilai</th>
                  <th className="px-4 py-2 text-left">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {submissions.map(s => (
                  <tr key={s.id}>
                    <td className="px-4 py-2">{s.siswaName}</td>
                    <td className="px-4 py-2 text-gray-600 max-w-xs truncate">{s.content}</td>
                    <td className="px-4 py-2">{s.grade !== undefined ? <span className="font-bold text-primary-700">{s.grade}</span> : '-'}</td>
                    <td className="px-4 py-2">
                      <input type="number" min="0" max="100" placeholder="Nilai" className="border rounded px-2 py-1 w-16 text-sm" onBlur={e => { if (e.target.value) handleGrade(s.id, parseInt(e.target.value)); }} />
                    </td>
                  </tr>
                ))}
                {submissions.length === 0 && <tr><td colSpan={4} className="px-4 py-3 text-gray-500">Belum ada pengumpulan</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
