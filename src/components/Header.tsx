
import { useState, useEffect } from 'react';
import { Shield } from 'lucide-react';
import { SettingsPanel } from './settings/SettingsPanel';
import { Button } from "@/components/ui/button";

interface HeaderProps {
  isConnected: boolean;
  connectionSettings: {
    apiKey: string;
    apiUrl: string;
    blockchainUrl: string;
  };
  onDisconnect: () => void;
  onReset: () => void;
  onConnect: (apiKey: string, apiUrl: string, blockchainUrl: string) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  notificationsEnabled: boolean;
  setNotificationsEnabled: (enabled: boolean) => void;
  soundVolume: number;
  setSoundVolume: (volume: number) => void;
  connectionError?: string | null;
}

const Header = ({
  isConnected,
  connectionSettings,
  onDisconnect,
  onReset,
  onConnect,
  soundEnabled,
  setSoundEnabled,
  notificationsEnabled,
  setNotificationsEnabled,
  soundVolume,
  setSoundVolume,
  connectionError
}: HeaderProps) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Update current time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <header className="fixed top-0 left-0 right-0 z-10 dark-nav">
      <div className="container mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        <div className="flex items-center">
          <Shield className="h-6 w-6 text-primary mr-2" />
          <h1 className="text-lg font-medium">Sentinel</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="hidden md:block text-sm text-muted-foreground">
            {currentTime.toLocaleTimeString(undefined, { 
              hour: '2-digit', 
              minute: '2-digit', 
              second: '2-digit',
              hour12: false
            })}
          </div>
        </div>
      </div>
      
      {/* Settings panel moved outside the header for better positioning */}
      <div id="settings-trigger">
        <SettingsPanel 
          connectionSettings={connectionSettings}
          isConnected={isConnected}
          onDisconnect={onDisconnect}
          onReset={onReset}
          onConnect={onConnect}
          soundEnabled={soundEnabled}
          setSoundEnabled={setSoundEnabled}
          notificationsEnabled={notificationsEnabled}
          setNotificationsEnabled={setNotificationsEnabled}
          soundVolume={soundVolume}
          setSoundVolume={setSoundVolume}
          connectionError={connectionError}
        />
      </div>
    </header>
  );
};

export default Header;
