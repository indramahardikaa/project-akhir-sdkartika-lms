'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { getMaterials, createMaterial, updateMaterial, deleteMaterial, getCourses } from '@/lib/data';
import { Material, Course } from '@/types';

export default function AdminMaterialsPage() {
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
    if (!user || user.role !== 'admin') { router.push('/login'); return; }
    loadData();
  }, [user, isLoading, router]);

  const loadData = () => {
    setMaterials(getMaterials());
    setCourses(getCourses());
  };

  const resetForm = () => {
    setFormData({ courseId: '', title: '', content: '', type: 'text', url: '', videoUrl: '', fileUrl: '', fileName: '', order: 1 });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingMaterial) { updateMaterial(editingMaterial.id, formData); }
    else { createMaterial(formData); }
    setShowModal(false);
    setEditingMaterial(null);
    resetForm();
    loadData();
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

  const getCourseName = (courseId: string) => courses.find(c => c.id === courseId)?.title || 'Unknown';

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
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div></div>;
  }


  return (
    <DashboardLayout>

      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Kelola Materi</h1>
            <p className="text-gray-600 mt-1">Atur semua materi pembelajaran (teks, video, dokumen, RPP)</p>
          </div>
          <button
            onClick={() => { setEditingMaterial(null); resetForm(); setShowModal(true); }}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            + Tambah Materi
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Judul</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kursus</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipe</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Urutan</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {materials.map((m) => (
                <tr key={m.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{m.title}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{getCourseName(m.courseId)}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">{getTypeLabel(m.type)}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{m.order}</td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button onClick={() => handleEdit(m)} className="text-green-600 hover:text-green-900 text-sm">Edit</button>
                    <button onClick={() => handleDelete(m.id)} className="text-red-600 hover:text-red-900 text-sm">Hapus</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>


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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Judul</label>
                  <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipe</label>
                  <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value as 'text' | 'video' | 'document' | 'rpp' })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900">
                    <option value="text">Teks</option>
                    <option value="video">Video Pembelajaran</option>
                    <option value="document">File Materi / Dokumen</option>
                    <option value="rpp">RPP</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Urutan</label>
                  <input type="number" min={1} value={formData.order} onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Konten</label>
                  <textarea value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900" rows={4} required />
                </div>
                {formData.type === 'video' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">URL Video</label>
                    <input type="url" value={formData.videoUrl} onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900" placeholder="https://youtube.com/watch?v=..." />
                  </div>
                )}
                {(formData.type === 'document' || formData.type === 'rpp') && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">URL File</label>
                      <input type="url" value={formData.fileUrl} onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900" placeholder="https://drive.google.com/..." />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nama File</label>
                      <input type="text" value={formData.fileName} onChange={(e) => setFormData({ ...formData, fileName: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900" placeholder="Modul.pdf" />
                    </div>
                  </>
                )}
                <div className="flex space-x-3 pt-4">
                  <button type="submit" className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium">{editingMaterial ? 'Update' : 'Tambah'}</button>
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded-lg font-medium">Batal</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}