
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Network, Shield, Volume2, Bell, Trash2, Settings, Wifi, RefreshCcw, Save, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { isValidUrl } from '@/utils/dataUtils';

interface SettingsPanelProps {
  connectionSettings: {
    apiKey: string;
    apiUrl: string;
    blockchainUrl: string;
  };
  isConnected: boolean;
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

export const SettingsPanel = ({
  connectionSettings,
  isConnected,
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
}: SettingsPanelProps) => {
  const [apiKey, setApiKey] = useState(connectionSettings.apiKey);
  const [apiUrl, setApiUrl] = useState(connectionSettings.apiUrl);
  const [blockchainUrl, setBlockchainUrl] = useState(connectionSettings.blockchainUrl);
  const [errors, setErrors] = useState<{
    apiUrl?: string;
    blockchainUrl?: string;
  }>({});
  
  const validateInputs = () => {
    const newErrors: {
      apiUrl?: string;
      blockchainUrl?: string;
    } = {};
    
    if (!apiUrl) {
      newErrors.apiUrl = "API URL is required";
    } else if (!isValidUrl(apiUrl)) {
      newErrors.apiUrl = "Invalid URL format";
    }
    
    if (!blockchainUrl) {
      newErrors.blockchainUrl = "Blockchain URL is required";
    } else if (!isValidUrl(blockchainUrl)) {
      newErrors.blockchainUrl = "Invalid URL format";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleConnect = () => {
    if (!validateInputs()) return;
    
    try {
      onConnect(apiKey, apiUrl, blockchainUrl);
      toast.success('Connection settings saved');
    } catch (error) {
      toast.error('Failed to connect');
    }
  };
  
  const handleDisconnect = () => {
    onDisconnect();
    toast.info('Disconnected from services');
  };
  
  const handleReset = () => {
    setApiKey('');
    setApiUrl('');
    setBlockchainUrl('');
    onReset();
    toast.info('Settings reset to default');
  };
  
  return (
    <Tabs defaultValue="connection" className="w-full">
      <TabsList className="grid grid-cols-3 mb-4">
        <TabsTrigger value="connection" className="flex items-center gap-2">
          <Network className="h-4 w-4" />
          <span className="hidden sm:inline">Connection</span>
        </TabsTrigger>
        <TabsTrigger value="notifications" className="flex items-center gap-2">
          <Bell className="h-4 w-4" />
          <span className="hidden sm:inline">Notifications</span>
        </TabsTrigger>
        <TabsTrigger value="about" className="flex items-center gap-2">
          <Shield className="h-4 w-4" />
          <span className="hidden sm:inline">About</span>
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="connection">
        <Card>
          <CardHeader>
            <CardTitle>Connection Settings</CardTitle>
            <CardDescription>
              Configure your threat intelligence API and blockchain connections
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {connectionError && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-md text-red-500 text-sm mb-4">
                <div className="flex items-start">
                  <X className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                  <div>{connectionError}</div>
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key (Optional)</Label>
              <Input 
                id="apiKey" 
                placeholder="Your API key" 
                value={apiKey} 
                onChange={(e) => setApiKey(e.target.value)} 
                type="password"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="apiUrl">
                Threat API URL <span className="text-red-500">*</span>
              </Label>
              <Input 
                id="apiUrl" 
                placeholder="https://api.example.com/threats" 
                value={apiUrl} 
                onChange={(e) => {
                  setApiUrl(e.target.value);
                  if (errors.apiUrl) {
                    setErrors({ ...errors, apiUrl: undefined });
                  }
                }}
                className={errors.apiUrl ? "border-red-500" : ""}
              />
              {errors.apiUrl && (
                <p className="text-red-500 text-xs mt-1">{errors.apiUrl}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="blockchainUrl">
                Blockchain URL <span className="text-red-500">*</span>
              </Label>
              <Input 
                id="blockchainUrl" 
                placeholder="https://api.example.com/blockchain" 
                value={blockchainUrl} 
                onChange={(e) => {
                  setBlockchainUrl(e.target.value);
                  if (errors.blockchainUrl) {
                    setErrors({ ...errors, blockchainUrl: undefined });
                  }
                }}
                className={errors.blockchainUrl ? "border-red-500" : ""}
              />
              {errors.blockchainUrl && (
                <p className="text-red-500 text-xs mt-1">{errors.blockchainUrl}</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleReset}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Reset
              </Button>
              
              {isConnected && (
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={handleDisconnect}
                >
                  <Wifi className="h-4 w-4 mr-2" />
                  Disconnect
                </Button>
              )}
            </div>
            
            <Button 
              onClick={handleConnect} 
              disabled={!apiUrl || !blockchainUrl}
            >
              {isConnected ? (
                <>
                  <RefreshCcw className="h-4 w-4 mr-2" />
                  Update Connection
                </>
              ) : (
                <>
                  <Wifi className="h-4 w-4 mr-2" />
                  Connect
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>
      
      <TabsContent value="notifications">
        <Card>
          <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
            <CardDescription>
              Configure alerts and notification preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notifications">Alert Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Show notifications for high severity threats
                </p>
              </div>
              <Switch
                id="notifications"
                checked={notificationsEnabled}
                onCheckedChange={setNotificationsEnabled}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="sound">Sound Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Play sound when high severity threats are detected
                </p>
              </div>
              <Switch 
                id="sound" 
                checked={soundEnabled} 
                onCheckedChange={setSoundEnabled}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="volume">Alert Volume</Label>
                <span className="text-sm text-muted-foreground">{soundVolume}%</span>
              </div>
              <Slider
                id="volume"
                disabled={!soundEnabled}
                min={0}
                max={100}
                step={1}
                value={[soundVolume]}
                onValueChange={(value) => setSoundVolume(value[0])}
                className={!soundEnabled ? "opacity-50" : ""}
              />
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="about">
        <Card>
          <CardHeader>
            <CardTitle>About Sentinel</CardTitle>
            <CardDescription>
              Cybersecurity threat monitoring and blockchain verification
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center my-4">
              <Shield className="h-16 w-16 text-primary opacity-80" />
            </div>
            
            <div className="space-y-2 text-sm">
              <h3 className="font-medium">Features:</h3>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                <li>Real-time threat monitoring</li>
                <li>Immutable blockchain verification</li>
                <li>Geographic attack visualization</li>
                <li>Trend analysis and reporting</li>
                <li>Configurable alerts and notifications</li>
              </ul>
            </div>
            
            <div className="pt-4">
              <p className="text-xs text-muted-foreground text-center">
                Version 1.0.0 • Created with ❤️ by the Security Team
              </p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default SettingsPanel;
