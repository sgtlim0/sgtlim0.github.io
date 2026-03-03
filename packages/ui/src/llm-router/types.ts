export interface LLMModel {
  id: string;
  name: string;
  provider: string;
  providerIcon: string;
  category: 'chat' | 'completion' | 'embedding' | 'image' | 'audio' | 'code';
  inputPrice: number;    // per 1M tokens in KRW
  outputPrice: number;   // per 1M tokens in KRW
  contextWindow: number; // tokens
  maxOutput: number;     // tokens
  latency: string;       // e.g. "0.8초"
  isPopular?: boolean;
}

export interface APIKey {
  id: string;
  name: string;
  key: string;
  created: string;
  lastUsed: string;
  status: 'active' | 'revoked';
}

export interface UsageStat {
  date: string;
  requests: number;
  tokens: number;
  cost: number;
}

export interface ModelUsage {
  model: string;
  requests: number;
  tokens: number;
  cost: number;
}
