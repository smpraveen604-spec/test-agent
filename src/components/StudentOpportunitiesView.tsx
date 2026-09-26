import React, { useState } from 'react';
import { StudentOpportunity } from '../types';
import { 
  GraduationCap, 
  Target, 
  Layers, 
  Code, 
  Check, 
  Copy, 
  ChevronDown, 
  ChevronUp, 
  Briefcase, 
  Calendar, 
  Terminal, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface Props {
  opportunities: StudentOpportunity[];
}

export const StudentOpportunitiesView: React.FC<Props> = ({ opportunities }) => {
  const [expandedId, setExpandedId] = useState<string | null>(opportunities[0]?.id || null);
  const [copiedResumeId, setCopiedResumeId] = useState<string | null>(null);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  const handleCopyResume = async (id: string, bullet: string) => {
    try {
      await navigator.clipboard.writeText(bullet);
      setCopiedResumeId(id);
      setTimeout(() => setCopiedResumeId(null), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCopyCode = async (id: string, code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCodeId(id);
      setTimeout(() => setCopiedCodeId(null), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      {/* Top Header */}
      <div className="px-5 py-4 border-b border-slate-800 bg-slate-950/60 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <GraduationCap className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <span>Step 3: Future Work &amp; Internship Opportunities</span>
              <span className="font-mono text-xs text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                3rd-Year CS Student Projects
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Concrete architectural extensions, targeted metrics, and recommended tech stacks
            </p>
          </div>
        </div>

        <div className="text-xs text-slate-400 font-mono">
          3 Project Blueprints Ready
        </div>
      </div>

      {/* Cards list */}
      <div className="p-6 space-y-4">
        {opportunities.map((item, index) => {
          const isExpanded = expandedId === item.id;

          return (
            <div
              key={item.id || index}
              className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                isExpanded
                  ? 'bg-slate-950/90 border-blue-500/40 shadow-lg shadow-blue-500/5'
                  : 'bg-slate-950/40 border-slate-800/90 hover:border-slate-700/90'
              }`}
            >
              {/* Card Header (Clickable) */}
              <div
                onClick={() => toggleExpand(item.id)}
                className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer select-none"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-mono font-bold text-xs flex items-center justify-center shrink-0 shadow-sm mt-0.5 sm:mt-0">
                    0{index + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h4 className="text-sm font-semibold text-slate-100 hover:text-blue-300 transition-colors">
                        {item.title}
                      </h4>
                      {item.difficulty && (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                          {item.difficulty}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-1">
                      {item.exactExtension}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 self-end sm:self-center shrink-0">
                  <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-400">
                    {item.recommendedTechstack?.slice(0, 3).map((tool, i) => (
                      <span
                        key={i}
                        className="bg-slate-800/80 text-slate-300 font-mono text-[11px] px-2 py-0.5 rounded border border-slate-700"
                      >
                        {tool}
                      </span>
                    ))}
                  </div>

                  <button
                    className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                    aria-label="Toggle details"
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="px-5 pb-5 pt-2 border-t border-slate-800/80 space-y-4">
                  {/* Extension & Metric Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Exact Extension */}
                    <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-400 mb-1.5">
                        <Layers className="w-3.5 h-3.5" />
                        <span>The Exact Extension</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed font-normal">
                        {item.exactExtension}
                      </p>
                    </div>

                    {/* Targeted Metric */}
                    <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1.5">
                        <Target className="w-3.5 h-3.5" />
                        <span>Targeted Performance Metric</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed font-normal">
                        {item.targetedMetric}
                      </p>
                    </div>
                  </div>

                  {/* Recommended Tech Stack */}
                  <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-400 mb-2">
                      <Code className="w-3.5 h-3.5" />
                      <span>Recommended Tech Stack</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {item.recommendedTechstack?.map((tech, i) => (
                        <span
                          key={i}
                          className="bg-purple-950/40 text-purple-300 border border-purple-800/40 font-mono text-xs px-2.5 py-1 rounded-lg"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Resume Ready Action Bullet */}
                  {item.resumeBullet && (
                    <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/30 via-slate-900 to-teal-950/20 border border-emerald-800/30">
                      <div className="flex items-center justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
                          <Briefcase className="w-3.5 h-3.5" />
                          <span>Resume &amp; CV Bullet Point (Ready to Paste)</span>
                        </div>
                        <button
                          onClick={() => handleCopyResume(item.id, item.resumeBullet)}
                          className="flex items-center gap-1 text-[11px] bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded border border-emerald-500/20 transition-all font-medium"
                        >
                          {copiedResumeId === item.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span>Copied to Clipboard</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy Bullet</span>
                            </>
                          )}
                        </button>
                      </div>
                      <p className="text-xs font-mono text-slate-200 leading-relaxed bg-slate-950/70 p-3 rounded-lg border border-slate-800/80 select-all">
                        • {item.resumeBullet}
                      </p>
                    </div>
                  )}

                  {/* 4-Week Milestone Roadmap */}
                  {item.roadmap && item.roadmap.length > 0 && (
                    <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400 mb-2.5">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Execution Roadmap (4-Week Sprint)</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {item.roadmap.map((step, sIdx) => (
                          <div
                            key={sIdx}
                            className="flex items-start gap-2 bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/60"
                          >
                            <span className="font-mono font-bold text-cyan-400 text-[11px] shrink-0 mt-0.5">
                              W{sIdx + 1}:
                            </span>
                            <span className="text-slate-300 text-xs leading-relaxed">{step.replace(/^Week \d+:\s*/i, '')}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Starter Code Snippet */}
                  {item.starterSnippet && (
                    <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
                      <div className="px-3.5 py-2 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
                        <div className="flex items-center gap-2">
                          <Terminal className="w-3.5 h-3.5 text-blue-400" />
                          <span className="font-mono text-[11px] text-slate-300">PyTorch Implementation Hook</span>
                        </div>
                        <button
                          onClick={() => handleCopyCode(item.id, item.starterSnippet)}
                          className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 transition-colors"
                        >
                          {copiedCodeId === item.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy Code</span>
                            </>
                          )}
                        </button>
                      </div>
                      <div className="p-3.5 font-mono text-xs text-slate-300 overflow-x-auto max-h-60">
                        <pre className="select-all leading-relaxed">{item.starterSnippet}</pre>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
