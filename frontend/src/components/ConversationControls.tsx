import React from 'react';
import { Play, Pause, Mic, MicOff, Volume2, Upload } from 'lucide-react';
import { GlassSession } from '../types';

interface ConversationControlsProps {
  activeSession: GlassSession;
  isListening: boolean;
  wpm: number;
  onStartConversation: () => void;
  onStopConversation: () => void;
  onToggleListening: () => void;
  onShowUploadModal: () => void;
}

export default function ConversationControls({
  activeSession,
  isListening,
  wpm,
  onStartConversation,
  onStopConversation,
  onToggleListening,
  onShowUploadModal,
}: ConversationControlsProps) {
  return (
    <div className="flex justify-between items-center mb-4">
      <div className="flex items-center gap-3">
        {activeSession.conversation_state === 'idle' ? (
          <button
            onClick={onStartConversation}
            className="px-4 py-2 rounded-lg flex items-center gap-2 transition-all bg-blue-500 text-white hover:bg-blue-600"
          >
            <Play className="w-4 h-4" />
            Start Conversation
          </button>
        ) : activeSession.conversation_state === 'recording' ? (
          <button
            onClick={onStopConversation}
            className="px-4 py-2 rounded-lg flex items-center gap-2 transition-all bg-red-500 text-white hover:bg-red-600"
          >
            <Pause className="w-4 h-4" />
            Stop Conversation
          </button>
        ) : null}

        <button
          onClick={onToggleListening}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
            isListening
              ? 'bg-green-500 text-white hover:bg-green-600'
              : 'bg-red-500 text-white hover:bg-red-600'
          }`}
        >
          {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
          {isListening ? 'Listening' : 'Muted'}
        </button>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg">
          <Volume2 className="w-4 h-4" />
          <span className="text-sm">{wpm} WPM</span>
        </div>
      </div>

      <button
        onClick={onShowUploadModal}
        className="px-3 py-1.5 rounded-lg bg-purple-500 text-white hover:bg-purple-600 flex items-center gap-2"
      >
        <Upload className="w-4 h-4" />
        Upload Doc
      </button>
    </div>
  );
}
