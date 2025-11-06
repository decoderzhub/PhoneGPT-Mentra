import { Mic, Glasses, FileText, Upload, Settings, Volume2, MicOff, Brain } from 'lucide-react';

interface MobileMetroGridProps {
  darkMode: boolean;
  activePersona: string;
  activeSessionId: number | null;
  glassSessions: any[];
  documents: any[];
  wpm: number;
  isListening: boolean;
  onTranscribeClick: () => void;
  onSessionsToggle: () => void;
  onDocumentsToggle: () => void;
  onUploadClick: () => void;
  onSettingsClick: () => void;
  onToggleListening: () => void;
}

export default function MobileMetroGrid({
  darkMode,
  activePersona,
  glassSessions,
  documents,
  wpm,
  isListening,
  onTranscribeClick,
  onSessionsToggle,
  onDocumentsToggle,
  onUploadClick,
  onSettingsClick,
  onToggleListening
}: MobileMetroGridProps) {
  return (
    <div className="md:hidden space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={onTranscribeClick}
          className={`relative h-28 rounded-xl p-3 flex flex-col items-center justify-center transition-all active:scale-95 ${
            darkMode
              ? 'bg-gradient-to-br from-purple-600 to-pink-600'
              : 'bg-gradient-to-br from-purple-500 to-pink-500'
          } text-white shadow-lg`}
        >
          <Mic className="w-7 h-7 mb-1" />
          <span className="text-sm font-medium">Transcribe</span>
          <span className="text-xs opacity-80">Voice Notes</span>
        </button>

        <button
          onClick={onSessionsToggle}
          className={`relative h-28 rounded-xl p-3 flex flex-col items-center justify-center transition-all active:scale-95 ${
            darkMode
              ? 'bg-gradient-to-br from-blue-600 to-cyan-600'
              : 'bg-gradient-to-br from-blue-500 to-cyan-500'
          } text-white shadow-lg`}
        >
          <Glasses className="w-7 h-7 mb-1" />
          <span className="text-sm font-medium">Sessions</span>
          {glassSessions.length > 0 && (
            <span className="absolute top-2 right-2 bg-white text-blue-500 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {glassSessions.length}
            </span>
          )}
        </button>

        <button
          onClick={onDocumentsToggle}
          className={`relative h-28 rounded-xl p-3 flex flex-col items-center justify-center transition-all active:scale-95 ${
            darkMode
              ? 'bg-gradient-to-br from-green-600 to-emerald-600'
              : 'bg-gradient-to-br from-green-500 to-emerald-500'
          } text-white shadow-lg`}
        >
          <FileText className="w-7 h-7 mb-1" />
          <span className="text-sm font-medium">Documents</span>
          {documents.filter(d => d.persona === activePersona).length > 0 && (
            <span className="absolute top-2 right-2 bg-white text-green-500 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {documents.filter(d => d.persona === activePersona).length}
            </span>
          )}
        </button>

        <button
          onClick={onUploadClick}
          className={`relative h-28 rounded-xl p-3 flex flex-col items-center justify-center transition-all active:scale-95 ${
            darkMode
              ? 'bg-gradient-to-br from-orange-600 to-red-600'
              : 'bg-gradient-to-br from-orange-500 to-red-500'
          } text-white shadow-lg`}
        >
          <Upload className="w-7 h-7 mb-1" />
          <span className="text-sm font-medium">Upload</span>
          <span className="text-xs opacity-80">Add Files</span>
        </button>
      </div>

      <div className="grid grid-cols-4 gap-2">
        <button
          onClick={onSettingsClick}
          className={`h-20 rounded-lg p-2 flex flex-col items-center justify-center transition-all active:scale-95 ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          } shadow-md`}
        >
          <Settings className="w-5 h-5 mb-1 text-gray-500" />
          <span className="text-xs">Settings</span>
        </button>

        <button
          className={`h-20 rounded-lg p-2 flex flex-col items-center justify-center ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          } shadow-md`}
        >
          <Volume2 className="w-5 h-5 mb-1 text-blue-500" />
          <span className="text-xs font-medium">{wpm}</span>
          <span className="text-xs opacity-60">WPM</span>
        </button>

        <button
          onClick={onToggleListening}
          className={`h-20 rounded-lg p-2 flex flex-col items-center justify-center transition-all active:scale-95 ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          } shadow-md`}
        >
          {isListening ?
            <Mic className="w-5 h-5 mb-1 text-green-500 animate-pulse" /> :
            <MicOff className="w-5 h-5 mb-1 text-red-500" />
          }
          <span className="text-xs font-medium">{isListening ? 'On' : 'Off'}</span>
        </button>

        <button
          className={`h-20 rounded-lg p-2 flex flex-col items-center justify-center ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          } shadow-md opacity-50`}
          disabled
        >
          <Brain className="w-5 h-5 mb-1 text-purple-500" />
          <span className="text-xs">AI Chat</span>
        </button>
      </div>
    </div>
  );
}
