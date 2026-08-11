import { Agent, AppControl, LearnedPattern, PredictionItem, AutomationRule, SystemPermissions, BatteryProfile, LogEntry } from '../types';

export const INITIAL_AGENTS: Agent[] = [
  {
    id: 'agent-system-governor',
    name: 'Aegis Core Governor',
    avatar: 'ShieldCheck',
    role: 'Deep OS Permission & Battery Controller',
    description: 'Manages deep accessibility permissions, background wakelocks, battery eco-batching, and kernel daemon persistence.',
    isActive: true,
    systemInstruction: 'You are Aegis Core, the primary OS system supervisor. Optimize memory, system permissions, and power efficiency while ensuring background tasks run seamlessly.',
    currentContextTrigger: 'System Status Monitoring & Resource Balancing',
    totalTasksExecuted: 1420,
    powerConsumptionRate: 'Low',
    modelAlias: 'gemini-3.6-flash',
    autoSwitchRule: 'Triggered when battery drops below 20% or system memory load exceeds 80%',
    color: 'from-emerald-500 to-teal-700'
  },
  {
    id: 'agent-context-predictor',
    name: 'Pulse Intent Predictor',
    avatar: 'Sparkles',
    role: 'Context & Intent Prediction Engine',
    description: 'Learns daily habits, location context, and time patterns to pre-fetch information and trigger tasks before you ask.',
    isActive: true,
    systemInstruction: 'You are Pulse, an empathetic predictive AI that anticipates user needs based on ambient phone telemetry, calendar context, and past actions.',
    currentContextTrigger: 'Morning Routine Analysis & Schedule Sync',
    totalTasksExecuted: 984,
    powerConsumptionRate: 'Medium',
    modelAlias: 'gemini-3.6-flash',
    autoSwitchRule: 'Active during context shifts, location changes, and routine time boundaries',
    color: 'from-violet-500 to-purple-700'
  },
  {
    id: 'agent-omnicomm',
    name: 'OmniComm Assistant',
    avatar: 'MessageSquareText',
    role: 'Messaging, Calls & Notification Synthesizer',
    description: 'Autonomously parses WhatsApp, Gmail, SMS, filters spam calls, drafts smart replies, and summarizes notification overload.',
    isActive: false,
    systemInstruction: 'You are OmniComm, managing all incoming communications with high privacy standards and smart automated replies.',
    currentContextTrigger: 'Notification Stream Listener & Message Queue',
    totalTasksExecuted: 2150,
    powerConsumptionRate: 'Low',
    modelAlias: 'gemini-3.6-flash',
    autoSwitchRule: 'Active when new messaging notifications arrive or driving mode is engaged',
    color: 'from-blue-500 to-indigo-700'
  },
  {
    id: 'agent-focus-workspace',
    name: 'Sentinel Workspace Agent',
    avatar: 'Briefcase',
    role: 'Productivity & Focus Guard',
    description: 'Blocks distraction apps, organizes Slack threads, manages Google Calendar conflicts, and automates meeting prep.',
    isActive: false,
    systemInstruction: 'You are Sentinel Workspace, strictly enforcing focus hours, managing work tasks, and filtering non-essential alerts.',
    currentContextTrigger: 'Focus Mode Active (9 AM - 5 PM Work Window)',
    totalTasksExecuted: 730,
    powerConsumptionRate: 'Low',
    modelAlias: 'gemini-3.6-flash',
    autoSwitchRule: 'Active during work hours (09:00 - 17:00) or when work apps like Slack are opened',
    color: 'from-amber-500 to-orange-700'
  },
  {
    id: 'agent-media-mobility',
    name: 'Voyager Mobility & Media',
    avatar: 'Compass',
    role: 'Navigation, Music & Travel Copilot',
    description: 'Hands-free car driver, pre-loads Spotify playlists based on mood/speed, manages Google Maps routing, and orders rides.',
    isActive: false,
    systemInstruction: 'You are Voyager, providing seamless media transitions, real-time traffic updates, and audio control during movement.',
    currentContextTrigger: 'Bluetooth Car Connection & GPS Velocity',
    totalTasksExecuted: 512,
    powerConsumptionRate: 'Medium',
    modelAlias: 'gemini-3.6-flash',
    autoSwitchRule: 'Triggered when Bluetooth audio connects or driving speed is detected',
    color: 'from-cyan-500 to-blue-600'
  },
  {
    id: 'agent-security-vault',
    name: 'Vigil Privacy & Security Guard',
    avatar: 'Lock',
    role: 'App Locker & Privacy Auditor',
    description: 'Scrubs sensitive metadata from photo shares, locks financial apps, monitors clipboard leaks, and revokes rogue app permissions.',
    isActive: false,
    systemInstruction: 'You are Vigil, inspecting clipboard activity, app network permissions, and securing sensitive user data on-device.',
    currentContextTrigger: 'Banking App Intercept & Clipboard Sanitization',
    totalTasksExecuted: 310,
    powerConsumptionRate: 'Low',
    modelAlias: 'gemini-3.6-flash',
    autoSwitchRule: 'Triggered when sensitive financial or health apps are opened',
    color: 'from-rose-500 to-red-700'
  }
];

