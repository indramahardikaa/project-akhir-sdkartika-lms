'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { getAnnouncements, createAnnouncement, deleteAnnouncement } from '@/lib/data';
import { Announcement } from '@/types';

export default function AdminPengumumanPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<Announcement[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', targetRole: 'all' as 'all' | 'guru' | 'siswa' });

  useEffect(() => {
    if (isLoading) return;
    if (!user || user.role !== 'admin') { router.push('/login'); return; }
    setItems(getAnnouncements());
  }, [user, isLoading, router]);

  const handleCreate = () => {
    if (!form.title || !form.content) return;
    createAnnouncement({ title: form.title, content: form.content, targetRole: form.targetRole, authorId: user!.id, authorName: user!.name });
    setItems(getAnnouncements());
    setForm({ title: '', content: '', targetRole: 'all' });
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Hapus pengumuman ini?')) { deleteAnnouncement(id); setItems(getAnnouncements()); }
  };

  if (isLoading || !user) return null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Pengumuman</h2>
          <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium">+ Tambah</button>
        </div>
        {showForm && (
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="space-y-4">
              <input placeholder="Judul" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" />
              <textarea placeholder="Konten" value={form.content} onChange={e => setForm({...form, content: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm h-24" />
              <select value={form.targetRole} onChange={e => setForm({...form, targetRole: e.target.value as 'all' | 'guru' | 'siswa'})} className="border rounded-lg px-3 py-2 text-sm">
                <option value="all">Semua</option>
                <option value="guru">Guru</option>
                <option value="siswa">Siswa</option>
              </select>
              <button onClick={handleCreate} className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm">Simpan</button>
            </div>
          </div>
        )}
        <div className="space-y-4">
          {items.map(a => (
            <div key={a.id} className="bg-white rounded-xl p-5 shadow-sm border border-l-4 border-l-primary-500">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-gray-800">{a.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{a.content}</p>
                  <div className="flex items-center space-x-3 mt-2">
                    <span className="text-xs text-gray-400">{new Date(a.createdAt).toLocaleDateString('id-ID')}</span>
                    <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded">{a.targetRole}</span>
                  </div>
                </div>
                <button onClick={() => handleDelete(a.id)} className="text-accent-600 hover:text-accent-800 text-xs font-medium">Hapus</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
