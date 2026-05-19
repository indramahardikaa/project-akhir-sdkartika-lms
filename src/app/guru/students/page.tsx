'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import { getCoursesByGuru, getEnrollments, getUsers } from '@/lib/data';
import { User, Enrollment, Course } from '@/types';

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
      studentMap.get(student.id)!.enrollments.push({ ...e, courseName: course?.title || '' });
    });

    setStudentInfos(Array.from(studentMap.values()));
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Siswa Terdaftar</h1>
          <p className="text-gray-600 mt-1">Pantau progres siswa di kursus Anda</p>
        </div>

        <div className="space-y-4">
          {studentInfos.map((info) => (
            <div key={info.student.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-700 font-semibold">{info.student.name.charAt(0)}</span>
                </div>
                <div className="ml-3">
                  <h3 className="font-semibold text-gray-900">{info.student.name}</h3>
                  <p className="text-sm text-gray-500">{info.student.email}</p>
                </div>
              </div>
              <div className="space-y-2">
                {info.enrollments.map((e) => (
                  <div key={e.id} className="flex items-center justify-between bg-gray-50 px-4 py-2 rounded-lg">
                    <span className="text-sm text-gray-700">{e.courseName}</span>
                    <div className="flex items-center gap-3">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${e.progress}%` }}></div>
                      </div>
                      <span className="text-xs text-gray-500 w-10 text-right">{e.progress}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {studentInfos.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
            <p className="text-gray-500">Belum ada siswa yang terdaftar di kursus Anda.</p>
          </div>
        )}
      </main>
    </div>
  );
}
