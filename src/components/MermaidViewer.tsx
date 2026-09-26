import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Copy, 
  Check, 
  Download, 
  Code2, 
  Eye, 
  Columns, 
  Layers, 
  AlertCircle,
  Maximize2
} from 'lucide-react';
import { ComponentItem } from '../types';

interface Props {
  mermaidCode: string;
  explanation?: string;
  componentsList?: ComponentItem[];
}

export const MermaidViewer: React.FC<Props> = ({ 
  mermaidCode, 
  explanation, 
  componentsList = [] 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>('');
  const [renderError, setRenderError] = useState<string | null>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [copied, setCopied] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'visual' | 'code' | 'split'>('visual');
  const [activeTab, setActiveTab] = useState<'diagram' | 'components'>('diagram');

  // Initialize mermaid configuration once
  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'dark',
      securityLevel: 'loose',
      fontFamily: 'JetBrains Mono, Plus Jakarta Sans, system-ui, sans-serif',
      themeVariables: {
        darkMode: true,
        background: '#0f172a',
        primaryColor: '#3b82f6',
        primaryTextColor: '#f8fafc',
        primaryBorderColor: '#60a5fa',
        lineColor: '#94a3b8',
        secondaryColor: '#1e293b',
        tertiaryColor: '#1e1b4b',
        clusterBkg: '#0b1120',
        clusterBorder: '#334155',
        edgeLabelBackground: '#1e293b',
        nodeBorder: '#3b82f6',
      },
      flowchart: {
        htmlLabels: true,
        curve: 'basis',
        nodeSpacing: 40,
        rankSpacing: 50,
        padding: 16,
      },
    });
  }, []);

  // Re-render diagram whenever mermaidCode changes
  useEffect(() => {
    let isCancelled = false;
    const renderDiagram = async () => {
      if (!mermaidCode) return;
      setRenderError(null);

      // Clean string
      let cleaned = mermaidCode
        .replace(/```mermaid/gi, '')
        .replace(/```/g, '')
        .replace(/^\[FLOWCHART\]\s*/i, '')
        .trim();

      if (!cleaned.startsWith('graph ') && !cleaned.startsWith('flowchart ')) {
        cleaned = 'graph TD\n' + cleaned;
      }

      try {
        const uniqueId = `mermaid-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const { svg } = await mermaid.render(uniqueId, cleaned);
        if (!isCancelled) {
          setSvgContent(svg);
        }
      } catch (err: any) {
        console.error('Mermaid render error:', err);
        if (!isCancelled) {
          setRenderError(err?.message || 'Failed to render Mermaid diagram.');
        }
      }
    };

    renderDiagram();
    return () => {
      isCancelled = true;
    };
  }, [mermaidCode]);

  const handleZoomIn = () => setZoom(prev => Math.min(2.5, prev + 0.15));
  const handleZoomOut = () => setZoom(prev => Math.max(0.5, prev - 0.15));
  const handleResetZoom = () => setZoom(1);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(`[FLOWCHART]\n${mermaidCode}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDownloadSVG = () => {
    if (!svgContent) return;
    const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `system-architecture-${Date.now()}.svg`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'Input':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Layer':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'Optimization':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'Memory':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'Output':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      {/* Top Header & Toolbar */}
      <div className="px-5 py-3.5 border-b border-slate-800 bg-slate-950/60 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <span>Step 2: Architectural Flowchart</span>
              <span className="font-mono text-xs text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
                Mermaid.js (graph TD)
              </span>
            </h3>
          </div>

          {/* Sub-tabs for Diagram vs Component breakdown */}
          <div className="hidden sm:flex items-center bg-slate-800/70 p-0.5 rounded-lg border border-slate-700/60 text-xs">
            <button
              onClick={() => setActiveTab('diagram')}
              className={`px-3 py-1 rounded-md transition-all font-medium ${
                activeTab === 'diagram'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Architecture Diagram
            </button>
            {componentsList.length > 0 && (
              <button
                onClick={() => setActiveTab('components')}
                className={`px-3 py-1 rounded-md transition-all font-medium flex items-center gap-1.5 ${
                  activeTab === 'components'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Components ({componentsList.length})</span>
              </button>
            )}
          </div>
        </div>

        {/* View Switchers & Export Tools */}
        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-800/80 p-0.5 rounded-lg border border-slate-700/60 text-xs text-slate-300">
            <button
              onClick={() => setViewMode('visual')}
              title="Graphic Diagram View"
              className={`p-1.5 rounded transition-colors ${
                viewMode === 'visual' ? 'bg-slate-700 text-cyan-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('code')}
              title="Raw [FLOWCHART] Text"
              className={`p-1.5 rounded transition-colors ${
                viewMode === 'code' ? 'bg-slate-700 text-cyan-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('split')}
              title="Split Code & Diagram"
              className={`p-1.5 rounded transition-colors hidden md:block ${
                viewMode === 'split' ? 'bg-slate-700 text-cyan-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Zoom controls (visual mode only) */}
          {(viewMode === 'visual' || viewMode === 'split') && (
            <div className="flex items-center bg-slate-800/80 px-1 py-0.5 rounded-lg border border-slate-700/60 text-xs text-slate-300">
              <button
                onClick={handleZoomOut}
                title="Zoom Out"
                className="p-1 text-slate-400 hover:text-slate-200 transition-colors"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="px-1.5 font-mono text-[11px] text-slate-300 min-w-10 text-center">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={handleZoomIn}
                title="Zoom In"
                className="p-1 text-slate-400 hover:text-slate-200 transition-colors"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleResetZoom}
                title="Reset Zoom"
                className="p-1 text-slate-400 hover:text-slate-200 transition-colors ml-0.5 border-l border-slate-700 pl-1.5"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Action buttons */}
          <button
            onClick={handleCopyCode}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1.5 rounded-lg border border-slate-700 text-xs font-medium transition-all"
            title="Copy [FLOWCHART] Mermaid Text"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden sm:inline">Copy Code</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownloadSVG}
            disabled={!svgContent}
            className="flex items-center gap-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-50"
            title="Download Vector SVG"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export SVG</span>
          </button>
        </div>
      </div>

      {/* Explanation Banner */}
      {explanation && (
        <div className="px-5 py-2.5 bg-slate-950/40 border-b border-slate-800/80 text-xs text-slate-400 flex items-start gap-2">
          <span className="font-semibold text-slate-300 whitespace-nowrap">System Flow:</span>
          <span>{explanation}</span>
        </div>
      )}

      {/* Main Content Area */}
      <div className="relative min-h-[460px] bg-slate-950/90 overflow-hidden">
        {activeTab === 'components' ? (
          /* Component Breakdown List */
          <div className="p-6 max-h-[580px] overflow-y-auto">
            <h4 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Architectural Components & Roles</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {componentsList.map((comp, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="font-mono text-xs font-semibold text-slate-100">
                      {comp.name}
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getCategoryBadge(comp.category)}`}>
                      {comp.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {comp.role}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Diagram View / Code View / Split View */
          <div className="w-full h-full">
            {viewMode === 'code' ? (
              /* Pure [FLOWCHART] text representation */
              <div className="p-5 font-mono text-xs bg-slate-950 h-[520px] overflow-auto">
                <div className="text-cyan-400 font-bold mb-2 select-all">[FLOWCHART]</div>
                <pre className="text-slate-300 leading-relaxed whitespace-pre-wrap select-all">
                  {mermaidCode}
                </pre>
              </div>
            ) : viewMode === 'split' ? (
              /* Side-by-Side Split View */
              <div className="grid grid-cols-1 md:grid-cols-2 h-[540px]">
                {/* Left: Code */}
                <div className="p-4 font-mono text-xs bg-slate-950/90 border-r border-slate-800 overflow-auto">
                  <div className="text-cyan-400 font-bold mb-2 select-all">[FLOWCHART]</div>
                  <pre className="text-slate-300 whitespace-pre-wrap leading-relaxed select-all">
                    {mermaidCode}
                  </pre>
                </div>

                {/* Right: Rendered SVG */}
                <div 
                  ref={containerRef}
                  className="p-4 flex items-center justify-center overflow-auto bg-slate-950/60"
                >
                  {renderError ? (
                    <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                      <div className="flex items-center gap-1.5 font-semibold mb-1">
                        <AlertCircle className="w-4 h-4 text-rose-400" />
                        <span>Mermaid Parsing Note</span>
                      </div>
                      <p>{renderError}</p>
                    </div>
                  ) : svgContent ? (
                    <div
                      className="transition-transform duration-200 ease-out origin-center"
                      style={{ transform: `scale(${zoom})` }}
                      dangerouslySetInnerHTML={{ __html: svgContent }}
                    />
                  ) : (
                    <div className="flex items-center gap-2 text-slate-500 text-xs font-mono">
                      <span className="w-3 h-3 rounded-full border-2 border-slate-500 border-t-cyan-400 animate-spin" />
                      <span>Synthesizing system layers...</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Full Graphic Visual Mode */
              <div 
                ref={containerRef}
                className="w-full min-h-[500px] flex items-center justify-center p-6 overflow-auto"
              >
                {renderError ? (
                  <div className="max-w-lg p-5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-slate-300 text-xs">
                    <div className="flex items-center gap-2 text-rose-400 font-semibold mb-2">
                      <AlertCircle className="w-4 h-4" />
                      <span>Mermaid Syntax Alert</span>
                    </div>
                    <p className="text-slate-400 mb-3 leading-relaxed">{renderError}</p>
                    <div className="p-3 bg-slate-900 rounded-lg font-mono text-[11px] text-slate-300 overflow-x-auto">
                      [FLOWCHART]
                      <br />
                      {mermaidCode}
                    </div>
                  </div>
                ) : svgContent ? (
                  <div
                    className="transition-transform duration-200 ease-out origin-center py-4"
                    style={{ transform: `scale(${zoom})` }}
                    dangerouslySetInnerHTML={{ __html: svgContent }}
                  />
                ) : (
                  <div className="flex flex-col items-center gap-3 text-slate-500 text-xs font-mono">
                    <span className="w-5 h-5 rounded-full border-2 border-slate-600 border-t-cyan-400 animate-spin" />
                    <span>Rendering architectural graph TD...</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Legend */}
      <div className="px-5 py-3 bg-slate-950 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Legend:</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
            <span className="text-slate-300">Data Inputs</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-blue-500" />
            <span className="text-slate-300">Model Layers / Attention</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-purple-500" />
            <span className="text-slate-300">Optimizations & Norms</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" />
            <span className="text-slate-300">Data Outputs</span>
          </div>
        </div>

        <div className="text-[11px] text-slate-500 font-mono">
          Interactive Node Layout • Pan &amp; Zoom Enabled
        </div>
      </div>
    </div>
  );
};
