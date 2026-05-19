'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { getCourses, createCourse, updateCourse, deleteCourse, getUsers, getKelas } from '@/lib/data';
import { Course, User } from '@/types';

export default function AdminCoursesPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [form, setForm] = useState({ title: '', description: '', guruId: '', category: '' });
  const [gurus, setGurus] = useState<User[]>([]);

  useEffect(() => {
    if (isLoading) return;
    if (!user || user.role !== 'admin') { router.push('/login'); return; }
    loadData();
  }, [user, isLoading, router]);

  const loadData = () => {
    setCourses(getCourses());
    setGurus(getUsers().filter(u => u.role === 'guru'));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.guruId) return;
    const guru = gurus.find(g => g.id === form.guruId);
    if (editingCourse) {
      updateCourse(editingCourse.id, { title: form.title, description: form.description, guruId: form.guruId, guruName: guru?.name || '', category: form.category });
    } else {
      createCourse({ title: form.title, description: form.description, guruId: form.guruId, guruName: guru?.name || '', category: form.category });
    }
    closeModal();
    loadData();
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCourse(null);
    setForm({ title: '', description: '', guruId: '', category: '' });
  };

  const handleEdit = (c: Course) => {
    setEditingCourse(c);
    setForm({ title: c.title, description: c.description, guruId: c.guruId, category: c.category });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Hapus mata pelajaran ini? Semua materi terkait juga akan terhapus.')) {
      deleteCourse(id);
      loadData();
    }
  };

  if (isLoading || !user) return null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Mata Pelajaran</h2>
            <p className="text-sm text-gray-500 mt-1">Kelola mata pelajaran dan assign guru pengampu</p>
          </div>
          <button
            onClick={() => { setEditingCourse(null); setForm({ title: '', description: '', guruId: '', category: '' }); setShowModal(true); }}
            className="flex items-center space-x-2 px-4 py-2.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors shadow-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            <span>Tambah Mapel</span>
          </button>
        </div>

        {/* Courses Table */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-primary-50">
                <tr>
                  <th className="px-5 py-3.5 text-left font-semibold text-primary-800">Mata Pelajaran</th>
                  <th className="px-5 py-3.5 text-left font-semibold text-primary-800">Kategori</th>
                  <th className="px-5 py-3.5 text-left font-semibold text-primary-800">Guru Pengampu</th>
                  <th className="px-5 py-3.5 text-left font-semibold text-primary-800">Deskripsi</th>
                  <th className="px-5 py-3.5 text-center font-semibold text-primary-800">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {courses.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                        </div>
                        <span className="font-semibold text-gray-800">{c.title}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium">{c.category}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center space-x-2">
                        <div className="w-7 h-7 bg-primary-200 rounded-full flex items-center justify-center text-xs font-bold text-primary-700">{c.guruName.charAt(0)}</div>
                        <span className="text-gray-700">{c.guruName}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-gray-500 max-w-[200px] truncate">{c.description || '-'}</td>
                    <td className="px-5 py-3.5 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button onClick={() => handleEdit(c)} className="p-1.5 bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 transition-colors" title="Edit">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>
                        <button onClick={() => handleDelete(c.id)} className="p-1.5 bg-accent-50 text-accent-700 rounded-lg hover:bg-accent-100 transition-colors" title="Hapus">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {courses.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">Belum ada mata pelajaran. Klik &quot;Tambah Mapel&quot; untuk memulai.</p>
            </div>
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-xl font-bold text-gray-800">{editingCourse ? 'Edit Mata Pelajaran' : 'Tambah Mata Pelajaran'}</h3>
                <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-lg"><svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nama Mata Pelajaran *</label>
                  <input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Contoh: Matematika, Bahasa Indonesia, IPA..." className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Kategori</label>
                  <input type="text" value={form.category} onChange={e => setForm({...form, category: e.target.value})} placeholder="Contoh: Matematika, Bahasa, Sains, Sosial..." className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Guru Pengampu *</label>
                  <select value={form.guruId} onChange={e => setForm({...form, guruId: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900" required>
                    <option value="">-- Pilih Guru --</option>
                    {gurus.map(g => <option key={g.id} value={g.id}>{g.name} ({g.email})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Deskripsi</label>
                  <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Deskripsi singkat mata pelajaran..." rows={3} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900" />
                </div>
                <div className="flex space-x-3 pt-3">
                  <button type="submit" className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-2.5 rounded-xl font-semibold transition-colors shadow-sm">
                    {editingCourse ? 'Simpan Perubahan' : 'Tambah Mata Pelajaran'}
                  </button>
                  <button type="button" onClick={closeModal} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-xl font-semibold transition-colors">Batal</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
