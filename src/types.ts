export type BatteryMode = 'Ultra-Eco' | 'Balanced' | 'Performance';

export interface Agent {
  id: string;
  name: string;
  avatar: string;
  role: string;
  description: string;
  isActive: boolean;
  systemInstruction: string;
  currentContextTrigger: string;
  totalTasksExecuted: number;
  powerConsumptionRate: 'Low' | 'Medium' | 'High';
  modelAlias: string;
  autoSwitchRule: string;
  color: string;
}

export interface AppControl {
  id: string;
  packageName: string;
  name: string;
  category: 'Messaging' | 'Productivity' | 'Media' | 'Navigation' | 'System' | 'Utility';
  iconName: string;
  accessibilityGranted: boolean;
  notificationListenerGranted: boolean;
  overlayGranted: boolean;
  autoStartGranted: boolean;
  batteryUnrestricted: boolean;
  status: 'Active' | 'Background' | 'Optimized' | 'Blocked';
  autoActions: {
    id: string;
    title: string;
    trigger: string;
    action: string;
    enabled: boolean;
    executedCount: number;
  }[];
}

export interface LearnedPattern {
  id: string;
  category: 'Routine' | 'Communication' | 'App Usage' | 'Power Saving' | 'Location';
  patternName: string;
  description: string;
  confidenceScore: number; // 0-100
  occurrencesCount: number;
  lastObserved: string;
  autoActionRule: string;
  status: 'Active' | 'Validating' | 'Dismissed';
}

export interface PredictionItem {
  id: string;
  agentId: string;
  agentName: string;
  title: string;
  reasoning: string;
  suggestedAction: string;
  targetApp: string;
  timeContext: string;
  confidence: number;
  userApproved?: boolean;
}

export interface AutomationRule {
  id: string;
  name: string;
  triggerCondition: string;
  actionSteps: string[];
  createdByAgentId: string;
  agentName: string;
  executionCount: number;
  lastRun: string;
  batteryOptimized: boolean;
  status: 'Enabled' | 'Paused' | 'Testing';
}

export interface SystemPermissions {
  accessibilityService: boolean;
  notificationAccess: boolean;
  systemOverlay: boolean;
  deviceAdmin: boolean;
  ignoreBatteryOptimizations: boolean;
  writeSystemSettings: boolean;
  backgroundLocation: boolean;
}

export interface BatteryProfile {
  mode: BatteryMode;
  batteryLevel: number;
  dailyConsumptionPercent: number;
  savedMilliampHours: number;
  activeWakelocksCount: number;
  dozeBypassActive: boolean;
  inferenceFrequencySeconds: number;
  batchInferenceEnabled: boolean;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  type: 'AGENT_SWITCH' | 'APP_ACTION' | 'PREDICTION' | 'ECO_DAEMON' | 'PERMISSION' | 'USER_EXECUTION' | 'VOICE_CALL' | 'SAFETY_BLOCK' | 'MCP_TOOL';
  title: string;
  detail: string;
  agentName: string;
  impactScore?: string;
}

export interface CustomAiConfig {
  provider: 'gemini' | 'openai' | 'anthropic' | 'custom';
  apiKey: string;
  modelName: string;
  customBaseUrl?: string;
  isCustomKeyActive: boolean;
}

export interface ChatMessage {
  id: string;
  timestamp: string;
  sender: 'user' | 'assistant' | 'system';
  inputMode: 'text' | 'voice' | 'vision' | 'mcp';
  text: string;
  agentName?: string;
  agentId?: string;
  spokenResponse?: string;
  generatedActions?: {
    app: string;
    actionType: string;
    detail: string;
    status: string;
  }[];
  visionFrameDataUrl?: string;
  financialSafetyBlocked?: boolean;
}

export interface McpTool {
  id: string;
  toolName: string;
  appName: string;
  category: string;
  description: string;
  parameters: string[];
  status: 'Connected' | 'Ready' | 'Restricted';
  executionsCount: number;
}

export interface McpInvocationLog {
  id: string;
  timestamp: string;
  toolName: string;
  appName: string;
  inputPayload: Record<string, any>;
  outputResult: string;
  executionTimeMs: number;
  blockedByFinancialSafety?: boolean;
}

export interface VisionAnalysisResult {
  detectedObjects: string[];
  textExtracted?: string;
  identifiedAppTarget?: string;
  suggestedAppCommands: {
    app: string;
    actionType: string;
    detail: string;
  }[];
  voiceResponseText: string;
  safetyGuardrailTriggered: boolean;
  searchLinks?: {
    platform: 'Google' | 'YouTube' | 'Instagram' | 'Shop';
    query: string;
    url: string;
  }[];
}
