'use client';
import api from '@/utils/api';
import ImageSlider from '@/components/ImageSlider';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { Skeleton } from '@/components/ui/Loading';

export default function DetailTiket() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [role, setRole] = useState('');
  const [petugasList, setPetugasList] = useState([]);
  const [selectedPetugas, setSelectedPetugas] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [foto, setFoto] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);
  const [catatan, setCatatan] = useState('');
  const [loading, setLoading] = useState(false);
  const [showConfirmAssign, setShowConfirmAssign] = useState(false);
  const [showConfirmVerify, setShowConfirmVerify] = useState(null); // 'approve' | 'reject'
  const toast = useToast();

  useEffect(() => {
    const userRole = JSON.parse(localStorage.getItem('user') || '{}')?.role;
    setRole(userRole);

    api.get(`/pengaduan/${id}`)
      .then(res => setData(res.data))
      .catch(err => {
        console.error(err);
        if (err.response && (err.response.status === 403 || err.response.status === 404)) {
          toast.error(err.response.data.message || 'Akses Ditolak');
          router.push('/dashboard');
        }
      });

    if (userRole === 'admin') {
      api.get('/auth/petugas').then(res => setPetugasList(res.data)).catch(console.error);
    }
  }, [id]);

  // Photo preview
  useEffect(() => {
    if (foto) {
      const url = URL.createObjectURL(foto);
      setFotoPreview(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [foto]);

  // Loading State
  if (!data) {
    return (
      <div className="pt-28 md:pt-32 pb-12 container mx-auto px-4 md:px-6 max-w-6xl">
        <Card className="p-6 md:p-10">
          <div className="flex justify-between mb-8">
            <div className="space-y-3 flex-1">
              <Skeleton variant="title" />
              <Skeleton variant="text" className="w-1/3" />
            </div>
            <Skeleton variant="button" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="col-span-12 lg:col-span-7 space-y-4">
              <Skeleton variant="card" />
              <Skeleton variant="card" className="h-64" />
            </div>
            <div className="col-span-12 lg:col-span-5">
              <Skeleton variant="card" className="h-80" />
            </div>
          </div>
        </Card>
      </div>
    );
  }

  const imgBefore = data.foto_bukti_awal
    ? `/uploads/pengaduan/${data.foto_bukti_awal}`
    : 'https://via.placeholder.com/800x600?text=No+Image';

  const imgAfter = data.foto_bukti_selesai
    ? `/uploads/tindaklanjut/${data.foto_bukti_selesai}`
    : imgBefore;

  const timeline = [
    {
      title: 'Laporan Diterima',
      date: new Date(data.tanggal_lapor).toLocaleString('id-ID'),
      status: 'completed',
      icon: '📝',
      desc: 'Laporan berhasil masuk ke sistem.'
    },
    {
      title: 'Diproses Petugas',
      date: data.status_pengaduan === 'Pending' ? '-' : 'Ditugaskan',
      status: data.status_pengaduan !== 'Pending' ? 'completed' : 'current',
      icon: '👷',
      desc: data.status_pengaduan === 'Pending' ? 'Menunggu admin menunjuk petugas.' : 'Petugas sudah ditugaskan.'
    },
    {
      title: 'Pengerjaan Selesai',
      date: data.tanggal_selesai ? new Date(data.tanggal_selesai).toLocaleString('id-ID') : '-',
      status: data.tanggal_selesai ? 'completed' : (data.status_pengaduan === 'Diproses' ? 'current' : 'waiting'),
      icon: '🛠️',
      desc: data.deskripsi_penanganan || 'Menunggu pengerjaan...'
    },
    {
      title: 'Verifikasi Admin',
      date: data.status_pengaduan === 'Selesai' ? 'Disetujui' : '-',
      status: data.status_pengaduan === 'Selesai' ? 'completed' : (data.status_pengaduan === 'Menunggu Verifikasi' ? 'current' : 'waiting'),
      icon: '✅',
      desc: data.catatan_admin ? `Catatan: ${data.catatan_admin}` : 'Menunggu persetujuan akhir.'
    }
  ];

  // Handlers
  const handleAssign = () => {
    if (!selectedPetugas) {
      toast.warning('Pilih petugas terlebih dahulu!');
      return;
    }
    setLoading(true);
    setShowConfirmAssign(false);
    api.put(`/pengaduan/${id}/assign`, { id_petugas: selectedPetugas })
      .then(() => {
        toast.success('Petugas berhasil ditugaskan!');
        setTimeout(() => window.location.reload(), 1000);
      })
      .catch(err => toast.error(err.response?.data?.message || 'Gagal menugaskan'))
      .finally(() => setLoading(false));
  };

  const handleSubmitPengerjaan = (e) => {
    e.preventDefault();
    if (!foto) {
      toast.warning('Upload foto hasil kerja!');
      return;
    }
    if (!deskripsi.trim()) {
      toast.warning('Isi deskripsi penanganan!');
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.append('id_pengaduan', id);
    formData.append('deskripsi', deskripsi);
    formData.append('foto', foto);

    api.post('/tindak-lanjut', formData)
      .then(() => {
        toast.success('Laporan kerja berhasil dikirim!');
        setTimeout(() => window.location.reload(), 1000);
      })
      .catch(err => toast.error(err.response?.data?.message || 'Gagal mengirim'))
      .finally(() => setLoading(false));
  };

  const handleVerifikasi = (status) => {
    setLoading(true);
    setShowConfirmVerify(null);
    api.put(`/pengaduan/${id}/verify`, { status_akhir: status, catatan_admin: catatan })
      .then(() => {
        toast.success(status === 'Disetujui' ? 'Laporan disetujui! ✅' : 'Laporan dikembalikan untuk revisi');
        setTimeout(() => window.location.reload(), 1000);
      })
      .catch(err => toast.error(err.response?.data?.message || 'Gagal memverifikasi'))
      .finally(() => setLoading(false));
  };

  return (
    <div className="pt-24 md:pt-32 pb-12 container mx-auto px-4 md:px-6 max-w-6xl animate-fade-in">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-slate-400 hover:text-white mb-4 transition group"
      >
        <svg className="w-5 h-5 group-hover:-translate-x-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
        </svg>
        Kembali
      </button>

      <Card className="p-6 md:p-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-4 border-b border-slate-700 pb-6 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-2">{data.judul_laporan}</h1>
            <div className="flex flex-wrap items-center gap-3 text-slate-400 text-sm">
              <span className="flex items-center gap-1">👤 {data.nama_pelapor}</span>
              <span className="hidden sm:block w-1 h-1 bg-slate-500 rounded-full"></span>
              <span className="flex items-center gap-1">📍 {data.lokasi}</span>
            </div>
          </div>
          <div className="flex flex-col items-start md:items-end gap-2">
            <StatusBadge status={data.status_pengaduan} size="md" />
            <span className="text-xs text-slate-500">Tiket ID: #{data.id_pengaduan}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10">
          {/* Left Column */}
          <div className="col-span-12 lg:col-span-7 space-y-6">
            {/* Deskripsi */}
            <div className="bg-slate-800/50 p-5 rounded-2xl border border-slate-700/50">
              <h3 className="font-bold text-blue-400 mb-3 text-sm uppercase tracking-wide">Deskripsi Masalah</h3>
              <p className="text-white leading-relaxed">{data.isi_laporan}</p>
            </div>

            {/* Before-After Slider */}
            {(data.status_pengaduan === 'Menunggu Verifikasi' || data.status_pengaduan === 'Selesai') && (
              <div>
                <h3 className="font-bold text-center mb-4 text-blue-400 text-sm uppercase tracking-widest">
                  📷 Bukti Lapangan (Geser Slider)
                </h3>
                <ImageSlider before={imgBefore} after={imgAfter} />
              </div>
            )}

            {/* Foto Awal Only */}
            {data.status_pengaduan !== 'Menunggu Verifikasi' && data.status_pengaduan !== 'Selesai' && data.foto_bukti_awal && (
              <div>
                <h3 className="font-bold text-blue-400 mb-3 text-sm uppercase tracking-wide">📷 Foto Kondisi Awal</h3>
                <img src={imgBefore} alt="Foto Kondisi Awal" className="rounded-2xl w-full object-cover max-h-[400px] border border-slate-700" />
              </div>
            )}

            {/* Action Forms */}
            <div className="border-t border-slate-700 pt-6">
              {/* ADMIN: Assign Petugas */}
              {role === 'admin' && data.status_pengaduan === 'Pending' && (
                <Card variant="primary" className="p-6">
                  <h4 className="text-white font-bold mb-4">Tunjuk Petugas</h4>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <select
                      className="bg-slate-800 text-white p-3 rounded-xl flex-1 border border-slate-600 focus:border-blue-500 focus:outline-none transition"
                      value={selectedPetugas}
                      onChange={(e) => setSelectedPetugas(e.target.value)}
                    >
                      <option value="">-- Pilih Petugas --</option>
                      {petugasList.map(p => (
                        <option key={p.id_user} value={p.id_user}>{p.nama_lengkap}</option>
                      ))}
                    </select>
                    <Button onClick={() => setShowConfirmAssign(true)} loading={loading} disabled={!selectedPetugas}>
                      Tugaskan
                    </Button>
                  </div>
                </Card>
              )}

              {/* PETUGAS: Submit Work */}
              {role === 'petugas' && data.status_pengaduan === 'Diproses' && (
                <form onSubmit={handleSubmitPengerjaan}>
                  <Card variant="warning" className="p-6">
                    <h4 className="text-white font-bold mb-4 flex items-center gap-2">🛠️ Tindakan Petugas: Lapor Pengerjaan</h4>
                    <textarea
                      className="w-full bg-slate-800 text-white p-4 rounded-xl border border-slate-600 focus:border-yellow-500 focus:outline-none transition mb-4"
                      placeholder="Deskripsi penanganan yang sudah dilakukan..."
                      value={deskripsi}
                      onChange={(e) => setDeskripsi(e.target.value)}
                      rows={4}
                      required
                    />
                    <div className="mb-4">
                      <label className="block text-sm text-slate-400 mb-2">Upload Foto Kondisi Akhir:</label>
                      <div className="border-2 border-dashed border-slate-600 rounded-xl p-4 text-center hover:border-yellow-500 transition cursor-pointer relative">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setFoto(e.target.files[0])}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          required
                        />
                        {fotoPreview ? (
                          <div>
                            <img src={fotoPreview} alt="Preview" className="max-h-32 mx-auto rounded-lg mb-2" />
                            <p className="text-emerald-400 text-sm">✓ {foto.name}</p>
                          </div>
                        ) : (
                          <div className="py-4">
                            <span className="text-3xl">📸</span>
                            <p className="text-slate-400 text-sm mt-2">Klik untuk upload foto</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <Button type="submit" variant="warning" loading={loading} className="w-full">
                      Kirim Hasil Kerja
                    </Button>
                  </Card>
                </form>
              )}

              {/* ADMIN: Verify */}
              {role === 'admin' && data.status_pengaduan === 'Menunggu Verifikasi' && (
                <Card variant="success" className="p-6">
                  <h4 className="text-white font-bold mb-4 flex items-center gap-2">✅ Tindakan Admin: Verifikasi Hasil</h4>
                  <p className="text-slate-300 text-sm mb-4">Cek foto "Sesudah" di slider di atas. Jika sesuai, setujui laporan.</p>
                  <input
                    type="text"
                    placeholder="Catatan (Opsional)"
                    className="w-full bg-slate-800 text-white p-3 rounded-xl border border-slate-600 focus:border-emerald-500 focus:outline-none transition mb-4"
                    value={catatan}
                    onChange={(e) => setCatatan(e.target.value)}
                  />
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button variant="danger" onClick={() => setShowConfirmVerify('reject')} loading={loading} className="flex-1">
                      Tolak / Revisi
                    </Button>
                    <Button variant="success" onClick={() => setShowConfirmVerify('approve')} loading={loading} className="flex-1">
                      Setujui & Selesai
                    </Button>
                  </div>
                </Card>
              )}

              {/* COMPLETED Message */}
              {data.status_pengaduan === 'Selesai' && (
                <Card variant="success" className="p-6 text-center">
                  <span className="text-4xl block mb-2">🎉</span>
                  <p className="text-emerald-400 font-bold text-lg">Laporan Selesai Ditangani!</p>
                  {data.catatan_admin && (
                    <p className="text-slate-400 text-sm mt-2">Catatan Admin: {data.catatan_admin}</p>
                  )}
                </Card>
              )}

              {/* PETUGAS: Waiting Verification */}
              {role === 'petugas' && data.status_pengaduan === 'Menunggu Verifikasi' && (
                <Card className="p-6 text-center border-orange-500/30">
                  <span className="text-4xl block mb-2">⏳</span>
                  <p className="text-orange-400 font-bold">Menunggu Verifikasi Admin</p>
                  <p className="text-slate-400 text-sm mt-2">Hasil kerja Anda sudah dikirim dan sedang ditinjau.</p>
                </Card>
              )}
            </div>
          </div>

          {/* Right Column: Timeline */}
          <div className="col-span-12 lg:col-span-5">
            <Card className="p-6 md:p-8 h-full">
              <h3 className="text-xl font-bold text-white mb-6 border-b border-white/10 pb-4">📊 Tracking Status</h3>
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-600 before:to-transparent">
                {timeline.map((item, index) => (
                  <div key={index} className="relative flex items-start group">
                    <div className={`
                      absolute left-0 h-10 w-10 flex items-center justify-center rounded-full border-4 shadow-lg transition-all z-10
                      ${item.status === 'completed' ? 'bg-emerald-500 border-emerald-900 text-white' :
                        item.status === 'current' ? 'bg-blue-500 border-blue-900 text-white animate-pulse' :
                          'bg-slate-800 border-slate-600 text-slate-500'}
                    `}>
                      {item.icon}
                    </div>
                    <div className="ml-16">
                      <h4 className={`font-bold ${item.status === 'waiting' ? 'text-slate-500' : 'text-white'}`}>
                        {item.title}
                      </h4>
                      <span className="text-xs text-blue-400 font-mono mb-1 block">{item.date}</span>
                      <p className="text-sm text-slate-400 leading-snug">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </Card>

      {/* Confirmation Modals */}
      <Modal.Confirm
        isOpen={showConfirmAssign}
        onClose={() => setShowConfirmAssign(false)}
        onConfirm={handleAssign}
        title="Tunjuk Petugas?"
        message={`Petugas yang dipilih akan menerima tugas untuk menangani laporan ini.`}
        confirmText="Ya, Tunjuk"
        variant="primary"
        loading={loading}
      />

      <Modal.Confirm
        isOpen={showConfirmVerify === 'approve'}
        onClose={() => setShowConfirmVerify(null)}
        onConfirm={() => handleVerifikasi('Disetujui')}
        title="Setujui Laporan?"
        message="Laporan akan ditandai SELESAI dan tidak bisa diubah lagi."
        confirmText="Ya, Setujui"
        variant="success"
        loading={loading}
      />

      <Modal.Confirm
        isOpen={showConfirmVerify === 'reject'}
        onClose={() => setShowConfirmVerify(null)}
        onConfirm={() => handleVerifikasi('Revisi')}
        title="Tolak & Minta Revisi?"
        message="Petugas akan diminta mengerjakan ulang laporan ini."
        confirmText="Ya, Minta Revisi"
        variant="danger"
        loading={loading}
      />
    </div>
  );
}
