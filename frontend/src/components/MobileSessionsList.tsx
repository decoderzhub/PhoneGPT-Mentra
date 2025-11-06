import { Plus, Trash2 } from 'lucide-react';

interface GlassSession {
  id: number;
  sessionName: string;
  created_at: string;
  persona: string;
  conversation_state?: string;
  is_active: boolean;
}

interface MobileSessionsListProps {
  darkMode: boolean;
  glassSessions: GlassSession[];
  activeSessionId: number | null;
  onCreateSession: () => void;
  onSwitchSession: (sessionId: number) => void;
  onDeleteSession: (sessionId: number) => void;
  onClose: () => void;
}

export default function MobileSessionsList({
  darkMode,
  glassSessions,
  activeSessionId,
  onCreateSession,
  onSwitchSession,
  onDeleteSession,
  onClose
}: MobileSessionsListProps) {
  return (
    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg overflow-hidden`}>
      <div className="p-4">
        <button
          onClick={onCreateSession}
          className="w-full mb-3 p-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600"
        >
          <Plus className="w-4 h-4 inline mr-2" />
          New Session
        </button>

        <div className="space-y-2 max-h-60 overflow-y-auto">
          {glassSessions.map(session => (
            <div
              key={session.id}
              onClick={() => {
                onSwitchSession(session.id);
                onClose();
              }}
              className={`p-3 rounded-lg cursor-pointer transition-all ${
                activeSessionId === session.id
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                  : darkMode ? 'bg-gray-700' : 'bg-gray-50'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="font-medium text-sm">{session.sessionName}</div>
                  <div className="text-xs opacity-70">
                    {new Date(session.created_at).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      session.persona === 'work' ? 'bg-blue-500/20 text-blue-400' :
                      session.persona === 'home' ? 'bg-green-500/20 text-green-400' :
                      'bg-purple-500/20 text-purple-400'
                    }`}>
                      {session.persona}
                    </span>
                    {session.conversation_state === 'recording' && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 flex items-center gap-1">
                        <div className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse" />
                        Recording
                      </span>
                    )}
                    {session.is_active && (
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    )}
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteSession(session.id);
                  }}
                  className="p-1 hover:bg-red-500 hover:text-white rounded"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
