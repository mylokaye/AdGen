
import React, { useCallback, useState } from 'react';
import UploadIcon from './icons/UploadIcon';

interface ImageUploaderProps {
  onImageUpload: (file: File) => void;
  previewUrl: string | null;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, previewUrl }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImageUpload(e.target.files[0]);
    }
  };
  
  const handleDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onImageUpload(e.dataTransfer.files[0]);
    }
  }, [onImageUpload]);

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  return (
    <div>
      <label
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        className={`flex justify-center w-full h-48 px-4 transition bg-muted/50 border-2 ${isDragging ? 'border-primary' : 'border-muted'} border-dashed rounded-md appearance-none cursor-pointer hover:border-accent focus:outline-none`}
      >
        {previewUrl ? (
          <img src={previewUrl} alt="Preview" className="h-full w-full object-contain rounded-md" />
        ) : (
          <span className="flex flex-col items-center justify-center space-y-2 text-secondary-text">
            <UploadIcon className="w-10 h-10" />
            <span className="font-medium">
              Drop an image, or{' '}
              <span className="text-primary underline">browse</span>
            </span>
             <span className="text-xs">PNG, JPG, WEBP supported</span>
          </span>
        )}
        <input type="file" name="file_upload" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handleFileChange} />
      </label>
    </div>
  );
};

export default ImageUploader;