import { Locale } from './types';

export const AVAILABLE_LOCALES: Locale[] = [
  { id: 'es-ES', name: 'Spanish (Spain)', country: 'Spain', language: 'Spanish' },
  { id: 'fr-FR', name: 'French (France)', country: 'France', language: 'French' },
  { id: 'ja-JP', name: 'Japanese (Japan)', country: 'Japan', language: 'Japanese' },
];

export const GOOGLE_AD_SIZES = [
  { id: '1200x1200', name: 'Google Ads (1200x1200)' },
  { id: '1024x1024', name: 'Default Square (1024x1024)' },
  { id: '1080x1350', name: 'Instagram Portrait (1080x1350)' },
];

export const CTA_OPTIONS = [
  'Buy Now',
  'Download Now',
  'Learn More',
];
