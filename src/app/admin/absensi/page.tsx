'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { getKelas, getUsers, getAttendanceByKelasMonth } from '@/lib/data';
import { Kelas, User, Attendance } from '@/types';

export default function AdminAbsensiPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [kelasList, setKelasList] = useState<Kelas[]>([]);
  const [selectedKelas, setSelectedKelas] = useState('');
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [students, setStudents] = useState<User[]>([]);
  const [attendanceData, setAttendanceData] = useState<Attendance[]>([]);

  useEffect(() => {
    if (isLoading) return;
    if (!user || user.role !== 'admin') { router.push('/login'); return; }
    setKelasList(getKelas());
  }, [user, isLoading, router]);

  useEffect(() => {
    if (!selectedKelas) return;
    const kelas = kelasList.find(k => k.id === selectedKelas);
    if (!kelas) return;
    const allUsers = getUsers();
    setStudents(allUsers.filter(u => u.role === 'siswa' && u.kelas === kelas.name));
    setAttendanceData(getAttendanceByKelasMonth(selectedKelas, month, year));
  }, [selectedKelas, month, year, kelasList]);

  const getStatus = (siswaId: string, day: number) => {
    const record = attendanceData.find(a => a.siswaId === siswaId && a.day === day);
    return record?.status || null;
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'hadir': return 'bg-green-500';
      case 'izin': return 'bg-yellow-500';
      case 'sakit': return 'bg-blue-500';
      case 'alpha': return 'bg-red-500';
      default: return 'bg-gray-200';
    }
  };


  const daysInMonth = new Date(year, month, 0).getDate();

  const exportCSV = () => {
    let csv = 'No,Nama Siswa';
    for (let d = 1; d <= daysInMonth; d++) csv += `,${d}`;
    csv += '\n';
    students.forEach((s, i) => {
      csv += `${i + 1},${s.name}`;
      for (let d = 1; d <= daysInMonth; d++) {
        const st = getStatus(s.id, d);
        csv += `,${st ? st.charAt(0).toUpperCase() : '-'}`;
      }
      csv += '\n';
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `absensi_${selectedKelas}_${month}_${year}.csv`;
    a.click();
  };

  if (isLoading || !user) return null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">Data Absensi</h2>
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <select value={selectedKelas} onChange={e => setSelectedKelas(e.target.value)} className="border rounded-lg px-3 py-2 text-sm">
              <option value="">Pilih Kelas</option>
              {kelasList.map(k => <option key={k.id} value={k.id}>{k.name}</option>)}
            </select>
            <select value={month} onChange={e => setMonth(Number(e.target.value))} className="border rounded-lg px-3 py-2 text-sm">
              {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => <option key={m} value={m}>{new Date(2024, m-1).toLocaleString('id-ID', {month:'long'})}</option>)}
            </select>
            <input type="number" value={year} onChange={e => setYear(Number(e.target.value))} className="border rounded-lg px-3 py-2 text-sm" min={2020} max={2030} />
            <button onClick={exportCSV} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium">Export Excel</button>
          </div>


          {selectedKelas && students.length > 0 && (
            <div className="overflow-x-auto">
              <table className="text-xs min-w-full">
                <thead className="bg-primary-50">
                  <tr>
                    <th className="px-2 py-2 text-left font-medium text-primary-800 sticky left-0 bg-primary-50">Nama</th>
                    {Array.from({length: daysInMonth}, (_, i) => (
                      <th key={i} className="px-1 py-2 text-center font-medium text-primary-800 w-6">{i + 1}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {students.map(s => (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="px-2 py-2 whitespace-nowrap sticky left-0 bg-white">{s.name}</td>
                      {Array.from({length: daysInMonth}, (_, i) => (
                        <td key={i} className="px-1 py-2 text-center">
                          <div className={`w-4 h-4 rounded-full mx-auto ${getStatusColor(getStatus(s.id, i + 1))}`} title={getStatus(s.id, i + 1) || 'Belum'}></div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="mt-4 flex items-center space-x-4 text-xs">
            <span className="flex items-center space-x-1"><div className="w-3 h-3 rounded-full bg-green-500"></div><span>Hadir</span></span>
            <span className="flex items-center space-x-1"><div className="w-3 h-3 rounded-full bg-yellow-500"></div><span>Izin</span></span>
            <span className="flex items-center space-x-1"><div className="w-3 h-3 rounded-full bg-blue-500"></div><span>Sakit</span></span>
            <span className="flex items-center space-x-1"><div className="w-3 h-3 rounded-full bg-red-500"></div><span>Alpha</span></span>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
