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
      // Redirect based on role
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8">
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-gray-900"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-gray-900"
              placeholder="Masukkan password"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
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
