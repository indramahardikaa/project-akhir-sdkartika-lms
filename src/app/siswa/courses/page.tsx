'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import { getCourses, getEnrollmentsBySiswa, enrollSiswa, unenrollSiswa, getMaterialsByCourse } from '@/lib/data';
import { Course, Enrollment } from '@/types';

export default function SiswaCoursesPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);

  useEffect(() => {
    if (isLoading) return;
    if (!user || user.role !== 'siswa') { router.push('/login'); return; }
    loadData();
  }, [user, isLoading, router]);

  const loadData = () => {
    if (!user) return;
    setCourses(getCourses());
    setEnrollments(getEnrollmentsBySiswa(user.id));
  };

  const isEnrolled = (courseId: string) => enrollments.some(e => e.courseId === courseId);
  const getProgress = (courseId: string) => {
    const enrollment = enrollments.find(e => e.courseId === courseId);
    return enrollment?.progress || 0;
  };

  const handleEnroll = (courseId: string) => {
    if (!user) return;
    enrollSiswa(user.id, courseId);
    loadData();
  };

  const handleUnenroll = (courseId: string) => {
    if (!user) return;
    if (confirm('Batalkan pendaftaran dari kursus ini?')) {
      unenrollSiswa(user.id, courseId);
      loadData();
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
          <h1 className="text-3xl font-bold text-gray-900">Daftar Kursus</h1>
          <p className="text-gray-500 mt-1">Jelajahi dan daftar kursus yang tersedia</p>
        </div>

        {/* Enrolled Courses */}
        {enrollments.length > 0 && (
          <div className="mb-10">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center space-x-2">
              <div className="w-2 h-6 bg-primary-500 rounded-full"></div>
              <span>Kursus yang Diikuti</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.filter(c => isEnrolled(c.id)).map((c) => (
                <div key={c.id} className="bg-white rounded-2xl shadow-sm border-2 border-primary-100 overflow-hidden hover:shadow-md transition-all duration-300">
                  <div className="h-2 bg-gradient-to-r from-primary-400 to-primary-600"></div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <span className="px-3 py-1 bg-primary-50 text-primary-700 rounded-lg text-xs font-semibold">{c.category}</span>
                      <span className="flex items-center space-x-1 text-xs text-primary-600 font-medium">
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                        <span>Terdaftar</span>
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{c.title}</h3>
                    <p className="text-sm text-gray-500 mb-3 line-clamp-2">{c.description}</p>
                    <p className="text-xs text-gray-400 mb-4">Guru: {c.guruName}</p>
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                        <span>Progres</span>
                        <span className="font-semibold text-primary-600">{getProgress(c.id)}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2.5">
                        <div className="bg-gradient-to-r from-primary-400 to-primary-600 h-2.5 rounded-full transition-all" style={{ width: `${getProgress(c.id)}%` }}></div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => router.push('/siswa/materials')} className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm">
                        Belajar
                      </button>
                      <button onClick={() => handleUnenroll(c.id)} className="px-3 py-2.5 border border-accent-200 text-accent-600 hover:bg-accent-50 rounded-xl text-sm font-medium transition-colors">
                        Keluar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}


        {/* Available Courses */}
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center space-x-2">
            <div className="w-2 h-6 bg-blue-500 rounded-full"></div>
            <span>Kursus Tersedia</span>
          </h2>
          {courses.filter(c => !isEnrolled(c.id)).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.filter(c => !isEnrolled(c.id)).map((c) => (
                <div key={c.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300">
                  <div className="h-2 bg-gradient-to-r from-blue-400 to-blue-600"></div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-semibold">{c.category}</span>
                      <span className="text-xs text-gray-400">{getMaterialsByCourse(c.id).length} materi</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{c.title}</h3>
                    <p className="text-sm text-gray-500 mb-3 line-clamp-2">{c.description}</p>
                    <p className="text-xs text-gray-400 mb-4">Guru: {c.guruName}</p>
                    <button onClick={() => handleEnroll(c.id)} className="w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm hover:shadow-md">
                      Daftar Kursus
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-100">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <p className="text-gray-500">Semua kursus sudah diikuti. Bagus!</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
