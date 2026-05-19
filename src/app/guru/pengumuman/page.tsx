'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { getAnnouncements } from '@/lib/data';
import { Announcement } from '@/types';

export default function GuruPengumumanPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<Announcement[]>([]);

  useEffect(() => {
    if (isLoading) return;
    if (!user || user.role !== 'guru') { router.push('/login'); return; }
    setItems(getAnnouncements().filter(a => a.targetRole === 'all' || a.targetRole === 'guru').reverse());
  }, [user, isLoading, router]);

  if (isLoading || !user) return null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">Pengumuman</h2>
        <div className="space-y-4">
          {items.map(a => (
            <div key={a.id} className="bg-white rounded-xl p-5 shadow-sm border border-l-4 border-l-primary-500">
              <h3 className="font-bold text-gray-800">{a.title}</h3>
              <p className="text-sm text-gray-600 mt-1">{a.content}</p>
              <div className="flex items-center space-x-3 mt-3">
                <span className="text-xs text-gray-400">{new Date(a.createdAt).toLocaleDateString('id-ID')}</span>
                <span className="text-xs text-gray-400">oleh {a.authorName}</span>
              </div>
            </div>
          ))}
          {items.length === 0 && <p className="text-sm text-gray-500">Belum ada pengumuman</p>}
        </div>
      </div>
    </DashboardLayout>
  );
}
