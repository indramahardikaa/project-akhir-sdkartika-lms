'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import { getEnrollmentsBySiswa, getCourses, getMaterialsByCourse, getReadingProgressBySiswaAndCourse, markMaterialAsRead, hasCompletedAllMaterials, updateEnrollmentProgress } from '@/lib/data';
import { Course, Material, ReadingProgress } from '@/types';

interface CourseWithMaterials {
  course: Course;
  materials: Material[];
  progress: number;
  readMaterials: ReadingProgress[];
  allRead: boolean;
}

export default function SiswaMaterialsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [coursesWithMaterials, setCoursesWithMaterials] = useState<CourseWithMaterials[]>([]);
  const [readingMode, setReadingMode] = useState(false);
  const [currentCourse, setCurrentCourse] = useState<CourseWithMaterials | null>(null);
  const [currentMaterialIndex, setCurrentMaterialIndex] = useState(0);

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
      const readMaterials = getReadingProgressBySiswaAndCourse(user.id, course.id);
      const allRead = hasCompletedAllMaterials(user.id, course.id);
      return { course, materials, progress: e.progress, readMaterials, allRead };
    }).filter(Boolean) as CourseWithMaterials[];

    setCoursesWithMaterials(data);
  };

  const isMaterialRead = (materialId: string, readMaterials: ReadingProgress[]) => {
    return readMaterials.some(r => r.materialId === materialId && r.completed);
  };

  const startReading = (courseData: CourseWithMaterials, startIndex: number = 0) => {
    setCurrentCourse(courseData);
    setCurrentMaterialIndex(startIndex);
    setReadingMode(true);
  };

  const handleMarkAsRead = () => {
    if (!user || !currentCourse) return;
    const material = currentCourse.materials[currentMaterialIndex];
    markMaterialAsRead(user.id, material.id, currentCourse.course.id);
    // Update progress
    const totalMaterials = currentCourse.materials.length;
    const readCount = getReadingProgressBySiswaAndCourse(user.id, currentCourse.course.id).length;
    const newProgress = Math.round((readCount / totalMaterials) * 100);
    updateEnrollmentProgress(user.id, currentCourse.course.id, newProgress);
    loadData();
  };

  const handleNext = () => {
    handleMarkAsRead();
    if (currentCourse && currentMaterialIndex < currentCourse.materials.length - 1) {
      setCurrentMaterialIndex(currentMaterialIndex + 1);
    }
  };

  const handleExit = () => {
    handleMarkAsRead();
    setReadingMode(false);
    setCurrentCourse(null);
    setCurrentMaterialIndex(0);
  };

  if (isLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div></div>;
  }


  // Reading Mode - Full screen e-learning reader
  if (readingMode && currentCourse) {
    const material = currentCourse.materials[currentMaterialIndex];
    const isLast = currentMaterialIndex === currentCourse.materials.length - 1;
    const totalMaterials = currentCourse.materials.length;

    return (
      <div className="min-h-screen bg-white">
        {/* Top Bar */}
        <div className="sticky top-0 bg-white border-b shadow-sm z-10">
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={handleExit} className="p-2 hover:bg-gray-100 rounded-lg">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              <div>
                <h2 className="font-semibold text-gray-900 text-sm">{currentCourse.course.title}</h2>
                <p className="text-xs text-gray-500">Materi {currentMaterialIndex + 1} dari {totalMaterials}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full transition-all" style={{ width: `${((currentMaterialIndex + 1) / totalMaterials) * 100}%` }}></div>
              </div>
              <span className="text-xs text-gray-500">{Math.round(((currentMaterialIndex + 1) / totalMaterials) * 100)}%</span>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              {material.type === 'text' && <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">Teks</span>}
              {material.type === 'video' && <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">Video</span>}
              {material.type === 'document' && <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">Dokumen</span>}
              {material.type === 'rpp' && <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">RPP</span>}
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{material.title}</h1>
          </div>


          {/* Video Player */}
          {material.type === 'video' && material.videoUrl && (
            <div className="mb-6 bg-gray-900 rounded-xl overflow-hidden aspect-video flex items-center justify-center">
              <div className="text-center">
                <svg className="w-16 h-16 text-white mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <a href={material.videoUrl} target="_blank" rel="noopener noreferrer" className="inline-block bg-white text-gray-900 px-6 py-2 rounded-lg font-medium hover:bg-gray-100">
                  Tonton Video
                </a>
              </div>
            </div>
          )}

          {/* Document/File Download */}
          {(material.type === 'document' || material.type === 'rpp') && material.fileUrl && (
            <div className="mb-6 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
              <p className="text-gray-600 mb-3">{material.fileName || 'File Materi'}</p>
              <a href={material.fileUrl} target="_blank" rel="noopener noreferrer" className="inline-block bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700">
                Download File
              </a>
            </div>
          )}

          {/* Text Content */}
          <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap mb-12">
            {material.content}
          </div>

          {/* Navigation Buttons */}
          <div className="sticky bottom-0 bg-white border-t py-4 -mx-4 px-4">
            <div className="max-w-4xl mx-auto flex justify-between items-center">
              <button
                onClick={() => setCurrentMaterialIndex(Math.max(0, currentMaterialIndex - 1))}
                disabled={currentMaterialIndex === 0}
                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Sebelumnya
              </button>
              {isLast ? (
                <button onClick={handleExit} className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors">
                  Keluar
                </button>
              ) : (
                <button onClick={handleNext} className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors">
                  Selanjutnya
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }


  // Course List View
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">E-Learning</h1>
          <p className="text-gray-600 mt-1">Baca materi pembelajaran dari kursus yang Anda ikuti</p>
        </div>

        {coursesWithMaterials.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
            <p className="text-gray-500 mb-4">Belum ada materi. Daftar kursus terlebih dahulu.</p>
            <button onClick={() => router.push('/siswa/courses')} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
              Jelajahi Kursus
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {coursesWithMaterials.map(({ course, materials, progress, readMaterials, allRead }) => (
              <div key={course.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">{course.title}</h2>
                      <p className="text-sm text-gray-500 mt-1">Guru: {course.guruName} &bull; {materials.length} materi</p>
                    </div>
                    <div className="text-right">
                      {allRead ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                          Selesai
                        </span>
                      ) : (
                        <span className="text-sm text-gray-500">{progress}% selesai</span>
                      )}
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
                      {materials.map((m, idx) => {
                        const isRead = isMaterialRead(m.id, readMaterials);
                        return (
                          <button
                            key={m.id}
                            onClick={() => startReading({ course, materials, progress, readMaterials, allRead }, idx)}
                            className="w-full flex items-center p-4 bg-gray-50 hover:bg-green-50 rounded-lg text-left transition-colors group"
                          >
                            <div className={`p-2 rounded-lg shadow-sm transition-colors ${isRead ? 'bg-green-100' : 'bg-white group-hover:bg-green-100'}`}>
                              {m.type === 'text' && <svg className={`w-5 h-5 ${isRead ? 'text-green-600' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
                              {m.type === 'video' && <svg className={`w-5 h-5 ${isRead ? 'text-green-600' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                              {m.type === 'document' && <svg className={`w-5 h-5 ${isRead ? 'text-green-600' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>}
                              {m.type === 'rpp' && <svg className={`w-5 h-5 ${isRead ? 'text-green-600' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
                            </div>
                            <div className="ml-4 flex-1">
                              <h4 className="font-medium text-gray-900">{m.title}</h4>
                              <p className="text-xs text-gray-500 mt-0.5 capitalize">{m.type === 'rpp' ? 'RPP' : m.type}</p>
                            </div>
                            {isRead ? (
                              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            ) : (
                              <svg className="w-5 h-5 text-gray-400 group-hover:text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Bug Fix: Validation - quiz only available after all materials read */}
                  {!allRead && materials.length > 0 && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-700 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        Baca semua materi terlebih dahulu sebelum mengerjakan soal.
                      </p>
                    </div>
                  )}
                  {allRead && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-700 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        Semua materi sudah dibaca! Anda dapat mengerjakan soal e-learning.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
