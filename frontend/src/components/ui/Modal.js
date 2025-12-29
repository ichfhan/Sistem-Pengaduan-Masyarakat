'use client';
import { useEffect, useCallback } from 'react';

export default function Modal({
    isOpen,
    onClose,
    title,
    children,
    footer,
    size = 'md',
    closeOnBackdrop = true,
    closeOnEscape = true,
}) {
    const sizes = {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
        full: 'max-w-[90vw]',
    };

    const handleEscape = useCallback((e) => {
        if (e.key === 'Escape' && closeOnEscape) {
            onClose();
        }
    }, [onClose, closeOnEscape]);

    useEffect(() => {
        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, handleEscape]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
                onClick={closeOnBackdrop ? onClose : undefined}
            />

            {/* Modal */}
            <div className={`
        relative w-full ${sizes[size]}
        glass-card rounded-2xl border border-white/10 shadow-2xl
        animate-slide-up
      `}>
                {/* Header */}
                {title && (
                    <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
                        <h2 className="text-xl font-bold text-white">{title}</h2>
                        <button
                            onClick={onClose}
                            className="text-slate-400 hover:text-white transition p-2 hover:bg-slate-700 rounded-lg"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                )}

                {/* Body */}
                <div className="p-6 max-h-[60vh] overflow-y-auto">
                    {children}
                </div>

                {/* Footer */}
                {footer && (
                    <div className="p-6 border-t border-slate-700/50 flex justify-end gap-3">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}

// Confirmation Modal shorthand
Modal.Confirm = function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title = 'Konfirmasi',
    message,
    confirmText = 'Ya, Lanjutkan',
    cancelText = 'Batal',
    variant = 'danger',
    loading = false,
}) {
    const buttonColors = {
        danger: 'bg-gradient-to-r from-red-600 to-rose-600 text-white',
        success: 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white',
        primary: 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white',
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="sm">
            <div className="text-center">
                <div className="text-5xl mb-4">
                    {variant === 'danger' ? '⚠️' : variant === 'success' ? '✅' : '❓'}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
                <p className="text-slate-400">{message}</p>
            </div>
            <div className="flex gap-3 mt-6">
                <button
                    onClick={onClose}
                    disabled={loading}
                    className="flex-1 py-3 px-4 rounded-xl bg-slate-700 text-white font-bold hover:bg-slate-600 transition disabled:opacity-50"
                >
                    {cancelText}
                </button>
                <button
                    onClick={onConfirm}
                    disabled={loading}
                    className={`flex-1 py-3 px-4 rounded-xl font-bold transition disabled:opacity-50 ${buttonColors[variant]}`}
                >
                    {loading ? 'Memproses...' : confirmText}
                </button>
            </div>
        </Modal>
    );
};
