'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, RefreshCw, Lightbulb, BookOpen, Calculator } from 'lucide-react';
import { ChatMessage, MathAPIResponse, MathLevel } from '@/types';
import HoloPanel from '@/components/ui/HoloPanel';
import HoloButton from '@/components/ui/HoloButton';
import LoadingDots from '@/components/ui/LoadingDots';
import MathRenderer from '@/components/ui/MathRenderer';
import FunctionGraph from '@/components/visualizations/FunctionGraph';

const LEVEL_LABELS: Record<MathLevel, string> = {
  primary: '🌱 Primary',
  middle: '📐 Middle',
  high_school: '🎓 High School',
  university: '🔬 University',
  advanced: '⚗️ Advanced',
};

const EXAMPLE_QUESTIONS = [
  "What is the quadratic formula and how do I use it?",
  "Explain the Pythagorean theorem with proof",
  "How do I find the derivative of sin(x)cos(x)?",
  "What is the determinant of a 3×3 matrix?",
  "Explain the Central Limit Theorem",
  "Solve: 2x² + 5x - 3 = 0",
  "What is Euler's identity and why is it beautiful?",
  "How do I integrate x·e^x by parts?",
  "What are eigenvalues and eigenvectors?",
  "Explain probability with the Monty Hall problem",
];

