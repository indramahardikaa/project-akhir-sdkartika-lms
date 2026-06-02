'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const result = login(email, password);
    if (result.success) {
      const storedUser = JSON.parse(localStorage.getItem('lms_current_user') || '{}');
      switch (storedUser.role) {
        case 'admin':
          router.push('/admin');
          break;
        case 'guru':
          router.push('/guru');
          break;
        case 'siswa':
          router.push('/siswa');
          break;
        default:
          router.push('/');
      }
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 border border-green-100">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800">SD Kartika LMS</h1>
          <p className="text-gray-500 mt-2">Sistem Manajemen Pembelajaran</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition text-gray-900"
              placeholder="Masukkan email"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition text-gray-900"
              placeholder="Masukkan password"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
          >
            Masuk
          </button>
        </form>

        <div className="mt-8 border-t pt-6">
          <p className="text-sm text-gray-500 text-center mb-3">Akun Demo:</p>
          <div className="space-y-2 text-xs text-gray-600">
            <div className="flex justify-between bg-gray-50 px-3 py-2 rounded">
              <span className="font-medium">Admin:</span>
              <span>admin@lms.com / admin123</span>
            </div>
            <div className="flex justify-between bg-gray-50 px-3 py-2 rounded">
              <span className="font-medium">Guru:</span>
              <span>budi@lms.com / guru123</span>
            </div>
            <div className="flex justify-between bg-gray-50 px-3 py-2 rounded">
              <span className="font-medium">Siswa:</span>
              <span>andi@lms.com / siswa123</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
