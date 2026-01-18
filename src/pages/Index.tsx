import { useState, useCallback } from 'react';
import { 
  Upload, 
  EyeOff, 
  Eye, 
  Volume2, 
  Download,
  Binary,
  Info
} from 'lucide-react';
import { ImageUploader } from '@/components/ImageUploader';
import { ImagePreview } from '@/components/ImagePreview';
import { BinaryDisplay } from '@/components/BinaryDisplay';
import { StatusMessage } from '@/components/StatusMessage';
import {
  convertToGrayscale,
  resizeImage,
  hideCharacter,
  extractCharacter,
  imageDataToDataURL,
  charToBinary
} from '@/lib/steganography';
import { speakText, isSpeechSynthesisSupported } from '@/lib/textToSpeech';

const TARGET_SIZE = 256;

export default function Index() {
  // Image states
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [grayscaleImage, setGrayscaleImage] = useState<string | null>(null);
  const [stegoImage, setStegoImage] = useState<string | null>(null);
  const [grayscaleImageData, setGrayscaleImageData] = useState<ImageData | null>(null);
  const [stegoImageData, setStegoImageData] = useState<ImageData | null>(null);

  // Input states
  const [characterToHide, setCharacterToHide] = useState('');
  
  // Output states
  const [hiddenBinary, setHiddenBinary] = useState<string | null>(null);
  const [extractedChar, setExtractedChar] = useState<string | null>(null);
  const [extractedBinary, setExtractedBinary] = useState<string | null>(null);
  
  // Status states
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Handle image upload
  const handleImageLoad = useCallback((canvas: HTMLCanvasElement) => {
    // Store original
    setOriginalImage(canvas.toDataURL());
    
    // Resize to 256x256
    const resizedData = resizeImage(canvas, TARGET_SIZE, TARGET_SIZE);
    
    // Convert to grayscale
    const grayData = convertToGrayscale(resizedData);
    setGrayscaleImageData(grayData);
    setGrayscaleImage(imageDataToDataURL(grayData));
    
    // Reset states
    setStegoImage(null);
    setStegoImageData(null);
    setHiddenBinary(null);
    setExtractedChar(null);
    setExtractedBinary(null);
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
      setStegoImageData(result.imageData);
      setStegoImage(imageDataToDataURL(result.imageData));
      setHiddenBinary(result.binaryRepresentation || null);
      setStatus({ type: 'success', message: result.message });
    } else {
      setStatus({ type: 'error', message: result.message });
    }
  }, [grayscaleImageData, characterToHide]);

  // Extract hidden character
  const handleExtractCharacter = useCallback(() => {
    if (!stegoImageData) {
      setStatus({ type: 'error', message: 'Please create a stego image first by hiding a character' });
      return;
    }

    const result = extractCharacter(stegoImageData);
    
    if (result.success) {
      setExtractedChar(result.extractedChar || null);
      setExtractedBinary(result.binaryRepresentation || null);
      setStatus({ type: 'success', message: result.message });
    } else {
      setStatus({ type: 'error', message: result.message });
    }
  }, [stegoImageData]);

  // Speak extracted character
  const handleSpeak = useCallback(async () => {
    if (!extractedChar) {
      setStatus({ type: 'error', message: 'Please extract a character first' });
      return;
    }

    if (!isSpeechSynthesisSupported()) {
      setStatus({ type: 'error', message: 'Text-to-speech is not supported in your browser' });
      return;
    }

    setIsSpeaking(true);
    const result = await speakText(extractedChar);
    setIsSpeaking(false);
    
    if (!result.success) {
      setStatus({ type: 'error', message: result.message });
    }
  }, [extractedChar]);

  // Download stego image
  const handleDownload = useCallback(() => {
    if (!stegoImage) return;
    
    const link = document.createElement('a');
    link.download = 'stego-image.png';
    link.href = stegoImage;
    link.click();
  }, [stegoImage]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Binary className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold gradient-text">
                Image Steganography
              </h1>
              <p className="text-sm text-muted-foreground">
                LSB-based character hiding and extraction
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Info Banner */}
          <div className="card-elevated p-4 flex items-start gap-3">
            <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-1">How it works</p>
              <p>
                This application uses <span className="text-primary font-medium">Least Significant Bit (LSB)</span> steganography 
                to hide a single character within a grayscale image. The character's 8-bit binary representation 
                is embedded in the least significant bits of the first 8 pixels, making the modification imperceptible.
              </p>
            </div>
          </div>

          {/* Status Message */}
          {status && (
            <StatusMessage type={status.type} message={status.message} />
          )}

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Column - Input */}
            <div className="space-y-6">
              {/* Image Upload Section */}
              <section className="card-elevated p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Upload className="w-5 h-5 text-primary" />
                  Upload Image
                </h2>
                <ImageUploader onImageLoad={handleImageLoad} />
              </section>

              {/* Character Input Section */}
              <section className="card-elevated p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <EyeOff className="w-5 h-5 text-primary" />
                  Hide Character
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="character" className="block text-sm font-medium text-muted-foreground mb-2">
                      Enter a single character to hide
                    </label>
                    <input
                      id="character"
                      type="text"
                      maxLength={1}
                      value={characterToHide}
                      onChange={(e) => setCharacterToHide(e.target.value)}
                      placeholder="e.g., A"
                      className="w-full px-4 py-3 rounded-lg border border-input bg-background text-center text-2xl font-mono font-bold focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                    />
                  </div>

                  {characterToHide && (
                    <div className="text-sm text-muted-foreground">
                      Binary: <span className="font-mono text-primary">{charToBinary(characterToHide)}</span>
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

              {/* Extract Section */}
              <section className="card-elevated p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Eye className="w-5 h-5 text-primary" />
                  Extract Character
                </h2>

                <div className="space-y-4">
                  <button
                    onClick={handleExtractCharacter}
                    disabled={!stegoImage}
                    className="btn-secondary w-full"
                  >
                    <Eye className="w-4 h-4" />
                    Extract Hidden Character
                  </button>

                  <button
                    onClick={handleSpeak}
                    disabled={!extractedChar || isSpeaking}
                    className="btn-secondary w-full"
                  >
                    <Volume2 className={`w-4 h-4 ${isSpeaking ? 'animate-pulse' : ''}`} />
                    {isSpeaking ? 'Speaking...' : 'Speak Character'}
                  </button>
                </div>

                {extractedChar && (
                  <div className="mt-4">
                    <BinaryDisplay
                      binary={extractedBinary}
                      character={extractedChar}
                      label="Extracted Data"
                    />
                  </div>
                )}
              </section>
            </div>

            {/* Right Column - Output */}
            <div className="space-y-6">
              {/* Image Previews */}
              <section className="card-elevated p-6">
                <h2 className="text-lg font-semibold mb-6">Image Preview</h2>
                
                <div className="grid sm:grid-cols-2 gap-6">
                  <ImagePreview
                    title="Grayscale (256×256)"
                    imageSrc={grayscaleImage}
                    size={200}
                  />
                  <ImagePreview
                    title="Stego Image"
                    imageSrc={stegoImage}
                    size={200}
                  />
                </div>

                {stegoImage && (
                  <button
                    onClick={handleDownload}
                    className="btn-secondary w-full mt-6"
                  >
                    <Download className="w-4 h-4" />
                    Download Stego Image
                  </button>
                )}
              </section>

              {/* Hidden Data Display */}
              {hiddenBinary && (
                <section className="card-elevated p-6 animate-slide-up">
                  <h2 className="text-lg font-semibold mb-4">Hidden Data</h2>
                  <BinaryDisplay
                    binary={hiddenBinary}
                    character={characterToHide}
                    label="Character Hidden in Image"
                  />
                </section>
              )}

              {/* Algorithm Explanation */}
              <section className="card-elevated p-6">
                <h2 className="text-lg font-semibold mb-4">Algorithm Details</h2>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <div className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">1</span>
                    <p>Image is converted to <strong className="text-foreground">grayscale</strong> and resized to 256×256 pixels.</p>
                  </div>
                  <div className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">2</span>
                    <p>Input character is converted to <strong className="text-foreground">8-bit binary</strong> representation (ASCII).</p>
                  </div>
                  <div className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">3</span>
                    <p>Each bit is hidden in the <strong className="text-foreground">LSB of first 8 pixels</strong>, changing value by at most ±1.</p>
                  </div>
                  <div className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">4</span>
                    <p>Extraction reads <strong className="text-foreground">LSBs</strong> from first 8 pixels and converts back to character.</p>
                  </div>
                </div>
              </section>
            </div>
          </div>

          {/* Footer */}
          <footer className="text-center text-sm text-muted-foreground py-8 border-t border-border">
            <p>
              Academic Project: LSB Image Steganography with Text-to-Speech
            </p>
            <p className="mt-1">
              Built with React, TypeScript, Canvas API, and Web Speech API
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
}
