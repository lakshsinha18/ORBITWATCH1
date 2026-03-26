import { AlertInfo } from '../hooks/useOrbitData';
import { AlertOctagon, Info } from 'lucide-react';

export function AlertPanel({ alerts }: { alerts: AlertInfo[] }) {
  if (alerts.length === 0) {
    return (
      <div className="glass-panel rounded-xl p-4 border border-emerald-500/30 h-64 flex flex-col items-center justify-center text-emerald-400/70">
        <ShieldCheckIcon />
        <p className="mt-2 text-sm">Spaceway Clear. No Collision Risks Detected.</p>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-xl flex flex-col h-full border border-red-500/30 neon-border-red">
      <div className="p-4 border-b border-red-500/20 bg-red-950/20 rounded-t-xl flex justify-between items-center">
        <h2 className="text-lg font-bold text-red-400 flex items-center gap-2">
          <AlertOctagon className="w-5 h-5 animate-pulse" />
          Active Collision Alerts
        </h2>
        <span className="bg-red-500/20 text-red-400 text-xs px-2 py-1 rounded-full border border-red-500/50">
          {alerts.length} Detected
        </span>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {alerts.map((alert, idx) => (
          <div key={idx} className="bg-red-950/30 border border-red-500/40 rounded-lg p-3 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
            
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-bold text-red-300 text-sm">
                {alert.satellite1} <span className="text-gray-500 text-xs mx-1">vs</span> {alert.satellite2}
              </h4>
              <span className="text-xs text-red-400 font-mono ring-1 ring-red-500/50 px-1 rounded bg-red-900/40">
                T-{alert.timeToImpactSec}s
              </span>
            </div>
            
            <p className="text-xs text-gray-300 mb-2">
              {alert.message}
            </p>

            <div className="bg-black/40 rounded p-2 text-xs text-gray-400 flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <span>
                <span className="text-blue-300 font-semibold">Intelligence Insight: </span>
                High risk detected due to dangerously close intersecting trajectories. Evasive maneuver highly recommended.
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ShieldCheckIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
