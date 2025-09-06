import { GoogleGenAI, Modality } from "@google/genai";
import { LocalizedImageResult, AdImage } from '../types';
import { AVAILABLE_LOCALES, GOOGLE_AD_SIZES } from '../constants';

// According to Gemini API guidelines, initialize with an object containing the apiKey.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper function to convert a File object to a base64 encoded string for the Gemini API.
const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        // The result includes a data URI prefix (e.g., "data:image/jpeg;base64,"), which we remove.
        resolve(reader.result.split(',')[1]);
      } else {
        reject(new Error("Failed to read file as data URL."));
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
  
  const data = await base64EncodedDataPromise;
  
  return {
    inlineData: {
      data,
      mimeType: file.type,
    },
  };
};

export const localizeImage = async (
  imageFile: File,
  locales: string[],
  adText: string,
  adSizes: string[]
): Promise<LocalizedImageResult[]> => {
  const originalImagePart = await fileToGenerativePart(imageFile);
  const localeMap = new Map(AVAILABLE_LOCALES.map(l => [l.id, l]));
  const adSizeMap = new Map(GOOGLE_AD_SIZES.map(s => [s.id, s]));

  const results: LocalizedImageResult[] = [];

  // Sort ad sizes by total pixels (descending) to generate the highest-resolution one first.
  // This will become the "master" localized image for the current locale.
  const sortedAdSizes = [...adSizes].sort((a, b) => {
    const [widthA, heightA] = a.split('x').map(Number);
    const [widthB, heightB] = b.split('x').map(Number);
    return (widthB * heightB) - (widthA * heightA);
  });

  // Process each selected locale.
  for (const localeId of locales) {
    const locale = localeMap.get(localeId);
    if (!locale) continue;

    const adImages: AdImage[] = [];
    let masterLocalizedImagePart: any = null; // This will store the generated master image for the locale.

    // For each locale, generate an ad for each selected size.
    for (const sizeId of sortedAdSizes) {
      const adSize = adSizeMap.get(sizeId);
      if (!adSize) continue;

      const [width, height] = sizeId.split('x').map(Number);
      
      let prompt: string;
      let inputImagePart: any;

      if (!masterLocalizedImagePart) {
        // This is the first and largest image. Generate it from the original user-uploaded image.
        // This generated image will become the "master" for this locale.
        inputImagePart = originalImagePart;
        prompt = `
**CRITICAL TASK: Generate a Master Localized Advertisement Image**

You MUST follow these steps in order.

**Step 1: Set Final Image Dimensions (MANDATORY)**
- The final output image MUST be exactly ${width} pixels wide by ${height} pixels high. This is a non-negotiable directive.

**Step 2: Transform the Scene**
- Change the background of the provided image to a new, authentic scene from ${locale.country}. This new scene will be the master background for all other assets.

**Step 3: Create the CTA Banner**
- Add a solid rectangular banner with the exact hex color #805ad5 at the absolute bottom of the image, spanning the full width.
- The banner's height MUST be exactly 2/5ths of the image height (${Math.round(height * 2 / 5)}px).

**Step 4: Add the CTA Text**
- Translate the following text to ${locale.language}: "${adText}".
- Place the translated text (bold, white, centered) inside the banner.

**Final Check:** The output must be a single image of size ${width}x${height}.
`;
      } else {
        // This is a subsequent, smaller image. Generate it from the "master" localized image.
        inputImagePart = masterLocalizedImagePart;
        prompt = `
**CRITICAL TASK: Adapt an Existing Localized Image**

You MUST follow these steps in order.

**Step 1: Set Final Image Dimensions (MANDATORY)**
- The final output image MUST be exactly ${width} pixels wide by ${height} pixels high.
- You must resize or crop the provided image to these new dimensions.

**Step 2: Preserve the Scene (MANDATORY)**
- **DO NOT CHANGE THE SCENE or background.** The existing scenery is correct. Your only task is to resize and ensure the banner is correct.

**Step 3: Re-apply the CTA Banner**
- Ensure a solid rectangular banner with the exact hex color #805ad5 is at the absolute bottom of the image.
- The banner's height MUST be exactly 2/5ths of the new image height (${Math.round(height * 2 / 5)}px).
- The banner's width MUST match the new image width (${width}px).

**Step 4: Re-apply the CTA Text**
- The banner must contain the text "${adText}" translated to ${locale.language}.
- The text MUST be bold, white, and centered within the banner.

**Final Check:** The output must be a single image of size ${width}x${height} with the original scene preserved.
`;
      }

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: {
          parts: [
            inputImagePart,
            { text: prompt },
          ],
        },
        config: {
          responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
      });

      let imageData: string | null = null;
      let imageMimeType: string = 'image/png';
      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            imageData = part.inlineData.data;
            imageMimeType = part.inlineData.mimeType;
            break;
          }
        }
      }

      if (imageData) {
        adImages.push({
          size: sizeId,
          name: adSize.name,
          imageUrl: `data:${imageMimeType};base64,${imageData}`,
        });

        if (!masterLocalizedImagePart) {
          // The first successful generation becomes the master for this locale.
          masterLocalizedImagePart = {
            inlineData: {
              data: imageData,
              mimeType: imageMimeType,
            },
          };
        }
      }
    }

    // Re-sort the generated images to match the user's original selection order.
    const sortedAdImagesToOriginalOrder = adImages.sort((a, b) => {
        const indexA = adSizes.indexOf(a.size);
        const indexB = adSizes.indexOf(b.size);
        return indexA - indexB;
    });

    if (adImages.length > 0) {
      results.push({
        id: localeId,
        localeName: locale.name,
        adImages: sortedAdImagesToOriginalOrder,
      });
    }
  }

  return results;
};