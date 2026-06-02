'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import { getCoursesByGuru, getAssignmentsByGuru, createAssignment, updateAssignment, deleteAssignment, getSubmissionsByAssignment, gradeSubmission, getUsers } from '@/lib/data';
import { Assignment, AssignmentSubmission, Course, User } from '@/types';

export default function GuruAssignmentsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showSubmissionsModal, setShowSubmissionsModal] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [submissions, setSubmissions] = useState<(AssignmentSubmission & { studentName: string })[]>([]);
  const [formData, setFormData] = useState({ courseId: '', title: '', description: '', imageUrl: '', dueDate: '' });
  const [gradeForm, setGradeForm] = useState<{ id: string; grade: number; feedback: string } | null>(null);

  useEffect(() => {
    if (isLoading) return;
    if (!user || user.role !== 'guru') { router.push('/login'); return; }
    loadData();
  }, [user, isLoading, router]);


  const loadData = () => {
    if (!user) return;
    const myCourses = getCoursesByGuru(user.id);
    setCourses(myCourses);
    setAssignments(getAssignmentsByGuru(user.id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (editingAssignment) {
      updateAssignment(editingAssignment.id, formData);
    } else {
      createAssignment({ ...formData, guruId: user.id });
    }
    setShowModal(false);
    setEditingAssignment(null);
    setFormData({ courseId: '', title: '', description: '', imageUrl: '', dueDate: '' });
    loadData();
  };

  const handleEdit = (a: Assignment) => {
    setEditingAssignment(a);
    setFormData({ courseId: a.courseId, title: a.title, description: a.description, imageUrl: a.imageUrl || '', dueDate: a.dueDate.split('T')[0] });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Hapus tugas ini?')) { deleteAssignment(id); loadData(); }
  };

  const handleViewSubmissions = (a: Assignment) => {
    setSelectedAssignment(a);
    const allUsers = getUsers();
    const subs = getSubmissionsByAssignment(a.id).map(s => ({
      ...s,
      studentName: allUsers.find(u => u.id === s.siswaId)?.name || 'Unknown'
    }));
    setSubmissions(subs);
    setShowSubmissionsModal(true);
  };

  const handleGrade = (sub: AssignmentSubmission & { studentName: string }) => {
    setGradeForm({ id: sub.id, grade: sub.grade || 0, feedback: sub.feedback || '' });
  };

  const handleGradeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradeForm) return;
    gradeSubmission(gradeForm.id, gradeForm.grade, gradeForm.feedback);
    setGradeForm(null);
    if (selectedAssignment) handleViewSubmissions(selectedAssignment);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => { setFormData({ ...formData, imageUrl: reader.result as string }); };
      reader.readAsDataURL(file);
    }
  };

  const getCourseName = (courseId: string) => courses.find(c => c.id === courseId)?.title || '';

  if (isLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div></div>;
  }


  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Forum Tugas</h1>
            <p className="text-gray-600 mt-1">Buat tugas dan lihat hasil pengumpulan siswa</p>
          </div>
          <button onClick={() => { setEditingAssignment(null); setFormData({ courseId: '', title: '', description: '', imageUrl: '', dueDate: '' }); setShowModal(true); }} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
            + Buat Tugas
          </button>
        </div>

        <div className="space-y-4">
          {assignments.map((a) => (
            <div key={a.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{a.title}</h3>
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">{getCourseName(a.courseId)}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{a.description}</p>
                  {a.imageUrl && (
                    <div className="mb-2">
                      <img src={a.imageUrl} alt="Foto Tugas" className="max-w-xs rounded-lg border" />
                    </div>
                  )}
                  <p className="text-xs text-gray-500">Deadline: {new Date(a.dueDate).toLocaleDateString('id-ID')}</p>
                </div>
                <div className="flex flex-col space-y-2 ml-4">
                  <button onClick={() => handleViewSubmissions(a)} className="text-green-600 hover:text-green-800 text-sm font-medium">Lihat Jawaban</button>
                  <button onClick={() => handleEdit(a)} className="text-blue-600 hover:text-blue-900 text-sm font-medium">Edit</button>
                  <button onClick={() => handleDelete(a.id)} className="text-red-600 hover:text-red-900 text-sm font-medium">Hapus</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {assignments.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
            <p className="text-gray-500">Belum ada tugas. Klik &quot;+ Buat Tugas&quot; untuk memulai.</p>
          </div>
        )}


        {/* Create/Edit Assignment Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold text-gray-900 mb-4">{editingAssignment ? 'Edit Tugas' : 'Buat Tugas Baru'}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kursus</label>
                  <select value={formData.courseId} onChange={(e) => setFormData({ ...formData, courseId: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900" required>
                    <option value="">Pilih Kursus</option>
                    {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Judul Tugas</label>
                  <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi / Instruksi</label>
                  <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900" rows={3} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Upload Foto Soal (opsional)</label>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                  {formData.imageUrl && <img src={formData.imageUrl} alt="Preview" className="mt-2 max-w-full h-32 object-cover rounded-lg" />}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
                  <input type="date" value={formData.dueDate} onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900" required />
                </div>
                <div className="flex space-x-3 pt-4">
                  <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium">{editingAssignment ? 'Update' : 'Buat'}</button>
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded-lg font-medium">Batal</button>
                </div>
              </form>
            </div>
          </div>
        )}


        {/* View Submissions Modal */}
        {showSubmissionsModal && selectedAssignment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-2xl max-h-[85vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center rounded-t-xl">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Jawaban Siswa</h2>
                  <p className="text-sm text-gray-500">{selectedAssignment.title}</p>
                </div>
                <button onClick={() => { setShowSubmissionsModal(false); setGradeForm(null); }} className="p-2 hover:bg-gray-100 rounded-lg">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="p-4 space-y-4">
                {submissions.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Belum ada siswa yang mengumpulkan tugas.</p>
                ) : (
                  submissions.map((sub) => (
                    <div key={sub.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-900">{sub.studentName}</h4>
                          <p className="text-xs text-gray-500">Dikumpulkan: {new Date(sub.submittedAt).toLocaleDateString('id-ID')}</p>
                        </div>
                        {sub.grade !== undefined && sub.grade !== null ? (
                          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">Nilai: {sub.grade}</span>
                        ) : (
                          <button onClick={() => handleGrade(sub)} className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium hover:bg-yellow-200">Beri Nilai</button>
                        )}
                      </div>
                      {sub.imageUrl && <img src={sub.imageUrl} alt="Jawaban" className="max-w-full rounded-lg border mb-2" />}
                      {sub.feedback && <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">Feedback: {sub.feedback}</p>}

                      {/* Grade Form */}
                      {gradeForm && gradeForm.id === sub.id && (
                        <form onSubmit={handleGradeSubmit} className="mt-3 p-3 bg-yellow-50 rounded-lg space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Nilai (0-100)</label>
                              <input type="number" min={0} max={100} value={gradeForm.grade} onChange={(e) => setGradeForm({ ...gradeForm, grade: Number(e.target.value) })} className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm text-gray-900" required />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Feedback</label>
                              <input type="text" value={gradeForm.feedback} onChange={(e) => setGradeForm({ ...gradeForm, feedback: e.target.value })} className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm text-gray-900" />
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button type="submit" className="px-3 py-1.5 bg-green-600 text-white rounded text-sm font-medium">Simpan Nilai</button>
                            <button type="button" onClick={() => setGradeForm(null)} className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded text-sm">Batal</button>
                          </div>
                        </form>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
