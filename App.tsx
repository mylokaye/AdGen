import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import ImageUploader from './components/ImageUploader';
import LanguageSelector from './components/LanguageSelector';
import AdSizeSelector from './components/AdSizeSelector';
import CtaSelector from './components/CtaSelector';
import ResultCard from './components/ResultCard';
import Loader from './components/Loader';
import { localizeImage } from './services/geminiService';
import type { LocalizedImageResult } from './types';

function App() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedLocales, setSelectedLocales] = useState<string[]>([]);
  const [selectedAdSizes, setSelectedAdSizes] = useState<string[]>([]);
  const [adText, setAdText] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<LocalizedImageResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Clean up the object URL to avoid memory leaks
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleImageUpload = useCallback((file: File) => {
    setImageFile(file);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(URL.createObjectURL(file));
  }, [previewUrl]);

  const isFormValid = imageFile && selectedLocales.length > 0 && selectedAdSizes.length > 0 && adText.trim() !== '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) {
      if (!imageFile) alert('Please upload an image.');
      else if (!adText.trim()) alert('Please select a CTA Button option.');
      else if (selectedLocales.length === 0) alert('Please select a Locale.');
      else if (selectedAdSizes.length === 0) alert('Please select at least one Asset size.');
      return;
    }

    setIsLoading(true);
    setResults([]);
    setError(null);

    try {
      const localizedResults = await localizeImage(
        imageFile,
        selectedLocales,
        adText,
        selectedAdSizes
      );
      setResults(localizedResults);
    } catch (err: any) {
      console.error('Error generating images:', err);
      setError(err.message || 'An unexpected error occurred. Please check the console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  const showResultsSection = isLoading || error || results.length > 0;

  return (
    <div className="bg-background min-h-screen text-primary-text font-sans">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        <form onSubmit={handleSubmit} className="bg-surface rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <section>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="bg-primary text-primary-content rounded-full w-6 h-6 text-sm flex items-center justify-center">1</span>
                <span>Upload Image</span>
              </h2>
              <ImageUploader onImageUpload={handleImageUpload} previewUrl={previewUrl} />
            </section>
            
            <section>
               <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="bg-primary text-primary-content rounded-full w-6 h-6 text-sm flex items-center justify-center">2</span>
                <span>CTA Button</span>
              </h2>
              <CtaSelector value={adText} onChange={setAdText} />
            </section>

            <section>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="bg-primary text-primary-content rounded-full w-6 h-6 text-sm flex items-center justify-center">3</span>
                <span>Locale</span>
              </h2>
              <LanguageSelector selectedLocales={selectedLocales} onSelectionChange={setSelectedLocales} />
            </section>
            
            <section>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="bg-primary text-primary-content rounded-full w-6 h-6 text-sm flex items-center justify-center">4</span>
                <span>Assets</span>
              </h2>
              <AdSizeSelector selectedAdSizes={selectedAdSizes} onSelectionChange={setSelectedAdSizes} disabled={!adText.trim()} />
            </section>
          </div>
          
          <div className="mt-8 border-t border-muted pt-6">
            <button
                type="submit"
                disabled={!isFormValid || isLoading}
                className="w-full max-w-md mx-auto flex justify-center bg-primary text-primary-content font-bold py-3 px-4 rounded-lg shadow-lg hover:bg-primary-focus focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-focus disabled:bg-muted disabled:text-secondary-text disabled:cursor-not-allowed transition-all"
            >
                {isLoading ? 'Generating...' : 'Generate Ads'}
            </button>
          </div>
        </form>

        {showResultsSection && (
          <div className="bg-surface rounded-lg shadow-md min-h-[20rem] p-6">
            <h2 className="text-2xl font-bold text-primary-text mb-6">Results</h2>
            
            {isLoading && <Loader />}
            
            {error && (
              <div className="text-center py-10 px-4 text-error bg-error/10 rounded-lg">
                <h3 className="font-bold text-lg mb-2">An Error Occurred</h3>
                <p className="text-sm">{error}</p>
              </div>
            )}
            
            {!isLoading && results.length > 0 && (
              <div className="space-y-8">
                {results.map((result) => (
                  <ResultCard key={result.id} result={result} />
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
