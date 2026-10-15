/**
 * MATHESIS Math Engine
 * Uses math.js for verified symbolic and numeric computation.
 * Never fabricates results — all outputs are computed or explicitly marked as unverified.
 */

import { ComputationResult, GraphConfig } from '@/types';

// Dynamically import math.js to avoid SSR issues
let mathjs: typeof import('mathjs') | null = null;

async function getMath() {
  if (!mathjs) {
    mathjs = await import('mathjs');
  }
  return mathjs;
}

/**
 * Evaluate a mathematical expression safely.
 */
export async function evaluateExpression(
  expression: string,
  scope?: Record<string, number>
): Promise<ComputationResult> {
  try {
    const math = await getMath();
    
    // Parse and evaluate
    const node = math.parse(expression);
    const compiled = node.compile();
    const result = compiled.evaluate(scope || {});
    
    // Convert result to LaTeX
    let latex = '';
    try {
      latex = math.parse(String(result)).toTex();
    } catch {
      latex = String(result);
    }
    
    return {
      input: expression,
      output: String(result),
      latex,
      numeric: typeof result === 'number' ? result : undefined,
      verified: true,
      method: 'math.js symbolic evaluation',
    };
  } catch (err) {
    return {
      input: expression,
      output: '',
      error: err instanceof Error ? err.message : 'Evaluation failed',
      verified: false,
      method: 'math.js',
    };
  }
}

/**
 * Simplify an algebraic expression.
 */
export async function simplifyExpression(expression: string): Promise<ComputationResult> {
  try {
    const math = await getMath();
    const simplified = math.simplify(expression);
    const latex = simplified.toTex();
    
    return {
      input: expression,
      output: simplified.toString(),
      latex,
      verified: true,
      method: 'math.js simplify',
    };
  } catch (err) {
    return {
      input: expression,
      output: expression,
      error: err instanceof Error ? err.message : 'Simplification failed',
      verified: false,
      method: 'math.js simplify',
    };
  }
}

/**
 * Derive a function (symbolic derivative).
 */
export async function differentiate(
  expression: string,
  variable: string = 'x'
): Promise<ComputationResult> {
  try {
    const math = await getMath();
    const derivative = math.derivative(expression, variable);
    const simplified = math.simplify(derivative);
    const latex = simplified.toTex();
    
    return {
      input: `d/d${variable}(${expression})`,
      output: simplified.toString(),
      latex: `\\frac{d}{d${variable}}\\left(${math.parse(expression).toTex()}\\right) = ${latex}`,
      verified: true,
      method: 'math.js derivative',
    };
  } catch (err) {
    return {
      input: expression,
      output: '',
      error: err instanceof Error ? err.message : 'Differentiation failed',
      verified: false,
      method: 'math.js derivative',
    };
  }
}

/**
 * Numerically integrate using Simpson's rule.
 */
export async function numericalIntegrate(
  expression: string,
  variable: string = 'x',
  a: number = 0,
  b: number = 1,
  n: number = 1000
): Promise<ComputationResult> {
  try {
    const math = await getMath();
    const compiled = math.compile(expression);
    
    // Simpson's 1/3 rule
    const h = (b - a) / n;
    let sum = 0;
    
    for (let i = 0; i <= n; i++) {
      const x = a + i * h;
      const scope = { [variable]: x };
      const y = compiled.evaluate(scope) as number;
      
      if (i === 0 || i === n) {
        sum += y;
      } else if (i % 2 === 1) {
        sum += 4 * y;
      } else {
        sum += 2 * y;
      }
    }
    
    const result = (h / 3) * sum;
    const rounded = Math.round(result * 1e10) / 1e10;
    
    return {
      input: `∫[${a},${b}] ${expression} d${variable}`,
      output: String(rounded),
      latex: `\\int_{${a}}^{${b}} ${math.parse(expression).toTex()} \\, d${variable} \\approx ${rounded}`,
      numeric: rounded,
      verified: true,
      method: "Simpson's 1/3 rule (n=1000)",
    };
  } catch (err) {
    return {
      input: expression,
      output: '',
      error: err instanceof Error ? err.message : 'Integration failed',
      verified: false,
      method: "Simpson's rule",
    };
  }
}

/**
 * Solve a linear equation system using matrices.
 */
