import React from 'react';
import { CTA_OPTIONS } from '../constants';

interface CtaSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const CtaSelector: React.FC<CtaSelectorProps> = ({ value, onChange }) => {
  return (
    <div className="flex flex-col gap-3">
      {CTA_OPTIONS.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={`w-full text-left p-3 rounded-lg transition-all duration-200 border text-sm font-medium ${
            value === option
              ? 'bg-primary/20 border-primary text-primary-text'
              : 'bg-muted/50 border-muted text-secondary-text hover:bg-muted'
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  );
};

export default CtaSelector;
