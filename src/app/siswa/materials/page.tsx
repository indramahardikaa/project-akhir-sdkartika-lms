'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import { getEnrollmentsBySiswa, getCourses, getMaterialsByCourse, updateEnrollmentProgress } from '@/lib/data';
import { Course, Material } from '@/types';

interface CourseWithMaterials {
  course: Course;
  materials: Material[];
  progress: number;
}

export default function SiswaMaterialsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [coursesWithMaterials, setCoursesWithMaterials] = useState<CourseWithMaterials[]>([]);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);

  useEffect(() => {
    if (isLoading) return;
    if (!user || user.role !== 'siswa') { router.push('/login'); return; }
    loadData();
  }, [user, isLoading, router]);

  const loadData = () => {
    if (!user) return;
    const enrollments = getEnrollmentsBySiswa(user.id);
    const allCourses = getCourses();

    const data: CourseWithMaterials[] = enrollments.map(e => {
      const course = allCourses.find(c => c.id === e.courseId);
      if (!course) return null;
      const materials = getMaterialsByCourse(course.id);
      return { course, materials, progress: e.progress };
    }).filter(Boolean) as CourseWithMaterials[];

    setCoursesWithMaterials(data);
  };

  const handleOpenMaterial = (material: Material, courseId: string) => {
    setSelectedMaterial(material);
    // Simulate progress update
    if (user) {
      const courseData = coursesWithMaterials.find(c => c.course.id === courseId);
      if (courseData && courseData.progress < 100) {
        const increment = Math.min(100, courseData.progress + Math.round(100 / Math.max(courseData.materials.length, 1)));
        updateEnrollmentProgress(user.id, courseId, increment);
        loadData();
      }
    }
  };

  if (isLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Materi Pembelajaran</h1>
          <p className="text-gray-600 mt-1">Akses materi dari kursus yang Anda ikuti</p>
        </div>

        {coursesWithMaterials.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
            <p className="text-gray-500 mb-4">Belum ada materi. Daftar kursus terlebih dahulu.</p>
            <button onClick={() => router.push('/siswa/courses')} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
              Jelajahi Kursus
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {coursesWithMaterials.map(({ course, materials, progress }) => (
              <div key={course.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">{course.title}</h2>
                      <p className="text-sm text-gray-500 mt-1">Guru: {course.guruName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Progres</p>
                      <p className="text-lg font-bold text-green-600">{progress}%</p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                    <div className="bg-green-500 h-2 rounded-full transition-all" style={{ width: `${progress}%` }}></div>
                  </div>
                </div>

                <div className="p-6">
                  {materials.length === 0 ? (
                    <p className="text-gray-500 text-sm">Belum ada materi untuk kursus ini.</p>
                  ) : (
                    <div className="space-y-3">
                      {materials.map((m) => (
                        <button
                          key={m.id}
                          onClick={() => handleOpenMaterial(m, course.id)}
                          className="w-full flex items-center p-4 bg-gray-50 hover:bg-indigo-50 rounded-lg text-left transition-colors group"
                        >
                          <div className="p-2 bg-white rounded-lg shadow-sm group-hover:bg-indigo-100 transition-colors">
                            {m.type === 'text' && <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
                            {m.type === 'video' && <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                            {m.type === 'document' && <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>}
                          </div>
                          <div className="ml-4 flex-1">
                            <h4 className="font-medium text-gray-900">{m.title}</h4>
                            <p className="text-xs text-gray-500 mt-0.5 capitalize">{m.type}</p>
                          </div>
                          <svg className="w-5 h-5 text-gray-400 group-hover:text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Material Viewer Modal */}
        {selectedMaterial && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-2xl max-h-[85vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center rounded-t-xl">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedMaterial.title}</h2>
                  <span className="text-xs text-gray-500 capitalize">{selectedMaterial.type}</span>
                </div>
                <button onClick={() => setSelectedMaterial(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="p-6">
                {selectedMaterial.type === 'video' && selectedMaterial.url && (
                  <div className="mb-4 bg-gray-100 rounded-lg p-4 text-center">
                    <a href={selectedMaterial.url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                      Buka Video
                    </a>
                  </div>
                )}
                {selectedMaterial.type === 'document' && selectedMaterial.url && (
                  <div className="mb-4 bg-gray-100 rounded-lg p-4 text-center">
                    <a href={selectedMaterial.url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                      Download Dokumen
                    </a>
                  </div>
                )}
                <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {selectedMaterial.content}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
