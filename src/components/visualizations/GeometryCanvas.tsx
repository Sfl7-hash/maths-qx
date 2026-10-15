'use client';
import { useRef, useEffect, useState } from 'react';
import HoloPanel from '@/components/ui/HoloPanel';
import HoloButton from '@/components/ui/HoloButton';

type ShapeType = 'circle' | 'triangle' | 'rectangle' | 'polygon';

interface Shape {
  type: ShapeType;
  color: string;
  // circle
  radius?: number;
  // triangle  
  base?: number;
  height?: number;
  // rectangle
  width?: number;
  rectHeight?: number;
  // polygon
  sides?: number;
  sideLength?: number;
}

export default function GeometryCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeShape, setActiveShape] = useState<ShapeType>('circle');
  const [params, setParams] = useState({
    radius: 80,
    base: 120,
    height: 100,
    width: 140,
    rectHeight: 80,
    sides: 6,
    sideLength: 60,
  });
  const [measurements, setMeasurements] = useState<Record<string, string>>({});
  const [showGrid, setShowGrid] = useState(true);

  const drawGrid = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.strokeStyle = 'rgba(0,245,255,0.06)';
    ctx.lineWidth = 1;
    const step = 30;
    for (let x = 0; x <= w; x += step) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    for (let y = 0; y <= h; y += step) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }
    // Axes
    ctx.strokeStyle = 'rgba(0,245,255,0.2)';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(w/2, 0); ctx.lineTo(w/2, h); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, h/2); ctx.lineTo(w, h/2); ctx.stroke();
  };

  const drawShape = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    const cx = w / 2;
    const cy = h / 2;
    
    ctx.shadowColor = '#00f5ff';
    ctx.shadowBlur = 15;
    
    switch (activeShape) {
      case 'circle': {
        const r = Math.min(params.radius, Math.min(w, h) / 2 - 20);
        // Fill
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        grad.addColorStop(0, 'rgba(0,245,255,0.12)');
        grad.addColorStop(1, 'rgba(0,245,255,0.04)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
        
        // Stroke
        ctx.strokeStyle = '#00f5ff';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Radius line
        ctx.strokeStyle = 'rgba(139,92,246,0.7)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + r, cy);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Center dot
        ctx.fillStyle = '#8b5cf6';
        ctx.beginPath();
        ctx.arc(cx, cy, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Label r
        ctx.fillStyle = '#8b5cf6';
        ctx.font = '12px JetBrains Mono, monospace';
        ctx.fillText(`r = ${r.toFixed(0)}px`, cx + r/2 - 15, cy - 8);
        
        setMeasurements({
          'Radius': `${r.toFixed(1)}px`,
          'Diameter': `${(r * 2).toFixed(1)}px`,
          'Area': `π·r² = ${(Math.PI * r * r).toFixed(2)}px²`,
          'Circumference': `2π·r = ${(2 * Math.PI * r).toFixed(2)}px`,
        });
        break;
      }
      
      case 'triangle': {
        const b = Math.min(params.base, w - 40);
        const ht = Math.min(params.height, h - 40);
        
        const x1 = cx - b/2, y1 = cy + ht/2;
        const x2 = cx + b/2, y2 = cy + ht/2;
        const x3 = cx, y3 = cy - ht/2;
        
        const triGrad = ctx.createLinearGradient(cx, y3, cx, y1);
        triGrad.addColorStop(0, 'rgba(139,92,246,0.2)');
        triGrad.addColorStop(1, 'rgba(0,245,255,0.08)');
        ctx.fillStyle = triGrad;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.lineTo(x3, y3);
        ctx.closePath();
        ctx.fill();
        
        ctx.strokeStyle = '#8b5cf6';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Height line
        ctx.strokeStyle = 'rgba(0,245,255,0.5)';
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(cx, y3);
        ctx.lineTo(cx, y1);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Labels
        ctx.fillStyle = '#94a3b8';
        ctx.font = '11px JetBrains Mono, monospace';
        ctx.fillText(`b = ${b.toFixed(0)}`, cx - 15, y1 + 16);
        ctx.fillText(`h = ${ht.toFixed(0)}`, cx + 6, cy);
        
        const sideA = Math.sqrt(Math.pow(x3-x1, 2) + Math.pow(y3-y1, 2));
        const sideB = b;
        setMeasurements({
          'Base': `${b.toFixed(1)}px`,
          'Height': `${ht.toFixed(1)}px`,
          'Area': `½·b·h = ${(0.5 * b * ht).toFixed(2)}px²`,
          'Hypotenuse': `${sideA.toFixed(1)}px`,
          'Perimeter': `${(b + 2*sideA).toFixed(1)}px`,
        });
        break;
      }
      
      case 'rectangle': {
        const rw = Math.min(params.width, w - 40);
        const rh = Math.min(params.rectHeight, h - 40);
        const rx = cx - rw/2;
        const ry = cy - rh/2;
        
        const rectGrad = ctx.createLinearGradient(rx, ry, rx + rw, ry + rh);
        rectGrad.addColorStop(0, 'rgba(0,245,255,0.12)');
        rectGrad.addColorStop(1, 'rgba(236,72,153,0.06)');
        ctx.fillStyle = rectGrad;
        ctx.fillRect(rx, ry, rw, rh);
        
        ctx.strokeStyle = '#00f5ff';
        ctx.lineWidth = 2;
        ctx.strokeRect(rx, ry, rw, rh);
        
        // Diagonal
        ctx.strokeStyle = 'rgba(236,72,153,0.4)';
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(rx, ry);
        ctx.lineTo(rx + rw, ry + rh);
        ctx.stroke();
        ctx.setLineDash([]);
        
        ctx.fillStyle = '#94a3b8';
        ctx.font = '11px JetBrains Mono, monospace';
        ctx.fillText(`${rw.toFixed(0)}`, cx - 20, ry - 6);
        ctx.fillText(`${rh.toFixed(0)}`, rx + rw + 6, cy);
        
        const diag = Math.sqrt(rw*rw + rh*rh);
        setMeasurements({
          'Width': `${rw.toFixed(1)}px`,
          'Height': `${rh.toFixed(1)}px`,
          'Area': `w·h = ${(rw * rh).toFixed(2)}px²`,
          'Perimeter': `2(w+h) = ${(2*(rw+rh)).toFixed(1)}px`,
          'Diagonal': `${diag.toFixed(1)}px`,
        });
        break;
      }
      
      case 'polygon': {
        const n = Math.max(3, Math.min(12, params.sides));
        const sl = Math.min(params.sideLength, 80);
        const R = sl / (2 * Math.sin(Math.PI / n));
        
        ctx.beginPath();
        for (let i = 0; i < n; i++) {
          const angle = (2 * Math.PI * i / n) - Math.PI / 2;
          const px = cx + R * Math.cos(angle);
          const py = cy + R * Math.sin(angle);
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        
        const polyGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, R);
        polyGrad.addColorStop(0, 'rgba(236,72,153,0.15)');
        polyGrad.addColorStop(1, 'rgba(139,92,246,0.05)');
        ctx.fillStyle = polyGrad;
        ctx.fill();
        
        ctx.strokeStyle = '#ec4899';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        const inRadius = R * Math.cos(Math.PI / n);
        const area = 0.5 * n * sl * inRadius;
        const perimeter = n * sl;
        
        setMeasurements({
          'Sides': `${n}`,
          'Side length': `${sl.toFixed(1)}px`,
          'Circumradius': `${R.toFixed(1)}px`,
          'Inradius': `${inRadius.toFixed(1)}px`,
          'Perimeter': `${perimeter.toFixed(1)}px`,
          'Area': `${area.toFixed(1)}px²`,
        });
        break;
      }
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Background
    ctx.fillStyle = 'rgba(2, 8, 23, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    if (showGrid) drawGrid(ctx, canvas.width, canvas.height);
    drawShape(ctx, canvas.width, canvas.height);
    
  }, [activeShape, params, showGrid]);

  const shapeButtons: { type: ShapeType; label: string }[] = [
    { type: 'circle', label: 'Circle' },
    { type: 'triangle', label: 'Triangle' },
    { type: 'rectangle', label: 'Rectangle' },
    { type: 'polygon', label: 'Polygon' },
  ];

  return (
    <HoloPanel variant="violet" className="w-full">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
        <h3 className="text-violet-400 font-semibold text-sm tracking-wider uppercase">
          Geometry Explorer
        </h3>
      </div>

      {/* Shape selector */}
      <div className="flex gap-2 mb-4">
        {shapeButtons.map(({ type, label }) => (
          <button
            key={type}
            onClick={() => setActiveShape(type)}
            className={`px-3 py-1.5 text-xs rounded-md border transition-all ${
              activeShape === type
                ? 'bg-violet-500/20 border-violet-400/60 text-violet-300'
                : 'bg-slate-800/40 border-slate-700/40 text-slate-400 hover:border-violet-500/40 hover:text-violet-300'
            }`}
          >
            {label}
          </button>
        ))}
        <label className="flex items-center gap-2 ml-auto cursor-pointer text-xs text-slate-400">
          <input
            type="checkbox"
            checked={showGrid}
            onChange={e => setShowGrid(e.target.checked)}
            className="accent-violet-400"
          />
          Grid
        </label>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={480}
        height={280}
        className="w-full rounded-lg bg-slate-950/60 border border-slate-700/30"
        role="img"
        aria-label={`${activeShape} geometry visualization`}
      />

      {/* Controls */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        {activeShape === 'circle' && (
          <div className="col-span-2">
            <label className="text-xs text-slate-400 block mb-1">Radius: {params.radius}px</label>
            <input type="range" min="20" max="120" value={params.radius}
              onChange={e => setParams(p => ({...p, radius: parseInt(e.target.value)}))}
              className="w-full accent-cyan-400"
            />
          </div>
        )}
        {activeShape === 'triangle' && (
          <>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Base: {params.base}px</label>
              <input type="range" min="30" max="200" value={params.base}
                onChange={e => setParams(p => ({...p, base: parseInt(e.target.value)}))}
                className="w-full accent-violet-400"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Height: {params.height}px</label>
              <input type="range" min="20" max="180" value={params.height}
                onChange={e => setParams(p => ({...p, height: parseInt(e.target.value)}))}
                className="w-full accent-violet-400"
              />
            </div>
          </>
        )}
        {activeShape === 'rectangle' && (
          <>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Width: {params.width}px</label>
              <input type="range" min="30" max="220" value={params.width}
                onChange={e => setParams(p => ({...p, width: parseInt(e.target.value)}))}
                className="w-full accent-cyan-400"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Height: {params.rectHeight}px</label>
              <input type="range" min="20" max="180" value={params.rectHeight}
                onChange={e => setParams(p => ({...p, rectHeight: parseInt(e.target.value)}))}
                className="w-full accent-cyan-400"
              />
            </div>
          </>
        )}
        {activeShape === 'polygon' && (
          <>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Sides: {params.sides}</label>
              <input type="range" min="3" max="12" value={params.sides}
                onChange={e => setParams(p => ({...p, sides: parseInt(e.target.value)}))}
                className="w-full accent-pink-400"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Side length: {params.sideLength}px</label>
              <input type="range" min="20" max="100" value={params.sideLength}
                onChange={e => setParams(p => ({...p, sideLength: parseInt(e.target.value)}))}
                className="w-full accent-pink-400"
              />
            </div>
          </>
        )}
      </div>

      {/* Measurements */}
      {Object.keys(measurements).length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-2">
          {Object.entries(measurements).map(([key, value]) => (
            <div key={key} className="flex justify-between items-center bg-slate-800/40 rounded px-3 py-1.5">
              <span className="text-xs text-slate-400">{key}</span>
              <span className="text-xs font-mono text-violet-300">{value}</span>
            </div>
          ))}
        </div>
      )}
    </HoloPanel>
  );
}
