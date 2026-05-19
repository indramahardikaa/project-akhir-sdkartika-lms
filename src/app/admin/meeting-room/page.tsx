'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { getMeetingRooms, deleteMeetingRoom } from '@/lib/data';
import { MeetingRoom } from '@/types';

export default function AdminMeetingRoomPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [rooms, setRooms] = useState<MeetingRoom[]>([]);

  useEffect(() => {
    if (isLoading) return;
    if (!user || user.role !== 'admin') { router.push('/login'); return; }
    setRooms(getMeetingRooms());
  }, [user, isLoading, router]);

  const handleDelete = (id: string) => {
    if (confirm('Hapus meeting room ini?')) { deleteMeetingRoom(id); setRooms(getMeetingRooms()); }
  };

  if (isLoading || !user) return null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">Meeting Room</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rooms.map(r => (
            <div key={r.id} className="bg-white rounded-xl p-5 shadow-sm border hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-gray-800">{r.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{r.description}</p>
                  <p className="text-xs text-gray-400 mt-2">Host: {r.hostName}</p>
                  <p className="text-xs text-gray-400">Jadwal: {new Date(r.scheduledAt).toLocaleString('id-ID')}</p>
                </div>
                <button onClick={() => handleDelete(r.id)} className="text-accent-600 hover:text-accent-800 text-xs">Hapus</button>
              </div>
              <a href={r.meetingUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block px-3 py-1.5 bg-primary-100 text-primary-700 rounded-lg text-xs font-medium hover:bg-primary-200">
                Buka Meeting
              </a>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
