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

export default function TugasSaya() {
    const router = useRouter();
    const [tugas, setTugas] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userRole = Cookies.get('role');
        if (userRole && userRole !== 'petugas') {
            router.push('/dashboard');
            return;
        }

        api.get('/pengaduan')
            .then(res => {
                setTugas(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const tugasAktif = tugas.filter(t => t.status_pengaduan === 'Diproses');
    const tugasMenunggu = tugas.filter(t => t.status_pengaduan === 'Menunggu Verifikasi');
    const tugasSelesai = tugas.filter(t => t.status_pengaduan === 'Selesai');

    const TaskSection = ({ title, icon, items, variant, actionLabel }) => (
        <div className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                {icon} {title}
                <span className={`
          text-sm px-3 py-1 rounded-full
          ${variant === 'warning' ? 'bg-yellow-500/20 text-yellow-300' :
                        variant === 'orange' ? 'bg-orange-500/20 text-orange-300' :
                            'bg-emerald-500/20 text-emerald-300'
                    }
        `}>
                    {items.length}
                </span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {items.map((item, index) => (
                    <Card
                        key={item.id_pengaduan}
                        variant={variant === 'warning' ? 'warning' : variant === 'orange' ? 'default' : 'success'}
                        className={`p-6 group animate-slide-up ${variant === 'selesai' ? 'opacity-75' : ''}`}
                        style={{ animationDelay: `${index * 50}ms` }}
                    >
                        <div className="flex justify-between items-start mb-3">
                            <StatusBadge status={item.status_pengaduan} />
                            <span className="text-xs text-slate-500">
                                {new Date(item.tanggal_lapor).toLocaleDateString('id-ID')}
                            </span>
                        </div>
                        <h3 className={`text-xl font-bold text-white mb-2 ${actionLabel ? 'group-hover:text-yellow-400' : ''} transition line-clamp-1`}>
                            {item.judul_laporan}
                        </h3>
                        <p className="text-slate-400 text-sm mb-4 flex items-center gap-2">
                            <span>📍</span> {item.lokasi}
                        </p>
                        {actionLabel ? (
                            <Link href={`/tiket/${item.id_pengaduan}`}>
                                <Button variant="warning" size="sm" icon="🛠️">{actionLabel}</Button>
                            </Link>
                        ) : (
                            <Link
                                href={`/tiket/${item.id_pengaduan}`}
                                className={`
                  text-sm font-bold uppercase tracking-wide
                  ${variant === 'orange' ? 'text-orange-400 hover:text-orange-300' : 'text-emerald-400 hover:text-emerald-300'}
                `}
                            >
                                Lihat Detail →
                            </Link>
                        )}
                    </Card>
                ))}
            </div>
        </div>
    );

    return (
        <div className="pt-24 md:pt-28 pb-12 container mx-auto px-4 md:px-6 max-w-6xl animate-fade-in">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2 tracking-tight">
                    📋 Tugas Saya
                </h1>
                <p className="text-slate-400">Daftar laporan yang ditugaskan kepada Anda oleh Admin.</p>
            </div>

            {/* Summary Stats */}
            {!loading && tugas.length > 0 && (
                <div className="grid grid-cols-3 gap-3 md:gap-4 mb-8">
                    <div className="bg-yellow-900/20 p-4 rounded-xl border border-yellow-500/30 text-center">
                        <p className="text-2xl md:text-3xl font-bold text-yellow-300">{tugasAktif.length}</p>
                        <p className="text-xs md:text-sm text-yellow-400">Aktif</p>
                    </div>
                    <div className="bg-orange-900/20 p-4 rounded-xl border border-orange-500/30 text-center">
                        <p className="text-2xl md:text-3xl font-bold text-orange-300">{tugasMenunggu.length}</p>
                        <p className="text-xs md:text-sm text-orange-400">Verifikasi</p>
                    </div>
                    <div className="bg-emerald-900/20 p-4 rounded-xl border border-emerald-500/30 text-center">
                        <p className="text-2xl md:text-3xl font-bold text-emerald-300">{tugasSelesai.length}</p>
                        <p className="text-xs md:text-sm text-emerald-400">Selesai</p>
                    </div>
                </div>
            )}

            {/* Content */}
            {loading ? (
                <div className="space-y-8">
                    <div>
                        <div className="h-8 w-40 bg-slate-700 rounded mb-4 animate-pulse"></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <CardSkeleton />
                            <CardSkeleton />
                        </div>
                    </div>
                </div>
            ) : tugas.length === 0 ? (
                <EmptyState
                    icon="📭"
                    title="Belum Ada Tugas"
                    description="Admin belum menugaskan laporan kepada Anda. Tunggu notifikasi tugas baru."
                />
            ) : (
                <div className="space-y-2">
                    {tugasAktif.length > 0 && (
                        <TaskSection
                            title="Tugas Aktif"
                            icon="🔧"
                            items={tugasAktif}
                            variant="warning"
                            actionLabel="Kerjakan"
                        />
                    )}

                    {tugasMenunggu.length > 0 && (
                        <TaskSection
                            title="Menunggu Verifikasi"
                            icon="⏳"
                            items={tugasMenunggu}
                            variant="orange"
                        />
                    )}

                    {tugasSelesai.length > 0 && (
                        <TaskSection
                            title="Selesai"
                            icon="✅"
                            items={tugasSelesai}
                            variant="selesai"
                        />
                    )}
                </div>
            )}
        </div>
    );
}
