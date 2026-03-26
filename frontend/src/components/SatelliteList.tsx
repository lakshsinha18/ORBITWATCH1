import { PositionInfo } from '../hooks/useOrbitData';
import { Search } from 'lucide-react';
import { useState } from 'react';

export function SatelliteList({ satellites }: { satellites: PositionInfo[] }) {
  const [search, setSearch] = useState('');
  
  const filtered = satellites.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'High Risk': return 'text-red-400 glow-dot-red';
      case 'Medium Risk': return 'text-yellow-400 glow-dot-yellow';
      case 'Low Risk': return 'text-blue-400 glow-dot-blue';
      default: return 'text-emerald-400 glow-dot-green';
    }
  };

  return (
    <div className="glass-panel rounded-xl flex flex-col h-full border border-gray-700/50">
      <div className="p-4 border-b border-gray-700/50">
        <h2 className="text-lg font-bold text-white mb-3">Live Telemetry</h2>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
          <input 
            type="text" 
            placeholder="Search satellite..." 
            className="w-full bg-gray-900/50 border border-gray-700 text-sm rounded-lg pl-9 pr-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {filtered.map(sat => (
          <div key={sat.name} className="bg-gray-800/40 rounded-lg p-3 hover:bg-gray-800/60 transition cursor-pointer border border-transparent hover:border-gray-600">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-semibold text-sm text-gray-200">{sat.name}</h4>
              <div className="flex items-center space-x-2">
                <span className={`w-2 h-2 rounded-full ${getStatusColor(sat.status)}`}></span>
                <span className="text-xs text-gray-400">{sat.status}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
              <div>
                <span className="text-gray-500">ALT:</span> {sat.alt.toFixed(1)} km
              </div>
              <div>
                <span className="text-gray-500">SPD:</span> {Math.sqrt(sat.vx*sat.vx + sat.vy*sat.vy + sat.vz*sat.vz).toFixed(1)} km/s
              </div>
              <div>
                <span className="text-gray-500">LAT:</span> {sat.lat.toFixed(2)}°
              </div>
              <div>
                <span className="text-gray-500">LNG:</span> {sat.lng.toFixed(2)}°
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
