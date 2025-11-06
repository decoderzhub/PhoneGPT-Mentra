import { useRef, useEffect } from 'react';
import { MessageCircle, Zap } from 'lucide-react';

interface Conversation {
  id: number;
  sessionId: number;
  query: string;
  response: string;
  timestamp: string;
}

interface ConversationListProps {
  conversations: Conversation[];
  onConversationClick: (conv: Conversation) => void;
}

export default function ConversationList({
  conversations,
  onConversationClick
}: ConversationListProps) {
  const conversationEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversations]);

  if (conversations.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>No conversations yet</p>
        <p className="text-sm">Start speaking to see conversations here</p>
      </div>
    );
  }

  return (
    <div className="h-96 overflow-y-auto space-y-3">
      {conversations.map((conv) => (
        <div
          key={conv.id}
          onClick={() => onConversationClick(conv)}
          className="p-3 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 cursor-pointer hover:shadow-md transition-all"
        >
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-start gap-2 flex-1">
              <MessageCircle className="w-4 h-4 text-blue-500 mt-1 flex-shrink-0" />
              <span className="text-sm font-medium">Q: {conv.query.substring(0, 50)}...</span>
            </div>
            <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
              {new Date(conv.timestamp).toLocaleTimeString()}
            </span>
          </div>
          <div className="flex items-start gap-2">
            <Zap className="w-4 h-4 text-purple-500 mt-1 flex-shrink-0" />
            <span className="text-sm text-gray-600 dark:text-gray-300">
              A: {conv.response.substring(0, 100)}...
            </span>
          </div>
        </div>
      ))}
      <div ref={conversationEndRef} />
    </div>
  );
}
