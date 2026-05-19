'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { getExamResultsBySiswa, getExams, getCourses } from '@/lib/data';
import { Course } from '@/types';

export default function SiswaNilaiPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [gradesByCourse, setGradesByCourse] = useState<{course: Course; grades: {title: string; score: number; date: string}[]}[]>([]);

  useEffect(() => {
    if (isLoading) return;
    if (!user || user.role !== 'siswa') { router.push('/login'); return; }
    const results = getExamResultsBySiswa(user.id);
    const exams = getExams();
    const courses = getCourses();
    const courseMap = new Map<string, {title: string; score: number; date: string}[]>();
    results.forEach(r => {
      const exam = exams.find(e => e.id === r.examId);
      if (!exam) return;
      if (!courseMap.has(exam.courseId)) courseMap.set(exam.courseId, []);
      courseMap.get(exam.courseId)!.push({ title: exam.title, score: r.score, date: r.submittedAt });
    });
    const data: {course: Course; grades: {title: string; score: number; date: string}[]}[] = [];
    courseMap.forEach((grades, courseId) => {
      const course = courses.find(c => c.id === courseId);
      if (course) data.push({ course, grades });
    });
    setGradesByCourse(data);
  }, [user, isLoading, router]);

  if (isLoading || !user) return null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">Nilai Saya</h2>
        {gradesByCourse.map(({course, grades}) => (
          <div key={course.id} className="bg-white rounded-xl p-6 shadow-sm border">
            <h3 className="text-lg font-bold text-primary-800 mb-4">{course.title}</h3>
            <table className="w-full text-sm">
              <thead className="bg-primary-50">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-primary-800">Ujian</th>
                  <th className="px-4 py-2 text-center font-medium text-primary-800">Nilai</th>
                  <th className="px-4 py-2 text-left font-medium text-primary-800">Tanggal</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {grades.map((g, i) => (
                  <tr key={i}>
                    <td className="px-4 py-2">{g.title}</td>
                    <td className="px-4 py-2 text-center font-bold">{g.score}</td>
                    <td className="px-4 py-2 text-gray-500">{new Date(g.date).toLocaleDateString('id-ID')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
        {gradesByCourse.length === 0 && <p className="text-sm text-gray-500">Belum ada data nilai.</p>}
      </div>
    </DashboardLayout>
  );
}
