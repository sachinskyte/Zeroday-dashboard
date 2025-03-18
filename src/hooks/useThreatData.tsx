
import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';

export interface ThreatDetail {
  user_agent: string;
  method: string;
  url_path: string;
  source_port: number;
  destination_port: number;
}

export interface ThreatData {
  id: string;
  timestamp: string;
  ip: string;
  attack_type: string;
  severity: 'High' | 'Medium' | 'Low';
  status: string;
  details: ThreatDetail;
  // Optional coordinates for map display
  coordinates?: [number, number];
}

export interface BlockchainBlock {
  data: {
    message: string;
    type: string;
    // Other data can be added here
  };
  data_hash: string;
  hash: string;
  previous_hash: string;
  timestamp: string;
}

export interface BlockchainData {
  chain: BlockchainBlock[];
}

interface useThreatDataProps {
  apiKey?: string;
  apiUrl?: string;
  blockchainUrl?: string;
}

// Sample data for fallback when API fails
const FALLBACK_THREATS: ThreatData[] = [
  {
    id: "t1",
    timestamp: new Date().toISOString(),
    ip: "192.168.1.10",
    attack_type: "SQL Injection",
    severity: "High",
    status: "Active",
    details: {
      user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      method: "POST",
      url_path: "/admin/login",
      source_port: 49123,
      destination_port: 443
    },
    coordinates: [37.7749, -122.4194]
  },
  {
    id: "t2",
    timestamp: new Date(Date.now() - 300000).toISOString(),
    ip: "10.0.0.5",
    attack_type: "XSS",
    severity: "Medium",
    status: "Active",
    details: {
      user_agent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
      method: "GET",
      url_path: "/search?q=<script>",
      source_port: 52234,
      destination_port: 443
    },
    coordinates: [40.7128, -74.0060]
  },
  {
    id: "t3",
    timestamp: new Date(Date.now() - 600000).toISOString(),
    ip: "172.16.0.1",
    attack_type: "Brute Force",
    severity: "Medium",
    status: "Mitigated",
    details: {
      user_agent: "Python-urllib/3.9",
      method: "POST",
      url_path: "/wp-login.php",
      source_port: 36789,
      destination_port: 80
    },
    coordinates: [51.5074, -0.1278]
  }
];

const FALLBACK_BLOCKCHAIN: BlockchainData = {
  chain: [
    {
      data: {
        message: "Genesis Block",
        type: "genesis"
      },
      data_hash: "42ae1fa77dbaccb1c304a542e662c418556ea433147c38865626dd4e13bcc9be",
      hash: "29455a0da85c2037d0c6fbfbac5e9552121579d37b16c5c2d5d818087d2f9730",
      previous_hash: "0",
      timestamp: new Date(Date.now() - 86400000).toISOString()
    },
    {
      data: {
        message: "Security Event Detected",
        type: "threat"
      },
      data_hash: "64865c367b68e37a4b73bf7cfff551799f6b9532afebce80da2ff543b672b306",
      hash: "4711256be06ce53a633729cb4d17cc520b97b39ab20f761e60737ef395a29e20",
      previous_hash: "29455a0da85c2037d0c6fbfbac5e9552121579d37b16c5c2d5d818087d2f9730",
      timestamp: new Date(Date.now() - 3600000).toISOString()
    }
  ]
};

// Cache for IP coordinates to ensure consistency
const IP_CACHE: Record<string, [number, number]> = {};

// Function to generate realistic coordinates for IPs not in the cache
const getCoordinatesForIP = (ip: string): [number, number] => {
  if (IP_CACHE[ip]) {
    return IP_CACHE[ip];
  }
  
  // Generate realistic coordinates
  const lat = Math.random() * 140 - 70; // -70 to 70
  const lng = Math.random() * 340 - 170; // -170 to 170
  
  IP_CACHE[ip] = [lat, lng];
  return [lat, lng];
};

