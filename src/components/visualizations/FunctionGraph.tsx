'use client';
import { useState, useCallback, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';
import HoloPanel from '@/components/ui/HoloPanel';
import HoloButton from '@/components/ui/HoloButton';
import LoadingDots from '@/components/ui/LoadingDots';

interface GraphPoint {
  x: number;
  y: number | null;
}

interface GraphData {
  points: GraphPoint[];
  expression: string;
  color: string;
}

const GRAPH_COLORS = ['#00f5ff', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b'];

const PRESET_FUNCTIONS = [
  { label: 'sin(x)', expr: 'sin(x)', range: [-6.28, 6.28] },
  { label: 'x²', expr: 'x^2', range: [-5, 5] },
  { label: 'e^x', expr: 'exp(x)', range: [-3, 3] },
  { label: '1/x', expr: '1/x', range: [-5, 5] },
  { label: 'tan(x)', expr: 'tan(x)', range: [-1.5, 1.5] },
  { label: '√x', expr: 'sqrt(x)', range: [0, 10] },
  { label: 'ln(x)', expr: 'log(x)', range: [0.1, 10] },
  { label: 'x³-3x', expr: 'x^3 - 3*x', range: [-3, 3] },
];

interface FunctionGraphProps {
  initialExpression?: string;
  initialRange?: [number, number];
}

export default function FunctionGraph({ initialExpression, initialRange }: FunctionGraphProps) {
  const [expressions, setExpressions] = useState<string[]>(
    initialExpression ? [initialExpression] : ['sin(x)']
  );
  const [inputValue, setInputValue] = useState(initialExpression || '');
  const [xMin, setXMin] = useState(initialRange?.[0] ?? -10);
  const [xMax, setXMax] = useState(initialRange?.[1] ?? 10);
  const [graphData, setGraphData] = useState<GraphData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDerivative, setShowDerivative] = useState(false);
  const [points, setPoints] = useState(300);

  const computeGraph = useCallback(async (exprs: string[], xRange: [number, number]) => {
    if (exprs.length === 0) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const results: GraphData[] = [];
      
      for (let i = 0; i < exprs.length; i++) {
        const expr = exprs[i].trim();
        if (!expr) continue;
        
        const res = await fetch('/api/math', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            operation: 'graph',
            expression: expr,
            range: xRange,
            points,
          }),
        });
        
        if (!res.ok) {
          const err = await res.json();
          setError(err.error || 'Failed to compute graph');
          continue;
        }
        
        const data = await res.json();
        const pts: GraphPoint[] = data.data.x.map((x: number, idx: number) => ({
          x: Math.round(x * 1000) / 1000,
          y: isNaN(data.data.y[idx]) ? null : Math.round(data.data.y[idx] * 10000) / 10000,
        }));
        
        results.push({
          points: pts,
          expression: expr,
          color: GRAPH_COLORS[i % GRAPH_COLORS.length],
        });
        
        // If derivative requested, compute it
        if (showDerivative && exprs.length < 3) {
          const derivRes = await fetch('/api/math', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ operation: 'differentiate', expression: expr }),
          });
          
          if (derivRes.ok) {
            const derivData = await derivRes.json();
            if (derivData.output) {
              const derivGraphRes = await fetch('/api/math', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  operation: 'graph',
                  expression: derivData.output,
                  range: xRange,
                  points,
                }),
              });
              
              if (derivGraphRes.ok) {
                const derivGraphData = await derivGraphRes.json();
                const derivPts: GraphPoint[] = derivGraphData.data.x.map((x: number, idx: number) => ({
                  x: Math.round(x * 1000) / 1000,
                  y: isNaN(derivGraphData.data.y[idx]) ? null : Math.round(derivGraphData.data.y[idx] * 10000) / 10000,
                }));
                
                results.push({
                  points: derivPts,
                  expression: `d/dx(${expr})`,
                  color: GRAPH_COLORS[(i + 1) % GRAPH_COLORS.length],
                });
              }
            }
          }
        }
      }
      
      setGraphData(results);
    } catch (err) {
      setError('Failed to connect to computation engine');
    } finally {
      setLoading(false);
    }
  }, [showDerivative, points]);

  // Auto-compute on mount
  useEffect(() => {
    computeGraph(expressions, [xMin, xMax]);
  }, []);

  // Re-compute when derivative toggle changes
  useEffect(() => {
    if (graphData.length > 0) {
      computeGraph(expressions, [xMin, xMax]);
    }
  }, [showDerivative]);

  const handleAddExpression = () => {
    const val = inputValue.trim();
    if (!val || expressions.includes(val)) return;
    const next = [...expressions, val];
    setExpressions(next);
    setInputValue('');
    computeGraph(next, [xMin, xMax]);
  };

  const handleRemoveExpression = (expr: string) => {
    const next = expressions.filter(e => e !== expr);
    setExpressions(next);
    if (next.length > 0) computeGraph(next, [xMin, xMax]);
    else setGraphData([]);
  };

  const handlePreset = (preset: typeof PRESET_FUNCTIONS[0]) => {
    setExpressions([preset.expr]);
    setXMin(preset.range[0]);
    setXMax(preset.range[1]);
    computeGraph([preset.expr], preset.range as [number, number]);
  };

  const handlePlot = () => {
    const val = inputValue.trim();
    if (val && !expressions.includes(val)) {
      const next = [...expressions, val];
      setExpressions(next);
      setInputValue('');
      computeGraph(next, [xMin, xMax]);
    } else {
      computeGraph(expressions, [xMin, xMax]);
    }
  };

  // Merge all graph data into one dataset for recharts
  const mergedData: Record<string, number | null>[] = [];
  if (graphData.length > 0) {
    const basePoints = graphData[0].points;
    for (let i = 0; i < basePoints.length; i++) {
      const point: Record<string, number | null> = { x: basePoints[i].x };
      for (const gd of graphData) {
        point[gd.expression] = gd.points[i]?.y ?? null;
      }
      mergedData.push(point);
    }
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/95 border border-cyan-500/30 rounded-lg p-3 text-xs backdrop-blur">
          <p className="text-cyan-400 font-mono mb-1">x = {label}</p>
          {payload.map((entry: any) => (
            <p key={entry.name} style={{ color: entry.color }} className="font-mono">
              {entry.name}: {entry.value !== null ? entry.value : 'undefined'}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <HoloPanel className="w-full">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
        <h3 className="text-cyan-400 font-semibold text-sm tracking-wider uppercase">
          Function Visualizer
        </h3>
      </div>
      
      {/* Preset functions */}
      <div className="flex flex-wrap gap-2 mb-4">
        {PRESET_FUNCTIONS.map(preset => (
          <button
            key={preset.expr}
            onClick={() => handlePreset(preset)}
            className="px-3 py-1 text-xs rounded-md bg-slate-800/60 border border-slate-700/50 text-slate-300 hover:border-cyan-500/50 hover:text-cyan-300 transition-all font-mono"
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Input row */}
      <div className="flex gap-2 mb-3">
        <div className="flex-1 relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-mono">
            f(x) =
          </span>
          <input
            type="text"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handlePlot(); }}
            placeholder="e.g. x^2 + sin(x)"
            className="w-full bg-slate-800/60 border border-slate-600/50 rounded-lg pl-14 pr-4 py-2.5 text-sm font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:bg-slate-800/80 transition-all"
            aria-label="Function expression"
          />
        </div>
        <HoloButton onClick={handlePlot} size="sm" disabled={loading}>
          Plot
        </HoloButton>
        {inputValue && (
          <HoloButton onClick={handleAddExpression} size="sm" variant="secondary" disabled={loading}>
            Add
          </HoloButton>
        )}
      </div>

      {/* Range controls */}
      <div className="flex flex-wrap gap-3 mb-3 items-center">
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400">x from</label>
          <input
            type="number"
            value={xMin}
            onChange={e => setXMin(parseFloat(e.target.value) || -10)}
            className="w-20 bg-slate-800/60 border border-slate-600/50 rounded px-2 py-1 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500/50"
          />
          <label className="text-xs text-slate-400">to</label>
          <input
            type="number"
            value={xMax}
            onChange={e => setXMax(parseFloat(e.target.value) || 10)}
            className="w-20 bg-slate-800/60 border border-slate-600/50 rounded px-2 py-1 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500/50"
          />
        </div>
        <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-400">
          <input
            type="checkbox"
            checked={showDerivative}
            onChange={e => setShowDerivative(e.target.checked)}
            className="rounded border-slate-600 bg-slate-800 accent-cyan-400"
          />
          Show derivative
        </label>
        <HoloButton 
          onClick={() => computeGraph(expressions, [xMin, xMax])} 
          size="sm" 
          variant="secondary"
          disabled={loading}
        >
          Update Range
        </HoloButton>
      </div>

      {/* Active expressions */}
      {expressions.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {expressions.map((expr, i) => (
            <div
              key={expr}
              className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono"
              style={{ backgroundColor: `${GRAPH_COLORS[i % GRAPH_COLORS.length]}20`, border: `1px solid ${GRAPH_COLORS[i % GRAPH_COLORS.length]}50` }}
            >
              <span style={{ color: GRAPH_COLORS[i % GRAPH_COLORS.length] }}>{expr}</span>
              <button
                onClick={() => handleRemoveExpression(expr)}
                className="text-slate-400 hover:text-white ml-1"
                aria-label={`Remove ${expr}`}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-3 p-2 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-xs">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-4">
          <LoadingDots label="Computing graph..." />
        </div>
      )}

      {/* Chart */}
      {!loading && mergedData.length > 0 && (
        <div className="h-64 w-full mt-2" role="img" aria-label="Function graph">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mergedData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="rgba(0,245,255,0.08)" 
              />
              <XAxis 
                dataKey="x" 
                stroke="#475569"
                tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                interval="preserveStartEnd"
              />
              <YAxis 
                stroke="#475569"
                tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                width={45}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ fontSize: '11px', color: '#94a3b8', fontFamily: 'JetBrains Mono' }}
              />
              <ReferenceLine y={0} stroke="rgba(255,255,255,0.15)" strokeWidth={1} />
              <ReferenceLine x={0} stroke="rgba(255,255,255,0.15)" strokeWidth={1} />
              {graphData.map((gd) => (
                <Line
                  key={gd.expression}
                  type="monotone"
                  dataKey={gd.expression}
                  stroke={gd.color}
                  strokeWidth={2}
                  dot={false}
                  connectNulls={false}
                  strokeDasharray={gd.expression.startsWith('d/dx') ? '4 4' : undefined}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
      
      {!loading && mergedData.length === 0 && !error && (
        <div className="flex items-center justify-center h-48 text-slate-500 text-sm">
          Enter an expression above and click Plot
        </div>
      )}
    </HoloPanel>
  );
}
