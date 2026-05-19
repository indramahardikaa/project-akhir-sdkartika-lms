'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { getUsers, createUser, deleteUser, updateUser } from '@/lib/data';
import { User } from '@/types';

export default function AdminUsersPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'siswa' as 'admin' | 'guru' | 'siswa' });

  useEffect(() => {
    if (isLoading) return;
    if (!user || user.role !== 'admin') { router.push('/login'); return; }
    setUsers(getUsers());
  }, [user, isLoading, router]);

  const handleCreate = () => {
    if (!form.name || !form.email || !form.password) return;
    createUser({ name: form.name, email: form.email, password: form.password, role: form.role });
    setUsers(getUsers());
    setForm({ name: '', email: '', password: '', role: 'siswa' });
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Hapus user ini?')) { deleteUser(id); setUsers(getUsers()); }
  };

  if (isLoading || !user) return null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Manajemen User</h2>
          <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium">+ Tambah User</button>
        </div>
        {showForm && (
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input placeholder="Nama" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="border rounded-lg px-3 py-2 text-sm" />
              <input placeholder="Email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="border rounded-lg px-3 py-2 text-sm" />
              <input placeholder="Password" type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="border rounded-lg px-3 py-2 text-sm" />
              <select value={form.role} onChange={e => setForm({...form, role: e.target.value as 'admin' | 'guru' | 'siswa'})} className="border rounded-lg px-3 py-2 text-sm">
                <option value="siswa">Siswa</option>
                <option value="guru">Guru</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <button onClick={handleCreate} className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm">Simpan</button>
          </div>
        )}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-primary-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-primary-800">Nama</th>
                <th className="px-4 py-3 text-left font-medium text-primary-800">Email</th>
                <th className="px-4 py-3 text-left font-medium text-primary-800">Role</th>
                <th className="px-4 py-3 text-left font-medium text-primary-800">Terdaftar</th>
                <th className="px-4 py-3 text-left font-medium text-primary-800">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{u.name}</td>
                  <td className="px-4 py-3 text-gray-600">{u.email}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-1 rounded text-xs font-medium ${u.role === 'admin' ? 'bg-accent-100 text-accent-700' : u.role === 'guru' ? 'bg-primary-100 text-primary-700' : 'bg-blue-100 text-blue-700'}`}>{u.role}</span></td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{new Date(u.createdAt).toLocaleDateString('id-ID')}</td>
                  <td className="px-4 py-3">{u.id !== '1' && <button onClick={() => handleDelete(u.id)} className="text-accent-600 hover:text-accent-800 text-xs font-medium">Hapus</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
