import { FileText, Trash2 } from 'lucide-react';

interface Document {
  id: number;
  fileName: string;
  created_at: string;
  persona: string;
  type?: string;
}

interface MobileDocumentsListProps {
  darkMode: boolean;
  documents: Document[];
  activePersona: string;
  onDocumentClick: (docId: number) => void;
  onDeleteDocument: (docId: number) => void;
}

export default function MobileDocumentsList({
  darkMode,
  documents,
  activePersona,
  onDocumentClick,
  onDeleteDocument
}: MobileDocumentsListProps) {
  const filteredDocs = documents.filter(doc => doc.persona === activePersona);

  return (
    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg overflow-hidden`}>
      <div className="p-4">
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {filteredDocs.map(doc => (
            <div
              key={doc.id}
              onClick={() => onDocumentClick(doc.id)}
              className={`p-3 rounded-lg flex items-center gap-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors ${
                darkMode ? 'bg-gray-700' : 'bg-gray-50'
              }`}
            >
              <FileText className="w-4 h-4 text-purple-500 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <div className="text-sm font-medium truncate">{doc.fileName}</div>
                  {doc.type === 'transcription' && (
                    <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded bg-blue-500 text-white">
                      NOTE
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(doc.created_at).toLocaleDateString()}
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm(`Delete ${doc.fileName}?`)) {
                    onDeleteDocument(doc.id);
                  }
                }}
                className="p-1.5 rounded hover:bg-red-500 hover:text-white transition-colors"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}

          {filteredDocs.length === 0 && (
            <p className="text-center text-gray-400 py-4">
              No documents for {activePersona}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
