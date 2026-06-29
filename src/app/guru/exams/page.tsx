'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import {
  getCoursesByGuru, getExamsByGuru, createExam, updateExam, deleteExam,
  getExamResultsByExam, getUsers, getClassRooms, regenerateExamToken,
  activateExam, finishExam, resetExamForStudent, gradeEssayQuestion,
  getInProgressResults, exportExamResultsCSV
} from '@/lib/data';
import { Exam, ExamQuestion, Course, ExamResult, ExamType, QuestionType, ClassRoom, User } from '@/types';

export default function GuruExamsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [exams, setExams] = useState<Exam[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [classRooms, setClassRooms] = useState<ClassRoom[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [showMonitorModal, setShowMonitorModal] = useState(false);
  const [showGradeEssayModal, setShowGradeEssayModal] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [selectedExamResults, setSelectedExamResults] = useState<(ExamResult & { studentName: string; nis?: string })[]>([]);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [selectedResult, setSelectedResult] = useState<(ExamResult & { studentName: string }) | null>(null);
  const [monitorData, setMonitorData] = useState<{ total: number; inProgress: number; submitted: number; graded: number }>({ total: 0, inProgress: 0, submitted: 0, graded: 0 });
  const [filterType, setFilterType] = useState<ExamType | 'all'>('all');


  const [formData, setFormData] = useState({
    courseId: '',
    title: '',
    description: '',
    examType: 'UH' as ExamType,
    pertemuan: 1,
    duration: 30,
    scheduledDate: '',
    scheduledTime: '08:00',
    classIds: [] as string[],
    shuffleQuestions: true,
    shuffleOptions: true,
    status: 'draft' as Exam['status'],
  });
  const [questions, setQuestions] = useState<ExamQuestion[]>([
    { id: '1', type: 'pilihan_ganda', question: '', options: ['', '', '', ''], correctAnswer: 0, weight: 10 },
  ]);

  useEffect(() => {
    if (isLoading) return;
    if (!user || user.role !== 'guru') { router.push('/login'); return; }
    loadData();
  }, [user, isLoading, router]);

  const loadData = useCallback(() => {
    if (!user) return;
    setCourses(getCoursesByGuru(user.id));
    setExams(getExamsByGuru(user.id));
    setClassRooms(getClassRooms());
  }, [user]);

  const handleAddQuestion = (type: QuestionType = 'pilihan_ganda') => {
    const newQ: ExamQuestion = {
      id: Date.now().toString(),
      type,
      question: '',
      options: type === 'pilihan_ganda' ? ['', '', '', ''] : [],
      correctAnswer: 0,
      weight: 10,
      essayKey: type === 'essay' ? '' : undefined,
    };
    setQuestions([...questions, newQ]);
  };

  const handleRemoveQuestion = (index: number) => {
    if (questions.length <= 1) return;
    setQuestions(questions.filter((_, i) => i !== index));
  };


  const handleQuestionChange = (index: number, field: string, value: string | number) => {
    const updated = [...questions];
    if (field === 'question') updated[index] = { ...updated[index], question: value as string };
    else if (field === 'correctAnswer') updated[index] = { ...updated[index], correctAnswer: value as number };
    else if (field === 'weight') updated[index] = { ...updated[index], weight: value as number };
    else if (field === 'type') {
      const newType = value as QuestionType;
      updated[index] = {
        ...updated[index],
        type: newType,
        options: newType === 'pilihan_ganda' ? ['', '', '', ''] : [],
        correctAnswer: 0,
        essayKey: newType === 'essay' ? '' : undefined,
      };
    } else if (field === 'essayKey') updated[index] = { ...updated[index], essayKey: value as string };
    setQuestions(updated);
  };

  const handleOptionChange = (qIndex: number, oIndex: number, value: string) => {
    const updated = [...questions];
    const newOptions = [...updated[qIndex].options];
    newOptions[oIndex] = value;
    updated[qIndex] = { ...updated[qIndex], options: newOptions };
    setQuestions(updated);
  };

  const handleClassToggle = (classId: string) => {
    setFormData((prev) => ({
      ...prev,
      classIds: prev.classIds.includes(classId)
        ? prev.classIds.filter((id) => id !== classId)
        : [...prev.classIds, classId],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const examData = {
      courseId: formData.courseId,
      guruId: user.id,
      title: formData.title,
      description: formData.description,
      examType: formData.examType,
      pertemuan: formData.pertemuan,
      questions,
      duration: formData.duration,
      scheduledDate: formData.scheduledDate,
      scheduledTime: formData.scheduledTime,
      classIds: formData.classIds,
      shuffleQuestions: formData.shuffleQuestions,
      shuffleOptions: formData.shuffleOptions,
      status: formData.status as Exam['status'],
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
    setFormData({ courseId: '', title: '', description: '', examType: 'UH', pertemuan: 1, duration: 30, scheduledDate: '', scheduledTime: '08:00', classIds: [], shuffleQuestions: true, shuffleOptions: true, status: 'draft' });
    setQuestions([{ id: '1', type: 'pilihan_ganda', question: '', options: ['', '', '', ''], correctAnswer: 0, weight: 10 }]);
  };

  const handleEdit = (exam: Exam) => {
    setEditingExam(exam);
    setFormData({
      courseId: exam.courseId,
      title: exam.title,
      description: exam.description,
      examType: exam.examType,
      pertemuan: exam.pertemuan,
      duration: exam.duration,
      scheduledDate: exam.scheduledDate || '',
      scheduledTime: exam.scheduledTime || '08:00',
      classIds: exam.classIds || [],
      shuffleQuestions: exam.shuffleQuestions ?? true,
      shuffleOptions: exam.shuffleOptions ?? true,
      status: exam.status || 'draft',
    });
    setQuestions(exam.questions);
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Hapus ujian ini? Semua hasil ujian terkait juga akan dihapus.')) {
      deleteExam(id);
      loadData();
    }
  };

  const handleActivate = (exam: Exam) => {
    if (confirm('Aktifkan ujian ini? Siswa akan bisa mulai mengerjakan.')) {
      activateExam(exam.id);
      loadData();
    }
  };

  const handleFinish = (exam: Exam) => {
    if (confirm('Akhiri ujian ini? Siswa yang belum submit akan otomatis tersubmit.')) {
      finishExam(exam.id);
      loadData();
    }
  };

  const handleRegenerateToken = (examId: string) => {
    const newToken = regenerateExamToken(examId);
    alert(`Token baru: ${newToken}`);
    loadData();
  };

  const handleResetStudent = (examId: string, siswaId: string, studentName: string) => {
    if (confirm(`Reset ujian untuk ${studentName}? Jawaban siswa akan dihapus dan bisa mengerjakan ulang.`)) {
      resetExamForStudent(examId, siswaId);
      handleViewResults(getExamsByGuru(user!.id).find((e) => e.id === examId)!);
    }
  };


  const handleViewResults = (exam: Exam) => {
    const results = getExamResultsByExam(exam.id);
    const allUsers = getUsers();
    const resultsWithNames = results.map((r) => ({
      ...r,
      studentName: allUsers.find((u) => u.id === r.siswaId)?.name || 'Unknown',
      nis: allUsers.find((u) => u.id === r.siswaId)?.nis,
    }));
    setSelectedExamResults(resultsWithNames);
    setSelectedExam(exam);
    setShowResultsModal(true);
  };

  const handleMonitor = (exam: Exam) => {
    setSelectedExam(exam);
    const results = getExamResultsByExam(exam.id);
    const allUsers = getUsers();
    const classStudents = allUsers.filter((u) => u.role === 'siswa' && exam.classIds.includes(u.classId || ''));
    setMonitorData({
      total: classStudents.length,
      inProgress: results.filter((r) => r.status === 'in_progress').length,
      submitted: results.filter((r) => r.status === 'submitted').length,
      graded: results.filter((r) => r.status === 'graded').length,
    });
    setSelectedExamResults(results.map((r) => ({
      ...r,
      studentName: allUsers.find((u) => u.id === r.siswaId)?.name || 'Unknown',
      nis: allUsers.find((u) => u.id === r.siswaId)?.nis,
    })));
    setShowMonitorModal(true);
  };

  const handleGradeEssay = (result: ExamResult & { studentName: string }) => {
    setSelectedResult(result);
    setShowGradeEssayModal(true);
  };

  const handleSaveEssayGrade = (resultId: string, questionId: string, score: number) => {
    gradeEssayQuestion(resultId, questionId, score);
    if (selectedExam) handleViewResults(selectedExam);
  };

  const handleExportCSV = (exam: Exam) => {
    const csv = exportExamResultsCSV(exam.id);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hasil_${exam.examType}_${exam.title.replace(/\s+/g, '_')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getCourseName = (courseId: string) => courses.find((c) => c.id === courseId)?.title || '';

  const getExamTypeBadge = (type: ExamType) => {
    const styles = {
      UH: 'bg-blue-100 text-blue-700',
      PTS: 'bg-purple-100 text-purple-700',
      PAS: 'bg-red-100 text-red-700',
    };
    const labels = { UH: 'Ulangan Harian', PTS: 'Penilaian Tengah Semester', PAS: 'Penilaian Akhir Semester' };
    return <span className={`px-2 py-0.5 rounded text-xs font-medium ${styles[type]}`}>{labels[type]}</span>;
  };

  const getStatusBadge = (status: Exam['status']) => {
    const styles = { draft: 'bg-gray-100 text-gray-600', scheduled: 'bg-yellow-100 text-yellow-700', active: 'bg-green-100 text-green-700', finished: 'bg-red-100 text-red-700' };
    const labels = { draft: 'Draft', scheduled: 'Terjadwal', active: 'Aktif', finished: 'Selesai' };
    return <span className={`px-2 py-0.5 rounded text-xs font-medium ${styles[status]}`}>{labels[status]}</span>;
  };

  const filteredExams = filterType === 'all' ? exams : exams.filter((e) => e.examType === filterType);

  const totalWeight = questions.reduce((sum, q) => sum + q.weight, 0);


  if (isLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div></div>;
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Kelola Ujian</h1>
            <p className="text-gray-500 text-sm mt-1">Buat dan kelola ujian (UH, PTS, PAS) dengan pilihan ganda &amp; essay</p>
          </div>
          <button onClick={() => { setEditingExam(null); resetForm(); setShowModal(true); }} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
            + Buat Ujian Baru
          </button>
        </div>

        {/* Filter by Type */}
        <div className="flex gap-2 mb-6">
          {(['all', 'UH', 'PTS', 'PAS'] as const).map((type) => (
            <button key={type} onClick={() => setFilterType(type)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterType === type ? 'bg-green-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
              {type === 'all' ? 'Semua' : type}
            </button>
          ))}
        </div>

        {/* Exam List */}
        <div className="space-y-4">
          {filteredExams.map((exam) => (
            <div key={exam.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <h3 className="text-lg font-semibold text-gray-900">{exam.title}</h3>
                    {getExamTypeBadge(exam.examType)}
                    {getStatusBadge(exam.status || 'draft')}
                    <span className="px-2 py-0.5 bg-green-50 text-green-700 rounded text-xs font-medium">{getCourseName(exam.courseId)}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{exam.description}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                      {exam.questions.length} soal ({exam.questions.filter(q => q.type === 'pilihan_ganda').length} PG, {exam.questions.filter(q => q.type === 'essay').length} Essay)
                    </div>
                    <div className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      {exam.duration} menit
                    </div>
                    <div className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      {exam.scheduledDate ? new Date(exam.scheduledDate).toLocaleDateString('id-ID') : '-'} {exam.scheduledTime || ''}
                    </div>
                    <div className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
                      Token: <span className="font-mono font-bold text-green-700">{exam.token}</span>
                    </div>
                  </div>
                  {exam.classIds && exam.classIds.length > 0 && (
                    <div className="mt-2 flex items-center gap-1 flex-wrap">
                      <span className="text-xs text-gray-400">Kelas:</span>
                      {exam.classIds.map((cid) => {
                        const cls = classRooms.find((c) => c.id === cid);
                        return cls ? <span key={cid} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{cls.name}</span> : null;
                      })}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col space-y-1.5 ml-4">
                  {(exam.status === 'draft' || exam.status === 'scheduled') && (
                    <button onClick={() => handleActivate(exam)} className="text-green-600 hover:text-green-800 text-xs font-medium bg-green-50 px-3 py-1 rounded">Aktifkan</button>
                  )}
                  {exam.status === 'active' && (
                    <>
                      <button onClick={() => handleMonitor(exam)} className="text-blue-600 hover:text-blue-800 text-xs font-medium bg-blue-50 px-3 py-1 rounded">Monitor</button>
                      <button onClick={() => handleFinish(exam)} className="text-red-600 hover:text-red-800 text-xs font-medium bg-red-50 px-3 py-1 rounded">Akhiri</button>
                    </>
                  )}
                  <button onClick={() => handleViewResults(exam)} className="text-green-600 hover:text-green-800 text-xs font-medium">Hasil</button>
                  <button onClick={() => handleExportCSV(exam)} className="text-purple-600 hover:text-purple-800 text-xs font-medium">Export CSV</button>
                  <button onClick={() => handleRegenerateToken(exam.id)} className="text-yellow-600 hover:text-yellow-800 text-xs font-medium">Reset Token</button>
                  <button onClick={() => handleEdit(exam)} className="text-blue-600 hover:text-blue-800 text-xs font-medium">Edit</button>
                  <button onClick={() => handleDelete(exam.id)} className="text-red-600 hover:text-red-800 text-xs font-medium">Hapus</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredExams.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            <p className="text-gray-500">Belum ada ujian. Klik &quot;+ Buat Ujian Baru&quot; untuk memulai.</p>
          </div>
        )}


        {/* Create/Edit Exam Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b p-5 rounded-t-xl z-10">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-900">{editingExam ? 'Edit Ujian' : 'Buat Ujian Baru'}</h2>
                  <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              </div>
              <form onSubmit={handleSubmit} className="p-5 space-y-5">
                {/* Exam Type & Course */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Ujian *</label>
                    <select value={formData.examType} onChange={(e) => setFormData({ ...formData, examType: e.target.value as ExamType })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-green-500" required>
                      <option value="UH">Ulangan Harian (UH)</option>
                      <option value="PTS">Penilaian Tengah Semester (PTS)</option>
                      <option value="PAS">Penilaian Akhir Semester (PAS)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mata Pelajaran *</label>
                    <select value={formData.courseId} onChange={(e) => setFormData({ ...formData, courseId: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-green-500" required>
                      <option value="">Pilih Mata Pelajaran</option>
                      {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
                    </select>
                  </div>
                  {formData.examType === 'UH' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Pertemuan Ke-</label>
                      <input type="number" min={1} value={formData.pertemuan} onChange={(e) => setFormData({ ...formData, pertemuan: Number(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-green-500" />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Judul Ujian *</label>
                  <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-green-500" required placeholder="Contoh: UH 1 - Pengenalan Bilangan" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi *</label>
                  <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-green-500" rows={2} required />
                </div>


                {/* Schedule & Duration */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Ujian *</label>
                    <input type="date" value={formData.scheduledDate} onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-green-500" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Waktu Mulai *</label>
                    <input type="time" value={formData.scheduledTime} onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-green-500" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Durasi (menit) *</label>
                    <input type="number" min={5} value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-green-500" required />
                  </div>
                </div>

                {/* Target Classes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Kelas yang Mengikuti Ujian *</label>
                  <div className="flex flex-wrap gap-2">
                    {classRooms.map((cls) => (
                      <button key={cls.id} type="button" onClick={() => handleClassToggle(cls.id)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${formData.classIds.includes(cls.id) ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                        {cls.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Shuffle Options */}
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={formData.shuffleQuestions} onChange={(e) => setFormData({ ...formData, shuffleQuestions: e.target.checked })} className="w-4 h-4 text-green-600 rounded focus:ring-green-500" />
                    <span className="text-sm text-gray-700">Acak urutan soal</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={formData.shuffleOptions} onChange={(e) => setFormData({ ...formData, shuffleOptions: e.target.checked })} className="w-4 h-4 text-green-600 rounded focus:ring-green-500" />
                    <span className="text-sm text-gray-700">Acak pilihan jawaban (PG)</span>
                  </label>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as Exam['status'] })} className="w-full md:w-48 px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-green-500">
                    <option value="draft">Draft</option>
                    <option value="scheduled">Terjadwal</option>
                    <option value="active">Aktif</option>
                  </select>
                </div>


                {/* Questions Section */}
                <div className="border-t pt-5">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Soal-soal</h3>
                      <p className="text-xs text-gray-500">Total bobot: <span className={`font-bold ${totalWeight === 100 ? 'text-green-600' : 'text-orange-500'}`}>{totalWeight}</span> (disarankan 100)</p>
                    </div>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => handleAddQuestion('pilihan_ganda')} className="text-green-600 hover:text-green-800 text-sm font-medium bg-green-50 px-3 py-1.5 rounded-lg">+ Pilihan Ganda</button>
                      <button type="button" onClick={() => handleAddQuestion('essay')} className="text-purple-600 hover:text-purple-800 text-sm font-medium bg-purple-50 px-3 py-1.5 rounded-lg">+ Essay</button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {questions.map((q, qIndex) => (
                      <div key={q.id} className={`rounded-lg p-4 border ${q.type === 'essay' ? 'bg-purple-50 border-purple-200' : 'bg-gray-50 border-gray-200'}`}>
                        <div className="flex justify-between items-center mb-3">
                          <div className="flex items-center gap-3">
                            <span className={`text-sm font-bold ${q.type === 'essay' ? 'text-purple-700' : 'text-green-700'}`}>Soal {qIndex + 1}</span>
                            <span className={`text-xs px-2 py-0.5 rounded ${q.type === 'essay' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>{q.type === 'essay' ? 'Essay' : 'Pilihan Ganda'}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1">
                              <label className="text-xs text-gray-500">Bobot:</label>
                              <input type="number" min={1} value={q.weight} onChange={(e) => handleQuestionChange(qIndex, 'weight', Number(e.target.value))} className="w-16 px-2 py-1 border border-gray-300 rounded text-sm text-gray-900" />
                            </div>
                            {questions.length > 1 && (
                              <button type="button" onClick={() => handleRemoveQuestion(qIndex)} className="text-red-500 hover:text-red-700 text-xs">Hapus</button>
                            )}
                          </div>
                        </div>

                        <div className="mb-3">
                          <textarea value={q.question} onChange={(e) => handleQuestionChange(qIndex, 'question', e.target.value)} placeholder="Tulis pertanyaan..." className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-green-500" rows={2} required />
                        </div>

                        {q.type === 'pilihan_ganda' && (
                          <div className="space-y-2">
                            {q.options.map((opt, oIdx) => (
                              <div key={oIdx} className="flex items-center gap-2">
                                <input type="radio" name={`correct-${qIndex}`} checked={q.correctAnswer === oIdx} onChange={() => handleQuestionChange(qIndex, 'correctAnswer', oIdx)} className="w-4 h-4 text-green-600" />
                                <span className="w-6 h-6 flex items-center justify-center bg-gray-200 rounded text-xs font-bold text-gray-600">{String.fromCharCode(65 + oIdx)}</span>
                                <input type="text" value={opt} onChange={(e) => handleOptionChange(qIndex, oIdx, e.target.value)} placeholder={`Pilihan ${String.fromCharCode(65 + oIdx)}`} className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-green-500" required />
                              </div>
                            ))}
                            <p className="text-xs text-gray-400 mt-1">Pilih radio button untuk menandai jawaban benar</p>
                          </div>
                        )}

                        {q.type === 'essay' && (
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Kunci Jawaban (referensi penilaian)</label>
                            <textarea value={q.essayKey || ''} onChange={(e) => handleQuestionChange(qIndex, 'essayKey', e.target.value)} placeholder="Tulis kunci jawaban sebagai referensi..." className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-purple-500" rows={2} />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Submit */}
                <div className="flex justify-end gap-3 border-t pt-4">
                  <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">Batal</button>
                  <button type="submit" className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium">{editingExam ? 'Simpan Perubahan' : 'Buat Ujian'}</button>
                </div>
              </form>
            </div>
          </div>
        )}


        {/* Results Modal */}
        {showResultsModal && selectedExam && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b p-5 rounded-t-xl z-10">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Hasil: {selectedExam.title}</h2>
                    <p className="text-sm text-gray-500">{getExamTypeBadge(selectedExam.examType)} - {selectedExamResults.length} siswa sudah mengerjakan</p>
                  </div>
                  <button onClick={() => setShowResultsModal(false)} className="text-gray-400 hover:text-gray-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              </div>
              <div className="p-5">
                {selectedExamResults.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">Belum ada siswa yang mengerjakan ujian ini.</p>
                ) : (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">No</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Siswa</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">NIS</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Skor</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {selectedExamResults.map((r, idx) => (
                        <tr key={r.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-500">{idx + 1}</td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{r.studentName}</td>
                          <td className="px-4 py-3 text-sm text-gray-500">{r.nis || '-'}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`font-bold ${r.score >= 70 ? 'text-green-600' : 'text-red-600'}`}>{r.score}</span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`text-xs px-2 py-1 rounded ${r.status === 'graded' ? 'bg-green-100 text-green-700' : r.status === 'submitted' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'}`}>
                              {r.status === 'graded' ? 'Dinilai' : r.status === 'submitted' ? 'Perlu Dinilai' : 'Mengerjakan'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center space-x-2">
                            {r.status === 'submitted' && selectedExam.questions.some((q) => q.type === 'essay') && (
                              <button onClick={() => handleGradeEssay(r)} className="text-purple-600 hover:text-purple-800 text-xs font-medium">Nilai Essay</button>
                            )}
                            <button onClick={() => handleResetStudent(selectedExam.id, r.siswaId, r.studentName)} className="text-red-600 hover:text-red-800 text-xs font-medium">Reset</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}


        {/* Monitor Modal */}
        {showMonitorModal && selectedExam && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b p-5 rounded-t-xl z-10">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Monitor Ujian: {selectedExam.title}</h2>
                    <p className="text-sm text-gray-500">Pantau pengerjaan ujian secara realtime</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => handleMonitor(selectedExam)} className="text-green-600 hover:text-green-800 text-sm font-medium bg-green-50 px-3 py-1.5 rounded-lg">Refresh</button>
                    <button onClick={() => setShowMonitorModal(false)} className="text-gray-400 hover:text-gray-600">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-5">
                {/* Stats Cards */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-gray-900">{monitorData.total}</p>
                    <p className="text-xs text-gray-500">Total Siswa</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-blue-600">{monitorData.inProgress}</p>
                    <p className="text-xs text-blue-600">Sedang Mengerjakan</p>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-yellow-600">{monitorData.submitted}</p>
                    <p className="text-xs text-yellow-600">Sudah Submit</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-green-600">{monitorData.graded}</p>
                    <p className="text-xs text-green-600">Sudah Dinilai</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mb-6">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Progress pengerjaan</span>
                    <span>{monitorData.total > 0 ? Math.round(((monitorData.submitted + monitorData.graded + monitorData.inProgress) / monitorData.total) * 100) : 0}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="bg-green-500 h-3 rounded-full transition-all" style={{ width: `${monitorData.total > 0 ? ((monitorData.submitted + monitorData.graded + monitorData.inProgress) / monitorData.total) * 100 : 0}%` }}></div>
                  </div>
                </div>

                {/* Token Display */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-800">Token Ujian</p>
                      <p className="text-3xl font-mono font-bold text-green-700 tracking-wider">{selectedExam.token}</p>
                    </div>
                    <button onClick={() => handleRegenerateToken(selectedExam.id)} className="text-sm text-green-600 hover:text-green-800 bg-green-100 px-3 py-1.5 rounded-lg">Ganti Token</button>
                  </div>
                </div>

                {/* Student List */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Detail Siswa</h4>
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Nama</th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-500">Status</th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-500">Skor</th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-500">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {selectedExamResults.map((r) => (
                        <tr key={r.id}>
                          <td className="px-3 py-2 text-sm text-gray-900">{r.studentName}</td>
                          <td className="px-3 py-2 text-center">
                            <span className={`text-xs px-2 py-0.5 rounded ${r.status === 'in_progress' ? 'bg-blue-100 text-blue-700' : r.status === 'submitted' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                              {r.status === 'in_progress' ? 'Mengerjakan' : r.status === 'submitted' ? 'Selesai' : 'Dinilai'}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-center text-sm font-medium">{r.status !== 'in_progress' ? r.score : '-'}</td>
                          <td className="px-3 py-2 text-center">
                            <button onClick={() => handleResetStudent(selectedExam.id, r.siswaId, r.studentName)} className="text-red-500 hover:text-red-700 text-xs">Reset</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}


        {/* Grade Essay Modal */}
        {showGradeEssayModal && selectedResult && selectedExam && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b p-5 rounded-t-xl z-10">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Nilai Essay - {selectedResult.studentName}</h2>
                    <p className="text-sm text-gray-500">Berikan nilai 0-100 untuk setiap soal essay</p>
                  </div>
                  <button onClick={() => setShowGradeEssayModal(false)} className="text-gray-400 hover:text-gray-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              </div>
              <div className="p-5 space-y-6">
                {selectedExam.questions.filter((q) => q.type === 'essay').map((q, idx) => {
                  const answer = selectedResult.answers.find((a) => a.questionId === q.id);
                  const existingScore = selectedResult.essayScores?.find((s) => s.questionId === q.id);
                  return (
                    <div key={q.id} className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <p className="text-sm font-bold text-purple-700 mb-1">Essay {idx + 1} (Bobot: {q.weight})</p>
                      <p className="text-sm text-gray-800 mb-3">{q.question}</p>
                      {q.essayKey && (
                        <div className="bg-white border border-purple-100 rounded p-2 mb-3">
                          <p className="text-xs font-medium text-purple-600 mb-1">Kunci Jawaban:</p>
                          <p className="text-xs text-gray-600">{q.essayKey}</p>
                        </div>
                      )}
                      <div className="bg-white border border-gray-200 rounded p-3 mb-3">
                        <p className="text-xs font-medium text-gray-500 mb-1">Jawaban Siswa:</p>
                        <p className="text-sm text-gray-800">{answer?.essayAnswer || <span className="text-gray-400 italic">Tidak dijawab</span>}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <label className="text-sm font-medium text-gray-700">Nilai (0-100):</label>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          defaultValue={existingScore?.score || 0}
                          onBlur={(e) => handleSaveEssayGrade(selectedResult.id, q.id, Number(e.target.value))}
                          className="w-24 px-3 py-1.5 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                    </div>
                  );
                })}
                <div className="flex justify-end">
                  <button onClick={() => { setShowGradeEssayModal(false); if (selectedExam) handleViewResults(selectedExam); }} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium">Selesai Menilai</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
