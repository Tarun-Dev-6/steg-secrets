/**
 * LSB Steganography Implementation
 * 
 * This module implements Least Significant Bit (LSB) steganography
 * for hiding a single character within a grayscale image.
 * 
 * The character is converted to its 8-bit binary representation,
 * and each bit is hidden in the LSB of consecutive pixels.
 */

export interface SteganographyResult {
  success: boolean;
  message: string;
  imageData?: ImageData;
  extractedChar?: string;
  binaryRepresentation?: string;
}

/**
 * Converts an image to grayscale
 * @param imageData - The source image data
 * @returns New ImageData with grayscale values
 */
export function convertToGrayscale(imageData: ImageData): ImageData {
  const data = new Uint8ClampedArray(imageData.data);
  
  for (let i = 0; i < data.length; i += 4) {
    // Using luminosity method for accurate grayscale conversion
    // Gray = 0.299*R + 0.587*G + 0.114*B
    const gray = Math.round(
      0.299 * data[i] + 
      0.587 * data[i + 1] + 
      0.114 * data[i + 2]
    );
    
    data[i] = gray;     // Red
    data[i + 1] = gray; // Green
    data[i + 2] = gray; // Blue
    // Alpha channel (data[i + 3]) remains unchanged
  }
  
  return new ImageData(data, imageData.width, imageData.height);
}

/**
 * Converts a character to its 8-bit binary representation
 * @param char - Single character to convert
 * @returns 8-bit binary string
 */
export function charToBinary(char: string): string {
  if (char.length !== 1) {
    throw new Error('Input must be exactly one character');
  }
  
  const charCode = char.charCodeAt(0);
  
  if (charCode > 255) {
    throw new Error('Character must be ASCII (0-255)');
  }
  
  return charCode.toString(2).padStart(8, '0');
}

/**
 * Converts an 8-bit binary string to a character
 * @param binary - 8-bit binary string
 * @returns The corresponding character
 */
export function binaryToChar(binary: string): string {
  if (binary.length !== 8) {
    throw new Error('Binary string must be 8 bits');
  }
  
  const charCode = parseInt(binary, 2);
  return String.fromCharCode(charCode);
}

/**
 * Hides a single character in the image using LSB steganography
 * 
 * Algorithm:
 * 1. Convert character to 8-bit binary
 * 2. For each bit, modify the LSB of consecutive grayscale pixels
 * 3. The modification is imperceptible as it only changes the pixel value by ±1
 * 
 * @param imageData - Grayscale image data (256x256)
 * @param character - Single character to hide
 * @returns Result containing the stego image
 */
export function hideCharacter(
  imageData: ImageData,
  character: string
): SteganographyResult {
  try {
    if (!character || character.length !== 1) {
      return {
        success: false,
        message: 'Please enter exactly one character'
      };
    }

    const binary = charToBinary(character);
    const data = new Uint8ClampedArray(imageData.data);
    
    // We need at least 8 pixels to hide 8 bits
    const totalPixels = imageData.width * imageData.height;
    if (totalPixels < 8) {
      return {
        success: false,
        message: 'Image too small for steganography'
      };
    }

    // Hide each bit in the LSB of consecutive pixels
    for (let i = 0; i < 8; i++) {
      const bit = parseInt(binary[i], 10);
      const pixelIndex = i * 4; // Each pixel has 4 values (RGBA)
      
      // Get current pixel value (grayscale, so R=G=B)
      const currentValue = data[pixelIndex];
      
      // Modify LSB: clear LSB then set it to our bit
      const newValue = (currentValue & 0xFE) | bit;
      
      // Set all RGB channels to maintain grayscale
      data[pixelIndex] = newValue;
      data[pixelIndex + 1] = newValue;
      data[pixelIndex + 2] = newValue;
    }

    return {
      success: true,
      message: `Successfully hidden character '${character}' in image`,
      imageData: new ImageData(data, imageData.width, imageData.height),
      binaryRepresentation: binary
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Extracts a hidden character from the image using LSB steganography
 * 
 * Algorithm:
 * 1. Read the LSB of the first 8 pixels
 * 2. Combine to form an 8-bit binary string
 * 3. Convert binary to character
 * 
 * @param imageData - Stego image data
 * @returns Result containing the extracted character
 */
export function extractCharacter(imageData: ImageData): SteganographyResult {
  try {
    const data = imageData.data;
    let binary = '';

    // Extract LSB from first 8 pixels
    for (let i = 0; i < 8; i++) {
      const pixelIndex = i * 4;
      const pixelValue = data[pixelIndex];
      
      // Extract LSB
      const bit = pixelValue & 1;
      binary += bit.toString();
    }

    const extractedChar = binaryToChar(binary);

    return {
      success: true,
      message: `Successfully extracted character '${extractedChar}'`,
      extractedChar,
      binaryRepresentation: binary
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Resizes image data to specified dimensions using canvas
 * @param canvas - Source canvas with image
 * @param targetWidth - Target width (default 256)
 * @param targetHeight - Target height (default 256)
 * @returns ImageData of resized image
 */
export function resizeImage(
  canvas: HTMLCanvasElement,
  targetWidth: number = 256,
  targetHeight: number = 256
): ImageData {
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = targetWidth;
  tempCanvas.height = targetHeight;
  
  const ctx = tempCanvas.getContext('2d');
  if (!ctx) {
    throw new Error('Could not get canvas context');
  }

  // Use high-quality image smoothing
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  
  ctx.drawImage(canvas, 0, 0, targetWidth, targetHeight);
  
  return ctx.getImageData(0, 0, targetWidth, targetHeight);
}

/**
 * Creates a data URL from ImageData
 * @param imageData - The image data to convert
 * @returns Data URL string
 */
export function imageDataToDataURL(imageData: ImageData): string {
  const canvas = document.createElement('canvas');
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Could not get canvas context');
  }
  
  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL('image/png');
}