export const useThreatData = ({ apiKey, apiUrl, blockchainUrl }: useThreatDataProps) => {
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
  const [usingFallbackData, setUsingFallbackData] = useState(false);
  
  const intervalRef = useRef<number | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // Keep track of seen threat IDs to detect new threats
  const seenThreatIdsRef = useRef<Set<string>>(new Set());
  const previousThreatDataRef = useRef<ThreatData[]>([]);
  
  const fetchThreatData = useCallback(async () => {
    if (!apiUrl) return { newThreats: [], success: false };
    
    // Cancel any in-progress requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create a new AbortController for this request
    abortControllerRef.current = new AbortController();
    
    try {
      const headers: HeadersInit = {};
      if (apiKey) {
        headers['Authorization'] = `Bearer ${apiKey}`;
      }
      
      console.log(`Fetching threat data from: ${apiUrl}`);
      const response = await fetch(apiUrl, { 
        headers,
        signal: abortControllerRef.current.signal,
        // Add cache busting parameter to prevent caching
        cache: 'no-store'
      });
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data: ThreatData[] = await response.json();
      
      // Check if data structure is valid
      if (!Array.isArray(data)) {
        console.error("Invalid data format received:", data);
        throw new Error("Invalid data format received from API");
      }
      
      // Add coordinates to each threat for map visualization
      const enrichedData = data.map(threat => ({
        ...threat,
        coordinates: getCoordinatesForIP(threat.ip)
      }));
      
      // Check if there are actual changes to avoid unnecessary re-renders
      const currentDataJson = JSON.stringify(enrichedData);
      const previousDataJson = JSON.stringify(previousThreatDataRef.current);
      
      if (currentDataJson === previousDataJson && previousThreatDataRef.current.length > 0) {
        // Data hasn't changed, don't update state
        return { newThreats: [], success: true, unchanged: true };
      }
      
      // Check for new threats
      const currentThreatIds = new Set(enrichedData.map(t => t.id));
      const newThreats = enrichedData.filter(t => !seenThreatIdsRef.current.has(t.id));
      
      // Update seen threat IDs
      enrichedData.forEach(t => seenThreatIdsRef.current.add(t.id));
      
      // Store current data for future comparison
      previousThreatDataRef.current = enrichedData;
      
      setThreatData(enrichedData);
      setLastUpdated(new Date());
      setLastSuccessfulFetch(new Date());
      setUsingFallbackData(false);
      
      // Reset reconnect state on successful fetch
      if (isReconnecting) {
        setIsReconnecting(false);
        setReconnectAttempts(0);
        toast.success('Reconnected to threat data source');
      }
      
      // If we weren't connected before, set connected now
      if (!isConnected) {
        setIsConnected(true);
        setConnectionError(null);
      }
      
      // Return new threats for notification purposes
      return { newThreats, success: true };
    } catch (err) {
      // Only set error if it's not an abort error
      if (err instanceof Error && err.name !== 'AbortError') {
        console.error("Error fetching threat data:", err.message);
        setError(err.message);
        
        if (isConnected && !isReconnecting) {
          setIsReconnecting(true);
          toast.error('Connection to threat API lost. Attempting to reconnect...');
        }
        
        // If no data exists yet, use fallback data
        if (threatData.length === 0 && !usingFallbackData) {
          console.log("Using fallback threat data");
          setThreatData(FALLBACK_THREATS);
          setUsingFallbackData(true);
          toast.warning('Using sample threat data for demonstration');
        }
        
        // If it was connected but now it's not, start reconnect process
        if (isConnected) {
          scheduleReconnect();
        }
        
        return { newThreats: [], success: false };
      }
      return { newThreats: [], success: false, aborted: true };
    }
  }, [apiUrl, apiKey, isConnected, isReconnecting, usingFallbackData, threatData.length]);
  
  const fetchBlockchainData = useCallback(async () => {
    if (!blockchainUrl) return { success: false };
    
    try {
      console.log(`Fetching blockchain data from: ${blockchainUrl}`);
      const response = await fetch(blockchainUrl, {
        // Add cache busting parameter to prevent caching
        cache: 'no-store'
      });
      
      if (!response.ok) {
        throw new Error(`Blockchain request failed with status ${response.status}`);
      }
      
      let data;
      try {
        data = await response.json();
      } catch (e) {
        console.error("Error parsing blockchain response as JSON:", e);
        throw new Error("Invalid JSON response from blockchain API");
      }
      
      // Validate blockchain data structure
      if (!data || !data.chain || !Array.isArray(data.chain)) {
        console.error("Invalid blockchain data format:", data);
        throw new Error("Invalid blockchain data format");
      }
      
      setBlockchainData(data);
      setLastUpdated(new Date());
      setLastSuccessfulFetch(new Date());
      setUsingFallbackData(false);
      
      return { success: true };
    } catch (err) {
      if (err instanceof Error) {
        console.error("Error fetching blockchain data:", err.message);
        setError(err.message);
        
        if (isConnected && !isReconnecting) {
          setIsReconnecting(true);
          toast.error('Connection to blockchain lost. Attempting to reconnect...');
        }
        
        // If no blockchain data exists yet, use fallback data
        if (!blockchainData && !usingFallbackData) {
          console.log("Using fallback blockchain data");
          setBlockchainData(FALLBACK_BLOCKCHAIN);
          setUsingFallbackData(true);
        }
        
        // If it was connected but now it's not, start reconnect process
        if (isConnected) {
          scheduleReconnect();
        }
        
        return { success: false };
      }
      return { success: false };
    }
  }, [blockchainUrl, isConnected, isReconnecting, blockchainData, usingFallbackData]);
  
  const scheduleReconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      window.clearTimeout(reconnectTimeoutRef.current);
    }
    
    // Exponential backoff for reconnect attempts (1s, 2s, 4s, 8s, etc., max 30s)
    const delay = Math.min(Math.pow(2, reconnectAttempts) * 1000, 30000);
    
    reconnectTimeoutRef.current = window.setTimeout(() => {
      setReconnectAttempts(prev => prev + 1);
      Promise.all([
        fetchThreatData(),
        fetchBlockchainData()
      ]);
    }, delay);
    
  }, [reconnectAttempts, fetchThreatData, fetchBlockchainData]);
  
  const disconnect = useCallback(() => {
    // Cancel any in-progress requests
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
    setIsReconnecting(false);
    setReconnectAttempts(0);
    toast.info('Disconnected from data sources');
  }, []);
  
  const connectToSources = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setConnectionError(null);
    
    // Validate URLs before attempting connection
    try {
      if (apiUrl) new URL(apiUrl);
      if (blockchainUrl) new URL(blockchainUrl);
    } catch (err) {
      setConnectionError("Invalid URL format. Please check your connection settings.");
      setIsLoading(false);
      toast.error('Invalid URL format');
      return;
    }
    
    // Clear any existing interval and timeout
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    if (reconnectTimeoutRef.current) {
      window.clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    try {
      const results = await Promise.all([
        fetchThreatData(),
        fetchBlockchainData()
      ]);
      
      const allSuccessful = results.every(result => result?.success);
      
      if (allSuccessful) {
        setIsConnected(true);
        setIsReconnecting(false);
        setReconnectAttempts(0);
        toast.success('Successfully connected to data sources');
        
        // Set up polling every 5 seconds (reduced from 10 for more real-time updates)
        intervalRef.current = window.setInterval(() => {
          fetchThreatData();
          fetchBlockchainData();
        }, 5000);
      } else {
        setConnectionError("Failed to connect to one or more data sources. Check network and URLs.");
        toast.error('Failed to connect to one or more data sources');
        
        // Use fallback data for demo purposes
        if (threatData.length === 0) {
          setThreatData(FALLBACK_THREATS);
          setUsingFallbackData(true);
        }
        
        if (!blockchainData) {
          setBlockchainData(FALLBACK_BLOCKCHAIN);
          setUsingFallbackData(true);
        }
        
        setIsConnected(false);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Connection failed';
      setConnectionError(errorMessage);
      setError(errorMessage);
      setIsConnected(false);
      toast.error('Failed to connect to data sources');
      
      // Use fallback data
      if (threatData.length === 0) {
        setThreatData(FALLBACK_THREATS);
        setUsingFallbackData(true);
      }
      
      if (!blockchainData) {
        setBlockchainData(FALLBACK_BLOCKCHAIN);
        setUsingFallbackData(true);
      }
    } finally {
      setIsLoading(false);
    }
  }, [fetchThreatData, fetchBlockchainData, apiUrl, blockchainUrl, threatData.length, blockchainData]);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }
      
      if (reconnectTimeoutRef.current) {
        window.clearTimeout(reconnectTimeoutRef.current);
      }
      
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);
  
  // Check for stale data periodically
  useEffect(() => {
    const staleDataCheck = setInterval(() => {
      if (isConnected && lastSuccessfulFetch) {
        const now = new Date();
        const timeSinceLastFetch = now.getTime() - lastSuccessfulFetch.getTime();
        
        // If last successful fetch was more than 15 seconds ago, try reconnecting
        if (timeSinceLastFetch > 15000 && !isReconnecting) {
          setIsReconnecting(true);
          scheduleReconnect();
        }
      }
    }, 5000);
    
    return () => clearInterval(staleDataCheck);
  }, [isConnected, lastSuccessfulFetch, isReconnecting, scheduleReconnect]);
  
  // Statistics calculations with error handling
  const threatStats = {
    total: threatData.length || 0,
    high: threatData.filter(t => t.severity === 'High').length || 0,
    medium: threatData.filter(t => t.severity === 'Medium').length || 0,
    low: threatData.filter(t => t.severity === 'Low').length || 0,
    mitigated: threatData.filter(t => t.status === 'Mitigated').length || 0,
    active: threatData.filter(t => t.status !== 'Mitigated').length || 0,
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
    usingFallbackData,
    connectToSources,
    disconnect,
    fetchThreatData,
    fetchBlockchainData
  };
};
