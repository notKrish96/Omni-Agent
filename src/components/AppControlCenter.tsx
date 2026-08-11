import React, { useState } from 'react';
import { AppControl } from '../types';
import { Smartphone, Check, X, ShieldAlert, Plus, Layers, ToggleLeft, ToggleRight, Sparkles, MessageCircle, Mail, Music, MapPin, Slack, Phone, Settings, Camera } from 'lucide-react';

interface AppControlCenterProps {
  apps: AppControl[];
  onTogglePermission: (appId: string, permissionKey: keyof AppControl) => void;
  onAddAutoAction: (appId: string, title: string, trigger: string, action: string) => void;
  onGrantAllPermissions: () => void;
}

export const AppControlCenter: React.FC<AppControlCenterProps> = ({
  apps,
  onTogglePermission,
  onAddAutoAction,
  onGrantAllPermissions
}) => {
  const [selectedAppId, setSelectedAppId] = useState<string>(apps[0]?.id || '');
  const [showAddActionModal, setShowAddActionModal] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTrigger, setNewTrigger] = useState('');
  const [newAction, setNewAction] = useState('');

  const selectedApp = apps.find(a => a.id === selectedAppId) || apps[0];

  const getAppIcon = (iconName: string) => {
    switch (iconName) {
      case 'MessageCircle': return <MessageCircle className="w-5 h-5 text-emerald-400" />;
      case 'Mail': return <Mail className="w-5 h-5 text-red-400" />;
      case 'Music': return <Music className="w-5 h-5 text-green-400" />;
      case 'MapPin': return <MapPin className="w-5 h-5 text-blue-400" />;
      case 'Slack': return <Slack className="w-5 h-5 text-purple-400" />;
      case 'Phone': return <Phone className="w-5 h-5 text-teal-400" />;
      case 'Settings': return <Settings className="w-5 h-5 text-slate-400" />;
      case 'Camera': return <Camera className="w-5 h-5 text-amber-400" />;
      default: return <Smartphone className="w-5 h-5 text-indigo-400" />;
    }
  };

  const handleCreateAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newTrigger || !newAction || !selectedAppId) return;
    onAddAutoAction(selectedAppId, newTitle, newTrigger, newAction);
    setNewTitle('');
    setNewTrigger('');
    setNewAction('');
    setShowAddActionModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-indigo-400" /> Phone App Fleet & Deep Permissions Control
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Grant accessibility, notification listening, and system overlay permissions so AI agents can automate app interactions, auto-fill, and background tasks.
            </p>
          </div>

          <button
            onClick={onGrantAllPermissions}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs flex items-center gap-2 shadow-md shadow-emerald-900/30 transition-all self-start md:self-auto"
          >
            <ShieldAlert className="w-4 h-4" /> Grant Full Deep Permissions
          </button>
        </div>
      </div>

      {/* Main Grid: Left App List, Right App Details & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left column: Installed Apps */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Installed Fleet ({apps.length})</h3>
            <span className="text-[11px] text-slate-400">Select app to configure</span>
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {apps.map((app) => {
              const isSelected = app.id === selectedAppId;
              const permissionsGrantedCount = [
                app.accessibilityGranted,
                app.notificationListenerGranted,
                app.overlayGranted,
                app.autoStartGranted,
                app.batteryUnrestricted
              ].filter(Boolean).length;

              return (
                <div
                  key={app.id}
                  onClick={() => setSelectedAppId(app.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-indigo-950/40 border-indigo-500/60 shadow-md ring-1 ring-indigo-500/30'
                      : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center">
                      {getAppIcon(app.iconName)}
                    </div>
                    <div>
                      <div className="font-semibold text-white text-sm flex items-center gap-1.5">
                        {app.name}
                        <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">{app.category}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">{app.packageName}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      permissionsGrantedCount === 5 ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/50' : 'bg-amber-950 text-amber-400 border border-amber-800/50'
                    }`}>
                      {permissionsGrantedCount}/5 Perms
                    </span>
                    <div className="text-[10px] text-slate-400 mt-1">
                      {app.autoActions.length} Auto-Rules
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right column: Selected App Permissions & Automation Rules */}
        {selectedApp && (
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center shadow-inner">
                  {getAppIcon(selectedApp.iconName)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{selectedApp.name} Automation Profile</h3>
                  <p className="text-xs text-slate-400 font-mono">{selectedApp.packageName}</p>
                </div>
              </div>

              <span className={`text-xs px-3 py-1 rounded-full font-semibold border ${
                selectedApp.status === 'Active' ? 'bg-emerald-950 text-emerald-400 border-emerald-800/60' : 'bg-slate-800 text-slate-300 border-slate-700'
              }`}>
                Status: {selectedApp.status}
              </span>
            </div>

            {/* Permissions Toggles Matrix */}
            <div>
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-indigo-400" /> Deep System Permissions Matrix
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                
                {/* Perm 1: Accessibility */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
                  <div>
                    <div className="font-semibold text-white">Accessibility Service</div>
                    <div className="text-[10px] text-slate-400">Screen reading & auto-clicks</div>
                  </div>
                  <button
                    onClick={() => onTogglePermission(selectedApp.id, 'accessibilityGranted')}
                    className="text-indigo-400 hover:text-indigo-300"
                  >
                    {selectedApp.accessibilityGranted ? (
                      <ToggleRight className="w-7 h-7 text-emerald-400" />
                    ) : (
                      <ToggleLeft className="w-7 h-7 text-slate-600" />
                    )}
                  </button>
                </div>

                {/* Perm 2: Notification Listener */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
                  <div>
                    <div className="font-semibold text-white">Notification Listener</div>
                    <div className="text-[10px] text-slate-400">Parse incoming alerts & messages</div>
                  </div>
                  <button
                    onClick={() => onTogglePermission(selectedApp.id, 'notificationListenerGranted')}
                    className="text-indigo-400 hover:text-indigo-300"
                  >
                    {selectedApp.notificationListenerGranted ? (
                      <ToggleRight className="w-7 h-7 text-emerald-400" />
                    ) : (
                      <ToggleLeft className="w-7 h-7 text-slate-600" />
                    )}
                  </button>
                </div>

                {/* Perm 3: System Overlay */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
                  <div>
                    <div className="font-semibold text-white">Draw Over Apps Overlay</div>
                    <div className="text-[10px] text-slate-400">Floating AI heads & draft popups</div>
                  </div>
                  <button
                    onClick={() => onTogglePermission(selectedApp.id, 'overlayGranted')}
                    className="text-indigo-400 hover:text-indigo-300"
                  >
                    {selectedApp.overlayGranted ? (
                      <ToggleRight className="w-7 h-7 text-emerald-400" />
                    ) : (
                      <ToggleLeft className="w-7 h-7 text-slate-600" />
                    )}
                  </button>
                </div>

                {/* Perm 4: Battery Optimization Exemption */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
                  <div>
                    <div className="font-semibold text-white">Ignore Battery Saver</div>
                    <div className="text-[10px] text-slate-400">Prevent OS background killing</div>
                  </div>
                  <button
                    onClick={() => onTogglePermission(selectedApp.id, 'batteryUnrestricted')}
                    className="text-indigo-400 hover:text-indigo-300"
                  >
                    {selectedApp.batteryUnrestricted ? (
                      <ToggleRight className="w-7 h-7 text-emerald-400" />
                    ) : (
                      <ToggleLeft className="w-7 h-7 text-slate-600" />
                    )}
                  </button>
                </div>

              </div>
            </div>

            {/* App Automation Rules */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-purple-400" /> Configured AI Auto-Actions ({selectedApp.autoActions.length})
                </h4>
                <button
                  onClick={() => setShowAddActionModal(true)}
                  className="px-2.5 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/30 text-xs font-medium flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Custom App Macro
                </button>
              </div>

              {selectedApp.autoActions.length === 0 ? (
                <div className="text-center p-6 rounded-xl bg-slate-950/40 border border-dashed border-slate-800 text-xs text-slate-400">
                  No automation rules configured for {selectedApp.name}. Click "Add Custom App Macro" to create one.
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedApp.autoActions.map((rule) => (
                    <div key={rule.id} className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-sm">{rule.title}</span>
                        <span className="text-[10px] text-indigo-400 bg-indigo-950 px-2 py-0.5 rounded-full font-mono">
                          Executions: {rule.executedCount}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-slate-300 text-[11px]">
                        <div><strong className="text-slate-400">Trigger:</strong> {rule.trigger}</div>
                        <div><strong className="text-slate-400">AI Action:</strong> {rule.action}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

      </div>

      {/* Modal: Add New Macro */}
      {showAddActionModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCreateAction} className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Create Macro for {selectedApp.name}</h3>
              <button
                type="button"
                onClick={() => setShowAddActionModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs text-slate-300 font-semibold mb-1">Macro Title</label>
                <input
                  type="text"
                  placeholder="e.g. Auto-Reply to Urgent WhatsApp"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 font-semibold mb-1">Trigger Condition</label>
                <input
                  type="text"
                  placeholder="e.g. Incoming message containing 'Urgent'"
                  value={newTrigger}
                  onChange={(e) => setNewTrigger(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 font-semibold mb-1">Automated AI Action</label>
                <input
                  type="text"
                  placeholder="e.g. Draft concise response and notify via overlay"
                  value={newAction}
                  onChange={(e) => setNewAction(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setShowAddActionModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 shadow-md shadow-indigo-600/30"
              >
                Save App Macro
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
