'use client';
import api from '@/utils/api';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';

export default function Register() {
    const [form, setForm] = useState({ username: '', password: '', nama_lengkap: '' });
    const [errors, setErrors] = useState({});
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const toast = useToast();

    const validate = () => {
        const newErrors = {};
        if (!form.nama_lengkap.trim()) newErrors.nama_lengkap = 'Nama lengkap wajib diisi';
        if (!form.username.trim()) newErrors.username = 'Username wajib diisi';
        if (form.username && form.username.length < 3) newErrors.username = 'Username minimal 3 karakter';
        if (!form.password) newErrors.password = 'Password wajib diisi';
        if (form.password && form.password.length < 6) newErrors.password = 'Password minimal 6 karakter';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Password strength indicator
    const getPasswordStrength = () => {
        const pass = form.password;
        if (!pass) return { level: 0, text: '', color: '' };
        if (pass.length < 6) return { level: 1, text: 'Lemah', color: 'bg-red-500' };
        if (pass.length < 8) return { level: 2, text: 'Cukup', color: 'bg-yellow-500' };
        if (/[A-Z]/.test(pass) && /[0-9]/.test(pass)) return { level: 3, text: 'Kuat', color: 'bg-emerald-500' };
        return { level: 2, text: 'Sedang', color: 'bg-blue-500' };
    };

    const passwordStrength = getPasswordStrength();

    const handleRegister = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        try {
            await api.post('/auth/register', form);
            toast.success('Registrasi berhasil! Silakan login.');
            setTimeout(() => router.push('/login'), 1000);
        } catch (err) {
            const message = err.response?.data?.message || 'Registrasi gagal!';
            toast.error(message);
            if (message.toLowerCase().includes('username')) {
                setErrors({ username: message });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen w-full relative overflow-hidden bg-[#0f172a] p-4">
            {/* Background Blobs */}
            <div className="absolute top-1/4 left-1/4 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-emerald-600/30 rounded-full mix-blend-screen filter blur-[100px] animate-blob"></div>
            <div className="absolute bottom-1/4 right-1/4 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-blue-600/30 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-2000"></div>

            <form
                onSubmit={handleRegister}
                className="glass-card p-8 md:p-12 rounded-3xl shadow-2xl w-full max-w-lg relative z-10 border border-white/10 animate-scale-in"
            >
                {/* Header */}
                <div className="text-center mb-10">
                    <span className="text-6xl mb-6 block drop-shadow-lg animate-bounce-slow">📝</span>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">Daftar Akun Warga</h1>
                    <p className="text-slate-400 mt-3 text-lg">Buat akun untuk mulai melapor</p>
                </div>

                {/* Form Fields */}
                <div className="space-y-5">
                    <Input
                        label="Nama Lengkap"
                        type="text"
                        placeholder="Masukkan nama lengkap Anda"
                        value={form.nama_lengkap}
                        onChange={e => setForm({ ...form, nama_lengkap: e.target.value })}
                        error={errors.nama_lengkap}
                        icon="👤"
                    />

                    <Input
                        label="Username"
                        type="text"
                        placeholder="Pilih username unik"
                        value={form.username}
                        onChange={e => setForm({ ...form, username: e.target.value })}
                        error={errors.username}
                        icon="📧"
                    />

                    <div>
                        <Input
                            label="Password"
                            type="password"
                            placeholder="Minimal 6 karakter"
                            value={form.password}
                            onChange={e => setForm({ ...form, password: e.target.value })}
                            error={errors.password}
                        />
                        {/* Password Strength Indicator */}
                        {form.password && (
                            <div className="mt-2 space-y-1">
                                <div className="flex gap-1">
                                    {[1, 2, 3].map(level => (
                                        <div
                                            key={level}
                                            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${passwordStrength.level >= level ? passwordStrength.color : 'bg-slate-700'
                                                }`}
                                        />
                                    ))}
                                </div>
                                <p className={`text-xs ${passwordStrength.level === 1 ? 'text-red-400' :
                                        passwordStrength.level === 2 ? 'text-yellow-400' :
                                            passwordStrength.level === 3 ? 'text-emerald-400' : 'text-slate-500'
                                    }`}>
                                    Kekuatan: {passwordStrength.text}
                                </p>
                            </div>
                        )}
                    </div>

                    <Button
                        type="submit"
                        loading={loading}
                        size="lg"
                        variant="success"
                        className="w-full mt-6"
                    >
                        DAFTAR SEKARANG
                    </Button>
                </div>

                {/* Footer */}
                <div className="mt-8 text-center">
                    <p className="text-slate-500 text-sm">
                        Sudah punya akun?{' '}
                        <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium hover:underline transition">
                            Masuk
                        </Link>
                    </p>
                </div>
            </form>
        </div>
    );
}
