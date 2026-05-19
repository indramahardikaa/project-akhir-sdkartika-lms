'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { getEnrollmentsBySiswa, getCourses, getMaterialsByCourse } from '@/lib/data';
import { Course, Material } from '@/types';

export default function SiswaMaterialsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [courseMaterials, setCourseMaterials] = useState<{course: Course; materials: Material[]}[]>([]);
  const [viewedIds, setViewedIds] = useState<string[]>([]);

  useEffect(() => {
    if (isLoading) return;
    if (!user || user.role !== 'siswa') { router.push('/login'); return; }
    const enrollments = getEnrollmentsBySiswa(user.id);
    const courses = getCourses();
    const data = enrollments.map(e => {
      const course = courses.find(c => c.id === e.courseId);
      if (!course) return null;
      return { course, materials: getMaterialsByCourse(course.id) };
    }).filter(Boolean) as {course: Course; materials: Material[]}[];
    setCourseMaterials(data);
    const stored = localStorage.getItem('lms_viewed_materials');
    if (stored) setViewedIds(JSON.parse(stored));
  }, [user, isLoading, router]);

  const markAsViewed = (materialId: string) => {
    const newViewed = [...new Set([...viewedIds, materialId])];
    setViewedIds(newViewed);
    localStorage.setItem('lms_viewed_materials', JSON.stringify(newViewed));
  };

  if (isLoading || !user) return null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">Materi Pembelajaran</h2>
        {courseMaterials.map(({course, materials}) => (
          <div key={course.id} className="bg-white rounded-xl p-6 shadow-sm border">
            <h3 className="text-lg font-bold text-primary-800 mb-4">{course.title}</h3>
            <div className="space-y-3">
              {materials.map(m => (
                <div key={m.id} className={`p-4 rounded-lg border ${viewedIds.includes(m.id) ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-800">{m.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{m.content}</p>
                      <p className="text-xs text-gray-400 mt-1">{new Date(m.createdAt).toLocaleDateString('id-ID')}</p>
                    </div>
                    {viewedIds.includes(m.id) ? (
                      <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">Sudah dibaca</span>
                    ) : (
                      <button onClick={() => markAsViewed(m.id)} className="text-xs px-3 py-1 bg-primary-600 text-white rounded hover:bg-primary-700">Baca</button>
                    )}
                  </div>
                </div>
              ))}
              {materials.length === 0 && <p className="text-sm text-gray-500">Belum ada materi</p>}
            </div>
          </div>
        ))}
        {courseMaterials.length === 0 && <p className="text-sm text-gray-500">Belum ada mata pelajaran yang diikuti</p>}
      </div>
    </DashboardLayout>
  );
}
