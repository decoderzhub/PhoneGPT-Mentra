import { Plus, FileText, Trash2 } from 'lucide-react';

interface Document {
  id: number;
  fileName: string;
  created_at: string;
  persona: string;
}

interface DesktopDocumentsSidebarProps {
  darkMode: boolean;
  documents: Document[];
  activePersona: string;
  onUploadClick: () => void;
  onDeleteDocument: (docId: number, fileName: string) => void;
}

export default function DesktopDocumentsSidebar({
  darkMode,
  documents,
  activePersona,
  onUploadClick,
  onDeleteDocument
}: DesktopDocumentsSidebarProps) {
  const filteredDocs = documents.filter(doc => doc.persona === activePersona);

  return (
    <div className="col-span-3">
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-4`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-lg">Documents</h2>
          <button
            onClick={onUploadClick}
            className="p-2 rounded-lg bg-purple-500 text-white hover:bg-purple-600"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2">
          {filteredDocs.map(doc => (
            <div
              key={doc.id}
              className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center gap-2"
            >
              <FileText className="w-4 h-4 text-purple-500 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{doc.fileName}</div>
                <div className="text-xs text-gray-500">
                  {new Date(doc.created_at).toLocaleDateString()}
                </div>
              </div>
              <button
                onClick={() => {
                  if (confirm(`Delete ${doc.fileName}?`)) {
                    onDeleteDocument(doc.id, doc.fileName);
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
