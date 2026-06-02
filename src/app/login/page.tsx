'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const result = login(email, password);
    if (result.success) {
      const storedUser = JSON.parse(localStorage.getItem('lms_current_user') || '{}');
      switch (storedUser.role) {
        case 'admin': router.push('/admin'); break;
        case 'guru': router.push('/guru'); break;
        case 'siswa': router.push('/siswa'); break;
        default: router.push('/');
      }
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-green-100">
          {/* Logo & Title */}
          <div className="text-center mb-8">
            <img src="/logo-kartika.svg" alt="Logo SD Kartika" className="w-24 h-24 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-800">SD Kartika Jaya X-2</h1>
            <p className="text-gray-500 mt-1 text-sm">Sistem Manajemen Pembelajaran</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition text-gray-900 bg-gray-50"
                placeholder="Masukkan email"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition text-gray-900 bg-gray-50 pr-12"
                  placeholder="Masukkan password"
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 shadow-sm"
            >
              Masuk
            </button>
          </form>

          <div className="mt-6 border-t border-gray-100 pt-5">
            <p className="text-xs text-gray-400 text-center mb-3">Akun Demo:</p>
            <div className="space-y-1.5 text-xs text-gray-600">
              <div className="flex justify-between bg-green-50 px-3 py-2 rounded-lg">
                <span className="font-medium text-green-800">Admin:</span>
                <span className="text-gray-600">admin@lms.com / admin123</span>
              </div>
              <div className="flex justify-between bg-green-50 px-3 py-2 rounded-lg">
                <span className="font-medium text-green-800">Guru:</span>
                <span className="text-gray-600">budi@lms.com / guru123</span>
              </div>
              <div className="flex justify-between bg-green-50 px-3 py-2 rounded-lg">
                <span className="font-medium text-green-800">Siswa:</span>
                <span className="text-gray-600">andi@lms.com / siswa123</span>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">&copy; 2024 SD Kartika Jaya X-2. All rights reserved.</p>
      </div>
    </div>
  );
}
