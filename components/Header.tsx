import React from 'react';
import GlobeIcon from './icons/GlobeIcon';

const Header: React.FC = () => {
  return (
    <header className="bg-surface shadow-sm p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-3">
          <GlobeIcon className="w-8 h-8 text-primary" />
          <h1 className="text-xl md:text-2xl font-bold text-primary-text">
            AdGen
          </h1>
        </div>
      </div>
    </header>
  );
};

export default Header;