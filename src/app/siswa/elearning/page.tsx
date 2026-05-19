'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { getEnrollmentsBySiswa, getCourses, getExams, getBankSoal, getMaterialsByCourse, getExamResultsBySiswa, createExamResult } from '@/lib/data';
import { Exam, BankSoal, Course } from '@/types';

export default function SiswaElearningPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [exams, setExams] = useState<(Exam & {courseName: string; canTake: boolean; done: boolean})[]>([]);
  const [activeExam, setActiveExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<BankSoal[]>([]);
  const [answers, setAnswers] = useState<number[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (isLoading) return;
    if (!user || user.role !== 'siswa') { router.push('/login'); return; }
    loadExams();
  }, [user, isLoading, router]);

  const loadExams = () => {
    if (!user) return;
    const enrollments = getEnrollmentsBySiswa(user.id);
    const courses = getCourses();
    const allExams = getExams();
    const results = getExamResultsBySiswa(user.id);
    const viewedStr = localStorage.getItem('lms_viewed_materials');
    const viewedIds: string[] = viewedStr ? JSON.parse(viewedStr) : [];

    const enrolledCourseIds = enrollments.map(e => e.courseId);
    const examList = allExams
      .filter(e => enrolledCourseIds.includes(e.courseId))
      .map(exam => {
        const course = courses.find(c => c.id === exam.courseId);
        const materials = getMaterialsByCourse(exam.courseId);
        const allViewed = materials.length > 0 && materials.every(m => viewedIds.includes(m.id));
        const done = results.some(r => r.examId === exam.id);
        return { ...exam, courseName: course?.title || '-', canTake: allViewed, done };
      });
    setExams(examList);
  };


  const startExam = (exam: Exam) => {
    const allSoal = getBankSoal();
    const examQuestions = exam.questions.map(qId => allSoal.find(s => s.id === qId)).filter(Boolean) as BankSoal[];
    setQuestions(examQuestions);
    setAnswers(new Array(examQuestions.length).fill(-1));
    setActiveExam(exam);
    setSubmitted(false);
  };

  const handleSubmit = () => {
    if (!activeExam || !user) return;
    let correct = 0;
    questions.forEach((q, i) => { if (answers[i] === q.correctAnswer) correct++; });
    const finalScore = Math.round((correct / questions.length) * 100);
    setScore(finalScore);
    createExamResult({ examId: activeExam.id, siswaId: user.id, siswaName: user.name, answers, score: finalScore });
    setSubmitted(true);
    loadExams();
  };

  if (isLoading || !user) return null;

  if (activeExam && !submitted) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">{activeExam.title}</h2>
            <button onClick={() => setActiveExam(null)} className="text-sm text-gray-500 hover:text-gray-700">Kembali</button>
          </div>
          <div className="space-y-4">
            {questions.map((q, i) => (
              <div key={q.id} className="bg-white rounded-xl p-5 shadow-sm border">
                <p className="font-medium text-gray-800 mb-3">{i+1}. {q.question}</p>
                <div className="space-y-2">
                  {q.options.map((opt, oi) => (
                    <label key={oi} className={`flex items-center space-x-3 p-2 rounded-lg cursor-pointer ${answers[i] === oi ? 'bg-primary-50 border border-primary-300' : 'hover:bg-gray-50'}`}>
                      <input type="radio" name={`q_${i}`} checked={answers[i] === oi} onChange={() => { const n = [...answers]; n[i] = oi; setAnswers(n); }} className="text-primary-600" />
                      <span className="text-sm">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <button onClick={handleSubmit} className="px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700">Kumpulkan</button>
        </div>
      </DashboardLayout>
    );
  }


  if (submitted) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-8 shadow-sm border text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Ujian Selesai!</h2>
            <p className="text-4xl font-bold text-primary-600 mb-4">{score}</p>
            <p className="text-gray-600">Nilai kamu telah disimpan.</p>
            <button onClick={() => { setActiveExam(null); setSubmitted(false); }} className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm">Kembali ke Daftar</button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">E-Learning - Ujian Harian</h2>
        <div className="space-y-4">
          {exams.map(exam => (
            <div key={exam.id} className="bg-white rounded-xl p-5 shadow-sm border">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-gray-800">{exam.title}</h3>
                  <p className="text-sm text-gray-500">{exam.courseName} | {exam.questions.length} soal | {exam.duration} menit</p>
                </div>
                <div>
                  {exam.done ? (
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-medium">Sudah Dikerjakan</span>
                  ) : exam.canTake ? (
                    <button onClick={() => startExam(exam)} className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700">Kerjakan</button>
                  ) : (
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-lg text-xs font-medium">Baca materi dulu</span>
                  )}
                </div>
              </div>
              {!exam.canTake && !exam.done && (
                <p className="text-xs text-accent-600 mt-2">Anda harus melihat materi terlebih dahulu sebelum mengerjakan ujian ini.</p>
              )}
            </div>
          ))}
          {exams.length === 0 && <p className="text-sm text-gray-500">Belum ada ujian yang tersedia.</p>}
        </div>
      </div>
    </DashboardLayout>
  );
}
