import { Plus, Trash2 } from 'lucide-react';

interface GlassSession {
  id: number;
  sessionName: string;
  created_at: string;
  persona: string;
  is_active: boolean;
}

interface Stats {
  totalConversations: number;
  averageResponseTime: number;
  activeGlassConnections: number;
}

interface DesktopSessionsSidebarProps {
  darkMode: boolean;
  glassSessions: GlassSession[];
  activeSessionId: number | null;
  stats: Stats;
  onCreateSession: () => void;
  onSwitchSession: (sessionId: number) => void;
  onDeleteSession: (sessionId: number) => void;
  onTranscribeClick: () => void;
}

export default function DesktopSessionsSidebar({
  darkMode,
  glassSessions,
  activeSessionId,
  stats,
  onCreateSession,
  onSwitchSession,
  onDeleteSession,
  onTranscribeClick
}: DesktopSessionsSidebarProps) {
  return (
    <div className="col-span-3">
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-4`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-lg">Glass Sessions</h2>
          <button
            onClick={onCreateSession}
            className="p-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {glassSessions.map(session => (
            <div
              key={session.id}
              onClick={() => onSwitchSession(session.id)}
              className={`p-3 rounded-lg cursor-pointer transition-all ${
                activeSessionId === session.id
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                  : darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
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
                    {session.is_active && (
                      <>
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        <span className="text-xs">Active</span>
                      </>
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

      <button
        onClick={onTranscribeClick}
        className="w-full mt-4 p-4 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
      >
        <span className="font-medium">Transcribe</span>
      </button>

      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-4 mt-4`}>
        <h3 className="font-semibold mb-3">Statistics</h3>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Conversations</span>
            <span className="font-medium">{stats.totalConversations}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Avg Response Time</span>
            <span className="font-medium">{stats.averageResponseTime.toFixed(1)}ms</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Active Glasses</span>
            <span className="font-medium">{stats.activeGlassConnections}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
