import { FileText, Trash2 } from 'lucide-react';

interface Document {
  id: number;
  fileName: string;
  created_at: string;
  persona: string;
}

interface MobileDocumentsListProps {
  darkMode: boolean;
  documents: Document[];
  activePersona: string;
  onDeleteDocument: (docId: number) => void;
}

export default function MobileDocumentsList({
  darkMode,
  documents,
  activePersona,
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
              className={`p-3 rounded-lg flex items-center gap-2 ${
                darkMode ? 'bg-gray-700' : 'bg-gray-50'
              }`}
            >
              <FileText className="w-4 h-4 text-green-500 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{doc.fileName}</div>
                <div className="text-xs text-gray-500">
                  {new Date(doc.created_at).toLocaleDateString()}
                </div>
              </div>
              <button
                onClick={() => {
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
