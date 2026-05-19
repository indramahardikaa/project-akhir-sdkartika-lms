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
    if (confirm('Hapus kursus ini? Semua materi terkait juga akan dihapus.')) {
      deleteCourse(id);
      loadData();
    }
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
            <h1 className="text-3xl font-bold text-gray-900">Kelola Kursus</h1>
            <p className="text-gray-600 mt-1">Atur semua kursus yang tersedia</p>
          </div>
          <button
            onClick={() => { setEditingCourse(null); setFormData({ title: '', description: '', guruId: '', guruName: '', category: '' }); setShowModal(true); }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            + Tambah Kursus
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((c) => (
            <div key={c.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex justify-between items-start mb-3">
                <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-medium">{c.category}</span>
                <div className="space-x-2">
                  <button onClick={() => handleEdit(c)} className="text-indigo-600 hover:text-indigo-900 text-sm">Edit</button>
                  <button onClick={() => handleDelete(c.id)} className="text-red-600 hover:text-red-900 text-sm">Hapus</button>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{c.title}</h3>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{c.description}</p>
              <p className="text-xs text-gray-500">Guru: {c.guruName}</p>
            </div>
          ))}
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <h2 className="text-xl font-bold text-gray-900 mb-4">{editingCourse ? 'Edit Kursus' : 'Tambah Kursus'}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Judul</label>
                  <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                  <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900" rows={3} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                  <input type="text" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Guru Pengampu</label>
                  <select value={formData.guruId} onChange={(e) => setFormData({ ...formData, guruId: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900" required>
                    <option value="">Pilih Guru</option>
                    {gurus.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                  </select>
                </div>
                <div className="flex space-x-3 pt-4">
                  <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-medium">{editingCourse ? 'Update' : 'Tambah'}</button>
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded-lg font-medium">Batal</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
