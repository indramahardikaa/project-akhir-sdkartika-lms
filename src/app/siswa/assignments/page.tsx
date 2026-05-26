'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import { getEnrollmentsBySiswa, getAssignmentsByCourse, getSubmissionsBySiswa, createSubmission, getCourses } from '@/lib/data';
import { Assignment, AssignmentSubmission, Course } from '@/types';

interface AssignmentWithStatus {
  assignment: Assignment;
  courseName: string;
  submission?: AssignmentSubmission;
}

function getYouTubeEmbedUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    let videoId = '';
    if (urlObj.hostname.includes('youtube.com')) {
      videoId = urlObj.searchParams.get('v') || '';
    } else if (urlObj.hostname.includes('youtu.be')) {
      videoId = urlObj.pathname.slice(1);
    }
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}`;
    }
  } catch {
    // not a valid URL
  }
  return null;
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
      const course = allCourses.find((c: Course) => c.id === e.courseId);
      if (!course) return;
      const assignments = getAssignmentsByCourse(e.courseId);
      assignments.forEach((a: Assignment) => {
        const submission = mySubmissions.find((s: AssignmentSubmission) => s.assignmentId === a.id);
        allAssignments.push({ assignment: a, courseName: course.title, submission });
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
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div></div>;
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
          <div className="space-y-6">
            {assignmentsWithStatus.map(({ assignment, courseName, submission }) => (
              <div key={assignment.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Header */}
                <div className="p-5 border-b border-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{assignment.title}</h3>
                        <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded text-xs font-medium">{courseName}</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{assignment.description}</p>
                      <p className="text-xs text-gray-500">Deadline: {new Date(assignment.dueDate).toLocaleDateString('id-ID')}</p>
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
                      ) : (
                        <button onClick={() => handleUpload(assignment)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                          Upload Jawaban
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Attachments Section */}
                {(assignment.imageUrl || assignment.videoUrl || assignment.fileUrl || assignment.rppUrl) && (
                  <div className="p-5 bg-gray-50 space-y-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Lampiran dari Guru:</h4>

                    {/* Photo */}
                    {assignment.imageUrl && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          Foto Soal
                        </p>
                        <img src={assignment.imageUrl} alt="Soal" className="max-w-sm rounded-lg border" />
                      </div>
                    )}

                    {/* Video */}
                    {assignment.videoUrl && (
                      <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                          <svg className="w-3.5 h-3.5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          Video Pembelajaran
                        </p>
                        {getYouTubeEmbedUrl(assignment.videoUrl) ? (
                          <div className="aspect-video rounded-lg overflow-hidden">
                            <iframe
                              src={getYouTubeEmbedUrl(assignment.videoUrl)!}
                              className="w-full h-full"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                              title="Video Tugas"
                            />
                          </div>
                        ) : (
                          <a href={assignment.videoUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /></svg>
                            Tonton Video
                          </a>
                        )}
                      </div>
                    )}

                    {/* Document/File */}
                    {assignment.fileUrl && (
                      <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                          <svg className="w-3.5 h-3.5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                          Dokumen
                        </p>
                        <a href={assignment.fileUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-colors text-sm font-medium">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                          {assignment.fileName || 'Download Dokumen'}
                        </a>
                      </div>
                    )}

                    {/* RPP */}
                    {assignment.rppUrl && (
                      <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                          <svg className="w-3.5 h-3.5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                          RPP (Rencana Pelaksanaan Pembelajaran)
                        </p>
                        <a href={assignment.rppUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors text-sm font-medium">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                          {assignment.rppName || 'Download RPP'}
                        </a>
                      </div>
                    )}
                  </div>
                )}
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
                  <input type="file" accept="image/*" onChange={handleImageChange} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" required />
                  {uploadImage && (
                    <img src={uploadImage} alt="Preview" className="mt-3 max-w-full h-48 object-cover rounded-lg border" />
                  )}
                </div>
                <div className="flex space-x-3 pt-4">
                  <button type="submit" disabled={!uploadImage} className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white py-2 rounded-lg font-medium transition-colors">Kirim Jawaban</button>
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
