'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import { getCourses, createCourse, updateCourse, deleteCourse, getUsers } from '@/lib/data';
import { Course, User } from '@/types';

export default function AdminCoursesPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [gurus, setGurus] = useState<User[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState({ title: '', description: '', guruId: '', guruName: '', category: '' });

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
    const guru = gurus.find(g => g.id === formData.guruId);
    const data = { ...formData, guruName: guru?.name || '' };
    if (editingCourse) { updateCourse(editingCourse.id, data); }
    else { createCourse(data); }
    setShowModal(false);
    setEditingCourse(null);
    setFormData({ title: '', description: '', guruId: '', guruName: '', category: '' });
    loadData();
  };

  const handleEdit = (c: Course) => {
    setEditingCourse(c);
    setFormData({ title: c.title, description: c.description, guruId: c.guruId, guruName: c.guruName, category: c.category });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Hapus kursus ini? Semua materi terkait juga akan dihapus.')) { deleteCourse(id); loadData(); }
  };

  if (isLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Kelola Kursus</h1>
            <p className="text-gray-500 mt-1">Atur semua kursus yang tersedia di sistem</p>
          </div>
          <button
            onClick={() => { setEditingCourse(null); setFormData({ title: '', description: '', guruId: '', guruName: '', category: '' }); setShowModal(true); }}
            className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-sm hover:shadow-md"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            <span>Tambah Kursus</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((c) => (
            <div key={c.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300 group">
              <div className="h-2 bg-gradient-to-r from-primary-500 to-primary-600"></div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <span className="px-3 py-1 bg-primary-50 text-primary-700 rounded-lg text-xs font-semibold border border-primary-100">{c.category}</span>
                  <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEdit(c)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </button>
                    <button onClick={() => handleDelete(c.id)} className="p-1.5 hover:bg-accent-50 rounded-lg transition-colors">
                      <svg className="w-4 h-4 text-accent-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{c.title}</h3>
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">{c.description}</p>
                <div className="flex items-center pt-4 border-t border-gray-100">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-700 text-xs font-bold">{c.guruName.charAt(0)}</span>
                  </div>
                  <span className="ml-2 text-sm text-gray-600">{c.guruName}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {courses.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            <p className="text-gray-500">Belum ada kursus. Klik tombol &quot;Tambah Kursus&quot; untuk memulai.</p>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl animate-fade-in">
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-xl font-bold text-gray-900">{editingCourse ? 'Edit Kursus' : 'Tambah Kursus'}</h2>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Judul Kursus</label>
                  <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Deskripsi</label>
                  <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900" rows={3} required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Kategori</label>
                  <input type="text" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Guru Pengampu</label>
                  <select value={formData.guruId} onChange={(e) => setFormData({ ...formData, guruId: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900" required>
                    <option value="">Pilih Guru</option>
                    {gurus.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                  </select>
                </div>
                <div className="flex space-x-3 pt-4">
                  <button type="submit" className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-2.5 rounded-xl font-semibold transition-colors shadow-sm">{editingCourse ? 'Update' : 'Tambah'}</button>
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-xl font-semibold transition-colors">Batal</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
