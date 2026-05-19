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
    return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Materi Pembelajaran</h1>
          <p className="text-gray-500 mt-1">Akses materi dari kursus yang Anda ikuti</p>
        </div>

        {coursesWithMaterials.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
            <p className="text-gray-500 mb-4">Belum ada materi. Daftar kursus terlebih dahulu.</p>
            <button onClick={() => router.push('/siswa/courses')} className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm">
              Jelajahi Kursus
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {coursesWithMaterials.map(({ course, materials, progress }) => (
              <div key={course.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300">
                <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{course.title}</h2>
                      <p className="text-sm text-gray-500 mt-1">Guru: {course.guruName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Progres</p>
                      <p className={`text-2xl font-bold ${progress >= 75 ? 'text-primary-600' : progress >= 40 ? 'text-amber-600' : 'text-accent-600'}`}>{progress}%</p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5 mt-4">
                    <div className={`h-2.5 rounded-full transition-all ${progress >= 75 ? 'bg-gradient-to-r from-primary-400 to-primary-600' : progress >= 40 ? 'bg-gradient-to-r from-amber-400 to-amber-600' : 'bg-gradient-to-r from-accent-400 to-accent-600'}`} style={{ width: `${progress}%` }}></div>
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
                          className="w-full flex items-center p-4 bg-gray-50 hover:bg-primary-50 rounded-xl text-left transition-all duration-200 group border border-transparent hover:border-primary-100"
                        >
                          <div className="p-2.5 bg-white rounded-xl shadow-sm group-hover:bg-primary-100 transition-colors">
                            {m.type === 'text' && <svg className="w-5 h-5 text-gray-500 group-hover:text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
                            {m.type === 'video' && <svg className="w-5 h-5 text-gray-500 group-hover:text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                            {m.type === 'document' && <svg className="w-5 h-5 text-gray-500 group-hover:text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>}
                          </div>
                          <div className="ml-4 flex-1">
                            <h4 className="font-semibold text-gray-900 group-hover:text-primary-700">{m.title}</h4>
                            <p className="text-xs text-gray-500 mt-0.5 capitalize">{m.type}</p>
                          </div>
                          <svg className="w-5 h-5 text-gray-300 group-hover:text-primary-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
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
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl animate-fade-in">
              <div className="sticky top-0 bg-white border-b border-gray-100 p-5 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedMaterial.title}</h2>
                  <span className="text-xs text-gray-500 capitalize bg-gray-100 px-2 py-0.5 rounded mt-1 inline-block">{selectedMaterial.type}</span>
                </div>
                <button onClick={() => setSelectedMaterial(null)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="p-6 overflow-y-auto max-h-[calc(85vh-80px)]">
                {selectedMaterial.type === 'video' && selectedMaterial.url && (
                  <div className="mb-4 bg-primary-50 rounded-xl p-4 text-center border border-primary-100">
                    <a href={selectedMaterial.url} target="_blank" rel="noopener noreferrer" className="text-primary-700 hover:text-primary-800 font-semibold flex items-center justify-center space-x-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /></svg>
                      <span>Buka Video</span>
                    </a>
                  </div>
                )}
                {selectedMaterial.type === 'document' && selectedMaterial.url && (
                  <div className="mb-4 bg-blue-50 rounded-xl p-4 text-center border border-blue-100">
                    <a href={selectedMaterial.url} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:text-blue-800 font-semibold flex items-center justify-center space-x-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                      <span>Download Dokumen</span>
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
