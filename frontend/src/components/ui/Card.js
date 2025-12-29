'use client';

const variants = {
    default: 'border-white/5 hover:border-white/20',
    primary: 'border-blue-500/30 hover:border-blue-500',
    success: 'border-emerald-500/30 hover:border-emerald-500',
    warning: 'border-yellow-500/30 hover:border-yellow-500',
    danger: 'border-red-500/30 hover:border-red-500',
};

export default function Card({
    children,
    variant = 'default',
    hover = true,
    className = '',
    onClick,
    ...props
}) {
    return (
        <div
            onClick={onClick}
            className={`
        glass-card rounded-2xl border transition-all duration-300
        ${variants[variant]}
        ${hover ? 'hover:shadow-xl hover:-translate-y-1' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
            {...props}
        >
            {children}
        </div>
    );
}

Card.Header = function CardHeader({ children, className = '' }) {
    return (
        <div className={`p-6 border-b border-slate-700/50 ${className}`}>
            {children}
        </div>
    );
};

Card.Body = function CardBody({ children, className = '' }) {
    return (
        <div className={`p-6 ${className}`}>
            {children}
        </div>
    );
};

Card.Footer = function CardFooter({ children, className = '' }) {
    return (
        <div className={`p-6 border-t border-slate-700/50 ${className}`}>
            {children}
        </div>
    );
};
