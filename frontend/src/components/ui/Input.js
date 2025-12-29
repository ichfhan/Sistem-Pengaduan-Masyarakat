'use client';
import { forwardRef, useState } from 'react';

const Input = forwardRef(({
    label,
    error,
    success,
    icon,
    type = 'text',
    className = '',
    containerClassName = '',
    ...props
}, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';

    return (
        <div className={`space-y-2 ${containerClassName}`}>
            {label && (
                <label className="block text-sm font-bold text-slate-300 ml-1">
                    {label}
                </label>
            )}
            <div className="relative">
                {icon && (
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                        {icon}
                    </span>
                )}
                <input
                    ref={ref}
                    type={isPassword && showPassword ? 'text' : type}
                    className={`
            w-full bg-slate-800/50 border text-white p-4 rounded-xl
            transition-all duration-200 placeholder-slate-500
            focus:outline-none focus:ring-2 focus:ring-offset-0
            ${icon ? 'pl-12' : ''}
            ${isPassword ? 'pr-12' : ''}
            ${error
                            ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500'
                            : success
                                ? 'border-emerald-500 focus:ring-emerald-500/50 focus:border-emerald-500'
                                : 'border-slate-600 focus:ring-blue-500/50 focus:border-blue-500'
                        }
            ${className}
          `}
                    {...props}
                />
                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition"
                    >
                        {showPassword ? '🙈' : '👁️'}
                    </button>
                )}
            </div>
            {error && (
                <p className="text-red-400 text-sm ml-1 flex items-center gap-1">
                    <span>⚠️</span> {error}
                </p>
            )}
            {success && (
                <p className="text-emerald-400 text-sm ml-1 flex items-center gap-1">
                    <span>✓</span> {success}
                </p>
            )}
        </div>
    );
});

Input.displayName = 'Input';
export default Input;
