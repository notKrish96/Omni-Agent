import React, { useState } from 'react';
import { CustomAiConfig } from '../types';
import { Key, ShieldCheck, Cpu, Sparkles, Check, AlertTriangle, Eye, EyeOff, Server, X } from 'lucide-react';

interface CustomAiApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: CustomAiConfig;
  onSaveConfig: (newConfig: CustomAiConfig) => void;
}

export const CustomAiApiKeyModal: React.FC<CustomAiApiKeyModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
}) => {
  const [provider, setProvider] = useState<CustomAiConfig['provider']>(config.provider || 'gemini');
  const [apiKey, setApiKey] = useState<string>(config.apiKey || '');
  const [modelName, setModelName] = useState<string>(config.modelName || 'gemini-3.6-flash');
  const [customBaseUrl, setCustomBaseUrl] = useState<string>(config.customBaseUrl || '');
  const [isCustomKeyActive, setIsCustomKeyActive] = useState<boolean>(config.isCustomKeyActive || false);
  const [showKey, setShowKey] = useState<boolean>(false);
  const [testSuccess, setTestSuccess] = useState<boolean | null>(null);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig({
      provider,
      apiKey,
      modelName,
      customBaseUrl,
      isCustomKeyActive
    });
    setTestSuccess(true);
    setTimeout(() => {
      setTestSuccess(null);
      onClose();
    }, 1000);
  };

  const handleQuickPreset = (presetProvider: CustomAiConfig['provider'], defaultModel: string) => {
    setProvider(presetProvider);
    setModelName(defaultModel);
    if (presetProvider === 'gemini') {
      setCustomBaseUrl('');
    } else if (presetProvider === 'openai') {
      setCustomBaseUrl('https://api.openai.com/v1');
    } else if (presetProvider === 'anthropic') {
      setCustomBaseUrl('https://api.anthropic.com/v1');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shadow-inner">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Bring Your Own AI (Custom API Key)
              </h3>
              <p className="text-xs text-slate-400">
                Connect your personal Gemini, OpenAI, or custom LLM keys to power OmniAgent.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSave} className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
          
          {/* Custom AI Toggle */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-400" /> Enable Custom AI Key Provider
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                When enabled, OmniAgent routes all agent tasks through your custom key instead of default environment keys.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsCustomKeyActive(!isCustomKeyActive)}
              className={`w-12 h-6 rounded-full transition-colors relative p-1 ${
                isCustomKeyActive ? 'bg-indigo-600' : 'bg-slate-800'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  isCustomKeyActive ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Provider Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300">Select Model Provider</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => handleQuickPreset('gemini', 'gemini-3.6-flash')}
                className={`p-2.5 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all ${
                  provider === 'gemini'
                    ? 'bg-indigo-600/20 border-indigo-500 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Cpu className="w-3.5 h-3.5 text-indigo-400" /> Gemini
              </button>

              <button
                type="button"
                onClick={() => handleQuickPreset('openai', 'gpt-4o')}
                className={`p-2.5 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all ${
                  provider === 'openai'
                    ? 'bg-emerald-600/20 border-emerald-500 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> OpenAI
              </button>

              <button
                type="button"
                onClick={() => handleQuickPreset('anthropic', 'claude-3-5-sonnet-20241022')}
                className={`p-2.5 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all ${
                  provider === 'anthropic'
                    ? 'bg-amber-600/20 border-amber-500 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" /> Anthropic
              </button>

              <button
                type="button"
                onClick={() => handleQuickPreset('custom', 'custom-llm-v1')}
                className={`p-2.5 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all ${
                  provider === 'custom'
                    ? 'bg-purple-600/20 border-purple-500 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Server className="w-3.5 h-3.5 text-purple-400" /> Custom
              </button>
            </div>
          </div>

          {/* API Key Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
              <span>{provider.toUpperCase()} API Key</span>
              <span className="text-[10px] text-indigo-400">Encrypted in browser storage</span>
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={provider === 'gemini' ? 'AIzaSy...' : 'sk-...'}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl py-2.5 pl-3.5 pr-10 text-xs text-white placeholder-slate-600 focus:outline-none font-mono"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Model Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">Model Name / Alias</label>
            <input
              type="text"
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              placeholder="e.g. gemini-3.6-flash or gpt-4o"
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl py-2.5 px-3.5 text-xs text-white placeholder-slate-600 focus:outline-none font-mono"
            />
          </div>

          {/* Custom Base URL if provider is custom/openai */}
          {(provider === 'custom' || provider === 'openai') && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Custom Base Endpoint (Optional)</label>
              <input
                type="text"
                value={customBaseUrl}
                onChange={(e) => setCustomBaseUrl(e.target.value)}
                placeholder="https://your-custom-llm-proxy.com/v1"
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl py-2.5 px-3.5 text-xs text-white placeholder-slate-600 focus:outline-none font-mono"
              />
            </div>
          )}

          {/* Security & Safety Notice */}
          <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-800/40 text-[11px] text-amber-200/90 leading-relaxed flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong>Unbreakable Safety Policy:</strong> Regardless of custom key configuration, OmniAgent strictly blocks any banking, credit card, or payment operations from AI control.
            </div>
          </div>

          {testSuccess && (
            <div className="p-3 rounded-xl bg-emerald-950 border border-emerald-800 text-xs text-emerald-300 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              API Key configuration updated successfully!
            </div>
          )}

          {/* Footer buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-xs text-slate-300 font-semibold border border-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs text-white font-semibold shadow-lg shadow-indigo-600/30"
            >
              Save Key Settings
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
