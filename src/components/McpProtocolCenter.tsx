import React, { useState } from 'react';
import { McpTool, McpInvocationLog, CustomAiConfig } from '../types';
import { Cpu, Terminal, Play, ShieldAlert, CheckCircle2, Lock, Sparkles, Layers, RefreshCw, AlertCircle, ExternalLink, Code } from 'lucide-react';

interface McpProtocolCenterProps {
  mcpTools: McpTool[];
  mcpLogs: McpInvocationLog[];
  customAiConfig: CustomAiConfig;
  onExecuteMcpTool: (toolName: string, appName: string, payload: any) => Promise<any>;
}

export const McpProtocolCenter: React.FC<McpProtocolCenterProps> = ({
  mcpTools,
  mcpLogs,
  customAiConfig,
  onExecuteMcpTool,
}) => {
  const [selectedTool, setSelectedTool] = useState<McpTool>(mcpTools[0]);
  const [inputParamsJson, setInputParamsJson] = useState<string>('{\n  "query": "Iron Man HUD interface overview",\n  "autoPlay": true\n}');
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [executionResult, setExecutionResult] = useState<any | null>(null);

  const handleSelectTool = (tool: McpTool) => {
    setSelectedTool(tool);
    setExecutionResult(null);
    if (tool.toolName === 'youtube_search_and_play') {
      setInputParamsJson('{\n  "query": "Best Android phone AI agents 2026",\n  "autoPlay": true\n}');
    } else if (tool.toolName === 'instagram_search_profile') {
      setInputParamsJson('{\n  "username": "tech_innovator",\n  "hashtag": "#ai_agent"\n}');
    } else if (tool.toolName === 'financial_banking_bridge') {
      setInputParamsJson('{\n  "transferAmount": "$100",\n  "recipient": "External Account"\n}');
    } else if (tool.toolName === 'spotify_player_control') {
      setInputParamsJson('{\n  "trackOrPlaylist": "Deep Focus Synthwave",\n  "action": "PLAY"\n}');
    } else {
      setInputParamsJson('{\n  "param1": "sample_value"\n}');
    }
  };

  const handleRunToolTest = async () => {
    setIsExecuting(true);
    setExecutionResult(null);

    let parsedPayload = {};
    try {
      parsedPayload = JSON.parse(inputParamsJson);
    } catch (e) {
      parsedPayload = { rawInput: inputParamsJson };
    }

    const res = await onExecuteMcpTool(selectedTool.toolName, selectedTool.appName, parsedPayload);
    setExecutionResult(res);
    setIsExecuting(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Cpu className="w-5 h-5 text-indigo-400" /> Model Context Protocol (MCP) Universal App Bridge
            </h2>
            <p className="text-xs text-slate-400">
              OmniAgent uses MCP tool declarations to standardise deep interactions with all downloaded phone apps.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-950 px-3.5 py-1.5 rounded-xl border border-slate-800 text-xs">
            <span className="text-slate-400">Connected App Drivers:</span>
            <span className="font-bold text-emerald-400 font-mono">{mcpTools.length} Apps Ready</span>
          </div>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: List of MCP Tools */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
            Downloaded Phone App MCP Drivers
          </div>

          <div className="space-y-2 max-h-[550px] overflow-y-auto pr-1">
            {mcpTools.map((tool) => {
              const isSelected = selectedTool.id === tool.id;
              const isRestricted = tool.status === 'Restricted';

              return (
                <button
                  key={tool.id}
                  onClick={() => handleSelectTool(tool)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all space-y-2 ${
                    isSelected
                      ? 'bg-indigo-950/40 border-indigo-500 shadow-lg'
                      : isRestricted
                      ? 'bg-rose-950/20 border-rose-900/50 hover:bg-rose-950/40'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs flex items-center gap-2">
                      {isRestricted ? (
                        <Lock className="w-4 h-4 text-rose-400 shrink-0" />
                      ) : (
                        <Layers className="w-4 h-4 text-indigo-400 shrink-0" />
                      )}
                      {tool.appName}
                    </span>

                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                        tool.status === 'Connected'
                          ? 'bg-emerald-950 border-emerald-800 text-emerald-300'
                          : tool.status === 'Ready'
                          ? 'bg-indigo-950 border-indigo-800 text-indigo-300'
                          : 'bg-rose-950 border-rose-800 text-rose-300'
                      }`}
                    >
                      {tool.status}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">
                    {tool.description}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1">
                    <span>Tool: {tool.toolName}</span>
                    <span>Executions: {tool.executionsCount}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Interactive MCP Payload Test & Execution Inspector */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
          
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <span className="text-[10px] font-mono text-indigo-400 bg-indigo-950 px-2.5 py-1 rounded border border-indigo-800">
                MCP DRIVER SPECIFICATION
              </span>
              <h3 className="text-base font-bold text-white mt-1.5 flex items-center gap-2">
                <Code className="w-4 h-4 text-purple-400" /> {selectedTool.appName} ({selectedTool.toolName})
              </h3>
            </div>

            {selectedTool.status === 'Restricted' && (
              <span className="text-xs font-bold text-rose-400 flex items-center gap-1 bg-rose-950 px-3 py-1.5 rounded-xl border border-rose-800">
                <ShieldAlert className="w-4 h-4" /> BANKING BLOCKED
              </span>
            )}
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            {selectedTool.description}
          </p>

          {/* Parameters List */}
          <div className="space-y-1.5">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Accepted MCP Parameters:</div>
            <div className="flex flex-wrap gap-1.5">
              {selectedTool.parameters.map((param, i) => (
                <span key={i} className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 font-mono text-indigo-300 text-[11px]">
                  {param}
                </span>
              ))}
            </div>
          </div>

          {/* JSON Payload Editor */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
              <span>Test MCP Tool Input Payload (JSON)</span>
              <span className="text-[10px] font-mono text-slate-500">MCP Protocol v1.0</span>
            </label>

            <textarea
              rows={4}
              value={inputParamsJson}
              onChange={(e) => setInputParamsJson(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-2xl p-3.5 text-xs text-emerald-400 font-mono focus:outline-none shadow-inner"
            />
          </div>

          {/* Run Button */}
          <button
            onClick={handleRunToolTest}
            disabled={isExecuting}
            className={`w-full py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xl ${
              selectedTool.status === 'Restricted'
                ? 'bg-rose-950 hover:bg-rose-900 border border-rose-800 text-rose-200'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
            }`}
          >
            {isExecuting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> Executing MCP Tool Call...
              </>
            ) : selectedTool.status === 'Restricted' ? (
              <>
                <ShieldAlert className="w-4 h-4 text-rose-400" /> Test Restricted Banking Driver (Safety Policy Test)
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" /> Execute MCP Tool Call on Phone
              </>
            )}
          </button>

          {/* Execution Result payload output */}
          {executionResult && (
            <div className={`p-4 rounded-2xl border space-y-2 animate-in fade-in duration-200 ${
              executionResult.data?.blockedByFinancialSafety
                ? 'bg-rose-950/40 border-rose-500/80 text-rose-200'
                : 'bg-slate-950 border-emerald-500/50 text-slate-200'
            }`}>
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="flex items-center gap-1.5">
                  {executionResult.data?.blockedByFinancialSafety ? (
                    <ShieldAlert className="w-4 h-4 text-rose-400" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  )}
                  MCP Tool Output Result:
                </span>
                <span className="font-mono text-[10px] text-slate-400">
                  Latency: {executionResult.data?.executionTimeMs || 18}ms
                </span>
              </div>

              <div className="font-mono text-[11px] leading-relaxed p-3 bg-slate-950/80 rounded-xl border border-slate-800/80 overflow-x-auto">
                {executionResult.data?.outputResult || JSON.stringify(executionResult, null, 2)}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