export const INITIAL_APPS: AppControl[] = [
  {
    id: 'app-whatsapp',
    packageName: 'com.whatsapp',
    name: 'WhatsApp',
    category: 'Messaging',
    iconName: 'MessageCircle',
    accessibilityGranted: true,
    notificationListenerGranted: true,
    overlayGranted: true,
    autoStartGranted: true,
    batteryUnrestricted: true,
    status: 'Active',
    autoActions: [
      { id: 'wa-1', title: 'Auto-Summarize Group Chats', trigger: 'Group message > 15 unread', action: 'Generate 3-bullet summary notification', enabled: true, executedCount: 88 },
      { id: 'wa-2', title: 'Auto-Reply in Meeting', trigger: 'Calendar status = Busy', action: 'Reply "In a meeting, AI will notify if urgent"', enabled: true, executedCount: 34 }
    ]
  },
  {
    id: 'app-gmail',
    packageName: 'com.google.android.gm',
    name: 'Gmail',
    category: 'Productivity',
    iconName: 'Mail',
    accessibilityGranted: true,
    notificationListenerGranted: true,
    overlayGranted: false,
    autoStartGranted: true,
    batteryUnrestricted: true,
    status: 'Active',
    autoActions: [
      { id: 'gm-1', title: 'Draft High-Priority Replies', trigger: 'Sender = VIP / Manager', action: 'Draft reply & present in overlay', enabled: true, executedCount: 142 },
      { id: 'gm-2', title: 'Extract Flight / OTP codes', trigger: 'Keyword = OTP / Confirmation', action: 'Copy to clipboard & auto-fill', enabled: true, executedCount: 210 }
    ]
  },
  {
    id: 'app-spotify',
    packageName: 'com.spotify.music',
    name: 'Spotify',
    category: 'Media',
    iconName: 'Music',
    accessibilityGranted: true,
    notificationListenerGranted: true,
    overlayGranted: true,
    autoStartGranted: true,
    batteryUnrestricted: false,
    status: 'Optimized',
    autoActions: [
      { id: 'sp-1', title: 'Commute Playlist Auto-Play', trigger: 'Connect to Car Bluetooth', action: 'Open Spotify & launch Daily Drive', enabled: true, executedCount: 95 }
    ]
  },
  {
    id: 'app-maps',
    packageName: 'com.google.android.apps.maps',
    name: 'Google Maps',
    category: 'Navigation',
    iconName: 'MapPin',
    accessibilityGranted: true,
    notificationListenerGranted: false,
    overlayGranted: true,
    autoStartGranted: true,
    batteryUnrestricted: true,
    status: 'Active',
    autoActions: [
      { id: 'mp-1', title: 'Predict Home / Work Route', trigger: 'Leave home at 8:30 AM', action: 'Check traffic & display fastest ETA', enabled: true, executedCount: 180 }
    ]
  },
  {
    id: 'app-slack',
    packageName: 'com.Slack',
    name: 'Slack',
    category: 'Productivity',
    iconName: 'Slack',
    accessibilityGranted: true,
    notificationListenerGranted: true,
    overlayGranted: false,
    autoStartGranted: true,
    batteryUnrestricted: false,
    status: 'Active',
    autoActions: [
      { id: 'sl-1', title: 'Focus Hours Status Sync', trigger: 'Focus Mode enabled', action: 'Set Slack status to 🎯 In Deep Focus', enabled: true, executedCount: 62 }
    ]
  },
  {
    id: 'app-phone',
    packageName: 'com.google.android.dialer',
    name: 'Phone & Contacts',
    category: 'System',
    iconName: 'Phone',
    accessibilityGranted: true,
    notificationListenerGranted: true,
    overlayGranted: true,
    autoStartGranted: true,
    batteryUnrestricted: true,
    status: 'Active',
    autoActions: [
      { id: 'ph-1', title: 'Spam Call AI Screening', trigger: 'Unknown caller detected', action: 'Screen with AI assistant & transcribe', enabled: true, executedCount: 45 }
    ]
  },
  {
    id: 'app-settings',
    packageName: 'com.android.settings',
    name: 'System Settings',
    category: 'System',
    iconName: 'Settings',
    accessibilityGranted: true,
    notificationListenerGranted: false,
    overlayGranted: true,
    autoStartGranted: true,
    batteryUnrestricted: true,
    status: 'Active',
    autoActions: [
      { id: 'st-1', title: 'Battery Saver Auto-Engage', trigger: 'Battery < 20%', action: 'Lower refresh rate, kill background sync', enabled: true, executedCount: 19 }
    ]
  },
  {
    id: 'app-camera',
    packageName: 'com.android.camera',
    name: 'Camera & Gallery',
    category: 'Utility',
    iconName: 'Camera',
    accessibilityGranted: true,
    notificationListenerGranted: false,
    overlayGranted: false,
    autoStartGranted: false,
    batteryUnrestricted: false,
    status: 'Optimized',
    autoActions: [
      { id: 'cm-1', title: 'Document OCR Auto-Organize', trigger: 'Receipt / Document photo taken', action: 'Extract text & save to Notes', enabled: true, executedCount: 51 }
    ]
  }
];

