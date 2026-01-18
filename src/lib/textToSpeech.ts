/**
 * Text-to-Speech Implementation using Web Speech API
 * 
 * This module provides text-to-speech functionality using the browser's
 * built-in SpeechSynthesis API, which works offline in most modern browsers.
 */

export interface TTSResult {
  success: boolean;
  message: string;
}

/**
 * Checks if the browser supports the Web Speech API
 * @returns Boolean indicating speech synthesis support
 */
export function isSpeechSynthesisSupported(): boolean {
  return 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
}

/**
 * Gets available voices for speech synthesis
 * @returns Promise resolving to array of available voices
 */
export function getAvailableVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    const synth = window.speechSynthesis;
    
    // Some browsers load voices asynchronously
    let voices = synth.getVoices();
    
    if (voices.length > 0) {
      resolve(voices);
      return;
    }

    // Wait for voices to load
    synth.onvoiceschanged = () => {
      voices = synth.getVoices();
      resolve(voices);
    };

    // Fallback timeout
    setTimeout(() => {
      resolve(synth.getVoices());
    }, 1000);
  });
}

/**
 * Speaks the given text using the Web Speech API
 * 
 * @param text - The text to speak
 * @param options - Optional configuration for speech
 * @returns Promise resolving to TTSResult
 */
export async function speakText(
  text: string,
  options?: {
    rate?: number;      // Speaking rate (0.1 to 10, default 1)
    pitch?: number;     // Pitch (0 to 2, default 1)
    volume?: number;    // Volume (0 to 1, default 1)
    voice?: SpeechSynthesisVoice;
  }
): Promise<TTSResult> {
  return new Promise((resolve) => {
    if (!isSpeechSynthesisSupported()) {
      resolve({
        success: false,
        message: 'Speech synthesis is not supported in this browser'
      });
      return;
    }

    if (!text || text.trim().length === 0) {
      resolve({
        success: false,
        message: 'No text provided for speech'
      });
      return;
    }

    const synth = window.speechSynthesis;
    
    // Cancel any ongoing speech
    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Apply options
    if (options?.rate) utterance.rate = options.rate;
    if (options?.pitch) utterance.pitch = options.pitch;
    if (options?.volume) utterance.volume = options.volume;
    if (options?.voice) utterance.voice = options.voice;

    // For single characters, speak the character name for clarity
    if (text.length === 1) {
      // Map special characters to their names
      const charNames: Record<string, string> = {
        ' ': 'space',
        '.': 'period',
        ',': 'comma',
        '!': 'exclamation mark',
        '?': 'question mark',
        '@': 'at sign',
        '#': 'hash',
        '$': 'dollar sign',
        '%': 'percent',
        '&': 'ampersand',
        '*': 'asterisk',
        '(': 'open parenthesis',
        ')': 'close parenthesis',
        '-': 'hyphen',
        '_': 'underscore',
        '=': 'equals',
        '+': 'plus',
        '/': 'slash',
        '\\': 'backslash',
        '\n': 'new line',
        '\t': 'tab'
      };

      const charName = charNames[text] || text;
      utterance.text = `The extracted character is: ${charName}`;
    }

    utterance.onend = () => {
      resolve({
        success: true,
        message: `Successfully spoke: "${text}"`
      });
    };

    utterance.onerror = (event) => {
      resolve({
        success: false,
        message: `Speech synthesis error: ${event.error}`
      });
    };

    synth.speak(utterance);
  });
}

/**
 * Stops any ongoing speech
 */
export function stopSpeaking(): void {
  if (isSpeechSynthesisSupported()) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Checks if speech synthesis is currently speaking
 * @returns Boolean indicating if speech is in progress
 */
export function isSpeaking(): boolean {
  if (!isSpeechSynthesisSupported()) return false;
  return window.speechSynthesis.speaking;
}
