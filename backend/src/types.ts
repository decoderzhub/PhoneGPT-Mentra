import { AppSession } from '@mentra/sdk';

export interface ConversationMessage {
  id: string;
  timestamp: string;
  query: string;
  response: string;
  pages: string[];
  currentPage: number;
}

export interface SessionState {
  sessionId: string;
  userId: string;
  session: AppSession;
  state: 'listening' | 'processing' | 'displaying' | 'paused' | 'transcribing';
  currentTranscript: string;
  lastResponse: string;
  conversation: ConversationMessage[];
  currentPageIndex: number;
  isPaused: boolean;
  displayDuration: number;
  wpm: number;
  dbSessionId?: number;
  persona?: string;
  autoAdvancePages: boolean;
  pageDisplayDuration: number;
  eventHistory: Array<{
    type: string;
    data: any;
    timestamp: string;
  }>;
}

export interface QueuedEvent {
  type: string;
  data: any;
  timestamp: string;
  sessionId?: string;
}

export interface JWTPayload {
  userId: number;
  email: string;
}
