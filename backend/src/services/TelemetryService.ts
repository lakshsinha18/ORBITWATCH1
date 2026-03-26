import * as satellite from 'satellite.js';
import { ARTIFICIAL_CONFLICT_SATELLITES, SATELLITE_DATA } from './tle';
import { Alert } from '../models/Alert';

// We map TLEs to satrec objects once to optimize computing
const satrecs = [...SATELLITE_DATA, ...ARTIFICIAL_CONFLICT_SATELLITES].map(sat => ({
  name: sat.name,
  satrec: satellite.twoline2satrec(sat.tle1, sat.tle2)
}));

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

export class TelemetryService {
  public static getPositions(time: Date): PositionInfo[] {
    const results: PositionInfo[] = [];

    for (const s of satrecs) {
      const positionAndVelocity = satellite.propagate(s.satrec, time);
      if (positionAndVelocity.position && typeof positionAndVelocity.position !== 'boolean' && positionAndVelocity.velocity && typeof positionAndVelocity.velocity !== 'boolean') {
        const positionEci = positionAndVelocity.position as satellite.EciVec3<number>;
        const velocityEci = positionAndVelocity.velocity as satellite.EciVec3<number>;
        
        // Calculate geodetic (lat/lon/alt)
        const gmst = satellite.gstime(time);
        const positionGd = satellite.eciToGeodetic(positionEci, gmst);
        
        results.push({
          name: s.name,
          x: positionEci.x,
          y: positionEci.y,
          z: positionEci.z,
          vx: velocityEci.x,
          vy: velocityEci.y,
          vz: velocityEci.z,
          lat: satellite.degreesLat(positionGd.latitude),
          lng: satellite.degreesLong(positionGd.longitude),
          alt: positionGd.height,
          status: 'Safe' // Default
        });
      }
    }
    return results;
  }

  public static async evaluateCollisions(positions: PositionInfo[]) {
    const alertsToEmit: any[] = [];
    const distanceThresholdKmHigh = 200; // E.g., less than 200km is High Risk
    const distanceThresholdKmMedium = 500; 
    const distanceThresholdKmLow = 1000;

    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        const sat1 = positions[i];
        const sat2 = positions[j];
        
        // Calculate distance
        const dx = sat1.x - sat2.x;
        const dy = sat1.y - sat2.y;
        const dz = sat1.z - sat2.z;
        const distKm = Math.sqrt(dx*dx + dy*dy + dz*dz);
        
        let riskLevel: 'Safe' | 'Low' | 'Medium' | 'High' = 'Safe';
        
        if (distKm < distanceThresholdKmHigh) riskLevel = 'High';
        else if (distKm < distanceThresholdKmMedium) riskLevel = 'Medium';
        else if (distKm < distanceThresholdKmLow) riskLevel = 'Low';

        if (riskLevel !== 'Safe') {
          sat1.status = riskLevel === 'High' ? 'High Risk' : (riskLevel === 'Medium' ? 'Medium Risk' : 'Low Risk');
          sat2.status = riskLevel === 'High' ? 'High Risk' : (riskLevel === 'Medium' ? 'Medium Risk' : 'Low Risk');
          
          const message = `Risk detected between ${sat1.name} and ${sat2.name} at ${distKm.toFixed(2)} km.`;
          
          alertsToEmit.push({
            satellite1: sat1.name,
            satellite2: sat2.name,
            distanceKm: distKm,
            riskLevel: riskLevel,
            timestamp: new Date().toISOString(),
            message: message,
            timeToImpactSec: Math.floor(distKm / 10) // Mock impact time
          });
        }
      }
    }

    // Optionally save High risks to DB (throttle to avoid spam)
    const highRisks = alertsToEmit.filter(a => a.riskLevel === 'High');
    if (highRisks.length > 0) {
      try {
        await Alert.insertMany(highRisks.map(r => ({...r})));
      } catch (e) {
        console.error("Failed to save alerts to DB", e);
      }
    }

    return alertsToEmit;
  }
}
