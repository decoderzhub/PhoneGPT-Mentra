import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { GlassConversation } from '../types';

interface ConversationHistoryProps {
  conversations: GlassConversation[];
  onNavigatePage: (conversationId: number, direction: 'prev' | 'next') => void;
}

export default function ConversationHistory({
  conversations,
  onNavigatePage,
}: ConversationHistoryProps) {
  return (
    <div className="relative">
      <div className="overflow-y-auto h-[calc(100%-120px)] space-y-3">
        {conversations.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No conversations yet. Start speaking to begin!
          </div>
        ) : (
          conversations.map((conv) => (
            <div key={conv.id} className="space-y-2">
              <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg p-3">
                <div className="font-medium text-sm mb-1">You asked:</div>
                <div className="text-sm">{conv.query}</div>
              </div>

              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
                <div className="font-medium text-sm mb-1">Response:</div>
                <div className="text-sm whitespace-pre-wrap">
                  {conv.responsePages && conv.responsePages.length > 0
                    ? conv.responsePages[conv.currentPage || 0]
                    : conv.response}
                </div>

                {conv.responsePages && conv.responsePages.length > 1 && (
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-300 dark:border-gray-600">
                    <button
                      onClick={() => onNavigatePage(conv.id, 'prev')}
                      disabled={(conv.currentPage || 0) === 0}
                      className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-xs text-gray-500">
                      Page {(conv.currentPage || 0) + 1} of {conv.responsePages.length}
                    </span>
                    <button
                      onClick={() => onNavigatePage(conv.id, 'next')}
                      disabled={(conv.currentPage || 0) >= conv.responsePages.length - 1}
                      className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
