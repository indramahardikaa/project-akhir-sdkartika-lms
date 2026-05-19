'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { getCoursesByGuru, getMaterialsByCourse, createMaterial, deleteMaterial } from '@/lib/data';
import { Course, Material } from '@/types';

export default function GuruMaterialsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [materials, setMaterials] = useState<Material[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', type: 'text' as 'text'|'video'|'document', url: '' });

  useEffect(() => {
    if (isLoading) return;
    if (!user || user.role !== 'guru') { router.push('/login'); return; }
    setCourses(getCoursesByGuru(user.id));
  }, [user, isLoading, router]);

  useEffect(() => {
    if (selectedCourse) setMaterials(getMaterialsByCourse(selectedCourse));
    else setMaterials([]);
  }, [selectedCourse]);

  const handleCreate = () => {
    if (!form.title || !form.content || !selectedCourse) return;
    createMaterial({ courseId: selectedCourse, title: form.title, content: form.content, type: form.type, url: form.url || undefined });
    setMaterials(getMaterialsByCourse(selectedCourse));
    setForm({ title: '', content: '', type: 'text', url: '' });
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Hapus materi ini?')) { deleteMaterial(id); setMaterials(getMaterialsByCourse(selectedCourse)); }
  };

  if (isLoading || !user) return null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Materi Pembelajaran</h2>
          <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium">+ Tambah Materi</button>
        </div>

        <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)} className="border rounded-lg px-3 py-2 text-sm w-full md:w-64">
          <option value="">Pilih Mata Pelajaran</option>
          {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
        </select>


        {showForm && selectedCourse && (
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <h3 className="font-bold text-gray-800 mb-4">Tambah Materi Baru</h3>
            <div className="space-y-4">
              <input placeholder="Judul Materi" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="border rounded-lg px-3 py-2 text-sm w-full" />
              <textarea placeholder="Konten Materi" value={form.content} onChange={e => setForm({...form, content: e.target.value})} className="border rounded-lg px-3 py-2 text-sm w-full h-32" />
              <select value={form.type} onChange={e => setForm({...form, type: e.target.value as 'text'|'video'|'document'})} className="border rounded-lg px-3 py-2 text-sm">
                <option value="text">Teks</option>
                <option value="video">Video</option>
                <option value="document">Dokumen</option>
              </select>
              {form.type !== 'text' && <input placeholder="URL" value={form.url} onChange={e => setForm({...form, url: e.target.value})} className="border rounded-lg px-3 py-2 text-sm w-full" />}
            </div>
            <button onClick={handleCreate} className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm">Simpan</button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {materials.map(m => (
            <div key={m.id} className="bg-white rounded-xl p-5 shadow-sm border">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-gray-800">{m.title}</h3>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{m.content}</p>
                  <p className="text-xs text-gray-400 mt-2">Tanggal Update: {new Date(m.createdAt).toLocaleDateString('id-ID')}</p>
                  <span className="text-xs px-2 py-1 bg-primary-100 text-primary-700 rounded mt-2 inline-block">{m.type}</span>
                </div>
                <button onClick={() => handleDelete(m.id)} className="text-accent-600 hover:text-accent-800 text-xs">Hapus</button>
              </div>
            </div>
          ))}
        </div>
        {selectedCourse && materials.length === 0 && <p className="text-sm text-gray-500">Belum ada materi untuk mata pelajaran ini.</p>}
      </div>
    </DashboardLayout>
  );
}
