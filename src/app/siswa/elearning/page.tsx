'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { getCourseIdsForSiswa, getCourses, getBankSoal, getMaterialsByCourse } from '@/lib/data';
import { BankSoal, Course } from '@/types';

interface QuizSet {
  course: Course;
  questions: BankSoal[];
  canTake: boolean;
  materiCount: number;
  materiViewed: number;
}

export default function SiswaElearningPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [quizSets, setQuizSets] = useState<QuizSet[]>([]);
  const [activeQuiz, setActiveQuiz] = useState<QuizSet | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [history, setHistory] = useState<{courseId: string; score: number; date: string}[]>([]);

  useEffect(() => {
    if (isLoading) return;
    if (!user || user.role !== 'siswa') { router.push('/login'); return; }
    loadData();
  }, [user, isLoading, router]);

  const loadData = () => {
    if (!user) return;
    const accessibleCourseIds = getCourseIdsForSiswa(user.id);
    const courses = getCourses();
    const allSoal = getBankSoal();
    const viewedStr = localStorage.getItem('lms_viewed_materials');
    const viewedIds: string[] = viewedStr ? JSON.parse(viewedStr) : [];

    const sets: QuizSet[] = accessibleCourseIds.map(courseId => {
      const course = courses.find(c => c.id === courseId);
      if (!course) return null;
      const questions = allSoal.filter(s => s.courseId === courseId);
      const materials = getMaterialsByCourse(courseId);
      const materiViewed = materials.filter(m => viewedIds.includes(m.id)).length;
      const canTake = materials.length > 0 && materials.every(m => viewedIds.includes(m.id));
      return { course, questions, canTake, materiCount: materials.length, materiViewed };
    }).filter(Boolean) as QuizSet[];

    setQuizSets(sets.filter(s => s.questions.length > 0));

    // Load history from localStorage
    const histStr = localStorage.getItem('lms_elearning_history_' + user.id);
    if (histStr) setHistory(JSON.parse(histStr));
  };

  const startQuiz = (quiz: QuizSet) => {
    setActiveQuiz(quiz);
    setAnswers(new Array(quiz.questions.length).fill(-1));
    setSubmitted(false);
    setScore(0);
  };

  const handleSubmit = () => {
    if (!activeQuiz || !user) return;
    let correct = 0;
    activeQuiz.questions.forEach((q, i) => {
      if (answers[i] === q.correctAnswer) correct++;
    });
    const finalScore = Math.round((correct / activeQuiz.questions.length) * 100);
    setScore(finalScore);
    setSubmitted(true);

    // Save to history
    const newHistory = [...history, { courseId: activeQuiz.course.id, score: finalScore, date: new Date().toISOString() }];
    setHistory(newHistory);
    localStorage.setItem('lms_elearning_history_' + user.id, JSON.stringify(newHistory));
  };

  if (isLoading || !user) return null;

  // Active quiz - answering
  if (activeQuiz && !submitted) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border sticky top-0 z-10">
            <div>
              <h2 className="text-lg font-bold text-gray-800">Latihan: {activeQuiz.course.title}</h2>
              <p className="text-xs text-gray-500">{activeQuiz.questions.length} soal pilihan ganda | Tanpa batas waktu</p>
            </div>
            <button onClick={() => setActiveQuiz(null)} className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1 border rounded-lg">Kembali</button>
          </div>
          <div className="space-y-4">
            {activeQuiz.questions.map((q, i) => (
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
            <p className="text-sm text-gray-500">Terjawab: {answers.filter(a => a !== -1).length}/{activeQuiz.questions.length}</p>
            <button onClick={handleSubmit} className="px-6 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors">
              Selesai & Lihat Nilai
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Score result
  if (submitted && activeQuiz) {
    return (
      <DashboardLayout>
        <div className="max-w-md mx-auto mt-12">
          <div className="bg-white rounded-2xl p-8 shadow-sm border text-center">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${score >= 75 ? 'bg-primary-100' : score >= 50 ? 'bg-amber-100' : 'bg-accent-100'}`}>
              <span className={`text-3xl font-bold ${score >= 75 ? 'text-primary-700' : score >= 50 ? 'text-amber-700' : 'text-accent-700'}`}>{score}</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-1">Latihan Selesai!</h2>
            <p className="text-gray-500 mb-2">{activeQuiz.course.title}</p>
            <p className="text-sm text-gray-400 mb-6">Benar: {activeQuiz.questions.filter((q, i) => answers[i] === q.correctAnswer).length}/{activeQuiz.questions.length}</p>
            <div className="flex space-x-3">
              <button onClick={() => { setActiveQuiz(null); setSubmitted(false); }} className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors">
                Kembali
              </button>
              <button onClick={() => { setSubmitted(false); setAnswers(new Array(activeQuiz.questions.length).fill(-1)); }} className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors">
                Coba Lagi
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Quiz list
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">E-Learning</h2>
          <p className="text-sm text-gray-500 mt-1">Latihan soal pilihan ganda untuk memperdalam pemahaman. Tidak memerlukan token. Wajib membaca materi terlebih dahulu.</p>
        </div>

        <div className="space-y-4">
          {quizSets.map(quiz => {
            const lastAttempt = history.filter(h => h.courseId === quiz.course.id).slice(-1)[0];
            return (
              <div key={quiz.course.id} className="bg-white rounded-xl p-5 shadow-sm border hover:shadow-md transition-shadow">
                <div className="flex justify-between items-center">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800">{quiz.course.title}</h3>
                      <p className="text-sm text-gray-500 mt-0.5">{quiz.questions.length} soal pilihan ganda</p>
                      <div className="flex items-center space-x-3 mt-1">
                        <span className="text-xs text-gray-400">Materi dibaca: {quiz.materiViewed}/{quiz.materiCount}</span>
                        {lastAttempt && <span className="text-xs text-primary-600 font-medium">Nilai terakhir: {lastAttempt.score}</span>}
                      </div>
                    </div>
                  </div>
                  <div>
                    {quiz.canTake ? (
                      <button onClick={() => startQuiz(quiz)} className="px-4 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors shadow-sm">
                        Kerjakan
                      </button>
                    ) : (
                      <div className="text-right">
                        <span className="px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg text-xs font-medium border border-amber-200">Baca materi dulu</span>
                        <p className="text-xs text-gray-400 mt-1">{quiz.materiViewed}/{quiz.materiCount} materi</p>
                      </div>
                    )}
                  </div>
                </div>
                {!quiz.canTake && (
                  <div className="mt-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
                    <p className="text-xs text-amber-700">Anda harus membaca semua materi ({quiz.materiCount} materi) terlebih dahulu sebelum mengerjakan latihan ini. Buka menu &quot;Materi Pembelajaran&quot; dan klik &quot;Baca&quot; pada setiap materi.</p>
                  </div>
                )}
              </div>
            );
          })}
          {quizSets.length === 0 && (
            <div className="bg-white rounded-xl p-8 shadow-sm border text-center">
              <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
              <p className="text-sm text-gray-500">Belum ada latihan soal yang tersedia.</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
