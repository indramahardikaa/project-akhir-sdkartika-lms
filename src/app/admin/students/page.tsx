'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import { getClassRooms, getUsersByClass, updateUser, createClassRoom, deleteClassRoom, createUser, deleteUser } from '@/lib/data';
import { ClassRoom, User } from '@/types';

export default function AdminStudentsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [classRooms, setClassRooms] = useState<ClassRoom[]>([]);
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [studentsByClass, setStudentsByClass] = useState<Record<string, User[]>>({});
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});
  const [showClassModal, setShowClassModal] = useState(false);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<User | null>(null);
  const [classForm, setClassForm] = useState({ name: '', grade: 1, section: 'A' });
  const [studentForm, setStudentForm] = useState({ name: '', email: '', password: '', classId: '' });

  useEffect(() => {
    if (isLoading) return;
    if (!user || user.role !== 'admin') { router.push('/login'); return; }
    loadData();
  }, [user, isLoading, router]);

  const loadData = () => {
    const rooms = getClassRooms();
    setClassRooms(rooms);
    const map: Record<string, User[]> = {};
    rooms.forEach(r => { map[r.id] = getUsersByClass(r.id); });
    setStudentsByClass(map);
  };

  const togglePassword = (userId: string) => {
    setShowPassword(prev => ({ ...prev, [userId]: !prev[userId] }));
  };

  // Get unique grades from classRooms
  const grades = Array.from(new Set(classRooms.map(r => r.grade))).sort((a, b) => a - b);

  // Get sections for selected grade
  const sectionsForGrade = selectedGrade !== null
    ? classRooms.filter(r => r.grade === selectedGrade).sort((a, b) => a.section.localeCompare(b.section))
    : [];

  // Get selected classroom
  const selectedClassRoom = selectedGrade !== null && selectedSection !== null
    ? classRooms.find(r => r.grade === selectedGrade && r.section === selectedSection)
    : null;

  // Get students for selected class
  const studentsInSelectedClass = selectedClassRoom ? (studentsByClass[selectedClassRoom.id] || []) : [];

  const handleAddClass = (e: React.FormEvent) => {
    e.preventDefault();
    createClassRoom({ name: classForm.name, grade: classForm.grade, section: classForm.section });
    setShowClassModal(false);
    setClassForm({ name: '', grade: 1, section: 'A' });
    loadData();
  };

  const handleDeleteClass = (id: string) => {
    if (confirm('Hapus kelas ini? Siswa di kelas ini tidak akan dihapus.')) {
      deleteClassRoom(id);
      setSelectedSection(null);
      loadData();
    }
  };

  const handleEditStudent = (s: User) => {
    setEditingStudent(s);
    setStudentForm({ name: s.name, email: s.email, password: s.password, classId: s.classId || '' });
    setShowStudentModal(true);
  };

  const handleAddStudent = (classId: string) => {
    setEditingStudent(null);
    setStudentForm({ name: '', email: '', password: '', classId });
    setShowStudentModal(true);
  };

  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingStudent) {
      updateUser(editingStudent.id, { name: studentForm.name, email: studentForm.email, password: studentForm.password, classId: studentForm.classId });
    } else {
      createUser({ name: studentForm.name, email: studentForm.email, password: studentForm.password, role: 'siswa', classId: studentForm.classId });
    }
    setShowStudentModal(false);
    setEditingStudent(null);
    loadData();
  };

  const handleDeleteStudent = (id: string) => {
    if (confirm('Hapus siswa ini?')) { deleteUser(id); loadData(); }
  };

  if (isLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manajemen Kelas & Data Siswa</h1>
            <p className="text-gray-600 mt-1">Kelola kelas dan data siswa berdasarkan tingkat</p>
          </div>
          <button onClick={() => { setClassForm({ name: '', grade: 1, section: 'A' }); setShowClassModal(true); }} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
            + Tambah Kelas
          </button>
        </div>

        {/* Breadcrumb Navigation */}
        <div className="mb-6 flex items-center gap-2 text-sm">
          <button
            onClick={() => { setSelectedGrade(null); setSelectedSection(null); }}
            className={`font-medium ${selectedGrade === null ? 'text-indigo-600' : 'text-gray-500 hover:text-indigo-600'}`}
          >
            Semua Tingkat
          </button>
          {selectedGrade !== null && (
            <>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              <button
                onClick={() => { setSelectedSection(null); }}
                className={`font-medium ${selectedSection === null ? 'text-indigo-600' : 'text-gray-500 hover:text-indigo-600'}`}
              >
                Kelas {selectedGrade}
              </button>
            </>
          )}
          {selectedSection !== null && selectedGrade !== null && (
            <>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              <span className="font-medium text-indigo-600">Kelas {selectedGrade}{selectedSection}</span>
            </>
          )}
        </div>

        {/* Level 1: Grade Buttons */}
        {selectedGrade === null && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {grades.length === 0 ? (
              <div className="col-span-full text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
                <p className="text-gray-500">Belum ada kelas. Klik &quot;+ Tambah Kelas&quot; untuk memulai.</p>
              </div>
            ) : (
              grades.map((grade) => {
                const classesInGrade = classRooms.filter(r => r.grade === grade);
                const totalStudents = classesInGrade.reduce((sum, r) => sum + (studentsByClass[r.id]?.length || 0), 0);
                return (
                  <button
                    key={grade}
                    onClick={() => setSelectedGrade(grade)}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:border-indigo-300 hover:shadow-md transition-all text-center group"
                  >
                    <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-indigo-200 transition-colors">
                      <span className="text-2xl font-bold text-indigo-600">{grade}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Kelas {grade}</h3>
                    <p className="text-sm text-gray-500 mt-1">{classesInGrade.length} rombel</p>
                    <p className="text-xs text-gray-400">{totalStudents} siswa</p>
                  </button>
                );
              })
            )}
          </div>
        )}

        {/* Level 2: Sections for Selected Grade */}
        {selectedGrade !== null && selectedSection === null && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {sectionsForGrade.length === 0 ? (
                <div className="col-span-full text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
                  <p className="text-gray-500">Belum ada rombel untuk Kelas {selectedGrade}.</p>
                </div>
              ) : (
                sectionsForGrade.map((room) => {
                  const studentCount = studentsByClass[room.id]?.length || 0;
                  return (
                    <div key={room.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:border-indigo-300 hover:shadow-md transition-all">
                      <button
                        onClick={() => setSelectedSection(room.section)}
                        className="w-full text-center"
                      >
                        <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <span className="text-xl font-bold text-green-600">{selectedGrade}{room.section}</span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">{room.name}</h3>
                        <p className="text-sm text-gray-500 mt-1">{studentCount} siswa</p>
                      </button>
                      <div className="mt-3 pt-3 border-t border-gray-100 flex justify-center">
                        <button onClick={() => handleDeleteClass(room.id)} className="text-red-500 hover:text-red-700 text-xs font-medium">Hapus Kelas</button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Level 3: Students in Selected Section */}
        {selectedGrade !== null && selectedSection !== null && selectedClassRoom && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <span className="text-lg font-bold text-indigo-600">{selectedGrade}{selectedSection}</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{selectedClassRoom.name}</h3>
                  <p className="text-sm text-gray-500">{studentsInSelectedClass.length} siswa</p>
                </div>
              </div>
              <button onClick={() => handleAddStudent(selectedClassRoom.id)} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                + Tambah Siswa
              </button>
            </div>

            <div className="p-5">
              {studentsInSelectedClass.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-8">Belum ada siswa di kelas ini.</p>
              ) : (
                <table className="min-w-full">
                  <thead>
                    <tr className="text-left text-xs font-medium text-gray-500 uppercase">
                      <th className="pb-3 pr-4">No</th>
                      <th className="pb-3">Nama</th>
                      <th className="pb-3">Email</th>
                      <th className="pb-3">Password</th>
                      <th className="pb-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {studentsInSelectedClass.map((s, idx) => (
                      <tr key={s.id} className="hover:bg-gray-50">
                        <td className="py-3 pr-4 text-sm text-gray-500">{idx + 1}</td>
                        <td className="py-3 text-sm font-medium text-gray-900">{s.name}</td>
                        <td className="py-3 text-sm text-gray-500">{s.email}</td>
                        <td className="py-3 text-sm text-gray-500">
                          <div className="flex items-center gap-2">
                            <span className="font-mono">{showPassword[s.id] ? s.password : '••••••••'}</span>
                            <button onClick={() => togglePassword(s.id)} className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100" title={showPassword[s.id] ? 'Sembunyikan password' : 'Lihat password'}>
                              {showPassword[s.id] ? (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                              ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                              )}
                            </button>
                          </div>
                        </td>
                        <td className="py-3 text-right space-x-2">
                          <button onClick={() => handleEditStudent(s)} className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-900 text-sm font-medium px-2 py-1 rounded hover:bg-indigo-50">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            Edit
                          </button>
                          <button onClick={() => handleDeleteStudent(s.id)} className="text-red-600 hover:text-red-900 text-sm font-medium px-2 py-1 rounded hover:bg-red-50">Hapus</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* Add Class Modal */}
        {showClassModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Tambah Kelas Baru</h2>
              <form onSubmit={handleAddClass} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Kelas</label>
                  <input type="text" value={classForm.name} onChange={(e) => setClassForm({ ...classForm, name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900" placeholder="Contoh: Kelas 3A" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tingkat</label>
                    <select value={classForm.grade} onChange={(e) => setClassForm({ ...classForm, grade: Number(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900">
                      {[1,2,3,4,5,6].map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rombel</label>
                    <select value={classForm.section} onChange={(e) => setClassForm({ ...classForm, section: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900">
                      {['A','B','C','D'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex space-x-3 pt-4">
                  <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-medium">Tambah</button>
                  <button type="button" onClick={() => setShowClassModal(false)} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded-lg font-medium">Batal</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add/Edit Student Modal */}
        {showStudentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <h2 className="text-xl font-bold text-gray-900 mb-4">{editingStudent ? 'Edit Data Siswa' : 'Tambah Siswa Baru'}</h2>
              <form onSubmit={handleStudentSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama</label>
                  <input type="text" value={studentForm.name} onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" value={studentForm.email} onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input type="text" value={studentForm.password} onChange={(e) => setStudentForm({ ...studentForm, password: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900" required={!editingStudent} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kelas</label>
                  <select value={studentForm.classId} onChange={(e) => setStudentForm({ ...studentForm, classId: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900" required>
                    <option value="">Pilih Kelas</option>
                    {classRooms.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="flex space-x-3 pt-4">
                  <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-medium">{editingStudent ? 'Update' : 'Tambah'}</button>
                  <button type="button" onClick={() => setShowStudentModal(false)} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded-lg font-medium">Batal</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
