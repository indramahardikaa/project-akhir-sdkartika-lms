'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import { getEnrollmentsBySiswa, getAssignmentsByCourse, getSubmissionsBySiswa, createSubmission, getCourses, hasCompletedAllMaterials, getMaterialsByCourse } from '@/lib/data';
import { Assignment, AssignmentSubmission, Course } from '@/types';

interface AssignmentWithStatus {
  assignment: Assignment;
  courseName: string;
  courseId: string;
  submission?: AssignmentSubmission;
  materialsCompleted: boolean;
}

export default function SiswaAssignmentsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [assignmentsWithStatus, setAssignmentsWithStatus] = useState<AssignmentWithStatus[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [uploadImage, setUploadImage] = useState('');

  useEffect(() => {
    if (isLoading) return;
    if (!user || user.role !== 'siswa') { router.push('/login'); return; }
    loadData();
  }, [user, isLoading, router]);


  const loadData = () => {
    if (!user) return;
    const enrollments = getEnrollmentsBySiswa(user.id);
    const allCourses = getCourses();
    const mySubmissions = getSubmissionsBySiswa(user.id);

    const allAssignments: AssignmentWithStatus[] = [];
    enrollments.forEach(e => {
      const course = allCourses.find(c => c.id === e.courseId);
      if (!course) return;
      const assignments = getAssignmentsByCourse(e.courseId);
      const materials = getMaterialsByCourse(e.courseId);
      // Check if student has read all materials for this course
      const materialsCompleted = materials.length === 0 || hasCompletedAllMaterials(user.id, e.courseId);
      assignments.forEach(a => {
        const submission = mySubmissions.find(s => s.assignmentId === a.id);
        allAssignments.push({ assignment: a, courseName: course.title, courseId: e.courseId, submission, materialsCompleted });
      });
    });

    setAssignmentsWithStatus(allAssignments);
  };

  const handleUpload = (a: Assignment) => {
    setSelectedAssignment(a);
    setUploadImage('');
    setShowUploadModal(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => { setUploadImage(reader.result as string); };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedAssignment || !uploadImage) return;
    createSubmission({ assignmentId: selectedAssignment.id, siswaId: user.id, imageUrl: uploadImage });
    setShowUploadModal(false);
    setSelectedAssignment(null);
    setUploadImage('');
    loadData();
  };

  if (isLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div></div>;
  }


  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Tugas</h1>
          <p className="text-gray-600 mt-1">Lihat dan kumpulkan tugas dari guru</p>
        </div>

        {assignmentsWithStatus.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
            <p className="text-gray-500">Belum ada tugas yang tersedia.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {assignmentsWithStatus.map(({ assignment, courseName, courseId, submission, materialsCompleted }) => (
              <div key={assignment.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{assignment.title}</h3>
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">{courseName}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{assignment.description}</p>
                    {assignment.imageUrl && (
                      <div className="mb-3">
                        <p className="text-xs text-gray-500 mb-1">Foto Soal dari Guru:</p>
                        <img src={assignment.imageUrl} alt="Soal" className="max-w-sm rounded-lg border" />
                      </div>
                    )}
                    <p className="text-xs text-gray-500">Deadline: {new Date(assignment.dueDate).toLocaleDateString('id-ID')}</p>
                    {/* Warning if materials not completed */}
                    {!materialsCompleted && !submission && (
                      <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm text-yellow-700 flex items-center gap-2">
                          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                          Anda harus membaca semua materi di mata pelajaran ini terlebih dahulu sebelum bisa mengumpulkan tugas.
                        </p>
                        <button onClick={() => router.push('/siswa/materials')} className="mt-2 text-sm text-green-600 hover:text-green-800 font-medium underline">
                          Baca Materi Sekarang →
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="ml-4">
                    {submission ? (
                      <div className="text-right">
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                          Sudah Dikumpulkan
                        </span>
                        {submission.grade !== undefined && submission.grade !== null && (
                          <p className="text-sm font-bold text-green-700 mt-2">Nilai: {submission.grade}</p>
                        )}
                        {submission.feedback && (
                          <p className="text-xs text-gray-500 mt-1">Feedback: {submission.feedback}</p>
                        )}
                      </div>
                    ) : materialsCompleted ? (
                      <button onClick={() => handleUpload(assignment)} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                        Upload Jawaban
                      </button>
                    ) : (
                      <button disabled className="bg-gray-300 text-gray-500 px-4 py-2 rounded-lg text-sm font-medium cursor-not-allowed">
                        Upload Jawaban
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}


        {/* Upload Modal */}
        {showUploadModal && selectedAssignment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Upload Jawaban</h2>
              <p className="text-sm text-gray-500 mb-4">{selectedAssignment.title}</p>
              <form onSubmit={handleSubmitAssignment} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Foto Jawaban</label>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-green-50 file:text-green-700 hover:file:bg-green-100" required />
                  {uploadImage && (
                    <img src={uploadImage} alt="Preview" className="mt-3 max-w-full h-48 object-cover rounded-lg border" />
                  )}
                </div>
                <div className="flex space-x-3 pt-4">
                  <button type="submit" disabled={!uploadImage} className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white py-2 rounded-lg font-medium transition-colors">Kirim Jawaban</button>
                  <button type="button" onClick={() => setShowUploadModal(false)} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded-lg font-medium">Batal</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
