import React from 'react';
import PaletteIcon from './icons/PaletteIcon';

interface Theme {
  id: string;
  name: string;
}

const themes: Theme[] = [
  { id: 'twilight-indigo', name: 'Twilight Indigo' },
  { id: 'sunrise-coral', name: 'Sunrise Coral' },
  { id: 'oceanic-teal', name: 'Oceanic Teal' },
];

interface ThemeSwitcherProps {
  theme: string;
  setTheme: (theme: string) => void;
}

const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ theme, setTheme }) => {
  return (
    <div className="relative group">
      <button className="p-2 rounded-full hover:bg-muted/50 transition-colors" aria-label="Change theme">
        <PaletteIcon className="w-6 h-6 text-primary-text" />
      </button>
      <div className="absolute right-0 mt-2 w-48 bg-surface rounded-md shadow-lg p-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 invisible group-hover:visible focus-within:visible transition-opacity z-10">
        <ul className="space-y-1">
          {themes.map((t) => (
            <li key={t.id}>
              <button
                onClick={() => setTheme(t.id)}
                className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                  theme === t.id ? 'bg-primary text-primary-content' : 'hover:bg-muted text-primary-text'
                }`}
              >
                {t.name}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ThemeSwitcher;