export default function MathChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [level, setLevel] = useState<MathLevel>('high_school');
  const [language, setLanguage] = useState('en');
  const [showExamples, setShowExamples] = useState(true);
  const [activeGraph, setActiveGraph] = useState<{ expression: string; range?: [number, number] } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = useCallback(async (question: string) => {
    if (!question.trim() || loading) return;
    
    setShowExamples(false);
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: question.trim(),
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    
    // Placeholder assistant message for streaming UX feel
    const assistantId = `assistant-${Date.now()}`;
    setMessages(prev => [...prev, {
      id: assistantId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true,
    }]);
    
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: question.trim(),
          level,
          language,
          conversationHistory: messages.slice(-6).map(m => ({
            id: m.id,
            role: m.role,
            content: m.content,
            timestamp: m.timestamp,
          })),
          includeGraph: true,
        }),
      });
      
      const data: MathAPIResponse = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Request failed');
      }
      
      // Update the streaming message with actual content
      setMessages(prev => prev.map(msg =>
        msg.id === assistantId
          ? {
              ...msg,
              content: data.answer,
              isStreaming: false,
              mathContent: {
                graph: data.graph,
                computation: data.computation,
                category: data.category,
                level: data.level,
              },
            }
          : msg
      ));
      
      // If graph data returned, show it
      if (data.graph && data.graph.expressions.length > 0) {
        setActiveGraph({
          expression: data.graph.expressions[0],
          range: data.graph.xRange,
        });
      }
      
    } catch (err) {
      setMessages(prev => prev.map(msg =>
        msg.id === assistantId
          ? {
              ...msg,
              content: `**Error:** ${err instanceof Error ? err.message : 'Failed to get response'}. Please check your connection and try again.`,
              isStreaming: false,
            }
          : msg
      ));
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }, [loading, level, language, messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setShowExamples(true);
    setActiveGraph(null);
  };

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Controls bar */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-slate-400" />
          <select
            value={level}
            onChange={e => setLevel(e.target.value as MathLevel)}
            className="bg-slate-800/60 border border-slate-600/40 rounded-lg px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/50 cursor-pointer"
            aria-label="Education level"
          >
            {(Object.entries(LEVEL_LABELS) as [MathLevel, string][]).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">🌐</span>
          <select
            value={language}
            onChange={e => setLanguage(e.target.value)}
            className="bg-slate-800/60 border border-slate-600/40 rounded-lg px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/50 cursor-pointer"
            aria-label="Response language"
          >
            <option value="en">English</option>
            <option value="es">Español</option>
            <option value="fr">Français</option>
            <option value="de">Deutsch</option>
            <option value="pt">Português</option>
            <option value="ar">العربية</option>
            <option value="zh">中文</option>
            <option value="hi">हिंदी</option>
          </select>
        </div>
        
        {messages.length > 0 && (
          <HoloButton variant="ghost" size="sm" onClick={clearChat} className="ml-auto">
            <RefreshCw className="w-3.5 h-3.5" />
            Clear
          </HoloButton>
        )}
      </div>

      {/* Messages area */}
      <HoloPanel noPadding className="flex-1 flex flex-col overflow-hidden min-h-0">
        <div className="flex-1 overflow-y-auto p-4 space-y-4" role="log" aria-live="polite" aria-label="Conversation">
          
          {/* Welcome / examples */}
          {showExamples && messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full py-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20 border border-cyan-500/20 flex items-center justify-center mb-4">
                <span className="text-3xl" role="img" aria-label="MATHESIS">∑</span>
              </div>
              <h2 className="text-xl font-semibold text-white mb-2" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                MATHESIS
              </h2>
              <p className="text-slate-400 text-sm mb-6 max-w-sm">
                Ask any mathematics question. I provide step-by-step solutions, verified computations, and interactive visualizations.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-xl">
                {EXAMPLE_QUESTIONS.slice(0, 6).map((q, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(q)}
                    className="text-left px-3 py-2 rounded-lg bg-slate-800/40 border border-slate-700/40 hover:border-cyan-500/40 hover:bg-slate-800/60 text-xs text-slate-300 hover:text-cyan-300 transition-all"
                  >
                    <Lightbulb className="w-3 h-3 inline mr-1.5 text-yellow-400/60" />
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                msg.role === 'user' 
                  ? 'bg-gradient-to-br from-cyan-500/30 to-blue-500/30 border border-cyan-500/40 text-cyan-300'
                  : 'bg-gradient-to-br from-violet-500/30 to-pink-500/30 border border-violet-500/40 text-violet-300'
              }`}
                aria-hidden="true"
              >
                {msg.role === 'user' ? '👤' : '∑'}
              </div>
              
              {/* Bubble */}
              <div className={`flex-1 max-w-2xl ${msg.role === 'user' ? 'flex justify-end' : ''}`}>
                <div className={`rounded-xl p-4 ${
                  msg.role === 'user'
                    ? 'bg-cyan-500/10 border border-cyan-500/20 text-slate-200 text-sm'
                    : 'bg-slate-800/50 border border-slate-700/30'
                }`}>
                  {msg.role === 'user' ? (
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                  ) : msg.isStreaming ? (
                    <LoadingDots label="Thinking..." />
                  ) : (
                    <>
                      <MathRenderer content={msg.content} />
                      
                      {/* Computation result badge */}
                      {msg.mathContent?.computation?.verified && (
                        <div className="mt-3 flex items-center gap-2 text-xs text-emerald-400">
                          <Calculator className="w-3.5 h-3.5" />
                          <span>Computed: <code className="font-mono bg-emerald-500/10 px-1 rounded">{msg.mathContent.computation.output}</code></span>
                          <span className="text-slate-500">via {msg.mathContent.computation.method}</span>
                        </div>
                      )}
                      
                      {/* Category badge */}
                      {msg.mathContent?.category && (
                        <div className="mt-2">
                          <span className="inline-block px-2 py-0.5 text-xs rounded-full bg-slate-700/50 text-slate-400 border border-slate-600/30 capitalize">
                            {msg.mathContent.category.replace('_', ' ')}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="border-t border-slate-700/30 p-4">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask a mathematics question... (Enter to send, Shift+Enter for new line)"
                rows={1}
                disabled={loading}
                className="w-full bg-slate-800/60 border border-slate-600/40 rounded-xl px-4 py-3 pr-12 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:bg-slate-800/80 transition-all resize-none disabled:opacity-50"
                style={{ minHeight: '48px', maxHeight: '160px' }}
                onInput={e => {
                  const t = e.target as HTMLTextAreaElement;
                  t.style.height = 'auto';
                  t.style.height = Math.min(t.scrollHeight, 160) + 'px';
                }}
                aria-label="Mathematics question input"
              />
            </div>
            <HoloButton
              type="submit"
              disabled={!input.trim() || loading}
              loading={loading}
              glow
              className="self-end"
            >
              <Send className="w-4 h-4" />
            </HoloButton>
          </form>
          <p className="text-xs text-slate-500 mt-2 text-center">
            Verified computations powered by math.js · AI explanations by OpenAI
          </p>
        </div>
      </HoloPanel>
      
      {/* Auto-show graph if detected */}
      {activeGraph && (
        <div className="animate-fade-in-up">
          <FunctionGraph 
            initialExpression={activeGraph.expression}
            initialRange={activeGraph.range}
          />
        </div>
      )}
    </div>
  );
}
