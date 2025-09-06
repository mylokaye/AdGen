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

/**
 * A robust, client-side function to resize a base64 image to exact dimensions using the Canvas API.
 * This performs a "center crop" to ensure the canvas is filled without distorting the image.
 * @param base64Src The source image as a full data URI (e.g., "data:image/png;base64,...").
 * @param mimeType The desired output MIME type.
 * @param width The target width in pixels.
 * @param height The target height in pixels.
 * @returns A promise that resolves with the new, resized base64 data URI.
 */
const forceResizeImage = (base64Src: string, mimeType: string, width: number, height: number): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        return reject(new Error('Could not get canvas context'));
      }

      // Implement a "center crop" (object-fit: cover) logic
      const imgAspectRatio = img.width / img.height;
      const canvasAspectRatio = width / height;
      let renderableWidth, renderableHeight, xStart, yStart;

      if (imgAspectRatio < canvasAspectRatio) {
        // Image is taller than canvas, so fit width and crop height
        renderableWidth = width;
        renderableHeight = renderableWidth / imgAspectRatio;
        xStart = 0;
        yStart = (height - renderableHeight) / 2;
      } else if (imgAspectRatio > canvasAspectRatio) {
        // Image is wider than canvas, so fit height and crop width
        renderableHeight = height;
        renderableWidth = renderableHeight * imgAspectRatio;
        yStart = 0;
        xStart = (width - renderableWidth) / 2;
      } else {
        // Aspect ratios are the same
        renderableWidth = width;
        renderableHeight = height;
        xStart = 0;
        yStart = 0;
      }

      ctx.drawImage(img, xStart, yStart, renderableWidth, renderableHeight);
      
      resolve(canvas.toDataURL(mimeType));
    };
    img.onerror = (error) => reject(error);
    img.src = base64Src;
  });
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
  
  if (adSizes.length === 0) return [];

  // Sort ad sizes to determine the largest one to use as the high-quality source.
  const sortedAdSizes = [...adSizes].sort((a, b) => {
    const [widthA, heightA] = a.split('x').map(Number);
    const [widthB, heightB] = b.split('x').map(Number);
    return (widthB * heightB) - (widthA * heightA);
  });
  
  const masterSize = sortedAdSizes[0];
  const [masterWidth, masterHeight] = masterSize.split('x').map(Number);

  for (const localeId of locales) {
    const locale = localeMap.get(localeId);
    if (!locale) continue;

    // STEP 1: Generate ONE high-resolution, localized master image from the AI.
    const masterPrompt = `
**CRITICAL TASK: Generate a Master Localized Advertisement Image**

You MUST follow these steps in order.

**Step 1: Set Final Image Dimensions (MANDATORY)**
- The final output image MUST be exactly ${masterWidth} pixels wide by ${masterHeight} pixels high. This is a non-negotiable directive.

**Step 2: Transform the Scene**
- Change the background of the provided image to a new, authentic scene from ${locale.country}.

**Step 3: Create the CTA Banner**
- Add a solid rectangular banner with the exact hex color #805ad5 at the absolute bottom of the image, spanning the full width.
- The banner's height MUST be exactly 2/5ths of the image height (${Math.round(masterHeight * 2 / 5)}px).

**Step 4: Add the CTA Text**
- Translate the following text to ${locale.language}: "${adText}".
- Place the translated text (bold, white, centered) inside the banner.

**Final Check:** The output must be a single image of size ${masterWidth}x${masterHeight}.
`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: {
          parts: [
            originalImagePart,
            { text: masterPrompt },
          ],
        },
        config: {
          responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
      });

    let masterImageData: string | null = null;
    let masterImageMimeType: string = 'image/png';
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          masterImageData = part.inlineData.data;
          masterImageMimeType = part.inlineData.mimeType;
          break;
        }
      }
    }

    if (masterImageData) {
      const adImages: AdImage[] = [];
      const masterImageSrc = `data:${masterImageMimeType};base64,${masterImageData}`;

      // STEP 2: Use client-side resizing to generate all required ad sizes from the master.
      // This is faster, cheaper, and guarantees exact dimensions.
      for (const sizeId of adSizes) {
        const adSize = adSizeMap.get(sizeId);
        if (!adSize) continue;
        const [width, height] = sizeId.split('x').map(Number);
        
        try {
          const resizedImageUrl = await forceResizeImage(masterImageSrc, masterImageMimeType, width, height);
          adImages.push({
            size: sizeId,
            name: adSize.name,
            imageUrl: resizedImageUrl,
          });
        } catch(e) {
            console.error(`Failed to resize image for size ${sizeId}`, e);
        }
      }

      if (adImages.length > 0) {
        results.push({
          id: localeId,
          localeName: locale.name,
          adImages,
        });
      }
    }
  }

  return results;
};
