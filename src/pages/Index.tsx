import { useState, useEffect, useRef, useCallback } from 'react';
import Header from '@/components/Header';
import ThreatStats from '@/features/stats/ThreatStats';
import LiveAttackFeed from '@/features/feeds/LiveAttackFeed';
import ThreatMap from '@/components/maps/ThreatMap';
import BlockchainViewer from '@/features/blockchain/BlockchainViewer';
import ThreatChart from '@/components/charts/ThreatChart';
import AlertBanner from '@/components/alerts/AlertBanner';
import ThreatTrends from '@/components/charts/ThreatTrends';
import ConnectionStatus from '@/features/settings/ConnectionStatus';
import { useThreatData, ThreatData } from '@/hooks/useThreatData';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/components/theme-provider';
import { Shield, AlertOctagon } from 'lucide-react';
import { getFromStorage, saveToStorage } from '@/utils/storageUtils';
import { playAudio, initializeAudio } from '@/utils/audioUtils';
import { getNewHighSeverityThreats } from '@/utils/dataUtils';

// Create and add alert.mp3 to public folder
const ALERT_SOUND_URL = '/alert.mp3';

// Define the ConnectionSettings interface
interface ConnectionSettings {
  apiKey: string;
  apiUrl: string;
  blockchainUrl: string;
}

