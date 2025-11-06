import React from 'react';
import { FileText, Trash2 } from 'lucide-react';
import { Document } from '../types';

interface DocumentsPanelProps {
  documents: Document[];
  darkMode: boolean;
  onDeleteDocument: (docId: number) => void;
}

export default function DocumentsPanel({
  documents,
  darkMode,
  onDeleteDocument,
}: DocumentsPanelProps) {
  return (
    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg overflow-hidden`}>
      <div className="p-4">
        <h3 className="font-semibold mb-3">Documents</h3>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {documents.length === 0 ? (
            <p className="text-sm text-gray-500">No documents uploaded</p>
          ) : (
            documents.map(doc => (
              <div
                key={doc.id}
                className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      <div className="font-medium text-sm">{doc.fileName}</div>
                    </div>
                    <div className="text-xs opacity-70 mt-1">
                      {new Date(doc.created_at).toLocaleDateString()}
                    </div>
                    {doc.type && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 mt-1 inline-block">
                        {doc.type}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => onDeleteDocument(doc.id)}
                    className="p-1 hover:bg-red-500 hover:text-white rounded"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
