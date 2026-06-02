'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { getEnrollmentsBySiswa, getCourses, getExamsByCourse, getExamResultBySiswaAndExam, getExamResultsBySiswa, submitExamResult, hasCompletedAllMaterials } from '@/lib/data';
import { Course, Exam, ExamResult } from '@/types';

interface ExamWithStatus {
  exam: Exam;
  courseName: string;
  result?: ExamResult;
  materialsCompleted: boolean;
}

export default function SiswaExamsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [examsWithStatus, setExamsWithStatus] = useState<ExamWithStatus[]>([]);
  const [takingExam, setTakingExam] = useState<Exam | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [lastScore, setLastScore] = useState(0);

  useEffect(() => {
    if (isLoading) return;
    if (!user || user.role !== 'siswa') { router.push('/login'); return; }
    loadData();
  }, [user, isLoading, router]);

  const loadData = () => {
    if (!user) return;
    const enrollments = getEnrollmentsBySiswa(user.id);
    const allCourses = getCourses();
    const allExams: ExamWithStatus[] = [];

    enrollments.forEach((e) => {
      const course = allCourses.find((c) => c.id === e.courseId);
      if (!course) return;
      const exams = getExamsByCourse(e.courseId);
      const materialsCompleted = hasCompletedAllMaterials(user.id, e.courseId);
      exams.forEach((exam) => {
        const result = getExamResultBySiswaAndExam(user.id, exam.id);
        allExams.push({ exam, courseName: course.title, result, materialsCompleted });
      });
    });

    setExamsWithStatus(allExams);
  };

  const startExam = (exam: Exam) => {
    setTakingExam(exam);
    setCurrentQuestion(0);
    setAnswers(new Array(exam.questions.length).fill(-1));
    setShowResult(false);
  };

  const selectAnswer = (answerIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answerIndex;
    setAnswers(newAnswers);
  };

  const handleSubmitExam = () => {
    if (!user || !takingExam) return;
    // Calculate score
    let correct = 0;
    takingExam.questions.forEach((q, idx) => {
      if (answers[idx] === q.correctAnswer) correct++;
    });
    const score = Math.round((correct / takingExam.questions.length) * 100);

    submitExamResult({ examId: takingExam.id, siswaId: user.id, answers, score });
    setLastScore(score);
    setShowResult(true);
    loadData();
  };

  const exitExam = () => {
    setTakingExam(null);
    setShowResult(false);
    setAnswers([]);
    setCurrentQuestion(0);
  };

  if (isLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div></div>;
  }

  // TAKING EXAM VIEW
  if (takingExam && !showResult) {
    const question = takingExam.questions[currentQuestion];
    const totalQuestions = takingExam.questions.length;
    const answeredCount = answers.filter((a) => a !== -1).length;

    return (
      <div className="min-h-screen bg-white">
        {/* Top bar */}
        <div className="sticky top-0 bg-white border-b shadow-sm z-10">
          <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-900 text-sm">{takingExam.title}</h2>
              <p className="text-xs text-gray-500">Soal {currentQuestion + 1} dari {totalQuestions}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">{answeredCount}/{totalQuestions} dijawab</span>
              <div className="w-24 bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full transition-all" style={{ width: `${((currentQuestion + 1) / totalQuestions) * 100}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Question */}
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="mb-8">
            <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium mb-4">Pertemuan {takingExam.pertemuan}</span>
            <h1 className="text-xl font-bold text-gray-900 mb-2">Soal {currentQuestion + 1}</h1>
            <p className="text-lg text-gray-700">{question.question}</p>
          </div>

          {/* Options */}
          <div className="space-y-3 mb-8">
            {question.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => selectAnswer(idx)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                  answers[currentQuestion] === idx
                    ? 'border-green-500 bg-green-50 ring-2 ring-green-200'
                    : 'border-gray-200 hover:border-green-300 hover:bg-green-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    answers[currentQuestion] === idx ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="text-gray-800">{option}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center border-t pt-4">
            <button
              onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
              disabled={currentQuestion === 0}
              className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sebelumnya
            </button>
            <div className="flex gap-1">
              {takingExam.questions.map((_, idx) => (
                <button key={idx} onClick={() => setCurrentQuestion(idx)} className={`w-8 h-8 rounded-full text-xs font-medium ${
                  idx === currentQuestion ? 'bg-green-600 text-white' : answers[idx] !== -1 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                }`}>{idx + 1}</button>
              ))}
            </div>
            {currentQuestion === totalQuestions - 1 ? (
              <button
                onClick={handleSubmitExam}
                disabled={answeredCount < totalQuestions}
                className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Selesai & Kirim
              </button>
            ) : (
              <button
                onClick={() => setCurrentQuestion(currentQuestion + 1)}
                className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium"
              >
                Selanjutnya
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // RESULT VIEW
  if (showResult && takingExam) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${lastScore >= 70 ? 'bg-green-100' : 'bg-red-100'}`}>
            <span className={`text-3xl font-bold ${lastScore >= 70 ? 'text-green-600' : 'text-red-600'}`}>{lastScore}</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {lastScore >= 70 ? 'Selamat!' : 'Tetap Semangat!'}
          </h2>
          <p className="text-gray-500 mb-4">Nilai kamu: <span className="font-bold text-gray-900">{lastScore}/100</span></p>
          <p className="text-sm text-gray-400 mb-6">{takingExam.title}</p>
          <div className="flex gap-3">
            <button onClick={exitExam} className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium">Kembali ke Daftar Exam</button>
          </div>
        </div>
      </div>
    );
  }

  // EXAM LIST VIEW
  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Exam (Pilihan Ganda)</h1>
          <p className="text-gray-500 text-sm mt-1">Kerjakan ujian pilihan ganda dari mata pelajaran yang kamu ikuti</p>
        </div>

        {examsWithStatus.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
            <p className="text-gray-500">Belum ada exam yang tersedia. Daftar kursus terlebih dahulu.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {examsWithStatus.map(({ exam, courseName, result, materialsCompleted }) => (
              <div key={exam.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">Pertemuan {exam.pertemuan}</span>
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">{courseName}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{exam.title}</h3>
                    <p className="text-sm text-gray-500 mb-2">{exam.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span>{exam.questions.length} soal</span>
                      <span>{exam.duration} menit</span>
                    </div>
                  </div>
                  <div className="ml-4 text-right">
                    {result ? (
                      <div>
                        <span className={`inline-block px-3 py-1.5 rounded-full text-sm font-bold ${result.score >= 70 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          Nilai: {result.score}
                        </span>
                        <p className="text-xs text-gray-400 mt-1">Sudah dikerjakan</p>
                      </div>
                    ) : !materialsCompleted ? (
                      <div>
                        <button disabled className="px-4 py-2 bg-gray-200 text-gray-500 rounded-lg text-sm font-medium cursor-not-allowed">Kerjakan</button>
                        <p className="text-xs text-yellow-600 mt-1 max-w-[140px]">Baca semua materi dulu</p>
                      </div>
                    ) : (
                      <button onClick={() => startExam(exam)} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors">
                        Kerjakan
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Exam Results Summary */}
        {examsWithStatus.some((e) => e.result) && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Daftar Nilai Exam</h2>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Exam</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mata Pelajaran</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Pertemuan</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Nilai</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {examsWithStatus.filter((e) => e.result).map(({ exam, courseName, result }) => (
                    <tr key={exam.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{exam.title}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{courseName}</td>
                      <td className="px-4 py-3 text-center text-sm text-gray-500">Pertemuan {exam.pertemuan}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`font-bold text-sm ${result!.score >= 70 ? 'text-green-700' : 'text-red-600'}`}>{result!.score}</span>
                      </td>
                      <td className="px-4 py-3 text-center text-xs text-gray-400">{new Date(result!.submittedAt).toLocaleDateString('id-ID')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
