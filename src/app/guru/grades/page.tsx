'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import {
  getClassRooms, getUsersByClass, getCoursesByGuru, getAssignmentsByCourse,
  getSubmissionsByAssignment, getExamsByCourse, getExamResultsBySiswa
} from '@/lib/data';
import { ClassRoom, User, Course, Assignment, AssignmentSubmission, Exam, ExamResult, ExamType } from '@/types';

interface ExamGrade {
  exam: Exam;
  result?: ExamResult;
}

interface StudentGradeData {
  student: User;
  assignmentGrades: { assignment: Assignment; submission?: AssignmentSubmission }[];
  uhGrades: ExamGrade[];
  ptsGrades: ExamGrade[];
  pasGrades: ExamGrade[];
  avgAssignment: number;
  avgUH: number;
  avgPTS: number;
  avgPAS: number;
  finalAverage: number;
}

export default function GuruGradesPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [classRooms, setClassRooms] = useState<ClassRoom[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [studentGrades, setStudentGrades] = useState<StudentGradeData[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [uhExams, setUhExams] = useState<Exam[]>([]);
  const [ptsExams, setPtsExams] = useState<Exam[]>([]);
  const [pasExams, setPasExams] = useState<Exam[]>([]);


  useEffect(() => {
    if (isLoading) return;
    if (!user || user.role !== 'guru') { router.push('/login'); return; }
    setClassRooms(getClassRooms());
    setCourses(getCoursesByGuru(user.id));
  }, [user, isLoading, router]);

  useEffect(() => {
    if (!selectedClass || !selectedCourse) {
      setStudentGrades([]);
      setAssignments([]);
      setUhExams([]);
      setPtsExams([]);
      setPasExams([]);
      return;
    }

    const students = getUsersByClass(selectedClass);
    const courseAssignments = getAssignmentsByCourse(selectedCourse);
    const courseExams = getExamsByCourse(selectedCourse);

    setAssignments(courseAssignments);
    const uh = courseExams.filter((e) => e.examType === 'UH');
    const pts = courseExams.filter((e) => e.examType === 'PTS');
    const pas = courseExams.filter((e) => e.examType === 'PAS');
    setUhExams(uh);
    setPtsExams(pts);
    setPasExams(pas);

    const grades: StudentGradeData[] = students.map((student) => {
      // Assignment grades
      const assignmentGrades = courseAssignments.map((assignment) => {
        const submissions = getSubmissionsByAssignment(assignment.id);
        const submission = submissions.find((s) => s.siswaId === student.id);
        return { assignment, submission };
      });

      // Exam results by type
      const studentResults = getExamResultsBySiswa(student.id);
      const uhGrades: ExamGrade[] = uh.map((exam) => ({
        exam,
        result: studentResults.find((r) => r.examId === exam.id),
      }));
      const ptsGrades: ExamGrade[] = pts.map((exam) => ({
        exam,
        result: studentResults.find((r) => r.examId === exam.id),
      }));
      const pasGrades: ExamGrade[] = pas.map((exam) => ({
        exam,
        result: studentResults.find((r) => r.examId === exam.id),
      }));

      // Calculate averages
      const gradedAssignments = assignmentGrades.filter((g) => g.submission?.grade != null);
      const avgAssignment = gradedAssignments.length > 0
        ? Math.round(gradedAssignments.reduce((sum, g) => sum + (g.submission!.grade || 0), 0) / gradedAssignments.length)
        : 0;

      const gradedUH = uhGrades.filter((g) => g.result && g.result.status !== 'in_progress');
      const avgUH = gradedUH.length > 0
        ? Math.round(gradedUH.reduce((sum, g) => sum + (g.result!.score || 0), 0) / gradedUH.length)
        : 0;

      const gradedPTS = ptsGrades.filter((g) => g.result && g.result.status !== 'in_progress');
      const avgPTS = gradedPTS.length > 0
        ? Math.round(gradedPTS.reduce((sum, g) => sum + (g.result!.score || 0), 0) / gradedPTS.length)
        : 0;

      const gradedPAS = pasGrades.filter((g) => g.result && g.result.status !== 'in_progress');
      const avgPAS = gradedPAS.length > 0
        ? Math.round(gradedPAS.reduce((sum, g) => sum + (g.result!.score || 0), 0) / gradedPAS.length)
        : 0;

      // Final average: weighted (Tugas 20%, UH 25%, PTS 25%, PAS 30%)
      const components = [];
      if (avgAssignment > 0) components.push({ value: avgAssignment, weight: 20 });
      if (avgUH > 0) components.push({ value: avgUH, weight: 25 });
      if (avgPTS > 0) components.push({ value: avgPTS, weight: 25 });
      if (avgPAS > 0) components.push({ value: avgPAS, weight: 30 });

      const totalWeight = components.reduce((s, c) => s + c.weight, 0);
      const finalAverage = totalWeight > 0
        ? Math.round(components.reduce((s, c) => s + (c.value * c.weight), 0) / totalWeight)
        : 0;

      return { student, assignmentGrades, uhGrades, ptsGrades, pasGrades, avgAssignment, avgUH, avgPTS, avgPAS, finalAverage };
    });

    setStudentGrades(grades);
  }, [selectedClass, selectedCourse]);


  const handlePrint = () => { window.print(); };

  const handleExportCSV = () => {
    if (studentGrades.length === 0) return;
    const courseName = courses.find((c) => c.id === selectedCourse)?.title || '';
    const className = classRooms.find((c) => c.id === selectedClass)?.name || '';

    let csv = `Rekap Nilai - ${courseName} - ${className}\n`;
    csv += `No,Nama Siswa,NIS,NISN,Rata-rata Tugas`;

    uhExams.forEach((e, i) => { csv += `,UH${i + 1}`; });
    csv += `,Rata-rata UH`;
    ptsExams.forEach((e, i) => { csv += `,PTS${i + 1}`; });
    csv += `,Rata-rata PTS`;
    pasExams.forEach((e, i) => { csv += `,PAS${i + 1}`; });
    csv += `,Rata-rata PAS,Nilai Akhir\n`;

    studentGrades.forEach((sg, idx) => {
      csv += `${idx + 1},${sg.student.name},${sg.student.nis || '-'},${sg.student.nisn || '-'},${sg.avgAssignment || '-'}`;
      sg.uhGrades.forEach((g) => { csv += `,${g.result?.score ?? '-'}`; });
      csv += `,${sg.avgUH || '-'}`;
      sg.ptsGrades.forEach((g) => { csv += `,${g.result?.score ?? '-'}`; });
      csv += `,${sg.avgPTS || '-'}`;
      sg.pasGrades.forEach((g) => { csv += `,${g.result?.score ?? '-'}`; });
      csv += `,${sg.avgPAS || '-'},${sg.finalAverage || '-'}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rekap_nilai_${courseName.replace(/\s+/g, '_')}_${className.replace(/\s+/g, '_')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
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
            <p className="text-gray-500 text-sm mt-1">Rekap nilai siswa berdasarkan Tugas, UH, PTS, dan PAS</p>
          </div>
          {studentGrades.length > 0 && (
            <div className="flex gap-2 print:hidden">
              <button onClick={handleExportCSV} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                Export CSV
              </button>
              <button onClick={handlePrint} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                Cetak / Print
              </button>
            </div>
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

        {/* Print Header */}
        <div className="hidden print:block mb-6 text-center">
          <h2 className="text-lg font-bold">SD Kartika Jaya X-2</h2>
          <p className="text-sm">Rekap Nilai Siswa</p>
          <p className="text-sm">Kelas: {classRooms.find(c => c.id === selectedClass)?.name} | Mapel: {courses.find(c => c.id === selectedCourse)?.title}</p>
          <p className="text-xs text-gray-500 mt-1">Bobot: Tugas 20% | UH 25% | PTS 25% | PAS 30%</p>
        </div>

        {/* Grades Info */}
        {studentGrades.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 print:hidden">
            <p className="text-xs text-blue-700"><span className="font-medium">Keterangan Nilai Akhir:</span> Tugas (20%) + UH (25%) + PTS (25%) + PAS (30%)</p>
          </div>
        )}


        {/* Grades Table */}
        {studentGrades.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden print:shadow-none print:border-black">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-xs">
                <thead className="bg-gray-50">
                  <tr>
                    <th rowSpan={2} className="px-3 py-2 text-left font-medium text-gray-500 uppercase border-r">No</th>
                    <th rowSpan={2} className="px-3 py-2 text-left font-medium text-gray-500 uppercase border-r min-w-[120px]">Nama Siswa</th>
                    <th rowSpan={2} className="px-3 py-2 text-center font-medium text-gray-500 uppercase border-r">NIS</th>
                    {/* Tugas */}
                    <th colSpan={assignments.length > 0 ? assignments.length + 1 : 1} className="px-3 py-2 text-center font-medium text-blue-700 uppercase border-r bg-blue-50">Tugas</th>
                    {/* UH */}
                    <th colSpan={uhExams.length > 0 ? uhExams.length + 1 : 1} className="px-3 py-2 text-center font-medium text-green-700 uppercase border-r bg-green-50">Ulangan Harian</th>
                    {/* PTS */}
                    <th colSpan={ptsExams.length > 0 ? ptsExams.length + 1 : 1} className="px-3 py-2 text-center font-medium text-purple-700 uppercase border-r bg-purple-50">PTS</th>
                    {/* PAS */}
                    <th colSpan={pasExams.length > 0 ? pasExams.length + 1 : 1} className="px-3 py-2 text-center font-medium text-red-700 uppercase border-r bg-red-50">PAS</th>
                    <th rowSpan={2} className="px-3 py-2 text-center font-medium text-gray-700 uppercase bg-yellow-50">Nilai Akhir</th>
                  </tr>
                  <tr>
                    {/* Tugas sub-headers */}
                    {assignments.length > 0 ? (
                      <>
                        {assignments.map((a, i) => (
                          <th key={a.id} className="px-2 py-1 text-center font-medium text-gray-500 border-r bg-blue-50" title={a.title}>T{i + 1}</th>
                        ))}
                        <th className="px-2 py-1 text-center font-bold text-blue-700 border-r bg-blue-50">Avg</th>
                      </>
                    ) : (
                      <th className="px-2 py-1 text-center font-medium text-gray-400 border-r bg-blue-50">-</th>
                    )}
                    {/* UH sub-headers */}
                    {uhExams.length > 0 ? (
                      <>
                        {uhExams.map((e, i) => (
                          <th key={e.id} className="px-2 py-1 text-center font-medium text-gray-500 border-r bg-green-50" title={e.title}>UH{i + 1}</th>
                        ))}
                        <th className="px-2 py-1 text-center font-bold text-green-700 border-r bg-green-50">Avg</th>
                      </>
                    ) : (
                      <th className="px-2 py-1 text-center font-medium text-gray-400 border-r bg-green-50">-</th>
                    )}
                    {/* PTS sub-headers */}
                    {ptsExams.length > 0 ? (
                      <>
                        {ptsExams.map((e, i) => (
                          <th key={e.id} className="px-2 py-1 text-center font-medium text-gray-500 border-r bg-purple-50" title={e.title}>PTS{i + 1}</th>
                        ))}
                        <th className="px-2 py-1 text-center font-bold text-purple-700 border-r bg-purple-50">Avg</th>
                      </>
                    ) : (
                      <th className="px-2 py-1 text-center font-medium text-gray-400 border-r bg-purple-50">-</th>
                    )}
                    {/* PAS sub-headers */}
                    {pasExams.length > 0 ? (
                      <>
                        {pasExams.map((e, i) => (
                          <th key={e.id} className="px-2 py-1 text-center font-medium text-gray-500 border-r bg-red-50" title={e.title}>PAS{i + 1}</th>
                        ))}
                        <th className="px-2 py-1 text-center font-bold text-red-700 border-r bg-red-50">Avg</th>
                      </>
                    ) : (
                      <th className="px-2 py-1 text-center font-medium text-gray-400 border-r bg-red-50">-</th>
                    )}
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">
                  {studentGrades.map((sg, idx) => (
                    <tr key={sg.student.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 text-gray-500 border-r">{idx + 1}</td>
                      <td className="px-3 py-2 font-medium text-gray-900 border-r">{sg.student.name}</td>
                      <td className="px-3 py-2 text-center text-gray-500 border-r">{sg.student.nis || '-'}</td>
                      {/* Tugas values */}
                      {assignments.length > 0 ? (
                        <>
                          {sg.assignmentGrades.map((g) => (
                            <td key={g.assignment.id} className="px-2 py-2 text-center border-r">
                              {g.submission?.grade != null ? (
                                <span className={`font-medium ${g.submission.grade >= 70 ? 'text-green-700' : 'text-red-600'}`}>{g.submission.grade}</span>
                              ) : <span className="text-gray-300">-</span>}
                            </td>
                          ))}
                          <td className="px-2 py-2 text-center font-bold border-r bg-blue-50">
                            <span className={sg.avgAssignment >= 70 ? 'text-green-700' : sg.avgAssignment > 0 ? 'text-red-600' : 'text-gray-400'}>{sg.avgAssignment || '-'}</span>
                          </td>
                        </>
                      ) : (
                        <td className="px-2 py-2 text-center text-gray-300 border-r">-</td>
                      )}
                      {/* UH values */}
                      {uhExams.length > 0 ? (
                        <>
                          {sg.uhGrades.map((g) => (
                            <td key={g.exam.id} className="px-2 py-2 text-center border-r">
                              {g.result && g.result.status !== 'in_progress' ? (
                                <span className={`font-medium ${g.result.score >= 70 ? 'text-green-700' : 'text-red-600'}`}>{g.result.score}</span>
                              ) : <span className="text-gray-300">-</span>}
                            </td>
                          ))}
                          <td className="px-2 py-2 text-center font-bold border-r bg-green-50">
                            <span className={sg.avgUH >= 70 ? 'text-green-700' : sg.avgUH > 0 ? 'text-red-600' : 'text-gray-400'}>{sg.avgUH || '-'}</span>
                          </td>
                        </>
                      ) : (
                        <td className="px-2 py-2 text-center text-gray-300 border-r">-</td>
                      )}
                      {/* PTS values */}
                      {ptsExams.length > 0 ? (
                        <>
                          {sg.ptsGrades.map((g) => (
                            <td key={g.exam.id} className="px-2 py-2 text-center border-r">
                              {g.result && g.result.status !== 'in_progress' ? (
                                <span className={`font-medium ${g.result.score >= 70 ? 'text-green-700' : 'text-red-600'}`}>{g.result.score}</span>
                              ) : <span className="text-gray-300">-</span>}
                            </td>
                          ))}
                          <td className="px-2 py-2 text-center font-bold border-r bg-purple-50">
                            <span className={sg.avgPTS >= 70 ? 'text-green-700' : sg.avgPTS > 0 ? 'text-red-600' : 'text-gray-400'}>{sg.avgPTS || '-'}</span>
                          </td>
                        </>
                      ) : (
                        <td className="px-2 py-2 text-center text-gray-300 border-r">-</td>
                      )}
                      {/* PAS values */}
                      {pasExams.length > 0 ? (
                        <>
                          {sg.pasGrades.map((g) => (
                            <td key={g.exam.id} className="px-2 py-2 text-center border-r">
                              {g.result && g.result.status !== 'in_progress' ? (
                                <span className={`font-medium ${g.result.score >= 70 ? 'text-green-700' : 'text-red-600'}`}>{g.result.score}</span>
                              ) : <span className="text-gray-300">-</span>}
                            </td>
                          ))}
                          <td className="px-2 py-2 text-center font-bold border-r bg-red-50">
                            <span className={sg.avgPAS >= 70 ? 'text-green-700' : sg.avgPAS > 0 ? 'text-red-600' : 'text-gray-400'}>{sg.avgPAS || '-'}</span>
                          </td>
                        </>
                      ) : (
                        <td className="px-2 py-2 text-center text-gray-300 border-r">-</td>
                      )}
                      {/* Final */}
                      <td className="px-3 py-2 text-center bg-yellow-50">
                        <span className={`text-sm font-bold ${sg.finalAverage >= 70 ? 'text-green-700' : sg.finalAverage > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                          {sg.finalAverage > 0 ? sg.finalAverage : '-'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}


        {/* Statistics Summary */}
        {studentGrades.length > 0 && (
          <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-4 print:grid-cols-5">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <p className="text-xs text-blue-600 font-medium">Rata-rata Tugas</p>
              <p className="text-xl font-bold text-blue-700">
                {Math.round(studentGrades.reduce((s, g) => s + g.avgAssignment, 0) / studentGrades.filter(g => g.avgAssignment > 0).length) || '-'}
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <p className="text-xs text-green-600 font-medium">Rata-rata UH</p>
              <p className="text-xl font-bold text-green-700">
                {Math.round(studentGrades.reduce((s, g) => s + g.avgUH, 0) / studentGrades.filter(g => g.avgUH > 0).length) || '-'}
              </p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <p className="text-xs text-purple-600 font-medium">Rata-rata PTS</p>
              <p className="text-xl font-bold text-purple-700">
                {Math.round(studentGrades.reduce((s, g) => s + g.avgPTS, 0) / studentGrades.filter(g => g.avgPTS > 0).length) || '-'}
              </p>
            </div>
            <div className="bg-red-50 rounded-lg p-4 text-center">
              <p className="text-xs text-red-600 font-medium">Rata-rata PAS</p>
              <p className="text-xl font-bold text-red-700">
                {Math.round(studentGrades.reduce((s, g) => s + g.avgPAS, 0) / studentGrades.filter(g => g.avgPAS > 0).length) || '-'}
              </p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4 text-center">
              <p className="text-xs text-yellow-600 font-medium">Rata-rata Akhir</p>
              <p className="text-xl font-bold text-yellow-700">
                {Math.round(studentGrades.reduce((s, g) => s + g.finalAverage, 0) / studentGrades.filter(g => g.finalAverage > 0).length) || '-'}
              </p>
            </div>
          </div>
        )}

        {selectedClass && selectedCourse && studentGrades.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
            <p className="text-gray-500">Belum ada data siswa atau penilaian untuk kombinasi ini.</p>
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
