
import React from 'react';

const Loader: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center text-center text-secondary-text py-10 animate-fade-in">
      <div className="w-12 h-12 border-4 border-muted border-t-accent rounded-full animate-spin mb-4"></div>
      <h3 className="text-lg font-semibold text-primary-text">Generating Images...</h3>
      <p className="text-sm">The AI is working its magic. This may take a moment.</p>
    </div>
  );
};

export default Loader;