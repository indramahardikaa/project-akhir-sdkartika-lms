'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { getForumTasks, getCourses, getSubmissionsByTask } from '@/lib/data';

export default function AdminForumTugasPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [tasks, setTasks] = useState<{ id: string; title: string; courseName: string; deadline: string; submissions: number }[]>([]);

  useEffect(() => {
    if (isLoading) return;
    if (!user || user.role !== 'admin') { router.push('/login'); return; }
    const courses = getCourses();
    const data = getForumTasks().map(t => ({
      id: t.id,
      title: t.title,
      courseName: courses.find(c => c.id === t.courseId)?.title || '-',
      deadline: t.deadline,
      submissions: getSubmissionsByTask(t.id).length,
    }));
    setTasks(data);
  }, [user, isLoading, router]);

  if (isLoading || !user) return null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">Forum Tugas</h2>
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-primary-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-primary-800">Tugas</th>
                <th className="px-4 py-3 text-left font-medium text-primary-800">Kursus</th>
                <th className="px-4 py-3 text-left font-medium text-primary-800">Deadline</th>
                <th className="px-4 py-3 text-left font-medium text-primary-800">Pengumpulan</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {tasks.map(t => (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{t.title}</td>
                  <td className="px-4 py-3 text-gray-600">{t.courseName}</td>
                  <td className="px-4 py-3 text-gray-600">{new Date(t.deadline).toLocaleDateString('id-ID')}</td>
                  <td className="px-4 py-3"><span className="bg-primary-100 text-primary-700 px-2 py-1 rounded text-xs font-medium">{t.submissions} siswa</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
