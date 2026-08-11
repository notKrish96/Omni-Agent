import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { AgentOrchestrator } from './components/AgentOrchestrator';
import { AppControlCenter } from './components/AppControlCenter';
import { PredictiveEngine } from './components/PredictiveEngine';
import { AutomationStudio } from './components/AutomationStudio';
import { BatteryEcoDaemon } from './components/BatteryEcoDaemon';
import { AgentSandbox } from './components/AgentSandbox';
import { JarvisLiveVisionVoice } from './components/JarvisLiveVisionVoice';
import { ConversationHistory } from './components/ConversationHistory';
import { McpProtocolCenter } from './components/McpProtocolCenter';
import { CustomAiApiKeyModal } from './components/CustomAiApiKeyModal';

import { auth, googleProvider, db, testFirestoreConnection, handleFirestoreError, OperationType } from './lib/firebase';
import { onAuthStateChanged, signInWithPopup, signOut, User as FirebaseUser } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

import {
  INITIAL_AGENTS,
  INITIAL_APPS,
  INITIAL_LEARNED_PATTERNS,
  INITIAL_PREDICTIONS,
  INITIAL_AUTOMATIONS,
  INITIAL_BATTERY_PROFILE,
  INITIAL_LOGS,
  INITIAL_CUSTOM_AI_CONFIG,
  INITIAL_CHAT_MESSAGES,
  INITIAL_MCP_TOOLS,
  INITIAL_MCP_LOGS
} from './data/mockSystem';

import { Agent, AppControl, LearnedPattern, PredictionItem, AutomationRule, BatteryProfile, LogEntry, BatteryMode, CustomAiConfig, ChatMessage, McpTool, McpInvocationLog } from './types';
import { Terminal, Cpu, Smartphone, Brain, Zap, BatteryCharging, CheckCircle, ShieldAlert, Radio, History, Key } from 'lucide-react';

