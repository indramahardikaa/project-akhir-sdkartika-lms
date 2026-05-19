'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { getCourseIdsForSiswa, getCourses, getExams, getBankSoal, getExamResultsBySiswa, createExamResult } from '@/lib/data';
import { Exam, BankSoal } from '@/types';

export default function SiswaUjianPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [exams, setExams] = useState<(Exam & { courseName: string; done: boolean })[]>([]);
  const [activeExam, setActiveExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<BankSoal[]>([]);
  const [answers, setAnswers] = useState<number[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [tokenInput, setTokenInput] = useState('');
  const [tokenError, setTokenError] = useState('');
  const [examToStart, setExamToStart] = useState<Exam | null>(null);

  useEffect(() => {
    if (isLoading) return;
    if (!user || user.role !== 'siswa') { router.push('/login'); return; }
    loadExams();
  }, [user, isLoading, router]);

  const loadExams = () => {
    if (!user) return;
    const accessibleCourseIds = getCourseIdsForSiswa(user.id);
    const courses = getCourses();
    const allExams = getExams();
    const results = getExamResultsBySiswa(user.id);

    const examList = allExams
      .filter(e => accessibleCourseIds.includes(e.courseId))
      .map(exam => {
        const course = courses.find(c => c.id === exam.courseId);
        const done = results.some(r => r.examId === exam.id);
        return { ...exam, courseName: course?.title || '-', done };
      });
    setExams(examList);
  };

  const handleTokenSubmit = () => {
    if (!examToStart) return;
    if (tokenInput.trim() === examToStart.token) {
      const allSoal = getBankSoal();
      const examQuestions = examToStart.questions.map(qId => allSoal.find(s => s.id === qId)).filter(Boolean) as BankSoal[];
      setQuestions(examQuestions);
      setAnswers(new Array(examQuestions.length).fill(-1));
      setActiveExam(examToStart);
      setExamToStart(null);
      setTokenInput('');
      setTokenError('');
      setSubmitted(false);
    } else {
      setTokenError('Token salah! Silakan coba lagi.');
    }
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

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'UH': return 'bg-blue-100 text-blue-700';
      case 'UTS': return 'bg-amber-100 text-amber-700';
      case 'UAS': return 'bg-accent-100 text-accent-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (isLoading || !user) return null;

  // Token entry screen
  if (examToStart) {
    return (
      <DashboardLayout>
        <div className="max-w-md mx-auto mt-12">
          <div className="bg-white rounded-2xl p-8 shadow-sm border text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-1">{examToStart.title}</h2>
            <p className="text-sm text-gray-500 mb-1">Tipe: {examToStart.type} | Durasi: {examToStart.duration} menit</p>
            <p className="text-sm text-gray-500 mb-6">{examToStart.questions.length} soal pilihan ganda</p>
            <p className="text-sm font-medium text-gray-700 mb-3">Masukkan Token Ujian:</p>
            <input
              type="text"
              value={tokenInput}
              onChange={(e) => { setTokenInput(e.target.value); setTokenError(''); }}
              placeholder="Masukkan token..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-center text-lg font-mono focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            {tokenError && <p className="text-sm text-accent-600 mt-2">{tokenError}</p>}
            <div className="flex space-x-3 mt-6">
              <button onClick={handleTokenSubmit} className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors">
                Mulai Ujian
              </button>
              <button onClick={() => { setExamToStart(null); setTokenInput(''); setTokenError(''); }} className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors">
                Batal
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Active exam - answer questions
  if (activeExam && !submitted) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border sticky top-0 z-10">
            <div>
              <h2 className="text-lg font-bold text-gray-800">{activeExam.title}</h2>
              <p className="text-xs text-gray-500">{activeExam.type} | {questions.length} soal | {activeExam.duration} menit</p>
            </div>
            <button onClick={() => setActiveExam(null)} className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1 border rounded-lg">Batalkan</button>
          </div>
          <div className="space-y-4">
            {questions.map((q, i) => (
              <div key={q.id} className="bg-white rounded-xl p-5 shadow-sm border">
                <p className="font-medium text-gray-800 mb-3">{i + 1}. {q.question}</p>
                <div className="space-y-2">
                  {q.options.map((opt, oi) => (
                    <label key={oi} className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer border transition-all ${answers[i] === oi ? 'bg-primary-50 border-primary-300 shadow-sm' : 'border-gray-100 hover:bg-gray-50'}`}>
                      <input type="radio" name={`q_${i}`} checked={answers[i] === oi} onChange={() => { const n = [...answers]; n[i] = oi; setAnswers(n); }} className="text-primary-600 w-4 h-4" />
                      <span className="text-sm text-gray-700">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border flex justify-between items-center">
            <p className="text-sm text-gray-500">Terjawab: {answers.filter(a => a !== -1).length}/{questions.length}</p>
            <button onClick={handleSubmit} disabled={answers.some(a => a === -1)} className="px-6 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              Kumpulkan Jawaban
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Score result
  if (submitted) {
    return (
      <DashboardLayout>
        <div className="max-w-md mx-auto mt-12">
          <div className="bg-white rounded-2xl p-8 shadow-sm border text-center">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${score >= 75 ? 'bg-primary-100' : score >= 50 ? 'bg-amber-100' : 'bg-accent-100'}`}>
              <span className={`text-3xl font-bold ${score >= 75 ? 'text-primary-700' : score >= 50 ? 'text-amber-700' : 'text-accent-700'}`}>{score}</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Ujian Selesai!</h2>
            <p className="text-gray-500 mb-6">Nilai kamu telah disimpan.</p>
            <button onClick={() => { setActiveExam(null); setSubmitted(false); }} className="px-6 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors">
              Kembali ke Daftar Ujian
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Exam list
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Ujian</h2>
          <p className="text-sm text-gray-500 mt-1">Ujian Harian (UH), Ujian Tengah Semester (UTS), dan Ujian Akhir Semester (UAS). Memerlukan token dari guru.</p>
        </div>

        {/* Filter by type */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {['UH', 'UTS', 'UAS'].map(type => {
            const typeExams = exams.filter(e => e.type === type);
            return (
              <div key={type} className="bg-white rounded-xl p-4 shadow-sm border">
                <div className="flex items-center justify-between mb-3">
                  <span className={`px-3 py-1 rounded-lg text-xs font-bold ${getTypeBadge(type)}`}>{type}</span>
                  <span className="text-xs text-gray-400">{typeExams.length} ujian</span>
                </div>
                <p className="text-sm text-gray-600">
                  {type === 'UH' && 'Ulangan Harian'}
                  {type === 'UTS' && 'Ujian Tengah Semester'}
                  {type === 'UAS' && 'Ujian Akhir Semester'}
                </p>
              </div>
            );
          })}
        </div>

        {/* Exam list */}
        <div className="space-y-4">
          {exams.map(exam => (
            <div key={exam.id} className="bg-white rounded-xl p-5 shadow-sm border hover:shadow-md transition-shadow">
              <div className="flex justify-between items-center">
                <div className="flex items-start space-x-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getTypeBadge(exam.type)}`}>
                    <span className="text-sm font-bold">{exam.type}</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">{exam.title}</h3>
                    <p className="text-sm text-gray-500 mt-0.5">{exam.courseName}</p>
                    <div className="flex items-center space-x-3 mt-1">
                      <span className="text-xs text-gray-400">{exam.questions.length} soal</span>
                      <span className="text-xs text-gray-400">{exam.duration} menit</span>
                    </div>
                  </div>
                </div>
                <div>
                  {exam.done ? (
                    <span className="px-4 py-2 bg-primary-50 text-primary-700 rounded-xl text-xs font-semibold border border-primary-200">Sudah Dikerjakan</span>
                  ) : (
                    <button onClick={() => setExamToStart(exam)} className="px-4 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors shadow-sm">
                      Masukkan Token
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          {exams.length === 0 && (
            <div className="bg-white rounded-xl p-8 shadow-sm border text-center">
              <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              <p className="text-sm text-gray-500">Belum ada ujian yang tersedia.</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
