import { useRef, useEffect } from 'react';
import { MessageCircle, Zap, ChevronLeft, ChevronRight } from 'lucide-react';

interface GlassConversation {
  id: number;
  query: string;
  response: string;
  timestamp: string;
  responsePages?: string[];
  currentPage?: number;
}

interface ConversationViewProps {
  darkMode: boolean;
  conversations: GlassConversation[];
  onConversationClick: (conv: GlassConversation) => void;
  onPageChange?: (convId: number, direction: 'prev' | 'next') => void;
  autoScroll?: boolean;
}

export default function ConversationView({
  conversations,
  onConversationClick,
  onPageChange,
  autoScroll = true
}: ConversationViewProps) {
  const conversationEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll && conversationEndRef.current) {
      conversationEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversations, autoScroll]);

  return (
    <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-400px)]">
      {conversations.map((conv) => (
        <div
          key={conv.id}
          onClick={() => onConversationClick(conv)}
          className="p-4 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 cursor-pointer hover:shadow-md transition-all"
        >
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium">
                Q: {conv.query.substring(0, 50)}...
              </span>
            </div>
            <span className="text-xs text-gray-500">
              {new Date(conv.timestamp).toLocaleTimeString()}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-purple-500" />
            <span className="text-sm text-gray-600 dark:text-gray-300">
              A: {conv.response.substring(0, 100)}...
            </span>
          </div>

          {conv.responsePages && conv.responsePages.length > 1 && (
            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (onPageChange) onPageChange(conv.id, 'prev');
                }}
                disabled={conv.currentPage === 0}
                className="p-1 rounded hover:bg-gray-300 dark:hover:bg-gray-500 disabled:opacity-30"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs">
                Page {(conv.currentPage || 0) + 1} of {conv.responsePages.length}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (onPageChange) onPageChange(conv.id, 'next');
                }}
                disabled={conv.currentPage === conv.responsePages.length - 1}
                className="p-1 rounded hover:bg-gray-300 dark:hover:bg-gray-500 disabled:opacity-30"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      ))}
      <div ref={conversationEndRef} />
    </div>
  );
}
