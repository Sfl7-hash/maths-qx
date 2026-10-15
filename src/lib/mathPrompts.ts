import { MathLevel, MathCategory } from '@/types';

/**
 * Build the system prompt for the AI math tutor.
 */
export function buildSystemPrompt(level: MathLevel = 'high_school', language: string = 'en'): string {
  const levelDescriptions: Record<MathLevel, string> = {
    primary: 'a primary school student (ages 6-10). Use very simple language, basic arithmetic, shapes, and avoid complex symbols.',
    middle: 'a middle school student (ages 11-14). Cover pre-algebra, basic geometry, fractions, percentages.',
    high_school: 'a high school student (ages 15-18). Cover algebra, trigonometry, basic calculus, statistics.',
    university: 'a university student. Cover advanced calculus, linear algebra, differential equations, complex analysis.',
    advanced: 'an advanced mathematician or researcher. Use rigorous notation, proofs, and advanced theory.',
  };

  const languageInstructions = language !== 'en' 
    ? `IMPORTANT: Respond in ${getLanguageName(language)}. All explanations must be in that language.` 
    : '';

  return `You are MATHESIS, an expert AI mathematics tutor for ${levelDescriptions[level]}

${languageInstructions}

## YOUR MISSION
Provide accurate, step-by-step mathematical solutions with genuine mathematical intelligence. Never fabricate results or present unverified answers as correct.

## RESPONSE FORMAT
Structure all mathematical answers clearly:

1. **Understanding**: Briefly restate what was asked.
2. **Core Formula/Theorem**: State the key formula or theorem being applied (with LaTeX).
3. **Step-by-Step Solution**: Number each step. Show all work. Use LaTeX for math notation.
4. **Verification**: When possible, verify the answer by checking or substituting back.
5. **Explanation**: Explain the concept behind the method in plain language.
6. **Example** (if helpful): Provide a related example to reinforce understanding.

## LATEX FORMATTING RULES
- Use $...$ for inline math: e.g., $x^2 + 3x = 10$
- Use $$...$$  for displayed equations (on their own line)
- Always format equations properly
- Use \\frac{a}{b} for fractions
- Use \\sqrt{x} for square roots
- Use \\int, \\sum, \\lim for calculus notation
- Use \\vec{v}, \\mathbf{A} for vectors and matrices

## ACCURACY RULES
- Never invent a mathematical fact
- If you are uncertain, say so clearly
- If a computation is approximate, label it as approximate
- Do not claim numerical precision beyond what is warranted
- For complex proofs, cite the theorem name

## TOPICS YOU COVER
- Primary: Arithmetic, basic shapes, fractions, simple word problems
- Middle: Pre-algebra, geometry, ratios, percentages, basic statistics
- High school: Algebra I & II, trigonometry, precalculus, statistics
- University: Single/multivariable calculus, linear algebra, ODEs, probability theory
- Advanced: Real/complex analysis, abstract algebra, topology, differential geometry

## VISUALIZATION GUIDANCE
When a graph would help, describe it. When explaining geometry, draw with ASCII or describe clearly.

Always be encouraging, precise, and honest about the limits of your knowledge.`;
}

/**
 * Build a prompt for a specific math computation request.
 */
export function buildComputationPrompt(
  question: string,
  computationResult?: string,
  category?: MathCategory
): string {
  const categoryHint = category ? `This appears to be a ${category} problem. ` : '';
  const computationHint = computationResult 
    ? `\n\nCOMPUTATION RESULT (verified by math.js): ${computationResult}\nUse this verified result in your explanation.`
    : '';
  
  return `${categoryHint}${question}${computationHint}`;
}

/**
 * Generate follow-up question suggestions.
 */
export function buildFollowUpPrompt(topic: string, category: MathCategory): string[] {
  const suggestions: Record<MathCategory, string[]> = {
    algebra: [
      'Can you show me a harder version of this?',
      'What are the real-world applications?',
      'How do I factor this differently?',
      'Can you explain the quadratic formula?',
    ],
    calculus: [
      'What is the geometric meaning of this derivative?',
      'Can you show the integration by parts method?',
      'How do I find critical points?',
      'What is the area under this curve?',
    ],
    geometry: [
      'What is the proof for this theorem?',
      'How does this work in 3D?',
      'What are the coordinates of the vertices?',
      'Can you show similar triangles?',
    ],
    trigonometry: [
      'How do I remember the unit circle?',
      'What is the inverse of this function?',
      'Can you derive this identity?',
      'How is this used in physics?',
    ],
    statistics: [
      'What does the standard deviation tell us?',
      'How do I calculate a confidence interval?',
      'What is the Central Limit Theorem?',
      'Can you explain p-values?',
    ],
    probability: [
      'What is conditional probability?',
      'How is this related to Bayes theorem?',
      'Can you simulate this?',
      'What is the expected value?',
    ],
    matrices: [
      'How do I find the inverse of this matrix?',
      'What are eigenvalues used for?',
      'Can you show Gaussian elimination?',
      'What is the rank of this matrix?',
    ],
    functions: [
      'What is the domain and range?',
      'How do I find the inverse function?',
      'Can you sketch this graph?',
      'What are the asymptotes?',
    ],
    number_theory: [
      'What is the prime factorization?',
      'How does modular arithmetic work?',
      'Can you prove this property?',
      'What is the GCD?',
    ],
    differential_equations: [
      'What is the general solution?',
      'How do initial conditions affect this?',
      'What is the physical interpretation?',
      'Can you use separation of variables?',
    ],
    linear_algebra: [
      'What is the null space?',
      'How do I find the basis?',
      'What does orthogonality mean here?',
      'Can you explain LU decomposition?',
    ],
    general: [
      'Can you show a simpler example?',
      'What are the prerequisites for this topic?',
      'Can you give me a practice problem?',
      'What is the real-world application?',
    ],
  };
  
  return suggestions[category] || suggestions.general;
}

function getLanguageName(code: string): string {
  const languages: Record<string, string> = {
    en: 'English',
    es: 'Spanish',
    fr: 'French',
    de: 'German',
    pt: 'Portuguese',
    ar: 'Arabic',
    zh: 'Chinese',
    hi: 'Hindi',
    ru: 'Russian',
    ja: 'Japanese',
  };
  return languages[code] || code;
}
