import { Glasses, Plus } from 'lucide-react';

interface EmptySessionStateProps {
  onCreateSession: () => void;
}

export default function EmptySessionState({ onCreateSession }: EmptySessionStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-gray-400">
      <Glasses className="w-16 h-16 mb-4" />
      <p>Select or create a glass session to begin</p>
      <button
        onClick={onCreateSession}
        className="mt-4 px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 flex items-center gap-2"
      >
        <Plus className="w-4 h-4" />
        Create Session
      </button>
    </div>
  );
}
