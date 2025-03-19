import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';

export interface ThreatDetail {
  destination_port: number;
  flag: string;
  method: string;
  protocol: string;
  source_port: number;
  url_path: string;
  user_agent: string;
}

export interface ThreatData {
  attack_type: string;
  details: ThreatDetail;
  id: string;
  ip: string;
  severity: 'High' | 'Medium' | 'Low';
  status: string;
  timestamp: string;
}

export interface BlockchainBlock {
  data: ThreatData | { message: string; type: string };
  data_hash: string;
  hash: string;
  previous_hash: string;
  timestamp: string;
}

export interface BlockchainData {
  chain: BlockchainBlock[];
  length: number;
}

interface useThreatDataProps {
  apiKey?: string;
  apiUrl?: string;
  blockchainUrl?: string;
}

export const useThreatData = (settings: useThreatDataProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [threatData, setThreatData] = useState<ThreatData[]>([]);
  const [blockchainData, setBlockchainData] = useState<BlockchainData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [lastSuccessfulFetch, setLastSuccessfulFetch] = useState<Date | null>(null);
  
  const [blockchainConnected, setBlockchainConnected] = useState(false);
  
  const { blockchainUrl } = settings;
  
  const intervalRef = useRef<number | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const seenThreatIdsRef = useRef<Set<string>>(new Set());
  const previousThreatDataRef = useRef<ThreatData[]>([]);

  const processBlockchainData = (data: BlockchainData): ThreatData[] => {
    return data.chain
      .filter(block => 'attack_type' in block.data)
      .map(block => block.data as ThreatData);
  };

  const fetchBlockchainData = useCallback(async () => {
    if (!blockchainUrl) return { success: false };
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    
    try {
      const response = await fetch(blockchainUrl, {
        signal: abortControllerRef.current.signal,
        cache: 'no-store'
      });
      
      if (!response.ok) {
        throw new Error(`Blockchain request failed with status ${response.status}`);
      }
      
      const data: BlockchainData = await response.json();
      
      if (!data.chain || !Array.isArray(data.chain)) {
        throw new Error("Invalid blockchain data format");
      }
      
      const processedThreats = processBlockchainData(data);
      
      const currentDataJson = JSON.stringify(processedThreats);
      const previousDataJson = JSON.stringify(previousThreatDataRef.current);
      
      if (currentDataJson !== previousDataJson) {
        const newThreats = processedThreats.filter(t => !seenThreatIdsRef.current.has(t.id));
        processedThreats.forEach(t => seenThreatIdsRef.current.add(t.id));
        previousThreatDataRef.current = processedThreats;
        setThreatData(processedThreats);
      }
      
      setBlockchainData(data);
      setLastUpdated(new Date());
      setLastSuccessfulFetch(new Date());
      setBlockchainConnected(true);
      
      if (isReconnecting) {
        setIsReconnecting(false);
        setReconnectAttempts(0);
        toast.success('Reconnected to blockchain');
      }
      
      return { success: true };
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        console.error("Error fetching blockchain data:", err.message);
        setError(err.message);
        setBlockchainConnected(false);
        
        if (isConnected && !isReconnecting) {
          setIsReconnecting(true);
          toast.error('Connection to blockchain lost. Attempting to reconnect...');
        }
        
        scheduleReconnect();
      }
      return { success: false };
    }
  }, [blockchainUrl, isConnected, isReconnecting]);

  const scheduleReconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      window.clearTimeout(reconnectTimeoutRef.current);
    }
    
    const delay = Math.min(Math.pow(2, reconnectAttempts) * 1000, 30000);
    
    reconnectTimeoutRef.current = window.setTimeout(() => {
      setReconnectAttempts(prev => prev + 1);
      fetchBlockchainData();
    }, delay);
  }, [reconnectAttempts, fetchBlockchainData]);

  const disconnect = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    if (reconnectTimeoutRef.current) {
      window.clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    setIsConnected(false);
    setBlockchainConnected(false);
    setIsReconnecting(false);
    setReconnectAttempts(0);
    toast.info('Disconnected from blockchain');
  }, []);

  const connectToSources = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setConnectionError(null);
    
    try {
      if (blockchainUrl) new URL(blockchainUrl);
    } catch (err) {
      setConnectionError("Invalid blockchain URL");
      setIsLoading(false);
      toast.error('Invalid blockchain URL');
      return;
    }
    
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
    }
    
    try {
      const blockchainResult = await fetchBlockchainData();
      
      if (blockchainResult.success) {
        setIsConnected(true);
        intervalRef.current = window.setInterval(fetchBlockchainData, 5000);
        toast.success('Connected to blockchain');
      } else {
        setConnectionError("Failed to connect to blockchain");
        toast.error('Failed to connect to blockchain');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Connection failed';
      setConnectionError(errorMessage);
      setError(errorMessage);
      setIsConnected(false);
      setBlockchainConnected(false);
      toast.error('Failed to connect to blockchain');
    } finally {
      setIsLoading(false);
    }
  }, [fetchBlockchainData, blockchainUrl]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      if (reconnectTimeoutRef.current) window.clearTimeout(reconnectTimeoutRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, []);

  useEffect(() => {
    const staleDataCheck = setInterval(() => {
      if (isConnected && lastSuccessfulFetch) {
        const timeSinceLastFetch = Date.now() - lastSuccessfulFetch.getTime();
        if (timeSinceLastFetch > 15000 && !isReconnecting) {
          setIsReconnecting(true);
          scheduleReconnect();
        }
      }
    }, 5000);
    
    return () => clearInterval(staleDataCheck);
  }, [isConnected, lastSuccessfulFetch, isReconnecting, scheduleReconnect]);

  const threatStats = {
    total: threatData.length,
    high: threatData.filter(t => t.severity === 'High').length,
    medium: threatData.filter(t => t.severity === 'Medium').length,
    low: threatData.filter(t => t.severity === 'Low').length,
    mitigated: threatData.filter(t => t.status === 'Mitigated').length,
    active: threatData.filter(t => t.status !== 'Mitigated').length,
  };

  return {
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
    blockchainConnected,
    apiConnected: true,
    connectToSources,
    disconnect,
    fetchBlockchainData
  };
};