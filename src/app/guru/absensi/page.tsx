'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { getKelas, getUsers, createAttendance, getAttendanceByKelasMonth } from '@/lib/data';
import { Kelas, User, Attendance } from '@/types';

export default function GuruAbsensiPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [kelasList, setKelasList] = useState<Kelas[]>([]);
  const [selectedKelas, setSelectedKelas] = useState('');
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [students, setStudents] = useState<User[]>([]);
  const [attendance, setAttendance] = useState<Record<string, 'hadir'|'izin'|'sakit'|'alpha'>>({});
  const [saved, setSaved] = useState(false);
  const [tab, setTab] = useState<'isi'|'rekap'>('isi');
  const [rekapData, setRekapData] = useState<Attendance[]>([]);

  useEffect(() => {
    if (isLoading) return;
    if (!user || user.role !== 'guru') { router.push('/login'); return; }
    setKelasList(getKelas());
  }, [user, isLoading, router]);

  useEffect(() => {
    if (!selectedKelas) return;
    const kelas = kelasList.find(k => k.id === selectedKelas);
    if (!kelas) return;
    const allUsers = getUsers();
    const studs = allUsers.filter(u => u.role === 'siswa' && u.kelas === kelas.name);
    setStudents(studs);
    const defaults: Record<string, 'hadir'> = {};
    studs.forEach(s => { defaults[s.id] = 'hadir'; });
    setAttendance(defaults);
    setRekapData(getAttendanceByKelasMonth(selectedKelas, month, year));
  }, [selectedKelas, month, year, kelasList]);

  const handleSave = () => {
    Object.entries(attendance).forEach(([siswaId, status]) => {
      createAttendance({ courseId: '', siswaId, kelasId: selectedKelas, day: selectedDay, month, year, status });
    });
    setSaved(true);
    setRekapData(getAttendanceByKelasMonth(selectedKelas, month, year));
    setTimeout(() => setSaved(false), 2000);
  };


  const daysInMonth = new Date(year, month, 0).getDate();

  const getStatus = (siswaId: string, day: number) => {
    const record = rekapData.find(a => a.siswaId === siswaId && a.day === day);
    return record?.status || null;
  };

  const getStatusColor = (status: string | null) => {
    switch (status) { case 'hadir': return 'bg-green-500'; case 'izin': return 'bg-yellow-500'; case 'sakit': return 'bg-blue-500'; case 'alpha': return 'bg-red-500'; default: return 'bg-gray-200'; }
  };

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
        <h2 className="text-2xl font-bold text-gray-800">Absensi Siswa</h2>
        <div className="flex space-x-2">
          <button onClick={() => setTab('isi')} className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === 'isi' ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700'}`}>Isi Absensi</button>
          <button onClick={() => setTab('rekap')} className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === 'rekap' ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700'}`}>Lihat Rekap</button>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <select value={selectedKelas} onChange={e => setSelectedKelas(e.target.value)} className="border rounded-lg px-3 py-2 text-sm">
              <option value="">Pilih Kelas</option>
              {kelasList.map(k => <option key={k.id} value={k.id}>{k.name}</option>)}
            </select>
            {tab === 'isi' && (
              <input type="number" value={selectedDay} onChange={e => setSelectedDay(Number(e.target.value))} min={1} max={31} className="border rounded-lg px-3 py-2 text-sm" placeholder="Tanggal" />
            )}
            <select value={month} onChange={e => setMonth(Number(e.target.value))} className="border rounded-lg px-3 py-2 text-sm">
              {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => <option key={m} value={m}>{new Date(2024, m-1).toLocaleString('id-ID', {month:'long'})}</option>)}
            </select>
            <input type="number" value={year} onChange={e => setYear(Number(e.target.value))} className="border rounded-lg px-3 py-2 text-sm" min={2020} max={2030} />
          </div>


          {tab === 'isi' && students.length > 0 && (
            <>
              <table className="w-full text-sm">
                <thead className="bg-primary-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-primary-800">Nama Siswa</th>
                    <th className="px-4 py-3 text-left font-medium text-primary-800">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {students.map(s => (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">{s.name}</td>
                      <td className="px-4 py-3">
                        <div className="flex space-x-2">
                          {(['hadir','izin','sakit','alpha'] as const).map(st => (
                            <label key={st} className="flex items-center space-x-1">
                              <input type="radio" name={`att_${s.id}`} checked={attendance[s.id] === st} onChange={() => setAttendance({...attendance, [s.id]: st})} className="text-primary-600" />
                              <span className="text-xs capitalize">{st}</span>
                            </label>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button onClick={handleSave} className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700">Simpan Absensi</button>
              {saved && <span className="ml-3 text-sm text-primary-600 font-medium">Tersimpan!</span>}
            </>
          )}

          {tab === 'rekap' && selectedKelas && students.length > 0 && (
            <>
              <div className="flex justify-end mb-4">
                <button onClick={exportCSV} className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium">Export Excel</button>
              </div>
              <div className="overflow-x-auto">
                <table className="text-xs min-w-full">
                  <thead className="bg-primary-50">
                    <tr>
                      <th className="px-2 py-2 text-left font-medium text-primary-800 sticky left-0 bg-primary-50">Nama</th>
                      {Array.from({length: daysInMonth}, (_, i) => (
                        <th key={i} className="px-1 py-2 text-center font-medium text-primary-800">{i+1}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {students.map(s => (
                      <tr key={s.id}>
                        <td className="px-2 py-2 whitespace-nowrap sticky left-0 bg-white">{s.name}</td>
                        {Array.from({length: daysInMonth}, (_, i) => (
                          <td key={i} className="px-1 py-2 text-center">
                            <div className={`w-4 h-4 rounded-full mx-auto ${getStatusColor(getStatus(s.id, i+1))}`}></div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 flex items-center space-x-4 text-xs">
                <span className="flex items-center space-x-1"><div className="w-3 h-3 rounded-full bg-green-500"></div><span>Hadir</span></span>
                <span className="flex items-center space-x-1"><div className="w-3 h-3 rounded-full bg-yellow-500"></div><span>Izin</span></span>
                <span className="flex items-center space-x-1"><div className="w-3 h-3 rounded-full bg-blue-500"></div><span>Sakit</span></span>
                <span className="flex items-center space-x-1"><div className="w-3 h-3 rounded-full bg-red-500"></div><span>Alpha</span></span>
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