export default function App() {
  const [activeCategory, setActiveCategory] = useState<'assistant' | 'intelligence' | 'mobile_os' | 'automation_power'>('assistant');
  const [activeSubTab, setActiveSubTab] = useState<string>('jarvis');
  
  // Firebase Auth State
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);

  useEffect(() => {
    testFirestoreConnection();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setFirebaseUser(currentUser);
      if (currentUser) {
        showToast(`Firebase Sync Active: ${currentUser.email || currentUser.displayName}`);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleFirebaseSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error('Firebase Auth Error:', err);
      showToast('Firebase login cancelled or blocked.');
    }
  };

  const handleFirebaseSignOut = async () => {
    try {
      await signOut(auth);
      showToast('Signed out of Firebase.');
    } catch (err) {
      console.error('Firebase SignOut Error:', err);
    }
  };

  // App system state
  const [agents, setAgents] = useState<Agent[]>(INITIAL_AGENTS);
  const [activeAgentId, setActiveAgentId] = useState<string>('agent-system-governor');
  const [autoRouterEnabled, setAutoRouterEnabled] = useState<boolean>(true);
  
  const [apps, setApps] = useState<AppControl[]>(INITIAL_APPS);
  const [patterns, setPatterns] = useState<LearnedPattern[]>(INITIAL_LEARNED_PATTERNS);
  const [predictions, setPredictions] = useState<PredictionItem[]>(INITIAL_PREDICTIONS);
  const [automations, setAutomations] = useState<AutomationRule[]>(INITIAL_AUTOMATIONS);
  const [batteryProfile, setBatteryProfile] = useState<BatteryProfile>(INITIAL_BATTERY_PROFILE);
  const [logs, setLogs] = useState<LogEntry[]>(INITIAL_LOGS);

  // New Features State
  const [customAiConfig, setCustomAiConfig] = useState<CustomAiConfig>(INITIAL_CUSTOM_AI_CONFIG);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(INITIAL_CHAT_MESSAGES);
  const [mcpTools, setMcpTools] = useState<McpTool[]>(INITIAL_MCP_TOOLS);
  const [mcpLogs, setMcpLogs] = useState<McpInvocationLog[]>(INITIAL_MCP_LOGS);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState<boolean>(false);

  // Switch category helper
  const handleCategoryChange = (cat: 'assistant' | 'intelligence' | 'mobile_os' | 'automation_power') => {
    setActiveCategory(cat);
    if (cat === 'assistant') setActiveSubTab('jarvis');
    else if (cat === 'intelligence') setActiveSubTab('orchestrator');
    else if (cat === 'mobile_os') setActiveSubTab('apps');
    else if (cat === 'automation_power') setActiveSubTab('automations');
  };

  // Command Execution State
  const [isCommandLoading, setIsCommandLoading] = useState<boolean>(false);
  const [lastCommandResult, setLastCommandResult] = useState<any | null>(null);
  const [isLearning, setIsLearning] = useState<boolean>(false);
  const [isRefreshingTelemetry, setIsRefreshingTelemetry] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const activeAgent = agents.find(a => a.id === activeAgentId) || agents[0];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Switch Active Agent
  const handleSelectAgent = (agentId: string) => {
    setActiveAgentId(agentId);
    const selectedAgent = agents.find(a => a.id === agentId);
    if (selectedAgent) {
      showToast(`Switched active agent to ${selectedAgent.name}`);
      addLogEntry('AGENT_SWITCH', `Manual Switch to ${selectedAgent.name}`, `User manually engaged ${selectedAgent.role}`, selectedAgent.name, 'User Switch');
    }
  };

  // Update Agent Instruction
  const handleUpdateAgentInstruction = (agentId: string, newInstruction: string) => {
    setAgents(prev => prev.map(a => a.id === agentId ? { ...a, systemInstruction: newInstruction } : a));
    showToast('Agent persona instructions updated.');
  };

  // Toggle App Permissions
  const handleTogglePermission = (appId: string, permissionKey: keyof AppControl) => {
    setApps(prev => prev.map(app => {
      if (app.id === appId) {
        const currentVal = Boolean(app[permissionKey]);
        return { ...app, [permissionKey]: !currentVal };
      }
      return app;
    }));
    showToast('App system permission updated.');
  };

  // Grant All Permissions
  const handleGrantAllPermissions = () => {
    setApps(prev => prev.map(app => ({
      ...app,
      accessibilityGranted: true,
      notificationListenerGranted: true,
      overlayGranted: true,
      autoStartGranted: true,
      batteryUnrestricted: true
    })));
    showToast('All deep system permissions granted across mobile app fleet.');
    addLogEntry('PERMISSION', 'Full Permission Audit Granted', 'Granted Accessibility, Notifications, Overlay & Battery Saver exemption across 10 apps', 'Aegis Core Governor', 'Complete Access');
  };

  // Add Custom App Macro
  const handleAddAutoAction = (appId: string, title: string, trigger: string, action: string) => {
    setApps(prev => prev.map(app => {
      if (app.id === appId) {
        return {
          ...app,
          autoActions: [
            ...app.autoActions,
            { id: `action-${Date.now()}`, title, trigger, action, enabled: true, executedCount: 0 }
          ]
        };
      }
      return app;
    }));
    showToast('New app macro rule created successfully.');
  };

  // Approve AI Prediction
  const handleApprovePrediction = (predictionId: string) => {
    setPredictions(prev => prev.map(p => p.id === predictionId ? { ...p, userApproved: true } : p));
    const target = predictions.find(p => p.id === predictionId);
    if (target) {
      showToast(`Executed: ${target.title}`);
      addLogEntry('USER_EXECUTION', target.title, target.suggestedAction, target.agentName, 'Prediction Approved');
    }
  };

  // Dismiss AI Prediction
  const handleDismissPrediction = (predictionId: string) => {
    setPredictions(prev => prev.map(p => p.id === predictionId ? { ...p, userApproved: false } : p));
    showToast('Prediction dismissed.');
  };

  // Trigger Gemini Learning Cycle
  const handleTriggerLearningCycle = async () => {
    setIsLearning(true);
    try {
      const response = await fetch('/api/gemini/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timeContext: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          userContext: 'Active Phone Usage & System Routine',
          batteryLevel: batteryProfile.batteryLevel,
          customApiKey: customAiConfig.isCustomKeyActive ? customAiConfig.apiKey : undefined
        })
      });

      const json = await response.json();
      if (json.success && Array.isArray(json.data)) {
        const newPreds: PredictionItem[] = json.data.map((item: any, idx: number) => ({
          id: `pred-live-${Date.now()}-${idx}`,
          agentId: activeAgentId,
          agentName: activeAgent.name,
          title: item.title || 'Contextual Automation',
          reasoning: item.reasoning || 'Gemini detected high-probability habit sequence.',
          suggestedAction: item.suggestedAction || 'Automate background sync',
          targetApp: item.targetApp || 'System',
          timeContext: 'Current',
          confidence: item.confidence || 92
        }));

        setPredictions(prev => [...newPreds, ...prev]);
        showToast(`Generated ${newPreds.length} new predictions from Gemini AI.`);
        addLogEntry('PREDICTION', 'Gemini Learning Cycle Completed', `Synthesized ${newPreds.length} high-confidence predictions based on context.`, 'Pulse Intent Predictor', 'New Habits Learned');
      } else {
        showToast('Learning cycle completed.');
      }
    } catch (err) {
      console.error('Error during learning cycle:', err);
      showToast('Learning cycle executed locally.');
    } finally {
      setIsLearning(false);
    }
  };

  // Execute Command via Gemini
  const handleExecuteCommand = async (prompt: string, mode: 'text' | 'voice' | 'vision' = 'text') => {
    setIsCommandLoading(true);

    // Save user message in persistent conversation history
    const userMsg: ChatMessage = {
      id: `msg-u-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sender: 'user',
      inputMode: mode,
      text: prompt,
      agentName: 'User Input'
    };
    setChatMessages(prev => [...prev, userMsg]);

    try {
      const availableAppNames = apps.map(a => a.name);

      const response = await fetch('/api/gemini/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          activeAgentName: activeAgent.name,
          batteryMode: batteryProfile.mode,
          availableApps: availableAppNames,
          customApiKey: customAiConfig.isCustomKeyActive ? customAiConfig.apiKey : undefined
        })
      });

      const json = await response.json();
      if (json.success && json.data) {
        setLastCommandResult(json.data);

        if (json.data.chosenAgentId && json.data.chosenAgentId !== activeAgentId && autoRouterEnabled) {
          const matchAgent = agents.find(a => a.id === json.data.chosenAgentId || a.name.toLowerCase().includes(json.data.chosenAgentName.toLowerCase()));
          if (matchAgent) {
            setActiveAgentId(matchAgent.id);
            addLogEntry('AGENT_SWITCH', `Auto-Routed to ${matchAgent.name}`, `Gemini auto-selected ${matchAgent.name} for task execution`, matchAgent.name, 'Auto-Switch');
          }
        }

        // Add assistant response to history
        const assistantMsg: ChatMessage = {
          id: `msg-a-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          sender: 'assistant',
          inputMode: mode,
          text: json.data.responseSummary || 'Command executed.',
          spokenResponse: json.data.spokenUtterance || json.data.responseSummary,
          agentName: json.data.chosenAgentName || activeAgent.name,
          financialSafetyBlocked: json.data.financialSafetyBlocked,
          generatedActions: json.data.executedAppActions?.map((act: any) => ({
            app: act.app,
            actionType: act.actionType || 'MCP_TOOL_INVOKE',
            detail: act.details || act.action,
            status: 'SUCCESS'
          }))
        };
        setChatMessages(prev => [...prev, assistantMsg]);

        addLogEntry(
          json.data.financialSafetyBlocked ? 'SAFETY_BLOCK' : 'USER_EXECUTION',
          prompt,
          json.data.responseSummary || 'Command executed',
          json.data.chosenAgentName || activeAgent.name,
          json.data.batteryImpact || 'Minimal'
        );

        showToast('AI Agents executed phone command successfully.');
        return json.data;
      } else if (json.error) {
        showToast(`Error: ${json.error}`);
      }
    } catch (err: any) {
      console.error('Command Execution Error:', err);
      showToast('Failed to connect to backend server');
    } finally {
      setIsCommandLoading(false);
    }
  };

  // Execute MCP Tool directly
  const handleExecuteMcpTool = async (toolName: string, appName: string, payload: any) => {
    try {
      const response = await fetch('/api/mcp/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toolName,
          appName,
          payload,
          customApiKey: customAiConfig.isCustomKeyActive ? customAiConfig.apiKey : undefined
        })
      });

      const json = await response.json();
      
      if (json.success && json.data) {
        const newMcpLog: McpInvocationLog = {
          id: `mcplog-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          toolName,
          appName,
          inputPayload: payload,
          outputResult: json.data.outputResult,
          executionTimeMs: json.data.executionTimeMs,
          blockedByFinancialSafety: json.data.blockedByFinancialSafety
        };
        setMcpLogs(prev => [newMcpLog, ...prev]);

        // Increment execution count for tool if not restricted
        setMcpTools(prev => prev.map(t => t.toolName === toolName ? { ...t, executionsCount: t.executionsCount + 1 } : t));

        addLogEntry(
          json.data.blockedByFinancialSafety ? 'SAFETY_BLOCK' : 'APP_ACTION',
          `MCP Tool Invoked: ${toolName}`,
          json.data.outputResult,
          activeAgent.name
        );

        showToast(json.data.blockedByFinancialSafety ? 'SAFETY GUARDRAIL ENFORCED' : `MCP Tool Executed on ${appName}`);
        return json;
      }
    } catch (err) {
      console.error('MCP execution error:', err);
      showToast('MCP tool execution failed.');
    }
  };

  // Toggle Automation
  const handleToggleAutomation = (id: string) => {
    setAutomations(prev => prev.map(a => a.id === id ? { ...a, status: a.status === 'Enabled' ? 'Paused' : 'Enabled' } : a));
    showToast('Automation status updated.');
  };

  // Create Automation Rule
  const handleCreateAutomation = (name: string, triggerCondition: string, steps: string[]) => {
    const newAuto: AutomationRule = {
      id: `auto-${Date.now()}`,
      name,
      triggerCondition,
      actionSteps: steps,
      createdByAgentId: activeAgent.id,
      agentName: activeAgent.name,
      executionCount: 0,
      lastRun: 'Just now',
      batteryOptimized: true,
      status: 'Enabled'
    };
    setAutomations(prev => [newAuto, ...prev]);
    showToast('New multi-step background automation created.');
    addLogEntry('APP_ACTION', `Automation Created: ${name}`, `Trigger: ${triggerCondition}`, activeAgent.name, 'Macro Active');
  };

  // Run Test Automation
  const handleRunTestAutomation = (id: string) => {
    const target = automations.find(a => a.id === id);
    if (target) {
      setAutomations(prev => prev.map(a => a.id === id ? { ...a, executionCount: a.executionCount + 1, lastRun: 'Just now' } : a));
      showToast(`Test Run Executed: ${target.name}`);
      addLogEntry('USER_EXECUTION', `Test Run: ${target.name}`, `Executed ${target.actionSteps.length} macro steps in simulator`, target.agentName, 'Success');
    }
  };

  // Battery Mode Change
  const handleChangeBatteryMode = (mode: BatteryMode) => {
    let freq = 15;
    let percent = 4.2;
    if (mode === 'Ultra-Eco') { freq = 60; percent = 2.0; }
    if (mode === 'Performance') { freq = 2; percent = 11.5; }

    setBatteryProfile(prev => ({
      ...prev,
      mode,
      inferenceFrequencySeconds: freq,
      dailyConsumptionPercent: percent
    }));
    showToast(`Battery mode set to ${mode}`);
    addLogEntry('ECO_DAEMON', `Battery Mode Changed to ${mode}`, `Polling interval set to ${freq}s`, 'Aegis Core Governor', 'Eco Savings');
  };

  // Toggle Batch Inference
  const handleToggleBatchInference = () => {
    setBatteryProfile(prev => ({ ...prev, batchInferenceEnabled: !prev.batchInferenceEnabled }));
    showToast('Batch inference setting toggled.');
  };

  // Toggle Doze Bypass
  const handleToggleDozeBypass = () => {
    setBatteryProfile(prev => ({ ...prev, dozeBypassActive: !prev.dozeBypassActive }));
    showToast('Doze mode setting toggled.');
  };

  // Refresh Telemetry
  const handleRefreshTelemetry = () => {
    setIsRefreshingTelemetry(true);
    setTimeout(() => {
      setIsRefreshingTelemetry(false);
      showToast('System telemetry refreshed.');
    }, 800);
  };

  // Add Log Entry Helper
  const addLogEntry = async (type: LogEntry['type'], title: string, detail: string, agentName: string, impactScore?: string) => {
    const newLog: LogEntry = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type,
      title,
      detail,
      agentName,
      impactScore
    };
    setLogs(prev => [newLog, ...prev.slice(0, 40)]);

    // Optionally sync log to Firestore when user authenticated
    if (auth.currentUser) {
      const uid = auth.currentUser.uid;
      const path = `users/${uid}/logs/${newLog.id}`;
      try {
        await setDoc(doc(db, 'users', uid, 'logs', newLog.id), {
          id: newLog.id,
          userId: uid,
          type: newLog.type,
          title: newLog.title,
          detail: newLog.detail,
          agent: newLog.agentName,
          timestamp: new Date().toISOString()
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, path);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col selection:bg-indigo-500 selection:text-white">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-indigo-600 text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-5 border border-indigo-400/40">
          <CheckCircle className="w-4 h-4 text-emerald-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Persistent Header */}
      <Header
        autoRouterEnabled={autoRouterEnabled}
        setAutoRouterEnabled={setAutoRouterEnabled}
        batteryProfile={batteryProfile}
        activeAgentName={activeAgent.name}
        totalAgentsCount={agents.length}
        totalAppsCount={apps.length}
        totalAutomationsCount={automations.length}
        onRefreshTelemetry={handleRefreshTelemetry}
        isRefreshing={isRefreshingTelemetry}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
        isCustomKeyActive={customAiConfig.isCustomKeyActive}
        firebaseUser={firebaseUser}
        onFirebaseSignIn={handleFirebaseSignIn}
        onFirebaseSignOut={handleFirebaseSignOut}
      />

      {/* Custom AI Key Configuration Modal */}
      <CustomAiApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        config={customAiConfig}
        onSaveConfig={(newConfig) => {
          setCustomAiConfig(newConfig);
          showToast('Custom AI Key configuration saved.');
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">
        
        {/* Primary Category Navigation Bar */}
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 p-2 rounded-2xl shadow-xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-1.5 w-full">
            
            {/* Category 1: Voice & Assistant */}
            <button
              onClick={() => handleCategoryChange('assistant')}
              className={`p-3 rounded-xl text-left transition-all flex items-center gap-3 border ${
                activeCategory === 'assistant'
                  ? 'bg-gradient-to-r from-indigo-600/90 to-purple-600/90 text-white border-indigo-400/50 shadow-lg shadow-indigo-500/20'
                  : 'bg-slate-950/60 hover:bg-slate-800/80 text-slate-400 border-slate-800/80 hover:text-slate-200'
              }`}
            >
              <div className={`p-2 rounded-lg shrink-0 ${activeCategory === 'assistant' ? 'bg-white/20 text-white' : 'bg-slate-900 text-indigo-400'}`}>
                <Radio className="w-5 h-5 animate-pulse" />
              </div>
              <div className="truncate">
                <div className="text-xs font-bold leading-tight truncate">Jarvis Assistant</div>
                <div className="text-[10px] opacity-70 truncate font-mono">Live Vision & Call</div>
              </div>
            </button>

            {/* Category 2: Agent Intelligence */}
            <button
              onClick={() => handleCategoryChange('intelligence')}
              className={`p-3 rounded-xl text-left transition-all flex items-center gap-3 border ${
                activeCategory === 'intelligence'
                  ? 'bg-gradient-to-r from-indigo-600/90 to-purple-600/90 text-white border-indigo-400/50 shadow-lg shadow-indigo-500/20'
                  : 'bg-slate-950/60 hover:bg-slate-800/80 text-slate-400 border-slate-800/80 hover:text-slate-200'
              }`}
            >
              <div className={`p-2 rounded-lg shrink-0 ${activeCategory === 'intelligence' ? 'bg-white/20 text-white' : 'bg-slate-900 text-purple-400'}`}>
                <Cpu className="w-5 h-5" />
              </div>
              <div className="truncate">
                <div className="text-xs font-bold leading-tight truncate">Agent Intelligence</div>
                <div className="text-[10px] opacity-70 truncate font-mono">{agents.length} Autonomous Agents</div>
              </div>
            </button>

            {/* Category 3: Mobile OS & Apps */}
            <button
              onClick={() => handleCategoryChange('mobile_os')}
              className={`p-3 rounded-xl text-left transition-all flex items-center gap-3 border ${
                activeCategory === 'mobile_os'
                  ? 'bg-gradient-to-r from-indigo-600/90 to-purple-600/90 text-white border-indigo-400/50 shadow-lg shadow-indigo-500/20'
                  : 'bg-slate-950/60 hover:bg-slate-800/80 text-slate-400 border-slate-800/80 hover:text-slate-200'
              }`}
            >
              <div className={`p-2 rounded-lg shrink-0 ${activeCategory === 'mobile_os' ? 'bg-white/20 text-white' : 'bg-slate-900 text-cyan-400'}`}>
                <Smartphone className="w-5 h-5" />
              </div>
              <div className="truncate">
                <div className="text-xs font-bold leading-tight truncate">Mobile OS & Apps</div>
                <div className="text-[10px] opacity-70 truncate font-mono">{apps.length} App Drivers & MCP</div>
              </div>
            </button>

            {/* Category 4: Automations & System */}
            <button
              onClick={() => handleCategoryChange('automation_power')}
              className={`p-3 rounded-xl text-left transition-all flex items-center gap-3 border ${
                activeCategory === 'automation_power'
                  ? 'bg-gradient-to-r from-indigo-600/90 to-purple-600/90 text-white border-indigo-400/50 shadow-lg shadow-indigo-500/20'
                  : 'bg-slate-950/60 hover:bg-slate-800/80 text-slate-400 border-slate-800/80 hover:text-slate-200'
              }`}
            >
              <div className={`p-2 rounded-lg shrink-0 ${activeCategory === 'automation_power' ? 'bg-white/20 text-white' : 'bg-slate-900 text-emerald-400'}`}>
                <Zap className="w-5 h-5" />
              </div>
              <div className="truncate">
                <div className="text-xs font-bold leading-tight truncate">Automations & Power</div>
                <div className="text-[10px] opacity-70 truncate font-mono">Macros & Eco-Governor</div>
              </div>
            </button>

          </div>

        </div>

        {/* Secondary Sub-Category Pills */}
        <div className="flex items-center justify-between bg-slate-950 border border-slate-800/80 px-4 py-2.5 rounded-xl text-xs">
          
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-0.5">
            <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider font-semibold mr-1 shrink-0">Sub-Tab:</span>

            {/* Assistant Sub-Tabs */}
            {activeCategory === 'assistant' && (
              <>
                <button
                  onClick={() => setActiveSubTab('jarvis')}
                  className={`px-3.5 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                    activeSubTab === 'jarvis'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <Radio className="w-3.5 h-3.5 text-indigo-300" /> Jarvis Live Vision & Call
                </button>
                <button
                  onClick={() => setActiveSubTab('sandbox')}
                  className={`px-3.5 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                    activeSubTab === 'sandbox'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5 text-purple-300" /> Command Center
                </button>
                <button
                  onClick={() => setActiveSubTab('history')}
                  className={`px-3.5 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                    activeSubTab === 'history'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <History className="w-3.5 h-3.5 text-pink-300" /> Conversation Memory ({chatMessages.length})
                </button>
              </>
            )}

            {/* Intelligence Sub-Tabs */}
            {activeCategory === 'intelligence' && (
              <>
                <button
                  onClick={() => setActiveSubTab('orchestrator')}
                  className={`px-3.5 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                    activeSubTab === 'orchestrator'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <Cpu className="w-3.5 h-3.5 text-purple-300" /> Multi-Agent Fleet ({agents.length})
                </button>
                <button
                  onClick={() => setActiveSubTab('predictive')}
                  className={`px-3.5 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                    activeSubTab === 'predictive'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <Brain className="w-3.5 h-3.5 text-cyan-300" /> Pattern Learning & Predictions
                </button>
              </>
            )}

            {/* Mobile OS Sub-Tabs */}
            {activeCategory === 'mobile_os' && (
              <>
                <button
                  onClick={() => setActiveSubTab('apps')}
                  className={`px-3.5 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                    activeSubTab === 'apps'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5 text-cyan-300" /> App Fleet & Permissions ({apps.length})
                </button>
                <button
                  onClick={() => setActiveSubTab('mcp')}
                  className={`px-3.5 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                    activeSubTab === 'mcp'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <Cpu className="w-3.5 h-3.5 text-emerald-300" /> MCP App Drivers ({mcpTools.length})
                </button>
              </>
            )}

            {/* Automation Sub-Tabs */}
            {activeCategory === 'automation_power' && (
              <>
                <button
                  onClick={() => setActiveSubTab('automations')}
                  className={`px-3.5 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                    activeSubTab === 'automations'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5 text-amber-300" /> Macro Studio ({automations.length})
                </button>
                <button
                  onClick={() => setActiveSubTab('battery')}
                  className={`px-3.5 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                    activeSubTab === 'battery'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" /> Eco-Daemon Governor
                </button>
              </>
            )}

          </div>

          <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-500 font-mono">
            <span>ACTIVE CONTEXT:</span>
            <span className="text-indigo-400 font-semibold">{activeAgent.name}</span>
          </div>

        </div>

        {/* Tab Views */}
        {activeCategory === 'assistant' && activeSubTab === 'jarvis' && (
          <JarvisLiveVisionVoice
            agents={agents}
            activeAgent={activeAgent}
            customAiConfig={customAiConfig}
            onExecuteCommand={handleExecuteCommand}
            onLogEntry={addLogEntry}
          />
        )}

        {activeCategory === 'assistant' && activeSubTab === 'sandbox' && (
          <AgentSandbox
            agents={agents}
            activeAgentId={activeAgentId}
            onExecuteCommand={handleExecuteCommand}
            isLoading={isCommandLoading}
            lastCommandResult={lastCommandResult}
          />
        )}

        {activeCategory === 'assistant' && activeSubTab === 'history' && (
          <ConversationHistory
            chatMessages={chatMessages}
            agents={agents}
            customAiConfig={customAiConfig}
            onClearHistory={() => {
              setChatMessages([]);
              showToast('Conversation history cleared.');
            }}
            onLogEntry={addLogEntry}
          />
        )}

        {activeCategory === 'intelligence' && activeSubTab === 'orchestrator' && (
          <AgentOrchestrator
            agents={agents}
            activeAgentId={activeAgentId}
            onSelectAgent={handleSelectAgent}
            onUpdateAgentInstruction={handleUpdateAgentInstruction}
            autoRouterEnabled={autoRouterEnabled}
          />
        )}

        {activeCategory === 'intelligence' && activeSubTab === 'predictive' && (
          <PredictiveEngine
            patterns={patterns}
            predictions={predictions}
            onApprovePrediction={handleApprovePrediction}
            onDismissPrediction={handleDismissPrediction}
            onTriggerLearningCycle={handleTriggerLearningCycle}
            isLearning={isLearning}
          />
        )}

        {activeCategory === 'mobile_os' && activeSubTab === 'apps' && (
          <AppControlCenter
            apps={apps}
            onTogglePermission={handleTogglePermission}
            onAddAutoAction={handleAddAutoAction}
            onGrantAllPermissions={handleGrantAllPermissions}
          />
        )}

        {activeCategory === 'mobile_os' && activeSubTab === 'mcp' && (
          <McpProtocolCenter
            mcpTools={mcpTools}
            mcpLogs={mcpLogs}
            customAiConfig={customAiConfig}
            onExecuteMcpTool={handleExecuteMcpTool}
          />
        )}

        {activeCategory === 'automation_power' && activeSubTab === 'automations' && (
          <AutomationStudio
            automations={automations}
            logs={logs}
            onToggleAutomation={handleToggleAutomation}
            onCreateAutomation={handleCreateAutomation}
            onRunTestAutomation={handleRunTestAutomation}
          />
        )}

        {activeCategory === 'automation_power' && activeSubTab === 'battery' && (
          <BatteryEcoDaemon
            batteryProfile={batteryProfile}
            onChangeBatteryMode={handleChangeBatteryMode}
            onToggleBatchInference={handleToggleBatchInference}
            onToggleDozeBypass={handleToggleDozeBypass}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            OmniAgent Mobile AI OS • Autonomous Agent GUI with Jarvis Live Vision, Call-by-Voice & MCP Drivers
          </div>
          <div className="flex items-center gap-3 text-slate-400">
            <span>Server-side Gemini 3.6 Proxy</span>
            <span>•</span>
            <span className="text-rose-400 font-semibold">Banking Guardrail Active</span>
            <span>•</span>
            <span>Eco-Batch Daemon 24/7</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