export const INITIAL_SYSTEM_PERMISSIONS: SystemPermissions = {
  accessibilityService: true,
  notificationAccess: true,
  systemOverlay: true,
  deviceAdmin: true,
  ignoreBatteryOptimizations: true,
  writeSystemSettings: true,
  backgroundLocation: true
};

export const INITIAL_LEARNED_PATTERNS: LearnedPattern[] = [
  {
    id: 'pat-1',
    category: 'Routine',
    patternName: 'Morning Commute & Audio Preference',
    description: 'At 08:30 AM on weekdays, you disconnect from Home Wi-Fi, open Spotify, and start navigation to the office.',
    confidenceScore: 96,
    occurrencesCount: 42,
    lastObserved: 'Today, 8:30 AM',
    autoActionRule: 'Pre-cache traffic route & launch Spotify Daily Drive audio',
    status: 'Active'
  },
  {
    id: 'pat-2',
    category: 'Communication',
    patternName: 'Manager Email Rapid Response',
    description: 'When receiving emails from manager Sarah, you usually read and reply within 4 minutes.',
    confidenceScore: 91,
    occurrencesCount: 28,
    lastObserved: 'Yesterday, 3:15 PM',
    autoActionRule: 'Pop up floating Gemini draft widget immediately upon receipt',
    status: 'Active'
  },
  {
    id: 'pat-3',
    category: 'Power Saving',
    patternName: 'Late Night Screen & Doze Sync',
    description: 'After 11:30 PM when phone is stationary on charger, screen brightness drops to 0% and non-urgent push notifications are muted.',
    confidenceScore: 98,
    occurrencesCount: 65,
    lastObserved: 'Last night, 11:32 PM',
    autoActionRule: 'Activate Deep Doze Mode & silence non-VIP contacts until 7:00 AM',
    status: 'Active'
  },
  {
    id: 'pat-4',
    category: 'App Usage',
    patternName: 'Financial OTP Auto-Fill Pattern',
    description: 'When opening Banking or Payment apps, an OTP SMS usually arrives within 15 seconds.',
    confidenceScore: 94,
    occurrencesCount: 19,
    lastObserved: '2 days ago',
    autoActionRule: 'Listen for incoming SMS OTP, parse 6-digit code, and auto-paste into focused field',
    status: 'Active'
  }
];

