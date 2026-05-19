'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { getBankSoal, getCoursesByGuru, createBankSoal, deleteBankSoal } from '@/lib/data';
import { BankSoal } from '@/types';

export default function GuruBankSoalPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [soal, setSoal] = useState<BankSoal[]>([]);
  const [courses, setCourses] = useState<{ id: string; title: string }[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ question: '', options: ['', '', '', ''], correctAnswer: 0, courseId: '', category: '', difficulty: 'mudah' as 'mudah' | 'sedang' | 'sulit' });

  useEffect(() => {
    if (isLoading) return;
    if (!user || user.role !== 'guru') { router.push('/login'); return; }
    loadData();
  }, [user, isLoading, router]);

  const loadData = () => {
    if (!user) return;
    const c = getCoursesByGuru(user.id);
    setCourses(c.map(x => ({ id: x.id, title: x.title })));
    const courseIds = c.map(x => x.id);
    setSoal(getBankSoal().filter(b => courseIds.includes(b.courseId)));
  };

  const handleCreate = () => {
    if (!form.question || !form.courseId) return;
    createBankSoal({ question: form.question, options: form.options, correctAnswer: form.correctAnswer, courseId: form.courseId, category: form.category, difficulty: form.difficulty });
    loadData();
    setForm({ question: '', options: ['', '', '', ''], correctAnswer: 0, courseId: '', category: '', difficulty: 'mudah' });
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Hapus soal?')) { deleteBankSoal(id); loadData(); }
  };

  if (isLoading || !user) return null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Bank Soal</h2>
          <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium">+ Tambah Soal</button>
        </div>
        {showForm && (
          <div className="bg-white rounded-xl p-6 shadow-sm border space-y-4">
            <textarea placeholder="Pertanyaan" value={form.question} onChange={e => setForm({...form, question: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" />
            <div className="grid grid-cols-2 gap-2">
              {form.options.map((o, i) => (
                <input key={i} placeholder={`Opsi ${i+1}`} value={o} onChange={e => { const opts = [...form.options]; opts[i] = e.target.value; setForm({...form, options: opts}); }} className="border rounded-lg px-3 py-2 text-sm" />
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <select value={form.correctAnswer} onChange={e => setForm({...form, correctAnswer: parseInt(e.target.value)})} className="border rounded-lg px-3 py-2 text-sm">
                <option value={0}>Jawaban: Opsi 1</option>
                <option value={1}>Jawaban: Opsi 2</option>
                <option value={2}>Jawaban: Opsi 3</option>
                <option value={3}>Jawaban: Opsi 4</option>
              </select>
              <select value={form.courseId} onChange={e => setForm({...form, courseId: e.target.value})} className="border rounded-lg px-3 py-2 text-sm">
                <option value="">Pilih Kursus</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
              <input placeholder="Kategori" value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="border rounded-lg px-3 py-2 text-sm" />
              <select value={form.difficulty} onChange={e => setForm({...form, difficulty: e.target.value as 'mudah' | 'sedang' | 'sulit'})} className="border rounded-lg px-3 py-2 text-sm">
                <option value="mudah">Mudah</option>
                <option value="sedang">Sedang</option>
                <option value="sulit">Sulit</option>
              </select>
            </div>
            <button onClick={handleCreate} className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm">Simpan</button>
          </div>
        )}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-primary-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-primary-800">Pertanyaan</th>
                <th className="px-4 py-3 text-left font-medium text-primary-800">Kategori</th>
                <th className="px-4 py-3 text-left font-medium text-primary-800">Kesulitan</th>
                <th className="px-4 py-3 text-left font-medium text-primary-800">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {soal.map(s => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 max-w-xs truncate">{s.question}</td>
                  <td className="px-4 py-3 text-gray-600">{s.category}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-1 rounded text-xs font-medium ${s.difficulty === 'mudah' ? 'bg-primary-100 text-primary-700' : s.difficulty === 'sedang' ? 'bg-yellow-100 text-yellow-700' : 'bg-accent-100 text-accent-700'}`}>{s.difficulty}</span></td>
                  <td className="px-4 py-3"><button onClick={() => handleDelete(s.id)} className="text-accent-600 text-xs font-medium">Hapus</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
