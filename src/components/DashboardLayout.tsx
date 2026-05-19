'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Sidebar from './Sidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }));
      setCurrentDate(now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-primary-200 rounded-full animate-spin border-t-primary-600"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 bg-primary-100 rounded-full"></div>
            </div>
          </div>
          <p className="text-sm text-gray-500 font-medium animate-pulse">Memuat...</p>
        </div>
      </div>
    );
  }

  const handleLogout = () => { logout(); router.push('/login'); };

  const getRoleBadge = () => {
    switch (user.role) {
      case 'admin': return 'bg-accent-50 text-accent-700 border-accent-200';
      case 'guru': return 'bg-primary-50 text-primary-700 border-primary-200';
      case 'siswa': return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-h-screen lg:ml-0">
        {/* Enhanced Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/60 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center justify-between px-4 md:px-6 py-3.5">
            <div className="flex items-center space-x-4">
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2.5 rounded-xl hover:bg-gray-100 active:scale-95 transition-all duration-200">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div className="hidden sm:flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center shadow-sm">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h1 className="text-lg font-bold text-gradient">E-LEARNING SD Kartika X-2</h1>
              </div>
              <h1 className="sm:hidden text-base font-bold text-gradient">SD Kartika X-2</h1>
            </div>

            <div className="flex items-center space-x-3">
              {/* Date & Time badges */}
              <div className="hidden lg:flex items-center space-x-2">
                <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-primary-50 rounded-lg border border-primary-100">
                  <svg className="w-3.5 h-3.5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  <span className="text-xs font-semibold text-primary-700">{currentDate}</span>
                </div>
                <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-accent-50 rounded-lg border border-accent-100">
                  <svg className="w-3.5 h-3.5 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <span className="text-xs font-bold text-accent-700 font-mono">{currentTime}</span>
                </div>
              </div>

              {/* User dropdown */}
              <div className="relative">
                <button onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2.5 p-2 rounded-xl hover:bg-gray-50 transition-all duration-200 border border-transparent hover:border-gray-200">
                  <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md ring-2 ring-primary-100">
                    {user.name.charAt(0)}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-semibold text-gray-800 leading-tight">{user.name}</p>
                    <p className="text-[11px] text-gray-500 capitalize">{user.role}</p>
                  </div>
                  <svg className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-fade-in-down">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-bold text-gray-800">{user.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{user.email}</p>
                      <span className={`inline-block mt-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getRoleBadge()}`}>
                        {user.role}
                      </span>
                    </div>
                    <div className="py-1">
                      <button onClick={handleLogout}
                        className="w-full text-left px-4 py-2.5 text-sm text-accent-600 hover:bg-accent-50 flex items-center space-x-2.5 transition-colors duration-150">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span className="font-medium">Keluar dari Akun</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content with animation */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 animate-fade-in">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-100 bg-white/50 px-6 py-3">
          <p className="text-center text-xs text-gray-400">&copy; 2024 SD Kartika X-2 - Learning Management System</p>
        </footer>
      </div>
    </div>
  );
}
