'use client';
import { ButtonHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';

interface HoloButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  glow?: boolean;
}

const HoloButton = forwardRef<HTMLButtonElement, HoloButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading = false, glow = false, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading}
        className={clsx(
          'relative inline-flex items-center justify-center gap-2 font-medium transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed select-none',
          // Size variants
          size === 'sm' && 'px-3 py-1.5 text-xs rounded-md',
          size === 'md' && 'px-5 py-2.5 text-sm rounded-lg',
          size === 'lg' && 'px-8 py-3.5 text-base rounded-xl',
          // Style variants
          variant === 'primary' && [
            'bg-gradient-to-r from-cyan-500/20 to-violet-500/20',
            'border border-cyan-400/50 text-cyan-300',
            'hover:border-cyan-400 hover:text-white hover:bg-gradient-to-r hover:from-cyan-500/30 hover:to-violet-500/30',
            glow && 'shadow-cyan-glow',
          ],
          variant === 'secondary' && [
            'bg-slate-800/60 border border-slate-600/50 text-slate-300',
            'hover:border-slate-400 hover:text-white hover:bg-slate-700/60',
          ],
          variant === 'ghost' && [
            'bg-transparent border border-transparent text-slate-400',
            'hover:border-slate-600 hover:text-slate-200 hover:bg-slate-800/40',
          ],
          variant === 'danger' && [
            'bg-red-500/20 border border-red-500/50 text-red-400',
            'hover:border-red-400 hover:text-red-300',
          ],
          className
        )}
        {...props}
      >
        {loading && (
          <span 
            className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"
            aria-hidden="true"
          />
        )}
        {children}
      </button>
    );
  }
);

HoloButton.displayName = 'HoloButton';
export default HoloButton;
