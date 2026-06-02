'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { getCoursesByGuru, getExamsByGuru, createExam, updateExam, deleteExam, getExamResultsByExam, getUsers } from '@/lib/data';
import { Exam, ExamQuestion, Course, ExamResult } from '@/types';

export default function GuruExamsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [exams, setExams] = useState<Exam[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [selectedExamResults, setSelectedExamResults] = useState<(ExamResult & { studentName: string })[]>([]);
  const [selectedExamTitle, setSelectedExamTitle] = useState('');
  const [formData, setFormData] = useState({
    courseId: '',
    title: '',
    description: '',
    pertemuan: 1,
    duration: 15,
  });
  const [questions, setQuestions] = useState<ExamQuestion[]>([
    { id: '1', question: '', options: ['', '', '', ''], correctAnswer: 0 },
  ]);

  useEffect(() => {
    if (isLoading) return;
    if (!user || user.role !== 'guru') { router.push('/login'); return; }
    loadData();
  }, [user, isLoading, router]);

  const loadData = () => {
    if (!user) return;
    setCourses(getCoursesByGuru(user.id));
    setExams(getExamsByGuru(user.id));
  };

  const handleAddQuestion = () => {
    setQuestions([...questions, { id: Date.now().toString(), question: '', options: ['', '', '', ''], correctAnswer: 0 }]);
  };

  const handleRemoveQuestion = (index: number) => {
    if (questions.length <= 1) return;
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleQuestionChange = (index: number, field: string, value: string | number) => {
    const updated = [...questions];
    if (field === 'question') {
      updated[index] = { ...updated[index], question: value as string };
    } else if (field === 'correctAnswer') {
      updated[index] = { ...updated[index], correctAnswer: value as number };
    }
    setQuestions(updated);
  };

  const handleOptionChange = (qIndex: number, oIndex: number, value: string) => {
    const updated = [...questions];
    const newOptions = [...updated[qIndex].options];
    newOptions[oIndex] = value;
    updated[qIndex] = { ...updated[qIndex], options: newOptions };
    setQuestions(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const examData = {
      courseId: formData.courseId,
      guruId: user.id,
      title: formData.title,
      description: formData.description,
      pertemuan: formData.pertemuan,
      questions: questions,
      duration: formData.duration,
    };

    if (editingExam) {
      updateExam(editingExam.id, examData);
    } else {
      createExam(examData);
    }

    setShowModal(false);
    setEditingExam(null);
    resetForm();
    loadData();
  };

  const resetForm = () => {
    setFormData({ courseId: '', title: '', description: '', pertemuan: 1, duration: 15 });
    setQuestions([{ id: '1', question: '', options: ['', '', '', ''], correctAnswer: 0 }]);
  };

  const handleEdit = (exam: Exam) => {
    setEditingExam(exam);
    setFormData({
      courseId: exam.courseId,
      title: exam.title,
      description: exam.description,
      pertemuan: exam.pertemuan,
      duration: exam.duration,
    });
    setQuestions(exam.questions);
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Hapus exam ini?')) {
      deleteExam(id);
      loadData();
    }
  };

  const handleViewResults = (exam: Exam) => {
    const results = getExamResultsByExam(exam.id);
    const allUsers = getUsers();
    const resultsWithNames = results.map((r) => ({
      ...r,
      studentName: allUsers.find((u) => u.id === r.siswaId)?.name || 'Unknown',
    }));
    setSelectedExamResults(resultsWithNames);
    setSelectedExamTitle(exam.title);
    setShowResultsModal(true);
  };

  const getCourseName = (courseId: string) => courses.find((c) => c.id === courseId)?.title || '';

  if (isLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div></div>;
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Kelola Exam</h1>
            <p className="text-gray-600 mt-1">Buat dan kelola ujian pilihan ganda</p>
          </div>
          <button
            onClick={() => { setEditingExam(null); resetForm(); setShowModal(true); }}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            + Buat Exam Baru
          </button>
        </div>

        {/* Exam List */}
        <div className="space-y-4">
          {exams.map((exam) => (
            <div key={exam.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{exam.title}</h3>
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">{getCourseName(exam.courseId)}</span>
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-medium">Pertemuan {exam.pertemuan}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{exam.description}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>{exam.questions.length} soal</span>
                    <span>{exam.duration} menit</span>
                    <span>Dibuat: {new Date(exam.createdAt).toLocaleDateString('id-ID')}</span>
                  </div>
                </div>
                <div className="flex flex-col space-y-2 ml-4">
                  <button onClick={() => handleViewResults(exam)} className="text-green-600 hover:text-green-800 text-sm font-medium">Lihat Hasil</button>
                  <button onClick={() => handleEdit(exam)} className="text-blue-600 hover:text-blue-800 text-sm font-medium">Edit</button>
                  <button onClick={() => handleDelete(exam.id)} className="text-red-600 hover:text-red-800 text-sm font-medium">Hapus</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {exams.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            <p className="text-gray-500">Belum ada exam. Klik &quot;+ Buat Exam Baru&quot; untuk memulai.</p>
          </div>
        )}

        {/* Create/Edit Exam Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b p-5 rounded-t-xl">
                <h2 className="text-xl font-bold text-gray-900">{editingExam ? 'Edit Exam' : 'Buat Exam Baru'}</h2>
              </div>
              <form onSubmit={handleSubmit} className="p-5 space-y-5">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mata Pelajaran</label>
                    <select value={formData.courseId} onChange={(e) => setFormData({ ...formData, courseId: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-green-500" required>
                      <option value="">Pilih Mata Pelajaran</option>
                      {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pertemuan Ke-</label>
                    <input type="number" min={1} value={formData.pertemuan} onChange={(e) => setFormData({ ...formData, pertemuan: Number(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-green-500" required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Judul Exam</label>
                  <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-green-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                  <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-green-500" rows={2} required />
                </div>
                <div className="w-48">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Durasi (menit)</label>
                  <input type="number" min={5} value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-green-500" required />
                </div>

                {/* Questions */}
                <div className="border-t pt-5">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Soal-soal</h3>
                    <button type="button" onClick={handleAddQuestion} className="text-green-600 hover:text-green-800 text-sm font-medium">+ Tambah Soal</button>
                  </div>

                  <div className="space-y-6">
                    {questions.map((q, qIndex) => (
                      <div key={q.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-sm font-bold text-green-700">Soal {qIndex + 1}</span>
                          {questions.length > 1 && (
                            <button type="button" onClick={() => handleRemoveQuestion(qIndex)} className="text-red-500 hover:text-red-700 text-xs">Hapus</button>
                          )}
                        </div>
                        <div className="mb-3">
                          <input
                            type="text"
                            value={q.question}
                            onChange={(e) => handleQuestionChange(qIndex, 'question', e.target.value)}
                            placeholder="Tulis pertanyaan..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-green-500"
                            required
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                          {q.options.map((opt, oIndex) => (
                            <div key={oIndex} className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-600 w-6">{String.fromCharCode(65 + oIndex)}.</span>
                              <input
                                type="text"
                                value={opt}
                                onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                                placeholder={`Opsi ${String.fromCharCode(65 + oIndex)}`}
                                className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-gray-900 text-sm focus:ring-2 focus:ring-green-500"
                                required
                              />
                            </div>
                          ))}
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Jawaban Benar:</label>
                          <select
                            value={q.correctAnswer}
                            onChange={(e) => handleQuestionChange(qIndex, 'correctAnswer', Number(e.target.value))}
                            className="px-3 py-1.5 border border-gray-300 rounded-lg text-gray-900 text-sm focus:ring-2 focus:ring-green-500"
                          >
                            <option value={0}>A</option>
                            <option value={1}>B</option>
                            <option value={2}>C</option>
                            <option value={3}>D</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex space-x-3 pt-4 border-t">
                  <button type="submit" className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-lg font-medium transition-colors">{editingExam ? 'Update Exam' : 'Buat Exam'}</button>
                  <button type="button" onClick={() => { setShowModal(false); setEditingExam(null); resetForm(); }} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2.5 rounded-lg font-medium transition-colors">Batal</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View Results Modal */}
        {showResultsModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-2xl max-h-[85vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center rounded-t-xl">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Hasil Exam</h2>
                  <p className="text-sm text-gray-500">{selectedExamTitle}</p>
                </div>
                <button onClick={() => setShowResultsModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="p-4">
                {selectedExamResults.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Belum ada siswa yang mengerjakan exam ini.</p>
                ) : (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">No</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Siswa</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Skor</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Waktu Submit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {selectedExamResults.map((r, idx) => (
                        <tr key={r.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-500">{idx + 1}</td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{r.studentName}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`text-sm font-bold ${r.score >= 70 ? 'text-green-700' : 'text-red-600'}`}>{r.score}</span>
                          </td>
                          <td className="px-4 py-3 text-center text-sm text-gray-500">{new Date(r.submittedAt).toLocaleDateString('id-ID')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
