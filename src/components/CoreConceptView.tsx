import React, { useState } from 'react';
import { CoreConcept } from '../types';
import { 
  FileText, 
  Lightbulb, 
  Wrench, 
  Cpu, 
  Copy, 
  Check, 
  CheckCircle2, 
  Sparkles,
  BookOpen
} from 'lucide-react';

interface Props {
  coreConcept: CoreConcept;
  paperTitle: string;
}

export const CoreConceptView: React.FC<Props> = ({ coreConcept, paperTitle }) => {
  const [copied, setCopied] = useState(false);

  // Compute word count dynamically if not pre-provided
  const fullText = `${coreConcept.problemStatement} ${coreConcept.primaryMethodology} ${coreConcept.keyBreakthroughs}`;
  const actualWordCount = coreConcept.wordCount || fullText.trim().split(/\s+/).length;
  const isUnderLimit = actualWordCount <= 300;

  const handleCopy = async () => {
    const textToCopy = `CORE CONCEPT EXTRACTION:
Problem Statement:
${coreConcept.problemStatement}

Primary Methodology:
${coreConcept.primaryMethodology}

Key Mathematical & Algorithmic Breakthroughs:
${coreConcept.keyBreakthroughs}`;

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      {/* Top Header */}
      <div className="px-5 py-4 border-b border-slate-800 bg-slate-950/60 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <span>Step 1: Core Concept Extraction</span>
            </h3>
            <p className="text-xs text-slate-400">
              Plain, accessible language summary under 300 words
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Word Count Budget Badge */}
          <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700 text-xs">
            <span className="text-slate-400">Word Count:</span>
            <span className={`font-mono font-bold ${isUnderLimit ? 'text-emerald-400' : 'text-amber-400'}`}>
              {actualWordCount}
            </span>
            <span className="text-slate-500">/ 300 max</span>
            {isUnderLimit && (
              <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                <CheckCircle2 className="w-3 h-3" /> PASS
              </span>
            )}
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 text-xs font-medium transition-all"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Copy Summary</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Accessible "In Plain English" Summary Box if available */}
      {coreConcept.accessibleSummary && (
        <div className="mx-6 mt-6 p-4 rounded-xl bg-gradient-to-r from-blue-950/40 via-indigo-950/30 to-purple-950/40 border border-blue-800/30 flex items-start gap-3">
          <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-300 mt-0.5 shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-blue-400 mb-1">
              The 30-Second Intuition (Plain English)
            </div>
            <p className="text-sm text-slate-200 leading-relaxed">
              {coreConcept.accessibleSummary}
            </p>
          </div>
        </div>
      )}

      {/* The 3 Core Pillars */}
      <div className="p-6 grid grid-cols-1 gap-5">
        {/* 1. Problem Statement */}
        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700/80 transition-all">
          <div className="flex items-center gap-2 mb-2 text-rose-400">
            <div className="p-1.5 rounded-md bg-rose-500/10 border border-rose-500/20">
              <Lightbulb className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold uppercase tracking-wider">
              1. The Fundamental Problem Statement
            </h4>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed font-normal pl-8">
            {coreConcept.problemStatement}
          </p>
        </div>

        {/* 2. Primary Methodology */}
        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700/80 transition-all">
          <div className="flex items-center gap-2 mb-2 text-blue-400">
            <div className="p-1.5 rounded-md bg-blue-500/10 border border-blue-500/20">
              <Wrench className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold uppercase tracking-wider">
              2. Primary Methodology Introduced
            </h4>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed font-normal pl-8">
            {coreConcept.primaryMethodology}
          </p>
        </div>

        {/* 3. Mathematical & Algorithmic Breakthroughs */}
        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700/80 transition-all">
          <div className="flex items-center gap-2 mb-2 text-emerald-400">
            <div className="p-1.5 rounded-md bg-emerald-500/10 border border-emerald-500/20">
              <Cpu className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold uppercase tracking-wider">
              3. Key Mathematical & Algorithmic Breakthroughs
            </h4>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed font-normal pl-8">
            {coreConcept.keyBreakthroughs}
          </p>
        </div>
      </div>
    </div>
  );
};
