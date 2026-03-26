import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

export interface PositionInfo {
  name: string;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  lat: number;
  lng: number;
  alt: number;
  status: 'Safe' | 'Low Risk' | 'Medium Risk' | 'High Risk';
}

export interface AlertInfo {
  satellite1: string;
  satellite2: string;
  distanceKm: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  timestamp: string;
  message: string;
  timeToImpactSec: number;
}

const socket = io('http://localhost:4000');

export function useOrbitData() {
  const [satellites, setSatellites] = useState<PositionInfo[]>([]);
  const [alerts, setAlerts] = useState<AlertInfo[]>([]);
  const [isConnected, setIsConnected] = useState(socket.connected);

  useEffect(() => {
    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));

    socket.on('telemetry', (data: PositionInfo[]) => {
      setSatellites(data);
    });

    socket.on('alerts', (data: AlertInfo[]) => {
      // Keep only recent unique alerts, or just keep a rolling window
      setAlerts(prev => {
        const newAlerts = [...data, ...prev];
        // simple deduplication by satellite pair + risk
        const unique = Array.from(new Map(newAlerts.map(a => [a.satellite1 + a.satellite2, a])).values());
        return unique.slice(0, 10); // keep last 10
      });
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('telemetry');
      socket.off('alerts');
    };
  }, []);

  return { satellites, alerts, isConnected };
}
