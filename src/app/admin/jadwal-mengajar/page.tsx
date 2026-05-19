'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { getKelas, getCourses, getUsers, getJadwalPelajaran, createJadwalPelajaran, deleteJadwalPelajaran } from '@/lib/data';
import { Kelas, Course, User, JadwalPelajaran } from '@/types';

const hariList = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'] as const;

export default function JadwalMengajarPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [kelasList, setKelasList] = useState<Kelas[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [guruList, setGuruList] = useState<User[]>([]);
  const [jadwalList, setJadwalList] = useState<JadwalPelajaran[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ kelasId: '', courseId: '', guruId: '', hari: 'Senin' as const, jamMulai: '08:00', jamSelesai: '09:30' });

  useEffect(() => {
    if (isLoading) return;
    if (!user || user.role !== 'admin') { router.push('/login'); return; }
    setKelasList(getKelas());
    setCourses(getCourses());
    setGuruList(getUsers().filter(u => u.role === 'guru'));
    setJadwalList(getJadwalPelajaran());
  }, [user, isLoading, router]);

  const handleCreate = () => {
    if (!form.kelasId || !form.courseId || !form.guruId) return;
    createJadwalPelajaran({ kelasId: form.kelasId, courseId: form.courseId, guruId: form.guruId, hari: form.hari, jamMulai: form.jamMulai, jamSelesai: form.jamSelesai });
    setJadwalList(getJadwalPelajaran());
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Hapus jadwal ini?')) { deleteJadwalPelajaran(id); setJadwalList(getJadwalPelajaran()); }
  };

  const getKelasName = (id: string) => kelasList.find(k => k.id === id)?.name || '-';
  const getCourseName = (id: string) => courses.find(c => c.id === id)?.title || '-';
  const getGuruName = (id: string) => guruList.find(g => g.id === id)?.name || '-';

  if (isLoading || !user) return null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Jadwal Mengajar</h2>
          <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium">+ Tambah Jadwal</button>
        </div>


        {showForm && (
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <h3 className="font-bold text-gray-800 mb-4">Tambah Jadwal</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <select value={form.kelasId} onChange={e => setForm({...form, kelasId: e.target.value})} className="border rounded-lg px-3 py-2 text-sm">
                <option value="">Pilih Kelas</option>
                {kelasList.map(k => <option key={k.id} value={k.id}>{k.name}</option>)}
              </select>
              <select value={form.courseId} onChange={e => setForm({...form, courseId: e.target.value})} className="border rounded-lg px-3 py-2 text-sm">
                <option value="">Pilih Mata Pelajaran</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
              <select value={form.guruId} onChange={e => setForm({...form, guruId: e.target.value})} className="border rounded-lg px-3 py-2 text-sm">
                <option value="">Pilih Guru</option>
                {guruList.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
              <select value={form.hari} onChange={e => setForm({...form, hari: e.target.value as typeof form.hari})} className="border rounded-lg px-3 py-2 text-sm">
                {hariList.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
              <input type="time" value={form.jamMulai} onChange={e => setForm({...form, jamMulai: e.target.value})} className="border rounded-lg px-3 py-2 text-sm" />
              <input type="time" value={form.jamSelesai} onChange={e => setForm({...form, jamSelesai: e.target.value})} className="border rounded-lg px-3 py-2 text-sm" />
            </div>
            <button onClick={handleCreate} className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm">Simpan</button>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-primary-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-primary-800">Kelas</th>
                  <th className="px-4 py-3 text-left font-medium text-primary-800">Mata Pelajaran</th>
                  <th className="px-4 py-3 text-left font-medium text-primary-800">Guru</th>
                  <th className="px-4 py-3 text-left font-medium text-primary-800">Hari</th>
                  <th className="px-4 py-3 text-left font-medium text-primary-800">Jam</th>
                  <th className="px-4 py-3 text-left font-medium text-primary-800">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {jadwalList.map(j => (
                  <tr key={j.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">{getKelasName(j.kelasId)}</td>
                    <td className="px-4 py-3">{getCourseName(j.courseId)}</td>
                    <td className="px-4 py-3">{getGuruName(j.guruId)}</td>
                    <td className="px-4 py-3">{j.hari}</td>
                    <td className="px-4 py-3">{j.jamMulai} - {j.jamSelesai}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleDelete(j.id)} className="text-accent-600 hover:text-accent-800 text-xs font-medium">Hapus</button>
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
