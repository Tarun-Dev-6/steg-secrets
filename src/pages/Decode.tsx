import { useState, useCallback } from 'react';
import { Upload, Eye, Volume2, Info } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { ImageUploader } from '@/components/ImageUploader';
import { ImagePreview } from '@/components/ImagePreview';
import { BinaryDisplay } from '@/components/BinaryDisplay';
import { StatusMessage } from '@/components/StatusMessage';
import {
  convertToGrayscale,
  resizeImage,
  extractCharacter,
  imageDataToDataURL
} from '@/lib/steganography';
import { speakText, isSpeechSynthesisSupported } from '@/lib/textToSpeech';

const TARGET_SIZE = 256;

export default function Decode() {
  // Image states
  const [stegoImage, setStegoImage] = useState<string | null>(null);
  const [stegoImageData, setStegoImageData] = useState<ImageData | null>(null);

  // Output states
  const [extractedChar, setExtractedChar] = useState<string | null>(null);
  const [extractedBinary, setExtractedBinary] = useState<string | null>(null);
  
  // Status states
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Handle image upload
  const handleImageLoad = useCallback((canvas: HTMLCanvasElement) => {
    const resizedData = resizeImage(canvas, TARGET_SIZE, TARGET_SIZE);
    const grayData = convertToGrayscale(resizedData);
    setStegoImageData(grayData);
    setStegoImage(imageDataToDataURL(grayData));
    
    setExtractedChar(null);
    setExtractedBinary(null);
    setStatus({ type: 'info', message: 'Stego image loaded. Click "Extract Character" to reveal the hidden message.' });
  }, []);

  // Extract hidden character
  const handleExtractCharacter = useCallback(() => {
    if (!stegoImageData) {
      setStatus({ type: 'error', message: 'Please upload a stego image first' });
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
    await speakText(extractedChar);
    setIsSpeaking(false);
  }, [extractedChar]);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
              <Eye className="w-4 h-4" />
              Decode Mode
            </div>
            <h1 className="text-3xl font-bold mb-2">Extract Character from Image</h1>
            <p className="text-muted-foreground">
              Upload a stego image to extract the hidden character
            </p>
          </div>

          {/* Info Banner */}
          <div className="card-elevated p-4 flex items-start gap-3 mb-6">
            <Info className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground">
              Upload an image that was encoded using this tool. The extraction reads the LSB 
              from the first 8 pixels to reconstruct the hidden character.
            </p>
          </div>

          {/* Status Message */}
          {status && (
            <div className="mb-6">
              <StatusMessage type={status.type} message={status.message} />
            </div>
          )}

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Column - Input */}
            <div className="space-y-6">
              {/* Image Upload */}
              <section className="card-elevated p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Upload className="w-5 h-5 text-accent" />
                  Step 1: Upload Stego Image
                </h2>
                <ImageUploader onImageLoad={handleImageLoad} />
              </section>

              {/* Extract Button */}
              <section className="card-elevated p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Eye className="w-5 h-5 text-accent" />
                  Step 2: Extract & Listen
                </h2>
                
                <div className="space-y-4">
                  <button
                    onClick={handleExtractCharacter}
                    disabled={!stegoImage}
                    className="btn-primary w-full"
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
                    {isSpeaking ? 'Speaking...' : 'Speak Character (TTS)'}
                  </button>
                </div>
              </section>
            </div>

            {/* Right Column - Output */}
            <div className="space-y-6">
              {/* Image Preview */}
              <section className="card-elevated p-6">
                <h2 className="text-lg font-semibold mb-6">Stego Image</h2>
                <div className="flex justify-center">
                  <ImagePreview
                    title="Uploaded Image"
                    imageSrc={stegoImage}
                    size={220}
                  />
                </div>
              </section>

              {/* Extracted Character Display */}
              {extractedChar && (
                <section className="card-elevated p-6 animate-slide-up">
                  <h2 className="text-lg font-semibold mb-4">Extraction Result</h2>
                  
                  {/* Large Character Display */}
                  <div className="text-center mb-6">
                    <p className="text-sm text-muted-foreground mb-2">Extracted Character</p>
                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-accent/10 border-2 border-accent/30">
                      <span className="text-5xl font-mono font-bold text-accent">
                        {extractedChar}
                      </span>
                    </div>
                  </div>

                  <BinaryDisplay
                    binary={extractedBinary}
                    character={extractedChar}
                    label="Binary data extracted from image"
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
