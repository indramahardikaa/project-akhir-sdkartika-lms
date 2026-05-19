'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { getUsers } from '@/lib/data';
import { User } from '@/types';

export default function GuruStudentsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [students, setStudents] = useState<User[]>([]);

  useEffect(() => {
    if (isLoading) return;
    if (!user || user.role !== 'guru') { router.push('/login'); return; }
    setStudents(getUsers().filter(u => u.role === 'siswa'));
  }, [user, isLoading, router]);

  if (isLoading || !user) return null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">Daftar Siswa</h2>
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-primary-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-primary-800">Nama</th>
                <th className="px-4 py-3 text-left font-medium text-primary-800">Email</th>
                <th className="px-4 py-3 text-left font-medium text-primary-800">Terdaftar</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {students.map(s => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{s.name}</td>
                  <td className="px-4 py-3 text-gray-600">{s.email}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{new Date(s.createdAt).toLocaleDateString('id-ID')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
