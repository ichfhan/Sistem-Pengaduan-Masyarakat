'use client';
import api from '@/utils/api';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import { CardSkeleton } from '@/components/ui/Loading';
import EmptyState from '@/components/ui/EmptyState';

export default function LaporanSaya() {
    const router = useRouter();
    const [laporan, setLaporan] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('semua');

    useEffect(() => {
        const userRole = Cookies.get('role');
        if (userRole && userRole !== 'warga') {
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
        { key: 'semua', label: 'Semua' },
        { key: 'Pending', label: 'Pending' },
        { key: 'Diproses', label: 'Diproses' },
        { key: 'Selesai', label: 'Selesai' },
    ];

    const filteredLaporan = filter === 'semua'
        ? laporan
        : laporan.filter(l => l.status_pengaduan === filter);

    return (
        <div className="pt-24 md:pt-28 pb-12 container mx-auto px-4 md:px-6 max-w-6xl animate-fade-in">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2 tracking-tight">
                    📋 Laporan Saya
                </h1>
                <p className="text-slate-400">Daftar semua laporan yang telah Anda buat.</p>
            </div>

            {/* Filter */}
            <div className="flex flex-wrap gap-2 mb-6">
                {filters.map(f => (
                    <button
                        key={f.key}
                        onClick={() => setFilter(f.key)}
                        className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${filter === f.key
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                            }`}
                    >
                        {f.label}
                        <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${filter === f.key ? 'bg-blue-500' : 'bg-slate-700'
                            }`}>
                            {f.key === 'semua' ? laporan.length : laporan.filter(l => l.status_pengaduan === f.key).length}
                        </span>
                    </button>
                ))}
            </div>

            {/* Content */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <CardSkeleton />
                    <CardSkeleton />
                    <CardSkeleton />
                    <CardSkeleton />
                </div>
            ) : filteredLaporan.length === 0 ? (
                <EmptyState
                    icon="📭"
                    title={filter === 'semua' ? 'Belum Ada Laporan' : `Tidak Ada Laporan ${filter}`}
                    description={filter === 'semua'
                        ? 'Anda belum membuat laporan pengaduan apapun.'
                        : `Tidak ada laporan dengan status "${filter}".`
                    }
                    actionHref={filter === 'semua' ? '/lapor' : undefined}
                    actionLabel={filter === 'semua' ? 'Buat Laporan Pertama' : undefined}
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    {filteredLaporan.map((item, index) => (
                        <Card
                            key={item.id_pengaduan}
                            className="p-6 group animate-slide-up"
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <StatusBadge status={item.status_pengaduan} />
                                <span className="text-xs text-slate-500">
                                    {new Date(item.tanggal_lapor).toLocaleDateString('id-ID', {
                                        day: 'numeric', month: 'short', year: 'numeric'
                                    })}
                                </span>
                            </div>

                            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition line-clamp-1">
                                {item.judul_laporan}
                            </h3>
                            <p className="text-slate-400 text-sm mb-4 flex items-center gap-2">
                                <span>📍</span> {item.lokasi}
                            </p>

                            <Link
                                href={`/tiket/${item.id_pengaduan}`}
                                className="inline-flex items-center text-sm font-bold text-blue-400 hover:text-blue-300 uppercase tracking-wide group/link"
                            >
                                Lihat Detail
                                <svg className="w-4 h-4 ml-1 group-hover/link:translate-x-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                                </svg>
                            </Link>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
