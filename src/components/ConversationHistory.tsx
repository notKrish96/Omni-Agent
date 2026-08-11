import React, { useState } from 'react';
import { ChatMessage, Agent, CustomAiConfig } from '../types';
import { History, Brain, Search, Filter, Trash2, Download, Mic, Camera, Terminal, Cpu, ShieldAlert, Sparkles, CheckCircle2, Volume2, ArrowRight } from 'lucide-react';

interface ConversationHistoryProps {
  chatMessages: ChatMessage[];
  agents: Agent[];
  customAiConfig: CustomAiConfig;
  onClearHistory: () => void;
  onLogEntry: (type: any, title: string, detail: string, agentName: string) => void;
}

export const ConversationHistory: React.FC<ConversationHistoryProps> = ({
  chatMessages,
  agents,
  customAiConfig,
  onClearHistory,
  onLogEntry
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilterMode, setSelectedFilterMode] = useState<string>('all');
  const [isAnalyzingHistory, setIsAnalyzingHistory] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);

  // Filter messages
  const filteredMessages = chatMessages.filter(msg => {
    const matchesFilter = selectedFilterMode === 'all' || msg.inputMode === selectedFilterMode;
    const matchesSearch = !searchTerm || msg.text.toLowerCase().includes(searchTerm.toLowerCase()) || (msg.agentName && msg.agentName.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  // Run Gemini Memory Analysis
  const handleAnalyzeHistory = async () => {
    setIsAnalyzingHistory(true);
    try {
      const response = await fetch('/api/history/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          historyMessages: chatMessages,
          customApiKey: customAiConfig.isCustomKeyActive ? customAiConfig.apiKey : undefined
        })
      });

      const json = await response.json();
      if (json.success && json.data) {
        setAnalysisResult(json.data);
        onLogEntry('PREDICTION', 'Memory Analysis Completed', `Synthesized ${json.data.keyInsights?.length || 0} user habit patterns`, 'Pulse Intent Predictor');
      }
    } catch (err) {
      console.error('Failed to analyze history:', err);
    } finally {
      setIsAnalyzingHistory(false);
    }
  };

  // Export memory to JSON file
  const handleExportHistory = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(chatMessages, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `OmniAgent_Memory_History_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <History className="w-5 h-5 text-indigo-400" /> Persistent Conversation Memory & Analysis
            </h2>
            <p className="text-xs text-slate-400">
              OmniAgent remembers voice commands, vision snapshots, and app actions to learn your personal routines.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleAnalyzeHistory}
              disabled={isAnalyzingHistory || chatMessages.length === 0}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg disabled:opacity-50 transition-all"
            >
              <Brain className="w-4 h-4" />
              {isAnalyzingHistory ? "Analyzing Memory..." : "Analyze Habits with AI"}
            </button>

            <button
              onClick={handleExportHistory}
              disabled={chatMessages.length === 0}
              className="px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 font-semibold text-xs flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" /> Export JSON
            </button>

            <button
              onClick={onClearHistory}
              disabled={chatMessages.length === 0}
              className="px-3 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-800/80 text-rose-300 font-semibold text-xs flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear Memory
            </button>
          </div>
        </div>

        {/* Search & Mode Filters */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-800">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search conversation memory..."
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto text-xs">
            <span className="text-slate-500 flex items-center gap-1 text-[11px] font-semibold mr-1">
              <Filter className="w-3.5 h-3.5" /> Filter:
            </span>

            {['all', 'voice', 'vision', 'text', 'mcp'].map((mode) => (
              <button
                key={mode}
                onClick={() => setSelectedFilterMode(mode)}
                className={`px-3 py-1.5 rounded-xl font-semibold capitalize transition-all ${
                  selectedFilterMode === mode
                    ? 'bg-indigo-600 text-white shadow'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Memory Analysis Dashboard (If Generated) */}
      {analysisResult && (
        <div className="bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-slate-900 border border-purple-500/40 rounded-3xl p-6 shadow-2xl space-y-4 animate-in fade-in duration-300">
          <div className="flex items-center justify-between border-b border-purple-900/50 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <h3 className="text-sm font-bold text-white">Gemini Memory & Habit Synthesis</h3>
            </div>
            <span className="text-[10px] font-mono text-purple-300 bg-purple-900/60 px-2.5 py-1 rounded-full border border-purple-700">
              User Context Model
            </span>
          </div>

          <div className="text-xs text-slate-200 leading-relaxed font-medium">
            {analysisResult.summary}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            
            {/* Key Insights */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
              <div className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                <Brain className="w-4 h-4 text-indigo-400" /> Key Observed Habits:
              </div>
              <ul className="list-disc list-inside space-y-1 text-slate-300 text-xs">
                {analysisResult.keyInsights?.map((insight: string, idx: number) => (
                  <li key={idx}>{insight}</li>
                ))}
              </ul>
            </div>

            {/* Recommended Automations */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
              <div className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Recommended New Automations:
              </div>
              <ul className="list-disc list-inside space-y-1 text-slate-300 text-xs">
                {analysisResult.recommendedAutomations?.map((auto: string, idx: number) => (
                  <li key={idx}>{auto}</li>
                ))}
              </ul>
            </div>

          </div>
        </div>
      )}

      {/* Messages Timeline List */}
      <div className="space-y-4">
        {filteredMessages.length === 0 ? (
          <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-3xl space-y-3">
            <History className="w-10 h-10 text-slate-600 mx-auto" />
            <div className="text-slate-400 font-semibold text-xs">No conversation history found matching current filters.</div>
          </div>
        ) : (
          filteredMessages.map((msg) => (
            <div
              key={msg.id}
              className={`p-5 rounded-3xl border shadow-lg space-y-3 transition-all ${
                msg.financialSafetyBlocked
                  ? 'bg-rose-950/30 border-rose-500/60'
                  : msg.sender === 'user'
                  ? 'bg-slate-900 border-slate-800'
                  : 'bg-indigo-950/20 border-indigo-900/50'
              }`}
            >
              
              {/* Message Header */}
              <div className="flex items-center justify-between text-xs border-b border-slate-800/80 pb-2">
                <div className="flex items-center gap-2">
                  {msg.inputMode === 'voice' && <Mic className="w-4 h-4 text-purple-400" />}
                  {msg.inputMode === 'vision' && <Camera className="w-4 h-4 text-emerald-400" />}
                  {msg.inputMode === 'mcp' && <Cpu className="w-4 h-4 text-indigo-400" />}
                  {msg.inputMode === 'text' && <Terminal className="w-4 h-4 text-slate-400" />}

                  <span className="font-bold text-white capitalize">{msg.sender}</span>
                  <span className="text-slate-500">•</span>
                  <span className="font-mono text-[10px] text-slate-400">{msg.timestamp}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400">
                    Mode: {msg.inputMode}
                  </span>
                  {msg.agentName && (
                    <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800/80">
                      {msg.agentName}
                    </span>
                  )}
                </div>
              </div>

              {/* Message Body */}
              <p className="text-xs text-slate-200 leading-relaxed font-sans">
                {msg.text}
              </p>

              {/* Spoken Response detail if present */}
              {msg.spokenResponse && (
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-xs text-indigo-300 italic flex items-start gap-2">
                  <Volume2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <span>TTS Spoken: "{msg.spokenResponse}"</span>
                </div>
              )}

              {/* Financial Safety Guardrail Alert Banner if blocked */}
              {msg.financialSafetyBlocked && (
                <div className="p-3 rounded-xl bg-rose-950 border border-rose-800 text-xs text-rose-200 font-semibold flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>UNBREAKABLE GUARDRAIL TRIGGERED: Banking/Financial operation blocked by system rules.</span>
                </div>
              )}

              {/* Generated Actions Grid */}
              {msg.generatedActions && msg.generatedActions.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Executed App Actions:</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {msg.generatedActions.map((act, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] flex items-center justify-between">
                        <span className="font-bold text-white flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          {act.app}
                        </span>
                        <span className="text-slate-400 text-[10px] truncate max-w-[180px]">{act.detail}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          ))
        )}
      </div>

    </div>
  );
};
