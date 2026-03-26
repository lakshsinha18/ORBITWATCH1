import { useOrbitData } from './hooks/useOrbitData';
import { DashboardStats } from './components/DashboardStats';
import { SatelliteList } from './components/SatelliteList';
import { AlertPanel } from './components/AlertPanel';
import { Activity } from 'lucide-react';
import { ThreeScene } from './components/ThreeScene';

function App() {
  const { satellites, alerts, isConnected } = useOrbitData();

  return (
    <div className="h-screen w-screen flex flex-col bg-[#030712] text-white overflow-hidden font-sans">
      
      {/* Background 3D Canvas will go here, behind everything */}
      <div className="absolute inset-0 z-0 pointer-events-auto">
        <ThreeScene satellites={satellites} />
      </div>

      {/* Main UI Overlay - High Z-index */}
      <div className="relative z-10 flex flex-col h-full pointer-events-none p-4 w-full max-w-[1600px] mx-auto">
        
        {/* Top Header */}
        <header className="flex justify-between items-center mb-6 pointer-events-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600/20 flex items-center justify-center border border-blue-500/50 neon-border-blue">
              <Activity className="text-blue-400 w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-blue-200">
                ORBIT<span className="text-white">WATCH</span>
              </h1>
              <p className="text-xs text-blue-300/70 tracking-widest font-mono">SATELLITE COLLISION ALERT SYSTEM</p>
            </div>
          </div>
          
          <div className="glass-panel px-4 py-2 rounded-full flex items-center gap-3 text-xs font-mono border border-gray-700">
            <span className="text-gray-400">TELEMETRY LINK:</span>
            {isConnected ? (
              <span className="flex items-center gap-2 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse glow-dot-green"></span>
                ACTIVE
              </span>
            ) : (
              <span className="flex items-center gap-2 text-red-500">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse glow-dot-red"></span>
                OFFLINE
              </span>
            )}
            <span className="text-gray-600 ml-2">|</span>
            <span className="text-gray-400 ml-2 text-xs">{(new Date()).toISOString().split('T')[1].substring(0,8)} UTC</span>
          </div>
        </header>

        {/* Dashboard Stats Row */}
        <div className="pointer-events-auto mb-4 w-full">
          <DashboardStats satellites={satellites} alerts={alerts} />
        </div>

        {/* Main Columns */}
        <div className="flex-1 flex gap-4 min-h-0">
          
          {/* Left Panel: Satellite List */}
          <div className="w-1/4 min-w-[300px] pointer-events-auto flex flex-col">
            <SatelliteList satellites={satellites} />
          </div>

          {/* Center Space for 3D Interaction */}
          <div className="flex-1 pointer-events-none"></div>

          {/* Right Panel: Alerts & Insights */}
          <div className="w-1/4 min-w-[350px] pointer-events-auto flex flex-col gap-4">
            <div className="flex-1">
              <AlertPanel alerts={alerts} />
            </div>
            
            {/* Predictive Intelligence Stub */}
            <div className="h-48 glass-panel rounded-xl border border-purple-500/30 p-4 neon-border-purple flex flex-col">
              <h3 className="text-purple-400 font-bold text-sm mb-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-500 glow-dot-purple"></span>
                Predictive Engine
              </h3>
              <div className="flex-1 flex flex-col justify-center text-xs text-gray-400 font-mono space-y-2">
                <p>SIMULATION STATUS: <span className="text-emerald-400 border-b border-emerald-500/30 pb-0.5">NOMINAL</span></p>
                <p>ORBITAL PROPAGATION: +60 MIN</p>
                <p className="mt-2 text-purple-300/70 border border-purple-500/20 p-2 rounded bg-purple-900/10">
                  Processing complex orbital mechanics... 8 trajectories currently intersecting within Low Earth Orbit (LEO).
                </p>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  )
}

export default App
