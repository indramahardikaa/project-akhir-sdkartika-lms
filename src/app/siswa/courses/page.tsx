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
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Daftar Kursus</h1>
          <p className="text-gray-600 mt-1">Jelajahi dan daftar kursus yang tersedia</p>
        </div>

        {/* Enrolled Courses */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Kursus yang Diikuti</h2>
          {enrollments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.filter(c => isEnrolled(c.id)).map((c) => (
                <div key={c.id} className="bg-white rounded-xl shadow-sm border border-green-200 p-6">
                  <div className="flex justify-between items-start mb-3">
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">{c.category}</span>
                    <span className="text-xs text-green-600 font-medium">Terdaftar</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{c.title}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{c.description}</p>
                  <p className="text-xs text-gray-500 mb-3">Guru: {c.guruName}</p>
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Progres</span>
                      <span>{getProgress(c.id)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full transition-all" style={{ width: `${getProgress(c.id)}%` }}></div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => router.push('/siswa/materials')} className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-sm font-medium transition-colors">
                      Belajar
                    </button>
                    <button onClick={() => handleUnenroll(c.id)} className="px-3 py-2 border border-red-300 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors">
                      Keluar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
              <p className="text-gray-500">Belum mengikuti kursus apapun. Daftar kursus di bawah!</p>
            </div>
          )}
        </div>

        {/* Available Courses */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Kursus Tersedia</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.filter(c => !isEnrolled(c.id)).map((c) => (
              <div key={c.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex justify-between items-start mb-3">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">{c.category}</span>
                  <span className="text-xs text-gray-400">{getMaterialsByCourse(c.id).length} materi</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{c.title}</h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{c.description}</p>
                <p className="text-xs text-gray-500 mb-4">Guru: {c.guruName}</p>
                <button onClick={() => handleEnroll(c.id)} className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-sm font-medium transition-colors">
                  Daftar Kursus
                </button>
              </div>
            ))}
          </div>
          {courses.filter(c => !isEnrolled(c.id)).length === 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
              <p className="text-gray-500">Semua kursus sudah diikuti.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
