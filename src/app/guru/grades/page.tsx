'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { getClassRooms, getUsersByClass, getCoursesByGuru, getAssignmentsByCourse, getSubmissionsByAssignment } from '@/lib/data';
import { ClassRoom, User, Course, Assignment, AssignmentSubmission } from '@/types';

interface StudentGrade {
  student: User;
  grades: { assignment: Assignment; submission?: AssignmentSubmission }[];
  average: number;
}

export default function GuruGradesPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [classRooms, setClassRooms] = useState<ClassRoom[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [studentGrades, setStudentGrades] = useState<StudentGrade[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  useEffect(() => {
    if (isLoading) return;
    if (!user || user.role !== 'guru') { router.push('/login'); return; }
    setClassRooms(getClassRooms());
    setCourses(getCoursesByGuru(user.id));
  }, [user, isLoading, router]);

  useEffect(() => {
    if (!selectedClass || !selectedCourse) { setStudentGrades([]); setAssignments([]); return; }
    
    const students = getUsersByClass(selectedClass);
    const courseAssignments = getAssignmentsByCourse(selectedCourse);
    setAssignments(courseAssignments);

    const grades: StudentGrade[] = students.map((student) => {
      const gradeList = courseAssignments.map((assignment) => {
        const submissions = getSubmissionsByAssignment(assignment.id);
        const submission = submissions.find((s) => s.siswaId === student.id);
        return { assignment, submission };
      });
      
      const gradedSubmissions = gradeList.filter((g) => g.submission?.grade !== undefined && g.submission?.grade !== null);
      const average = gradedSubmissions.length > 0
        ? Math.round(gradedSubmissions.reduce((sum, g) => sum + (g.submission!.grade || 0), 0) / gradedSubmissions.length)
        : 0;
      
      return { student, grades: gradeList, average };
    });

    setStudentGrades(grades);
  }, [selectedClass, selectedCourse]);

  const handlePrint = () => {
    window.print();
  };

  if (isLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div></div>;
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Cetak Nilai</h1>
            <p className="text-gray-500 text-sm mt-1">Rekap nilai siswa berdasarkan tugas yang sudah dinilai</p>
          </div>
          {studentGrades.length > 0 && (
            <button onClick={handlePrint} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 print:hidden">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
              Cetak / Print
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6 print:hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Kelas</label>
              <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-green-500">
                <option value="">-- Pilih Kelas --</option>
                {classRooms.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Mata Pelajaran</label>
              <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-green-500">
                <option value="">-- Pilih Mata Pelajaran --</option>
                {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Print Header - only visible when printing */}
        <div className="hidden print:block mb-6 text-center">
          <h2 className="text-lg font-bold">SD Kartika Jaya X-2</h2>
          <p className="text-sm">Rekap Nilai Siswa</p>
          <p className="text-sm">Kelas: {classRooms.find(c => c.id === selectedClass)?.name} | Mapel: {courses.find(c => c.id === selectedCourse)?.title}</p>
        </div>

        {/* Grades Table */}
        {studentGrades.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden print:shadow-none print:border-black">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">No</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Siswa</th>
                    {assignments.map((a) => (
                      <th key={a.id} className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase max-w-[100px] truncate" title={a.title}>
                        {a.title.length > 15 ? a.title.substring(0, 15) + '...' : a.title}
                      </th>
                    ))}
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Rata-rata</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {studentGrades.map((sg, idx) => (
                    <tr key={sg.student.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-500">{idx + 1}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{sg.student.name}</td>
                      {sg.grades.map((g) => (
                        <td key={g.assignment.id} className="px-4 py-3 text-center text-sm">
                          {g.submission?.grade !== undefined && g.submission?.grade !== null ? (
                            <span className={`font-medium ${g.submission.grade >= 70 ? 'text-green-700' : 'text-red-600'}`}>
                              {g.submission.grade}
                            </span>
                          ) : (
                            <span className="text-gray-300">-</span>
                          )}
                        </td>
                      ))}
                      <td className="px-4 py-3 text-center">
                        <span className={`text-sm font-bold ${sg.average >= 70 ? 'text-green-700' : sg.average > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                          {sg.average > 0 ? sg.average : '-'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {selectedClass && selectedCourse && studentGrades.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
            <p className="text-gray-500">Belum ada data siswa atau tugas untuk kombinasi ini.</p>
          </div>
        )}

        {(!selectedClass || !selectedCourse) && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            <p className="text-gray-500">Pilih kelas dan mata pelajaran untuk melihat rekap nilai.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
