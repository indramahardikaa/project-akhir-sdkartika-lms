'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { getCourseIdsForSiswa, getCourses, getMaterialsByCourse } from '@/lib/data';
import { Course, Material } from '@/types';

export default function SiswaMaterialsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [courseMaterials, setCourseMaterials] = useState<{course: Course; materials: Material[]}[]>([]);
  const [viewedIds, setViewedIds] = useState<string[]>([]);
  const [openMaterial, setOpenMaterial] = useState<Material | null>(null);

  useEffect(() => {
    if (isLoading) return;
    if (!user || user.role !== 'siswa') { router.push('/login'); return; }
    const accessibleCourseIds = getCourseIdsForSiswa(user.id);
    const courses = getCourses();
    const data = accessibleCourseIds.map(courseId => {
      const course = courses.find(c => c.id === courseId);
      if (!course) return null;
      return { course, materials: getMaterialsByCourse(course.id) };
    }).filter(Boolean) as {course: Course; materials: Material[]}[];
    setCourseMaterials(data);
    const stored = localStorage.getItem('lms_viewed_materials');
    if (stored) setViewedIds(JSON.parse(stored));
  }, [user, isLoading, router]);

  const markAsViewed = (material: Material) => {
    const newViewed = [...new Set([...viewedIds, material.id])];
    setViewedIds(newViewed);
    localStorage.setItem('lms_viewed_materials', JSON.stringify(newViewed));
    setOpenMaterial(material);
  };

  if (isLoading || !user) return null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Materi Pembelajaran</h2>
          <p className="text-sm text-gray-500 mt-1">Baca materi dari setiap mata pelajaran. Klik &quot;Baca Materi&quot; untuk membuka penjelasan lengkap.</p>
        </div>

        {courseMaterials.map(({course, materials}) => (
          <div key={course.id} className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-primary-800">{course.title}</h3>
                <p className="text-xs text-gray-500">Guru: {course.guruName} | {materials.length} materi</p>
              </div>
            </div>
            <div className="space-y-3">
              {materials.map(m => (
                <div key={m.id} className={`p-4 rounded-xl border transition-all ${viewedIds.includes(m.id) ? 'bg-primary-50 border-primary-200' : 'bg-gray-50 border-gray-200 hover:border-primary-300'}`}>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${viewedIds.includes(m.id) ? 'bg-primary-200' : 'bg-gray-200'}`}>
                        {viewedIds.includes(m.id) ? (
                          <svg className="w-4 h-4 text-primary-700" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                        ) : (
                          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-800">{m.title}</h4>
                        <p className="text-xs text-gray-400 mt-0.5">Diupdate: {new Date(m.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => markAsViewed(m)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${viewedIds.includes(m.id) ? 'bg-primary-100 text-primary-700 hover:bg-primary-200' : 'bg-primary-600 text-white hover:bg-primary-700 shadow-sm'}`}
                    >
                      {viewedIds.includes(m.id) ? 'Baca Lagi' : 'Baca Materi'}
                    </button>
                  </div>
                </div>
              ))}
              {materials.length === 0 && <p className="text-sm text-gray-500 italic">Belum ada materi untuk mata pelajaran ini.</p>}
            </div>
          </div>
        ))}
        {courseMaterials.length === 0 && (
          <div className="bg-white rounded-xl p-8 shadow-sm border text-center">
            <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
            <p className="text-sm text-gray-500">Belum ada mata pelajaran yang tersedia.</p>
          </div>
        )}

        {/* Material Reading Modal */}
        {openMaterial && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl">
              {/* Header */}
              <div className="flex justify-between items-start p-6 border-b border-gray-100">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{openMaterial.title}</h3>
                  <div className="flex items-center space-x-3 mt-1.5">
                    <span className="text-xs text-gray-500">
                      {courseMaterials.find(cm => cm.materials.some(m => m.id === openMaterial.id))?.course.title}
                    </span>
                    <span className="text-xs text-gray-300">|</span>
                    <span className="text-xs text-gray-500">
                      {new Date(openMaterial.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                    <span className="text-xs text-gray-300">|</span>
                    <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded capitalize">{openMaterial.type}</span>
                  </div>
                </div>
                <button onClick={() => setOpenMaterial(null)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {openMaterial.url && (openMaterial.type === 'video' || openMaterial.type === 'document') && (
                  <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <a href={openMaterial.url} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 text-blue-700 hover:text-blue-800 font-medium">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                      <span>{openMaterial.type === 'video' ? 'Buka Video' : 'Download Dokumen'}</span>
                    </a>
                  </div>
                )}
                <div className="prose prose-sm max-w-none">
                  <div className="text-gray-700 leading-relaxed whitespace-pre-wrap text-base">
                    {openMaterial.content}
                  </div>
                </div>
              </div>
              {/* Footer */}
              <div className="p-4 border-t border-gray-100 flex justify-between items-center bg-gray-50 rounded-b-2xl">
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-primary-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  <span className="text-sm text-primary-700 font-medium">Materi sudah ditandai dibaca</span>
                </div>
                <button onClick={() => setOpenMaterial(null)} className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors">
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
