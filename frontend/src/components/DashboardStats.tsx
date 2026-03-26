import { PositionInfo, AlertInfo } from '../hooks/useOrbitData';
import { Activity, ShieldAlert, ShieldCheck, UserCheck } from 'lucide-react';

export function DashboardStats({ satellites, alerts }: { satellites: PositionInfo[], alerts: AlertInfo[] }) {
  const total = satellites.length;
  const highRisks = satellites.filter(s => s.status === 'High Risk').length;
  const mediumRisks = satellites.filter(s => s.status === 'Medium Risk').length;
  const safe = satellites.filter(s => s.status === 'Safe').length;

  return (
    <div className="grid grid-cols-4 gap-4 mb-4">
      <div className="glass-panel p-4 rounded-xl flex items-center justify-between neon-border-blue border">
        <div>
          <p className="text-gray-400 text-xs uppercase tracking-wider">Total Tracked</p>
          <h3 className="text-2xl font-bold text-blue-400 neon-text-blue">{total}</h3>
        </div>
        <Activity className="text-blue-500 w-8 h-8 opacity-50" />
      </div>

      <div className="glass-panel p-4 rounded-xl flex items-center justify-between border border-emerald-500/30">
        <div>
          <p className="text-gray-400 text-xs uppercase tracking-wider">Safe Orbit</p>
          <h3 className="text-2xl font-bold text-emerald-400">{safe}</h3>
        </div>
        <ShieldCheck className="text-emerald-500 w-8 h-8 opacity-50" />
      </div>

      <div className="glass-panel p-4 rounded-xl flex items-center justify-between border border-yellow-500/30">
        <div>
          <p className="text-gray-400 text-xs uppercase tracking-wider">Warnings</p>
          <h3 className="text-2xl font-bold text-yellow-400">{mediumRisks}</h3>
        </div>
        <ShieldAlert className="text-yellow-500 w-8 h-8 opacity-50" />
      </div>

      <div className={`glass-panel p-4 rounded-xl flex items-center justify-between border ${highRisks > 0 ? 'neon-border-red' : 'border-red-500/30'}`}>
        <div>
          <p className="text-gray-400 text-xs uppercase tracking-wider">Critical Risk</p>
          <h3 className="text-2xl font-bold text-red-400 neon-text-red">{highRisks}</h3>
        </div>
        <Activity className="text-red-500 w-8 h-8 opacity-50 animate-pulse" />
      </div>
    </div>
  );
}
