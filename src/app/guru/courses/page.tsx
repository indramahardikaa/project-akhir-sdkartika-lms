'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { getCoursesByGuru, getMaterialsByCourse, getEnrollmentsByCourse } from '@/lib/data';
import { Course } from '@/types';

export default function GuruCoursesPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    if (isLoading) return;
    if (!user || user.role !== 'guru') { router.push('/login'); return; }
    setCourses(getCoursesByGuru(user.id));
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div></div>;
  }

  return (
    <DashboardLayout>

      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Kursus Saya</h1>
          <p className="text-gray-600 mt-1">Daftar kursus yang Anda ampu</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((c) => {
            const materialCount = getMaterialsByCourse(c.id).length;
            const studentCount = getEnrollmentsByCourse(c.id).length;
            return (
              <div key={c.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">{c.category}</span>
                <h3 className="text-lg font-semibold text-gray-900 mt-3 mb-2">{c.title}</h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{c.description}</p>
                <div className="flex justify-between text-xs text-gray-500 border-t pt-3">
                  <span>{materialCount} Materi</span>
                  <span>{studentCount} Siswa</span>
                </div>
              </div>
            );
          })}
        </div>

        {courses.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
            <p className="text-gray-500">Belum ada kursus yang diampu. Hubungi admin untuk menambahkan kursus.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}