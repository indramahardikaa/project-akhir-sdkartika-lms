'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import { getCoursesByGuru, getMaterials, createMaterial, updateMaterial, deleteMaterial } from '@/lib/data';
import { Material, Course } from '@/types';

export default function GuruMaterialsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [formData, setFormData] = useState({
    courseId: '', title: '', content: '',
    type: 'text' as 'text' | 'video' | 'document', url: ''
  });

  useEffect(() => {
    if (isLoading) return;
    if (!user || user.role !== 'guru') { router.push('/login'); return; }
    loadData();
  }, [user, isLoading, router]);

  const loadData = () => {
    if (!user) return;
    const myCourses = getCoursesByGuru(user.id);
    setCourses(myCourses);
    const courseIds = myCourses.map(c => c.id);
    setMaterials(getMaterials().filter(m => courseIds.includes(m.courseId)));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingMaterial) { updateMaterial(editingMaterial.id, formData); }
    else { createMaterial(formData); }
    closeModal();
    loadData();
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingMaterial(null);
    setFormData({ courseId: '', title: '', content: '', type: 'text', url: '' });
  };

  const handleEdit = (m: Material) => {
    setEditingMaterial(m);
    setFormData({ courseId: m.courseId, title: m.title, content: m.content, type: m.type, url: m.url || '' });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Hapus materi ini?')) { deleteMaterial(id); loadData(); }
  };


  const getCourseName = (courseId: string) => courses.find(c => c.id === courseId)?.title || '';

  if (isLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Materi Pembelajaran</h1>
            <p className="text-gray-500 mt-1">Kelola materi untuk kursus Anda</p>
          </div>
          <button
            onClick={() => { setEditingMaterial(null); setFormData({ courseId: '', title: '', content: '', type: 'text', url: '' }); setShowModal(true); }}
            className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-sm hover:shadow-md"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            <span>Tambah Materi</span>
          </button>
        </div>

        <div className="space-y-4">
          {materials.map((m) => (
            <div key={m.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all duration-300">
              <div className="flex justify-between items-start">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-semibold text-gray-900">{m.title}</h3>
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium capitalize">{m.type}</span>
                    </div>
                    <p className="text-sm text-primary-600 font-medium mb-1">{getCourseName(m.courseId)}</p>
                    <p className="text-sm text-gray-500 line-clamp-2">{m.content}</p>
                  </div>
                </div>
                <div className="flex space-x-2 ml-4">
                  <button onClick={() => handleEdit(m)} className="p-2 bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  </button>
                  <button onClick={() => handleDelete(m.id)} className="p-2 bg-accent-50 text-accent-700 rounded-lg hover:bg-accent-100 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>


        {materials.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            <p className="text-gray-500">Belum ada materi. Klik &quot;+ Tambah Materi&quot; untuk memulai.</p>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl animate-fade-in">
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-xl font-bold text-gray-900">{editingMaterial ? 'Edit Materi' : 'Tambah Materi'}</h2>
                <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-lg"><svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
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
                  <button type="button" onClick={closeModal} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-xl font-semibold transition-colors">Batal</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
