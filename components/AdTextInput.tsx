import React from 'react';

interface AdTextInputProps {
  value: string;
  onChange: (value: string) => void;
}

const AdTextInput: React.FC<AdTextInputProps> = ({ value, onChange }) => {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="e.g., Shop Now"
      className="w-full px-3 py-2 bg-muted/50 border border-muted rounded-md text-primary-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
    />
  );
};

export default AdTextInput;