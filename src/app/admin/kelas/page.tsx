'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { getKelas, getUsers } from '@/lib/data';
import { Kelas, User } from '@/types';

export default function KelasPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [kelasList, setKelasList] = useState<Kelas[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);

  useEffect(() => {
    if (isLoading) return;
    if (!user || user.role !== 'admin') { router.push('/login'); return; }
    setKelasList(getKelas());
    setAllUsers(getUsers());
  }, [user, isLoading, router]);

  const getSiswaCount = (kelasName: string) => {
    return allUsers.filter(u => u.role === 'siswa' && u.kelas === kelasName).length;
  };

  if (isLoading || !user) return null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">Manajemen Kelas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {kelasList.map(k => (
            <div key={k.id} className="bg-white rounded-xl p-5 shadow-sm border hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-primary-800">Kelas {k.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{getSiswaCount(k.name)} siswa</p>
                </div>
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                  <span className="text-primary-700 font-bold text-sm">{k.name}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
