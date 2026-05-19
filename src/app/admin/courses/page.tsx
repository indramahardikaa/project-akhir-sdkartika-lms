'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { getCourses, createCourse, deleteCourse, getUsers } from '@/lib/data';
import { Course } from '@/types';

export default function AdminCoursesPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', guruId: '', category: '' });
  const [gurus, setGurus] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    if (isLoading) return;
    if (!user || user.role !== 'admin') { router.push('/login'); return; }
    setCourses(getCourses());
    setGurus(getUsers().filter(u => u.role === 'guru').map(u => ({ id: u.id, name: u.name })));
  }, [user, isLoading, router]);

  const handleCreate = () => {
    if (!form.title || !form.guruId) return;
    const guru = gurus.find(g => g.id === form.guruId);
    createCourse({ title: form.title, description: form.description, guruId: form.guruId, guruName: guru?.name || '', category: form.category });
    setCourses(getCourses());
    setForm({ title: '', description: '', guruId: '', category: '' });
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Hapus kursus ini?')) { deleteCourse(id); setCourses(getCourses()); }
  };

  if (isLoading || !user) return null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Kelas / Kursus</h2>
          <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium">+ Tambah</button>
        </div>
        {showForm && (
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input placeholder="Judul Kursus" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="border rounded-lg px-3 py-2 text-sm" />
              <input placeholder="Kategori" value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="border rounded-lg px-3 py-2 text-sm" />
              <select value={form.guruId} onChange={e => setForm({...form, guruId: e.target.value})} className="border rounded-lg px-3 py-2 text-sm">
                <option value="">Pilih Guru</option>
                {gurus.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
              <input placeholder="Deskripsi" value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="border rounded-lg px-3 py-2 text-sm" />
            </div>
            <button onClick={handleCreate} className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm">Simpan</button>
          </div>
        )}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-primary-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-primary-800">Kursus</th>
                <th className="px-4 py-3 text-left font-medium text-primary-800">Kategori</th>
                <th className="px-4 py-3 text-left font-medium text-primary-800">Guru</th>
                <th className="px-4 py-3 text-left font-medium text-primary-800">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {courses.map(c => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{c.title}</td>
                  <td className="px-4 py-3 text-gray-600">{c.category}</td>
                  <td className="px-4 py-3 text-gray-600">{c.guruName}</td>
                  <td className="px-4 py-3"><button onClick={() => handleDelete(c.id)} className="text-accent-600 hover:text-accent-800 text-xs font-medium">Hapus</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
