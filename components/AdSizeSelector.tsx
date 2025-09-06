import React from 'react';
import { GOOGLE_AD_SIZES } from '../constants';

interface AdSizeSelectorProps {
  selectedAdSizes: string[];
  onSelectionChange: (sizes: string[]) => void;
  disabled?: boolean;
}

const AdSizeSelector: React.FC<AdSizeSelectorProps> = ({ selectedAdSizes, onSelectionChange, disabled = false }) => {
  const handleCheckboxChange = (sizeId: string) => {
    if (disabled) return;
    const newSelection = selectedAdSizes.includes(sizeId)
      ? selectedAdSizes.filter((id) => id !== sizeId)
      : [...selectedAdSizes, sizeId];
    onSelectionChange(newSelection);
  };

  return (
    <div className={`flex flex-col gap-3 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
      {GOOGLE_AD_SIZES.map((size) => (
        <label
          key={size.id}
          className={`flex items-center p-3 rounded-lg transition-all duration-200 ${
            selectedAdSizes.includes(size.id)
              ? 'bg-primary/20 border-primary text-primary-text'
              : 'bg-muted/50 border-muted text-secondary-text'
          } ${disabled ? 'cursor-not-allowed' : 'hover:bg-muted cursor-pointer'} border`}
        >
          <input
            type="checkbox"
            checked={selectedAdSizes.includes(size.id)}
            onChange={() => handleCheckboxChange(size.id)}
            disabled={disabled}
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-accent disabled:bg-muted"
          />
          <span className="ml-3 text-sm font-medium">{size.name}</span>
        </label>
      ))}
    </div>
  );
};

export default AdSizeSelector;