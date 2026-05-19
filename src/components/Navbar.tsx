'use client';

import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (!user) return null;

  const getDashboardLink = () => {
    switch (user.role) {
      case 'admin':
        return '/admin';
      case 'guru':
        return '/guru';
      case 'siswa':
        return '/siswa';
    }
  };

  const getNavLinks = () => {
    switch (user.role) {
      case 'admin':
        return [
          { href: '/admin', label: 'Dashboard' },
          { href: '/admin/users', label: 'Kelola Pengguna' },
          { href: '/admin/courses', label: 'Kelola Kursus' },
          { href: '/admin/materials', label: 'Kelola Materi' },
        ];
      case 'guru':
        return [
          { href: '/guru', label: 'Dashboard' },
          { href: '/guru/courses', label: 'Kursus Saya' },
          { href: '/guru/materials', label: 'Materi' },
          { href: '/guru/students', label: 'Siswa' },
        ];
      case 'siswa':
        return [
          { href: '/siswa', label: 'Dashboard' },
          { href: '/siswa/courses', label: 'Kursus' },
          { href: '/siswa/materials', label: 'Materi Saya' },
        ];
    }
  };

  const getRoleBadgeColor = () => {
    switch (user.role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'guru':
        return 'bg-blue-100 text-blue-800';
      case 'siswa':
        return 'bg-green-100 text-green-800';
    }
  };

  return (
    <nav className="bg-white shadow-md border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href={getDashboardLink()} className="text-xl font-bold text-indigo-600">
              SD Kartika LMS
            </Link>
            <div className="hidden md:flex space-x-4">
              {getNavLinks().map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor()}`}>
              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            </span>
            <span className="text-sm text-gray-700">{user.name}</span>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
      {/* Mobile menu */}
      <div className="md:hidden border-t">
        <div className="px-2 pt-2 pb-3 space-y-1">
          {getNavLinks().map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-gray-700 hover:text-indigo-600 block px-3 py-2 rounded-md text-sm font-medium"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
