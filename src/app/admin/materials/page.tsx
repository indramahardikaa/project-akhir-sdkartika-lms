'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import { getMaterials, createMaterial, updateMaterial, deleteMaterial, getCourses } from '@/lib/data';
import { Material, Course } from '@/types';

export default function AdminMaterialsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [formData, setFormData] = useState({ courseId: '', title: '', content: '', type: 'text' as 'text' | 'video' | 'document', url: '' });

  useEffect(() => {
    if (isLoading) return;
    if (!user || user.role !== 'admin') { router.push('/login'); return; }
    loadData();
  }, [user, isLoading, router]);

  const loadData = () => { setMaterials(getMaterials()); setCourses(getCourses()); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingMaterial) { updateMaterial(editingMaterial.id, formData); }
    else { createMaterial(formData); }
    setShowModal(false);
    setEditingMaterial(null);
    setFormData({ courseId: '', title: '', content: '', type: 'text', url: '' });
    loadData();
  };

  const handleEdit = (m: Material) => {
    setEditingMaterial(m);
    setFormData({ courseId: m.courseId, title: m.title, content: m.content, type: m.type, url: m.url || '' });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Hapus materi ini?')) { deleteMaterial(id); loadData(); }
  };

  const getCourseName = (courseId: string) => courses.find(c => c.id === courseId)?.title || 'Unknown';

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'text': return 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z';
      case 'video': return 'M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664zM21 12a9 9 0 11-18 0 9 9 0 0118 0z';
      case 'document': return 'M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z';
      default: return '';
    }
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
            <h1 className="text-3xl font-bold text-gray-900">Kelola Materi</h1>
            <p className="text-gray-500 mt-1">Atur semua materi pembelajaran</p>
          </div>
          <button
            onClick={() => { setEditingMaterial(null); setFormData({ courseId: '', title: '', content: '', type: 'text', url: '' }); setShowModal(true); }}
            className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-sm hover:shadow-md"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            <span>Tambah Materi</span>
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Materi</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Kursus</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Tipe</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Tanggal</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {materials.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={getTypeIcon(m.type)} /></svg>
                        </div>
                        <span className="ml-3 text-sm font-semibold text-gray-900">{m.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{getCourseName(m.courseId)}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium capitalize">{m.type}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(m.createdAt).toLocaleDateString('id-ID')}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button onClick={() => handleEdit(m)} className="inline-flex items-center px-3 py-1.5 bg-primary-50 text-primary-700 rounded-lg text-xs font-medium hover:bg-primary-100 transition-colors">Edit</button>
                      <button onClick={() => handleDelete(m.id)} className="inline-flex items-center px-3 py-1.5 bg-accent-50 text-accent-700 rounded-lg text-xs font-medium hover:bg-accent-100 transition-colors">Hapus</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {materials.length === 0 && (
            <div className="text-center py-12"><p className="text-gray-500">Belum ada materi.</p></div>
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl animate-fade-in">
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-xl font-bold text-gray-900">{editingMaterial ? 'Edit Materi' : 'Tambah Materi'}</h2>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Kursus</label>
                  <select value={formData.courseId} onChange={(e) => setFormData({ ...formData, courseId: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 text-gray-900" required>
                    <option value="">Pilih Kursus</option>
                    {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Judul</label>
                  <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 text-gray-900" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tipe</label>
                  <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value as 'text' | 'video' | 'document' })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 text-gray-900">
                    <option value="text">Teks</option>
                    <option value="video">Video</option>
                    <option value="document">Dokumen</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Konten</label>
                  <textarea value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 text-gray-900" rows={4} required />
                </div>
                {formData.type !== 'text' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">URL</label>
                    <input type="url" value={formData.url} onChange={(e) => setFormData({ ...formData, url: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 text-gray-900" />
                  </div>
                )}
                <div className="flex space-x-3 pt-4">
                  <button type="submit" className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-2.5 rounded-xl font-semibold transition-colors shadow-sm">{editingMaterial ? 'Update' : 'Tambah'}</button>
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
