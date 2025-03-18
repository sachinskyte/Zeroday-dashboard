
import { useState } from 'react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { SettingsPanel } from '@/features/settings/SettingsPanel';
import { AlertTriangle, Bell, BellOff, Settings, Shield, Volume2, VolumeX } from 'lucide-react';

interface HeaderProps {
  isConnected: boolean;
  connectionSettings: {
    apiKey: string;
    apiUrl: string;
    blockchainUrl: string;
  };
  onConnect: (apiKey: string, apiUrl: string, blockchainUrl: string) => void;
  onDisconnect: () => void;
  onReset: () => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  notificationsEnabled: boolean;
  setNotificationsEnabled: (enabled: boolean) => void;
  soundVolume: number;
  setSoundVolume: (volume: number) => void;
  connectionError: string | null;
}

const Header = ({
  isConnected,
  connectionSettings,
  onConnect,
  onDisconnect,
  onReset,
  soundEnabled,
  setSoundEnabled,
  notificationsEnabled,
  setNotificationsEnabled,
  soundVolume,
  setSoundVolume,
  connectionError
}: HeaderProps) => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  
  return (
    <header className="fixed top-0 left-0 right-0 dark-nav z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Shield className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-semibold">Sentinel</h1>
          
          {isConnected && (
            <span className="ml-2 text-xs px-2 py-0.5 bg-green-500/20 text-green-500 rounded-full">
              Connected
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            title={soundEnabled ? "Mute sounds" : "Enable sounds"}
            onClick={() => setSoundEnabled(!soundEnabled)}
          >
            {soundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5 text-muted-foreground" />}
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            title={notificationsEnabled ? "Disable notifications" : "Enable notifications"}
            onClick={() => setNotificationsEnabled(!notificationsEnabled)}
          >
            {notificationsEnabled ? <Bell className="h-5 w-5" /> : <BellOff className="h-5 w-5 text-muted-foreground" />}
          </Button>
          
          <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
            <DialogTrigger asChild>
              <Button 
                id="settings-trigger"
                variant={connectionError ? "destructive" : "outline"} 
                size="sm"
                className="flex items-center"
              >
                {connectionError && <AlertTriangle className="h-4 w-4 mr-2" />}
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <SettingsPanel
                connectionSettings={connectionSettings}
                isConnected={isConnected}
                onConnect={onConnect}
                onDisconnect={onDisconnect}
                onReset={onReset}
                soundEnabled={soundEnabled}
                setSoundEnabled={setSoundEnabled}
                notificationsEnabled={notificationsEnabled}
                setNotificationsEnabled={setNotificationsEnabled}
                soundVolume={soundVolume}
                setSoundVolume={setSoundVolume}
                connectionError={connectionError}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </header>
  );
};

export default Header;
