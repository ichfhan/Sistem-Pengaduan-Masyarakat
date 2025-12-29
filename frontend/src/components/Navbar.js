'use client';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import Cookies from 'js-cookie';
import { useState, useEffect } from 'react';
import { RoleBadge } from './ui/Badge';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [role, setRole] = useState('');
  const [userName, setUserName] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Re-read role and user info whenever pathname changes (e.g., after login)
  useEffect(() => {
    const userRole = Cookies.get('role');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setRole(userRole || '');
    setUserName(user.nama_lengkap || '');
  }, [pathname]);

  // Hide navbar on auth pages
  if (pathname === '/login' || pathname === '/register') return null;

  const handleLogout = () => {
    Cookies.remove('token');
    Cookies.remove('role');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const isActive = (path) => pathname === path;

  const NavLink = ({ href, children, highlight = false }) => (
    <Link
      href={href}
      onClick={() => setMobileMenuOpen(false)}
      className={`
        relative px-4 py-2 rounded-lg transition-all duration-200
        ${isActive(href)
          ? 'text-white bg-white/10'
          : 'text-slate-300 hover:text-white hover:bg-white/5'
        }
        ${highlight
          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 hover:scale-105'
          : ''
        }
      `}
    >
      {children}
      {isActive(href) && !highlight && (
        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-0.5 bg-blue-500 rounded-full" />
      )}
    </Link>
  );

  return (
    <>
      <nav className={`
        fixed top-0 w-full z-50 transition-all duration-300
        ${scrolled
          ? 'bg-slate-900/90 backdrop-blur-md shadow-lg py-3'
          : 'bg-transparent py-5'
        }
      `}>
        <div className="container mx-auto px-4 md:px-8 flex justify-between items-center max-w-[1920px]">
          {/* Logo */}
          <Link
            href="/dashboard"
            className="text-xl md:text-2xl font-extrabold tracking-tighter flex items-center gap-2 hover:scale-105 transition-transform text-white"
          >
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-2 rounded-lg shadow-lg">
              👮‍♂️
            </span>
            <span className="hidden sm:inline">Lapor Pak!</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex gap-2 items-center">
            <NavLink href="/dashboard">Dashboard</NavLink>

            {/* Warga Menu */}
            {role === 'warga' && (
              <>
                <NavLink href="/laporan-saya">Laporan Saya</NavLink>
                <NavLink href="/lapor" highlight>+ Buat Laporan</NavLink>
              </>
            )}

            {/* Admin Menu */}
            {role === 'admin' && (
              <NavLink href="/manajemen">Manajemen Laporan</NavLink>
            )}

            {/* Petugas Menu */}
            {role === 'petugas' && (
              <NavLink href="/tugas-saya">Tugas Saya</NavLink>
            )}

            {/* User Info & Logout */}
            <div className="flex items-center gap-3 ml-4 pl-4 border-l border-slate-700">
              <div className="hidden lg:flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                  {userName ? userName.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-white text-sm font-medium">{userName || 'User'}</span>
                  <span className="text-slate-500">•</span>
                  <RoleBadge role={role} size="sm" showIcon={false} />
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="text-red-400 hover:text-red-300 transition text-sm font-semibold border border-red-500/30 px-3 py-1.5 rounded-lg hover:bg-red-500/10"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-white hover:bg-white/10 rounded-lg transition"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="absolute top-[72px] left-0 right-0 bg-slate-900/95 backdrop-blur-md border-t border-slate-700 animate-slide-down">
            <div className="container mx-auto p-4 space-y-2">
              {/* User Info */}
              <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg">
                    {userName ? userName.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="flex flex-col">
                    <p className="text-white font-medium">{userName || 'User'}</p>
                    <RoleBadge role={role} size="sm" />
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-red-400 hover:text-red-300 text-sm font-bold px-3 py-1.5 border border-red-500/30 rounded-lg hover:bg-red-500/10"
                >
                  Logout
                </button>
              </div>

              {/* Nav Links */}
              <NavLink href="/dashboard">🏠 Dashboard</NavLink>

              {role === 'warga' && (
                <>
                  <NavLink href="/laporan-saya">📋 Laporan Saya</NavLink>
                  <NavLink href="/lapor" highlight>+ Buat Laporan</NavLink>
                </>
              )}

              {role === 'admin' && (
                <NavLink href="/manajemen">📊 Manajemen Laporan</NavLink>
              )}

              {role === 'petugas' && (
                <NavLink href="/tugas-saya">🔧 Tugas Saya</NavLink>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}