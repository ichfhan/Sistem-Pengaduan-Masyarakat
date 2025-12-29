'use client';
import api from '@/utils/api';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import { TableRowSkeleton } from '@/components/ui/Loading';
import EmptyState from '@/components/ui/EmptyState';

export default function ManajemenLaporan() {
    const router = useRouter();
    const [laporan, setLaporan] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('semua');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const userRole = Cookies.get('role');
        if (userRole && userRole !== 'admin') {
            router.push('/dashboard');
            return;
        }

        api.get('/pengaduan')
            .then(res => {
                setLaporan(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const filters = [
        { key: 'semua', label: 'Semua', icon: '📍' },
        { key: 'Pending', label: 'Pending', icon: '🔴' },
        { key: 'belum_ditugaskan', label: 'Belum Ditugaskan', icon: '⚠️' },
        { key: 'Diproses', label: 'Diproses', icon: '🟡' },
        { key: 'Menunggu Verifikasi', label: 'Verifikasi', icon: '🟠' },
        { key: 'Selesai', label: 'Selesai', icon: '🟢' },
    ];

    const getFilterCount = (key) => {
        if (key === 'semua') return laporan.length;
        if (key === 'belum_ditugaskan') return laporan.filter(l => l.status_pengaduan === 'Pending' && !l.id_petugas).length;
        return laporan.filter(l => l.status_pengaduan === key).length;
    };

    // Filter + Search
    let filteredLaporan = filterStatus === 'semua'
        ? laporan
        : filterStatus === 'belum_ditugaskan'
            ? laporan.filter(item => item.status_pengaduan === 'Pending' && !item.id_petugas)
            : laporan.filter(item => item.status_pengaduan === filterStatus);

    if (searchQuery) {
        filteredLaporan = filteredLaporan.filter(item =>
            item.judul_laporan.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.lokasi.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.nama_pelapor.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }

    return (
        <div className="pt-24 md:pt-28 pb-12 container mx-auto px-4 md:px-6 max-w-7xl animate-fade-in">
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 mb-6">
                <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2 tracking-tight">
                        📋 Manajemen Laporan
                    </h1>
                    <p className="text-slate-400">Kelola semua laporan pengaduan dari warga.</p>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-slate-500 text-sm">Total: {laporan.length} laporan</span>
                </div>
            </div>

            {/* Search */}
            <div className="mb-4">
                <div className="relative max-w-md">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
                    <input
                        type="text"
                        placeholder="Cari judul, lokasi, atau pelapor..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-800/50 border border-slate-600 text-white pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition placeholder-slate-500"
                    />
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2 mb-6 overflow-x-auto pb-2">
                {filters.map(filter => (
                    <button
                        key={filter.key}
                        onClick={() => setFilterStatus(filter.key)}
                        className={`px-3 md:px-4 py-2 rounded-full text-xs md:text-sm font-bold transition-all flex items-center gap-1 md:gap-2 whitespace-nowrap ${filterStatus === filter.key
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                            }`}
                    >
                        <span>{filter.icon}</span>
                        <span className="hidden sm:inline">{filter.label}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${filterStatus === filter.key ? 'bg-blue-500' : 'bg-slate-700'
                            }`}>
                            {getFilterCount(filter.key)}
                        </span>
                    </button>
                ))}
            </div>

            {/* Table */}
            {loading ? (
                <Card className="overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-slate-800/50">
                            <tr>
                                {['Laporan', 'Pelapor', 'Lokasi', 'Status', 'Tanggal', 'Aksi'].map(h => (
                                    <th key={h} className="text-left p-4 text-slate-400 font-bold text-sm uppercase">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            <TableRowSkeleton columns={6} />
                            <TableRowSkeleton columns={6} />
                            <TableRowSkeleton columns={6} />
                            <TableRowSkeleton columns={6} />
                        </tbody>
                    </table>
                </Card>
            ) : filteredLaporan.length === 0 ? (
                <EmptyState
                    icon="📭"
                    title="Tidak Ada Laporan"
                    description={searchQuery
                        ? `Tidak ada laporan yang cocok dengan pencarian "${searchQuery}".`
                        : 'Tidak ada laporan dengan filter yang dipilih.'
                    }
                />
            ) : (
                <>
                    {/* Mobile Cards */}
                    <div className="md:hidden space-y-4">
                        {filteredLaporan.map(item => (
                            <Card key={item.id_pengaduan} className="p-4">
                                <div className="flex justify-between items-start mb-3">
                                    <StatusBadge status={item.status_pengaduan} size="sm" />
                                    <span className="text-xs text-slate-500">#{item.id_pengaduan}</span>
                                </div>
                                <h4 className="font-bold text-white mb-1 line-clamp-1">{item.judul_laporan}</h4>
                                <p className="text-slate-400 text-sm mb-1">👤 {item.nama_pelapor}</p>
                                <p className="text-slate-500 text-xs mb-3">📍 {item.lokasi}</p>
                                <Link href={`/tiket/${item.id_pengaduan}`}>
                                    <Button size="sm" className="w-full">Detail</Button>
                                </Link>
                            </Card>
                        ))}
                    </div>

                    {/* Desktop Table */}
                    <Card className="hidden md:block overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-800/50">
                                    <tr>
                                        <th className="text-left p-4 text-slate-400 font-bold text-sm uppercase">Laporan</th>
                                        <th className="text-left p-4 text-slate-400 font-bold text-sm uppercase">Pelapor</th>
                                        <th className="text-left p-4 text-slate-400 font-bold text-sm uppercase">Lokasi</th>
                                        <th className="text-left p-4 text-slate-400 font-bold text-sm uppercase">Status</th>
                                        <th className="text-left p-4 text-slate-400 font-bold text-sm uppercase">Tanggal</th>
                                        <th className="text-left p-4 text-slate-400 font-bold text-sm uppercase">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700/50">
                                    {filteredLaporan.map(item => (
                                        <tr key={item.id_pengaduan} className="hover:bg-slate-800/30 transition group">
                                            <td className="p-4">
                                                <h4 className="font-bold text-white group-hover:text-blue-400 transition line-clamp-1">
                                                    {item.judul_laporan}
                                                </h4>
                                                <span className="text-xs text-slate-500">ID: #{item.id_pengaduan}</span>
                                            </td>
                                            <td className="p-4 text-slate-300">{item.nama_pelapor}</td>
                                            <td className="p-4 text-slate-400 text-sm max-w-[150px] truncate">{item.lokasi}</td>
                                            <td className="p-4">
                                                <StatusBadge status={item.status_pengaduan} size="sm" />
                                            </td>
                                            <td className="p-4 text-slate-400 text-sm">
                                                {new Date(item.tanggal_lapor).toLocaleDateString('id-ID')}
                                            </td>
                                            <td className="p-4">
                                                <Link href={`/tiket/${item.id_pengaduan}`}>
                                                    <Button size="sm">Detail</Button>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </>
            )}
        </div>
    );
}
