'use client';
import { HTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';

interface HoloPanelProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'violet' | 'dark' | 'glass';
  noPadding?: boolean;
  animated?: boolean;
}

const HoloPanel = forwardRef<HTMLDivElement, HoloPanelProps>(
  ({ className, variant = 'default', noPadding = false, animated = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={clsx(
          'rounded-xl relative overflow-hidden',
          !noPadding && 'p-5',
          variant === 'default' && [
            'bg-slate-900/80 backdrop-blur-xl',
            'border border-cyan-500/15',
            'shadow-[0_0_0_1px_rgba(0,245,255,0.05),0_4px_40px_rgba(0,0,0,0.5),inset_0_0_40px_rgba(0,245,255,0.02)]',
          ],
          variant === 'violet' && [
            'bg-slate-900/80 backdrop-blur-xl',
            'border border-violet-500/20',
            'shadow-[0_0_0_1px_rgba(139,92,246,0.05),0_4px_40px_rgba(0,0,0,0.5),inset_0_0_40px_rgba(139,92,246,0.02)]',
          ],
          variant === 'dark' && [
            'bg-[#010610]/90 backdrop-blur-xl',
            'border border-slate-700/30',
          ],
          variant === 'glass' && [
            'bg-white/[0.03] backdrop-blur-2xl',
            'border border-white/10',
          ],
          animated && 'animate-fade-in-up',
          className
        )}
        {...props}
      >
        {/* Top accent line */}
        <div 
          className={clsx(
            'absolute top-0 left-0 right-0 h-px',
            variant === 'violet' 
              ? 'bg-gradient-to-r from-transparent via-violet-400/50 to-transparent'
              : 'bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent'
          )}
          aria-hidden="true"
        />
        {children}
      </div>
    );
  }
);

HoloPanel.displayName = 'HoloPanel';
export default HoloPanel;
