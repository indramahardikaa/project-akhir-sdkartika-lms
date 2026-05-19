'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { getKelas, getUsers, getCourses, getAttendanceByKelasMonth, getJadwalPelajaran, getExamResults, getExams } from '@/lib/data';
import { Kelas, User, Course, Attendance, JadwalPelajaran } from '@/types';

export default function CetakPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<'hadir'|'jadwal'|'nilai'>('hadir');
  const [kelasList, setKelasList] = useState<Kelas[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [guruList, setGuruList] = useState<User[]>([]);
  const [selectedKelas, setSelectedKelas] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    if (isLoading) return;
    if (!user || user.role !== 'admin') { router.push('/login'); return; }
    setKelasList(getKelas());
    setCourses(getCourses());
    setGuruList(getUsers().filter(u => u.role === 'guru'));
  }, [user, isLoading, router]);

  const getStudents = () => {
    const kelas = kelasList.find(k => k.id === selectedKelas);
    if (!kelas) return [];
    return getUsers().filter(u => u.role === 'siswa' && u.kelas === kelas.name);
  };

  const getAttendanceGrid = () => {
    if (!selectedKelas) return [];
    return getAttendanceByKelasMonth(selectedKelas, month, year);
  };


  const handlePrint = () => { window.print(); };

  if (isLoading || !user) return null;

  const students = getStudents();
  const attendanceData = getAttendanceGrid();
  const daysInMonth = new Date(year, month, 0).getDate();
  const jadwalAll = getJadwalPelajaran();

  const getStatus = (siswaId: string, day: number) => {
    const record = attendanceData.find((a: Attendance) => a.siswaId === siswaId && a.day === day);
    return record?.status || null;
  };

  const getStudentGrades = () => {
    if (!selectedKelas || !selectedCourse) return [];
    const studs = students;
    const exams = getExams().filter(e => e.courseId === selectedCourse);
    const results = getExamResults();
    return studs.map(s => {
      const studentResults = results.filter(r => r.siswaId === s.id && exams.some(e => e.id === r.examId));
      const avg = studentResults.length > 0 ? Math.round(studentResults.reduce((a, r) => a + r.score, 0) / studentResults.length) : 0;
      return { name: s.name, score: avg, count: studentResults.length };
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">Cetak Laporan</h2>
        <div className="flex space-x-2">
          <button onClick={() => setTab('hadir')} className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === 'hadir' ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700'}`}>Daftar Hadir</button>
          <button onClick={() => setTab('jadwal')} className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === 'jadwal' ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700'}`}>Jadwal Guru</button>
          <button onClick={() => setTab('nilai')} className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === 'nilai' ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700'}`}>Nilai</button>
        </div>


        {tab === 'hadir' && (
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <select value={selectedKelas} onChange={e => setSelectedKelas(e.target.value)} className="border rounded-lg px-3 py-2 text-sm">
                <option value="">Pilih Kelas</option>
                {kelasList.map(k => <option key={k.id} value={k.id}>{k.name}</option>)}
              </select>
              <select value={month} onChange={e => setMonth(Number(e.target.value))} className="border rounded-lg px-3 py-2 text-sm">
                {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => <option key={m} value={m}>{new Date(2024, m-1).toLocaleString('id-ID', {month:'long'})}</option>)}
              </select>
              <input type="number" value={year} onChange={e => setYear(Number(e.target.value))} className="border rounded-lg px-3 py-2 text-sm" min={2020} max={2030} />
              <button onClick={handlePrint} className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium">Cetak</button>
            </div>
            {selectedKelas && students.length > 0 && (
              <div className="overflow-x-auto">
                <table className="text-xs min-w-full border">
                  <thead className="bg-primary-50">
                    <tr>
                      <th className="px-2 py-2 border text-left">No</th>
                      <th className="px-2 py-2 border text-left">Nama</th>
                      {Array.from({length: daysInMonth}, (_, i) => <th key={i} className="px-1 py-2 border text-center">{i+1}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((s, idx) => (
                      <tr key={s.id}>
                        <td className="px-2 py-1 border">{idx+1}</td>
                        <td className="px-2 py-1 border whitespace-nowrap">{s.name}</td>
                        {Array.from({length: daysInMonth}, (_, i) => {
                          const st = getStatus(s.id, i+1);
                          return <td key={i} className="px-1 py-1 border text-center text-xs">{st ? st.charAt(0).toUpperCase() : '-'}</td>;
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}


        {tab === 'jadwal' && (
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex justify-end mb-4">
              <button onClick={handlePrint} className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium">Cetak</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border">
                <thead className="bg-primary-50">
                  <tr>
                    <th className="px-3 py-2 border text-left">Kelas</th>
                    <th className="px-3 py-2 border text-left">Mata Pelajaran</th>
                    <th className="px-3 py-2 border text-left">Guru</th>
                    <th className="px-3 py-2 border text-left">Hari</th>
                    <th className="px-3 py-2 border text-left">Jam</th>
                  </tr>
                </thead>
                <tbody>
                  {jadwalAll.map(j => (
                    <tr key={j.id}>
                      <td className="px-3 py-2 border">{kelasList.find(k => k.id === j.kelasId)?.name || '-'}</td>
                      <td className="px-3 py-2 border">{courses.find(c => c.id === j.courseId)?.title || '-'}</td>
                      <td className="px-3 py-2 border">{guruList.find(g => g.id === j.guruId)?.name || '-'}</td>
                      <td className="px-3 py-2 border">{j.hari}</td>
                      <td className="px-3 py-2 border">{j.jamMulai} - {j.jamSelesai}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'nilai' && (
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <select value={selectedKelas} onChange={e => setSelectedKelas(e.target.value)} className="border rounded-lg px-3 py-2 text-sm">
                <option value="">Pilih Kelas</option>
                {kelasList.map(k => <option key={k.id} value={k.id}>{k.name}</option>)}
              </select>
              <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)} className="border rounded-lg px-3 py-2 text-sm">
                <option value="">Pilih Mata Pelajaran</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
              <button onClick={handlePrint} className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium">Cetak</button>
            </div>
            {selectedKelas && selectedCourse && (
              <table className="w-full text-sm border">
                <thead className="bg-primary-50">
                  <tr>
                    <th className="px-3 py-2 border text-left">No</th>
                    <th className="px-3 py-2 border text-left">Nama Siswa</th>
                    <th className="px-3 py-2 border text-center">Rata-rata Nilai</th>
                  </tr>
                </thead>
                <tbody>
                  {getStudentGrades().map((s, i) => (
                    <tr key={i}>
                      <td className="px-3 py-2 border">{i+1}</td>
                      <td className="px-3 py-2 border">{s.name}</td>
                      <td className="px-3 py-2 border text-center font-medium">{s.score || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
