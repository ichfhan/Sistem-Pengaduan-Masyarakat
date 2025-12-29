'use client';
import Link from 'next/link';

export default function EmptyState({
    icon = '📭',
    title,
    description,
    action,
    actionHref,
    actionLabel,
    className = '',
}) {
    return (
        <div className={`glass-card p-12 rounded-2xl text-center ${className}`}>
            <span className="text-6xl block mb-4 animate-bounce-slow">{icon}</span>
            <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
            {description && (
                <p className="text-slate-400 mb-6 max-w-md mx-auto">{description}</p>
            )}
            {actionHref && actionLabel && (
                <Link
                    href={actionHref}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-3 px-8 rounded-full shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 hover:-translate-y-0.5 transition-all"
                >
                    {actionLabel}
                </Link>
            )}
            {action && !actionHref && (
                <button
                    onClick={action}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-3 px-8 rounded-full shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 hover:-translate-y-0.5 transition-all"
                >
                    {actionLabel}
                </button>
            )}
        </div>
    );
}
