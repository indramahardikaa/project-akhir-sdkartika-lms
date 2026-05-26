'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import { getClassRooms, getUsersByClass, updateUser, getClassNotesByClass, createClassNote, updateClassNote, deleteClassNote } from '@/lib/data';
import { ClassRoom, User, ClassNote } from '@/types';

export default function GuruStudentsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [classRooms, setClassRooms] = useState<ClassRoom[]>([]);
  const [expandedClass, setExpandedClass] = useState<string | null>(null);
  const [studentsByClass, setStudentsByClass] = useState<Record<string, User[]>>({});
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});
  const [notesByClass, setNotesByClass] = useState<Record<string, ClassNote[]>>({});
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<User | null>(null);
  const [editingNote, setEditingNote] = useState<ClassNote | null>(null);
  const [activeClassId, setActiveClassId] = useState('');
  const [noteForm, setNoteForm] = useState({ title: '', content: '' });
  const [studentForm, setStudentForm] = useState({ name: '', email: '', password: '', classId: '' });
  const [activeTab, setActiveTab] = useState<Record<string, 'students' | 'notes'>>({});

  useEffect(() => {
    if (isLoading) return;
    if (!user || user.role !== 'guru') { router.push('/login'); return; }
    loadData();
  }, [user, isLoading, router]);


  const loadData = () => {
    const rooms = getClassRooms();
    setClassRooms(rooms);
    const sMap: Record<string, User[]> = {};
    const nMap: Record<string, ClassNote[]> = {};
    rooms.forEach(r => {
      sMap[r.id] = getUsersByClass(r.id);
      nMap[r.id] = getClassNotesByClass(r.id);
    });
    setStudentsByClass(sMap);
    setNotesByClass(nMap);
  };

  const toggleClass = (classId: string) => {
    setExpandedClass(expandedClass === classId ? null : classId);
  };

  const togglePassword = (userId: string) => {
    setShowPassword(prev => ({ ...prev, [userId]: !prev[userId] }));
  };

  const getTab = (classId: string) => activeTab[classId] || 'students';
  const setTab = (classId: string, tab: 'students' | 'notes') => {
    setActiveTab(prev => ({ ...prev, [classId]: tab }));
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
    }
    setShowStudentModal(false);
    setEditingStudent(null);
    loadData();
  };

  const handleAddNote = (classId: string) => {
    setEditingNote(null);
    setActiveClassId(classId);
    setNoteForm({ title: '', content: '' });
    setShowNoteModal(true);
  };

  const handleEditNote = (note: ClassNote) => {
    setEditingNote(note);
    setActiveClassId(note.classId);
    setNoteForm({ title: note.title, content: note.content });
    setShowNoteModal(true);
  };

  const handleNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (editingNote) {
      updateClassNote(editingNote.id, { title: noteForm.title, content: noteForm.content });
    } else {
      createClassNote({ classId: activeClassId, guruId: user.id, title: noteForm.title, content: noteForm.content });
    }
    setShowNoteModal(false);
    setEditingNote(null);
    loadData();
  };

  const handleDeleteNote = (id: string) => {
    if (confirm('Hapus catatan ini?')) { deleteClassNote(id); loadData(); }
  };

  if (isLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div></div>;
  }


  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Data Siswa & Catatan Kelas</h1>
          <p className="text-gray-600 mt-1">Kelola data siswa per kelas dan tambahkan catatan</p>
        </div>

        <div className="space-y-4">
          {classRooms.map((room) => (
            <div key={room.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-5 flex items-center justify-between cursor-pointer hover:bg-gray-50" onClick={() => toggleClass(room.id)}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{room.name}</h3>
                    <p className="text-sm text-gray-500">{studentsByClass[room.id]?.length || 0} siswa &bull; {notesByClass[room.id]?.length || 0} catatan</p>
                  </div>
                </div>
                <svg className={`w-5 h-5 text-gray-400 transition-transform ${expandedClass === room.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </div>

              {expandedClass === room.id && (
                <div className="border-t border-gray-100">
                  {/* Tabs */}
                  <div className="flex border-b border-gray-100">
                    <button onClick={() => setTab(room.id, 'students')} className={`px-6 py-3 text-sm font-medium ${getTab(room.id) === 'students' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>Data Siswa</button>
                    <button onClick={() => setTab(room.id, 'notes')} className={`px-6 py-3 text-sm font-medium ${getTab(room.id) === 'notes' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>Catatan Kelas</button>
                  </div>


                  {/* Students Tab */}
                  {getTab(room.id) === 'students' && (
                    <div className="p-5 bg-gray-50">
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
                                <td className="py-3 text-right">
                                  <button onClick={() => handleEditStudent(s)} className="text-blue-600 hover:text-blue-900 text-sm">Edit</button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  )}


                  {/* Notes Tab */}
                  {getTab(room.id) === 'notes' && (
                    <div className="p-5 bg-gray-50">
                      <div className="flex justify-end mb-4">
                        <button onClick={() => handleAddNote(room.id)} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium">+ Tambah Catatan</button>
                      </div>
                      {(notesByClass[room.id] || []).length === 0 ? (
                        <p className="text-gray-500 text-sm text-center py-4">Belum ada catatan untuk kelas ini.</p>
                      ) : (
                        <div className="space-y-3">
                          {(notesByClass[room.id] || []).map((note) => (
                            <div key={note.id} className="bg-white p-4 rounded-lg border border-gray-200">
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-semibold text-gray-900">{note.title}</h4>
                                <div className="flex gap-2">
                                  <button onClick={() => handleEditNote(note)} className="text-blue-600 hover:text-blue-800 text-xs">Edit</button>
                                  <button onClick={() => handleDeleteNote(note.id)} className="text-red-600 hover:text-red-800 text-xs">Hapus</button>
                                </div>
                              </div>
                              <p className="text-sm text-gray-600 whitespace-pre-wrap">{note.content}</p>
                              <p className="text-xs text-gray-400 mt-2">{new Date(note.createdAt).toLocaleDateString('id-ID')}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>


        {/* Edit Student Modal */}
        {showStudentModal && editingStudent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Edit Data Siswa</h2>
              <form onSubmit={handleStudentSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama</label>
                  <input type="text" value={studentForm.name} onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" value={studentForm.email} onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input type="text" value={studentForm.password} onChange={(e) => setStudentForm({ ...studentForm, password: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kelas</label>
                  <select value={studentForm.classId} onChange={(e) => setStudentForm({ ...studentForm, classId: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900" required>
                    <option value="">Pilih Kelas</option>
                    {classRooms.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="flex space-x-3 pt-4">
                  <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium">Update</button>
                  <button type="button" onClick={() => setShowStudentModal(false)} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded-lg font-medium">Batal</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Note Modal */}
        {showNoteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <h2 className="text-xl font-bold text-gray-900 mb-4">{editingNote ? 'Edit Catatan' : 'Tambah Catatan'}</h2>
              <form onSubmit={handleNoteSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Judul</label>
                  <input type="text" value={noteForm.title} onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Isi Catatan</label>
                  <textarea value={noteForm.content} onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900" rows={5} required />
                </div>
                <div className="flex space-x-3 pt-4">
                  <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium">{editingNote ? 'Update' : 'Tambah'}</button>
                  <button type="button" onClick={() => setShowNoteModal(false)} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded-lg font-medium">Batal</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
