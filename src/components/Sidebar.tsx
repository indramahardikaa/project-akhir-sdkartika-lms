'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (!user) return null;

  const getNavLinks = () => {
    switch (user.role) {
      case 'admin':
        return [
          { href: '/admin', label: 'Dashboard', icon: 'dashboard' },
          { href: '/admin/students', label: 'Manajemen Kelas', icon: 'class' },
          { href: '/admin/courses', label: 'Mata Pelajaran', icon: 'book' },
          { href: '/admin/materials', label: 'Materi Pembelajaran', icon: 'material' },
          { href: '/admin/users', label: 'Pengguna', icon: 'users' },
          { href: '/admin/attendance', label: 'Cetak Absensi', icon: 'attendance' },
          { href: '/admin/grades', label: 'Cetak Nilai', icon: 'grades' },
          { href: '/admin/schedule', label: 'Jadwal', icon: 'schedule' },
          { href: '/admin/announcements', label: 'Pengumuman', icon: 'announcement' },
        ];
      case 'guru':
        return [
          { href: '/guru', label: 'Dashboard', icon: 'dashboard' },
          { href: '/guru/students', label: 'Kelas & Siswa', icon: 'class' },
          { href: '/guru/courses', label: 'Mata Pelajaran', icon: 'book' },
          { href: '/guru/materials', label: 'Materi Pembelajaran', icon: 'material' },
          { href: '/guru/assignments', label: 'Forum Tugas', icon: 'assignment' },
          { href: '/guru/exams', label: 'Kelola Exam', icon: 'exam' },
          { href: '/guru/attendance', label: 'Absensi', icon: 'attendance' },
          { href: '/guru/grades', label: 'Cetak Nilai', icon: 'grades' },
          { href: '/guru/announcements', label: 'Pengumuman', icon: 'announcement' },
        ];
      case 'siswa':
        return [
          { href: '/siswa', label: 'Dashboard', icon: 'dashboard' },
          { href: '/siswa/courses', label: 'Materi Pembelajaran', icon: 'book' },
          { href: '/siswa/materials', label: 'E-Learning', icon: 'elearning' },
          { href: '/siswa/exams', label: 'Exam', icon: 'exam' },
          { href: '/siswa/assignments', label: 'Tugas', icon: 'assignment' },
          { href: '/siswa/announcements', label: 'Pengumuman', icon: 'announcement' },
        ];
    }
  };

  const getIcon = (icon: string) => {
    switch (icon) {
      case 'dashboard':
        return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
      case 'class':
        return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>;
      case 'book':
        return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>;
      case 'material':
        return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
      case 'users':
        return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197" /></svg>;
      case 'assignment':
        return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>;
      case 'attendance':
        return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
      case 'grades':
        return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
      case 'announcement':
        return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>;
      case 'elearning':
        return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
      case 'exam':
        return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>;
      case 'schedule':
        return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
      default:
        return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>;
    }
  };

  const isActive = (href: string) => {
    if (href === '/admin' || href === '/guru' || href === '/siswa') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const getRoleLabel = () => {
    switch (user.role) {
      case 'admin': return 'Administrator';
      case 'guru': return 'Guru';
      case 'siswa': return 'Siswa';
    }
  };

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-green-700 flex items-center justify-between px-4 z-50 shadow-md">
        <div className="flex items-center gap-2">
          <img src="/logo-kartika.svg" alt="Logo" className="w-8 h-8" />
          <span className="text-white font-bold text-sm">SD Kartika X-2</span>
        </div>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 text-white rounded-lg hover:bg-green-600">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mobileOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-green-700 text-white z-50 transform transition-transform duration-300 ease-in-out ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 flex flex-col`}>
        {/* Logo area */}
        <div className="p-5 border-b border-green-600">
          <div className="flex items-center gap-3">
            <img src="/logo-kartika.svg" alt="Logo SD Kartika" className="w-12 h-12" />
            <div>
              <h2 className="font-bold text-sm leading-tight">SD Kartika X-2</h2>
              <p className="text-green-200 text-xs">{getRoleLabel()}</p>
            </div>
          </div>
        </div>

        {/* User info */}
        <div className="px-5 py-3 border-b border-green-600 bg-green-800">
          <div className="flex items-center gap-3">
            <div>
              <p className="text-sm font-medium text-white truncate">{user.name}</p>
              <p className="text-xs text-green-300 truncate">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Menu label */}
        <div className="px-5 pt-4 pb-2">
          <p className="text-xs font-semibold text-green-300 uppercase tracking-wider">Menu Utama</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 overflow-y-auto">
          <ul className="space-y-1">
            {getNavLinks().map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive(link.href)
                      ? 'bg-white text-green-700 shadow-sm'
                      : 'text-green-100 hover:bg-green-600 hover:text-white'
                  }`}
                >
                  {getIcon(link.icon)}
                  <span>{link.label}</span>
                  {isActive(link.href) && (
                    <span className="ml-auto w-2 h-2 bg-green-500 rounded-full"></span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-green-600">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-200 hover:bg-red-600 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
