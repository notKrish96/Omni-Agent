import React, { useState, useEffect } from 'react';
import { Mic, Camera, MapPin, ShieldCheck, ShieldAlert, CheckCircle2, AlertCircle, X, Smartphone, Sparkles, Lock } from 'lucide-react';

interface MobilePermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPermissionsUpdated?: (status: { mic: boolean; camera: boolean; location: boolean }) => void;
}

export const MobilePermissionsModal: React.FC<MobilePermissionsModalProps> = ({
  isOpen,
  onClose,
  onPermissionsUpdated
}) => {
  const [micState, setMicState] = useState<'prompt' | 'granted' | 'denied' | 'requesting'>('prompt');
  const [cameraState, setCameraState] = useState<'prompt' | 'granted' | 'denied' | 'requesting'>('prompt');
  const [locationState, setLocationState] = useState<'prompt' | 'granted' | 'denied' | 'requesting'>('prompt');
  const [activeCoords, setActiveCoords] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Check initial browser permission status if supported
  useEffect(() => {
    if (!isOpen) return;

    if (navigator.permissions && navigator.permissions.query) {
      // Microphone query
      navigator.permissions.query({ name: 'microphone' as PermissionName })
        .then(result => {
          setMicState(result.state as any);
          result.onchange = () => setMicState(result.state as any);
        }).catch(() => {});

      // Camera query
      navigator.permissions.query({ name: 'camera' as PermissionName })
        .then(result => {
          setCameraState(result.state as any);
          result.onchange = () => setCameraState(result.state as any);
        }).catch(() => {});

      // Geolocation query
      navigator.permissions.query({ name: 'geolocation' as PermissionName })
        .then(result => {
          setLocationState(result.state as any);
          result.onchange = () => setLocationState(result.state as any);
        }).catch(() => {});
    }
  }, [isOpen]);

  // Request Microphone Permission
  const requestMicrophone = async () => {
    setMicState('requesting');
    setErrorMessage(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Stop stream immediately after permission granted
      stream.getTracks().forEach(track => track.stop());
      setMicState('granted');
      notifyParent();
      return true;
    } catch (err: any) {
      console.warn('Microphone permission denied/error:', err);
      setMicState('denied');
      setErrorMessage('Microphone access was denied or unavailable.');
      return false;
    }
  };

  // Request Camera/Video Permission
  const requestCamera = async () => {
    setCameraState('requesting');
    setErrorMessage(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      stream.getTracks().forEach(track => track.stop());
      setCameraState('granted');
      notifyParent();
      return true;
    } catch (err: any) {
      console.warn('Camera permission denied/error:', err);
      setCameraState('denied');
      setErrorMessage('Camera access was denied or unavailable.');
      return false;
    }
  };

  // Request Geolocation/Location Permission
  const requestLocation = async () => {
    setLocationState('requesting');
    setErrorMessage(null);
    return new Promise<boolean>((resolve) => {
      if (!navigator.geolocation) {
        setLocationState('denied');
        setErrorMessage('Geolocation is not supported on this browser/device.');
        resolve(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocationState('granted');
          setActiveCoords(`${pos.coords.latitude.toFixed(4)}°, ${pos.coords.longitude.toFixed(4)}°`);
          notifyParent();
          resolve(true);
        },
        (err) => {
          console.warn('Location permission denied/error:', err);
          setLocationState('denied');
          setErrorMessage(`Location access error: ${err.message}`);
          resolve(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });
  };

  // Grant All Permissions sequentially
  const requestAllPermissions = async () => {
    setErrorMessage(null);
    const micOk = await requestMicrophone();
    const cameraOk = await requestCamera();
    const locationOk = await requestLocation();

    if (micOk && cameraOk && locationOk) {
      setTimeout(() => {
        onClose();
      }, 600);
    }
  };

  const notifyParent = () => {
    if (onPermissionsUpdated) {
      onPermissionsUpdated({
        mic: micState === 'granted',
        camera: cameraState === 'granted',
        location: locationState === 'granted'
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 text-slate-100 shadow-2xl relative overflow-hidden">
        
        {/* Glow accent */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              Mobile OS Permissions
            </h2>
            <p className="text-xs text-slate-400">
              Grant permissions for real-time Jarvis voice, vision, and location automation
            </p>
          </div>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Permissions List */}
        <div className="space-y-3 mb-6">
          
          {/* 1. Microphone */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Mic className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-200">Microphone Access</div>
                <div className="text-xs text-slate-400">Required for Jarvis hotword wake phrase & voice commands</div>
              </div>
            </div>

            <button
              onClick={requestMicrophone}
              disabled={micState === 'requesting'}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border shrink-0 ${
                micState === 'granted'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : micState === 'denied'
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-500'
              }`}
            >
              {micState === 'granted' ? (
                <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Granted</span>
              ) : micState === 'denied' ? (
                <span>Denied (Retry)</span>
              ) : micState === 'requesting' ? (
                <span>Requesting...</span>
              ) : (
                <span>Allow Mic</span>
              )}
            </button>
          </div>

          {/* 2. Video Camera */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-200">Camera / Video Stream</div>
                <div className="text-xs text-slate-400">Required for Live Vision camera scanning & AI visual analysis</div>
              </div>
            </div>

            <button
              onClick={requestCamera}
              disabled={cameraState === 'requesting'}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border shrink-0 ${
                cameraState === 'granted'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : cameraState === 'denied'
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-500'
              }`}
            >
              {cameraState === 'granted' ? (
                <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Granted</span>
              ) : cameraState === 'denied' ? (
                <span>Denied (Retry)</span>
              ) : cameraState === 'requesting' ? (
                <span>Requesting...</span>
              ) : (
                <span>Allow Camera</span>
              )}
            </button>
          </div>

          {/* 3. Geolocation Location */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-200">Location Services</div>
                <div className="text-xs text-slate-400">
                  {activeCoords ? `Active: ${activeCoords}` : 'Required for contextual mobile automation & local search'}
                </div>
              </div>
            </div>

            <button
              onClick={requestLocation}
              disabled={locationState === 'requesting'}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border shrink-0 ${
                locationState === 'granted'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : locationState === 'denied'
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-500'
              }`}
            >
              {locationState === 'granted' ? (
                <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Granted</span>
              ) : locationState === 'denied' ? (
                <span>Denied (Retry)</span>
              ) : locationState === 'requesting' ? (
                <span>Requesting...</span>
              ) : (
                <span>Allow Location</span>
              )}
            </button>
          </div>

        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Dismiss
          </button>

          <button
            onClick={requestAllPermissions}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 text-white shadow-lg shadow-indigo-500/20 hover:opacity-90 transition-all flex items-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Grant All Mobile Permissions</span>
          </button>
        </div>

      </div>
    </div>
  );
};
