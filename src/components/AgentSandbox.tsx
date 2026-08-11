import React, { useState } from 'react';
import { Agent } from '../types';
import { Send, Sparkles, Terminal, Cpu, ShieldCheck, CheckCircle2, ArrowRight, CornerDownLeft, Loader2, AlertCircle } from 'lucide-react';

interface AgentSandboxProps {
  agents: Agent[];
  activeAgentId: string;
  onExecuteCommand: (prompt: string) => Promise<any>;
  isLoading: boolean;
  lastCommandResult: any | null;
}

export const AgentSandbox: React.FC<AgentSandboxProps> = ({
  agents,
  activeAgentId,
  onExecuteCommand,
  isLoading,
  lastCommandResult
}) => {
  const [inputPrompt, setInputPrompt] = useState('');

  const quickPrompts = [
    "Clean up background RAM and optimize battery for my phone",
    "Check unread WhatsApp group messages and summarize urgent action items",
    "Predict my evening routine: check commute traffic and start Spotify Daily Drive",
    "Auto-reply to incoming emails during my meeting and update Slack status",
    "Sanitize clipboard and audit privacy permissions for recently installed apps"
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputPrompt.trim() || isLoading) return;
    onExecuteCommand(inputPrompt);
  };

  const handleQuickPromptClick = (promptText: string) => {
    setInputPrompt(promptText);
    onExecuteCommand(promptText);
  };

  const activeAgent = agents.find(a => a.id === activeAgentId) || agents[0];

  return (
    <div className="space-y-6">
      
      {/* Top Banner / Command Input Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Terminal className="w-5 h-5 text-indigo-400" /> Mobile OS Agent Command Center & Sandbox
            </h2>
            <p className="text-xs text-slate-400">
              Type any command to control phone apps, automate routines, or evaluate real Gemini AI agent decisions.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            <span className="text-slate-400">Active Routing:</span>
            <span className="font-semibold text-indigo-300 flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5 text-indigo-400" /> {activeAgent.name}
            </span>
          </div>
        </div>

        {/* Command Form */}
        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            placeholder="Ask AI Agents to control phone (e.g., 'Summarize unread WhatsApp messages & set battery saver mode')..."
            className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-2xl py-3.5 pl-4 pr-28 text-xs text-white placeholder-slate-500 focus:outline-none shadow-inner"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!inputPrompt.trim() || isLoading}
            className="absolute right-2 top-2 bottom-2 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs flex items-center gap-1.5 disabled:opacity-50 transition-all shadow-md"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" /> Executing...
              </>
            ) : (
              <>
                Send <Send className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Quick Suggestion Pills */}
        <div>
          <div className="text-[11px] font-semibold text-slate-400 mb-2 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" /> One-Tap Quick Phone Commands:
          </div>
          <div className="flex flex-wrap gap-2">
            {quickPrompts.map((qp, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleQuickPromptClick(qp)}
                disabled={isLoading}
                className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-[11px] text-slate-300 hover:text-white transition-all text-left truncate max-w-xs"
              >
                "{qp}"
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Real Gemini AI Execution Output Display */}
      {lastCommandResult && (
        <div className="bg-slate-900 border border-indigo-500/50 rounded-2xl p-6 shadow-2xl space-y-6 animate-in fade-in duration-300">
          
          {/* Header of Result */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-950 border border-indigo-800/80 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <div className="text-xs text-indigo-400 font-semibold uppercase tracking-wider">
                  Agent Executed: {lastCommandResult.chosenAgentName || activeAgent.name}
                </div>
                <h3 className="text-base font-bold text-white mt-0.5">
                  {lastCommandResult.responseSummary || "Command processed successfully."}
                </h3>
              </div>
            </div>

            <div className="text-xs bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 flex items-center gap-2 self-start md:self-auto">
              <span className="text-slate-400">Power Footprint:</span>
              <span className="font-mono font-bold text-emerald-400">{lastCommandResult.batteryImpact || "Minimal - 0.02% battery"}</span>
            </div>
          </div>

          {/* AI Thought Process & Reasoning */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-purple-400" /> Gemini Agent Reasoning & Strategy
            </h4>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed font-mono">
              {lastCommandResult.thoughtProcess}
            </div>
          </div>

          {/* Generated App Macros / Phone Actions */}
          {lastCommandResult.generatedActions && lastCommandResult.generatedActions.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Synthesized App Macro Steps ({lastCommandResult.generatedActions.length})
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {lastCommandResult.generatedActions.map((act: any, idx: number) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-indigo-900 text-indigo-200 text-[10px] flex items-center justify-center font-bold">
                          {idx + 1}
                        </span>
                        {act.app}
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full">
                        {act.actionType}
                      </span>
                    </div>
                    <p className="text-slate-300 text-[11px] pl-6 leading-relaxed">{act.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Predicted Needs */}
          {lastCommandResult.predictedNeeds && lastCommandResult.predictedNeeds.length > 0 && (
            <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-800/40 space-y-2 text-xs">
              <div className="font-bold text-indigo-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Proactive Follow-up Predictions:
              </div>
              <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px]">
                {lastCommandResult.predictedNeeds.map((need: string, idx: number) => (
                  <li key={idx}>{need}</li>
                ))}
              </ul>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
