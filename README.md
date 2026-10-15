# MATHESIS — AI-Powered Holographic Mathematics Platform

A next-generation, interactive mathematics learning platform for all educational levels — from primary school to advanced university mathematics.

## Features

- **AI Math Tutor** — Powered by OpenAI (GPT-4o-mini), gives step-by-step solutions with LaTeX rendering
- **Verified Computations** — All calculations verified by math.js (evaluate, simplify, differentiate, integrate)
- **Function Graph Visualizer** — Interactive 2D graph plotter with derivative overlay
- **Geometry Explorer** — Manipulate circles, triangles, rectangles, and polygons with live measurements
- **Matrix Calculator** — 2×2 to 4×4 matrix operations (multiply, determinant, inverse, transpose)
- **Quick Compute** — Fast expression evaluator for algebra, calculus, and arithmetic
- **Multilingual** — Ask questions in English, Spanish, French, German, Portuguese, Arabic, Chinese, Hindi
- **Education Levels** — Primary → Middle → High School → University → Advanced

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + custom holographic design system
- **Animation**: Framer Motion-ready, CSS animations
- **Math Notation**: KaTeX
- **Computation**: math.js (symbolic + numeric)
- **Graphs**: Recharts (2D), Canvas API (geometry)
- **AI**: OpenAI API (GPT-4o-mini)

## Installation

```bash
# 1. Navigate to project
cd mathesis

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.local.example .env.local
# Edit .env.local and add your OpenAI API key

# 4. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Configuration

### OpenAI API Key (required for AI tutor)

1. Get a key at [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Add to `.env.local`:
```env
OPENAI_API_KEY=sk-your-key-here
```

**Without an API key:** The platform still works — computations are fully functional via math.js, and structured mathematical responses are provided for common topic areas. The full AI explanation engine activates once a key is configured.

## Usage Examples

### AI Tutor
- "Solve 2x² + 5x - 3 = 0 step by step"
- "Explain the Pythagorean theorem with proof"  
- "How do I integrate x·e^x by parts?"
- "What are eigenvalues and why do they matter?"

### Quick Compute
- Evaluate: `sin(pi/4)^2 + cos(pi/4)^2` at no variables → gives 1
- Simplify: `x^2 + 2*x*y + y^2` → `(x + y)^2`
- Differentiate: `x^3 - 3*x^2 + 2` → `3*x^2 - 6*x`
- Integrate: `sin(x)` from 0 to π ≈ 2

### Graph Visualizer
- Enter any math.js expression: `sin(x) + cos(2*x)`
- Toggle derivative overlay to see d/dx alongside f(x)
- Adjust x-range for zoom in/out

## Production Build

```bash
npm run build
npm start
```

## Accessibility

- WCAG 2.1 AA target
- Keyboard navigation throughout
- Screen reader ARIA labels
- Reduced motion support (`prefers-reduced-motion`)
- High contrast mathematical content

## Security

- API keys stored in environment variables only, never exposed to the client
- All user input sanitized before computation
- OpenAI requests made server-side only
- No user data stored or logged

## License

MIT — Educational use encouraged.
