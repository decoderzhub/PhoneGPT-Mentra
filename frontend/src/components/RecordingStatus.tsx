import React from 'react';
import { GlassSession } from '../types';

interface RecordingStatusProps {
  session: GlassSession;
}

export default function RecordingStatus({ session }: RecordingStatusProps) {
  if (session.conversation_state !== 'recording' || !session.conversation_name) {
    return null;
  }

  return (
    <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg border-l-4 border-blue-500">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
        <span className="font-semibold text-sm">Recording:</span>
        <span className="text-sm">{session.conversation_name}</span>
      </div>
    </div>
  );
}
