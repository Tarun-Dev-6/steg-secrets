import { useState, useCallback } from 'react';
import { Upload, EyeOff, Download, Info } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { ImageUploader } from '@/components/ImageUploader';
import { ImagePreview } from '@/components/ImagePreview';
import { BinaryDisplay } from '@/components/BinaryDisplay';
import { StatusMessage } from '@/components/StatusMessage';
import {
  convertToGrayscale,
  resizeImage,
  hideCharacter,
  imageDataToDataURL,
  charToBinary
} from '@/lib/steganography';

const TARGET_SIZE = 256;

export default function Encode() {
  // Image states
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [grayscaleImage, setGrayscaleImage] = useState<string | null>(null);
  const [stegoImage, setStegoImage] = useState<string | null>(null);
  const [grayscaleImageData, setGrayscaleImageData] = useState<ImageData | null>(null);

  // Input states
  const [characterToHide, setCharacterToHide] = useState('');
  
  // Output states
  const [hiddenBinary, setHiddenBinary] = useState<string | null>(null);
  
  // Status states
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  // Handle image upload
  const handleImageLoad = useCallback((canvas: HTMLCanvasElement) => {
    setOriginalImage(canvas.toDataURL());
    
    const resizedData = resizeImage(canvas, TARGET_SIZE, TARGET_SIZE);
    const grayData = convertToGrayscale(resizedData);
    setGrayscaleImageData(grayData);
    setGrayscaleImage(imageDataToDataURL(grayData));
    
    setStegoImage(null);
    setHiddenBinary(null);
    setStatus({ type: 'success', message: 'Image loaded, converted to grayscale, and resized to 256×256' });
  }, []);

  // Hide character in image
  const handleHideCharacter = useCallback(() => {
    if (!grayscaleImageData) {
      setStatus({ type: 'error', message: 'Please upload an image first' });
      return;
    }

    if (!characterToHide || characterToHide.length !== 1) {
      setStatus({ type: 'error', message: 'Please enter exactly one character to hide' });
      return;
    }

    const result = hideCharacter(grayscaleImageData, characterToHide);
    
    if (result.success && result.imageData) {
      setStegoImage(imageDataToDataURL(result.imageData));
      setHiddenBinary(result.binaryRepresentation || null);
      setStatus({ type: 'success', message: result.message });
    } else {
      setStatus({ type: 'error', message: result.message });
    }
  }, [grayscaleImageData, characterToHide]);

  // Download stego image
  const handleDownload = useCallback(() => {
    if (!stegoImage) return;
    
    const link = document.createElement('a');
    link.download = 'stego-image.png';
    link.href = stegoImage;
    link.click();
  }, [stegoImage]);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <EyeOff className="w-4 h-4" />
              Encode Mode
            </div>
            <h1 className="text-3xl font-bold mb-2">Hide Character in Image</h1>
            <p className="text-muted-foreground">
              Upload an image and hide a single character using LSB steganography
            </p>
          </div>

          {/* Info Banner */}
          <div className="card-elevated p-4 flex items-start gap-3 mb-6">
            <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground">
              The image will be converted to grayscale and resized to 256×256 pixels. 
              The character's 8-bit binary will be hidden in the LSB of the first 8 pixels.
            </p>
          </div>

          {/* Status Message */}
          {status && (
            <div className="mb-6">
              <StatusMessage type={status.type} message={status.message} />
            </div>
          )}

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Column - Inputs */}
            <div className="space-y-6">
              {/* Image Upload */}
              <section className="card-elevated p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Upload className="w-5 h-5 text-primary" />
                  Step 1: Upload Image
                </h2>
                <ImageUploader onImageLoad={handleImageLoad} />
              </section>

              {/* Character Input */}
              <section className="card-elevated p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <EyeOff className="w-5 h-5 text-primary" />
                  Step 2: Enter Character
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="character" className="block text-sm font-medium text-muted-foreground mb-2">
                      Single character to hide (ASCII only)
                    </label>
                    <input
                      id="character"
                      type="text"
                      maxLength={1}
                      value={characterToHide}
                      onChange={(e) => setCharacterToHide(e.target.value)}
                      placeholder="e.g., A"
                      className="w-full px-4 py-4 rounded-lg border border-input bg-background text-center text-3xl font-mono font-bold focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                    />
                  </div>

                  {characterToHide && (
                    <div className="p-3 rounded-lg bg-muted/50 text-sm">
                      <span className="text-muted-foreground">Binary representation: </span>
                      <span className="font-mono text-primary font-medium tracking-widest">
                        {charToBinary(characterToHide)}
                      </span>
                    </div>
                  )}

                  <button
                    onClick={handleHideCharacter}
                    disabled={!grayscaleImage || !characterToHide}
                    className="btn-primary w-full"
                  >
                    <EyeOff className="w-4 h-4" />
                    Hide Character in Image
                  </button>
                </div>
              </section>
            </div>

            {/* Right Column - Outputs */}
            <div className="space-y-6">
              {/* Image Previews */}
              <section className="card-elevated p-6">
                <h2 className="text-lg font-semibold mb-6">Image Preview</h2>
                
                <div className="grid grid-cols-2 gap-4">
                  <ImagePreview
                    title="Grayscale"
                    imageSrc={grayscaleImage}
                    size={180}
                  />
                  <ImagePreview
                    title="Stego Image"
                    imageSrc={stegoImage}
                    size={180}
                  />
                </div>

                {stegoImage && (
                  <button
                    onClick={handleDownload}
                    className="btn-primary w-full mt-6"
                  >
                    <Download className="w-4 h-4" />
                    Download Stego Image
                  </button>
                )}
              </section>

              {/* Hidden Data Display */}
              {hiddenBinary && (
                <section className="card-elevated p-6 animate-slide-up">
                  <h2 className="text-lg font-semibold mb-4">Encoding Result</h2>
                  <BinaryDisplay
                    binary={hiddenBinary}
                    character={characterToHide}
                    label="Successfully hidden in image"
                  />
                </section>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
