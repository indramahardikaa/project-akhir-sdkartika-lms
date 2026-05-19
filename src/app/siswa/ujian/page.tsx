'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { getExams, getCourses, getEnrollmentsBySiswa, getBankSoal, getExamResultsBySiswa, createExamResult } from '@/lib/data';
import { Exam, BankSoal } from '@/types';

export default function SiswaUjianPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [exams, setExams] = useState<(Exam & { courseName: string; done: boolean })[]>([]);
  const [activeExam, setActiveExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<BankSoal[]>([]);
  const [answers, setAnswers] = useState<number[]>([]);
  const [tokenInput, setTokenInput] = useState('');
  const [tokenError, setTokenError] = useState('');

  useEffect(() => {
    if (isLoading) return;
    if (!user || user.role !== 'siswa') { router.push('/login'); return; }
    loadData();
  }, [user, isLoading, router]);

  const loadData = () => {
    if (!user) return;
    const courses = getCourses();
    const enrollments = getEnrollmentsBySiswa(user.id);
    const enrolledCourseIds = enrollments.map(e => e.courseId);
    const results = getExamResultsBySiswa(user.id);
    const doneExamIds = results.map(r => r.examId);
    setExams(getExams().filter(e => enrolledCourseIds.includes(e.courseId)).map(e => ({
      ...e, courseName: courses.find(c => c.id === e.courseId)?.title || '-', done: doneExamIds.includes(e.id),
    })));
  };

  const startExam = (exam: Exam) => {
    if (tokenInput !== exam.token) { setTokenError('Token salah!'); return; }
    setTokenError('');
    const qs = getBankSoal().filter(b => exam.questions.includes(b.id));
    setQuestions(qs);
    setAnswers(new Array(qs.length).fill(-1));
    setActiveExam(exam);
  };

  const submitExam = () => {
    if (!activeExam || !user) return;
    let score = 0;
    questions.forEach((q, i) => { if (answers[i] === q.correctAnswer) score++; });
    const finalScore = Math.round((score / questions.length) * 100);
    createExamResult({ examId: activeExam.id, siswaId: user.id, siswaName: user.name, answers, score: finalScore });
    setActiveExam(null);
    setQuestions([]);
    setAnswers([]);
    loadData();
    alert(`Ujian selesai! Nilai: ${finalScore}`);
  };

  if (isLoading || !user) return null;

  if (activeExam) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">{activeExam.title}</h2>
            <button onClick={submitExam} className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700">Kumpulkan Jawaban</button>
          </div>
          <div className="space-y-4">
            {questions.map((q, i) => (
              <div key={q.id} className="bg-white rounded-xl p-5 shadow-sm border">
                <p className="font-medium text-gray-800 mb-3">{i+1}. {q.question}</p>
                <div className="space-y-2">
                  {q.options.map((opt, j) => (
                    <label key={j} className={`flex items-center space-x-3 p-2 rounded-lg cursor-pointer ${answers[i] === j ? 'bg-primary-50 border border-primary-300' : 'hover:bg-gray-50'}`}>
                      <input type="radio" name={`q-${i}`} checked={answers[i] === j} onChange={() => { const newA = [...answers]; newA[i] = j; setAnswers(newA); }} className="text-primary-600" />
                      <span className="text-sm">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">Ujian</h2>
        <div className="space-y-4">
          {exams.map(e => (
            <div key={e.id} className="bg-white rounded-xl p-5 shadow-sm border">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-gray-800">{e.title}</h3>
                  <p className="text-sm text-gray-500">{e.courseName} | {e.type} | {e.duration} menit</p>
                </div>
                {e.done ? (
                  <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded text-xs font-medium">Selesai</span>
                ) : (
                  <div className="flex items-center space-x-2">
                    <input placeholder="Token" value={tokenInput} onChange={ev => { setTokenInput(ev.target.value); setTokenError(''); }} className="border rounded px-2 py-1 text-sm w-24" />
                    <button onClick={() => startExam(e)} className="px-3 py-1.5 bg-primary-600 text-white rounded-lg text-xs font-medium">Mulai</button>
                  </div>
                )}
              </div>
              {tokenError && <p className="text-xs text-accent-600 mt-1">{tokenError}</p>}
            </div>
          ))}
          {exams.length === 0 && <p className="text-sm text-gray-500">Belum ada ujian tersedia</p>}
        </div>
      </div>
    </DashboardLayout>
  );
}
