'use client';
import { useState, Suspense, lazy } from 'react';
import Header from '@/components/layout/Header';
import HolographicBackground from '@/components/layout/HolographicBackground';
import MathChat from '@/components/tutor/MathChat';
import QuickCompute from '@/components/tutor/QuickCompute';
import HoloPanel from '@/components/ui/HoloPanel';

// Lazy-load heavy visualization components
const FunctionGraph = lazy(() => import('@/components/visualizations/FunctionGraph'));
const GeometryCanvas = lazy(() => import('@/components/visualizations/GeometryCanvas'));
const MatrixCalculator = lazy(() => import('@/components/visualizations/MatrixCalculator'));

function TabSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-64 bg-slate-800/40 rounded-xl" />
    </div>
  );
}

export default function Home() {
  const [activeTab, setActiveTab] = useState('tutor');

  return (
    <div className="min-h-screen bg-[#020817] relative">
      {/* Animated holographic background */}
      <HolographicBackground />
      
      {/* Header */}
      <Header activeTab={activeTab} onTabChange={setActiveTab} />
      
      {/* Main content */}
      <main className="relative z-10 pt-20 pb-8 px-4 max-w-7xl mx-auto" id="main-content">
        
        {/* Hero strip — only on tutor tab */}
        {activeTab === 'tutor' && (
          <div className="mb-6 text-center">
            <p className="text-slate-400 text-sm">
              AI-powered mathematics · Step-by-step solutions · Interactive visualizations
            </p>
          </div>
        )}

        {/* TAB: AI Tutor */}
        {activeTab === 'tutor' && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 h-[calc(100vh-140px)]">
            {/* Main chat - takes 2 columns */}
            <div className="xl:col-span-2 h-full flex flex-col min-h-0">
              <MathChat />
            </div>
            
            {/* Right sidebar */}
            <div className="flex flex-col gap-4 overflow-y-auto">
              <QuickCompute />
              
              {/* Math reference card */}
              <HoloPanel variant="violet">
                <h3 className="text-violet-400 text-xs font-semibold uppercase tracking-wider mb-3">
                  Quick Reference
                </h3>
                <div className="space-y-2 text-xs">
                  {[
                    { label: 'Pythagorean', latex: 'a² + b² = c²' },
                    { label: 'Quadratic', latex: 'x = (-b ± √(b²-4ac)) / 2a' },
                    { label: 'Circle area', latex: 'A = πr²' },
                    { label: 'Derivative power', latex: 'd/dx[xⁿ] = nxⁿ⁻¹' },
                    { label: "Euler's identity", latex: 'eⁱᵖ + 1 = 0' },
                    { label: 'Normal dist.', latex: 'f(x) = (1/σ√2π)e^(-½((x-μ)/σ)²)' },
                  ].map(item => (
                    <div key={item.label} className="flex flex-col gap-0.5 p-2 rounded bg-slate-800/30">
                      <span className="text-slate-500">{item.label}</span>
                      <code className="text-violet-300/80 font-mono text-xs">{item.latex}</code>
                    </div>
                  ))}
                </div>
              </HoloPanel>
              
              {/* Topics */}
              <HoloPanel>
                <h3 className="text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-3">
                  Ask About
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Algebra', 'Calculus', 'Geometry', 'Trigonometry',
                    'Statistics', 'Matrices', 'Probability', 'Number Theory',
                    'Linear Algebra', 'ODEs', 'Proofs', 'Word Problems'
                  ].map(topic => (
                    <span 
                      key={topic}
                      className="px-2 py-0.5 text-xs rounded-full bg-slate-800/40 border border-slate-700/40 text-slate-400"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </HoloPanel>
            </div>
          </div>
        )}

        {/* TAB: Graph Visualizer */}
        {activeTab === 'graph' && (
          <div className="max-w-4xl mx-auto">
            <div className="mb-5">
              <h2 className="text-xl font-semibold text-white mb-1" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                Function <span className="text-cyan-400">Graph</span> Visualizer
              </h2>
              <p className="text-slate-400 text-sm">
                Plot functions, explore derivatives, and visualize mathematical behavior interactively.
              </p>
            </div>
            <Suspense fallback={<TabSkeleton />}>
              <FunctionGraph />
            </Suspense>
          </div>
        )}

        {/* TAB: Geometry Explorer */}
        {activeTab === 'geometry' && (
          <div className="max-w-3xl mx-auto">
            <div className="mb-5">
              <h2 className="text-xl font-semibold text-white mb-1" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                Geometry <span className="text-violet-400">Explorer</span>
              </h2>
              <p className="text-slate-400 text-sm">
                Manipulate geometric shapes and observe measurements, areas, and properties in real time.
              </p>
            </div>
            <Suspense fallback={<TabSkeleton />}>
              <GeometryCanvas />
            </Suspense>
          </div>
        )}

        {/* TAB: Matrix Calculator */}
        {activeTab === 'matrix' && (
          <div className="max-w-3xl mx-auto">
            <div className="mb-5">
              <h2 className="text-xl font-semibold text-white mb-1" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                Matrix <span className="text-cyan-400">Calculator</span>
              </h2>
              <p className="text-slate-400 text-sm">
                Perform matrix operations — multiply, add, find determinants, inverses, and transposes.
              </p>
            </div>
            <Suspense fallback={<TabSkeleton />}>
              <MatrixCalculator />
            </Suspense>
          </div>
        )}

        {/* TAB: Quick Compute */}
        {activeTab === 'compute' && (
          <div className="max-w-2xl mx-auto">
            <div className="mb-5">
              <h2 className="text-xl font-semibold text-white mb-1" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                Quick <span className="text-cyan-400">Compute</span>
              </h2>
              <p className="text-slate-400 text-sm">
                Evaluate expressions, simplify algebra, differentiate, and integrate — verified by math.js.
              </p>
            </div>
            <QuickCompute />
          </div>
        )}
        
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800/50 py-4 px-4 text-center text-xs text-slate-500">
        <span style={{ fontFamily: 'Orbitron, sans-serif' }} className="text-cyan-500/60">MATHESIS</span>
        {' '}— AI-Powered Holographic Mathematics Platform · 
        Computations verified by <a href="https://mathjs.org" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-cyan-400 transition-colors">math.js</a> · 
        AI by <a href="https://openai.com" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-cyan-400 transition-colors">OpenAI</a>
      </footer>
    </div>
  );
}
