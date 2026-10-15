'use client';
import { useState } from 'react';
import HoloPanel from '@/components/ui/HoloPanel';
import HoloButton from '@/components/ui/HoloButton';
import LoadingDots from '@/components/ui/LoadingDots';

type MatrixSize = 2 | 3 | 4;

function createEmptyMatrix(size: MatrixSize): string[][] {
  return Array.from({ length: size }, () => Array(size).fill(''));
}

function parseMatrix(m: string[][]): number[][] {
  return m.map(row => row.map(cell => parseFloat(cell) || 0));
}

function formatNumber(n: number): string {
  if (!isFinite(n) || isNaN(n)) return '—';
  return Math.abs(n) < 1e-10 ? '0' : 
    Number.isInteger(n) ? String(n) : 
    n.toFixed(4).replace(/\.?0+$/, '');
}

export default function MatrixCalculator() {
  const [size, setSize] = useState<MatrixSize>(3);
  const [matrixA, setMatrixA] = useState<string[][]>(createEmptyMatrix(3));
  const [matrixB, setMatrixB] = useState<string[][]>(createEmptyMatrix(3));
  const [operation, setOperation] = useState<'add' | 'multiply' | 'determinant' | 'inverse' | 'transpose'>('multiply');
  const [result, setResult] = useState<(number | null)[][] | null>(null);
  const [scalar, setScalar] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCellChange = (
    matrix: 'A' | 'B',
    row: number,
    col: number,
    value: string
  ) => {
    if (matrix === 'A') {
      const next = matrixA.map(r => [...r]);
      next[row][col] = value;
      setMatrixA(next);
    } else {
      const next = matrixB.map(r => [...r]);
      next[row][col] = value;
      setMatrixB(next);
    }
  };

  const handleSizeChange = (s: MatrixSize) => {
    setSize(s);
    setMatrixA(createEmptyMatrix(s));
    setMatrixB(createEmptyMatrix(s));
    setResult(null);
    setError(null);
  };

  const compute = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    setScalar(null);

    const A = parseMatrix(matrixA);
    const B = parseMatrix(matrixB);
    const n = size;

    try {
      const math = await import('mathjs');

      switch (operation) {
        case 'add': {
          const r = math.add(math.matrix(A), math.matrix(B)) as any;
          setResult(r._data || r.toArray());
          break;
        }
        case 'multiply': {
          const r = math.multiply(math.matrix(A), math.matrix(B)) as any;
          setResult(r._data || r.toArray());
          break;
        }
        case 'determinant': {
          const det = math.det(A);
          setScalar(typeof det === 'number' ? det : parseFloat(String(det)));
          break;
        }
        case 'inverse': {
          const inv = math.inv(A) as number[][];
          setResult(inv);
          break;
        }
        case 'transpose': {
          const t = math.transpose(A) as number[][];
          setResult(t);
          break;
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Computation failed');
    } finally {
      setLoading(false);
    }
  };

  const fillIdentity = (matrix: 'A' | 'B') => {
    const m = Array.from({ length: size }, (_, i) =>
      Array.from({ length: size }, (_, j) => (i === j ? '1' : '0'))
    );
    if (matrix === 'A') setMatrixA(m);
    else setMatrixB(m);
  };

  const fillRandom = (matrix: 'A' | 'B') => {
    const m = Array.from({ length: size }, () =>
      Array.from({ length: size }, () => String(Math.floor(Math.random() * 9) - 4))
    );
    if (matrix === 'A') setMatrixA(m);
    else setMatrixB(m);
  };

  const MatrixGrid = ({
    label,
    matrix,
    target,
  }: {
    label: string;
    matrix: string[][];
    target: 'A' | 'B';
  }) => (
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-mono text-cyan-400">Matrix {label}</span>
        <div className="flex gap-1">
          <button
            onClick={() => fillIdentity(target)}
            className="px-2 py-0.5 text-xs text-slate-400 hover:text-cyan-300 border border-slate-700/50 rounded hover:border-cyan-500/30 transition-all"
          >
            I
          </button>
          <button
            onClick={() => fillRandom(target)}
            className="px-2 py-0.5 text-xs text-slate-400 hover:text-cyan-300 border border-slate-700/50 rounded hover:border-cyan-500/30 transition-all"
          >
            R
          </button>
        </div>
      </div>
      <div className="relative">
        {/* Matrix bracket left */}
        <div className="absolute -left-2 top-0 bottom-0 w-1 border-l-2 border-t-2 border-b-2 border-cyan-500/40 rounded-l" />
        <div className="absolute -right-2 top-0 bottom-0 w-1 border-r-2 border-t-2 border-b-2 border-cyan-500/40 rounded-r" />
        <div
          className="grid gap-1 px-3"
          style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
        >
          {matrix.map((row, i) =>
            row.map((cell, j) => (
              <input
                key={`${i}-${j}`}
                type="text"
                inputMode="numeric"
                value={cell}
                onChange={e => handleCellChange(target, i, j, e.target.value)}
                className="w-full text-center bg-slate-800/60 border border-slate-600/40 rounded px-1 py-1.5 text-sm font-mono text-slate-200 focus:outline-none focus:border-cyan-500/60 focus:bg-slate-800/80 transition-all"
                placeholder="0"
                aria-label={`Matrix ${label} row ${i + 1} column ${j + 1}`}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );

  const ResultGrid = ({ data }: { data: (number | null)[][] }) => (
    <div className="relative">
      <div className="absolute -left-2 top-0 bottom-0 w-1 border-l-2 border-t-2 border-b-2 border-violet-500/60 rounded-l" />
      <div className="absolute -right-2 top-0 bottom-0 w-1 border-r-2 border-t-2 border-b-2 border-violet-500/60 rounded-r" />
      <div
        className="grid gap-1 px-3"
        style={{ gridTemplateColumns: `repeat(${data[0]?.length || size}, minmax(0, 1fr))` }}
      >
        {data.map((row, i) =>
          row.map((cell, j) => (
            <div
              key={`${i}-${j}`}
              className="w-full text-center bg-violet-500/10 border border-violet-500/20 rounded px-1 py-1.5 text-sm font-mono text-violet-300"
            >
              {cell !== null ? formatNumber(cell as number) : '—'}
            </div>
          ))
        )}
      </div>
    </div>
  );

  const needsB = operation === 'add' || operation === 'multiply';

  return (
    <HoloPanel className="w-full">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
        <h3 className="text-cyan-400 font-semibold text-sm tracking-wider uppercase">
          Matrix Calculator
        </h3>
      </div>

      {/* Size selector */}
      <div className="flex gap-2 mb-4 items-center">
        <span className="text-xs text-slate-400">Size:</span>
        {([2, 3, 4] as MatrixSize[]).map(s => (
          <button
            key={s}
            onClick={() => handleSizeChange(s)}
            className={`px-3 py-1 text-xs rounded border transition-all font-mono ${
              size === s
                ? 'bg-cyan-500/20 border-cyan-400/60 text-cyan-300'
                : 'bg-slate-800/40 border-slate-700/40 text-slate-400 hover:border-cyan-500/40'
            }`}
          >
            {s}×{s}
          </button>
        ))}
      </div>

      {/* Operation selector */}
      <div className="flex flex-wrap gap-2 mb-5">
        {(['multiply', 'add', 'determinant', 'inverse', 'transpose'] as const).map(op => (
          <button
            key={op}
            onClick={() => setOperation(op)}
            className={`px-3 py-1 text-xs rounded border transition-all capitalize ${
              operation === op
                ? 'bg-violet-500/20 border-violet-400/60 text-violet-300'
                : 'bg-slate-800/40 border-slate-700/40 text-slate-400 hover:border-violet-500/40'
            }`}
          >
            {op}
          </button>
        ))}
      </div>

      {/* Matrices */}
      <div className="flex gap-6 mb-5 overflow-x-auto pb-2">
        <MatrixGrid label="A" matrix={matrixA} target="A" />
        {needsB && (
          <>
            <div className="flex items-center self-center text-2xl text-slate-500 font-thin select-none pt-4">
              {operation === 'add' ? '+' : '×'}
            </div>
            <MatrixGrid label="B" matrix={matrixB} target="B" />
          </>
        )}
      </div>

      {/* Compute button */}
      <div className="flex justify-center mb-5">
        <HoloButton onClick={compute} loading={loading} glow>
          {loading ? 'Computing...' : 'Compute'}
        </HoloButton>
      </div>

      {/* Result */}
      {loading && <div className="flex justify-center"><LoadingDots label="Computing..." /></div>}
      
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}
      
      {scalar !== null && !loading && (
        <div className="mt-2 p-4 bg-violet-500/10 border border-violet-500/20 rounded-lg text-center">
          <p className="text-xs text-slate-400 mb-1">Determinant of A</p>
          <p className="text-2xl font-mono text-violet-300">{formatNumber(scalar)}</p>
          {Math.abs(scalar) < 1e-10 && (
            <p className="text-xs text-orange-400 mt-1">Matrix is singular (det = 0), no inverse exists</p>
          )}
        </div>
      )}
      
      {result && !loading && (
        <div className="mt-2">
          <p className="text-xs text-violet-400 mb-3 text-center">Result</p>
          <ResultGrid data={result} />
        </div>
      )}
    </HoloPanel>
  );
}
