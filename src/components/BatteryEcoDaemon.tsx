import React from 'react';
import { BatteryProfile, BatteryMode } from '../types';
import { BatteryCharging, Zap, ShieldCheck, Cpu, Sliders, ArrowDownRight, Layers, Activity } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface BatteryEcoDaemonProps {
  batteryProfile: BatteryProfile;
  onChangeBatteryMode: (mode: BatteryMode) => void;
  onToggleBatchInference: () => void;
  onToggleDozeBypass: () => void;
}

export const BatteryEcoDaemon: React.FC<BatteryEcoDaemonProps> = ({
  batteryProfile,
  onChangeBatteryMode,
  onToggleBatchInference,
  onToggleDozeBypass
}) => {
  // Chart comparison data: Standard Continuous AI Polling vs OmniAgent Batching Engine
  const chartData = [
    { time: '00:00', continuousUsage: 14, ecoBatchUsage: 2 },
    { time: '04:00', continuousUsage: 28, ecoBatchUsage: 3 },
    { time: '08:00', continuousUsage: 45, ecoBatchUsage: 6 },
    { time: '12:00', continuousUsage: 68, ecoBatchUsage: 11 },
    { time: '16:00', continuousUsage: 82, ecoBatchUsage: 15 },
    { time: '20:00', continuousUsage: 94, ecoBatchUsage: 18 },
    { time: '24:00', continuousUsage: 110, ecoBatchUsage: 22 },
  ];

  return (
    <div className="space-y-6">
      
      {/* Overview Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <BatteryCharging className="w-6 h-6 text-emerald-400" />
              <h2 className="text-lg font-bold text-white">Eco-Daemon & Persistence Governor</h2>
            </div>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Designed specifically for 24/7 persistent background execution without draining battery. Batches AI inference requests, optimizes CPU wakelocks, and hooks into Android Doze mode.
            </p>
          </div>

          <div className="bg-emerald-950/60 border border-emerald-800/60 p-3.5 rounded-xl text-xs space-y-1 self-start md:self-auto">
            <div className="text-[10px] uppercase tracking-wider text-emerald-400 font-bold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Battery Efficiency Guaranteed
            </div>
            <div className="text-base font-bold text-white">
              {batteryProfile.savedMilliampHours} mAh <span className="text-xs text-emerald-300 font-normal">Saved Today</span>
            </div>
          </div>
        </div>
      </div>

      {/* Battery Power Modes Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Ultra-Eco */}
        <div
          onClick={() => onChangeBatteryMode('Ultra-Eco')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer relative ${
            batteryProfile.mode === 'Ultra-Eco'
              ? 'bg-emerald-950/40 border-emerald-500 shadow-lg shadow-emerald-950/30 ring-1 ring-emerald-500/40'
              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-emerald-400 bg-emerald-950 px-2.5 py-0.5 rounded-full border border-emerald-800">
              ~2% Battery / Day
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Polling: 60s</span>
          </div>

          <h3 className="font-bold text-white text-base">Ultra-Eco Governor</h3>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            Batch AI calls into 60s windows. Zero background CPU wakelocks. Best for maximum phone battery longevity.
          </p>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Power Footprint: <strong className="text-emerald-400">Minimal</strong></span>
            {batteryProfile.mode === 'Ultra-Eco' && <span className="text-emerald-400 font-bold">Active Mode</span>}
          </div>
        </div>

        {/* Balanced */}
        <div
          onClick={() => onChangeBatteryMode('Balanced')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer relative ${
            batteryProfile.mode === 'Balanced'
              ? 'bg-indigo-950/40 border-indigo-500 shadow-lg shadow-indigo-950/30 ring-1 ring-indigo-500/40'
              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-indigo-400 bg-indigo-950 px-2.5 py-0.5 rounded-full border border-indigo-800">
              ~4% Battery / Day
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Polling: 15s</span>
          </div>

          <h3 className="font-bold text-white text-base">Balanced Smart Mode</h3>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            Adaptive polling. Wakes AI agent immediately on important notification triggers, batches routine tasks.
          </p>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Power Footprint: <strong className="text-indigo-400">Optimal</strong></span>
            {batteryProfile.mode === 'Balanced' && <span className="text-indigo-400 font-bold">Active Mode</span>}
          </div>
        </div>

        {/* Performance */}
        <div
          onClick={() => onChangeBatteryMode('Performance')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer relative ${
            batteryProfile.mode === 'Performance'
              ? 'bg-purple-950/40 border-purple-500 shadow-lg shadow-purple-950/30 ring-1 ring-purple-500/40'
              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-amber-400 bg-amber-950 px-2.5 py-0.5 rounded-full border border-amber-800">
              ~12% Battery / Day
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Polling: Realtime</span>
          </div>

          <h3 className="font-bold text-white text-base">Performance Mode</h3>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            Continuous accessibility parsing, real-time intent prediction, immediate execution. Higher power draw.
          </p>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Power Footprint: <strong className="text-amber-400">High</strong></span>
            {batteryProfile.mode === 'Performance' && <span className="text-purple-400 font-bold">Active Mode</span>}
          </div>
        </div>

      </div>

      {/* Battery Savings Chart & Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Chart */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" /> Battery Consumption: Unoptimized vs OmniAgent Eco-Batching
              </h3>
              <p className="text-xs text-slate-400">Cumulative mAh drain over a 24-hour persistent run window.</p>
            </div>
            
            <span className="text-xs text-emerald-400 font-semibold bg-emerald-950 border border-emerald-800 px-2.5 py-1 rounded-lg flex items-center gap-1">
              <ArrowDownRight className="w-4 h-4" /> 80% Less Power Drain
            </span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorUnoptimized" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorEco" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.5}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} unit=" mAh" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                  itemStyle={{ color: '#f8fafc' }}
                />
                <Area type="monotone" dataKey="continuousUsage" name="Standard Unoptimized AI (mAh)" stroke="#f43f5e" fillOpacity={1} fill="url(#colorUnoptimized)" />
                <Area type="monotone" dataKey="ecoBatchUsage" name="OmniAgent Eco-Batching (mAh)" stroke="#10b981" fillOpacity={1} fill="url(#colorEco)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Toggles & Low-Level Governor Settings */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-indigo-400" /> Low-Level Daemon Settings
            </h3>
            <p className="text-xs text-slate-400 mb-4">Fine-tune background persistence and hardware wake-locks.</p>

            <div className="space-y-3 text-xs">
              
              {/* Batch Inference Toggle */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white">AI Batch Inference Engine</div>
                  <div className="text-[10px] text-slate-400">Groups background prompts into single CPU wake cycle</div>
                </div>
                <input
                  type="checkbox"
                  checked={batteryProfile.batchInferenceEnabled}
                  onChange={onToggleBatchInference}
                  className="w-4 h-4 accent-indigo-600 cursor-pointer"
                />
              </div>

              {/* Doze Bypass Toggle */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white">Smart Doze Synchronization</div>
                  <div className="text-[10px] text-slate-400">Respects Android deep sleep when screen is off</div>
                </div>
                <input
                  type="checkbox"
                  checked={batteryProfile.dozeBypassActive}
                  onChange={onToggleDozeBypass}
                  className="w-4 h-4 accent-indigo-600 cursor-pointer"
                />
              </div>

              {/* Active Wakelocks */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white">Active CPU Wakelocks</div>
                  <div className="text-[10px] text-slate-400">Hardware wake locks maintained</div>
                </div>
                <span className="font-mono font-bold text-emerald-400">{batteryProfile.activeWakelocksCount} Active</span>
              </div>

            </div>
          </div>

          <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-800/40 text-[11px] text-indigo-200">
            💡 <strong>Pro Tip:</strong> Ultra-Eco mode ensures your phone will easily last all day while OmniAgent automates tasks in background batches.
          </div>
        </div>

      </div>

    </div>
  );
};
