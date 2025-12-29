'use client';
import api from '@/utils/api';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import Cookies from 'js-cookie';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { StatsSkeleton, CardSkeleton } from '@/components/ui/Loading';
import EmptyState from '@/components/ui/EmptyState';

const MapComponent = dynamic(() => import('@/components/Map'), { ssr: false });

export default function Dashboard() {
  const [role, setRole] = useState('');
  const [userName, setUserName] = useState('');
  const [stats, setStats] = useState({ total_laporan: 0, pending: 0, diproses: 0, menunggu_verifikasi: 0, selesai: 0 });
  const [mapData, setMapData] = useState([]);
  const [filterStatus, setFilterStatus] = useState('semua');
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(() => {
    // Re-read user role from cookies/localStorage to ensure fresh data
    const userRole = Cookies.get('role');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setRole(userRole || user.role || '');
    setUserName(user.nama_lengkap || '');
    setLoading(true);

    Promise.all([
      api.get('/dashboard/map-data').catch(() => ({ data: [] })),
      api.get('/dashboard/stats').catch(() => ({ data: {} }))
    ]).then(([mapRes, statsRes]) => {
      setMapData(mapRes.data);
      setStats(statsRes.data);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredMapData = filterStatus === 'semua'
    ? mapData
    : mapData.filter(item => item.status_pengaduan === filterStatus);

  const filterButtons = [
    { key: 'semua', label: 'Semua', icon: '📍' },
    { key: 'Pending', label: 'Pending', icon: '🔴' },
    { key: 'Diproses', label: 'Diproses', icon: '🟡' },
    { key: 'Selesai', label: 'Selesai', icon: '🟢' },
  ];

  // ==========================
  // WARGA DASHBOARD
  // ==========================
  if (role === 'warga') {
    return (
      <div className="pt-24 md:pt-28 pb-12 w-full px-4 md:px-8 max-w-[1920px] mx-auto min-h-screen flex flex-col animate-fade-in">
        {/* Header */}
        <div className="mb-6">
          <p className="text-blue-400 font-medium mb-1">Selamat datang, {userName} 👋</p>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2 tracking-tight">
            🏠 Dashboard Warga
          </h1>
          <p className="text-slate-400">Pantau kondisi lingkungan sekitar Anda melalui peta interaktif.</p>
        </div>

        {/* Filter Status */}
        <div className="flex flex-wrap gap-2 md:gap-3 mb-6">
          {filterButtons.map(btn => (
            <button
              key={btn.key}
              onClick={() => setFilterStatus(btn.key)}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all duration-200 flex items-center gap-2 ${filterStatus === btn.key
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:scale-105'
                }`}
            >
              <span>{btn.icon}</span>
              <span className="hidden sm:inline">{btn.label}</span>
            </button>
          ))}
        </div>

        {/* Map */}
        <div className="flex-1 glass-card p-3 rounded-3xl shadow-2xl relative min-h-[400px] md:min-h-[500px]">
          <div className="absolute top-4 left-4 z-10 bg-slate-900/90 px-4 py-2 rounded-lg border border-slate-700 shadow-xl">
            <span className="text-blue-400 font-bold text-sm">🗺️ PETA INTERAKTIF</span>
          </div>
          {loading ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="animate-pulse text-slate-400">Memuat peta...</div>
            </div>
          ) : (
            <MapComponent data={filteredMapData} />
          )}
        </div>
      </div>
    );
  }

  // ==========================
  // PETUGAS DASHBOARD
  // ==========================
  if (role === 'petugas') {
    return (
      <div className="pt-24 md:pt-28 pb-12 w-full px-4 md:px-8 max-w-[1920px] mx-auto animate-fade-in">
        {/* Header */}
        <div className="mb-8">
          <p className="text-yellow-400 font-medium mb-1">Selamat bekerja, {userName} 💪</p>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2 tracking-tight">
            👷 Dashboard Petugas
          </h1>
          <p className="text-slate-400">Berikut ringkasan tugas Anda hari ini.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
          {loading ? (
            <>
              <StatsSkeleton />
              <StatsSkeleton />
              <StatsSkeleton />
            </>
          ) : (
            <>
              <Card variant="warning" className="p-6">
                <div className="flex items-center gap-4">
                  <div className="bg-yellow-500/20 p-4 rounded-xl">
                    <span className="text-4xl">🔧</span>
                  </div>
                  <div>
                    <h3 className="text-yellow-400 text-sm uppercase font-bold">Tugas Aktif</h3>
                    <p className="text-4xl font-bold text-white">{stats.diproses || 0}</p>
                  </div>
                </div>
              </Card>
              <Card variant="default" className="p-6 border-orange-500/30">
                <div className="flex items-center gap-4">
                  <div className="bg-orange-500/20 p-4 rounded-xl">
                    <span className="text-4xl">⏳</span>
                  </div>
                  <div>
                    <h3 className="text-orange-400 text-sm uppercase font-bold">Menunggu Verifikasi</h3>
                    <p className="text-4xl font-bold text-white">{stats.menunggu_verifikasi || 0}</p>
                  </div>
                </div>
              </Card>
              <Card variant="success" className="p-6">
                <div className="flex items-center gap-4">
                  <div className="bg-emerald-500/20 p-4 rounded-xl">
                    <span className="text-4xl">✅</span>
                  </div>
                  <div>
                    <h3 className="text-emerald-400 text-sm uppercase font-bold">Selesai</h3>
                    <p className="text-4xl font-bold text-white">{stats.selesai || 0}</p>
                  </div>
                </div>
              </Card>
            </>
          )}
        </div>

        {/* Quick Action */}
        <Link href="/tugas-saya">
          <Card variant="primary" className="p-6 md:p-8 group cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-white group-hover:text-blue-400 transition">
                  📋 Lihat Tugas Saya
                </h2>
                <p className="text-slate-400 mt-1">Klik untuk melihat daftar laporan yang ditugaskan kepada Anda.</p>
              </div>
              <svg className="w-8 h-8 text-blue-400 group-hover:translate-x-2 transition hidden md:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
              </svg>
            </div>
          </Card>
        </Link>
      </div>
    );
  }

  // ==========================
  // ADMIN DASHBOARD (Default)
  // ==========================
  return (
    <div className="pt-24 md:pt-28 pb-12 w-full px-4 md:px-8 max-w-[1920px] mx-auto min-h-screen flex flex-col animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-6">
        <div>
          <p className="text-purple-400 font-medium mb-1">Halo Admin, {userName} 🛡️</p>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2 tracking-tight">
            📊 Monitoring Admin
          </h1>
          <p className="text-slate-400">Overview statistik dan visualisasi peta semua laporan.</p>
        </div>
        <Link href="/manajemen">
          <Button variant="secondary" icon="📋" size="lg">Kelola Laporan</Button>
        </Link>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4 mb-6">
        {loading ? (
          <>
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="bg-slate-800/50 p-4 rounded-xl animate-pulse">
                <div className="h-4 bg-slate-700 rounded w-20 mb-2"></div>
                <div className="h-8 bg-slate-700 rounded w-12"></div>
              </div>
            ))}
          </>
        ) : (
          <>
            <div className="bg-slate-800/50 p-4 rounded-xl border border-white/5 hover:border-white/20 transition">
              <h3 className="text-slate-400 text-xs md:text-sm uppercase">Total Laporan</h3>
              <p className="text-2xl md:text-3xl font-bold text-white">{stats.total_laporan || 0}</p>
            </div>
            <div className="bg-red-900/20 p-4 rounded-xl border border-red-500/20 hover:border-red-500/50 transition">
              <h3 className="text-red-400 text-xs md:text-sm uppercase">Pending</h3>
              <p className="text-2xl md:text-3xl font-bold text-red-200">{stats.pending || 0}</p>
            </div>
            <div className="bg-yellow-900/20 p-4 rounded-xl border border-yellow-500/20 hover:border-yellow-500/50 transition">
              <h3 className="text-yellow-400 text-xs md:text-sm uppercase">Diproses</h3>
              <p className="text-2xl md:text-3xl font-bold text-yellow-200">{stats.diproses || 0}</p>
            </div>
            <div className="bg-orange-900/20 p-4 rounded-xl border border-orange-500/20 hover:border-orange-500/50 transition">
              <h3 className="text-orange-400 text-xs md:text-sm uppercase">Verifikasi</h3>
              <p className="text-2xl md:text-3xl font-bold text-orange-200">{stats.menunggu_verifikasi || 0}</p>
            </div>
            <div className="bg-emerald-900/20 p-4 rounded-xl border border-emerald-500/20 hover:border-emerald-500/50 transition col-span-2 sm:col-span-1">
              <h3 className="text-emerald-400 text-xs md:text-sm uppercase">Selesai</h3>
              <p className="text-2xl md:text-3xl font-bold text-emerald-200">{stats.selesai || 0}</p>
            </div>
          </>
        )}
      </div>

      {/* Map */}
      <div className="flex-1 glass-card p-3 rounded-3xl shadow-2xl relative min-h-[400px] md:min-h-[500px]">
        <div className="absolute top-4 left-4 z-10 bg-slate-900/90 px-4 py-2 rounded-lg border border-slate-700 shadow-xl">
          <span className="text-blue-400 font-bold text-sm">🗺️ PETA SEMUA LAPORAN</span>
        </div>
        {loading ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="animate-pulse text-slate-400">Memuat peta...</div>
          </div>
        ) : (
          <MapComponent data={mapData} />
        )}
      </div>
    </div>
  );
}
