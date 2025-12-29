'use client';
import api from '@/utils/api';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';

export default function Lapor() {
  const router = useRouter();
  const [form, setForm] = useState({ judul: '', lokasi: '', deskripsi: '' });
  const [errors, setErrors] = useState({});
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [step, setStep] = useState(1);
  const toast = useToast();

  // Protect Page
  useEffect(() => {
    const userRole = Cookies.get('role');
    if (userRole && userRole !== 'warga') {
      toast.error('Hanya Warga yang dapat membuat laporan!');
      router.push('/dashboard');
    }
  }, []);

  // File preview
  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  const validate = () => {
    const newErrors = {};
    if (!form.judul.trim()) newErrors.judul = 'Judul masalah wajib diisi';
    if (!form.lokasi.trim()) newErrors.lokasi = 'Lokasi wajib diisi';
    if (!form.deskripsi.trim()) newErrors.deskripsi = 'Deskripsi wajib diisi';
    if (form.deskripsi.length < 20) newErrors.deskripsi = 'Deskripsi minimal 20 karakter';
    if (!file) newErrors.file = 'Foto bukti wajib diunggah';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1) {
      if (!form.judul.trim() || !form.lokasi.trim()) {
        setErrors({
          judul: !form.judul.trim() ? 'Judul wajib diisi' : '',
          lokasi: !form.lokasi.trim() ? 'Lokasi wajib diisi' : ''
        });
        return;
      }
      setErrors({});
      setStep(2);
    } else if (step === 2) {
      if (!form.deskripsi.trim() || form.deskripsi.length < 20) {
        setErrors({ deskripsi: 'Deskripsi minimal 20 karakter' });
        return;
      }
      setErrors({});
      setStep(3);
    }
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    setShowConfirm(false);

    const formData = new FormData();
    formData.append('judul', form.judul);
    formData.append('lokasi', form.lokasi);
    formData.append('deskripsi', form.deskripsi);
    formData.append('foto', file);

    try {
      await api.post('/pengaduan', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Laporan berhasil dikirim! 🎉');
      setTimeout(() => router.push('/laporan-saya'), 1000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mengirim laporan');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { num: 1, label: 'Info Dasar', icon: '📝' },
    { num: 2, label: 'Deskripsi', icon: '📋' },
    { num: 3, label: 'Upload', icon: '📸' },
  ];

  return (
    <div className="pt-24 md:pt-32 pb-12 container mx-auto px-4 md:px-6 flex justify-center animate-fade-in">
      <Card className="p-6 md:p-10 w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold text-white">Buat Laporan Baru</h1>
          <p className="text-slate-400 mt-2">Sampaikan keluhan fasilitas umum di sekitarmu.</p>
        </div>

        {/* Step Indicator */}
        <div className="flex justify-center mb-10">
          <div className="flex items-center gap-2 md:gap-4">
            {steps.map((s, i) => (
              <div key={s.num} className="flex items-center">
                <div className={`
                  flex items-center gap-2 px-3 md:px-4 py-2 rounded-full transition-all duration-300
                  ${step === s.num
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : step > s.num
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-700 text-slate-400'
                  }
                `}>
                  <span>{step > s.num ? '✓' : s.icon}</span>
                  <span className="hidden sm:inline text-sm font-bold">{s.label}</span>
                </div>
                {i < steps.length - 1 && (
                  <div className={`w-8 md:w-12 h-1 mx-1 md:mx-2 rounded ${step > s.num ? 'bg-emerald-500' : 'bg-slate-700'}`}></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="space-y-6 animate-slide-up">
            <Input
              label="Judul Masalah"
              placeholder="Contoh: Jalan Berlubang Besar"
              value={form.judul}
              onChange={e => setForm({ ...form, judul: e.target.value })}
              error={errors.judul}
              icon="📌"
            />
            <Input
              label="Lokasi Kejadian"
              placeholder="Nama Jalan / Patokan Terdekat"
              value={form.lokasi}
              onChange={e => setForm({ ...form, lokasi: e.target.value })}
              error={errors.lokasi}
              icon="📍"
            />
            <div className="flex justify-end pt-4">
              <Button onClick={handleNext} icon="→">Lanjut</Button>
            </div>
          </div>
        )}

        {/* Step 2: Description */}
        {step === 2 && (
          <div className="space-y-6 animate-slide-up">
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2 ml-1">Deskripsi Detail</label>
              <textarea
                className={`
                  w-full bg-slate-800/50 border text-white p-4 rounded-xl h-48
                  transition-all duration-200 placeholder-slate-500
                  focus:outline-none focus:ring-2 focus:ring-offset-0
                  ${errors.deskripsi
                    ? 'border-red-500 focus:ring-red-500/50'
                    : 'border-slate-600 focus:ring-blue-500/50 focus:border-blue-500'
                  }
                `}
                placeholder="Jelaskan kondisi kerusakan secara rinci. Sertakan informasi seperti kapan masalah terjadi, seberapa parah kondisinya, dll..."
                value={form.deskripsi}
                onChange={e => setForm({ ...form, deskripsi: e.target.value })}
              />
              <div className="flex justify-between mt-2">
                {errors.deskripsi && (
                  <p className="text-red-400 text-sm">⚠️ {errors.deskripsi}</p>
                )}
                <p className={`text-sm ml-auto ${form.deskripsi.length < 20 ? 'text-slate-500' : 'text-emerald-400'}`}>
                  {form.deskripsi.length}/20 karakter min
                </p>
              </div>
            </div>
            <div className="flex justify-between pt-4">
              <Button variant="ghost" onClick={() => setStep(1)}>← Kembali</Button>
              <Button onClick={handleNext} icon="→">Lanjut</Button>
            </div>
          </div>
        )}

        {/* Step 3: Upload */}
        {step === 3 && (
          <div className="space-y-6 animate-slide-up">
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2 ml-1">Foto Bukti</label>
              <div
                className={`
                  border-2 border-dashed rounded-2xl p-6 md:p-10 text-center 
                  transition-all duration-300 cursor-pointer group relative
                  ${errors.file
                    ? 'border-red-500 bg-red-900/10'
                    : file
                      ? 'border-emerald-500 bg-emerald-900/10'
                      : 'border-slate-600 bg-slate-900/20 hover:bg-slate-800/50 hover:border-blue-500'
                  }
                `}
              >
                <input
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  onChange={e => setFile(e.target.files[0])}
                />
                {preview ? (
                  <div className="space-y-4">
                    <img src={preview} alt="Preview" className="max-h-48 mx-auto rounded-xl object-cover" />
                    <p className="text-emerald-400 font-medium">✓ {file.name}</p>
                    <p className="text-slate-500 text-sm">Klik untuk ganti foto</p>
                  </div>
                ) : (
                  <>
                    <div className="text-5xl mb-4 group-hover:scale-110 transition-transform text-slate-400 group-hover:text-blue-400">📸</div>
                    <p className="text-slate-300 font-medium text-lg group-hover:text-white transition">
                      Klik atau Seret Foto ke Sini
                    </p>
                    <p className="text-slate-500 text-sm mt-2">Format: JPG, PNG (Max 5MB)</p>
                  </>
                )}
              </div>
              {errors.file && (
                <p className="text-red-400 text-sm mt-2">⚠️ {errors.file}</p>
              )}
            </div>

            {/* Summary */}
            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
              <h4 className="text-white font-bold mb-3">📋 Ringkasan Laporan</h4>
              <div className="space-y-2 text-sm">
                <p><span className="text-slate-400">Judul:</span> <span className="text-white">{form.judul}</span></p>
                <p><span className="text-slate-400">Lokasi:</span> <span className="text-white">{form.lokasi}</span></p>
                <p><span className="text-slate-400">Deskripsi:</span> <span className="text-white">{form.deskripsi.slice(0, 100)}...</span></p>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="ghost" onClick={() => setStep(2)}>← Kembali</Button>
              <Button
                onClick={() => validate() && setShowConfirm(true)}
                loading={loading}
                icon="🚀"
              >
                Kirim Laporan
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Confirmation Modal */}
      <Modal.Confirm
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleSubmit}
        title="Kirim Laporan?"
        message="Pastikan data yang Anda masukkan sudah benar. Laporan yang dikirim tidak dapat diedit."
        confirmText="Ya, Kirim Laporan"
        variant="primary"
        loading={loading}
      />
    </div>
  );
}