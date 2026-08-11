import React, { useState } from 'react';
import { LearnedPattern, PredictionItem } from '../types';
import { Sparkles, Brain, Check, X, RefreshCw, Zap, TrendingUp, Cpu, Activity, Lightbulb } from 'lucide-react';

interface PredictiveEngineProps {
  patterns: LearnedPattern[];
  predictions: PredictionItem[];
  onApprovePrediction: (predictionId: string) => void;
  onDismissPrediction: (predictionId: string) => void;
  onTriggerLearningCycle: () => void;
  isLearning: boolean;
}

export const PredictiveEngine: React.FC<PredictiveEngineProps> = ({
  patterns,
  predictions,
  onApprovePrediction,
  onDismissPrediction,
  onTriggerLearningCycle,
  isLearning
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const filteredPatterns = selectedCategory === 'All'
    ? patterns
    : patterns.filter(p => p.category === selectedCategory);

  const categories = ['All', 'Routine', 'Communication', 'App Usage', 'Power Saving'];

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center">
                <Brain className="w-5 h-5 text-indigo-400" />
              </div>
              <h2 className="text-lg font-bold text-white">Adaptive Pattern Engine ("Grows With Me")</h2>
            </div>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              OmniAgent continuously analyzes phone telemetry, time boundaries, app open sequences, and notification response latency to build an evolving habit graph.
            </p>
          </div>

          <button
            onClick={onTriggerLearningCycle}
            disabled={isLearning}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all self-start md:self-auto disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLearning ? 'animate-spin text-purple-300' : ''}`} />
            {isLearning ? 'Analyzing Usage Patterns...' : 'Run Gemini Learning Cycle'}
          </button>
        </div>
      </div>

      {/* Real-time Predictive Feed Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" /> AI Intent Predictions ({predictions.length})
          </h3>
          <span className="text-xs text-slate-400">High-confidence proactive suggestions</span>
        </div>

        {predictions.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-3">
            <Lightbulb className="w-8 h-8 text-indigo-400 mx-auto animate-pulse" />
            <p className="text-sm text-slate-300 font-medium">No active pending predictions right now.</p>
            <p className="text-xs text-slate-400">Click "Run Gemini Learning Cycle" above to generate contextual suggestions based on your phone state.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {predictions.map((pred) => {
              const isApproved = pred.userApproved === true;
              const isDismissed = pred.userApproved === false;

              return (
                <div
                  key={pred.id}
                  className={`rounded-2xl p-5 border transition-all flex flex-col justify-between ${
                    isApproved
                      ? 'bg-emerald-950/30 border-emerald-500/50'
                      : isDismissed
                      ? 'bg-slate-900/40 border-slate-800 opacity-60'
                      : 'bg-slate-900 border-indigo-500/40 shadow-lg shadow-indigo-950/20'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[10px] font-bold text-indigo-300 bg-indigo-950 border border-indigo-800/60 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        {pred.agentName}
                      </span>
                      <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800/50">
                        {pred.confidence}% Confidence
                      </span>
                    </div>

                    <h4 className="font-bold text-white text-sm">{pred.title}</h4>
                    <p className="text-xs text-slate-300 leading-relaxed">{pred.reasoning}</p>

                    <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-xs space-y-1">
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Suggested AI Action:</div>
                      <p className="text-indigo-300 font-medium">{pred.suggestedAction}</p>
                      <div className="text-[10px] text-slate-400 pt-1">Apps involved: <span className="text-slate-200">{pred.targetApp}</span></div>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-mono">{pred.timeContext}</span>

                    {isApproved ? (
                      <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                        <Check className="w-4 h-4" /> Executed
                      </span>
                    ) : isDismissed ? (
                      <span className="text-xs text-slate-500">Dismissed</span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onDismissPrediction(pred.id)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs transition-colors"
                          title="Dismiss prediction"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onApprovePrediction(pred.id)}
                          className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-1 shadow-md transition-all"
                        >
                          <Check className="w-3.5 h-3.5" /> Execute
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Behavioral Patterns Graph / Memory Nodes */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" /> Learned User Habits Memory Bank ({patterns.length})
            </h3>
            <p className="text-xs text-slate-400">Autonomous rules created by AI based on recurring phone behavior.</p>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                  selectedCategory === cat ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPatterns.map((pat) => (
            <div key={pat.id} className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-semibold text-purple-400 bg-purple-950/60 border border-purple-800/40 px-2 py-0.5 rounded-full uppercase">
                    {pat.category}
                  </span>
                  <h4 className="font-bold text-white text-sm mt-1">{pat.patternName}</h4>
                </div>

                <div className="text-right">
                  <div className="text-sm font-bold text-indigo-400">{pat.confidenceScore}% Match</div>
                  <div className="text-[10px] text-slate-400">{pat.occurrencesCount} occurrences</div>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">{pat.description}</p>

              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 text-xs">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Auto-Enforced Rule:</span>
                <span className="text-emerald-300 font-mono text-[11px]">{pat.autoActionRule}</span>
              </div>

              <div className="text-[10px] text-slate-500 pt-1 flex justify-between">
                <span>Last observed: {pat.lastObserved}</span>
                <span className="text-emerald-400 font-semibold">Active Memory Node</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
