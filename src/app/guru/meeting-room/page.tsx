'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { getMeetingRooms, createMeetingRoom, deleteMeetingRoom } from '@/lib/data';
import { MeetingRoom } from '@/types';

export default function GuruMeetingRoomPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [rooms, setRooms] = useState<MeetingRoom[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', meetingUrl: '', scheduledAt: '' });

  useEffect(() => {
    if (isLoading) return;
    if (!user || user.role !== 'guru') { router.push('/login'); return; }
    setRooms(getMeetingRooms());
  }, [user, isLoading, router]);

  const handleCreate = () => {
    if (!form.title || !form.meetingUrl || !user) return;
    createMeetingRoom({ title: form.title, description: form.description, hostId: user.id, hostName: user.name, meetingUrl: form.meetingUrl, scheduledAt: form.scheduledAt || new Date().toISOString() });
    setRooms(getMeetingRooms());
    setForm({ title: '', description: '', meetingUrl: '', scheduledAt: '' });
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Hapus meeting?')) { deleteMeetingRoom(id); setRooms(getMeetingRooms()); }
  };

  if (isLoading || !user) return null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Meeting Room</h2>
          <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium">+ Buat Meeting</button>
        </div>
        {showForm && (
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input placeholder="Judul Meeting" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="border rounded-lg px-3 py-2 text-sm" />
              <input placeholder="URL Meeting" value={form.meetingUrl} onChange={e => setForm({...form, meetingUrl: e.target.value})} className="border rounded-lg px-3 py-2 text-sm" />
              <input placeholder="Deskripsi" value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="border rounded-lg px-3 py-2 text-sm" />
              <input type="datetime-local" value={form.scheduledAt} onChange={e => setForm({...form, scheduledAt: e.target.value})} className="border rounded-lg px-3 py-2 text-sm" />
            </div>
            <button onClick={handleCreate} className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm">Simpan</button>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rooms.map(r => (
            <div key={r.id} className="bg-white rounded-xl p-5 shadow-sm border">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-gray-800">{r.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{r.description}</p>
                  <p className="text-xs text-gray-400 mt-2">Host: {r.hostName}</p>
                  <p className="text-xs text-gray-400">Jadwal: {new Date(r.scheduledAt).toLocaleString('id-ID')}</p>
                </div>
                {r.hostId === user?.id && <button onClick={() => handleDelete(r.id)} className="text-accent-600 text-xs">Hapus</button>}
              </div>
              <a href={r.meetingUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block px-3 py-1.5 bg-primary-100 text-primary-700 rounded-lg text-xs font-medium hover:bg-primary-200">Buka Meeting</a>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
