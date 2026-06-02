'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (!user) return null;

  const getDashboardLink = () => {
    switch (user.role) {
      case 'admin': return '/admin';
      case 'guru': return '/guru';
      case 'siswa': return '/siswa';
    }
  };

  const getNavLinks = () => {
    switch (user.role) {
      case 'admin':
        return [
          { href: '/admin', label: 'Dashboard' },
          { href: '/admin/students', label: 'Manajemen Kelas' },
          { href: '/admin/courses', label: 'Mata Pelajaran' },
          { href: '/admin/materials', label: 'Materi' },
          { href: '/admin/users', label: 'Pengguna' },
        ];
      case 'guru':
        return [
          { href: '/guru', label: 'Dashboard' },
          { href: '/guru/students', label: 'Kelas & Siswa' },
          { href: '/guru/courses', label: 'Mata Pelajaran' },
          { href: '/guru/materials', label: 'Materi' },
          { href: '/guru/assignments', label: 'Forum Tugas' },
        ];
      case 'siswa':
        return [
          { href: '/siswa', label: 'Dashboard' },
          { href: '/siswa/courses', label: 'Mata Pelajaran' },
          { href: '/siswa/materials', label: 'E-Learning' },
          { href: '/siswa/assignments', label: 'Tugas' },
        ];
    }
  };

  const getRoleBadgeColor = () => {
    switch (user.role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'guru': return 'bg-blue-100 text-blue-800';
      case 'siswa': return 'bg-green-100 text-green-800';
    }
  };

  return (
    <nav className="bg-green-700 shadow-md border-b border-green-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href={getDashboardLink()} className="text-xl font-bold text-white">
              SD Kartika LMS
            </Link>
            <div className="hidden md:flex space-x-1">
              {getNavLinks().map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-green-100 hover:text-white hover:bg-green-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className={`hidden sm:inline-block px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor()}`}>
              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            </span>
            <span className="hidden sm:inline-block text-sm text-green-100">{user.name}</span>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Logout
            </button>
            {/* Mobile hamburger */}
            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 rounded-md hover:bg-green-600">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>
      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-green-600 bg-green-700">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {getNavLinks().map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="text-green-100 hover:text-white hover:bg-green-600 block px-3 py-2 rounded-md text-sm font-medium"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="border-t border-green-600 px-4 py-3">
            <p className="text-sm text-white font-medium">{user.name}</p>
            <p className={`text-xs mt-1 ${getRoleBadgeColor()} inline-block px-2 py-0.5 rounded-full`}>
              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            </p>
          </div>
        </div>
      )}
    </nav>
  );
}
