import { X } from 'lucide-react';

interface SettingsModalProps {
  darkMode: boolean;
  wpm: number;
  pageDisplayDuration: number;
  autoAdvancePages: boolean;
  onClose: () => void;
  onWpmChange: (wpm: number) => void;
  onPageDurationChange: (duration: number) => void;
  onAutoAdvanceChange: (enabled: boolean) => void;
}

export default function SettingsModal({
  darkMode,
  wpm,
  pageDisplayDuration,
  autoAdvancePages,
  onClose,
  onWpmChange,
  onPageDurationChange,
  onAutoAdvanceChange
}: SettingsModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 max-w-md w-full`}>
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-semibold">Settings</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Words Per Minute (WPM)</label>
            <input
              type="range"
              min="60"
              max="300"
              value={wpm}
              onChange={(e) => onWpmChange(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-500">
              <span>60</span>
              <span className="font-medium">{wpm} WPM</span>
              <span>300</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Page Display Duration (Glasses)</label>
            <select
              value={pageDisplayDuration}
              onChange={(e) => onPageDurationChange(parseInt(e.target.value))}
              className="w-full p-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="3000">3 seconds per page</option>
              <option value="5000">5 seconds per page</option>
              <option value="7000">7 seconds per page</option>
              <option value="10000">10 seconds per page</option>
              <option value="15000">15 seconds per page</option>
            </select>
          </div>

          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={autoAdvancePages}
                onChange={(e) => onAutoAdvanceChange(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm font-medium">Auto-advance pages</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
