
import React from 'react';
import { AVAILABLE_LOCALES } from '../constants';

interface LanguageSelectorProps {
  selectedLocales: string[];
  onSelectionChange: (locales: string[]) => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ selectedLocales, onSelectionChange }) => {
  const handleCheckboxChange = (localeId: string) => {
    const newSelection = selectedLocales.includes(localeId)
      ? selectedLocales.filter((id) => id !== localeId)
      : [...selectedLocales, localeId];
    onSelectionChange(newSelection);
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      {AVAILABLE_LOCALES.map((locale) => (
        <label
          key={locale.id}
          className={`flex items-center p-3 rounded-lg cursor-pointer transition-all duration-200 ${
            selectedLocales.includes(locale.id)
              ? 'bg-primary/20 border-primary text-primary-text'
              : 'bg-muted/50 border-muted text-secondary-text hover:bg-muted'
          } border`}
        >
          <input
            type="checkbox"
            checked={selectedLocales.includes(locale.id)}
            onChange={() => handleCheckboxChange(locale.id)}
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-accent"
          />
          <span className="ml-3 text-sm font-medium">{locale.name}</span>
        </label>
      ))}
    </div>
  );
};

export default LanguageSelector;