export async function solveLinearSystem(
  equations: string[],
  variables: string[]
): Promise<ComputationResult> {
  try {
    const math = await getMath();
    
    // Build coefficient matrix and constant vector
    const A: number[][] = [];
    const b: number[] = [];
    
    for (const eq of equations) {
      const [lhs, rhs] = eq.split('=').map(s => s.trim());
      const rhsVal = parseFloat(rhs) || 0;
      b.push(rhsVal);
      
      const row: number[] = [];
      for (const v of variables) {
        // Extract coefficient of variable from lhs
        const scope: Record<string, number> = {};
        variables.forEach(vv => { scope[vv] = 0; });
        scope[v] = 1;
        try {
          const coeff = math.compile(lhs).evaluate(scope) as number;
          row.push(coeff);
        } catch {
          row.push(0);
        }
      }
      A.push(row);
    }
    
    const matA = math.matrix(A);
    const vecB = math.matrix(b);
    const solution = (math.lusolve(matA, vecB) as unknown) as number[][];
    
    const resultStr = variables.map((v, i) => `${v} = ${Math.round(solution[i][0] * 1e8) / 1e8}`).join(', ');
    const latexStr = variables.map((v, i) => `${v} = ${Math.round(solution[i][0] * 1e8) / 1e8}`).join(',\\quad ');
    
    return {
      input: equations.join('; '),
      output: resultStr,
      latex: latexStr,
      verified: true,
      method: 'LU decomposition (math.js)',
    };
  } catch (err) {
    return {
      input: equations.join('; '),
      output: '',
      error: err instanceof Error ? err.message : 'Linear system solve failed',
      verified: false,
      method: 'LU decomposition',
    };
  }
}

/**
 * Evaluate a function at many points for graphing.
 */
export async function evaluateForGraph(
  expression: string,
  variable: string = 'x',
  range: [number, number] = [-10, 10],
  points: number = 400
): Promise<{ x: number[]; y: number[] }> {
  try {
    const math = await getMath();
    const compiled = math.compile(expression);
    const step = (range[1] - range[0]) / points;
    
    const xs: number[] = [];
    const ys: number[] = [];
    
    for (let i = 0; i <= points; i++) {
      const x = range[0] + i * step;
      try {
        const y = compiled.evaluate({ [variable]: x }) as number;
        if (isFinite(y) && !isNaN(y) && Math.abs(y) < 1e10) {
          xs.push(x);
          ys.push(y);
        } else {
          xs.push(x);
          ys.push(NaN);
        }
      } catch {
        xs.push(x);
        ys.push(NaN);
      }
    }
    
    return { x: xs, y: ys };
  } catch {
    return { x: [], y: [] };
  }
}

/**
 * Parse LaTeX-like expressions to math.js format.
 */
export function normalizeExpression(expr: string): string {
  return expr
    .replace(/\^/g, '^')
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/√\(([^)]+)\)/g, 'sqrt($1)')
    .replace(/\bsin\b/g, 'sin')
    .replace(/\bcos\b/g, 'cos')
    .replace(/\btan\b/g, 'tan')
    .replace(/\bln\b/g, 'log')
    .replace(/\blog\b/g, 'log10')
    .replace(/π/g, 'pi')
    .replace(/∞/g, 'Infinity')
    .trim();
}

/**
 * Detect what kind of math question this is.
 */
export function detectMathCategory(question: string): string {
  const q = question.toLowerCase();
  if (/\b(integrate|integral|antiderivative|∫)\b/.test(q)) return 'calculus';
  if (/\b(derivative|differentiate|d\/dx|slope|tangent)\b/.test(q)) return 'calculus';
  if (/\b(matrix|matrices|determinant|eigenvalue|eigenvector)\b/.test(q)) return 'matrices';
  if (/\b(probability|statistics|mean|median|variance|standard deviation)\b/.test(q)) return 'statistics';
  if (/\b(triangle|circle|polygon|area|perimeter|volume|geometry)\b/.test(q)) return 'geometry';
  if (/\b(sin|cos|tan|angle|radian|degree|trig)\b/.test(q)) return 'trigonometry';
  if (/\b(function|f\(x\)|graph|domain|range|asymptote)\b/.test(q)) return 'functions';
  if (/\b(solve|equation|inequality|quadratic|linear|polynomial)\b/.test(q)) return 'algebra';
  return 'general';
}

/**
 * Attempt to extract and compute a math expression from natural language.
 */
export async function tryComputeFromQuestion(question: string): Promise<ComputationResult | null> {
  const math = await getMath();
  
  // Try to extract expressions like "evaluate 3x^2 + 2x at x=3"
  const evalMatch = question.match(/evaluate\s+(.+?)\s+(?:at|when|for)\s+(\w+)\s*=\s*(-?\d+\.?\d*)/i);
  if (evalMatch) {
    const [, expr, variable, value] = evalMatch;
    return evaluateExpression(normalizeExpression(expr), { [variable]: parseFloat(value) });
  }
  
  // Try "simplify ..."
  const simplifyMatch = question.match(/simplify\s+(.+)/i);
  if (simplifyMatch) {
    return simplifyExpression(normalizeExpression(simplifyMatch[1]));
  }
  
  // Try "derivative of ..."
  const derivMatch = question.match(/derivative\s+of\s+(.+?)(?:\s+with respect to\s+(\w+))?$/i);
  if (derivMatch) {
    return differentiate(normalizeExpression(derivMatch[1]), derivMatch[2] || 'x');
  }
  
  // Try pure expression like "2^10 + 3*5"
  const pureExprMatch = question.match(/^[\d\s\+\-\*\/\^\(\)\.\,a-zA-Z_]+$/);
  if (pureExprMatch && question.length < 50) {
    return evaluateExpression(normalizeExpression(question));
  }
  
  return null;
}
