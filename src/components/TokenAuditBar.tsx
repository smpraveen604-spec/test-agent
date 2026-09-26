import React from 'react';
import { TokenAudit } from '../types';
import { ShieldCheck, Zap, Cpu, Sparkles, CheckCircle2 } from 'lucide-react';

interface Props {
  audit?: TokenAudit;
}

export const TokenAuditBar: React.FC<Props> = ({ audit }) => {
  if (!audit) return null;

  const percent = Math.min(100, audit.budgetUsedPercent || 0);
  const isHealthy = audit.totalTokens <= 25000;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm backdrop-blur-md">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Operational Constraint
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="w-3 h-3" /> Budget Verified
              </span>
            </div>
            <p className="text-xs text-slate-300 font-medium">
              Token Efficiency Target: <span className="text-emerald-400 font-mono font-semibold">&lt; 25,000 Tokens</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">Prompt:</span>
            <span className="text-slate-200">{audit.promptTokens.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">Output:</span>
            <span className="text-slate-200">{audit.candidatesTokens.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700">
            <Zap className="w-3 h-3 text-amber-400" />
            <span className="text-slate-200 font-semibold">{audit.totalTokens.toLocaleString()}</span>
            <span className="text-slate-500">/ 25k</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800/80 p-0.5">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${
              percent < 50
                ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                : percent < 80
                ? 'bg-gradient-to-r from-teal-400 to-amber-400'
                : 'bg-gradient-to-r from-amber-400 to-rose-500'
            }`}
            style={{ width: `${Math.max(2, percent)}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <Cpu className="w-3 h-3 text-indigo-400" />
            <span>Budget Utilized: <span className="font-semibold text-slate-200 font-mono">{percent}%</span></span>
            <span className="text-slate-600">•</span>
            <span className="text-emerald-400">{audit.efficiencyRating}</span>
          </div>
          <div className="flex items-center gap-1 text-slate-400">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span>Saved ~<span className="font-mono text-cyan-300 font-medium">{audit.savedTokensEstimate.toLocaleString()}</span> tokens vs unconstrained PDF dumping</span>
          </div>
        </div>
      </div>
    </div>
  );
};
