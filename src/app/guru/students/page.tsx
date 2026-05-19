'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import { getCoursesByGuru, getEnrollments, getUsers } from '@/lib/data';
import { User, Enrollment } from '@/types';

interface StudentInfo {
  student: User;
  enrollments: (Enrollment & { courseName: string })[];
}

export default function GuruStudentsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [studentInfos, setStudentInfos] = useState<StudentInfo[]>([]);

  useEffect(() => {
    if (isLoading) return;
    if (!user || user.role !== 'guru') { router.push('/login'); return; }

    const myCourses = getCoursesByGuru(user.id);
    const courseIds = myCourses.map(c => c.id);
    const allEnrollments = getEnrollments().filter(e => courseIds.includes(e.courseId));
    const allUsers = getUsers();

    const studentMap = new Map<string, StudentInfo>();
    allEnrollments.forEach(e => {
      const student = allUsers.find(u => u.id === e.siswaId);
      if (!student) return;
      const course = myCourses.find(c => c.id === e.courseId);
      if (!studentMap.has(student.id)) {
        studentMap.set(student.id, { student, enrollments: [] });
      }
      studentMap.get(student.id)!.enrollments.push({
        ...e, courseName: course?.title || ''
      });
    });

    setStudentInfos(Array.from(studentMap.values()));
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Siswa Terdaftar</h1>
          <p className="text-gray-500 mt-1">Pantau progres siswa di kursus Anda</p>
        </div>

        <div className="space-y-4">
          {studentInfos.map((info) => (
            <div key={info.student.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-300">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center shadow-sm">
                  <span className="text-white font-bold text-lg">{info.student.name.charAt(0)}</span>
                </div>
                <div className="ml-4">
                  <h3 className="font-semibold text-gray-900 text-lg">{info.student.name}</h3>
                  <p className="text-sm text-gray-500">{info.student.email}</p>
                </div>
              </div>
              <div className="space-y-3 ml-16">
                {info.enrollments.map((e) => (
                  <div key={e.id} className="flex items-center justify-between bg-gray-50 px-4 py-3 rounded-xl border border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                      </div>
                      <span className="text-sm font-medium text-gray-700">{e.courseName}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-32 bg-gray-200 rounded-full h-2.5">
                        <div className={`h-2.5 rounded-full transition-all ${e.progress >= 75 ? 'bg-primary-500' : e.progress >= 40 ? 'bg-amber-500' : 'bg-accent-500'}`} style={{ width: `${e.progress}%` }}></div>
                      </div>
                      <span className="text-sm font-semibold text-gray-700 w-12 text-right">{e.progress}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {studentInfos.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            <p className="text-gray-500">Belum ada siswa yang terdaftar di kursus Anda.</p>
          </div>
        )}
      </main>
    </div>
  );
}
