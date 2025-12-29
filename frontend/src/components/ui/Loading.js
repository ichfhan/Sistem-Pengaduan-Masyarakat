'use client';

// Spinner Component
export function Spinner({ size = 'md', className = '' }) {
    const sizes = {
        sm: 'h-4 w-4',
        md: 'h-8 w-8',
        lg: 'h-12 w-12',
    };

    return (
        <svg className={`animate-spin ${sizes[size]} ${className}`} fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
    );
}

// Skeleton Components
export function Skeleton({ className = '', variant = 'text' }) {
    const variants = {
        text: 'h-4 rounded',
        title: 'h-8 rounded-lg w-3/4',
        avatar: 'h-12 w-12 rounded-full',
        card: 'h-40 rounded-2xl',
        button: 'h-12 rounded-xl w-32',
    };

    return (
        <div className={`animate-pulse bg-slate-700/50 ${variants[variant]} ${className}`}></div>
    );
}

// Card Skeleton
export function CardSkeleton({ className = '' }) {
    return (
        <div className={`glass-card p-6 rounded-2xl space-y-4 ${className}`}>
            <div className="flex justify-between">
                <Skeleton variant="button" className="w-24 h-6" />
                <Skeleton variant="text" className="w-20" />
            </div>
            <Skeleton variant="title" />
            <Skeleton variant="text" className="w-1/2" />
            <div className="pt-4">
                <Skeleton variant="button" className="w-28" />
            </div>
        </div>
    );
}

// Table Row Skeleton
export function TableRowSkeleton({ columns = 5 }) {
    return (
        <tr className="border-b border-slate-700/50">
            {[...Array(columns)].map((_, i) => (
                <td key={i} className="p-4">
                    <Skeleton variant="text" />
                </td>
            ))}
        </tr>
    );
}

// Stats Card Skeleton
export function StatsSkeleton({ className = '' }) {
    return (
        <div className={`glass-card p-6 rounded-2xl ${className}`}>
            <div className="flex items-center gap-4">
                <Skeleton variant="avatar" />
                <div className="space-y-2 flex-1">
                    <Skeleton variant="text" className="w-24" />
                    <Skeleton variant="title" className="w-16 h-10" />
                </div>
            </div>
        </div>
    );
}

// Full Page Loading
export function PageLoading({ message = 'Memuat...' }) {
    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="text-center">
                <Spinner size="lg" className="text-blue-500 mx-auto mb-4" />
                <p className="text-slate-300 text-lg animate-pulse">{message}</p>
            </div>
        </div>
    );
}

// Inline Loading
export function Loading({ className = '' }) {
    return (
        <div className={`flex items-center justify-center py-12 ${className}`}>
            <Spinner size="lg" className="text-blue-500" />
        </div>
    );
}
