
export type StorageKey = 
  | 'sentinel-connection-settings'
  | 'sentinel-sound-enabled'
  | 'sentinel-notifications-enabled'
  | 'sentinel-sound-volume';

/**
 * Get a value from local storage with error handling and type conversion
 */
export function getFromStorage<T>(key: StorageKey, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(key);
    if (stored === null) return defaultValue;
    
    if (typeof defaultValue === 'boolean') {
      return (stored === 'true') as unknown as T;
    }
    
    if (typeof defaultValue === 'number') {
      const parsed = parseInt(stored, 10);
      return (isNaN(parsed) ? defaultValue : parsed) as unknown as T;
    }
    
    if (typeof defaultValue === 'object') {
      return JSON.parse(stored) as T;
    }
    
    return stored as unknown as T;
  } catch (error) {
    console.error(`Error loading ${key} from localStorage:`, error);
    return defaultValue;
  }
}

/**
 * Save a value to local storage with error handling
 */
export function saveToStorage<T>(key: StorageKey, value: T): void {
  try {
    if (value === undefined || value === null) {
      localStorage.removeItem(key);
      return;
    }
    
    const valueToStore =
      typeof value === 'object' ? JSON.stringify(value) : String(value);
    
    localStorage.setItem(key, valueToStore);
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
}

/**
 * Load all persisted settings from storage
 */
export function loadPersistedSettings() {
  return {
    connectionSettings: getFromStorage('sentinel-connection-settings', {
      apiKey: '',
      apiUrl: '',
      blockchainUrl: '',
    }),
    soundEnabled: getFromStorage('sentinel-sound-enabled', false),
    notificationsEnabled: getFromStorage('sentinel-notifications-enabled', true),
    soundVolume: getFromStorage('sentinel-sound-volume', 70),
  };
}
