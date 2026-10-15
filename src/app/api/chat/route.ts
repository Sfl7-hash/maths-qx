import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { buildSystemPrompt, buildComputationPrompt, buildFollowUpPrompt } from '@/lib/mathPrompts';
import { tryComputeFromQuestion, detectMathCategory } from '@/lib/mathEngine';
import { MathAPIRequest, MathAPIResponse, MathCategory } from '@/types';

// Initialize OpenAI client — key must be set as OPENAI_API_KEY env variable
const getOpenAIClient = () => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new OpenAI({ apiKey });
};

export async function POST(req: NextRequest) {
  try {
    const body: MathAPIRequest = await req.json();
    
    if (!body.question || typeof body.question !== 'string') {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 });
    }
    
    const question = body.question.trim().slice(0, 2000);
    const level = body.level || 'high_school';
    const language = body.language || 'en';
    
    // Detect category
    const category = detectMathCategory(question) as MathCategory;
    
    // Try local computation first (fast, verified)
    const computation = await tryComputeFromQuestion(question);
    
    // Check if OpenAI key is available
    const openai = getOpenAIClient();
    
    if (!openai) {
      // No API key — use intelligent fallback mode
      const fallbackResponse = generateFallbackResponse(question, category, computation);
      return NextResponse.json({
        ...fallbackResponse,
        computation: computation || undefined,
        category,
        followUpSuggestions: buildFollowUpPrompt(question, category),
      } as MathAPIResponse);
    }
    
    // Build messages for OpenAI
    const systemPrompt = buildSystemPrompt(level, language);
    const userMessage = buildComputationPrompt(
      question,
      computation ? `${computation.output} (${computation.method})` : undefined,
      category
    );
    
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
    ];
    
    // Add conversation history (last 8 messages)
    if (body.conversationHistory && body.conversationHistory.length > 0) {
      const history = body.conversationHistory.slice(-8);
      for (const msg of history) {
        if (msg.role === 'user' || msg.role === 'assistant') {
          messages.push({ role: msg.role, content: msg.content });
        }
      }
    }
    
    messages.push({ role: 'user', content: userMessage });
    
    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      max_tokens: 2048,
      temperature: 0.2,
    });
    
    const answer = completion.choices[0]?.message?.content || 'I was unable to generate a response.';
    
    // Extract graph config from the question if needed
    const graph = body.includeGraph ? extractGraphConfig(question, category) : undefined;
    
    const response: MathAPIResponse = {
      answer,
      computation: computation || undefined,
      category,
      level,
      graph,
      followUpSuggestions: buildFollowUpPrompt(question, category),
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('[MATHESIS API Error]', error);
    
    if (error instanceof OpenAI.APIError) {
      if (error.status === 429) {
        return NextResponse.json({ error: 'Rate limit reached. Please try again in a moment.' }, { status: 429 });
      }
      if (error.status === 401) {
        return NextResponse.json({ error: 'AI service authentication error. Please check your API key.' }, { status: 401 });
      }
    }
    
    return NextResponse.json({ 
      error: 'An error occurred processing your request. Please try again.' 
    }, { status: 500 });
  }
}

/**
 * Intelligent fallback mode when no OpenAI key is configured.
 * Uses math.js computation results + structured template responses.
 */
