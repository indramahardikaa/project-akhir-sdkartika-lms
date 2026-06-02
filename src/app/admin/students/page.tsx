'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { getClassRooms, getUsersByClass, getUsers, updateUser, createClassRoom, deleteClassRoom, createUser, deleteUser, promoteClass, getAlumniUsers, getClassRoomById } from '@/lib/data';
import { ClassRoom, User } from '@/types';

export default function AdminStudentsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [classRooms, setClassRooms] = useState<ClassRoom[]>([]);
  const [selectedClass, setSelectedClass] = useState<ClassRoom | null>(null);
  const [students, setStudents] = useState<User[]>([]);
  const [alumniStudents, setAlumniStudents] = useState<User[]>([]);
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});
  const [showClassModal, setShowClassModal] = useState(false);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showPromoteModal, setShowPromoteModal] = useState(false);
  const [showAlumni, setShowAlumni] = useState(false);
  const [editingStudent, setEditingStudent] = useState<User | null>(null);
  const [passwordStudent, setPasswordStudent] = useState<User | null>(null);
  const [classForm, setClassForm] = useState({ name: '', grade: 1, section: 'A' });
  const [studentForm, setStudentForm] = useState({ name: '', email: '', password: '', classId: '' });
  const [newPassword, setNewPassword] = useState('');
  const [promoteResult, setPromoteResult] = useState<{ promoted: number; graduated: number } | null>(null);

  useEffect(() => {
    if (isLoading) return;
    if (!user || user.role !== 'admin') { router.push('/login'); return; }
    loadData();
  }, [user, isLoading, router]);

  const loadData = () => {
    const rooms = getClassRooms();
    setClassRooms(rooms);
    setAlumniStudents(getAlumniUsers());
    if (selectedClass) {
      setStudents(getUsersByClass(selectedClass.id));
    }
  };

  const handleSelectClass = (room: ClassRoom) => {
    setSelectedClass(room);
    setStudents(getUsersByClass(room.id));
    setShowAlumni(false);
  };

  const handleBackToClasses = () => {
    setSelectedClass(null);
    setStudents([]);
    setShowAlumni(false);
  };

  const handleShowAlumni = () => {
    setSelectedClass(null);
    setShowAlumni(true);
    setAlumniStudents(getAlumniUsers());
  };

  const togglePassword = (userId: string) => {
    setShowPassword(prev => ({ ...prev, [userId]: !prev[userId] }));
  };

  // Class CRUD
  const handleAddClass = (e: React.FormEvent) => {
    e.preventDefault();
    const name = `Kelas ${classForm.grade}${classForm.section}`;
    createClassRoom({ name, grade: classForm.grade, section: classForm.section });
    setShowClassModal(false);
    setClassForm({ name: '', grade: 1, section: 'A' });
    loadData();
  };

  const handleDeleteClass = (id: string) => {
    if (confirm('Hapus kelas ini? Siswa di kelas ini tidak akan dihapus tetapi akan kehilangan kelas.')) {
      deleteClassRoom(id);
      if (selectedClass?.id === id) handleBackToClasses();
      loadData();
    }
  };

  // Student CRUD
  const handleAddStudent = () => {
    if (!selectedClass) return;
    setEditingStudent(null);
    setStudentForm({ name: '', email: '', password: '', classId: selectedClass.id });
    setShowStudentModal(true);
  };

  const handleEditStudent = (s: User) => {
    setEditingStudent(s);
    setStudentForm({ name: s.name, email: s.email, password: s.password, classId: s.classId || '' });
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
    if (selectedClass) setStudents(getUsersByClass(selectedClass.id));
  };

  const handleDeleteStudent = (id: string) => {
    if (confirm('Hapus siswa ini?')) {
      deleteUser(id);
      loadData();
      if (selectedClass) setStudents(getUsersByClass(selectedClass.id));
    }
  };

  // Password change
  const handleChangePassword = (s: User) => {
    setPasswordStudent(s);
    setNewPassword(s.password);
    setShowPasswordModal(true);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordStudent) return;
    updateUser(passwordStudent.id, { password: newPassword });
    setShowPasswordModal(false);
    setPasswordStudent(null);
    setNewPassword('');
    loadData();
    if (selectedClass) setStudents(getUsersByClass(selectedClass.id));
  };

  // Class Promotion
  const handlePromoteClass = () => {
    if (!selectedClass) return;
    const gradeText = selectedClass.grade >= 6 ? 'lulus (menjadi alumni)' : `naik ke Kelas ${selectedClass.grade + 1}${selectedClass.section}`;
    if (confirm(`Naikkan semua siswa di ${selectedClass.name}? Mereka akan ${gradeText}.`)) {
      const result = promoteClass(selectedClass.id);
      setPromoteResult(result);
      setShowPromoteModal(true);
      loadData();
      setStudents(getUsersByClass(selectedClass.id));
    }
  };

  if (isLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div></div>;
  }

  // ALUMNI VIEW
  if (showAlumni) {
    return (
      <DashboardLayout>
  
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <button onClick={handleBackToClasses} className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Alumni</h1>
              <p className="text-gray-600 mt-1">Daftar siswa yang telah lulus (kelas 6 naik kelas)</p>
            </div>
          </div>

          {alumniStudents.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /></svg>
              <p className="text-gray-500">Belum ada alumni.</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">No</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Asal Kelas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {alumniStudents.map((s, idx) => {
                    const room = s.classId ? getClassRoomById(s.classId) : null;
                    return (
                      <tr key={s.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-500">{idx + 1}</td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{s.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{s.email}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{room?.name || '-'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </DashboardLayout>
    );
  }

  // STUDENT LIST VIEW (inside a class)
  if (selectedClass) {
    return (
      <DashboardLayout>
  
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <button onClick={handleBackToClasses} className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{selectedClass.name}</h1>
                <p className="text-gray-600 mt-1">Data siswa di {selectedClass.name} &bull; {students.length} siswa</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={handlePromoteClass} className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                {selectedClass.grade >= 6 ? 'Luluskan' : 'Naik Kelas'}
              </button>
              <button onClick={handleAddStudent} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                + Tambah Siswa
              </button>
            </div>
          </div>

          {students.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197" /></svg>
              <p className="text-gray-500 mb-2">Belum ada siswa di kelas ini.</p>
              <button onClick={handleAddStudent} className="text-green-600 hover:text-green-800 font-medium text-sm">+ Tambah Siswa Baru</button>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">No</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Siswa</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Password</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {students.map((s, idx) => (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-500">{idx + 1}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{s.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{s.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <span className="font-mono">{showPassword[s.id] ? s.password : '••••••••'}</span>
                          <button onClick={() => togglePassword(s.id)} className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100" title={showPassword[s.id] ? 'Sembunyikan' : 'Lihat password'}>
                            {showPassword[s.id] ? (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                            ) : (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleEditStudent(s)} className="px-3 py-1.5 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg text-xs font-medium transition-colors">Edit</button>
                          <button onClick={() => handleChangePassword(s)} className="px-3 py-1.5 bg-amber-50 text-amber-600 hover:bg-amber-100 rounded-lg text-xs font-medium transition-colors">Ganti Password</button>
                          <button onClick={() => handleDeleteStudent(s.id)} className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-xs font-medium transition-colors">Hapus</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Edit Student Modal */}
          {showStudentModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl p-6 w-full max-w-md">
                <h2 className="text-xl font-bold text-gray-900 mb-4">{editingStudent ? 'Edit Data Siswa' : 'Tambah Siswa Baru'}</h2>
                <form onSubmit={handleStudentSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                    <input type="text" value={studentForm.name} onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-gray-900" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input type="email" value={studentForm.email} onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-gray-900" required />
                  </div>
                  {!editingStudent && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                      <input type="text" value={studentForm.password} onChange={(e) => setStudentForm({ ...studentForm, password: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-gray-900" required />
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kelas</label>
                    <select value={studentForm.classId} onChange={(e) => setStudentForm({ ...studentForm, classId: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-gray-900" required>
                      <option value="">Pilih Kelas</option>
                      {classRooms.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="flex space-x-3 pt-4">
                    <button type="submit" className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium">{editingStudent ? 'Update' : 'Tambah'}</button>
                    <button type="button" onClick={() => setShowStudentModal(false)} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded-lg font-medium">Batal</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Change Password Modal */}
          {showPasswordModal && passwordStudent && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl p-6 w-full max-w-md">
                <h2 className="text-xl font-bold text-gray-900 mb-2">Ganti Password</h2>
                <p className="text-sm text-gray-500 mb-4">Siswa: <span className="font-medium text-gray-700">{passwordStudent.name}</span></p>
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password Saat Ini</label>
                    <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 font-mono">{passwordStudent.password}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password Baru</label>
                    <input type="text" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-gray-900" required minLength={6} />
                    <p className="text-xs text-gray-400 mt-1">Minimal 6 karakter</p>
                  </div>
                  <div className="flex space-x-3 pt-4">
                    <button type="submit" className="flex-1 bg-amber-500 hover:bg-amber-600 text-white py-2 rounded-lg font-medium">Simpan Password</button>
                    <button type="button" onClick={() => setShowPasswordModal(false)} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded-lg font-medium">Batal</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Promote Result Modal */}
          {showPromoteModal && promoteResult && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl p-6 w-full max-w-sm text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Kenaikan Kelas Berhasil!</h2>
                {promoteResult.promoted > 0 && (
                  <p className="text-sm text-gray-600 mb-1">{promoteResult.promoted} siswa berhasil naik kelas</p>
                )}
                {promoteResult.graduated > 0 && (
                  <p className="text-sm text-gray-600 mb-1">{promoteResult.graduated} siswa lulus dan masuk alumni</p>
                )}
                {promoteResult.promoted === 0 && promoteResult.graduated === 0 && (
                  <p className="text-sm text-gray-500">Tidak ada siswa di kelas ini.</p>
                )}
                <button onClick={() => setShowPromoteModal(false)} className="mt-4 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium">Tutup</button>
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    );
  }

  // MAIN VIEW - CLASS LIST
  return (
    <DashboardLayout>

      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manajemen Kelas</h1>
            <p className="text-gray-600 mt-1">Pilih kelas untuk mengelola data siswa di dalamnya</p>
          </div>
          <div className="flex gap-3">
            <button onClick={handleShowAlumni} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /></svg>
              Alumni
            </button>
            <button onClick={() => { setClassForm({ name: '', grade: 1, section: 'A' }); setShowClassModal(true); }} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
              + Tambah Kelas
            </button>
          </div>
        </div>

        {/* Class Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classRooms.sort((a, b) => a.grade - b.grade || a.section.localeCompare(b.section)).map((room) => {
            const studentCount = getUsersByClass(room.id).length;
            return (
              <div key={room.id} className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-green-200 transition-all cursor-pointer group" onClick={() => handleSelectClass(room)}>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-200 transition-colors">
                      <span className="text-green-700 font-bold text-lg">{room.grade}{room.section}</span>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); handleDeleteClass(room.id); }} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{room.name}</h3>
                  <p className="text-sm text-gray-500">{studentCount} siswa</p>
                  <div className="mt-4 flex items-center text-sm text-green-600 font-medium group-hover:text-green-700">
                    <span>Lihat Data Siswa</span>
                    <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {classRooms.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
            <p className="text-gray-500">Belum ada kelas. Klik tombol "+ Tambah Kelas" untuk memulai.</p>
          </div>
        )}

        {/* Add Class Modal */}
        {showClassModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Tambah Kelas Baru</h2>
              <form onSubmit={handleAddClass} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tingkat Kelas</label>
                    <select value={classForm.grade} onChange={(e) => setClassForm({ ...classForm, grade: Number(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900">
                      {[1,2,3,4,5,6].map(g => <option key={g} value={g}>Kelas {g}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rombel</label>
                    <select value={classForm.section} onChange={(e) => setClassForm({ ...classForm, section: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900">
                      {['A','B','C','D'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-600">Nama kelas: <span className="font-medium text-gray-900">Kelas {classForm.grade}{classForm.section}</span></p>
                </div>
                <div className="flex space-x-3 pt-4">
                  <button type="submit" className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium">Tambah</button>
                  <button type="button" onClick={() => setShowClassModal(false)} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded-lg font-medium">Batal</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}