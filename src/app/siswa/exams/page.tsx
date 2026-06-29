'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import {
  getEnrollmentsBySiswa, getCourses, getExamsByCourse, getExamsByClass,
  getExamResultBySiswaAndExam, getExamResultsBySiswa, autoGradeExam,
  getShuffledExam, validateExamToken, startExamResult
} from '@/lib/data';
import { Course, Exam, ExamResult, ExamAnswer, ExamType } from '@/types';

interface ExamWithStatus {
  exam: Exam;
  courseName: string;
  result?: ExamResult;
}

export default function SiswaExamsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [examsWithStatus, setExamsWithStatus] = useState<ExamWithStatus[]>([]);
  const [takingExam, setTakingExam] = useState<Exam | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<ExamAnswer[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [lastScore, setLastScore] = useState(0);
  const [tokenInput, setTokenInput] = useState('');
  const [tokenError, setTokenError] = useState('');
  const [pendingExam, setPendingExam] = useState<Exam | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [filterType, setFilterType] = useState<ExamType | 'all'>('all');
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<string>('');


  useEffect(() => {
    if (isLoading) return;
    if (!user || user.role !== 'siswa') { router.push('/login'); return; }
    loadData();
  }, [user, isLoading, router]);

  const loadData = useCallback(() => {
    if (!user) return;
    const allCourses = getCourses();
    const allExams: ExamWithStatus[] = [];

    // Get exams by class
    if (user.classId) {
      const classExams = getExamsByClass(user.classId);
      classExams.forEach((exam) => {
        if (exam.status !== 'active' && exam.status !== 'finished') return;
        const course = allCourses.find((c) => c.id === exam.courseId);
        if (!course) return;
        const result = getExamResultBySiswaAndExam(user.id, exam.id);
        allExams.push({ exam, courseName: course.title, result });
      });
    }

    // Also get exams from enrolled courses (for backward compatibility)
    const enrollments = getEnrollmentsBySiswa(user.id);
    enrollments.forEach((e) => {
      const course = allCourses.find((c) => c.id === e.courseId);
      if (!course) return;
      const exams = getExamsByCourse(e.courseId);
      exams.forEach((exam) => {
        if (exam.status !== 'active' && exam.status !== 'finished') return;
        if (allExams.some((ae) => ae.exam.id === exam.id)) return; // skip duplicates
        const result = getExamResultBySiswaAndExam(user.id, exam.id);
        allExams.push({ exam, courseName: course.title, result });
      });
    });

    setExamsWithStatus(allExams);
  }, [user]);

  // Timer effect
  useEffect(() => {
    if (!takingExam || showResult) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Auto-submit when time is up
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [takingExam, showResult]);

  const handleAutoSubmit = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    submitExam();
  };


  const handleTokenSubmit = (exam: Exam) => {
    setPendingExam(exam);
    setTokenInput('');
    setTokenError('');
  };

  const verifyToken = () => {
    if (!pendingExam) return;
    if (validateExamToken(pendingExam.id, tokenInput)) {
      startExam(pendingExam);
      setPendingExam(null);
      setTokenInput('');
      setTokenError('');
    } else {
      setTokenError('Token salah! Silakan coba lagi.');
    }
  };

  const startExam = (exam: Exam) => {
    if (!user) return;
    // Shuffle exam if enabled
    const examToTake = getShuffledExam(exam);
    setTakingExam(examToTake);
    setCurrentQuestion(0);
    // Initialize answers
    const initialAnswers: ExamAnswer[] = examToTake.questions.map((q) => ({
      questionId: q.id,
      type: q.type,
      selectedOption: undefined,
      essayAnswer: undefined,
    }));
    setAnswers(initialAnswers);
    setShowResult(false);
    setTimeLeft(exam.duration * 60); // convert minutes to seconds
    startTimeRef.current = new Date().toISOString();
    // Record start
    startExamResult(exam.id, user.id);
  };

  const selectAnswer = (questionId: string, answerIndex: number) => {
    setAnswers((prev) => prev.map((a) => a.questionId === questionId ? { ...a, selectedOption: answerIndex } : a));
  };

  const setEssayAnswer = (questionId: string, text: string) => {
    setAnswers((prev) => prev.map((a) => a.questionId === questionId ? { ...a, essayAnswer: text } : a));
  };

  const submitExam = () => {
    if (!user || !takingExam) return;
    if (timerRef.current) clearInterval(timerRef.current);
    const result = autoGradeExam(takingExam.id, user.id, answers);
    setLastScore(result.score);
    setShowResult(true);
    loadData();
  };

  const handleSubmitExam = () => {
    const unanswered = answers.filter((a) => {
      if (a.type === 'pilihan_ganda') return a.selectedOption === undefined;
      if (a.type === 'essay') return !a.essayAnswer || a.essayAnswer.trim() === '';
      return false;
    });
    if (unanswered.length > 0) {
      if (!confirm(`Masih ada ${unanswered.length} soal yang belum dijawab. Yakin ingin mengumpulkan?`)) return;
    }
    submitExam();
  };

  const exitExam = () => {
    setTakingExam(null);
    setShowResult(false);
    setAnswers([]);
    setCurrentQuestion(0);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getExamTypeBadge = (type: ExamType) => {
    const styles = { UH: 'bg-blue-100 text-blue-700', PTS: 'bg-purple-100 text-purple-700', PAS: 'bg-red-100 text-red-700' };
    return <span className={`px-2 py-0.5 rounded text-xs font-medium ${styles[type]}`}>{type}</span>;
  };

  const filteredExams = filterType === 'all' ? examsWithStatus : examsWithStatus.filter((e) => e.exam.examType === filterType);


  if (isLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div></div>;
  }

  // TOKEN INPUT VIEW
  if (pendingExam) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Masukkan Token Ujian</h2>
            <p className="text-sm text-gray-500">{pendingExam.title}</p>
            <p className="text-xs text-gray-400 mt-1">Minta token kepada guru pengawas</p>
          </div>
          <div className="space-y-4">
            <input
              type="text"
              value={tokenInput}
              onChange={(e) => { setTokenInput(e.target.value.toUpperCase()); setTokenError(''); }}
              placeholder="Masukkan 6 digit token"
              maxLength={6}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-center text-2xl font-mono font-bold tracking-widest text-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-200 uppercase"
              autoFocus
            />
            {tokenError && <p className="text-red-500 text-sm text-center">{tokenError}</p>}
            <div className="flex gap-3">
              <button onClick={() => setPendingExam(null)} className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50">Batal</button>
              <button onClick={verifyToken} disabled={tokenInput.length < 6} className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed">Mulai Ujian</button>
            </div>
          </div>
          <div className="mt-6 bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500"><span className="font-medium">Info:</span> Durasi: {pendingExam.duration} menit | {pendingExam.questions.length} soal | {getExamTypeBadge(pendingExam.examType)}</p>
          </div>
        </div>
      </div>
    );
  }


  // TAKING EXAM VIEW
  if (takingExam && !showResult) {
    const question = takingExam.questions[currentQuestion];
    const totalQuestions = takingExam.questions.length;
    const answeredCount = answers.filter((a) => {
      if (a.type === 'pilihan_ganda') return a.selectedOption !== undefined;
      if (a.type === 'essay') return a.essayAnswer && a.essayAnswer.trim() !== '';
      return false;
    }).length;
    const currentAnswer = answers.find((a) => a.questionId === question.id);
    const isTimeCritical = timeLeft <= 60;

    return (
      <div className="min-h-screen bg-white">
        {/* Top bar with timer */}
        <div className="sticky top-0 bg-white border-b shadow-sm z-10">
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-900 text-sm">{takingExam.title}</h2>
              <p className="text-xs text-gray-500">Soal {currentQuestion + 1} dari {totalQuestions} | {question.type === 'essay' ? 'Essay' : 'Pilihan Ganda'}</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">{answeredCount}/{totalQuestions} dijawab</span>
              <div className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-mono text-sm font-bold ${isTimeCritical ? 'bg-red-100 text-red-700 animate-pulse' : 'bg-green-100 text-green-700'}`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {formatTime(timeLeft)}
              </div>
            </div>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-gray-100 h-1">
            <div className="bg-green-500 h-1 transition-all" style={{ width: `${((currentQuestion + 1) / totalQuestions) * 100}%` }}></div>
          </div>
        </div>

        {/* Question Content */}
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              {getExamTypeBadge(takingExam.examType)}
              <span className={`text-xs px-2 py-0.5 rounded ${question.type === 'essay' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                {question.type === 'essay' ? 'Essay' : 'Pilihan Ganda'}
              </span>
              <span className="text-xs text-gray-400">Bobot: {question.weight}</span>
            </div>
            <h1 className="text-lg font-bold text-gray-900 mb-2">Soal {currentQuestion + 1}</h1>
            <p className="text-gray-700 whitespace-pre-wrap">{question.question}</p>
          </div>


          {/* Answer Area */}
          {question.type === 'pilihan_ganda' ? (
            <div className="space-y-3 mb-8">
              {question.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => selectAnswer(question.id, idx)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                    currentAnswer?.selectedOption === idx
                      ? 'border-green-500 bg-green-50 ring-2 ring-green-200'
                      : 'border-gray-200 hover:border-green-300 hover:bg-green-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      currentAnswer?.selectedOption === idx ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="text-gray-800">{option}</span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="mb-8">
              <textarea
                value={currentAnswer?.essayAnswer || ''}
                onChange={(e) => setEssayAnswer(question.id, e.target.value)}
                placeholder="Tulis jawaban essay kamu di sini..."
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-200 min-h-[200px] resize-y"
                rows={8}
              />
              <p className="text-xs text-gray-400 mt-1">{(currentAnswer?.essayAnswer || '').length} karakter</p>
            </div>
          )}

          {/* Question Navigation Dots */}
          <div className="flex flex-wrap gap-1.5 mb-6 justify-center">
            {takingExam.questions.map((q, idx) => {
              const ans = answers.find((a) => a.questionId === q.id);
              const isAnswered = q.type === 'pilihan_ganda' ? ans?.selectedOption !== undefined : (ans?.essayAnswer && ans.essayAnswer.trim() !== '');
              return (
                <button key={idx} onClick={() => setCurrentQuestion(idx)} className={`w-8 h-8 rounded-full text-xs font-medium transition-all ${
                  idx === currentQuestion ? 'bg-green-600 text-white ring-2 ring-green-300' : isAnswered ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}>{idx + 1}</button>
              );
            })}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center border-t pt-4">
            <button onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))} disabled={currentQuestion === 0} className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed">
              Sebelumnya
            </button>
            {currentQuestion === totalQuestions - 1 ? (
              <button onClick={handleSubmitExam} className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium">
                Kumpulkan Ujian
              </button>
            ) : (
              <button onClick={() => setCurrentQuestion(currentQuestion + 1)} className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium">
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
    const hasEssay = takingExam.questions.some((q) => q.type === 'essay');
    const allPG = !hasEssay;
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${allPG ? (lastScore >= 70 ? 'bg-green-100' : 'bg-red-100') : 'bg-purple-100'}`}>
            {allPG ? (
              <span className={`text-3xl font-bold ${lastScore >= 70 ? 'text-green-600' : 'text-red-600'}`}>{lastScore}</span>
            ) : (
              <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            )}
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {allPG ? (lastScore >= 70 ? 'Selamat!' : 'Tetap Semangat!') : 'Ujian Terkirim!'}
          </h2>
          {allPG ? (
            <p className="text-gray-500 mb-2">Nilai kamu: <span className="font-bold text-gray-900">{lastScore}/100</span></p>
          ) : (
            <div className="mb-4">
              <p className="text-gray-500 mb-1">Nilai sementara (Pilihan Ganda): <span className="font-bold text-gray-900">{lastScore}</span></p>
              <p className="text-sm text-purple-600">Soal essay akan dinilai oleh guru. Nilai akhir akan diupdate setelah penilaian selesai.</p>
            </div>
          )}
          <p className="text-sm text-gray-400 mb-6">{takingExam.title}</p>
          <button onClick={exitExam} className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-medium">Kembali ke Daftar Ujian</button>
        </div>
      </div>
    );
  }


  // EXAM LIST VIEW
  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Ujian</h1>
          <p className="text-gray-500 text-sm mt-1">Kerjakan ujian (UH, PTS, PAS) dari mata pelajaran yang tersedia</p>
        </div>

        {/* Filter by Type */}
        <div className="flex gap-2 mb-6">
          {(['all', 'UH', 'PTS', 'PAS'] as const).map((type) => (
            <button key={type} onClick={() => setFilterType(type)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterType === type ? 'bg-green-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
              {type === 'all' ? 'Semua' : type}
            </button>
          ))}
        </div>

        {filteredExams.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            <p className="text-gray-500">Belum ada ujian yang tersedia.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredExams.map(({ exam, courseName, result }) => (
              <div key={exam.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      {getExamTypeBadge(exam.examType)}
                      <span className="px-2 py-0.5 bg-green-50 text-green-700 rounded text-xs font-medium">{courseName}</span>
                      {exam.examType === 'UH' && exam.pertemuan > 0 && (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-medium">Pertemuan {exam.pertemuan}</span>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{exam.title}</h3>
                    <p className="text-sm text-gray-500 mb-2">{exam.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span>{exam.questions.length} soal ({exam.questions.filter(q => q.type === 'pilihan_ganda').length} PG, {exam.questions.filter(q => q.type === 'essay').length} Essay)</span>
                      <span>{exam.duration} menit</span>
                      {exam.scheduledDate && <span>{new Date(exam.scheduledDate).toLocaleDateString('id-ID')} {exam.scheduledTime}</span>}
                    </div>
                  </div>
                  <div className="ml-4 text-right">
                    {result && result.status !== 'in_progress' ? (
                      <div>
                        <span className={`inline-block px-3 py-1.5 rounded-full text-sm font-bold ${result.score >= 70 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          Nilai: {result.score}
                        </span>
                        <p className="text-xs text-gray-400 mt-1">
                          {result.status === 'graded' ? 'Sudah dinilai' : result.essayGraded ? 'Dinilai' : 'Menunggu penilaian essay'}
                        </p>
                      </div>
                    ) : exam.status === 'active' ? (
                      <button onClick={() => handleTokenSubmit(exam)} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors">
                        Kerjakan
                      </button>
                    ) : (
                      <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1.5 rounded-lg">Selesai</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
