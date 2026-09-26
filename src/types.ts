export interface PaperMetadata {
  title: string;
  authors: string[];
  year: string;
  venue: string;
  url: string;
  primaryDomain: string;
  keyKeywords: string[];
}

export interface CoreConcept {
  problemStatement: string;
  primaryMethodology: string;
  keyBreakthroughs: string;
  wordCount: number;
  accessibleSummary?: string;
}

export interface ComponentItem {
  name: string;
  category: 'Input' | 'Layer' | 'Optimization' | 'Output' | 'Memory';
  role: string;
}

export interface FlowchartData {
  mermaidCode: string;
  architectureExplanation: string;
  componentsList: ComponentItem[];
}

export interface StudentOpportunity {
  id: string;
  title: string;
  exactExtension: string;
  targetedMetric: string;
  recommendedTechstack: string[];
  difficulty: string;
  resumeBullet: string;
  roadmap: string[];
  starterSnippet: string;
}

export interface TokenAudit {
  promptTokens: number;
  candidatesTokens: number;
  totalTokens: number;
  tokenBudget: number;
  budgetUsedPercent: number;
  isUnderBudget: boolean;
  savedTokensEstimate: number;
  efficiencyRating: string;
}

export interface AnalysisResult {
  rawOutput: string;
  paper: PaperMetadata;
  coreConcept: CoreConcept;
  flowchart: FlowchartData;
  studentOpportunities: StudentOpportunity[];
  tokenAudit: TokenAudit;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'agent';
  content: string;
  timestamp: string;
}
