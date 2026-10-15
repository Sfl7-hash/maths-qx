export type MathLevel = 
  | 'primary'       // Ages 6-10
  | 'middle'        // Ages 11-14
  | 'high_school'   // Ages 15-18
  | 'university'    // Undergraduate
  | 'advanced';     // Graduate / Research

export type MathCategory = 
  | 'algebra'
  | 'geometry'
  | 'trigonometry'
  | 'calculus'
  | 'statistics'
  | 'probability'
  | 'matrices'
  | 'functions'
  | 'number_theory'
  | 'differential_equations'
  | 'linear_algebra'
  | 'general';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  mathContent?: MathContent;
  isStreaming?: boolean;
}

export interface MathContent {
  latex?: string;
  steps?: SolutionStep[];
  graph?: GraphConfig;
  computation?: ComputationResult;
  category?: MathCategory;
  level?: MathLevel;
}

export interface SolutionStep {
  stepNumber: number;
  description: string;
  latex?: string;
  explanation?: string;
}

export interface GraphConfig {
  type: 'function' | 'parametric' | 'polar' | 'scatter' | '3d';
  expressions: string[];
  xRange?: [number, number];
  yRange?: [number, number];
  title?: string;
  variables?: Record<string, number>;
}

export interface ComputationResult {
  input: string;
  output: string;
  latex?: string;
  numeric?: number;
  error?: string;
  verified: boolean;
  method: string;
}

export interface MathAPIRequest {
  question: string;
  level?: MathLevel;
  language?: string;
  conversationHistory?: ChatMessage[];
  includeGraph?: boolean;
  includeSteps?: boolean;
}

export interface MathAPIResponse {
  answer: string;
  latex?: string;
  steps?: SolutionStep[];
  graph?: GraphConfig;
  computation?: ComputationResult;
  category?: MathCategory;
  level?: MathLevel;
  followUpSuggestions?: string[];
  error?: string;
}

export interface VisualizationState {
  activeTab: 'graph' | '3d' | 'geometry' | 'matrix';
  graphExpression: string;
  sliderValues: Record<string, number>;
  showTangent: boolean;
  showIntegral: boolean;
  integralBounds: [number, number];
}
