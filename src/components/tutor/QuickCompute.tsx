'use client';
import { useState } from 'react';
import { Calculator, ChevronDown, ChevronUp } from 'lucide-react';
import HoloPanel from '@/components/ui/HoloPanel';
import HoloButton from '@/components/ui/HoloButton';
import LoadingDots from '@/components/ui/LoadingDots';
import MathRenderer from '@/components/ui/MathRenderer';

type OperationType = 'evaluate' | 'simplify' | 'differentiate' | 'integrate';

interface ComputeResult {
  input: string;
  output: string;
  latex?: string;
  method: string;
  verified: boolean;
  error?: string;
}

export default function QuickCompute() {
  const [operation, setOperation] = useState<OperationType>('evaluate');
  const [expression, setExpression] = useState('');
  const [variable, setVariable] = useState('x');
  const [lower, setLower] = useState('0');
  const [upper, setUpper] = useState('1');
  const [scope, setScope] = useState('');
  const [result, setResult] = useState<ComputeResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<ComputeResult[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const compute = async () => {
    if (!expression.trim()) return;
    
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const scopeObj: Record<string, number> = {};
      if (scope.trim()) {
        // Parse "x=2, y=3" format
        scope.split(',').forEach(part => {
          const [k, v] = part.split('=').map(s => s.trim());
          if (k && v) scopeObj[k] = parseFloat(v);
        });
      }
      
      const body: Record<string, unknown> = {
        operation,
        expression: expression.trim(),
        variable: variable.trim() || 'x',
      };
      
      if (operation === 'integrate') {
        body.lower = parseFloat(lower);
        body.upper = parseFloat(upper);
      }
      
      if (operation === 'evaluate' && Object.keys(scopeObj).length > 0) {
        body.scope = scopeObj;
      }
      
      const res = await fetch('/api/math', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      
      const data = await res.json();
      
      if (!res.ok || data.error) {
        setError(data.error || 'Computation failed');
        return;
      }
      
      const computeResult: ComputeResult = {
        input: expression.trim(),
        output: data.output,
        latex: data.latex,
        method: data.method,
        verified: data.verified,
        error: data.error,
      };
      
      setResult(computeResult);
      setHistory(prev => [computeResult, ...prev.slice(0, 9)]);
      
    } catch (err) {
      setError('Failed to connect to computation engine');
    } finally {
      setLoading(false);
    }
  };

  const operations: { id: OperationType; label: string; hint: string }[] = [
    { id: 'evaluate', label: 'Evaluate', hint: 'e.g. 2^10, sin(pi/6)' },
    { id: 'simplify', label: 'Simplify', hint: 'e.g. x^2 + 2x + 1' },
    { id: 'differentiate', label: "d/dx", hint: 'e.g. sin(x)*cos(x)' },
    { id: 'integrate', label: '∫ dx', hint: 'e.g. x^2 + 3x' },
  ];

  return (
    <HoloPanel>
      <div className="flex items-center gap-2 mb-4">
        <Calculator className="w-4 h-4 text-cyan-400" />
        <h3 className="text-cyan-400 font-semibold text-sm tracking-wider uppercase">
          Quick Compute
        </h3>
        <span className="ml-auto text-xs text-emerald-400/70 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
          math.js verified
        </span>
      </div>

      {/* Operation tabs */}
      <div className="grid grid-cols-4 gap-1 mb-4 bg-slate-800/40 rounded-lg p-1">
        {operations.map(op => (
          <button
            key={op.id}
            onClick={() => setOperation(op.id)}
            className={`px-2 py-2 text-xs rounded-md transition-all font-mono ${
              operation === op.id
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {op.label}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="space-y-3">
        <div>
          <input
            type="text"
            value={expression}
            onChange={e => setExpression(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') compute(); }}
            placeholder={operations.find(o => o.id === operation)?.hint}
            className="w-full bg-slate-800/60 border border-slate-600/40 rounded-lg px-4 py-2.5 text-sm font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 transition-all"
            aria-label="Mathematical expression"
          />
        </div>
        
        {/* Variable and scope for evaluate */}
        {(operation === 'differentiate' || operation === 'integrate') && (
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs text-slate-400 block mb-1">Variable</label>
              <input
                type="text"
                value={variable}
                onChange={e => setVariable(e.target.value)}
                className="w-full bg-slate-800/60 border border-slate-600/40 rounded-lg px-3 py-2 text-sm font-mono text-slate-200 focus:outline-none focus:border-cyan-500/50"
                maxLength={2}
              />
            </div>
            {operation === 'integrate' && (
              <>
                <div className="flex-1">
                  <label className="text-xs text-slate-400 block mb-1">Lower bound</label>
                  <input
                    type="number"
                    value={lower}
                    onChange={e => setLower(e.target.value)}
                    className="w-full bg-slate-800/60 border border-slate-600/40 rounded-lg px-3 py-2 text-sm font-mono text-slate-200 focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-slate-400 block mb-1">Upper bound</label>
                  <input
                    type="number"
                    value={upper}
                    onChange={e => setUpper(e.target.value)}
                    className="w-full bg-slate-800/60 border border-slate-600/40 rounded-lg px-3 py-2 text-sm font-mono text-slate-200 focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
              </>
            )}
          </div>
        )}
        
        {operation === 'evaluate' && (
          <div>
            <label className="text-xs text-slate-400 block mb-1">Variable values (optional) e.g. x=2, y=3</label>
            <input
              type="text"
              value={scope}
              onChange={e => setScope(e.target.value)}
              placeholder="x=2, y=3"
              className="w-full bg-slate-800/60 border border-slate-600/40 rounded-lg px-3 py-2 text-sm font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
            />
          </div>
        )}
        
        <HoloButton 
          onClick={compute} 
          loading={loading} 
          disabled={!expression.trim()}
          className="w-full"
        >
          {loading ? 'Computing...' : 'Compute'}
        </HoloButton>
      </div>

      {/* Result */}
      {loading && (
        <div className="mt-4 flex justify-center">
          <LoadingDots label="Computing..." />
        </div>
      )}
      
      {error && (
        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}
      
      {result && !loading && (
        <div className="mt-4 p-4 bg-slate-800/40 border border-cyan-500/20 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-slate-400 font-mono">{result.input}</span>
            <span className="text-xs text-slate-600">=</span>
            {result.verified && (
              <span className="ml-auto text-xs text-emerald-400 flex items-center gap-1">
                ✓ verified
              </span>
            )}
          </div>
          
          {result.error ? (
            <p className="text-red-400 text-sm">{result.error}</p>
          ) : (
            <>
              <div className="text-lg font-mono text-cyan-300 mb-2">{result.output}</div>
              {result.latex && (
                <div className="border-t border-slate-700/30 pt-2 mt-2">
                  <MathRenderer content={`$$${result.latex}$$`} />
                </div>
              )}
              <p className="text-xs text-slate-500 mt-2">Method: {result.method}</p>
            </>
          )}
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div className="mt-4">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-2 text-xs text-slate-400 hover:text-slate-200 transition-colors w-full"
          >
            {showHistory ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            History ({history.length})
          </button>
          
          {showHistory && (
            <div className="mt-2 space-y-1 max-h-48 overflow-y-auto">
              {history.map((h, i) => (
                <button
                  key={i}
                  onClick={() => setExpression(h.input)}
                  className="w-full text-left flex items-center gap-2 px-3 py-2 rounded bg-slate-800/30 hover:bg-slate-800/60 transition-all text-xs"
                >
                  <span className="font-mono text-slate-400 truncate">{h.input}</span>
                  <span className="text-slate-600 mx-1">=</span>
                  <span className="font-mono text-cyan-400/80 truncate">{h.output || h.error}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </HoloPanel>
  );
}
