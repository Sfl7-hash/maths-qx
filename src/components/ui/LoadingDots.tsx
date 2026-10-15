'use client';

interface LoadingDotsProps {
  label?: string;
}

export default function LoadingDots({ label = 'Computing...' }: LoadingDotsProps) {
  return (
    <div className="flex items-center gap-3 text-cyan-400/70 text-sm" role="status" aria-label={label}>
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-cyan-400"
            style={{
              animation: `bounce 1.4s ease-in-out infinite`,
              animationDelay: `${i * 0.16}s`,
            }}
          />
        ))}
      </div>
      <span>{label}</span>
      <style jsx>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); opacity: 0.3; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
