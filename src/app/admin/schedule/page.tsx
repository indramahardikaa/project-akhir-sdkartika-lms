'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { getSchedules, getSchedulesByType, createSchedule, updateSchedule, deleteSchedule, getCourses, getUsers, getClassRooms } from '@/lib/data';
import { Schedule, Course, User, ClassRoom } from '@/types';

type TabType = 'mengajar' | 'exam';

export default function AdminSchedulePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('mengajar');
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [gurus, setGurus] = useState<User[]>([]);
  const [classRooms, setClassRooms] = useState<ClassRoom[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    courseId: '',
    guruId: '',
    classId: '',
    day: '',
    time: '',
    date: '',
  });

  const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

  useEffect(() => {
    if (isLoading) return;
    if (!user || user.role !== 'admin') { router.push('/login'); return; }
    loadData();
  }, [user, isLoading, router]);

  useEffect(() => {
    setSchedules(getSchedulesByType(activeTab));
  }, [activeTab]);

  const loadData = () => {
    setCourses(getCourses());
    const allUsers = getUsers();
    setGurus(allUsers.filter((u) => u.role === 'guru'));
    setClassRooms(getClassRooms());
    setSchedules(getSchedulesByType(activeTab));
  };

  const resetForm = () => {
    setFormData({ title: '', courseId: '', guruId: '', classId: '', day: '', time: '', date: '' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const guru = gurus.find((g) => g.id === formData.guruId);
    const classRoom = classRooms.find((c) => c.id === formData.classId);

    const scheduleData: Omit<Schedule, 'id' | 'createdAt'> = {
      type: activeTab,
      title: formData.title,
      courseId: formData.courseId || undefined,
      guruId: formData.guruId || undefined,
      guruName: guru?.name || undefined,
      classId: formData.classId || undefined,
      className: classRoom?.name || undefined,
      day: activeTab === 'mengajar' ? formData.day : undefined,
      time: formData.time || undefined,
      date: activeTab === 'exam' ? formData.date : undefined,
    };

    if (editingSchedule) {
      updateSchedule(editingSchedule.id, scheduleData);
    } else {
      createSchedule(scheduleData);
    }

    setShowModal(false);
    setEditingSchedule(null);
    resetForm();
    setSchedules(getSchedulesByType(activeTab));
  };

  const handleEdit = (schedule: Schedule) => {
    setEditingSchedule(schedule);
    setFormData({
      title: schedule.title,
      courseId: schedule.courseId || '',
      guruId: schedule.guruId || '',
      classId: schedule.classId || '',
      day: schedule.day || '',
      time: schedule.time || '',
      date: schedule.date || '',
    });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Hapus jadwal ini?')) {
      deleteSchedule(id);
      setSchedules(getSchedulesByType(activeTab));
    }
  };

  if (isLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div></div>;
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Kelola Jadwal</h1>
            <p className="text-gray-500 text-sm mt-1">Jadwal mengajar guru dan jadwal ujian siswa</p>
          </div>
          <button
            onClick={() => { setEditingSchedule(null); resetForm(); setShowModal(true); }}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            + Tambah Jadwal
          </button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-6 w-fit">
          <button
            onClick={() => setActiveTab('mengajar')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'mengajar' ? 'bg-green-600 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
          >
            Jadwal Mengajar
          </button>
          <button
            onClick={() => setActiveTab('exam')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'exam' ? 'bg-green-600 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
          >
            Jadwal Exam
          </button>
        </div>

        {/* Schedule Table */}
        {schedules.length > 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">No</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Judul</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Guru</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kelas</th>
                    {activeTab === 'mengajar' ? (
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hari</th>
                    ) : (
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                    )}
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Waktu</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {schedules.map((schedule, idx) => (
                    <tr key={schedule.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-500">{idx + 1}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{schedule.title}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{schedule.guruName || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{schedule.className || '-'}</td>
                      {activeTab === 'mengajar' ? (
                        <td className="px-4 py-3 text-sm text-gray-600">
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">{schedule.day || '-'}</span>
                        </td>
                      ) : (
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {schedule.date ? new Date(schedule.date).toLocaleDateString('id-ID') : '-'}
                        </td>
                      )}
                      <td className="px-4 py-3 text-sm text-gray-600">{schedule.time || '-'}</td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex justify-center gap-2">
                          <button onClick={() => handleEdit(schedule)} className="text-blue-600 hover:text-blue-800 text-sm font-medium">Edit</button>
                          <button onClick={() => handleDelete(schedule.id)} className="text-red-600 hover:text-red-800 text-sm font-medium">Hapus</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            <p className="text-gray-500">Belum ada jadwal {activeTab === 'mengajar' ? 'mengajar' : 'exam'}. Klik &quot;+ Tambah Jadwal&quot; untuk memulai.</p>
          </div>
        )}

        {/* Create/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="p-5 border-b">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingSchedule ? 'Edit Jadwal' : `Tambah Jadwal ${activeTab === 'mengajar' ? 'Mengajar' : 'Exam'}`}
                </h2>
              </div>
              <form onSubmit={handleSubmit} className="p-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Judul</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder={activeTab === 'mengajar' ? 'Contoh: Matematika - Kelas 1A' : 'Contoh: UTS Matematika'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mata Pelajaran</label>
                  <select value={formData.courseId} onChange={(e) => setFormData({ ...formData, courseId: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-green-500">
                    <option value="">-- Pilih Mata Pelajaran --</option>
                    {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Guru</label>
                    <select value={formData.guruId} onChange={(e) => setFormData({ ...formData, guruId: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-green-500">
                      <option value="">-- Pilih Guru --</option>
                      {gurus.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kelas</label>
                    <select value={formData.classId} onChange={(e) => setFormData({ ...formData, classId: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-green-500">
                      <option value="">-- Pilih Kelas --</option>
                      {classRooms.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>

                {activeTab === 'mengajar' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hari</label>
                    <select value={formData.day} onChange={(e) => setFormData({ ...formData, day: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-green-500" required>
                      <option value="">-- Pilih Hari --</option>
                      {days.map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Waktu</label>
                  <input
                    type="text"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    placeholder="Contoh: 08:00 - 09:30"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>

                <div className="flex space-x-3 pt-4 border-t">
                  <button type="submit" className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-lg font-medium transition-colors">
                    {editingSchedule ? 'Update' : 'Simpan'}
                  </button>
                  <button type="button" onClick={() => { setShowModal(false); setEditingSchedule(null); resetForm(); }} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2.5 rounded-lg font-medium transition-colors">
                    Batal
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