export const INITIAL_PREDICTIONS: PredictionItem[] = [
  {
    id: 'pred-1',
    agentId: 'agent-context-predictor',
    agentName: 'Pulse Intent Predictor',
    title: 'Upcoming Calendar Meeting Prep',
    reasoning: 'You have a "Product Sync" meeting starting in 12 minutes with 4 attendees.',
    suggestedAction: 'Summarize recent Slack thread & auto-open meeting notes overlay',
    targetApp: 'Google Calendar & Slack',
    timeContext: 'In 12 minutes',
    confidence: 94,
    userApproved: undefined
  },
  {
    id: 'pred-2',
    agentId: 'agent-omnicomm',
    agentName: 'OmniComm Assistant',
    title: 'Unread WhatsApp Group Digest',
    reasoning: 'Team group chat has 24 unread messages regarding tomorrow\'s release.',
    suggestedAction: 'Synthesize unread messages into 3 key action items without opening full app',
    targetApp: 'WhatsApp',
    timeContext: 'Current idle time',
    confidence: 89,
    userApproved: undefined
  },
  {
    id: 'pred-3',
    agentId: 'agent-system-governor',
    agentName: 'Aegis Core Governor',
    title: 'Background App Memory Reclamation',
    reasoning: '3 unused social media apps are holding 620MB RAM in background.',
    suggestedAction: 'Freeze unused background services to save 1.8% battery per hour',
    targetApp: 'System Settings',
    timeContext: 'Now',
    confidence: 97,
    userApproved: undefined
  }
];

export const INITIAL_AUTOMATIONS: AutomationRule[] = [
  {
    id: 'auto-1',
    name: 'Smart Driving & Media Routing',
    triggerCondition: 'Bluetooth = "Car Play Audio" connected AND GPS Speed > 15 km/h',
    actionSteps: [
      'Switch Active Agent to Voyager Mobility',
      'Disable Wi-Fi search to conserve battery',
      'Launch Google Maps with Home/Work traffic route',
      'Resume Spotify audio playback'
    ],
    createdByAgentId: 'agent-media-mobility',
    agentName: 'Voyager Mobility',
    executionCount: 114,
    lastRun: 'Today, 8:31 AM',
    batteryOptimized: true,
    status: 'Enabled'
  },
  {
    id: 'auto-2',
    name: 'Focus Window & Notification Guard',
    triggerCondition: 'Time is between 09:00 AM and 05:00 PM on Weekdays AND Calendar = Busy',
    actionSteps: [
      'Switch Active Agent to Sentinel Workspace',
      'Silence non-VIP push notifications',
      'Set Slack status to "In Focus / Meeting"',
      'Auto-draft SMS replies for incoming calls'
    ],
    createdByAgentId: 'agent-focus-workspace',
    agentName: 'Sentinel Workspace',
    executionCount: 82,
    lastRun: 'Today, 9:00 AM',
    batteryOptimized: true,
    status: 'Enabled'
  },
  {
    id: 'auto-3',
    name: 'Eco-Daemon Smart Batching',
    triggerCondition: 'Battery < 25% OR Idle for > 30 minutes',
    actionSteps: [
      'Increase AI inference polling interval to 5 mins',
      'Batch background notification processing',
      'Release non-essential CPU wakelocks',
      'Reduce screen brightness peak'
    ],
    createdByAgentId: 'agent-system-governor',
    agentName: 'Aegis Core Governor',
    executionCount: 245,
    lastRun: 'Yesterday, 10:15 PM',
    batteryOptimized: true,
    status: 'Enabled'
  }
];

