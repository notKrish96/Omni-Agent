import React, { useState, useEffect, useRef } from 'react';
import { Agent, CustomAiConfig, VisionAnalysisResult } from '../types';
import { Mic, MicOff, Camera, CameraOff, Volume2, VolumeX, ShieldAlert, Sparkles, ExternalLink, RefreshCw, Eye, Youtube, Instagram, Search, MapPin, Music, Loader2, CheckCircle2, Radio, Power, Lock, Unlock, Zap, BellRing, Activity } from 'lucide-react';

interface JarvisLiveVisionVoiceProps {
  agents: Agent[];
  activeAgent: Agent;
  customAiConfig: CustomAiConfig;
  onExecuteCommand: (prompt: string, mode: 'voice' | 'vision') => Promise<any>;
  onLogEntry: (type: any, title: string, detail: string, agentName: string) => void;
}

export const JarvisLiveVisionVoice: React.FC<JarvisLiveVisionVoiceProps> = ({
  agents,
  activeAgent,
  customAiConfig,
  onExecuteCommand,
  onLogEntry,
}) => {
  // Always-On Wake Word State
  const [isWakeEngineActive, setIsWakeEngineActive] = useState<boolean>(true);
  const [wakePhrase, setWakePhrase] = useState<string>('jarvis');
  const [wakeStatus, setWakeStatus] = useState<'listening' | 'detected' | 'idle'>('listening');
  const [lastDetectedPhrase, setLastDetectedPhrase] = useState<string>('');
  const [isPhoneScreenOff, setIsPhoneScreenOff] = useState<boolean>(false); // Simulated Phone Standby / Lockscreen
  const [screenWakeNotification, setScreenWakeNotification] = useState<string | null>(null);

  // Manual Call / Voice State
  const [isListening, setIsListening] = useState<boolean>(false);
  const [spokenTranscript, setSpokenTranscript] = useState<string>('');
  const [isTtsMuted, setIsTtsMuted] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // Gemini Bottom Voice Glow & Overlay Response State
  const [isVoiceProcessing, setIsVoiceProcessing] = useState<boolean>(false);
  const [lastVoiceResult, setLastVoiceResult] = useState<any | null>(null);
  const [showResponseOverlay, setShowResponseOverlay] = useState<boolean>(false);
  const [isOverlayDismissing, setIsOverlayDismissing] = useState<boolean>(false);
  const [isBottomBarVisible, setIsBottomBarVisible] = useState<boolean>(false);

  // Helper to dismiss bottom bar and overlay with slide-down animation
  const handleDismissOverlay = () => {
    setIsOverlayDismissing(true);
    setTimeout(() => {
      setShowResponseOverlay(false);
      setIsBottomBarVisible(false);
      setIsOverlayDismissing(false);
    }, 450); // Matches CSS transition time
  };

  // Helper to wake up bottom bar when voice/hotword active
  const triggerBottomGlow = () => {
    setIsOverlayDismissing(false);
    setIsBottomBarVisible(true);
  };

  // Camera Vision State
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [isAnalyzingFrame, setIsAnalyzingFrame] = useState<boolean>(false);
  const [lastVisionResult, setLastVisionResult] = useState<VisionAnalysisResult | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const recognitionRef = useRef<any>(null);
  const wakeRecognitionRef = useRef<any>(null);

  // Financial safety trigger warning
  const [financialSafetyAlert, setFinancialSafetyAlert] = useState<boolean>(false);

  // Audio chime generator when Wake Word is recognized
  const playWakeChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc2.frequency.setValueAtTime(880, ctx.currentTime + 0.08); // A5

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + 0.1);
      osc2.start(ctx.currentTime + 0.08);
      osc2.stop(ctx.currentTime + 0.35);
    } catch (e) {
      console.warn('Chime audio error:', e);
    }
  };

  // Speak AI text using Speech Synthesis
  const speakOutLoud = (text: string) => {
    if (isTtsMuted || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel(); // Stop prior speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  // Continuous Wake-Word Engine Setup
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    let wakeRec: any = null;

    try {
      wakeRec = new SpeechRecognition();
      wakeRec.continuous = true;
      wakeRec.interimResults = true;
      wakeRec.lang = 'en-US';

      wakeRec.onresult = (event: any) => {
        if (!isWakeEngineActive) return;

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const rawTranscript = event.results[i][0].transcript.trim().toLowerCase();
          setSpokenTranscript(rawTranscript);

          // Check for wake word patterns: "jarvis", "hey jarvis", "ok jarvis", "okay jarvis"
          const wakeRegex = new RegExp(`\\b(hey\\s+${wakePhrase}|ok\\s+${wakePhrase}|okay\\s+${wakePhrase}|${wakePhrase})\\b`, 'i');
          
          if (wakeRegex.test(rawTranscript)) {
            const matchIndex = rawTranscript.search(wakeRegex);
            const matchedText = rawTranscript.substring(matchIndex);
            
            triggerBottomGlow();
            setWakeStatus('detected');
            setLastDetectedPhrase(rawTranscript);
            playWakeChime();

            // If phone screen was simulated OFF/LOCKED, wake up the screen!
            if (isPhoneScreenOff) {
              setIsPhoneScreenOff(false);
              setScreenWakeNotification(`⚡ PHONE WOKEN BY HOTWORD "${wakePhrase.toUpperCase()}" IN STANDBY`);
              setTimeout(() => setScreenWakeNotification(null), 5000);
            }

            // Extract command that follows the wake word
            const commandPart = rawTranscript.replace(/.*?\b(?:hey\s+jarvis|ok\s+jarvis|okay\s+jarvis|jarvis)\b\s*/i, '').trim();

            if (commandPart.length > 2) {
              onLogEntry('USER_EXECUTION', 'Hotword Wake Command Triggered', `Spoken: "${rawTranscript}"`, activeAgent.name);
              handleSendVoiceCommand(commandPart);
            } else {
              // Just wake word was spoken
              const wakeResponse = `Yes? I'm listening. How can I assist you with your phone?`;
              speakOutLoud(wakeResponse);
              onLogEntry('USER_EXECUTION', 'Jarvis Wake Word Triggered', `Hotword detected in standby`, activeAgent.name);
            }

            setTimeout(() => setWakeStatus('listening'), 2500);
            break;
          }
        }
      };

      wakeRec.onerror = (event: any) => {
        console.warn('Wake word engine warning:', event.error);
        if (event.error !== 'aborted' && isWakeEngineActive) {
          setTimeout(() => {
            try { wakeRec.start(); } catch (e) {}
          }, 1000);
        }
      };

      wakeRec.onend = () => {
        // Automatically restart if always-on engine is enabled
        if (isWakeEngineActive) {
          try { wakeRec.start(); } catch (e) {}
        }
      };

      if (isWakeEngineActive) {
        try { wakeRec.start(); } catch (e) {}
      }

      wakeRecognitionRef.current = wakeRec;
    } catch (e) {
      console.warn('Failed to initialize Wake Word engine:', e);
    }

    return () => {
      if (wakeRec) {
        try { wakeRec.stop(); } catch (e) {}
      }
    };
  }, [isWakeEngineActive, wakePhrase, isPhoneScreenOff]);

  // Manual Direct Voice Call Setup
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = true;
      rec.lang = 'en-US';

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onresult = (event: any) => {
        const current = event.resultIndex;
        const transcript = event.results[current][0].transcript;
        setSpokenTranscript(transcript);
      };

      rec.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  // Toggle Voice Listening
  const handleToggleVoiceCall = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
    } else {
      setSpokenTranscript('');
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          console.warn('Recognition start issue:', e);
        }
      } else {
        setIsListening(true);
      }
    }
  };

  // Submit Voice Transcript
  const handleSendVoiceCommand = async (textToSend?: string) => {
    const prompt = textToSend || spokenTranscript;
    if (!prompt.trim()) return;

    triggerBottomGlow();
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
    setIsVoiceProcessing(true);
    setShowResponseOverlay(true);

    // Check financial safety terms
    const financialTerms = ['bank', 'banking', 'money', 'credit card', 'pay ', 'transfer', 'venmo', 'paypal', 'account balance'];
    if (financialTerms.some(t => prompt.toLowerCase().includes(t))) {
      setFinancialSafetyAlert(true);
      const safetyMsg = '🛑 SAFETY GUARDRAIL ENFORCED: OmniAgent is strictly forbidden from executing money or banking commands.';
      speakOutLoud(safetyMsg);
      onLogEntry('SAFETY_BLOCK', 'Banking Request Blocked', 'Voice command attempted financial action', activeAgent.name);
      setIsVoiceProcessing(false);
      return;
    }

    setFinancialSafetyAlert(false);
    const result = await onExecuteCommand(prompt, 'voice');
    setLastVoiceResult(result);
    setIsVoiceProcessing(false);
    
    if (result && result.responseSummary) {
      speakOutLoud(result.responseSummary);
    }
  };

  // Start Camera Stream
  const handleStartCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err: any) {
      console.warn('Camera Access Error:', err);
      setCameraError('Camera access denied or unavailable in preview container. Use test snapshot mode below.');
      setIsCameraActive(false);
    }
  };

  // Stop Camera Stream
  const handleStopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  // Capture & Analyze Frame via Gemini Vision
  const handleCaptureAndAnalyzeVision = async () => {
    setIsAnalyzingFrame(true);
    setFinancialSafetyAlert(false);

    let frameBase64 = '';

    if (isCameraActive && videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        frameBase64 = canvas.toDataURL('image/jpeg', 0.8);
      }
    } else {
      frameBase64 = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP...';
    }

    try {
      const response = await fetch('/api/gemini/vision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: frameBase64,
          prompt: spokenTranscript || 'Analyze camera vision frame and identify required app tools across YouTube, Instagram, Maps, or Spotify.',
          customApiKey: customAiConfig.isCustomKeyActive ? customAiConfig.apiKey : undefined
        })
      });

      const json = await response.json();
      if (json.success && json.data) {
        setLastVisionResult(json.data);

        if (json.data.safetyGuardrailTriggered) {
          setFinancialSafetyAlert(true);
        }

        if (json.data.voiceResponseText) {
          speakOutLoud(json.data.voiceResponseText);
        }

        onLogEntry(
          json.data.safetyGuardrailTriggered ? 'SAFETY_BLOCK' : 'USER_EXECUTION',
          'Vision Camera Analysis Executed',
          `Detected: ${(json.data.detectedObjects || []).join(', ')}`,
          activeAgent.name
        );
      }
    } catch (err) {
      console.error('Vision analysis error:', err);
    } finally {
      setIsAnalyzingFrame(false);
    }
  };

  // Cleanup camera & speech synthesis on unmount
  useEffect(() => {
    return () => {
      handleStopCamera();
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return (
    <div className="space-y-6">
      
      {/* ALWAYS-ON WAKE WORD ENGINE & PHONE POWER STATE CONTROL PANEL */}
      <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold transition-all ${
              wakeStatus === 'detected'
                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/40 animate-bounce'
                : isWakeEngineActive
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/30'
                : 'bg-slate-800 text-slate-500'
            }`}>
              {wakeStatus === 'detected' ? <BellRing className="w-5 h-5" /> : <Mic className="w-5 h-5 animate-pulse" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  Jarvis Always-On Hotword Engine
                </h3>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                  isWakeEngineActive
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    : 'bg-slate-950 text-slate-500 border border-slate-800'
                }`}>
                  {isWakeEngineActive ? '● WAKE ENGINE ACTIVE' : '○ WAKE ENGINE DISABLED'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                No buttons required. Say <strong className="text-indigo-300">"{wakePhrase}"</strong> or <strong className="text-indigo-300">"Hey {wakePhrase}"</strong> anytime to wake Jarvis whether the phone screen is ON or OFF.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* Phone Screen Simulated Power Button */}
            <button
              onClick={() => setIsPhoneScreenOff(!isPhoneScreenOff)}
              className={`px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
                isPhoneScreenOff
                  ? 'bg-amber-950/80 border-amber-600 text-amber-200 shadow-lg shadow-amber-900/20'
                  : 'bg-slate-950 border-slate-800 hover:bg-slate-800 text-slate-300'
              }`}
            >
              <Power className={`w-4 h-4 ${isPhoneScreenOff ? 'text-amber-400 animate-pulse' : 'text-slate-400'}`} />
              <span>{isPhoneScreenOff ? 'Phone Screen OFF (Lockscreen Standby)' : 'Simulate Screen Off'}</span>
            </button>

            {/* Always On Hotword Toggle */}
            <button
              onClick={() => setIsWakeEngineActive(!isWakeEngineActive)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                isWakeEngineActive
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-400'
              }`}
            >
              <Zap className="w-4 h-4" />
              <span>{isWakeEngineActive ? 'Hotword: Enabled' : 'Enable Hotword'}</span>
            </button>
          </div>
        </div>

        {/* Hotword Settings & Status Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Active Hotword Phrase:</span>
            <select
              value={wakePhrase}
              onChange={(e) => setWakePhrase(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono font-bold text-indigo-300 px-2.5 py-1 focus:outline-none focus:border-indigo-500"
            >
              <option value="jarvis">"Jarvis / Hey Jarvis"</option>
              <option value="omni">"Omni / Hey Omni"</option>
              <option value="assistant">"Assistant / Hey Assistant"</option>
            </select>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Audio Detector Status:</span>
            <div className="flex items-center gap-1.5 font-mono text-xs">
              {wakeStatus === 'detected' ? (
                <span className="text-emerald-400 font-bold flex items-center gap-1 animate-pulse">
                  <Activity className="w-3.5 h-3.5" /> HOTWORD DETECTED!
                </span>
              ) : isWakeEngineActive ? (
                <span className="text-indigo-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" /> Listening for "{wakePhrase}"...
                </span>
              ) : (
                <span className="text-slate-500">Disabled</span>
              )}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Standby Wake-Up Sound:</span>
            <span className="text-xs font-mono text-emerald-400 font-bold flex items-center gap-1">
              <BellRing className="w-3.5 h-3.5" /> Sci-Fi Chime Active
            </span>
          </div>
        </div>

      </div>

      {/* SIMULATED PHONE LOCKSCREEN / SCREEN OFF STANDBY MODE OVERLAY */}
      {isPhoneScreenOff ? (
        <div className="p-8 md:p-12 rounded-3xl bg-slate-950 border-2 border-indigo-500/40 shadow-2xl text-center space-y-6 relative overflow-hidden group">
          
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-950/30 via-slate-950 to-slate-950 pointer-events-none" />

          <div className="relative z-10 max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 shadow-2xl">
              <Lock className="w-8 h-8 text-indigo-400 animate-pulse" />
            </div>

            <div>
              <div className="text-3xl font-mono font-extrabold text-white tracking-widest">
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
              <div className="text-xs text-slate-500 font-mono mt-1">PHONE SCREEN OFF • STANDBY DEEP SLEEP MODE</div>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-950/50 border border-indigo-500/40 space-y-2">
              <div className="flex items-center justify-center gap-2 text-xs font-bold text-indigo-300">
                <Mic className="w-4 h-4 text-emerald-400 animate-ping" />
                Jarvis Always-On Mic Engine Active
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Just say <strong className="text-indigo-200">"Hey {wakePhrase}, play my Spotify workout playlist"</strong> or <strong className="text-indigo-200">"{wakePhrase}, show route on Google Maps"</strong>.
              </p>
              <div className="text-[10px] font-mono text-indigo-400 bg-slate-950 px-3 py-1 rounded-full border border-indigo-800/60 inline-block">
                The hotword detector will wake up the screen instantly.
              </div>
            </div>

            <button
              onClick={() => setIsPhoneScreenOff(false)}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 font-semibold transition-all"
            >
              Tap Screen to Unlock Phone
            </button>
          </div>

        </div>
      ) : (
        <>
          {screenWakeNotification && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-900 to-purple-900 border-2 border-indigo-400 text-white font-bold text-xs flex items-center justify-between shadow-2xl animate-pulse">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-300" />
                <span>{screenWakeNotification}</span>
              </div>
              <span className="text-[10px] font-mono bg-black/40 px-2 py-0.5 rounded">AUTO UNLOCKED</span>
            </div>
          )}

          {/* UNBREAKABLE SAFETY RULE PERMANENT GUARDRAIL BANNER */}
          <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/50 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs text-rose-200">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-rose-900/60 border border-rose-500/80 flex items-center justify-center shrink-0 text-rose-400">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                  UNBREAKABLE SAFETY GUARDRAIL: No Money or Banking Operations
                </h4>
                <p className="text-rose-300/90 leading-relaxed text-[11px] mt-0.5">
                  OmniAgent and its AI agents are hard-restricted by system rules: <strong>They will NEVER execute, process, or view banking transactions, wire money, or access credit card details.</strong> All financial activities must be performed directly and manually by you.
                </p>
              </div>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-rose-950 border border-rose-800 text-[10px] font-mono font-bold text-rose-300 uppercase shrink-0 self-start md:self-center">
              Rule Status: ACTIVE & ENFORCED
            </div>
          </div>

          {financialSafetyAlert && (
            <div className="p-4 rounded-2xl bg-red-900 border-2 border-red-500 text-white font-bold text-xs flex items-center gap-3 shadow-2xl animate-bounce">
              <ShieldAlert className="w-6 h-6 text-yellow-300 shrink-0" />
              <span>🛑 SECURITY ALERT: Request blocked. Financial & banking actions are strictly forbidden for AI safety.</span>
            </div>
          )}

          {/* Main Grid: Left HUD (Voice & Camera), Right Analysis Output */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Column: Live Vision Feed & Call-by-Voice HUD */}
            <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
              
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <Radio className="w-5 h-5 text-indigo-400 animate-pulse" /> Jarvis Live Vision & Call-by-Voice HUD
                  </h2>
                  <p className="text-xs text-slate-400">
                    Talk out loud or show objects to camera for instant multi-app automation.
                  </p>
                </div>

                <button
                  onClick={() => setIsTtsMuted(!isTtsMuted)}
                  className={`p-2.5 rounded-xl border text-xs flex items-center gap-1.5 transition-all ${
                    isTtsMuted
                      ? 'bg-slate-950 border-slate-800 text-slate-500'
                      : 'bg-indigo-950 border-indigo-700 text-indigo-300'
                  }`}
                  title="Toggle Text-to-Speech Voice Output"
                >
                  {isTtsMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  <span className="hidden sm:inline font-mono text-[10px]">{isTtsMuted ? 'Muted' : 'TTS Spoken'}</span>
                </button>
              </div>

              {/* Camera Viewport / HUD Screen */}
              <div className="relative rounded-2xl bg-slate-950 border border-slate-800 aspect-video overflow-hidden flex flex-col items-center justify-center shadow-inner group">
                
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${isCameraActive ? 'block' : 'hidden'}`}
                />
                
                <canvas ref={canvasRef} className="hidden" />

                {!isCameraActive && (
                  <div className="p-6 text-center space-y-3">
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
                      <Camera className="w-7 h-7" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-300">Live Camera Feed Inactive</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Click "Activate Camera Feed" to show items, screens, or QR codes to Jarvis AI.
                      </p>
                    </div>
                  </div>
                )}

                {/* Scanning Laser Overlay when Camera is active */}
                {isCameraActive && (
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-500/80 shadow-[0_0_15px_rgba(99,102,241,1)] animate-pulse" />
                    <div className="absolute bottom-3 left-3 text-[10px] font-mono bg-slate-950/80 text-emerald-400 px-2 py-1 rounded border border-emerald-800/80 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      LIVE CAMERA MATRIX 1080P
                    </div>
                  </div>
                )}

                {cameraError && (
                  <div className="absolute inset-x-4 bottom-4 p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] text-amber-300 text-center">
                    {cameraError}
                  </div>
                )}
              </div>

              {/* Camera Controls */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                {!isCameraActive ? (
                  <button
                    type="button"
                    onClick={handleStartCamera}
                    className="px-4 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-all"
                  >
                    <Camera className="w-4 h-4 text-indigo-400" /> Activate Camera Feed
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleStopCamera}
                    className="px-4 py-2.5 rounded-xl bg-rose-950 hover:bg-rose-900 border border-rose-800 text-rose-200 text-xs font-semibold flex items-center gap-2 transition-all"
                  >
                    <CameraOff className="w-4 h-4" /> Stop Camera
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleCaptureAndAnalyzeVision}
                  disabled={isAnalyzingFrame}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg disabled:opacity-50 transition-all"
                >
                  {isAnalyzingFrame ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Analyzing Vision...
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4" /> Capture & Analyze Frame
                    </>
                  )}
                </button>
              </div>

              {/* Call-By-Voice Section */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <Mic className="w-4 h-4 text-indigo-400" /> Jarvis Voice Speech Interface
                  </div>
                  {isSpeaking && (
                    <span className="text-[10px] font-mono text-indigo-400 flex items-center gap-1 bg-indigo-950 px-2 py-0.5 rounded-full animate-pulse">
                      <Volume2 className="w-3 h-3" /> Jarvis Speaking...
                    </span>
                  )}
                </div>

                {/* Mic Activation Button */}
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <button
                    type="button"
                    onClick={handleToggleVoiceCall}
                    className={`w-full sm:w-auto px-6 py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2.5 transition-all shadow-xl ${
                      isListening
                        ? 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse shadow-rose-600/30'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
                    }`}
                  >
                    {isListening ? (
                      <>
                        <MicOff className="w-4 h-4" /> End Manual Voice Input
                      </>
                    ) : (
                      <>
                        <Mic className="w-4 h-4" /> Push-To-Talk Voice Input
                      </>
                    )}
                  </button>

                  <div className="flex-1 w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-300 font-mono truncate">
                    {spokenTranscript || (isWakeEngineActive ? `Say "Hey ${wakePhrase}..." or press button above.` : "Press button or type command.")}
                  </div>

                  {spokenTranscript && (
                    <button
                      type="button"
                      onClick={() => handleSendVoiceCommand()}
                      className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shrink-0"
                    >
                      Send
                    </button>
                  )}
                </div>

                {/* Quick Voice Shortcut Chips */}
                <div className="pt-2 border-t border-slate-900">
                  <div className="text-[10px] font-semibold text-slate-500 mb-2">Try Spoken Hotword Commands:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      "Hey Jarvis, find reviews for this phone on YouTube",
                      "Jarvis, check my unread Instagram messages",
                      "OK Jarvis, show traffic route on Google Maps and start Spotify",
                      "Hey Jarvis, read my last email summary"
                    ].map((cmd, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setSpokenTranscript(cmd);
                          handleSendVoiceCommand(cmd);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-[10px] text-slate-300 border border-slate-800 transition-all text-left truncate max-w-xs"
                      >
                        "{cmd}"
                      </button>
                    ))}
                  </div>
                </div>

              </div>

            </div>

            {/* Right Column: Real-time Gemini Vision & MCP Results */}
            <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 flex flex-col justify-between">
              
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-400" /> Vision AI & Multi-App Synthesis
                  </h3>
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                    {activeAgent.name}
                  </span>
                </div>

                {lastVisionResult ? (
                  <div className="space-y-4 text-xs">
                    
                    {/* Detected Objects */}
                    <div className="space-y-1.5">
                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Objects & Objects Identified:</div>
                      <div className="flex flex-wrap gap-1.5">
                        {lastVisionResult.detectedObjects.map((obj, i) => (
                          <span key={i} className="px-2.5 py-1 rounded-lg bg-indigo-950 border border-indigo-800 text-indigo-300 font-semibold text-[11px]">
                            {obj}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Extracted Text */}
                    {lastVisionResult.textExtracted && (
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                        <div className="text-[10px] font-bold text-slate-500 uppercase">OCR Text Extracted:</div>
                        <div className="font-mono text-slate-300 text-[11px] leading-relaxed">
                          {lastVisionResult.textExtracted}
                        </div>
                      </div>
                    )}

                    {/* Spoken Jarvis Summary */}
                    <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-800/40 space-y-1">
                      <div className="text-[11px] font-bold text-purple-300 flex items-center gap-1.5">
                        <Volume2 className="w-3.5 h-3.5 text-purple-400" /> Spoken Voice Response:
                      </div>
                      <p className="text-slate-200 text-xs leading-relaxed italic">
                        "{lastVisionResult.voiceResponseText}"
                      </p>
                    </div>

                    {/* App Commands Synthesized */}
                    {lastVisionResult.suggestedAppCommands && lastVisionResult.suggestedAppCommands.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          Target App Actions Executed ({lastVisionResult.suggestedAppCommands.length}):
                        </div>
                        <div className="space-y-2">
                          {lastVisionResult.suggestedAppCommands.map((cmd, i) => (
                            <div key={i} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                              <div>
                                <div className="font-bold text-white flex items-center gap-1.5 text-xs">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                  {cmd.app}
                                </div>
                                <div className="text-[11px] text-slate-400 mt-0.5">{cmd.detail}</div>
                              </div>
                              <span className="text-[10px] font-mono text-indigo-400 bg-indigo-950 px-2 py-0.5 rounded">
                                {cmd.actionType}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Direct External Search Links */}
                    {lastVisionResult.searchLinks && lastVisionResult.searchLinks.length > 0 && (
                      <div className="space-y-2 pt-2 border-t border-slate-800">
                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          Quick Launch External App Search:
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {lastVisionResult.searchLinks.map((link, i) => (
                            <a
                              key={i}
                              href={link.url}
                              target="_blank"
                              rel="noreferrer"
                              className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/50 text-[11px] text-slate-200 flex items-center justify-between transition-all"
                            >
                              <span className="font-semibold flex items-center gap-1.5 truncate">
                                {link.platform === 'YouTube' && <Youtube className="w-3.5 h-3.5 text-red-400 shrink-0" />}
                                {link.platform === 'Instagram' && <Instagram className="w-3.5 h-3.5 text-pink-400 shrink-0" />}
                                {link.platform === 'Google' && <Search className="w-3.5 h-3.5 text-blue-400 shrink-0" />}
                                {link.platform === 'Shop' && <ExternalLink className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                                {link.platform}
                              </span>
                              <ExternalLink className="w-3 h-3 text-slate-500 shrink-0" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>
                ) : (
                  <div className="p-8 text-center space-y-3 bg-slate-950/50 rounded-2xl border border-slate-800/80">
                    <Sparkles className="w-8 h-8 text-slate-600 mx-auto" />
                    <div className="text-xs text-slate-400 font-medium">
                      No vision analysis executed yet. Click "Capture & Analyze Frame" or speak a voice command to test Jarvis multimodal vision.
                    </div>
                  </div>
                )}
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 text-[10px] font-mono text-slate-400 flex items-center justify-between">
                <span>MODEL: {customAiConfig.isCustomKeyActive ? customAiConfig.modelName : 'gemini-3.6-flash'}</span>
                <span className="text-emerald-400">STATUS: MCP BRIDGE READY</span>
              </div>

            </div>

          </div>
        </>
      )}

      {/* GOOGLE GEMINI LIGHTS UP SCREEN FROM BOTTOM (SLIDES UP ON VOICE DETECT, SLIDES DOWN OFF-SCREEN ON DISMISS/DONE) */}
      <div 
        className={`fixed bottom-0 left-0 right-0 z-50 flex flex-col items-center justify-end pb-2 transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1) transform ${
          (isListening || isSpeaking || isVoiceProcessing || wakeStatus === 'detected' || showResponseOverlay || isBottomBarVisible) && !isOverlayDismissing
            ? 'translate-y-0 opacity-100 pointer-events-auto'
            : 'translate-y-full opacity-0 pointer-events-none'
        }`}
      >
        
        {/* Shimmering Radiant Bottom Glow Light Beam */}
        <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-cyan-500/40 via-blue-600/25 via-indigo-600/10 to-transparent pointer-events-none blur-2xl animate-pulse" />

        {/* Floating Gemini Status & Audio Visualizer Dock */}
        <div className="pointer-events-auto max-w-xl w-full mx-auto px-4 mb-2">
          <div className="bg-slate-950/90 backdrop-blur-xl border border-cyan-500/50 rounded-2xl p-3 shadow-[0_0_30px_rgba(56,189,248,0.35)] flex items-center justify-between gap-3 relative">
            
            <div className="flex items-center gap-3 overflow-hidden">
              {/* Spinning Gemini Core Halo */}
              <div className="relative w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-400 via-blue-500 to-purple-600 p-0.5 shrink-0 animate-spin">
                <div className="w-full h-full bg-slate-950 rounded-full flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                </div>
              </div>

              {/* Live Voice Audio Wave Spectrum */}
              <div className="flex items-end gap-1 h-6 shrink-0">
                {[12, 20, 16, 24, 10, 28, 18, 22, 14, 26, 8, 20, 15, 22].map((height, i) => (
                  <span
                    key={i}
                    className="w-1 bg-gradient-to-t from-cyan-400 via-blue-500 to-indigo-500 rounded-full animate-bounce"
                    style={{
                      height: (isListening || isSpeaking || isVoiceProcessing || wakeStatus === 'detected') ? `${height}px` : '6px',
                      animationDelay: `${i * 0.08}s`,
                      animationDuration: '0.6s'
                    }}
                  />
                ))}
              </div>

              {/* Dynamic Transcript / Mode Label */}
              <div className="truncate text-xs font-mono">
                {isVoiceProcessing ? (
                  <span className="text-cyan-300 font-bold flex items-center gap-1.5 animate-pulse">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" /> Synthesizing Actions...
                  </span>
                ) : isSpeaking ? (
                  <span className="text-purple-300 font-bold flex items-center gap-1.5">
                    <Volume2 className="w-3.5 h-3.5 text-purple-400 animate-pulse" /> Speaking Response...
                  </span>
                ) : isListening ? (
                  <span className="text-emerald-300 font-bold truncate">
                    🎙️ Listening: "{spokenTranscript || 'Speak command...'}"
                  </span>
                ) : wakeStatus === 'detected' ? (
                  <span className="text-amber-300 font-bold">
                    ⚡ Hotword Woken! Listening...
                  </span>
                ) : (
                  <span className="text-slate-400 truncate">
                    Say <strong className="text-indigo-300">"Hey {wakePhrase}"</strong> or press mic
                  </span>
                )}
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => {
                  triggerBottomGlow();
                  handleToggleVoiceCall();
                }}
                className={`p-2 rounded-xl border text-xs font-bold transition-all ${
                  isListening
                    ? 'bg-rose-600 border-rose-500 text-white shadow-lg animate-pulse'
                    : 'bg-indigo-600 hover:bg-indigo-500 border-indigo-400 text-white'
                }`}
                title="Toggle Mic"
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              <button
                onClick={() => setIsTtsMuted(!isTtsMuted)}
                className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white"
                title="Toggle Speech"
              >
                {isTtsMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>

              {/* Back / Dismiss Slide Down Button */}
              <button
                onClick={handleDismissOverlay}
                className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-white text-xs font-bold font-mono flex items-center gap-1"
                title="Dismiss & Hide Bar"
              >
                Back ✕
              </button>
            </div>

          </div>
        </div>

        {/* Bottom Shimmer Line */}
        <div className="h-1.5 w-full bg-gradient-to-r from-cyan-400 via-blue-500 via-indigo-500 via-purple-500 to-cyan-400 shadow-[0_0_30px_#38bdf8] animate-pulse" />

      </div>

      {/* OVERLAY SCREEN RESPONSE CARD (SLIDES UP & DOWN OVER EVERYTHING) */}
      {showResponseOverlay && (
        <div 
          className={`fixed inset-x-0 bottom-24 z-40 px-4 max-w-2xl mx-auto pointer-events-auto transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1) transform ${
            !isOverlayDismissing ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0 pointer-events-none'
          }`}
        >
          <div className="bg-slate-900/95 backdrop-blur-2xl border-2 border-indigo-500/60 rounded-3xl p-6 shadow-[0_10px_50px_rgba(99,102,241,0.4)] space-y-4 relative overflow-hidden">
            
            {/* Ambient Background Aura */}
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
            
            {/* Header / Dismiss */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md">
                  <Radio className="w-4 h-4 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Jarvis Assistant Response</h4>
                  <p className="text-[10px] text-slate-400 font-mono">Overlaid on Screen • Real-time Voice Multi-App Sync</p>
                </div>
              </div>

              <button
                onClick={handleDismissOverlay}
                className="p-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white text-xs font-bold font-mono px-2.5 flex items-center gap-1 hover:border-slate-700"
              >
                Back ✕
              </button>
            </div>

            {/* Spoken Prompt Bubble */}
            {spokenTranscript && (
              <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80 text-xs text-slate-300 flex items-start gap-2.5">
                <div className="p-1 rounded bg-indigo-950 text-indigo-400 shrink-0 mt-0.5">
                  <Mic className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-slate-500 block">YOU SPOKE:</span>
                  <span className="font-semibold text-white">"{spokenTranscript}"</span>
                </div>
              </div>
            )}

            {/* AI Response Text */}
            <div className="space-y-2">
              {isVoiceProcessing ? (
                <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-800/60 flex items-center justify-center gap-3 text-xs text-cyan-300 font-medium animate-pulse">
                  <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
                  <span>Processing query with Gemini 3.6 Flash & triggering app drivers...</span>
                </div>
              ) : lastVoiceResult ? (
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="text-xs text-slate-200 leading-relaxed font-sans">
                    {lastVoiceResult.responseSummary || "Command executed successfully across mobile app drivers."}
                  </div>

                  {/* Actions Executed List */}
                  {lastVoiceResult.actionsExecuted && lastVoiceResult.actionsExecuted.length > 0 && (
                    <div className="pt-2 border-t border-slate-900 space-y-1.5">
                      <div className="text-[10px] font-mono text-slate-500 font-bold uppercase">App Actions Executed:</div>
                      <div className="flex flex-wrap gap-1.5">
                        {lastVoiceResult.actionsExecuted.map((act: any, idx: number) => (
                          <span key={idx} className="px-2.5 py-1 rounded-lg bg-indigo-950 border border-indigo-800 text-indigo-300 text-[10px] font-mono font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" /> {act.app || 'Mobile Driver'}: {act.action}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </div>

            {/* Response Actions */}
            {lastVoiceResult && lastVoiceResult.responseSummary && (
              <div className="flex items-center justify-between pt-1 text-xs">
                <button
                  onClick={() => speakOutLoud(lastVoiceResult.responseSummary)}
                  className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-300 text-[11px] font-semibold flex items-center gap-1.5"
                >
                  <Volume2 className="w-3.5 h-3.5 text-purple-400" /> Replay Voice
                </button>

                <button
                  onClick={handleDismissOverlay}
                  className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] shadow-md flex items-center gap-1"
                >
                  Done ↩
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
