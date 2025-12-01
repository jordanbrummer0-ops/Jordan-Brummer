export interface GuideStep {
  id: number;
  text: string;
  note?: string;
}

export interface Guide {
  id: string;
  title: string;
  miuiVersion: '14' | '13' | '12' | 'HyperOS' | 'All';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  steps: GuideStep[];
  updatedAt: string;
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
  isThinking?: boolean;
  groundingChunks?: GroundingChunk[];
}

export enum AppView {
  HOME = 'HOME',
  GUIDES = 'GUIDES',
  CHAT = 'CHAT',
  DISCLAIMER = 'DISCLAIMER'
}

export interface DeviceModel {
  name: string;
  code: string;
  chipset: 'MediaTek' | 'Snapdragon';
}