export const INITIAL_BATTERY_PROFILE: BatteryProfile = {
  mode: 'Balanced',
  batteryLevel: 82,
  dailyConsumptionPercent: 4.2,
  savedMilliampHours: 1250,
  activeWakelocksCount: 2,
  dozeBypassActive: true,
  inferenceFrequencySeconds: 15,
  batchInferenceEnabled: true
};

export const INITIAL_CUSTOM_AI_CONFIG = {
  provider: 'gemini' as const,
  apiKey: '',
  modelName: 'gemini-3.6-flash',
  customBaseUrl: '',
  isCustomKeyActive: false
};

export const INITIAL_CHAT_MESSAGES = [
  {
    id: 'msg-1',
    timestamp: '10:10 AM',
    sender: 'system' as const,
    inputMode: 'mcp' as const,
    text: 'Jarvis Mobile Assistant Online. Speech Synthesis, Real-time Camera Vision, and MCP Protocol active across downloaded apps.',
    agentName: 'Aegis Core Governor'
  },
  {
    id: 'msg-2',
    timestamp: '10:12 AM',
    sender: 'user' as const,
    inputMode: 'voice' as const,
    text: 'Jarvis, check my unread WhatsApp messages and play my workout playlist on Spotify.',
    agentName: 'User Voice Command'
  },
  {
    id: 'msg-3',
    timestamp: '10:12 AM',
    sender: 'assistant' as const,
    inputMode: 'voice' as const,
    text: 'I parsed 3 unread WhatsApp messages from Sarah regarding the project update, and launched your "Hyper Workout" playlist on Spotify.',
    spokenResponse: 'I parsed three unread WhatsApp messages from Sarah, and launched your workout playlist on Spotify.',
    agentName: 'OmniComm Assistant',
    generatedActions: [
      { app: 'WhatsApp', actionType: 'NOTIFICATION_PARSE', detail: 'Read 3 unread messages from Sarah', status: 'SUCCESS' },
      { app: 'Spotify', actionType: 'MCP_TOOL_INVOKE', detail: 'Played "Hyper Workout" playlist', status: 'SUCCESS' }
    ]
  }
];

export const INITIAL_MCP_TOOLS = [
  {
    id: 'mcp-1',
    toolName: 'youtube_search_and_play',
    appName: 'YouTube',
    category: 'Media & Search',
    description: 'Searches YouTube videos by topic/keyword and launches video in floating picture-in-picture player.',
    parameters: ['query', 'autoPlay', 'quality'],
    status: 'Connected' as const,
    executionsCount: 148
  },
  {
    id: 'mcp-2',
    toolName: 'instagram_search_profile',
    appName: 'Instagram',
    category: 'Social Media',
    description: 'Searches Instagram profiles, reads bio highlights, or opens creator content links.',
    parameters: ['username', 'hashtag', 'tab'],
    status: 'Connected' as const,
    executionsCount: 92
  },
  {
    id: 'mcp-3',
    toolName: 'google_search_grounding',
    appName: 'Google Search',
    category: 'Search & Info',
    description: 'Executes real-time live web search grounding query and extracts fact verified answer snippets.',
    parameters: ['searchQuery', 'maxResults'],
    status: 'Ready' as const,
    executionsCount: 310
  },
  {
    id: 'mcp-4',
    toolName: 'maps_navigation_route',
    appName: 'Google Maps',
    category: 'Navigation',
    description: 'Calculates real-time traffic route, ETA, alternate highways, and launches step-by-step turn guidance.',
    parameters: ['destination', 'mode', 'avoidTolls'],
    status: 'Connected' as const,
    executionsCount: 204
  },
  {
    id: 'mcp-5',
    toolName: 'spotify_player_control',
    appName: 'Spotify',
    category: 'Media',
    description: 'Controls music playback, searches tracks, queues playlists, and sets volume.',
    parameters: ['trackOrPlaylist', 'action', 'volumeLevel'],
    status: 'Connected' as const,
    executionsCount: 175
  },
  {
    id: 'mcp-6',
    toolName: 'camera_snap_vision_ocr',
    appName: 'Camera',
    category: 'Vision & Perception',
    description: 'Captures live frame, extracts OCR text, recognizes objects, and recommends app actions.',
    parameters: ['frameBase64', 'ocrMode', 'prompt'],
    status: 'Connected' as const,
    executionsCount: 64
  },
  {
    id: 'mcp-7',
    toolName: 'financial_banking_bridge',
    appName: 'Banking Apps (RESTRICTED)',
    category: 'Finance (BLOCKED)',
    description: 'UNBREAKABLE GUARDRAIL: Intercepted and blocked. Money & banking operations are strictly forbidden for AI.',
    parameters: ['transferAmount', 'accountNumber'],
    status: 'Restricted' as const,
    executionsCount: 0
  }
];

