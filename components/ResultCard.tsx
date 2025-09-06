import React from 'react';
import type { LocalizedImageResult } from '../types';
import DownloadIcon from './icons/DownloadIcon';

interface ResultCardProps {
  result: LocalizedImageResult;
}

const handleDownload = (imageUrl: string, filename: string) => {
  const link = document.createElement('a');
  link.href = imageUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Sub-component for displaying an image with a title and an overlay download button.
const ImageDisplay: React.FC<{ imageUrl: string; title: string; downloadFilename: string }> = ({ imageUrl, title, downloadFilename }) => {
  return (
    <div>
      <h4 className="font-semibold text-secondary-text mb-2 text-sm truncate">{title}</h4>
      <div className="relative group bg-muted/50 rounded-lg overflow-hidden border border-muted">
        <img 
          src={imageUrl} 
          alt={title} 
          className="w-full h-auto aspect-square object-contain transition-transform group-hover:scale-105" 
        />
        <button
          onClick={() => handleDownload(imageUrl, downloadFilename)}
          className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
          aria-label={`Download ${title}`}
        >
          <DownloadIcon className="w-8 h-8" />
        </button>
      </div>
    </div>
  );
};

const ResultCard: React.FC<ResultCardProps> = ({ result }) => {
  // Do not render the card if there are no ad images to show.
  if (!result.adImages || result.adImages.length === 0) {
    return null;
  }
  
  return (
    <div className="bg-surface rounded-lg overflow-hidden shadow-lg p-6 animate-fade-in">
      <h3 className="text-2xl font-bold text-primary-text mb-6 pb-4 border-b border-muted">
        {result.localeName}
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {result.adImages.map(ad => (
          <ImageDisplay
            key={ad.size}
            imageUrl={ad.imageUrl}
            title={ad.name}
            downloadFilename={`ad-${result.id}-${ad.size}.png`}
          />
        ))}
      </div>
    </div>
  );
};

export default ResultCard;
