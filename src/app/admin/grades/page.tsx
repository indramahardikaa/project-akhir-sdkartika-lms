'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import {
  getClassRooms, getUsersByClass, getCourses, getAssignmentsByCourse,
  getSubmissionsByAssignment, getExamsByCourse, getExamResultsBySiswa
} from '@/lib/data';
import { ClassRoom, User, Course, Exam, ExamResult, ExamType } from '@/types';

interface CourseGradeDetail {
  course: Course;
  avgTugas: number;
  avgUH: number;
  avgPTS: number;
  avgPAS: number;
  nilaiAkhir: number;
  uhScores: (number | null)[];
  ptsScores: (number | null)[];
  pasScores: (number | null)[];
}

interface StudentAllGrades {
  student: User;
  courseGrades: CourseGradeDetail[];
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
  const [viewMode, setViewMode] = useState<'summary' | 'detail'>('summary');


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
      const studentResults = getExamResultsBySiswa(student.id);

      const courseGrades: CourseGradeDetail[] = allCourses.map((course) => {
        // Assignment grades
        const assignments = getAssignmentsByCourse(course.id);
        const assignmentScores = assignments.map((a) => {
          const submissions = getSubmissionsByAssignment(a.id);
          const sub = submissions.find((s) => s.siswaId === student.id);
          return sub?.grade ?? null;
        }).filter((g): g is number => g !== null);
        const avgTugas = assignmentScores.length > 0
          ? Math.round(assignmentScores.reduce((s, g) => s + g, 0) / assignmentScores.length)
          : 0;

        // Exam grades by type
        const courseExams = getExamsByCourse(course.id);
        const uhExams = courseExams.filter((e) => e.examType === 'UH');
        const ptsExams = courseExams.filter((e) => e.examType === 'PTS');
        const pasExams = courseExams.filter((e) => e.examType === 'PAS');

        const uhScores = uhExams.map((e) => {
          const r = studentResults.find((r) => r.examId === e.id && r.status !== 'in_progress');
          return r ? r.score : null;
        });
        const ptsScores = ptsExams.map((e) => {
          const r = studentResults.find((r) => r.examId === e.id && r.status !== 'in_progress');
          return r ? r.score : null;
        });
        const pasScores = pasExams.map((e) => {
          const r = studentResults.find((r) => r.examId === e.id && r.status !== 'in_progress');
          return r ? r.score : null;
        });

        const validUH = uhScores.filter((s): s is number => s !== null);
        const validPTS = ptsScores.filter((s): s is number => s !== null);
        const validPAS = pasScores.filter((s): s is number => s !== null);

        const avgUH = validUH.length > 0 ? Math.round(validUH.reduce((s, g) => s + g, 0) / validUH.length) : 0;
        const avgPTS = validPTS.length > 0 ? Math.round(validPTS.reduce((s, g) => s + g, 0) / validPTS.length) : 0;
        const avgPAS = validPAS.length > 0 ? Math.round(validPAS.reduce((s, g) => s + g, 0) / validPAS.length) : 0;

        // Weighted final: Tugas 20%, UH 25%, PTS 25%, PAS 30%
        const components = [];
        if (avgTugas > 0) components.push({ value: avgTugas, weight: 20 });
        if (avgUH > 0) components.push({ value: avgUH, weight: 25 });
        if (avgPTS > 0) components.push({ value: avgPTS, weight: 25 });
        if (avgPAS > 0) components.push({ value: avgPAS, weight: 30 });
        const totalWeight = components.reduce((s, c) => s + c.weight, 0);
        const nilaiAkhir = totalWeight > 0
          ? Math.round(components.reduce((s, c) => s + (c.value * c.weight), 0) / totalWeight)
          : 0;

        return { course, avgTugas, avgUH, avgPTS, avgPAS, nilaiAkhir, uhScores, ptsScores, pasScores };
      });

      const nonZeroCourses = courseGrades.filter((cg) => cg.nilaiAkhir > 0);
      const overallAverage = nonZeroCourses.length > 0
        ? Math.round(nonZeroCourses.reduce((sum, cg) => sum + cg.nilaiAkhir, 0) / nonZeroCourses.length)
        : 0;

