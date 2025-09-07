export class PronunciationService {
  private static jpVoice: SpeechSynthesisVoice | null = null;
  private static voicesLoaded = false;

  static async initialize(): Promise<void> {
    return new Promise((resolve) => {
      if (this.voicesLoaded) {
        resolve();
        return;
      }

      const loadVoices = () => {
        const voices = speechSynthesis.getVoices();
        this.jpVoice = voices.find(v => v.lang.startsWith("ja")) || null;
        this.voicesLoaded = true;
        resolve();
      };

      if (speechSynthesis.getVoices().length > 0) {
        loadVoices();
      } else {
        speechSynthesis.addEventListener('voiceschanged', loadVoices, { once: true });
      }
    });
  }

  static async pronounceCharacter(character: string): Promise<void> {
    await this.initialize();

    const utterance = new SpeechSynthesisUtterance(character);
    
    // Try to use Japanese voice if available
    if (this.jpVoice) {
      utterance.voice = this.jpVoice;
    }

    // Set speech parameters
    utterance.rate = 0.6; // Slower rate for clearer pronunciation
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    speechSynthesis.speak(utterance);
  }

  static isSupported(): boolean {
    return 'speechSynthesis' in window;
  }

  static getAvailableJapaneseVoices(): SpeechSynthesisVoice[] {
    return speechSynthesis.getVoices().filter(v => v.lang.startsWith("ja"));
  }
}