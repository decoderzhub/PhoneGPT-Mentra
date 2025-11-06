import { Activity } from 'lucide-react';

interface StatsDisplayProps {
  totalConversations: number;
  averageResponseTime: number;
  activeGlassConnections: number;
  darkMode: boolean;
}

export default function StatsDisplay({
  totalConversations,
  averageResponseTime,
  activeGlassConnections,
  darkMode
}: StatsDisplayProps) {
  return (
    <div className={`mt-4 p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
      <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
        <Activity className="w-4 h-4 text-purple-500" />
        Dashboard
      </h3>
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="text-center">
          <p className="font-bold text-lg text-purple-500">{totalConversations}</p>
          <span className="text-gray-500">Conversations</span>
        </div>
        <div className="text-center">
          <p className="font-bold text-lg text-blue-500">{averageResponseTime.toFixed(1)}</p>
          <span className="text-gray-500">Avg ms</span>
        </div>
        <div className="text-center">
          <p className="font-bold text-lg text-green-500">{activeGlassConnections}</p>
          <span className="text-gray-500">Active</span>
        </div>
      </div>
    </div>
  );
}
