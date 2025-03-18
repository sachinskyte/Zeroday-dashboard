
import { ShieldAlert, Shield, AlertTriangle, CheckCircle } from 'lucide-react';

interface ThreatStatsProps {
  total: number;
  high: number;
  medium: number;
  low: number;
  mitigated: number;
  active: number;
}

export const ThreatStats = ({ total, high, medium, low, mitigated, active }: ThreatStatsProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-4">
      <div className="bg-card rounded-lg p-4 shadow-sm border border-border/50">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground">Total Threats</h3>
          <ShieldAlert className="h-5 w-5 text-primary" />
        </div>
        <p className="text-2xl font-bold mt-2">{total.toLocaleString()}</p>
      </div>
      
      <div className="bg-card rounded-lg p-4 shadow-sm border border-border/50">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground">High Severity</h3>
          <AlertTriangle className="h-5 w-5 text-red-500" />
        </div>
        <p className="text-2xl font-bold mt-2 text-red-500">{high.toLocaleString()}</p>
      </div>
      
      <div className="bg-card rounded-lg p-4 shadow-sm border border-border/50">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground">Medium Severity</h3>
          <AlertTriangle className="h-5 w-5 text-amber-500" />
        </div>
        <p className="text-2xl font-bold mt-2 text-amber-500">{medium.toLocaleString()}</p>
      </div>
      
      <div className="bg-card rounded-lg p-4 shadow-sm border border-border/50">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground">Low Severity</h3>
          <AlertTriangle className="h-5 w-5 text-blue-500" />
        </div>
        <p className="text-2xl font-bold mt-2 text-blue-500">{low.toLocaleString()}</p>
      </div>
      
      <div className="bg-card rounded-lg p-4 shadow-sm border border-border/50">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground">Active Threats</h3>
          <ShieldAlert className="h-5 w-5 text-primary" />
        </div>
        <p className="text-2xl font-bold mt-2 text-primary">{active.toLocaleString()}</p>
      </div>
      
      <div className="bg-card rounded-lg p-4 shadow-sm border border-border/50">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground">Mitigated</h3>
          <CheckCircle className="h-5 w-5 text-green-500" />
        </div>
        <p className="text-2xl font-bold mt-2 text-green-500">{mitigated.toLocaleString()}</p>
      </div>
    </div>
  );
};

export default ThreatStats;
