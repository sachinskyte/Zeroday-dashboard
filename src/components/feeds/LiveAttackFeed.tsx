import { useState, useRef, useEffect } from 'react';
import { format } from 'date-fns';
import { Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ThreatData } from '@/hooks/useThreatData';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion, AnimatePresence } from 'framer-motion';

interface LiveAttackFeedProps {
  threats: ThreatData[];
}

export const LiveAttackFeed = ({ threats }: LiveAttackFeedProps) => {
  const [displayedThreats, setDisplayedThreats] = useState<ThreatData[]>([]);
  const threatsRef = useRef<ThreatData[]>([]);
  
  // Keep track of which threat IDs we've already seen
  const seenThreatsRef = useRef(new Set<string>());
  
  useEffect(() => {
    threatsRef.current = threats;
    
    // Identify new threats
    const newThreats = threats.filter(threat => !seenThreatsRef.current.has(threat.id));
    
    // Update the set of seen threats
    newThreats.forEach(threat => {
      seenThreatsRef.current.add(threat.id);
    });
    
    // Sort all threats by timestamp, newest first
    const sortedThreats = [...threats].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    setDisplayedThreats(sortedThreats);
  }, [threats]);
  
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'High':
        return 'text-red-500';
      case 'Medium':
        return 'text-amber-500';
      case 'Low':
        return 'text-blue-500';
      default:
        return 'text-muted-foreground';
    }
  };
  
  const getStatusIcon = (status: string) => {
    if (status === 'Mitigated') {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    return <AlertTriangle className="h-4 w-4 text-red-500" />;
  };
  
  if (!displayedThreats.length) {
    return (
      <Card className="h-full animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 text-primary mr-2" />
            Live Attack Feed
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[calc(100%-60px)] flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p>No threat data available</p>
            <p className="text-xs mt-1">Connect to your threat data source to view attacks</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="h-full animate-fade-in">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center">
          <Shield className="h-5 w-5 text-primary mr-2" />
          Live Attack Feed
          <span className="ml-auto text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
            {displayedThreats.length} events
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 pt-2 h-[calc(100%-64px)]">
        <ScrollArea className="h-full px-4 pb-4">
          <AnimatePresence initial={false}>
            {displayedThreats.map((threat) => {
              const time = new Date(threat.timestamp);
              const isRecent = Date.now() - time.getTime() < 30000; // 30 seconds
              
              return (
                <motion.div
                  key={threat.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className={`mb-3 p-3 rounded-md border border-border/50 ${
                    isRecent ? 'bg-primary/5 animate-highlight' : 'bg-card'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-2 ${
                        threat.status === 'Mitigated' ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                      <span className="text-sm font-medium">{threat.attack_type}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${
                        getSeverityColor(threat.severity)
                      } bg-${
                        threat.severity === 'High' ? 'red' : 
                        threat.severity === 'Medium' ? 'amber' : 'blue'
                      }-500/10`}>
                        {threat.severity}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {format(time, 'HH:mm:ss')}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-muted-foreground">
                    <div>
                      <span className="inline-block w-12 text-muted-foreground">Source:</span>
                      <span className="font-mono">{threat.ip}</span>
                    </div>
                    <div className="flex items-center">
                      {getStatusIcon(threat.status)}
                      <span className="ml-1">
                        {threat.status}
                      </span>
                    </div>
                  </div>
                  
                  {threat.details && (
                    <div className="mt-2 text-xs border-t border-border/40 pt-2">
                      <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                        <div>
                          <span className="text-muted-foreground">Method:</span>{' '}
                          <span className="font-mono">{threat.details.method}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Path:</span>{' '}
                          <span className="font-mono truncate block">{threat.details.url_path}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Port:</span>{' '}
                          <span className="font-mono">{threat.details.source_port} → {threat.details.destination_port}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default LiveAttackFeed;
