'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Role } from '@/types';

interface MenuItem {
  label: string;
  path?: string;
  icon: string;
  submenu?: { label: string; path: string }[];
}

function getMenuItems(role: Role): MenuItem[] {
  if (role === 'admin') {
    return [
      { label: 'Dashboard', path: '/admin', icon: 'dashboard' },
      { label: 'Data Siswa', path: '/admin/registrasi', icon: 'users' },
      { label: 'Kelas', path: '/admin/kelas', icon: 'master' },
      { label: 'Mata Pelajaran', path: '/admin/courses', icon: 'elearning' },
      { label: 'Jadwal Mengajar', path: '/admin/jadwal-mengajar', icon: 'exam' },
      { label: 'Materi Pembelajaran', path: '/admin/materials', icon: 'elearning' },
      { label: 'E-Learning', path: '/admin/jadwal-ujian', icon: 'bank' },
      { label: 'Bank Soal', path: '/admin/bank-soal', icon: 'bank' },
      { label: 'Absensi', path: '/admin/absensi', icon: 'attendance' },
      { label: 'Nilai', path: '/admin/nilai', icon: 'grade' },
      { label: 'Cetak', path: '/admin/cetak', icon: 'print' },
      { label: 'Pengumuman', path: '/admin/pengumuman', icon: 'announce' },
      { label: 'Manajemen User', path: '/admin/users', icon: 'settings' },
    ];
  }
  if (role === 'guru') {
    return [
      { label: 'Dashboard', path: '/guru', icon: 'dashboard' },
      { label: 'Materi Pembelajaran', path: '/guru/materials', icon: 'elearning' },
      { label: 'E-Learning', path: '/guru/jadwal-ujian', icon: 'bank' },
      { label: 'Bank Soal', path: '/guru/bank-soal', icon: 'bank' },
      { label: 'Absensi', path: '/guru/absensi', icon: 'attendance' },
      { label: 'Nilai', path: '/guru/nilai', icon: 'grade' },
      { label: 'Forum Tugas', path: '/guru/forum-tugas', icon: 'elearning' },
      { label: 'Pengumuman', path: '/guru/pengumuman', icon: 'announce' },
    ];
  }
  return [
    { label: 'Dashboard', path: '/siswa', icon: 'dashboard' },
    { label: 'Materi Pembelajaran', path: '/siswa/materials', icon: 'elearning' },
    { label: 'E-Learning', path: '/siswa/elearning', icon: 'bank' },
    { label: 'Ujian', path: '/siswa/ujian', icon: 'exam' },
    { label: 'Nilai', path: '/siswa/nilai', icon: 'grade' },
    { label: 'Forum Tugas', path: '/siswa/forum-tugas', icon: 'elearning' },
  ];
}

function getIcon(icon: string) {
  const icons: Record<string, string> = {
    dashboard: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
    master: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
    users: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
    attendance: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
    elearning: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
    bank: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
    exam: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
    grade: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
    print: 'M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z',
    announce: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z',
    settings: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
  };
  return icons[icon] || icons.dashboard;
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);

  if (!user) return null;

  const menuItems = getMenuItems(user.role);

  const toggleSubmenu = (label: string) => {
    setExpandedMenus(prev =>
      prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label]
    );
  };

  const isActive = (path?: string) => path ? pathname === path : false;

  const handleLogout = () => { logout(); router.push('/login'); };
  const handleNavigate = (path: string) => { router.push(path); onClose(); };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden animate-fade-in" onClick={onClose} />
      )}
      <aside className={`fixed top-0 left-0 h-full z-50 w-[270px] transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:z-auto flex flex-col gradient-sidebar shadow-2xl`}>
        {/* Logo Section */}
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <img src="/logo-sekolah.png" alt="Logo SD Kartika X-2" className="w-11 h-11 rounded-xl shadow-lg ring-2 ring-white/20 bg-white p-0.5" />
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-green-900"></div>
            </div>
            <div>
              <h1 className="font-bold text-sm text-white tracking-wide">SD Kartika X-2</h1>
              <p className="text-[11px] text-green-300/80 font-medium">Learning Management System</p>
            </div>
          </div>
        </div>

        {/* User Profile */}
        <div className="px-5 py-4 border-b border-white/10">
          <div className="flex items-center space-x-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors duration-200">
            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-md ring-2 ring-white/20">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user.name}</p>
              <p className="text-[11px] text-green-300/70 capitalize font-medium">{user.role === 'admin' ? 'Administrator' : user.role}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-4 px-3">
          <p className="px-3 text-[10px] font-bold text-green-400/60 uppercase tracking-[0.15em] mb-3">Menu Utama</p>
          <nav className="space-y-0.5">
            {menuItems.map((item, index) => (
              <div key={item.label} className={`animate-slide-in stagger-${Math.min(index + 1, 6)}`} style={{opacity: 0}}>
                {item.submenu ? (
                  <>
                    <button
                      onClick={() => toggleSubmenu(item.label)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all duration-200 group ${
                        item.submenu.some(s => pathname === s.path)
                          ? 'bg-white/15 text-white shadow-sm'
                          : 'text-green-100/80 hover:bg-white/8 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-200 ${
                          item.submenu.some(s => pathname === s.path) ? 'bg-white/20' : 'bg-white/5 group-hover:bg-white/10'
                        }`}>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={getIcon(item.icon)} />
                          </svg>
                        </div>
                        <span className="font-medium">{item.label}</span>
                      </div>
                      <svg className={`w-4 h-4 transition-transform duration-200 ${expandedMenus.includes(item.label) ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                    {expandedMenus.includes(item.label) && (
                      <div className="ml-11 mt-1 space-y-0.5 animate-fade-in-down">
                        {item.submenu.map((sub) => (
                          <button key={sub.path} onClick={() => handleNavigate(sub.path)}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                              pathname === sub.path
                                ? 'bg-white/20 text-white font-semibold pl-4 border-l-2 border-green-400'
                                : 'text-green-200/70 hover:bg-white/8 hover:text-white hover:pl-4'
                            }`}>
                            {sub.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <button onClick={() => handleNavigate(item.path!)}
                    className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 group ${
                      isActive(item.path)
                        ? 'bg-white/15 text-white font-semibold shadow-sm backdrop-blur-sm'
                        : 'text-green-100/80 hover:bg-white/8 hover:text-white'
                    }`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${
                      isActive(item.path)
                        ? 'bg-gradient-to-br from-green-400/30 to-emerald-500/30 shadow-sm'
                        : 'bg-white/5 group-hover:bg-white/10'
                    }`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={getIcon(item.icon)} />
                      </svg>
                    </div>
                    <span className="font-medium">{item.label}</span>
                    {isActive(item.path) && (
                      <div className="ml-auto w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse-glow"></div>
                    )}
                  </button>
                )}
              </div>
            ))}
          </nav>
        </div>

        {/* Logout */}
        <div className="p-4 border-t border-white/10">
          <button onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm text-green-100/80 hover:bg-accent-600/90 hover:text-white transition-all duration-200 group">
            <div className="w-8 h-8 rounded-lg bg-white/5 group-hover:bg-white/20 flex items-center justify-center transition-colors duration-200">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </div>
            <span className="font-medium">Keluar</span>
          </button>
        </div>
      </aside>
    </>
  );
}
