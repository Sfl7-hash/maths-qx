'use client';
import { useEffect, useRef } from 'react';

/**
 * Animated holographic background with floating particles and grid lines.
 * Respects prefers-reduced-motion: shows static version if reduced motion preferred.
 */
export default function HolographicBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = window.innerWidth;
    let h = window.innerHeight;
    canvas.width = w;
    canvas.height = h;

    // Particles
    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      opacity: number;
      color: string;
    }

    const COLORS = ['#00f5ff', '#8b5cf6', '#ec4899', '#3b82f6'];
    const particles: Particle[] = Array.from({ length: 60 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      radius: Math.random() * 1.5 + 0.5,
      opacity: Math.random() * 0.4 + 0.1,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    }));

    // Math symbols floating
    const symbols = ['∑', '∫', 'π', '∞', '√', 'Δ', '∂', 'φ', 'λ', 'θ'];
    interface FloatSymbol {
      x: number;
      y: number;
      vy: number;
      symbol: string;
      opacity: number;
      size: number;
    }
    const floatingSymbols: FloatSymbol[] = Array.from({ length: 15 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vy: -(Math.random() * 0.3 + 0.1),
      symbol: symbols[Math.floor(Math.random() * symbols.length)],
      opacity: Math.random() * 0.06 + 0.02,
      size: Math.random() * 20 + 10,
    }));

    let t = 0;

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      
      t += 0.005;
      
      // Grid
      ctx.strokeStyle = 'rgba(0, 245, 255, 0.025)';
      ctx.lineWidth = 1;
      const gridSize = 50;
      for (let x = 0; x < w; x += gridSize) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
      }
      for (let y = 0; y < h; y += gridSize) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      }

      // Floating particles
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color + Math.round(p.opacity * 255).toString(16).padStart(2, '0');
        ctx.fill();
      }

      // Connect nearby particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.strokeStyle = `rgba(0, 245, 255, ${0.05 * (1 - dist / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Floating math symbols
      ctx.font = '';
      for (const sym of floatingSymbols) {
        sym.y += sym.vy;
        if (sym.y < -50) { sym.y = h + 50; sym.x = Math.random() * w; }
        
        ctx.font = `${sym.size}px serif`;
        ctx.fillStyle = `rgba(0, 245, 255, ${sym.opacity})`;
        ctx.fillText(sym.symbol, sym.x, sym.y);
      }

      // Radial glow effects (pulsing)
      const glow1x = w * 0.2;
      const glow1y = h * 0.3;
      const grad1 = ctx.createRadialGradient(glow1x, glow1y, 0, glow1x, glow1y, 300 + Math.sin(t) * 50);
      grad1.addColorStop(0, `rgba(0, 245, 255, ${0.04 + 0.02 * Math.sin(t)})`);
      grad1.addColorStop(1, 'rgba(0, 245, 255, 0)');
      ctx.fillStyle = grad1;
      ctx.fillRect(0, 0, w, h);
      
      const glow2x = w * 0.8;
      const glow2y = h * 0.7;
      const grad2 = ctx.createRadialGradient(glow2x, glow2y, 0, glow2x, glow2y, 250 + Math.cos(t * 0.7) * 40);
      grad2.addColorStop(0, `rgba(139, 92, 246, ${0.04 + 0.02 * Math.cos(t * 0.7)})`);
      grad2.addColorStop(1, 'rgba(139, 92, 246, 0)');
      ctx.fillStyle = grad2;
      ctx.fillRect(0, 0, w, h);

      animFrameRef.current = requestAnimationFrame(draw);
    };

    draw();

    const handleResize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w;
      canvas.height = h;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    />
  );
}
