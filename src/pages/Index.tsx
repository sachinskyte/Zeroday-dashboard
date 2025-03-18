
import { useState, useEffect, useRef, useCallback } from 'react';
import Header from '@/components/Header';
import { ThreatStats } from '@/components/stats/ThreatStats';
import { LiveAttackFeed } from '@/components/feeds/LiveAttackFeed';
import ThreatMap from '@/components/ThreatMap';
import { BlockchainViewer } from '@/components/blockchain/BlockchainViewer';
import ThreatChart from '@/components/ThreatChart';
import AlertBanner from '@/components/AlertBanner';
import ThreatTrends from '@/components/ThreatTrends';
import { ConnectionStatus } from '@/components/settings/ConnectionStatus';
import { useThreatData, ThreatData } from '@/hooks/useThreatData';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/components/theme-provider';
import { Shield, AlertOctagon } from 'lucide-react';
import { loadAlertSound, playAlertSound } from '@/utils/audioUtils';
import { getFromStorage, saveToStorage, loadPersistedSettings } from '@/utils/storageUtils';

const Index = () => {
  // Load persisted settings from localStorage with error handling
  const [persistedSettings, setPersistedSettings] = useState(() => {
    return loadPersistedSettings().connectionSettings;
  });
  
  const [soundEnabled, setSoundEnabled] = useState(() => {
    return loadPersistedSettings().soundEnabled;
  });
  
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    return loadPersistedSettings().notificationsEnabled;
  });
  
  const [soundVolume, setSoundVolume] = useState(() => {
    return loadPersistedSettings().soundVolume;
  });
  
  const [currentAlert, setCurrentAlert] = useState<ThreatData | null>(null);
  const [alertHistory, setAlertHistory] = useState<string[]>([]);
  const [audioLoaded, setAudioLoaded] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  
  // Safely persist settings to localStorage
  const safelyPersistToStorage = useCallback((key, value) => {
    saveToStorage(key, value);
  }, []);
  
  useEffect(() => {
    safelyPersistToStorage('sentinel-connection-settings', persistedSettings);
  }, [persistedSettings, safelyPersistToStorage]);
  
  useEffect(() => {
    safelyPersistToStorage('sentinel-sound-enabled', soundEnabled);
  }, [soundEnabled, safelyPersistToStorage]);
  
  useEffect(() => {
    safelyPersistToStorage('sentinel-notifications-enabled', notificationsEnabled);
  }, [notificationsEnabled, safelyPersistToStorage]);
  
  useEffect(() => {
    safelyPersistToStorage('sentinel-sound-volume', soundVolume);
  }, [soundVolume, safelyPersistToStorage]);

  // Load audio with better error handling
  useEffect(() => {
    const initAudio = async () => {
      try {
        await loadAlertSound();
        setAudioLoaded(true);
        setAudioError(null);
      } catch (error) {
        console.error('Failed to initialize audio:', error);
        setAudioLoaded(false);
        setAudioError('Failed to load alert sound');
      }
    };
    
    initAudio();
  }, []);
  
  const { 
    isConnected,
    isLoading,
    error,
    connectionError,
    lastUpdated,
    threatData,
    blockchainData,
    threatStats,
    reconnectAttempts,
    isReconnecting,
    usingFallbackData,
    threatApiConnected,
    blockchainApiConnected,
    connectToSources,
    disconnect,
    fetchThreatData,
    fetchBlockchainData
  } = useThreatData(persistedSettings);
  
  const toggleSound = useCallback(() => {
    setSoundEnabled(!soundEnabled);
  }, [soundEnabled]);
  
  // Connect to sources when settings are available and connection is not active
  useEffect(() => {
    if (persistedSettings.apiUrl && persistedSettings.blockchainUrl && !isConnected && !isLoading && !isReconnecting) {
      try {
        console.log('Attempting to connect with stored settings');
        connectToSources();
      } catch (error) {
        console.error('Error connecting to sources:', error);
      }
    }
  }, [persistedSettings, isConnected, isLoading, isReconnecting, connectToSources]);
  
  // Handle high severity threats for alerts
  useEffect(() => {
    if (!threatData.length || !notificationsEnabled) return;
    
    try {
      const highSeverityThreats = threatData
        .filter(threat => 
          threat.severity === 'High' && 
          threat.status !== 'Mitigated' && 
          !alertHistory.includes(threat.id)
        );
      
      if (highSeverityThreats.length > 0) {
        setCurrentAlert(highSeverityThreats[0]);
        setAlertHistory(prev => [...prev, highSeverityThreats[0].id]);
        
        // Play sound for high severity threats if enabled
        if (soundEnabled && audioLoaded) {
          playAlertSound({ soundEnabled, soundVolume });
        }
      }
    } catch (error) {
      console.error('Error processing threats for alerts:', error);
    }
  }, [threatData, notificationsEnabled, alertHistory, soundEnabled, soundVolume, audioLoaded]);
  
  // Safely validate URLs and connect
  const handleConnect = useCallback((apiKey: string, apiUrl: string, blockchainUrl: string) => {
    try {
      // Store the new settings
      const newSettings = { apiKey, apiUrl, blockchainUrl };
      setPersistedSettings(newSettings);
      
      // Try to connect with the new settings
      connectToSources();
    } catch (err) {
      console.error("Error in handleConnect:", err);
    }
  }, [connectToSources]);
  
  const handleDisconnect = useCallback(() => {
    disconnect();
  }, [disconnect]);
  
  const handleReset = useCallback(() => {
    const newSettings = { apiKey: '', apiUrl: '', blockchainUrl: '' };
    setPersistedSettings(newSettings);
    disconnect();
  }, [disconnect]);
  
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
          connectionError={connectionError}
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
                connectionError={connectionError}
                threatApiConnected={threatApiConnected}
                blockchainApiConnected={blockchainApiConnected}
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
                  {connectionError && (
                    <div className="text-red-500 p-4 bg-red-500/10 rounded-lg text-sm">
                      <AlertOctagon className="h-4 w-4 inline-block mr-2" />
                      {connectionError}
                    </div>
                  )}
                  <div className="flex justify-center">
                    <button 
                      onClick={() => document.getElementById('settings-trigger')?.click()}
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
