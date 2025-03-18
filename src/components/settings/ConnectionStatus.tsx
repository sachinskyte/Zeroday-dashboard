
import { Signal, Loader2, Server, AlertTriangle, Database, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConnectionStatusProps {
  isConnected: boolean;
  lastUpdated: Date | null;
  isReconnecting: boolean;
  reconnectAttempts: number;
  usingFallbackData: boolean;
  connectionError?: string | null;
  threatApiConnected?: boolean;
  blockchainApiConnected?: boolean;
}

export const ConnectionStatus = ({
  isConnected,
  lastUpdated,
  isReconnecting,
  reconnectAttempts,
  usingFallbackData,
  connectionError,
  threatApiConnected = true,
  blockchainApiConnected = true
}: ConnectionStatusProps) => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 rounded-md bg-muted/30 text-xs space-y-2 sm:space-y-0">
      <div className="flex items-center space-x-3">
        {isReconnecting ? (
          <div className="flex items-center text-warning">
            <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
            <span>Reconnecting...</span>
            {reconnectAttempts > 0 && (
              <span className="ml-1 text-muted-foreground">
                (Attempt {reconnectAttempts})
              </span>
            )}
          </div>
        ) : isConnected ? (
          <div className="flex items-center text-success">
            <Signal className="h-3.5 w-3.5 mr-1.5" />
            <span>Connected</span>
          </div>
        ) : (
          <div className="flex items-center text-destructive">
            <AlertTriangle className="h-3.5 w-3.5 mr-1.5" />
            <span>Disconnected</span>
          </div>
        )}
        
        {/* Show specific API connection statuses when there's a problem */}
        {(isConnected || isReconnecting) && (!threatApiConnected || !blockchainApiConnected) && (
          <div className="flex space-x-3">
            <div className={cn(
              "flex items-center px-1.5 py-0.5 rounded",
              threatApiConnected ? "text-success bg-success/10" : "text-destructive bg-destructive/10"
            )}>
              <Globe className="h-3 w-3 mr-1" />
              <span>Threat API: {threatApiConnected ? "Connected" : "Disconnected"}</span>
            </div>

            <div className={cn(
              "flex items-center px-1.5 py-0.5 rounded",
              blockchainApiConnected ? "text-success bg-success/10" : "text-destructive bg-destructive/10"
            )}>
              <Database className="h-3 w-3 mr-1" />
              <span>Blockchain: {blockchainApiConnected ? "Connected" : "Disconnected"}</span>
            </div>
          </div>
        )}
      </div>
      
      <div className="flex items-center space-x-3">
        {usingFallbackData && (
          <div className="flex items-center bg-warning/10 text-warning px-1.5 py-0.5 rounded">
            <Server className="h-3 w-3 mr-1" />
            <span>Using demo data</span>
          </div>
        )}
        
        {connectionError && !isConnected && (
          <div className="flex items-center bg-destructive/10 text-destructive px-1.5 py-0.5 rounded max-w-xs truncate">
            <AlertTriangle className="h-3 w-3 mr-1 flex-shrink-0" />
            <span className="truncate">{connectionError}</span>
          </div>
        )}
        
        {lastUpdated && (
          <span className="text-muted-foreground">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </span>
        )}
      </div>
    </div>
  );
};

export default ConnectionStatus;
