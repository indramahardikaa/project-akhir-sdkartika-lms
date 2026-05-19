'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { getCourses, getEnrollmentsBySiswa, enrollSiswa } from '@/lib/data';
import { Course } from '@/types';

export default function SiswaCoursesPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [courses, setCourses] = useState<(Course & { enrolled: boolean; progress: number })[]>([]);

  useEffect(() => {
    if (isLoading) return;
    if (!user || user.role !== 'siswa') { router.push('/login'); return; }
    loadData();
  }, [user, isLoading, router]);

  const loadData = () => {
    if (!user) return;
    const enrollments = getEnrollmentsBySiswa(user.id);
    setCourses(getCourses().map(c => {
      const enr = enrollments.find(e => e.courseId === c.id);
      return { ...c, enrolled: !!enr, progress: enr?.progress || 0 };
    }));
  };

  const handleEnroll = (courseId: string) => {
    if (!user) return;
    enrollSiswa(user.id, courseId);
    loadData();
  };

  if (isLoading || !user) return null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">Kursus</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map(c => (
            <div key={c.id} className="bg-white rounded-xl p-5 shadow-sm border hover:shadow-md transition-shadow">
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-800">{c.title}</h3>
              <p className="text-sm text-gray-500 mt-1">{c.description}</p>
              <p className="text-xs text-gray-400 mt-1">Guru: {c.guruName}</p>
              {c.enrolled ? (
                <div className="mt-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-primary-600 font-medium">Progress</span>
                    <span className="text-gray-500">{c.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-primary-500 h-2 rounded-full" style={{ width: `${c.progress}%` }}></div>
                  </div>
                </div>
              ) : (
                <button onClick={() => handleEnroll(c.id)} className="mt-3 px-3 py-1.5 bg-primary-600 text-white rounded-lg text-xs font-medium hover:bg-primary-700">Daftar</button>
              )}
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
