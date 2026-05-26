'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import { getClassRooms, getUsersByClass, getUsers, updateUser, createClassRoom, deleteClassRoom, createUser, deleteUser } from '@/lib/data';
import { ClassRoom, User } from '@/types';

export default function AdminStudentsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [classRooms, setClassRooms] = useState<ClassRoom[]>([]);
  const [expandedClass, setExpandedClass] = useState<string | null>(null);
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

  const toggleClass = (classId: string) => {
    setExpandedClass(expandedClass === classId ? null : classId);
  };

  const togglePassword = (userId: string) => {
    setShowPassword(prev => ({ ...prev, [userId]: !prev[userId] }));
  };


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
            <p className="text-gray-600 mt-1">Kelola kelas dan data siswa dalam satu halaman</p>
          </div>
          <button onClick={() => { setClassForm({ name: '', grade: 1, section: 'A' }); setShowClassModal(true); }} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
            + Tambah Kelas
          </button>
        </div>

        {/* Class List */}
        <div className="space-y-4">
          {classRooms.map((room) => (
            <div key={room.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-5 flex items-center justify-between cursor-pointer hover:bg-gray-50" onClick={() => toggleClass(room.id)}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{room.name}</h3>
                    <p className="text-sm text-gray-500">{studentsByClass[room.id]?.length || 0} siswa</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={(e) => { e.stopPropagation(); handleAddStudent(room.id); }} className="text-green-600 hover:text-green-800 text-sm font-medium">+ Siswa</button>
                  <button onClick={(e) => { e.stopPropagation(); handleDeleteClass(room.id); }} className="text-red-600 hover:text-red-800 text-sm font-medium">Hapus</button>
                  <svg className={`w-5 h-5 text-gray-400 transition-transform ${expandedClass === room.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>


              {/* Student List - Expanded */}
              {expandedClass === room.id && (
                <div className="border-t border-gray-100 p-5 bg-gray-50">
                  {(studentsByClass[room.id] || []).length === 0 ? (
                    <p className="text-gray-500 text-sm text-center py-4">Belum ada siswa di kelas ini.</p>
                  ) : (
                    <table className="min-w-full">
                      <thead>
                        <tr className="text-left text-xs font-medium text-gray-500 uppercase">
                          <th className="pb-3">Nama</th>
                          <th className="pb-3">Email</th>
                          <th className="pb-3">Password</th>
                          <th className="pb-3 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {(studentsByClass[room.id] || []).map((s) => (
                          <tr key={s.id} className="hover:bg-white">
                            <td className="py-3 text-sm font-medium text-gray-900">{s.name}</td>
                            <td className="py-3 text-sm text-gray-500">{s.email}</td>
                            <td className="py-3 text-sm text-gray-500">
                              <div className="flex items-center gap-2">
                                <span>{showPassword[s.id] ? s.password : '••••••••'}</span>
                                <button onClick={() => togglePassword(s.id)} className="text-gray-400 hover:text-gray-600">
                                  {showPassword[s.id] ? (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                                  ) : (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                  )}
                                </button>
                              </div>
                            </td>
                            <td className="py-3 text-right space-x-2">
                              <button onClick={() => handleEditStudent(s)} className="text-indigo-600 hover:text-indigo-900 text-sm">Edit</button>
                              <button onClick={() => handleDeleteStudent(s.id)} className="text-red-600 hover:text-red-900 text-sm">Hapus</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>


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
