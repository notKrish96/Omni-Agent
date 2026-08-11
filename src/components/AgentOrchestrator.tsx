import React, { useState } from 'react';
import { Agent } from '../types';
import { ShieldCheck, Sparkles, MessageSquareText, Briefcase, Compass, Lock, CheckCircle2, Sliders, Play, Cpu, ArrowRightLeft } from 'lucide-react';

interface AgentOrchestratorProps {
  agents: Agent[];
  activeAgentId: string;
  onSelectAgent: (agentId: string) => void;
  onUpdateAgentInstruction: (agentId: string, newInstruction: string) => void;
  autoRouterEnabled: boolean;
}

export const AgentOrchestrator: React.FC<AgentOrchestratorProps> = ({
  agents,
  activeAgentId,
  onSelectAgent,
  onUpdateAgentInstruction,
  autoRouterEnabled
}) => {
  const [editingAgentId, setEditingAgentId] = useState<string | null>(null);
  const [tempInstruction, setTempInstruction] = useState<string>('');

  const getAgentIcon = (avatar: string) => {
    switch (avatar) {
      case 'ShieldCheck': return <ShieldCheck className="w-5 h-5 text-emerald-400" />;
      case 'Sparkles': return <Sparkles className="w-5 h-5 text-purple-400" />;
      case 'MessageSquareText': return <MessageSquareText className="w-5 h-5 text-blue-400" />;
      case 'Briefcase': return <Briefcase className="w-5 h-5 text-amber-400" />;
      case 'Compass': return <Compass className="w-5 h-5 text-cyan-400" />;
      case 'Lock': return <Lock className="w-5 h-5 text-rose-400" />;
      default: return <Cpu className="w-5 h-5 text-indigo-400" />;
    }
  };

  const activeAgent = agents.find(a => a.id === activeAgentId) || agents[0];

  const handleEdit = (agent: Agent) => {
    setEditingAgentId(agent.id);
    setTempInstruction(agent.systemInstruction);
  };

  const handleSave = (agentId: string) => {
    onUpdateAgentInstruction(agentId, tempInstruction);
    setEditingAgentId(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Explanation */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Multi-Agent OS Orchestrator
              </h2>
              {autoRouterEnabled ? (
                <span className="text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full flex items-center gap-1 font-medium">
                  <ArrowRightLeft className="w-3 h-3 animate-pulse text-indigo-400" /> Dynamic Auto-Switching Active
                </span>
              ) : (
                <span className="text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full">
                  Manual Agent Override
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              Each specialized agent runs autonomously with custom system prompts, app control rules, and power footprints.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs bg-slate-950 p-3 rounded-xl border border-slate-800">
            <div className="text-center px-3 border-r border-slate-800">
              <div className="text-base font-bold text-indigo-400">{agents.length}</div>
              <div className="text-slate-400">Active Personas</div>
            </div>
            <div className="text-center px-3 border-r border-slate-800">
              <div className="text-base font-bold text-emerald-400">
                {agents.reduce((acc, a) => acc + a.totalTasksExecuted, 0)}
              </div>
              <div className="text-slate-400">Tasks Handled</div>
            </div>
            <div className="text-center px-3">
              <div className="text-base font-bold text-cyan-400">0.08%</div>
              <div className="text-slate-400">Avg Power / Task</div>
            </div>
          </div>
        </div>
      </div>

      {/* Agent Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agents.map((agent) => {
          const isActive = agent.id === activeAgentId;
          return (
            <div
              key={agent.id}
              className={`relative rounded-2xl p-5 transition-all border flex flex-col justify-between ${
                isActive
                  ? 'bg-gradient-to-b from-slate-900 to-slate-950 border-indigo-500/60 shadow-xl shadow-indigo-950/40 ring-1 ring-indigo-500/30'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
              }`}
            >
              <div>
                {/* Header info */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-slate-800 border border-slate-700`}>
                      {getAgentIcon(agent.avatar)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white text-sm flex items-center gap-1.5">
                        {agent.name}
                        {isActive && <CheckCircle2 className="w-4 h-4 text-emerald-400 inline" />}
                      </h3>
                      <p className="text-xs text-indigo-400 font-medium">{agent.role}</p>
                    </div>
                  </div>

                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    agent.powerConsumptionRate === 'Low' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/50' :
                    agent.powerConsumptionRate === 'Medium' ? 'bg-amber-950 text-amber-400 border border-amber-800/50' :
                    'bg-rose-950 text-rose-400 border border-rose-800/50'
                  }`}>
                    {agent.powerConsumptionRate} Power
                  </span>
                </div>

                <p className="text-xs text-slate-300 mb-4 leading-relaxed line-clamp-2">
                  {agent.description}
                </p>

                {/* Trigger Condition Box */}
                <div className="bg-slate-950/70 rounded-xl p-3 border border-slate-800 text-xs mb-4">
                  <div className="text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
                    <Sliders className="w-3 h-3 text-indigo-400" /> Auto-Switch Condition:
                  </div>
                  <p className="text-slate-300 italic text-[11px]">"{agent.autoSwitchRule}"</p>
                </div>
              </div>

              {/* Action bar */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs gap-2">
                <span className="text-slate-400">
                  Tasks: <strong className="text-slate-200">{agent.totalTasksExecuted}</strong>
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(agent)}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                  >
                    Prompt & Instructions
                  </button>

                  <button
                    onClick={() => onSelectAgent(agent.id)}
                    disabled={isActive}
                    className={`px-3 py-1 rounded-lg font-medium flex items-center gap-1 transition-all ${
                      isActive
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 cursor-default'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm'
                    }`}
                  >
                    {isActive ? (
                      <>Active</>
                    ) : (
                      <>
                        <Play className="w-3 h-3" /> Select
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit System Instructions Modal */}
      {editingAgentId && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Customize Agent Persona Instructions
              </h3>
              <button
                onClick={() => setEditingAgentId(null)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div>
              <p className="text-xs text-slate-400 mb-2">
                This system instruction guides how Gemini responds and constructs phone automation scripts when this agent is active.
              </p>
              <textarea
                value={tempInstruction}
                onChange={(e) => setTempInstruction(e.target.value)}
                rows={6}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setEditingAgentId(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSave(editingAgentId)}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 shadow-md shadow-indigo-600/30"
              >
                Save Persona Instructions
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
