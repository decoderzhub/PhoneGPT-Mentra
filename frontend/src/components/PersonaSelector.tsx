import React from 'react';
import { Briefcase, Home, Gamepad2 } from 'lucide-react';
import { Persona } from '../types';

interface PersonaSelectorProps {
  activePersona: Persona;
  onSelectPersona: (persona: Persona) => void;
}

export default function PersonaSelector({
  activePersona,
  onSelectPersona,
}: PersonaSelectorProps) {
  const personas: { value: Persona; icon: React.ReactNode; label: string }[] = [
    { value: 'work', icon: <Briefcase className="w-5 h-5" />, label: 'Work' },
    { value: 'home', icon: <Home className="w-5 h-5" />, label: 'Home' },
    { value: 'personal', icon: <Gamepad2 className="w-5 h-5" />, label: 'Personal' },
  ];

  return (
    <div className="flex gap-2">
      {personas.map(({ value, icon, label }) => (
        <button
          key={value}
          onClick={() => onSelectPersona(value)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
            activePersona === value
              ? 'bg-blue-500 text-white shadow-lg'
              : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          {icon}
          <span className="font-medium">{label}</span>
        </button>
      ))}
    </div>
  );
}
