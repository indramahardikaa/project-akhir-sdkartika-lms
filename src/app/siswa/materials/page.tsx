'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { getMaterials, getCourses, getEnrollmentsBySiswa } from '@/lib/data';
import { Material } from '@/types';

export default function SiswaMaterialsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [materials, setMaterials] = useState<(Material & { courseName: string })[]>([]);

  useEffect(() => {
    if (isLoading) return;
    if (!user || user.role !== 'siswa') { router.push('/login'); return; }
    const courses = getCourses();
    const enrollments = getEnrollmentsBySiswa(user.id);
    const enrolledCourseIds = enrollments.map(e => e.courseId);
    setMaterials(getMaterials().filter(m => enrolledCourseIds.includes(m.courseId)).map(m => ({
      ...m, courseName: courses.find(c => c.id === m.courseId)?.title || '-',
    })));
  }, [user, isLoading, router]);

  if (isLoading || !user) return null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">Materi Pembelajaran</h2>
        <div className="space-y-4">
          {materials.map(m => (
            <div key={m.id} className="bg-white rounded-xl p-5 shadow-sm border">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">{m.title}</h3>
                  <p className="text-xs text-gray-400 mb-2">{m.courseName} | {m.type}</p>
                  <p className="text-sm text-gray-600">{m.content}</p>
                </div>
              </div>
            </div>
          ))}
          {materials.length === 0 && <p className="text-sm text-gray-500">Belum ada materi tersedia. Daftar kursus terlebih dahulu.</p>}
        </div>
      </div>
    </DashboardLayout>
  );
}
