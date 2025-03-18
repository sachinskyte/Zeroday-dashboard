
export interface AudioManagerOptions {
  soundEnabled: boolean; 
  soundVolume: number;
}

class AudioManager {
  private audioElements: Map<string, HTMLAudioElement> = new Map();
  private loaded: Map<string, boolean> = new Map();
  private errors: Map<string, string> = new Map();
  
  loadAudio(id: string, url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.audioElements.has(id)) {
        resolve();
        return;
      }
      
      try {
        const audio = new Audio(url);
        audio.preload = 'auto';
        
        const handleLoaded = () => {
          this.loaded.set(id, true);
          this.errors.delete(id);
          console.log(`Audio loaded: ${id}`);
          resolve();
        };
        
        const handleError = (e: ErrorEvent) => {
          this.loaded.set(id, false);
          this.errors.set(id, `Failed to load audio: ${e.message || 'Unknown error'}`);
          console.error(`Error loading audio ${id}:`, e);
          reject(new Error(`Failed to load audio: ${e.message || 'Unknown error'}`));
        };
        
        audio.addEventListener('canplaythrough', handleLoaded);
        audio.addEventListener('error', handleError as EventListener);
        
        audio.load();
        this.audioElements.set(id, audio);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        this.errors.set(id, `Failed to initialize audio: ${message}`);
        console.error(`Error initializing audio ${id}:`, error);
        reject(error);
      }
    });
  }
  
  isLoaded(id: string): boolean {
    return this.loaded.get(id) || false;
  }
  
  getError(id: string): string | null {
    return this.errors.get(id) || null;
  }
  
  play(id: string, options: AudioManagerOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      const audio = this.audioElements.get(id);
      
      if (!audio) {
        reject(new Error(`Audio not loaded: ${id}`));
        return;
      }
      
      if (!options.soundEnabled) {
        resolve();
        return;
      }
      
      try {
        audio.volume = options.soundVolume / 100;
        audio.currentTime = 0;
        
        audio.play().then(() => {
          resolve();
        }).catch(err => {
          console.error(`Error playing audio ${id}:`, err);
          
          // Handle autoplay restrictions
          if (err.name === 'NotAllowedError') {
            console.warn('Audio playback was blocked by the browser. User interaction required.');
            this.errors.set(id, 'Playback blocked by browser, user interaction required');
          }
          
          reject(err);
        });
      } catch (error) {
        console.error(`Error playing audio ${id}:`, error);
        reject(error);
      }
    });
  }
  
  stop(id: string): void {
    const audio = this.audioElements.get(id);
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  }
  
  cleanup(): void {
    this.audioElements.forEach((audio, id) => {
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
    });
    
    this.audioElements.clear();
    this.loaded.clear();
    this.errors.clear();
  }
}

// Create a singleton instance
export const audioManager = new AudioManager();

// Utility functions
export const loadAlertSound = async (): Promise<void> => {
  try {
    await audioManager.loadAudio('alert', '/alert.mp3');
  } catch (error) {
    console.error('Failed to preload alert sound:', error);
  }
};

export const playAlertSound = (options: AudioManagerOptions): Promise<void> => {
  return audioManager.play('alert', options).catch(error => {
    console.error('Failed to play alert sound:', error);
    return Promise.reject(error);
  });
};
