export interface Locale {
  id: string;
  name: string;
  country: string;
  language: string;
}

export interface AdImage {
  size: string;
  name: string;
  imageUrl: string;
}

export interface LocalizedImageResult {
  id: string;
  localeName: string;
  adImages: AdImage[];
}
