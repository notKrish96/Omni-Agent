import React from 'react';
import { ShieldCheck, BatteryCharging, Zap, Cpu, RefreshCw, Smartphone, Key, Sparkles, Database, LogIn, LogOut, User } from 'lucide-react';
import { BatteryProfile } from '../types';

interface HeaderProps {
  autoRouterEnabled: boolean;
  setAutoRouterEnabled: (enabled: boolean) => void;
  batteryProfile: BatteryProfile;
  activeAgentName: string;
  totalAgentsCount: number;
  totalAppsCount: number;
  totalAutomationsCount: number;
  onRefreshTelemetry: () => void;
  isRefreshing: boolean;
  onOpenApiKeyModal: () => void;
  isCustomKeyActive: boolean;
  firebaseUser: any;
  onFirebaseSignIn: () => void;
  onFirebaseSignOut: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  autoRouterEnabled,
  setAutoRouterEnabled,
  batteryProfile,
  activeAgentName,
  totalAgentsCount,
  totalAppsCount,
  totalAutomationsCount,
  onRefreshTelemetry,
  isRefreshing,
  onOpenApiKeyModal,
  isCustomKeyActive,
  firebaseUser,
  onFirebaseSignIn,
  onFirebaseSignOut
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 px-4 py-3 text-slate-100 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        
        {/* Left: Brand & Service Daemon Status */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Smartphone className="w-6 h-6 text-white" />
            </div>
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                OmniAgent <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">Mobile AI OS</span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-2">
              <span className="flex items-center gap-1 text-emerald-400 font-medium">
                <ShieldCheck className="w-3.5 h-3.5" /> Persistent Foreground Daemon Active
              </span>
              <span className="text-slate-600">•</span>
              <span>Active Agent: <strong className="text-slate-200">{activeAgentName}</strong></span>
            </p>
          </div>
        </div>

        {/* Center: Battery Eco-State & Telemetry */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-950/70 p-2 rounded-xl border border-slate-800 text-xs">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/50 text-emerald-300 border border-emerald-800/40">
            <BatteryCharging className="w-4 h-4 text-emerald-400" />
            <span>Eco-Batch: <strong>{batteryProfile.dailyConsumptionPercent}% / day</strong></span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Mode: <strong>{batteryProfile.mode}</strong></span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>Interval: <strong>{batteryProfile.inferenceFrequencySeconds}s</strong></span>
          </div>

          <button
            onClick={onRefreshTelemetry}
            disabled={isRefreshing}
            title="Re-sync system telemetry"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-indigo-400' : ''}`} />
          </button>
        </div>

        {/* Right: Firebase Auth, API Key Settings & Auto-Router Switch */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-2 md:pt-0 border-slate-800">
          
          {/* Firebase Status & Auth Button */}
          {firebaseUser ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs">
              <Database className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span className="truncate max-w-[120px]">{firebaseUser.email || firebaseUser.displayName || 'Synced'}</span>
              <button
                onClick={onFirebaseSignOut}
                title="Sign out of Firebase"
                className="p-1 hover:bg-amber-900/50 rounded-lg text-amber-300 ml-1 transition-colors"
              >
                <LogOut className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button
              onClick={onFirebaseSignIn}
              className="px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 text-amber-300 transition-all"
            >
              <Database className="w-3.5 h-3.5 text-amber-400" />
              <span>Firebase Auth</span>
              <LogIn className="w-3 h-3" />
            </button>
          )}

          <button
            onClick={onOpenApiKeyModal}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border ${
              isCustomKeyActive
                ? 'bg-purple-600/30 border-purple-500 text-purple-200 shadow-md shadow-purple-600/20'
                : 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
            }`}
          >
            <Key className="w-3.5 h-3.5 text-indigo-400" />
            <span>Custom AI Key</span>
            {isCustomKeyActive && <Sparkles className="w-3 h-3 text-purple-400 animate-pulse" />}
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Auto-Router:</span>
            <button
              onClick={() => setAutoRouterEnabled(!autoRouterEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                autoRouterEnabled ? 'bg-indigo-600' : 'bg-slate-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  autoRouterEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${autoRouterEnabled ? 'bg-indigo-900/60 text-indigo-300' : 'bg-slate-800 text-slate-400'}`}>
              {autoRouterEnabled ? 'AUTO' : 'MANUAL'}
            </span>
          </div>

          <div className="hidden lg:flex items-center gap-3 text-xs text-slate-400 pl-3 border-l border-slate-800">
            <div><strong className="text-slate-200">{totalAgentsCount}</strong> Agents</div>
            <div><strong className="text-slate-200">{totalAppsCount}</strong> Apps</div>
            <div><strong className="text-slate-200">{totalAutomationsCount}</strong> Macros</div>
          </div>
        </div>

      </div>
    </header>
  );
};


