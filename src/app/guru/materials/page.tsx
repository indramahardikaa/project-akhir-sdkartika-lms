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
    courseId: '', title: '', content: '', type: 'text' as 'text' | 'video' | 'document' | 'rpp',
    url: '', videoUrl: '', fileUrl: '', fileName: '', order: 1
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
    setMaterials(getMaterials().filter(m => courseIds.includes(m.courseId)).sort((a, b) => a.order - b.order));
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = { ...formData };
    if (editingMaterial) { updateMaterial(editingMaterial.id, data); }
    else { createMaterial(data); }
    setShowModal(false);
    setEditingMaterial(null);
    resetForm();
    loadData();
  };

  const resetForm = () => {
    setFormData({ courseId: '', title: '', content: '', type: 'text', url: '', videoUrl: '', fileUrl: '', fileName: '', order: 1 });
  };

  const handleEdit = (m: Material) => {
    setEditingMaterial(m);
    setFormData({
      courseId: m.courseId, title: m.title, content: m.content, type: m.type,
      url: m.url || '', videoUrl: m.videoUrl || '', fileUrl: m.fileUrl || '',
      fileName: m.fileName || '', order: m.order
    });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Hapus materi ini?')) { deleteMaterial(id); loadData(); }
  };

  const getCourseName = (courseId: string) => courses.find(c => c.id === courseId)?.title || '';

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'text': return 'bg-blue-100 text-blue-700';
      case 'video': return 'bg-red-100 text-red-700';
      case 'document': return 'bg-yellow-100 text-yellow-700';
      case 'rpp': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'text': return 'Teks';
      case 'video': return 'Video';
      case 'document': return 'Dokumen';
      case 'rpp': return 'RPP';
      default: return type;
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
            <h1 className="text-3xl font-bold text-gray-900">Materi Pembelajaran</h1>
            <p className="text-gray-600 mt-1">Kelola materi teks, video, dokumen, dan RPP</p>
          </div>
          <button
            onClick={() => { setEditingMaterial(null); resetForm(); setShowModal(true); }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            + Tambah Materi
          </button>
        </div>

        <div className="space-y-4">
          {materials.map((m) => (
            <div key={m.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{m.title}</h3>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getTypeBadge(m.type)}`}>{getTypeLabel(m.type)}</span>
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-xs">Urutan: {m.order}</span>
                  </div>
                  <p className="text-sm text-gray-500 mb-1">Kursus: {getCourseName(m.courseId)}</p>
                  <p className="text-sm text-gray-600 line-clamp-2">{m.content}</p>
                  {m.type === 'video' && m.videoUrl && (
                    <p className="text-xs text-blue-600 mt-1 truncate">Video: {m.videoUrl}</p>
                  )}
                  {(m.type === 'document' || m.type === 'rpp') && m.fileName && (
                    <p className="text-xs text-yellow-700 mt-1">File: {m.fileName}</p>
                  )}
                </div>
                <div className="flex space-x-2 ml-4">
                  <button onClick={() => handleEdit(m)} className="text-blue-600 hover:text-blue-900 text-sm font-medium">Edit</button>
                  <button onClick={() => handleDelete(m.id)} className="text-red-600 hover:text-red-900 text-sm font-medium">Hapus</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {materials.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
            <p className="text-gray-500">Belum ada materi. Klik tombol &quot;+ Tambah Materi&quot; untuk memulai.</p>
          </div>
        )}


        {/* Add/Edit Material Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold text-gray-900 mb-4">{editingMaterial ? 'Edit Materi' : 'Tambah Materi'}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kursus</label>
                  <select value={formData.courseId} onChange={(e) => setFormData({ ...formData, courseId: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900" required>
                    <option value="">Pilih Kursus</option>
                    {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Judul Materi</label>
                  <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipe Materi</label>
                  <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value as 'text' | 'video' | 'document' | 'rpp' })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900">
                    <option value="text">Teks</option>
                    <option value="video">Video Pembelajaran</option>
                    <option value="document">File Materi / Dokumen</option>
                    <option value="rpp">RPP (Rencana Pelaksanaan Pembelajaran)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Urutan Materi</label>
                  <input type="number" min={1} value={formData.order} onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Konten / Deskripsi</label>
                  <textarea value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900" rows={5} required />
                </div>


                {/* Video URL field */}
                {formData.type === 'video' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">URL Video (YouTube/lainnya)</label>
                    <input type="url" value={formData.videoUrl} onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900" placeholder="https://youtube.com/watch?v=..." />
                  </div>
                )}

                {/* File fields for document/rpp */}
                {(formData.type === 'document' || formData.type === 'rpp') && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">URL File (link Google Drive / server)</label>
                      <input type="url" value={formData.fileUrl} onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900" placeholder="https://drive.google.com/..." />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nama File</label>
                      <input type="text" value={formData.fileName} onChange={(e) => setFormData({ ...formData, fileName: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900" placeholder="Modul_Matematika.pdf" />
                    </div>
                  </>
                )}

                <div className="flex space-x-3 pt-4">
                  <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium">{editingMaterial ? 'Update' : 'Tambah'}</button>
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
