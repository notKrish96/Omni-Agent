import React, { useState } from 'react';
import { AutomationRule, LogEntry } from '../types';
import { Play, Pause, Plus, ListFilter, Terminal, Zap, CheckCircle2, Clock, ShieldCheck, ArrowRight, Activity } from 'lucide-react';

interface AutomationStudioProps {
  automations: AutomationRule[];
  logs: LogEntry[];
  onToggleAutomation: (id: string) => void;
  onCreateAutomation: (name: string, triggerCondition: string, steps: string[]) => void;
  onRunTestAutomation: (id: string) => void;
}

export const AutomationStudio: React.FC<AutomationStudioProps> = ({
  automations,
  logs,
  onToggleAutomation,
  onCreateAutomation,
  onRunTestAutomation
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [name, setName] = useState('');
  const [triggerCondition, setTriggerCondition] = useState('');
  const [stepsInput, setStepsInput] = useState('');
  const [logFilter, setLogFilter] = useState<string>('ALL');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !triggerCondition || !stepsInput) return;
    const stepsArray = stepsInput.split('\n').filter(s => s.trim().length > 0);
    onCreateAutomation(name, triggerCondition, stepsArray);
    setName('');
    setTriggerCondition('');
    setStepsInput('');
    setShowCreateModal(false);
  };

  const filteredLogs = logFilter === 'ALL'
    ? logs
    : logs.filter(l => l.type === logFilter);

  return (
    <div className="space-y-6">
      
      {/* Overview Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" /> Background Automation & Macro Studio
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Multi-step automation chains executed continuously by background AI agents. Battery-optimized via batching.
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-2 shadow-md shadow-indigo-900/30 transition-all self-start md:self-auto"
          >
            <Plus className="w-4 h-4" /> Create Macro Sequence
          </button>
        </div>
      </div>

      {/* Active Automations Grid */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
          Active Background Automations ({automations.length})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {automations.map((auto) => {
            const isEnabled = auto.status === 'Enabled';

            return (
              <div
                key={auto.id}
                className={`p-5 rounded-2xl border transition-all space-y-4 ${
                  isEnabled ? 'bg-slate-900 border-indigo-500/40 shadow-lg' : 'bg-slate-900/50 border-slate-800 opacity-70'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-white text-sm flex items-center gap-2">
                      {auto.name}
                      {auto.batteryOptimized && (
                        <span className="text-[10px] text-emerald-400 bg-emerald-950 border border-emerald-800/50 px-2 py-0.5 rounded-full">
                          Eco-Optimized
                        </span>
                      )}
                    </h4>
                    <p className="text-xs text-indigo-400 mt-0.5">Created by: {auto.agentName}</p>
                  </div>

                  <button
                    onClick={() => onToggleAutomation(auto.id)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                      isEnabled ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {isEnabled ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                    {auto.status}
                  </button>
                </div>

                <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-xs space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Trigger Condition:</span>
                  <p className="text-slate-200 font-mono text-[11px]">{auto.triggerCondition}</p>
                </div>

                <div className="space-y-1.5 text-xs">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Action Sequence ({auto.actionSteps.length} steps):</span>
                  <div className="space-y-1 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/80">
                    {auto.actionSteps.map((step, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-slate-300 text-[11px]">
                        <span className="text-indigo-400 font-bold">{idx + 1}.</span>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-3 text-[11px]">
                    <span>Runs: <strong className="text-slate-200">{auto.executionCount}</strong></span>
                    <span>Last: <strong className="text-slate-200">{auto.lastRun}</strong></span>
                  </div>

                  <button
                    onClick={() => onRunTestAutomation(auto.id)}
                    className="px-3 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 text-xs font-medium flex items-center gap-1 transition-colors"
                  >
                    <Play className="w-3 h-3" /> Test Run
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Real-Time Background Execution Log Terminal */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" /> Persistent Background Execution Logs
            </h3>
            <p className="text-xs text-slate-400">Live stream of daemon events, app actions, and AI routing.</p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            {['ALL', 'APP_ACTION', 'AGENT_SWITCH', 'PREDICTION', 'ECO_DAEMON'].map((f) => (
              <button
                key={f}
                onClick={() => setLogFilter(f)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                  logFilter === f ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2 max-h-[360px] overflow-y-auto font-mono text-xs pr-1">
          {filteredLogs.map((log) => (
            <div
              key={log.id}
              className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-2 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-start md:items-center gap-3">
                <span className="text-[10px] text-slate-500 shrink-0">{log.timestamp}</span>
                
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider shrink-0 ${
                  log.type === 'APP_ACTION' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60' :
                  log.type === 'AGENT_SWITCH' ? 'bg-indigo-950 text-indigo-400 border border-indigo-800/60' :
                  log.type === 'ECO_DAEMON' ? 'bg-cyan-950 text-cyan-400 border border-cyan-800/60' :
                  'bg-purple-950 text-purple-400 border border-purple-800/60'
                }`}>
                  {log.type}
                </span>

                <div>
                  <span className="font-bold text-white mr-2">{log.title}:</span>
                  <span className="text-slate-300">{log.detail}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-[11px] text-slate-400 shrink-0">
                <span>By: <strong className="text-indigo-300">{log.agentName}</strong></span>
                {log.impactScore && (
                  <span className="text-emerald-400 font-semibold bg-emerald-950/60 px-2 py-0.5 rounded text-[10px]">
                    {log.impactScore}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal: Create Macro */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCreate} className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Create Multi-Step Automation Sequence</h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs text-slate-300 font-semibold mb-1">Sequence Name</label>
                <input
                  type="text"
                  placeholder="e.g. Late Night Battery & Silent Guard"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 font-semibold mb-1">Trigger Condition</label>
                <input
                  type="text"
                  placeholder="e.g. Time is 11:30 PM AND Charger is plugged in"
                  value={triggerCondition}
                  onChange={(e) => setTriggerCondition(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 font-semibold mb-1">Action Steps (One per line)</label>
                <textarea
                  rows={4}
                  placeholder={`Enable Doze Mode Bypass\nSilence Non-VIP Notifications\nSet Brightness to 0%`}
                  value={stepsInput}
                  onChange={(e) => setStepsInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 shadow-md shadow-indigo-600/30"
              >
                Save Sequence
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
