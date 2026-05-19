'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { getMaterials, getCourses, createMaterial, deleteMaterial } from '@/lib/data';
import { Material } from '@/types';

export default function AdminMaterialsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [materials, setMaterials] = useState<(Material & { courseName: string })[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', courseId: '', type: 'text' as const });
  const [courses, setCoursesList] = useState<{ id: string; title: string }[]>([]);

  useEffect(() => {
    if (isLoading) return;
    if (!user || user.role !== 'admin') { router.push('/login'); return; }
    loadData();
  }, [user, isLoading, router]);

  const loadData = () => {
    const c = getCourses();
    setCoursesList(c.map(x => ({ id: x.id, title: x.title })));
    setMaterials(getMaterials().map(m => ({ ...m, courseName: c.find(x => x.id === m.courseId)?.title || '-' })));
  };

  const handleCreate = () => {
    if (!form.title || !form.courseId) return;
    createMaterial({ title: form.title, content: form.content, courseId: form.courseId, type: form.type });
    loadData();
    setForm({ title: '', content: '', courseId: '', type: 'text' });
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Hapus materi ini?')) { deleteMaterial(id); loadData(); }
  };

  if (isLoading || !user) return null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Materi Pembelajaran</h2>
          <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium">+ Tambah</button>
        </div>
        {showForm && (
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input placeholder="Judul" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="border rounded-lg px-3 py-2 text-sm" />
              <select value={form.courseId} onChange={e => setForm({...form, courseId: e.target.value})} className="border rounded-lg px-3 py-2 text-sm">
                <option value="">Pilih Kursus</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
              <textarea placeholder="Konten" value={form.content} onChange={e => setForm({...form, content: e.target.value})} className="border rounded-lg px-3 py-2 text-sm col-span-2 h-20" />
            </div>
            <button onClick={handleCreate} className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm">Simpan</button>
          </div>
        )}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-primary-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-primary-800">Materi</th>
                <th className="px-4 py-3 text-left font-medium text-primary-800">Kursus</th>
                <th className="px-4 py-3 text-left font-medium text-primary-800">Tipe</th>
                <th className="px-4 py-3 text-left font-medium text-primary-800">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {materials.map(m => (
                <tr key={m.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{m.title}</td>
                  <td className="px-4 py-3 text-gray-600">{m.courseName}</td>
                  <td className="px-4 py-3"><span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">{m.type}</span></td>
                  <td className="px-4 py-3"><button onClick={() => handleDelete(m.id)} className="text-accent-600 hover:text-accent-800 text-xs font-medium">Hapus</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
