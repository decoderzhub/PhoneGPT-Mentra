import { X, FileText } from 'lucide-react';

interface Document {
  id: number;
  fileName: string;
  content: string;
  created_at: string;
  type?: string;
}

interface DocumentModalProps {
  document: Document;
  darkMode: boolean;
  onClose: () => void;
}

export default function DocumentModal({
  document,
  darkMode,
  onClose
}: DocumentModalProps) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className={`max-w-3xl w-full max-h-[90vh] rounded-2xl overflow-hidden ${
        darkMode ? 'bg-gray-900' : 'bg-white'
      }`}>
        {/* Header */}
        <div className={`p-4 border-b flex items-center justify-between ${
          darkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-purple-500" />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{document.fileName}</h3>
                {document.type === 'transcription' && (
                  <span className="px-2 py-0.5 text-xs font-semibold rounded bg-blue-500 text-white">
                    NOTE
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500">
                {new Date(document.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className={`prose max-w-none ${darkMode ? 'prose-invert' : ''}`}>
            <pre className="whitespace-pre-wrap text-sm leading-relaxed">
              {document.content}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