// Helper function to validate URL
const isValidUrl = (url: string): boolean => {
  try {
    if (!url) return false;
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

const Index = () => {
  // Load persisted settings from localStorage with error handling
  const [persistedSettings, setPersistedSettings] = useState<ConnectionSettings>(() => {
    try {
      const settings = getFromStorage('sentinel-connection-settings', {
        apiKey: '',
        apiUrl: '',
        blockchainUrl: '',
      });
      return settings;
    } catch (error) {
      console.error('Error loading connection settings:', error);
      return { apiKey: '', apiUrl: '', blockchainUrl: '' };
    }
  });
  
  // Fix the type error - converting string to boolean properly
  const [soundEnabled, setSoundEnabled] = useState(() => {
    try {
      return getFromStorage('sentinel-sound-enabled', 'false') === 'true';
    } catch (error) {
      console.error('Error loading sound settings:', error);
      return false;
    }
  });
  
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    try {
      return getFromStorage('sentinel-notifications-enabled', 'true') === 'true';
    } catch (error) {
      console.error('Error loading notification settings:', error);
      return true;
    }
  });
  
  const [soundVolume, setSoundVolume] = useState(() => {
    try {
      const volume = getFromStorage('sentinel-sound-volume', '70');
      const parsedVolume = parseInt(volume, 10);
      return isNaN(parsedVolume) ? 70 : parsedVolume;
    } catch (error) {
      console.error('Error loading volume settings:', error);
      return 70;
    }
  });
  
  const [currentAlert, setCurrentAlert] = useState<ThreatData | null>(null);
  const [alertHistory, setAlertHistory] = useState<string[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioLoaded, setAudioLoaded] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [localConnectionError, setLocalConnectionError] = useState<string | null>(null);
  
  // Safely persist settings to localStorage
  const safelyPersistToStorage = useCallback((key: string, value: any) => {
    try {
      saveToStorage(key, value);
    } catch (error) {
      console.error(`Error saving ${key} to storage:`, error);
    }
  }, []);
  
  // Store settings in localStorage when they change
  useEffect(() => {
    safelyPersistToStorage('sentinel-connection-settings', persistedSettings);
  }, [persistedSettings, safelyPersistToStorage]);
  
  useEffect(() => {
    safelyPersistToStorage('sentinel-sound-enabled', soundEnabled.toString());
  }, [soundEnabled, safelyPersistToStorage]);
  
  useEffect(() => {
    safelyPersistToStorage('sentinel-notifications-enabled', notificationsEnabled.toString());
  }, [notificationsEnabled, safelyPersistToStorage]);
  
  useEffect(() => {
    safelyPersistToStorage('sentinel-sound-volume', soundVolume.toString());
  }, [soundVolume, safelyPersistToStorage]);

  // Improved audio loading with better error handling
  useEffect(() => {
    let audioElement: HTMLAudioElement | null = null;
    
    try {
      if (!audioRef.current) {
        // Create audio element and set its properties
        audioElement = initializeAudio(ALERT_SOUND_URL);
        audioRef.current = audioElement;
        
        if (audioElement) {
          const handleAudioLoaded = () => {
            console.log('Audio loaded successfully');
            setAudioLoaded(true);
            setAudioError(null);
          };
          
          const handleAudioError = () => {
            console.error('Error loading audio');
            setAudioLoaded(false);
            setAudioError('Failed to load alert sound');
          };
          
          audioElement.addEventListener('canplaythrough', handleAudioLoaded);
          audioElement.addEventListener('error', handleAudioError);
        }
      }
    } catch (error) {
      console.error('Error initializing audio:', error);
      setAudioError('Failed to initialize audio');
    }
    
    return () => {
      if (audioElement) {
        try {
          audioElement.pause();
          audioElement.removeEventListener('canplaythrough', () => {});
          audioElement.removeEventListener('error', () => {});
        } catch (error) {
          console.error('Error cleaning up audio:', error);
        }
      }
    };
  }, []);
  
  // Define ThreatStats interface to match what's used in useThreatData
  interface ThreatStats {
    totalThreats: number;
    highSeverity: number;
    mediumSeverity: number;
    lowSeverity: number;
    mitigatedThreats: number;
    attackVectors: Record<string, number>;
    blockchainIncidents: number;
  }
  
  // Provide default values for all hook returns
  const { 
    isConnected = false,
    isLoading = false,
    error = null,
    connectionError = null,
    lastUpdated = null,
    threatData = [],
    blockchainData = [],
    threatStats = {
      totalThreats: 0,
      highSeverity: 0,
      mediumSeverity: 0,
      lowSeverity: 0,
      mitigatedThreats: 0,
      attackVectors: {},
      blockchainIncidents: 0
    },
    reconnectAttempts = 0,
    isReconnecting = false,
    usingFallbackData = false,
    apiConnected = false,
    blockchainConnected = false,
    connectToSources = () => {},
    disconnect = () => {},
    fetchThreatData = () => Promise.resolve(),
    fetchBlockchainData = () => Promise.resolve()
  } = useThreatData(persistedSettings) || {};
  
  const toggleSound = useCallback(() => {
    setSoundEnabled(prev => !prev);
  }, []);
  
  // Connect to sources when settings are available and connection is not active
  useEffect(() => {
    if (persistedSettings.apiUrl && persistedSettings.blockchainUrl && !isConnected && !isLoading && !isReconnecting) {
      try {
        console.log('Attempting to connect with stored settings');
        connectToSources();
      } catch (error) {
        console.error('Error connecting to sources:', error);
        setLocalConnectionError('Failed to connect to sources. Please check your settings and try again.');
      }
    }
  }, [persistedSettings, isConnected, isLoading, isReconnecting, connectToSources]);
  
  // Handle high severity threats for alerts
  useEffect(() => {
    if (!threatData || threatData.length === 0 || !notificationsEnabled) return;
    
    try {
      const highSeverityThreats = getNewHighSeverityThreats(threatData, alertHistory);
      
      if (highSeverityThreats.length > 0) {
        setCurrentAlert(highSeverityThreats[0]);
        setAlertHistory(prev => [...prev, highSeverityThreats[0].id]);
        
        // Play sound for high severity threats if enabled
        if (soundEnabled && audioRef.current && audioLoaded) {
          playAudio(audioRef.current, soundVolume).catch(err => {
            console.error('Failed to play alert sound:', err);
          });
        }
      }
    } catch (error) {
      console.error('Error processing threats for alerts:', error);
    }
  }, [threatData, notificationsEnabled, alertHistory, soundEnabled, soundVolume, audioLoaded]);
  
  // Safely validate URLs and connect
  const handleConnect = useCallback((apiKey: string, apiUrl: string, blockchainUrl: string) => {
    try {
      setLocalConnectionError(null);
      
      // Validate URLs
      if (!isValidUrl(apiUrl)) {
        setLocalConnectionError("Invalid API URL format. Please provide a valid URL.");
        return;
      }
      
      if (!isValidUrl(blockchainUrl)) {
        setLocalConnectionError("Invalid Blockchain URL format. Please provide a valid URL.");
        return;
      }
      
      // Store the new settings
      const newSettings = { apiKey, apiUrl, blockchainUrl };
      setPersistedSettings(newSettings);
      
      // Try to connect with the new settings
      connectToSources();
    } catch (err) {
      console.error("Error in handleConnect:", err);
      setLocalConnectionError("Failed to connect. Please check your settings and try again.");
    }
  }, [connectToSources]);
  
  const handleDisconnect = useCallback(() => {
    try {
      disconnect();
    } catch (error) {
      console.error('Error disconnecting:', error);
    }
  }, [disconnect]);
  
  const handleReset = useCallback(() => {
    try {
      const newSettings = { apiKey: '', apiUrl: '', blockchainUrl: '' };
      setPersistedSettings(newSettings);
      disconnect();
    } catch (error) {
      console.error('Error resetting settings:', error);
    }
  }, [disconnect]);
  
  // Combine local and hook connection errors
  const displayConnectionError = localConnectionError || connectionError;
  
  return (
    <ThemeProvider defaultTheme="dark">
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/10">
        <Toaster position="top-right" richColors closeButton />
        <Header 
          isConnected={isConnected}
          connectionSettings={persistedSettings}
          onDisconnect={handleDisconnect}
          onReset={handleReset}
          onConnect={handleConnect}
          soundEnabled={soundEnabled}
          setSoundEnabled={setSoundEnabled}
          notificationsEnabled={notificationsEnabled}
          setNotificationsEnabled={setNotificationsEnabled}
          soundVolume={soundVolume}
          setSoundVolume={setSoundVolume}
          connectionError={displayConnectionError}
        />
        
        <main className="container mx-auto pt-24 pb-16 px-4 sm:px-6">
          {(isConnected || isReconnecting) && (
            <div className="mb-4">
              <ConnectionStatus 
                isConnected={isConnected} 
                lastUpdated={lastUpdated}
                isReconnecting={isReconnecting}
                reconnectAttempts={reconnectAttempts} 
                usingFallbackData={usingFallbackData}
                apiConnected={apiConnected}
                blockchainConnected={blockchainConnected}
              />
            </div>
          )}
          
          <div className="space-y-6">
            {currentAlert && (
              <AlertBanner 
                threat={currentAlert} 
                onClose={() => setCurrentAlert(null)} 
                soundEnabled={soundEnabled}
                soundVolume={soundVolume}
                toggleSound={toggleSound}
              />
            )}
            
            {!isConnected && !isLoading && !isReconnecting ? (
              <div className="h-[70vh] flex flex-col items-center justify-center">
                <div className="text-center space-y-6 max-w-lg">
                  <Shield className="h-20 w-20 text-primary opacity-20 mx-auto" />
                  <h2 className="text-2xl font-semibold">Sentinel Dashboard</h2>
                  <p className="text-muted-foreground">
                    Connect to your threat intelligence API and blockchain ledger to view 
                    real-time security insights and threat data.
                  </p>
                  {displayConnectionError && (
                    <div className="text-red-500 p-4 bg-red-500/10 rounded-lg text-sm">
                      <AlertOctagon className="h-4 w-4 inline-block mr-2" />
                      {displayConnectionError}
                    </div>
                  )}
                  <div className="flex justify-center">
                    <button 
                      onClick={() => {
                        const settingsTrigger = document.getElementById('settings-trigger');
                        if (settingsTrigger) {
                          settingsTrigger.click();
                        } else {
                          console.error('Settings trigger element not found');
                          setLocalConnectionError('Unable to open settings. Please refresh the page.');
                        }
                      }}
                      className="connect-button group"
                    >
                      Configure Connection
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <section className="dashboard-grid">
                  <div className="md:col-span-12">
                    <ThreatStats {...threatStats} />
                  </div>
                </section>
                
                <section className="dashboard-grid mt-6">
                  <div className="md:col-span-5 h-[500px]">
                    <LiveAttackFeed threats={threatData} />
                  </div>
                  <div className="md:col-span-7 h-[500px]">
                    <ThreatChart threats={threatData} />
                  </div>
                </section>
                
                <section className="dashboard-grid mt-6">
                  <div className="md:col-span-8 h-[400px]">
                    <ThreatMap threats={threatData} />
                  </div>
                  <div className="md:col-span-4 h-[400px]">
                    <BlockchainViewer data={blockchainData} />
                  </div>
                </section>

                <section className="mt-6">
                  <ThreatTrends threats={threatData} />
                </section>
              </>
            )}
          </div>
        </main>
      </div>
    </ThemeProvider>
  );
};

export default Index;