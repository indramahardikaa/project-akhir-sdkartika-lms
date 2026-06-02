'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { getAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement } from '@/lib/data';
import { Announcement } from '@/types';

export default function AdminAnnouncementsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Announcement | null>(null);
  const [formData, setFormData] = useState({ title: '', content: '', targetRole: 'all' as string });

  useEffect(() => {
    if (isLoading) return;
    if (!user || user.role !== 'admin') { router.push('/login'); return; }
    loadData();
  }, [user, isLoading, router]);

  const loadData = () => { setAnnouncements(getAnnouncements().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (editing) {
      updateAnnouncement(editing.id, { title: formData.title, content: formData.content, targetRole: formData.targetRole as any });
    } else {
      createAnnouncement({ title: formData.title, content: formData.content, targetRole: formData.targetRole as any, authorId: user.id, authorName: user.name, authorRole: user.role });
    }
    setShowModal(false);
    setEditing(null);
    setFormData({ title: '', content: '', targetRole: 'all' });
    loadData();
  };

  const handleEdit = (a: Announcement) => {
    setEditing(a);
    setFormData({ title: a.title, content: a.content, targetRole: a.targetRole || 'all' });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Hapus pengumuman ini?')) { deleteAnnouncement(id); loadData(); }
  };

  if (isLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div></div>;
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pengumuman</h1>
            <p className="text-gray-500 text-sm mt-1">Buat dan kelola pengumuman untuk guru dan siswa</p>
          </div>
          <button onClick={() => { setEditing(null); setFormData({ title: '', content: '', targetRole: 'all' }); setShowModal(true); }} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            + Buat Pengumuman
          </button>
        </div>

        <div className="space-y-4">
          {announcements.map((a) => (
            <div key={a.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{a.title}</h3>
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">
                      {a.targetRole === 'all' ? 'Semua' : a.targetRole === 'guru' ? 'Guru' : 'Siswa'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{a.content}</p>
                  <p className="text-xs text-gray-400 mt-3">Oleh: {a.authorName} &bull; {new Date(a.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
                <div className="flex gap-2 ml-4">
                  <button onClick={() => handleEdit(a)} className="text-green-600 hover:text-green-800 text-sm font-medium">Edit</button>
                  <button onClick={() => handleDelete(a.id)} className="text-red-600 hover:text-red-800 text-sm font-medium">Hapus</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {announcements.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
            <p className="text-gray-500">Belum ada pengumuman.</p>
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-lg">
              <h2 className="text-xl font-bold text-gray-900 mb-4">{editing ? 'Edit Pengumuman' : 'Buat Pengumuman Baru'}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Judul</label>
                  <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-green-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Isi Pengumuman</label>
                  <textarea value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-green-500" rows={5} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target</label>
                  <select value={formData.targetRole} onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-green-500">
                    <option value="all">Semua (Guru & Siswa)</option>
                    <option value="guru">Guru Saja</option>
                    <option value="siswa">Siswa Saja</option>
                  </select>
                </div>
                <div className="flex space-x-3 pt-4">
                  <button type="submit" className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium">{editing ? 'Update' : 'Publikasikan'}</button>
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
