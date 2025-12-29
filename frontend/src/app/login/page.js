'use client';
import api from '@/utils/api';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [errors, setErrors] = useState({});
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const validate = () => {
    const newErrors = {};
    if (!form.username.trim()) newErrors.username = 'Username wajib diisi';
    if (!form.password) newErrors.password = 'Password wajib diisi';
    if (form.password && form.password.length < 4) newErrors.password = 'Password minimal 4 karakter';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await api.post('/auth/login', form);
      Cookies.set('token', res.data.token);
      Cookies.set('role', res.data.role);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      toast.success('Login berhasil! Selamat datang 👋');
      setTimeout(() => window.location.href = '/dashboard', 500);
    } catch (err) {
      const message = err.response?.data?.message || 'Login gagal! Cek username dan password.';
      toast.error(message);
      setErrors({ password: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen w-full relative overflow-hidden bg-[#0f172a] p-4">
      {/* Background Blobs */}
      <div className="absolute top-1/4 left-1/4 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-blue-600/30 rounded-full mix-blend-screen filter blur-[100px] animate-blob"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-purple-600/30 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-2000"></div>

      <form
        onSubmit={handleLogin}
        className="glass-card p-8 md:p-12 rounded-3xl shadow-2xl w-full max-w-lg relative z-10 border border-white/10 animate-scale-in"
      >
        {/* Header */}
        <div className="text-center mb-10">
          <span className="text-6xl mb-6 block drop-shadow-lg animate-bounce-slow">👮‍♂️</span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">Selamat Datang</h1>
          <p className="text-slate-400 mt-3 text-lg">Sistem Lapor Pak! Terpadu</p>
        </div>

        {/* Form Fields */}
        <div className="space-y-5">
          <Input
            label="Username"
            type="text"
            placeholder="Masukkan username Anda"
            value={form.username}
            onChange={e => setForm({ ...form, username: e.target.value })}
            error={errors.username}
            icon="👤"
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            error={errors.password}
          />

          <Button
            type="submit"
            loading={loading}
            size="lg"
            className="w-full mt-6"
          >
            MASUK SEKARANG
          </Button>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-slate-500 text-sm">
            Belum punya akun?{' '}
            <Link href="/register" className="text-blue-400 hover:text-blue-300 font-medium hover:underline transition">
              Daftar Sekarang
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}