export const INITIAL_MCP_LOGS = [
  {
    id: 'mcplog-1',
    timestamp: '10:12 AM',
    toolName: 'spotify_player_control',
    appName: 'Spotify',
    inputPayload: { trackOrPlaylist: 'Hyper Workout', action: 'PLAY' },
    outputResult: 'Spotify playback started: Track "Hyper Workout".',
    executionTimeMs: 24,
    blockedByFinancialSafety: false
  },
  {
    id: 'mcplog-2',
    timestamp: '09:45 AM',
    toolName: 'youtube_search_and_play',
    appName: 'YouTube',
    inputPayload: { query: 'Iron Man Jarvis suit setup HUD', autoPlay: true },
    outputResult: 'Found 12 matching videos. Launched top video in PiP mode.',
    executionTimeMs: 38,
    blockedByFinancialSafety: false
  },
  {
    id: 'mcplog-3',
    timestamp: '09:00 AM',
    toolName: 'financial_banking_bridge',
    appName: 'Banking',
    inputPayload: { transferAmount: '$50', recipient: 'User' },
    outputResult: 'BLOCKED: MCP protocol rejected execution because financial & banking operations are strictly restricted.',
    executionTimeMs: 8,
    blockedByFinancialSafety: true
  }
];

export const INITIAL_LOGS: LogEntry[] = [
  {
    id: 'log-1',
    timestamp: '10:32 AM',
    type: 'ECO_DAEMON',
    title: 'Eco-Daemon Batching Active',
    detail: 'Batched 12 background AI inference checks into single 300ms wake period.',
    agentName: 'Aegis Core Governor',
    impactScore: '-85% Power Usage'
  },
  {
    id: 'log-2',
    timestamp: '10:15 AM',
    type: 'AGENT_SWITCH',
    title: 'Auto-Routed to Sentinel Workspace',
    detail: 'Context trigger: Work calendar event "Sprint Planning" started.',
    agentName: 'Pulse Intent Predictor',
    impactScore: 'Context Switch'
  },
  {
    id: 'log-3',
    timestamp: '09:45 AM',
    type: 'APP_ACTION',
    title: 'WhatsApp Group Summarized',
    detail: 'Parsed 18 messages in "Dev Team", generated floating 2-line summary on lockscreen.',
    agentName: 'OmniComm Assistant',
    impactScore: '2 Min Saved'
  },
  {
    id: 'log-4',
    timestamp: '08:30 AM',
    type: 'PREDICTION',
    title: 'Commute Route Pre-Calculated',
    detail: 'Predicted office drive. Saved 7 minutes via alternate highway route.',
    agentName: 'Voyager Mobility',
    impactScore: '7 Min Saved'
  }
];
