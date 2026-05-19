'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { getForumTasks, getCourses, getCourseIdsForSiswa, getSubmissionsBySiswa, createTaskSubmission } from '@/lib/data';
import { ForumTask, TaskSubmission } from '@/types';

export default function SiswaForumTugasPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [tasks, setTasks] = useState<(ForumTask & { courseName: string; submitted: boolean; grade?: number })[]>([]);
  const [submitForm, setSubmitForm] = useState<{ taskId: string; content: string } | null>(null);

  useEffect(() => {
    if (isLoading) return;
    if (!user || user.role !== 'siswa') { router.push('/login'); return; }
    loadData();
  }, [user, isLoading, router]);

  const loadData = () => {
    if (!user) return;
    const courses = getCourses();
    const accessibleCourseIds = getCourseIdsForSiswa(user.id);
    const submissions = getSubmissionsBySiswa(user.id);
    const allTasks = getForumTasks().filter(t => accessibleCourseIds.includes(t.courseId));
    setTasks(allTasks.map(t => {
      const sub = submissions.find(s => s.taskId === t.id);
      return { ...t, courseName: courses.find(c => c.id === t.courseId)?.title || '-', submitted: !!sub, grade: sub?.grade };
    }));
  };

  const handleSubmit = () => {
    if (!submitForm || !submitForm.content || !user) return;
    createTaskSubmission({ taskId: submitForm.taskId, siswaId: user.id, siswaName: user.name, content: submitForm.content });
    setSubmitForm(null);
    loadData();
  };

  if (isLoading || !user) return null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">Forum Tugas</h2>
        <div className="space-y-4">
          {tasks.map(t => (
            <div key={t.id} className="bg-white rounded-xl p-5 shadow-sm border">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-gray-800">{t.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{t.description}</p>
                  <div className="flex items-center space-x-3 mt-2">
                    <span className="text-xs text-gray-400">{t.courseName}</span>
                    <span className="text-xs text-gray-400">Deadline: {new Date(t.deadline).toLocaleDateString('id-ID')}</span>
                  </div>
                </div>
                <div className="text-right">
                  {t.submitted ? (
                    <div>
                      <span className="bg-primary-100 text-primary-700 px-2 py-1 rounded text-xs font-medium">Sudah dikumpulkan</span>
                      {t.grade !== undefined && <p className="text-sm font-bold text-primary-700 mt-1">Nilai: {t.grade}</p>}
                    </div>
                  ) : (
                    <button onClick={() => setSubmitForm({ taskId: t.id, content: '' })} className="px-3 py-1.5 bg-primary-600 text-white rounded-lg text-xs font-medium hover:bg-primary-700">Kumpulkan</button>
                  )}
                </div>
              </div>
            </div>
          ))}
          {tasks.length === 0 && <p className="text-sm text-gray-500">Belum ada tugas</p>}
        </div>
        {submitForm && (
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <h3 className="font-bold text-gray-800 mb-4">Kumpulkan Tugas</h3>
            <textarea placeholder="Jawaban Anda..." value={submitForm.content} onChange={e => setSubmitForm({...submitForm, content: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm h-24" />
            <div className="mt-4 space-x-2">
              <button onClick={handleSubmit} className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm">Kirim</button>
              <button onClick={() => setSubmitForm(null)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm">Batal</button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