function generateFallbackResponse(
  question: string,
  category: MathCategory,
  computation: Awaited<ReturnType<typeof tryComputeFromQuestion>>
): Partial<MathAPIResponse> {
  const categoryResponses: Record<string, string> = {
    calculus: `## Calculus Solution

I can help with this calculus problem. ${computation ? `**Computed result:** ${computation.output}` : ''}

For calculus problems, I'll walk through the fundamental theorems and rules:

**Key Calculus Rules:**
- **Power Rule:** $\\frac{d}{dx}[x^n] = nx^{n-1}$
- **Product Rule:** $\\frac{d}{dx}[uv] = u'v + uv'$
- **Chain Rule:** $\\frac{d}{dx}[f(g(x))] = f'(g(x)) \\cdot g'(x)$
- **Fundamental Theorem:** $\\int_a^b f(x)\\,dx = F(b) - F(a)$

To get the full step-by-step solution with AI explanation, please configure your OpenAI API key in the \`.env.local\` file:
\`\`\`
OPENAI_API_KEY=your-key-here
\`\`\``,

    algebra: `## Algebra Solution

${computation ? `**Computed result:** ${computation.output}\n\n` : ''}**Algebraic Methods:**
- **Linear equations:** $ax + b = c \\Rightarrow x = \\frac{c-b}{a}$
- **Quadratic formula:** $x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$
- **Factoring:** Look for common factors, difference of squares, or perfect squares

Configure your OpenAI API key for full AI-powered step-by-step explanations.`,

    geometry: `## Geometry Solution

**Key Formulas:**
- **Circle:** $A = \\pi r^2$, $C = 2\\pi r$
- **Triangle:** $A = \\frac{1}{2}bh$, Pythagorean: $a^2 + b^2 = c^2$
- **Rectangle:** $A = lw$, $P = 2(l+w)$

${computation ? `**Computed:** ${computation.output}` : 'Configure your OpenAI API key for full AI-powered solutions.'}`,

    trigonometry: `## Trigonometry Solution

**Fundamental Identities:**
- $\\sin^2\\theta + \\cos^2\\theta = 1$
- $\\tan\\theta = \\frac{\\sin\\theta}{\\cos\\theta}$
- $\\sin(2\\theta) = 2\\sin\\theta\\cos\\theta$

${computation ? `**Computed:** ${computation.output}` : 'Configure your OpenAI API key for full AI-powered solutions.'}`,

    statistics: `## Statistics Solution

**Key Formulas:**
- **Mean:** $\\bar{x} = \\frac{\\sum x_i}{n}$
- **Variance:** $\\sigma^2 = \\frac{\\sum(x_i - \\bar{x})^2}{n}$
- **Standard deviation:** $\\sigma = \\sqrt{\\sigma^2}$

${computation ? `**Computed:** ${computation.output}` : 'Configure your OpenAI API key for full AI-powered solutions.'}`,

    matrices: `## Matrix Solution

**Matrix Operations:**
- **Determinant 2×2:** $\\det\\begin{pmatrix}a&b\\\\c&d\\end{pmatrix} = ad - bc$
- **Inverse 2×2:** $A^{-1} = \\frac{1}{\\det(A)}\\begin{pmatrix}d&-b\\\\-c&a\\end{pmatrix}$

${computation ? `**Computed:** ${computation.output}` : 'Configure your OpenAI API key for full AI-powered solutions.'}`,
  };

  const answer = categoryResponses[category] || `## Mathematics Response

Your question: *"${question}"*

${computation ? `**Direct computation result:** ${computation.output} *(verified by math.js)*` : ''}

I can perform direct mathematical computations (try expressions like "simplify x^2 + 2x + 1" or "derivative of sin(x)").

For full AI-powered step-by-step explanations across all topics, please add your OpenAI API key:

\`\`\`bash
# Create .env.local in the mathesis directory
OPENAI_API_KEY=sk-your-key-here
\`\`\`

The interactive graph visualizer and computation engine work without an API key.`;

  return { answer };
}

/**
 * Extract a graph configuration from the question.
 */
function extractGraphConfig(question: string, category: MathCategory) {
  const q = question.toLowerCase();
  
  // Try to extract expressions for graphing
  const graphPatterns = [
    /graph(?:\s+of)?\s+([\w\s\+\-\*\/\^\(\)]+)/i,
    /plot\s+([\w\s\+\-\*\/\^\(\)]+)/i,
    /visualize\s+([\w\s\+\-\*\/\^\(\)]+)/i,
    /f\(x\)\s*=\s*([\w\s\+\-\*\/\^\(\)]+)/i,
  ];
  
  for (const pattern of graphPatterns) {
    const match = question.match(pattern);
    if (match) {
      return {
        type: 'function' as const,
        expressions: [match[1].trim()],
        xRange: [-10, 10] as [number, number],
        title: `Graph: ${match[1].trim()}`,
      };
    }
  }
  
  // Category-based default graphs
  if (category === 'trigonometry' && /sin|cos|tan/.test(q)) {
    const func = q.includes('cos') ? 'cos(x)' : q.includes('tan') ? 'tan(x)' : 'sin(x)';
    return {
      type: 'function' as const,
      expressions: [func],
      xRange: [-6.28, 6.28] as [number, number],
      title: `Graph: ${func}`,
    };
  }
  
  return undefined;
}
