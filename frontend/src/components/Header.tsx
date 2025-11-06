import { Moon, Sun, LogOut, Menu, ScrollText } from 'lucide-react';

interface Persona {
  id: string;
  name: string;
  icon: React.ReactNode;
}

interface HeaderProps {
  darkMode: boolean;
  activePersona: string;
  personas: Persona[];
  mobileMenuOpen: boolean;
  onToggleDarkMode: () => void;
  onPersonaChange: (personaId: string) => void;
  onNotesClick: () => void;
  onLogout: () => void;
  onMobileMenuToggle: () => void;
}

export default function Header({
  darkMode,
  activePersona,
  personas,
  mobileMenuOpen,
  onToggleDarkMode,
  onPersonaChange,
  onNotesClick,
  onLogout,
  onMobileMenuToggle
}: HeaderProps) {
  return (
    <>
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b shadow-sm p-4`}>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              PhoneGPT Control
            </h1>
          </div>

          <div className="hidden md:flex items-center gap-3">
            {personas.map(persona => (
              <button
                key={persona.id}
                onClick={() => onPersonaChange(persona.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  activePersona === persona.id
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                    : darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {persona.icon}
                <span className="font-medium">{persona.name}</span>
              </button>
            ))}

            <button
              onClick={onNotesClick}
              className="p-2 rounded-lg bg-purple-500 text-white hover:bg-purple-600"
            >
              <ScrollText className="w-5 h-5" />
            </button>

            <button
              onClick={onToggleDarkMode}
              className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <button
              onClick={onLogout}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>

          <button
            onClick={onMobileMenuToggle}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        <div className="md:hidden mt-3 flex gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          {personas.map(persona => (
            <button
              key={persona.id}
              onClick={() => onPersonaChange(persona.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg transition-all ${
                activePersona === persona.id
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md'
                  : 'hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {persona.icon}
              <span className="text-sm font-medium">{persona.name}</span>
            </button>
          ))}
        </div>
      </div>

      {mobileMenuOpen && (
        <div className={`md:hidden border-t ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="p-4 space-y-2">
            <button
              onClick={onNotesClick}
              className="w-full flex items-center gap-2 p-3 rounded-lg bg-purple-500 text-white hover:bg-purple-600"
            >
              <ScrollText className="w-5 h-5" />
              <span>Notes</span>
            </button>

            <button
              onClick={onToggleDarkMode}
              className={`w-full flex items-center gap-2 p-3 rounded-lg ${
                darkMode ? 'bg-gray-700' : 'bg-gray-100'
              }`}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
            </button>

            <button
              onClick={onLogout}
              className="w-full flex items-center gap-2 p-3 rounded-lg bg-red-500 text-white hover:bg-red-600"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
