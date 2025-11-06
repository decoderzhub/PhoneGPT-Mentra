import { X } from 'lucide-react';
import { useState } from 'react';

interface Persona {
  id: string;
  name: string;
}

interface UploadModalProps {
  darkMode: boolean;
  personas: Persona[];
  defaultPersona: string;
  onClose: () => void;
  onUpload: (file: File, persona: string) => Promise<void>;
}

export default function UploadModal({
  darkMode,
  personas,
  defaultPersona,
  onClose,
  onUpload
}: UploadModalProps) {
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [selectedPersona, setSelectedPersona] = useState(defaultPersona);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!uploadFile) return;

    setUploading(true);
    try {
      await onUpload(uploadFile, selectedPersona);
      onClose();
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 max-w-md w-full`}>
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-semibold">Upload Document</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Persona</label>
            <select
              value={selectedPersona}
              onChange={(e) => setSelectedPersona(e.target.value)}
              className="w-full p-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600"
            >
              {personas.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">File</label>
            <input
              type="file"
              onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
              className="w-full p-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600"
            />
          </div>

          <button
            onClick={handleUpload}
            disabled={!uploadFile || uploading}
            className="w-full py-2 rounded-lg bg-purple-500 text-white hover:bg-purple-600 disabled:opacity-50"
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      </div>
    </div>
  );
}
