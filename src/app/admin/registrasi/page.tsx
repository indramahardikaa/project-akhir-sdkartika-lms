'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { getUsers, createUser, deleteUser, getKelas } from '@/lib/data';
import { User, Kelas } from '@/types';

export default function DataSiswaPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [kelasList, setKelasList] = useState<Kelas[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', kelas: '1A', nisn: '', nis: '' });

  useEffect(() => {
    if (isLoading) return;
    if (!user || user.role !== 'admin') { router.push('/login'); return; }
    setUsers(getUsers().filter(u => u.role === 'siswa'));
    setKelasList(getKelas());
  }, [user, isLoading, router]);

  const handleCreate = () => {
    if (!form.name || !form.email || !form.password) return;
    createUser({ name: form.name, email: form.email, password: form.password, role: 'siswa', kelas: form.kelas, nisn: form.nisn, nis: form.nis });
    setUsers(getUsers().filter(u => u.role === 'siswa'));
    setForm({ name: '', email: '', password: '', kelas: '1A', nisn: '', nis: '' });
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Hapus siswa ini?')) { deleteUser(id); setUsers(getUsers().filter(u => u.role === 'siswa')); }
  };

  if (isLoading || !user) return null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Data Siswa</h2>
          <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium">
            + Tambah Siswa
          </button>
        </div>


        {showForm && (
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <h3 className="font-bold text-gray-800 mb-4">Tambah Siswa Baru</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input placeholder="Nama" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="border rounded-lg px-3 py-2 text-sm" />
              <input placeholder="Email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="border rounded-lg px-3 py-2 text-sm" />
              <input placeholder="Password" type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="border rounded-lg px-3 py-2 text-sm" />
              <select value={form.kelas} onChange={e => setForm({...form, kelas: e.target.value})} className="border rounded-lg px-3 py-2 text-sm">
                {kelasList.map(k => <option key={k.id} value={k.name}>{k.name}</option>)}
              </select>
              <input placeholder="NISN" value={form.nisn} onChange={e => setForm({...form, nisn: e.target.value})} className="border rounded-lg px-3 py-2 text-sm" />
              <input placeholder="NIS" value={form.nis} onChange={e => setForm({...form, nis: e.target.value})} className="border rounded-lg px-3 py-2 text-sm" />
            </div>
            <button onClick={handleCreate} className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm">Simpan</button>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-primary-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-primary-800">Nama</th>
                  <th className="px-4 py-3 text-left font-medium text-primary-800">Email</th>
                  <th className="px-4 py-3 text-left font-medium text-primary-800">Kelas</th>
                  <th className="px-4 py-3 text-left font-medium text-primary-800">NISN</th>
                  <th className="px-4 py-3 text-left font-medium text-primary-800">NIS</th>
                  <th className="px-4 py-3 text-left font-medium text-primary-800">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">{u.name}</td>
                    <td className="px-4 py-3 text-gray-600">{u.email}</td>
                    <td className="px-4 py-3"><span className="px-2 py-1 rounded text-xs font-medium bg-primary-100 text-primary-700">{u.kelas || '-'}</span></td>
                    <td className="px-4 py-3 text-gray-600">{u.nisn || '-'}</td>
                    <td className="px-4 py-3 text-gray-600">{u.nis || '-'}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleDelete(u.id)} className="text-accent-600 hover:text-accent-800 text-xs font-medium">Hapus</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
