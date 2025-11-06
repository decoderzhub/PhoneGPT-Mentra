export interface User {
  id: number;
  email: string;
}

export interface Persona {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  documentCount: number;
}

export interface GlassSession {
  id: number;
  userId: number;
  sessionName: string;
  deviceId?: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  is_paused: boolean;
  wpm: number;
  persona: string;
  conversation_state?: string;
  conversation_name?: string;
}

export interface GlassConversation {
  id: number;
  sessionId: number;
  query: string;
  response: string;
  timestamp: string;
  responsePages?: string[];
  currentPage?: number;
  duration?: number;
}

export interface Document {
  id: number;
  fileName: string;
  content: string;
  persona: string;
  type?: string;
  created_at: string;
}

export interface Stats {
  totalConversations: number;
  averageResponseTime: number;
  activeGlassConnections: number;
}
