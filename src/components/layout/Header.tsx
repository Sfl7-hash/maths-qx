'use client';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const NAV_TABS = [
  { id: 'tutor', label: 'AI Tutor', icon: '∑' },
  { id: 'graph', label: 'Graph', icon: '📈' },
  { id: 'geometry', label: 'Geometry', icon: '⬡' },
  { id: 'matrix', label: 'Matrix', icon: '⊞' },
  { id: 'compute', label: 'Compute', icon: '⚙' },
];

export default function Header({ activeTab, onTabChange }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-cyan-500/10">
      {/* Scan line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-4">
        {/* Logo */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="relative">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/30 to-violet-500/30 border border-cyan-500/40 flex items-center justify-center">
              <span className="text-cyan-400 font-bold text-lg" aria-hidden="true">∑</span>
            </div>
            <div className="absolute -inset-0.5 rounded-lg bg-gradient-to-br from-cyan-500/20 to-violet-500/20 blur-sm -z-10" />
          </div>
          <div>
            <span 
              className="text-white font-bold text-lg tracking-widest" 
              style={{ fontFamily: 'Orbitron, sans-serif' }}
            >
              MATH<span className="text-cyan-400">ESIS</span>
            </span>
          </div>
        </div>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1 ml-6" role="navigation" aria-label="Main navigation">
          {NAV_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              aria-current={activeTab === tab.id ? 'page' : undefined}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm transition-all ${
                activeTab === tab.id
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <span aria-hidden="true">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Status indicator */}
        <div className="hidden md:flex items-center gap-2 ml-auto text-xs text-slate-500">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          math.js active
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden ml-auto text-slate-400 hover:text-slate-200 transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle mobile menu"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="md:hidden bg-slate-950/95 backdrop-blur-xl border-t border-slate-700/30 px-4 py-3">
          <nav role="navigation" aria-label="Mobile navigation" className="flex flex-col gap-1">
            {NAV_TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => { onTabChange(tab.id); setMobileOpen(false); }}
                aria-current={activeTab === tab.id ? 'page' : undefined}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm transition-all text-left ${
                  activeTab === tab.id
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <span aria-hidden="true">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
