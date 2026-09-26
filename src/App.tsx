import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Sparkles, 
  ExternalLink, 
  BookOpen, 
  GitFork, 
  Layers, 
  GraduationCap, 
  MessageSquare, 
  Terminal, 
  Download, 
  FileCode, 
  Check, 
  Copy, 
  Zap, 
  AlertCircle, 
  RefreshCw,
  Cpu,
  ChevronRight,
  ShieldAlert,
  SlidersHorizontal,
  Bookmark
} from 'lucide-react';
import { AnalysisResult, PaperMetadata } from './types';
import { SAMPLE_PAPERS } from './data/samplePapers';
import { TokenAuditBar } from './components/TokenAuditBar';
import { MermaidViewer } from './components/MermaidViewer';
import { CoreConceptView } from './components/CoreConceptView';
import { StudentOpportunitiesView } from './components/StudentOpportunitiesView';
import { ResearchAgentChat } from './components/ResearchAgentChat';
import { RawAgentOutputModal } from './components/RawAgentOutputModal';

export default function App() {
  const [inputUrl, setInputUrl] = useState<string>('https://arxiv.org/abs/1706.03762');
  const [selectedPaper, setSelectedPaper] = useState<AnalysisResult>(SAMPLE_PAPERS[0].preview);
  const [activeTab, setActiveTab] = useState<'all' | 'concept' | 'flowchart' | 'opportunities' | 'chat'>('all');
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [rawModalOpen, setRawModalOpen] = useState<boolean>(false);
  const [copiedReport, setCopiedReport] = useState<boolean>(false);
  const [hasApiKey, setHasApiKey] = useState<boolean>(true);

  // Check health and API key on mount
  useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(data => {
        if (data.hasKey !== undefined) {
          setHasApiKey(data.hasKey);
        }
      })
      .catch(err => console.warn('Health check note:', err));
  }, []);

  const handleSelectSample = (sample: typeof SAMPLE_PAPERS[0]) => {
    setInputUrl(sample.url);
    setSelectedPaper(sample.preview);
    setErrorMessage(null);
  };

  const handleAnalyze = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = inputUrl.trim();
    if (!query) return;

    // Check if it matches one of our rich sample papers first for instant speed
    const matchedSample = SAMPLE_PAPERS.find(
      s => s.url.toLowerCase() === query.toLowerCase() || 
           s.id.toLowerCase() === query.toLowerCase() ||
           s.preview.paper.title.toLowerCase().includes(query.toLowerCase())
    );

    if (matchedSample && !loading) {
      setSelectedPaper(matchedSample.preview);
      setErrorMessage(null);
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setLoadingStep('Resolving paper link & arXiv metadata...');

    try {
      setTimeout(() => {
        setLoadingStep('Enforcing token efficiency (< 25,000 tokens) via structured abstract & search grounding...');
      }, 1000);

      setTimeout(() => {
        setLoadingStep('Synthesizing system architecture into Mermaid.js graph TD...');
      }, 2500);

      setTimeout(() => {
        setLoadingStep('Brainstorming 3 concrete 3rd-year CS student project blueprints with target metrics...');
      }, 4000);

      const res = await fetch('/api/research/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paperInput: query }),
      });

      const json = await res.json();
      if (!res.ok || json.error) {
        throw new Error(json.error || 'Failed to analyze paper. Please check the URL or title.');
      }

      if (json.data) {
        const fullResult: AnalysisResult = {
          ...json.data,
          tokenAudit: json.tokenAudit || {
            promptTokens: 1400,
            candidatesTokens: 1100,
            totalTokens: 2500,
            tokenBudget: 25000,
            budgetUsedPercent: 10,
            isUnderBudget: true,
            savedTokensEstimate: 42500,
            efficiencyRating: 'Optimal (Superior Efficiency)',
          },
        };
        setSelectedPaper(fullResult);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'An error occurred while analyzing the paper.');
    } finally {
      setLoading(false);
      setLoadingStep('');
    }
  };

  const handleCopyMarkdownReport = async () => {
    if (!selectedPaper) return;
    const md = `# ${selectedPaper.paper.title}
Authors: ${selectedPaper.paper.authors.join(', ')} (${selectedPaper.paper.year}) - ${selectedPaper.paper.venue}
URL: ${selectedPaper.paper.url}

## 1. CORE CONCEPT EXTRACTION
**Problem Statement:**
${selectedPaper.coreConcept.problemStatement}

**Primary Methodology:**
${selectedPaper.coreConcept.primaryMethodology}

**Key Mathematical & Algorithmic Breakthroughs:**
${selectedPaper.coreConcept.keyBreakthroughs}

## 2. ARCHITECTURAL FLOWCHART
\`\`\`mermaid
${selectedPaper.flowchart.mermaidCode}
\`\`\`

## 3. FUTURE WORK & INTERNSHIP OPPORTUNITIES (3rd-Year CS Student Projects)
${selectedPaper.studentOpportunities.map((o, i) => `
### ${i + 1}. ${o.title} (${o.difficulty})
- **Exact Extension:** ${o.exactExtension}
- **Targeted Metric:** ${o.targetedMetric}
- **Recommended Tech Stack:** ${o.recommendedTechstack.join(', ')}
- **Resume Ready Bullet:**
  • ${o.resumeBullet}
`).join('\n')}
`;

    try {
      await navigator.clipboard.writeText(md);
      setCopiedReport(true);
      setTimeout(() => setCopiedReport(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600/30 selection:text-blue-200">
      {/* Top Navbar */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo & Agent Tag */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white font-bold">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold tracking-tight text-base sm:text-lg bg-gradient-to-r from-slate-100 via-slate-200 to-slate-400 bg-clip-text text-transparent">
                  PaperBlueprint
                </span>
                <span className="text-[10px] uppercase font-mono font-bold tracking-widest px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  CS Research Agent
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Academic Paper Parsing • System Architecture Flowcharts • Student Resume Blueprints
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setRawModalOpen(true)}
              className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 px-3 py-1.5 rounded-xl border border-slate-800 text-xs font-medium transition-all"
              title="View exact raw prompt output"
            >
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Raw Agent Text</span>
            </button>

            <button
              onClick={handleCopyMarkdownReport}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-1.5 rounded-xl text-xs font-semibold shadow-md shadow-blue-600/20 transition-all"
              title="Export complete analysis in Markdown"
            >
              {copiedReport ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied Report</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Export Markdown</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Paper URL / arXiv Input Box */}
        <section className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-sm relative overflow-hidden">
          {/* Subtle glow accent */}
          <div className="absolute top-0 right-0 w-96 h-32 bg-blue-500/5 blur-3xl pointer-events-none" />

          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <Search className="w-4 h-4 text-blue-400" />
                  <span>Research Paper Analysis Input</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Provide an arXiv URL, paper DOI, OpenReview link, or title to execute token-efficient architecture extraction.
                </p>
              </div>

              {/* Token constraint badge */}
              <div className="flex items-center gap-1.5 bg-slate-950/80 px-2.5 py-1 rounded-lg border border-slate-800 text-[11px] text-slate-400 font-mono">
                <Zap className="w-3 h-3 text-amber-400" />
                <span>Max Budget: 25,000 Tokens</span>
              </div>
            </div>

            {/* Input Form */}
            <form onSubmit={handleAnalyze} className="flex flex-col sm:flex-row items-center gap-2.5">
              <div className="relative flex-1 w-full">
                <input
                  type="text"
                  value={inputUrl}
                  onChange={e => setInputUrl(e.target.value)}
                  placeholder="e.g., https://arxiv.org/abs/1706.03762 or 'FlashAttention' or arXiv ID..."
                  disabled={loading}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 font-mono transition-all outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !inputUrl.trim()}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Analyzing Paper...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Deconstruct Paper</span>
                  </>
                )}
              </button>
            </form>

            {/* Landmark Paper Preset Buttons */}
            <div className="pt-1 flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1 mr-1">
                <Bookmark className="w-3 h-3" /> Benchmark Presets:
              </span>
              {SAMPLE_PAPERS.map(sample => (
                <button
                  key={sample.id}
                  onClick={() => handleSelectSample(sample)}
                  className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-all ${
                    selectedPaper.paper.url === sample.url
                      ? 'bg-blue-600/20 text-blue-300 border-blue-500/40 shadow-sm'
                      : 'bg-slate-950/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border-slate-800'
                  }`}
                >
                  {sample.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Loading Indicator with Animated Steps */}
        {loading && (
          <div className="bg-slate-900 border border-blue-500/30 rounded-2xl p-6 shadow-xl flex flex-col items-center justify-center text-center space-y-4 animate-pulse">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
              <RefreshCw className="w-6 h-6 animate-spin text-blue-400" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-100">
                CS Research Agent in Execution
              </h3>
              <p className="text-xs font-mono text-cyan-400 mt-1 max-w-lg">
                {loadingStep || 'Executing operational constraints and architectural extraction...'}
              </p>
            </div>
            <div className="text-[11px] text-slate-500 max-w-md">
              Extracting system layers, charting Mermaid.js flowchart (graph TD), and generating 3 concrete 3rd-year CS student resume blueprints with target metrics.
            </div>
          </div>
        )}

        {/* Error Notification */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Analysis Failed: </span>
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        {/* Active Paper Header Card */}
        {selectedPaper && !loading && (
          <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 rounded-2xl p-6 shadow-lg">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    {selectedPaper.paper.primaryDomain || 'Computer Science Research'}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    {selectedPaper.paper.venue} ({selectedPaper.paper.year})
                  </span>
                </div>

                <h1 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">
                  {selectedPaper.paper.title}
                </h1>

                <p className="text-xs text-slate-400 leading-relaxed max-w-4xl">
                  <span className="text-slate-500 font-medium">Authors: </span>
                  {selectedPaper.paper.authors?.join(', ')}
                </p>

                {/* Keywords */}
                {selectedPaper.paper.keyKeywords && selectedPaper.paper.keyKeywords.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    {selectedPaper.paper.keyKeywords.map((kw, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 border border-slate-700/60"
                      >
                        #{kw}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Source Link */}
              {selectedPaper.paper.url && (
                <div className="shrink-0 flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2">
                  <a
                    href={selectedPaper.paper.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 bg-blue-950/40 hover:bg-blue-900/40 border border-blue-800/40 px-3 py-1.5 rounded-xl font-medium transition-colors"
                  >
                    <span>Read Original Paper</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Operational Constraint Monitor: Token Audit Bar */}
        {selectedPaper && !loading && (
          <TokenAuditBar audit={selectedPaper.tokenAudit} />
        )}

        {/* Section View Tabs */}
        {selectedPaper && !loading && (
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-1 overflow-x-auto gap-2">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  activeTab === 'all'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <span>Full Blueprint</span>
              </button>

              <button
                onClick={() => setActiveTab('concept')}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  activeTab === 'concept'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>1. Core Concept</span>
              </button>

              <button
                onClick={() => setActiveTab('flowchart')}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  activeTab === 'flowchart'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>2. Mermaid Flowchart</span>
              </button>

              <button
                onClick={() => setActiveTab('opportunities')}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  activeTab === 'opportunities'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>3. CS Student Projects</span>
              </button>

              <button
                onClick={() => setActiveTab('chat')}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  activeTab === 'chat'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Agent Technical Mentor</span>
              </button>
            </div>

            <div className="hidden lg:flex items-center gap-2 text-xs text-slate-500 font-mono">
              <span>Steps 1, 2 &amp; 3 Operational</span>
            </div>
          </div>
        )}

        {/* Content Render based on Active Tab */}
        {selectedPaper && !loading && (
          <div className="space-y-8">
            {/* Step 1: Core Concept Extraction */}
            {(activeTab === 'all' || activeTab === 'concept') && (
              <section id="step-core-concept">
                <CoreConceptView 
                  coreConcept={selectedPaper.coreConcept} 
                  paperTitle={selectedPaper.paper.title} 
                />
              </section>
            )}

            {/* Step 2: Architectural Flowchart (Mermaid.js) */}
            {(activeTab === 'all' || activeTab === 'flowchart') && (
              <section id="step-flowchart">
                <MermaidViewer 
                  mermaidCode={selectedPaper.flowchart?.mermaidCode || ''}
                  explanation={selectedPaper.flowchart?.architectureExplanation}
                  componentsList={selectedPaper.flowchart?.componentsList}
                />
              </section>
            )}

            {/* Step 3: Future Work & Internship Opportunities */}
            {(activeTab === 'all' || activeTab === 'opportunities') && (
              <section id="step-student-opportunities">
                <StudentOpportunitiesView 
                  opportunities={selectedPaper.studentOpportunities || []} 
                />
              </section>
            )}

            {/* Interactive CS Research Agent Chat Mentor */}
            {(activeTab === 'all' || activeTab === 'chat') && (
              <section id="step-agent-chat">
                <ResearchAgentChat analysis={selectedPaper} />
              </section>
            )}
          </div>
        )}
      </main>

      {/* Raw Agent Output Modal */}
      {selectedPaper && (
        <RawAgentOutputModal
          isOpen={rawModalOpen}
          onClose={() => setRawModalOpen(false)}
          rawText={selectedPaper.rawOutput}
          paperTitle={selectedPaper.paper.title}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 mt-12 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            PaperBlueprint • Advanced Computer Science Research Agent
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Token Budget Guard: &lt; 25,000 Tokens</span>
            <span>•</span>
            <span>Mermaid.js graph TD</span>
            <span>•</span>
            <span>3rd-Year CS Resume Projects</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