      return { student, courseGrades, overallAverage };
    });

    setStudentGrades(gradesData);
  }, [selectedClass]);


  const handlePrint = () => { window.print(); };

  const handlePrintStudent = (studentId: string) => {
    setSelectedStudent(studentId);
    setTimeout(() => { window.print(); setSelectedStudent(null); }, 100);
  };

  const handleExportCSV = () => {
    if (studentGrades.length === 0) return;
    const className = classRooms.find((c) => c.id === selectedClass)?.name || '';
    const allCourses = getCourses();

    let csv = `Rekap Nilai Semua Mapel - ${className}\n`;
    csv += `No,Nama Siswa,NIS,NISN`;
    allCourses.forEach((c) => { csv += `,${c.title} (Tugas),${c.title} (UH),${c.title} (PTS),${c.title} (PAS),${c.title} (Akhir)`; });
    csv += `,Rata-rata Keseluruhan\n`;

    studentGrades.forEach((sg, idx) => {
      csv += `${idx + 1},${sg.student.name},${sg.student.nis || '-'},${sg.student.nisn || '-'}`;
      sg.courseGrades.forEach((cg) => {
        csv += `,${cg.avgTugas || '-'},${cg.avgUH || '-'},${cg.avgPTS || '-'},${cg.avgPAS || '-'},${cg.nilaiAkhir || '-'}`;
      });
      csv += `,${sg.overallAverage || '-'}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rekap_nilai_semua_mapel_${className.replace(/\s+/g, '_')}.csv`;
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
            <h1 className="text-2xl font-bold text-gray-900">Cetak Nilai Semua Mapel</h1>
            <p className="text-gray-500 text-sm mt-1">Rekap nilai siswa (Tugas, UH, PTS, PAS) dari semua mata pelajaran</p>
          </div>
          {studentGrades.length > 0 && (
            <div className="flex gap-2 print:hidden">
              <button onClick={handleExportCSV} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                Export CSV
              </button>
              <button onClick={handlePrint} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                Cetak Semua
              </button>
            </div>
          )}
        </div>


        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6 print:hidden">
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Kelas</label>
              <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-green-500">
                <option value="">-- Pilih Kelas --</option>
                {classRooms.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            {studentGrades.length > 0 && (
              <div className="flex gap-2">
                <button onClick={() => setViewMode('summary')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${viewMode === 'summary' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  Ringkasan
                </button>
                <button onClick={() => setViewMode('detail')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${viewMode === 'detail' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  Detail per Siswa
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Print Header */}
        <div className="hidden print:block mb-6 text-center">
          <h2 className="text-lg font-bold">SD Kartika Jaya X-2</h2>
          <p className="text-sm">Rekap Nilai Semua Mata Pelajaran</p>
          <p className="text-sm">Kelas: {classRooms.find(c => c.id === selectedClass)?.name}</p>
          <p className="text-xs text-gray-500 mt-1">Bobot: Tugas 20% | UH 25% | PTS 25% | PAS 30%</p>
        </div>

        {/* Info Banner */}
        {studentGrades.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 print:hidden">
            <p className="text-xs text-blue-700"><span className="font-medium">Keterangan:</span> Nilai Akhir = Tugas (20%) + UH (25%) + PTS (25%) + PAS (30%). Klik &quot;Detail per Siswa&quot; untuk melihat breakdown lengkap.</p>
          </div>
        )}


        {/* SUMMARY VIEW */}
        {studentGrades.length > 0 && viewMode === 'summary' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden print:shadow-none">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-xs">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-3 text-left font-medium text-gray-500 uppercase">No</th>
                    <th className="px-3 py-3 text-left font-medium text-gray-500 uppercase min-w-[130px]">Nama Siswa</th>
                    <th className="px-3 py-3 text-center font-medium text-gray-500 uppercase">NIS</th>
                    {courses.map((c) => (
                      <th key={c.id} className="px-2 py-3 text-center font-medium text-gray-500 uppercase" title={c.title}>
                        <div className="flex flex-col items-center">
                          <span className="truncate max-w-[80px]">{c.title.length > 10 ? c.title.substring(0, 10) + '..' : c.title}</span>
                          <div className="flex gap-0.5 mt-1">
                            <span className="w-5 text-[9px] text-blue-600">T</span>
                            <span className="w-5 text-[9px] text-green-600">UH</span>
                            <span className="w-5 text-[9px] text-purple-600">PTS</span>
                            <span className="w-5 text-[9px] text-red-600">PAS</span>
                            <span className="w-6 text-[9px] text-yellow-700 font-bold">NA</span>
                          </div>
                        </div>
                      </th>
                    ))}
                    <th className="px-3 py-3 text-center font-medium text-gray-700 uppercase bg-yellow-50">Rata-rata</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {studentGrades
                    .filter((sg) => !selectedStudent || sg.student.id === selectedStudent)
                    .map((sg, idx) => (
                    <tr key={sg.student.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 text-gray-500">{idx + 1}</td>
                      <td className="px-3 py-2 font-medium text-gray-900">{sg.student.name}</td>
                      <td className="px-3 py-2 text-center text-gray-500">{sg.student.nis || '-'}</td>
                      {sg.courseGrades.map((cg) => (
                        <td key={cg.course.id} className="px-1 py-2 text-center">
                          <div className="flex gap-0.5 justify-center">
                            <span className={`w-5 text-[10px] ${cg.avgTugas >= 70 ? 'text-blue-700' : cg.avgTugas > 0 ? 'text-red-500' : 'text-gray-300'}`}>{cg.avgTugas || '-'}</span>
                            <span className={`w-5 text-[10px] ${cg.avgUH >= 70 ? 'text-green-700' : cg.avgUH > 0 ? 'text-red-500' : 'text-gray-300'}`}>{cg.avgUH || '-'}</span>
                            <span className={`w-5 text-[10px] ${cg.avgPTS >= 70 ? 'text-purple-700' : cg.avgPTS > 0 ? 'text-red-500' : 'text-gray-300'}`}>{cg.avgPTS || '-'}</span>
                            <span className={`w-5 text-[10px] ${cg.avgPAS >= 70 ? 'text-red-700' : cg.avgPAS > 0 ? 'text-red-500' : 'text-gray-300'}`}>{cg.avgPAS || '-'}</span>
                            <span className={`w-6 text-[10px] font-bold ${cg.nilaiAkhir >= 70 ? 'text-green-700' : cg.nilaiAkhir > 0 ? 'text-red-600' : 'text-gray-300'}`}>{cg.nilaiAkhir || '-'}</span>
                          </div>
                        </td>
                      ))}
                      <td className="px-3 py-2 text-center bg-yellow-50">
                        <span className={`text-sm font-bold ${sg.overallAverage >= 70 ? 'text-green-700' : sg.overallAverage > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                          {sg.overallAverage > 0 ? sg.overallAverage : '-'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}


        {/* DETAIL VIEW - Per Student Cards */}
        {studentGrades.length > 0 && viewMode === 'detail' && (
          <div className="space-y-6">
            {studentGrades
              .filter((sg) => !selectedStudent || sg.student.id === selectedStudent)
              .map((sg) => (
              <div key={sg.student.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden print:shadow-none print:break-inside-avoid">
                {/* Student Header */}
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-green-50 to-white">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{sg.student.name}</h3>
                    <p className="text-xs text-gray-500">NIS: {sg.student.nis || '-'} | NISN: {sg.student.nisn || '-'}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-4 py-1.5 rounded-full text-sm font-bold ${sg.overallAverage >= 70 ? 'bg-green-100 text-green-700' : sg.overallAverage > 0 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'}`}>
                      Rata-rata: {sg.overallAverage > 0 ? sg.overallAverage : '-'}
                    </span>
                    <button onClick={() => handlePrintStudent(sg.student.id)} className="text-green-600 hover:text-green-800 text-sm font-medium print:hidden">
                      Cetak
                    </button>
                  </div>
                </div>

                {/* Course Grade Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 text-xs">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2.5 text-left font-medium text-gray-500 uppercase">Mata Pelajaran</th>
                        <th className="px-3 py-2.5 text-center font-medium text-blue-600 uppercase bg-blue-50">Tugas</th>
                        <th className="px-3 py-2.5 text-center font-medium text-green-600 uppercase bg-green-50">UH</th>
                        <th className="px-3 py-2.5 text-center font-medium text-purple-600 uppercase bg-purple-50">PTS</th>
                        <th className="px-3 py-2.5 text-center font-medium text-red-600 uppercase bg-red-50">PAS</th>
                        <th className="px-3 py-2.5 text-center font-medium text-yellow-700 uppercase bg-yellow-50">Nilai Akhir</th>
                        <th className="px-3 py-2.5 text-center font-medium text-gray-500 uppercase">Predikat</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {sg.courseGrades.map((cg) => {
                        const predikat = cg.nilaiAkhir >= 90 ? 'A' : cg.nilaiAkhir >= 80 ? 'B' : cg.nilaiAkhir >= 70 ? 'C' : cg.nilaiAkhir > 0 ? 'D' : '-';
                        const predikatColor = predikat === 'A' ? 'text-green-700 bg-green-100' : predikat === 'B' ? 'text-blue-700 bg-blue-100' : predikat === 'C' ? 'text-yellow-700 bg-yellow-100' : predikat === 'D' ? 'text-red-700 bg-red-100' : 'text-gray-400';
                        return (
                          <tr key={cg.course.id} className="hover:bg-gray-50">
                            <td className="px-4 py-2.5 font-medium text-gray-900">{cg.course.title}</td>
                            <td className="px-3 py-2.5 text-center bg-blue-50/30">
                              <span className={`font-medium ${cg.avgTugas >= 70 ? 'text-green-700' : cg.avgTugas > 0 ? 'text-red-600' : 'text-gray-300'}`}>{cg.avgTugas || '-'}</span>
                            </td>
                            <td className="px-3 py-2.5 text-center bg-green-50/30">
                              <div>
                                <span className={`font-medium ${cg.avgUH >= 70 ? 'text-green-700' : cg.avgUH > 0 ? 'text-red-600' : 'text-gray-300'}`}>{cg.avgUH || '-'}</span>
                                {cg.uhScores.length > 1 && (
                                  <p className="text-[9px] text-gray-400 mt-0.5">{cg.uhScores.map((s, i) => `UH${i+1}:${s??'-'}`).join(' ')}</p>
                                )}
                              </div>
                            </td>
                            <td className="px-3 py-2.5 text-center bg-purple-50/30">
                              <span className={`font-medium ${cg.avgPTS >= 70 ? 'text-green-700' : cg.avgPTS > 0 ? 'text-red-600' : 'text-gray-300'}`}>{cg.avgPTS || '-'}</span>
                            </td>
                            <td className="px-3 py-2.5 text-center bg-red-50/30">
                              <span className={`font-medium ${cg.avgPAS >= 70 ? 'text-green-700' : cg.avgPAS > 0 ? 'text-red-600' : 'text-gray-300'}`}>{cg.avgPAS || '-'}</span>
                            </td>
                            <td className="px-3 py-2.5 text-center bg-yellow-50/30">
                              <span className={`text-sm font-bold ${cg.nilaiAkhir >= 70 ? 'text-green-700' : cg.nilaiAkhir > 0 ? 'text-red-600' : 'text-gray-400'}`}>{cg.nilaiAkhir || '-'}</span>
                            </td>
                            <td className="px-3 py-2.5 text-center">
                              <span className={`px-2 py-0.5 rounded text-xs font-bold ${predikatColor}`}>{predikat}</span>
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


        {/* Class Statistics */}
        {studentGrades.length > 0 && (
          <div className="mt-6 print:mt-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Statistik Kelas</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-green-50 rounded-lg p-4 text-center border border-green-100">
                <p className="text-xs text-green-600 font-medium mb-1">Jumlah Siswa</p>
                <p className="text-2xl font-bold text-green-700">{studentGrades.length}</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 text-center border border-blue-100">
                <p className="text-xs text-blue-600 font-medium mb-1">Rata-rata Kelas</p>
                <p className="text-2xl font-bold text-blue-700">
                  {studentGrades.filter(g => g.overallAverage > 0).length > 0
                    ? Math.round(studentGrades.filter(g => g.overallAverage > 0).reduce((s, g) => s + g.overallAverage, 0) / studentGrades.filter(g => g.overallAverage > 0).length)
                    : '-'}
                </p>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4 text-center border border-yellow-100">
                <p className="text-xs text-yellow-600 font-medium mb-1">Tuntas (KKM 70)</p>
                <p className="text-2xl font-bold text-yellow-700">
                  {studentGrades.filter(g => g.overallAverage >= 70).length}
                  <span className="text-sm font-normal text-yellow-600"> / {studentGrades.length}</span>
                </p>
              </div>
              <div className="bg-red-50 rounded-lg p-4 text-center border border-red-100">
                <p className="text-xs text-red-600 font-medium mb-1">Belum Tuntas</p>
                <p className="text-2xl font-bold text-red-700">
                  {studentGrades.filter(g => g.overallAverage > 0 && g.overallAverage < 70).length}
                </p>
              </div>
            </div>
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
