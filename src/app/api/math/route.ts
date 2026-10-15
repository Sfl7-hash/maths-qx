import { NextRequest, NextResponse } from 'next/server';
import { 
  evaluateExpression, 
  simplifyExpression, 
  differentiate,
  numericalIntegrate,
  evaluateForGraph,
  normalizeExpression
} from '@/lib/mathEngine';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { operation, expression, variable, lower, upper, range, points, scope } = body;
    
    if (!operation || !expression) {
      return NextResponse.json({ error: 'operation and expression are required' }, { status: 400 });
    }
    
    const normalExpr = normalizeExpression(String(expression));
    
    switch (operation) {
      case 'evaluate': {
        const result = await evaluateExpression(normalExpr, scope);
        return NextResponse.json(result);
      }
      
      case 'simplify': {
        const result = await simplifyExpression(normalExpr);
        return NextResponse.json(result);
      }
      
      case 'differentiate': {
        const result = await differentiate(normalExpr, variable || 'x');
        return NextResponse.json(result);
      }
      
      case 'integrate': {
        const result = await numericalIntegrate(
          normalExpr,
          variable || 'x',
          parseFloat(lower) || 0,
          parseFloat(upper) || 1
        );
        return NextResponse.json(result);
      }
      
      case 'graph': {
        const xRange: [number, number] = range || [-10, 10];
        const data = await evaluateForGraph(normalExpr, variable || 'x', xRange, points || 400);
        return NextResponse.json({ 
          data,
          expression: normalExpr,
          verified: true,
          method: 'math.js point evaluation',
        });
      }
      
      default:
        return NextResponse.json({ error: `Unknown operation: ${operation}` }, { status: 400 });
    }
  } catch (error) {
    console.error('[Math API Error]', error);
    return NextResponse.json({ 
      error: 'Computation failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
