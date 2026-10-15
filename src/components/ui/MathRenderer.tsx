'use client';
import { useEffect, useRef } from 'react';

interface MathRendererProps {
  content: string;
  className?: string;
  inline?: boolean;
}

/**
 * Renders mathematical content with KaTeX, falling back to plain text.
 * Handles both inline ($...$) and display ($$...$$) LaTeX.
 */
export default function MathRenderer({ content, className = '', inline = false }: MathRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const renderMath = async () => {
      try {
        const katex = await import('katex');
        const container = containerRef.current!;

        if (inline) {
          // Single inline expression
          const cleaned = content.replace(/^\$+|\$+$/g, '');
          container.innerHTML = katex.default.renderToString(cleaned, {
            throwOnError: false,
            displayMode: false,
            output: 'html',
            trust: false,
          });
        } else {
          // Process mixed content with both inline and display math
          let html = escapeHtml(content);
          
          // Replace display math $$...$$
          html = html.replace(/\$\$([\s\S]+?)\$\$/g, (_, math) => {
            try {
              return '<div class="katex-display-wrapper">' + 
                katex.default.renderToString(unescapeHtml(math), {
                  throwOnError: false,
                  displayMode: true,
                  output: 'html',
                  trust: false,
                }) + '</div>';
            } catch {
              return `<code class="math-fallback">$$${math}$$</code>`;
            }
          });
          
          // Replace inline math $...$
          html = html.replace(/\$([^\n$]+?)\$/g, (_, math) => {
            try {
              return katex.default.renderToString(unescapeHtml(math), {
                throwOnError: false,
                displayMode: false,
                output: 'html',
                trust: false,
              });
            } catch {
              return `<code class="math-fallback">$${math}$</code>`;
            }
          });
          
          // Convert markdown-like formatting
          html = html
            .replace(/^### (.+)$/gm, '<h3>$1</h3>')
            .replace(/^## (.+)$/gm, '<h2>$1</h2>')
            .replace(/^# (.+)$/gm, '<h1>$1</h1>')
            .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
            .replace(/\*([^*]+)\*/g, '<em>$1</em>')
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            .replace(/^(\d+)\.\s(.+)$/gm, '<div class="step-box"><span class="step-num">$1.</span> $2</div>')
            .replace(/^[-•]\s(.+)$/gm, '<li>$1</li>')
            .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br/>');
          
          html = `<p>${html}</p>`;
          container.innerHTML = html;
        }
      } catch (err) {
        if (containerRef.current) {
          containerRef.current.textContent = content;
        }
      }
    };

    renderMath();
  }, [content, inline]);

  return (
    <div 
      ref={containerRef} 
      className={`math-prose ${className}`}
      aria-label="Mathematical content"
    />
  );
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function unescapeHtml(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"');
}
