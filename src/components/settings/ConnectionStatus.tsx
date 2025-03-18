
import { Signal, Loader2, Server, AlertTriangle } from 'lucide-react';

interface ConnectionStatusProps {
  isConnected: boolean;
  lastUpdated: Date | null;
  isReconnecting: boolean;
  reconnectAttempts: number;
  usingFallbackData: boolean;
}

export const ConnectionStatus = ({
  isConnected,
  lastUpdated,
  isReconnecting,
  reconnectAttempts,
  usingFallbackData
}: ConnectionStatusProps) => {
  return (
    <div className="flex items-center justify-between p-2 rounded-md bg-muted/30 text-xs">
      <div className="flex items-center">
        {isReconnecting ? (
          <>
            <Loader2 className="h-3.5 w-3.5 text-warning animate-spin mr-1.5" />
            <span className="text-warning">Reconnecting...</span>
            {reconnectAttempts > 0 && (
              <span className="ml-1 text-muted-foreground">
                (Attempt {reconnectAttempts})
              </span>
            )}
          </>
        ) : isConnected ? (
          <>
            <Signal className="h-3.5 w-3.5 text-success mr-1.5" />
            <span className="text-success">Connected</span>
          </>
        ) : (
          <>
            <AlertTriangle className="h-3.5 w-3.5 text-destructive mr-1.5" />
            <span className="text-destructive">Disconnected</span>
          </>
        )}
      </div>
      
      <div className="flex items-center">
        {usingFallbackData && (
          <div className="flex items-center mr-3 bg-warning/10 text-warning px-1.5 py-0.5 rounded">
            <Server className="h-3 w-3 mr-1" />
            <span>Using demo data</span>
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
