'use client';

const statusColors = {
    'Pending': { bg: 'bg-red-500/20', text: 'text-red-300', border: 'border-red-500/30', icon: '🔴' },
    'Diproses': { bg: 'bg-yellow-500/20', text: 'text-yellow-300', border: 'border-yellow-500/30', icon: '🟡' },
    'Menunggu Verifikasi': { bg: 'bg-orange-500/20', text: 'text-orange-300', border: 'border-orange-500/30', icon: '🟠' },
    'Selesai': { bg: 'bg-emerald-500/20', text: 'text-emerald-300', border: 'border-emerald-500/30', icon: '🟢' },
    'Ditolak': { bg: 'bg-slate-500/20', text: 'text-slate-300', border: 'border-slate-500/30', icon: '⚫' },
};

const roleColors = {
    'admin': { bg: 'bg-purple-500/20', text: 'text-purple-300', border: 'border-purple-500/30', icon: '🛡️' },
    'petugas': { bg: 'bg-yellow-500/20', text: 'text-yellow-300', border: 'border-yellow-500/30', icon: '👷' },
    'warga': { bg: 'bg-blue-500/20', text: 'text-blue-300', border: 'border-blue-500/30', icon: '👤' },
};

export function StatusBadge({ status, showIcon = true, size = 'sm', className = '' }) {
    const colors = statusColors[status] || statusColors['Pending'];
    const sizes = {
        sm: 'text-xs px-3 py-1',
        md: 'text-sm px-4 py-1.5',
        lg: 'text-base px-5 py-2',
    };

    return (
        <span className={`
      inline-flex items-center gap-1.5 rounded-full font-bold uppercase tracking-wider border
      ${colors.bg} ${colors.text} ${colors.border}
      ${sizes[size]}
      ${className}
    `}>
            {showIcon && <span>{colors.icon}</span>}
            {status}
        </span>
    );
}

export function RoleBadge({ role, showIcon = true, size = 'sm', className = '' }) {
    const colors = roleColors[role] || roleColors['warga'];
    const sizes = {
        sm: 'text-xs px-3 py-1',
        md: 'text-sm px-4 py-1.5',
        lg: 'text-base px-5 py-2',
    };

    return (
        <span className={`
      inline-flex items-center gap-1.5 rounded-full font-bold uppercase tracking-wider border
      ${colors.bg} ${colors.text} ${colors.border}
      ${sizes[size]}
      ${className}
    `}>
            {showIcon && <span>{colors.icon}</span>}
            {role}
        </span>
    );
}

// Generic badge
export default function Badge({
    children,
    variant = 'default',
    size = 'sm',
    className = ''
}) {
    const variants = {
        default: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
        primary: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
        success: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
        warning: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
        danger: 'bg-red-500/20 text-red-300 border-red-500/30',
    };

    const sizes = {
        sm: 'text-xs px-2 py-0.5',
        md: 'text-sm px-3 py-1',
        lg: 'text-base px-4 py-1.5',
    };

    return (
        <span className={`
      inline-flex items-center rounded-full font-medium border
      ${variants[variant]}
      ${sizes[size]}
      ${className}
    `}>
            {children}
        </span>
    );
}
