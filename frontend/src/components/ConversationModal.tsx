import { X } from 'lucide-react';

interface Conversation {
  id: number;
  query: string;
  response: string;
  timestamp: string;
}

interface ConversationModalProps {
  conversation: Conversation;
  darkMode: boolean;
  onClose: () => void;
}

export default function ConversationModal({
  conversation,
  darkMode,
  onClose
}: ConversationModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto`}>
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-semibold">Conversation Details</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-blue-500 mb-2">Question:</h4>
            <p className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">{conversation.query}</p>
          </div>

          <div>
            <h4 className="font-medium text-purple-500 mb-2">Response:</h4>
            <p className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg whitespace-pre-wrap">
              {conversation.response}
            </p>
          </div>

          <div className="text-sm text-gray-500">
            {new Date(conversation.timestamp).toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
}
