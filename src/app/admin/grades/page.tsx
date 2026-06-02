'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { getClassRooms, getUsersByClass, getCourses, getAssignmentsByCourse, getSubmissionsByAssignment, getExamsByCourse, getExamResultsBySiswa } from '@/lib/data';
import { ClassRoom, User, Course } from '@/types';

interface CourseGrade {
  course: Course;
  assignmentGrades: { title: string; grade: number | null }[];
  examGrades: { title: string; score: number | null }[];
  average: number;
}

interface StudentAllGrades {
  student: User;
  courseGrades: CourseGrade[];
  overallAverage: number;
}

export default function AdminGradesPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [classRooms, setClassRooms] = useState<ClassRoom[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [studentGrades, setStudentGrades] = useState<StudentAllGrades[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);

  useEffect(() => {
    if (isLoading) return;
    if (!user || user.role !== 'admin') { router.push('/login'); return; }
    setClassRooms(getClassRooms());
    setCourses(getCourses());
  }, [user, isLoading, router]);

  useEffect(() => {
    if (!selectedClass) { setStudentGrades([]); return; }
    const students = getUsersByClass(selectedClass);
    const allCourses = getCourses();

    const gradesData: StudentAllGrades[] = students.map((student) => {
      const courseGrades: CourseGrade[] = allCourses.map((course) => {
        // Get assignment grades
        const assignments = getAssignmentsByCourse(course.id);
        const assignmentGrades = assignments.map((a) => {
          const submissions = getSubmissionsByAssignment(a.id);
          const sub = submissions.find((s) => s.siswaId === student.id);
          return { title: a.title, grade: sub?.grade ?? null };
        });

        // Get exam grades
        const exams = getExamsByCourse(course.id);
        const examResults = getExamResultsBySiswa(student.id);
        const examGrades = exams.map((exam) => {
          const result = examResults.find((r) => r.examId === exam.id);
          return { title: exam.title, score: result?.score ?? null };
        });

        // Calculate average for this course
        const allGraded = [
          ...assignmentGrades.filter((g) => g.grade !== null).map((g) => g.grade as number),
          ...examGrades.filter((g) => g.score !== null).map((g) => g.score as number),
        ];
        const average = allGraded.length > 0
          ? Math.round(allGraded.reduce((sum, g) => sum + g, 0) / allGraded.length)
          : 0;

        return { course, assignmentGrades, examGrades, average };
      });

      // Overall average across all courses
      const nonZeroCourses = courseGrades.filter((cg) => cg.average > 0);
      const overallAverage = nonZeroCourses.length > 0
        ? Math.round(nonZeroCourses.reduce((sum, cg) => sum + cg.average, 0) / nonZeroCourses.length)
        : 0;

      return { student, courseGrades, overallAverage };
    });

    setStudentGrades(gradesData);
  }, [selectedClass]);

  const handlePrint = () => {
    window.print();
  };

  const handlePrintStudent = (studentId: string) => {
    setSelectedStudent(studentId);
    setTimeout(() => {
      window.print();
      setSelectedStudent(null);
    }, 100);
  };

  if (isLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div></div>;
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Cetak Nilai Semua Mapel</h1>
            <p className="text-gray-500 text-sm mt-1">Rekap nilai siswa dari semua mata pelajaran (tugas &amp; exam)</p>
          </div>
          {studentGrades.length > 0 && (
            <button onClick={handlePrint} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 print:hidden">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
              Cetak Semua
            </button>
          )}
        </div>

        {/* Filter */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6 print:hidden">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Kelas</label>
            <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-green-500">
              <option value="">-- Pilih Kelas --</option>
              {classRooms.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>

        {/* Print Header */}
        <div className="hidden print:block mb-6 text-center">
          <h2 className="text-lg font-bold">SD Kartika Jaya X-2</h2>
          <p className="text-sm">Rekap Nilai Semua Mata Pelajaran</p>
          <p className="text-sm">Kelas: {classRooms.find(c => c.id === selectedClass)?.name}</p>
        </div>

        {/* Student Grades */}
        {studentGrades.length > 0 && (
          <div className="space-y-6">
            {studentGrades
              .filter((sg) => !selectedStudent || sg.student.id === selectedStudent)
              .map((sg) => (
              <div key={sg.student.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden print:shadow-none print:break-inside-avoid">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{sg.student.name}</h3>
                    <p className="text-xs text-gray-500">NIS: {sg.student.nis || '-'} | NISN: {sg.student.nisn || '-'}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${sg.overallAverage >= 70 ? 'bg-green-100 text-green-700' : sg.overallAverage > 0 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'}`}>
                      Rata-rata: {sg.overallAverage > 0 ? sg.overallAverage : '-'}
                    </span>
                    <button onClick={() => handlePrintStudent(sg.student.id)} className="text-green-600 hover:text-green-800 text-sm font-medium print:hidden">
                      Cetak
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Mata Pelajaran</th>
                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Nilai Tugas</th>
                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Nilai Exam</th>
                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Rata-rata</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {sg.courseGrades.map((cg) => {
                        const assignmentAvg = cg.assignmentGrades.filter(g => g.grade !== null);
                        const examAvg = cg.examGrades.filter(g => g.score !== null);
                        const avgAssignment = assignmentAvg.length > 0 ? Math.round(assignmentAvg.reduce((s, g) => s + (g.grade || 0), 0) / assignmentAvg.length) : null;
                        const avgExam = examAvg.length > 0 ? Math.round(examAvg.reduce((s, g) => s + (g.score || 0), 0) / examAvg.length) : null;

                        return (
                          <tr key={cg.course.id} className="hover:bg-gray-50">
                            <td className="px-4 py-2 text-sm font-medium text-gray-900">{cg.course.title}</td>
                            <td className="px-4 py-2 text-center text-sm">
                              {avgAssignment !== null ? (
                                <span className={`font-medium ${avgAssignment >= 70 ? 'text-green-700' : 'text-red-600'}`}>{avgAssignment}</span>
                              ) : (
                                <span className="text-gray-300">-</span>
                              )}
                            </td>
                            <td className="px-4 py-2 text-center text-sm">
                              {avgExam !== null ? (
                                <span className={`font-medium ${avgExam >= 70 ? 'text-green-700' : 'text-red-600'}`}>{avgExam}</span>
                              ) : (
                                <span className="text-gray-300">-</span>
                              )}
                            </td>
                            <td className="px-4 py-2 text-center">
                              <span className={`text-sm font-bold ${cg.average >= 70 ? 'text-green-700' : cg.average > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                                {cg.average > 0 ? cg.average : '-'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedClass && studentGrades.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
            <p className="text-gray-500">Belum ada data siswa di kelas ini.</p>
          </div>
        )}

        {!selectedClass && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            <p className="text-gray-500">Pilih kelas untuk melihat rekap nilai semua mata pelajaran.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
